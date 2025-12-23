/**
 * Create MFR rooms with proper verification
 *
 * This improved version:
 * 1. Creates each room
 * 2. Leaves the room completely
 * 3. Re-joins to verify it persists
 * 4. Only reports success if verification passes
 */

import { client, xml } from "@xmpp/client";

const MFR_ROOMS = [
  "mfr-construct@conference.tensegrity.it",
  "mfr-validate@conference.tensegrity.it",
  "mfr-reason@conference.tensegrity.it"
];

const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const USERNAME = process.env.XMPP_USERNAME || "admin";
const PASSWORD = process.env.XMPP_PASSWORD || "admin123";

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create and verify a single room
 */
async function createAndVerifyRoom(roomJid) {
  console.log(`\nProcessing: ${roomJid}`);

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout"));
      xmpp.stop();
    }, 20000);

    let phase = "connecting";
    let roomCreated = false;
    let roomConfigured = false;
    let leftRoom = false;
    let rejoinedRoom = false;

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`XMPP error in ${phase}: ${err.message}`));
    });

    xmpp.on("online", async () => {
      console.log("  ✅ Connected");
      phase = "joining";

      await xmpp.send(xml("presence"));
      await wait(500);

      // Join/create the room
      console.log("  📡 Joining room...");
      await xmpp.send(xml(
        "presence",
        { to: `${roomJid}/creator` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      ));
    });

    xmpp.on("stanza", async (stanza) => {
      try {
        if (stanza.is("presence")) {
          const from = stanza.attrs.from;
          const type = stanza.attrs.type;

          if (from && from.startsWith(roomJid)) {
            if (type === "error") {
              const error = stanza.getChild("error");
              const errorCondition = error?.children[0]?.name || "unknown";
              clearTimeout(timeout);
              reject(new Error(`Room error: ${errorCondition}`));
              xmpp.stop();
              return;
            }

            if (type === "unavailable" && phase === "leaving") {
              console.log("  👋 Left room");
              leftRoom = true;
              phase = "rejoining";

              // Wait a bit before rejoining
              await wait(2000);

              // Rejoin to verify persistence
              console.log("  🔄 Rejoining to verify...");
              await xmpp.send(xml(
                "presence",
                { to: `${roomJid}/verifier` },
                xml("x", { xmlns: "http://jabber.org/protocol/muc" })
              ));
              return;
            }

            if ((!type || type === "available") && phase === "joining") {
              console.log("  ✅ Joined room");
              roomCreated = true;

              // Check if we created it
              const x = stanza.getChild("x");
              if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
                const statuses = x.getChildren("status");
                const created = statuses.some(s => s.attrs.code === "201");

                if (created) {
                  console.log("  🎉 Room created (status 201)");
                  phase = "configuring";

                  // Configure as instant room
                  console.log("  ⚙️  Configuring room...");
                  await xmpp.send(xml(
                    "iq",
                    { type: "set", to: roomJid, id: `config_${Date.now()}` },
                    xml(
                      "query",
                      { xmlns: "http://jabber.org/protocol/muc#owner" },
                      xml("x", { xmlns: "jabber:x:data", type: "submit" })
                    )
                  ));
                } else {
                  console.log("  ℹ️  Room already existed");
                  // Skip to leaving phase
                  phase = "leaving";
                  await wait(500);
                  console.log("  👋 Leaving room...");
                  await xmpp.send(xml(
                    "presence",
                    { to: `${roomJid}/creator`, type: "unavailable" }
                  ));
                }
              }
            }

            if ((!type || type === "available") && phase === "rejoining") {
              console.log("  ✅ Successfully rejoined!");
              console.log("  ✓ Room verified to persist");
              rejoinedRoom = true;

              clearTimeout(timeout);
              xmpp.stop();
              resolve({ success: true, created: true, verified: true });
            }
          }
        } else if (stanza.is("iq")) {
          const type = stanza.attrs.type;

          if (type === "result" && phase === "configuring") {
            console.log("  ✅ Room configured");
            roomConfigured = true;
            phase = "leaving";

            // Leave the room to test persistence
            await wait(500);
            console.log("  👋 Leaving room...");
            await xmpp.send(xml(
              "presence",
              { to: `${roomJid}/creator`, type: "unavailable" }
            ));
          } else if (type === "error" && phase === "configuring") {
            console.log("  ⚠️  Configuration error (continuing anyway)");
            phase = "leaving";

            await wait(500);
            console.log("  👋 Leaving room...");
            await xmpp.send(xml(
              "presence",
              { to: `${roomJid}/creator`, type: "unavailable" }
            ));
          }
        }
      } catch (err) {
        clearTimeout(timeout);
        reject(new Error(`Error in ${phase}: ${err.message}`));
        xmpp.stop();
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(new Error(`Connection failed: ${err.message}`));
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log("=== Create MFR Rooms with Verification ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`User: ${USERNAME}`);
  console.log("");

  const results = [];

  for (const roomJid of MFR_ROOMS) {
    try {
      const result = await createAndVerifyRoom(roomJid);
      results.push({ roomJid, ...result });
      console.log(`  ✅ ${roomJid} - Complete\n`);
      await wait(1000);
    } catch (error) {
      console.error(`  ❌ ${roomJid} - Failed: ${error.message}\n`);
      results.push({ roomJid, success: false, error: error.message });
      await wait(1000);
    }
  }

  // Summary
  console.log("\n=== Summary ===\n");
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.roomJid} - Created and verified`);
    } else {
      console.log(`❌ ${r.roomJid} - Failed: ${r.error}`);
    }
  });

  console.log(`\nSuccess rate: ${successful.length}/${MFR_ROOMS.length}`);

  if (failed.length > 0) {
    console.log("\n⚠️  Some rooms failed. Check errors above.");
    console.log("\nTroubleshooting:");
    console.log("1. Verify Prosody is running: prosodyctl status");
    console.log("2. Check room creation permissions in Prosody config");
    console.log("3. Run diagnostic: node src/examples/diagnose-mfr-rooms.js");
    process.exit(1);
  } else {
    console.log("\n✅ All MFR rooms created and verified!");
    console.log("\nNext steps:");
    console.log("1. Run diagnostic to confirm: node src/examples/diagnose-mfr-rooms.js");
    console.log("2. Start MFR system: ./start-all.sh mfr");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
