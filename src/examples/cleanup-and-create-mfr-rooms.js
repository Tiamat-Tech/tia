/**
 * Cleanup ghost rooms and create MFR rooms properly
 *
 * This script:
 * 1. Attempts to destroy any existing ghost rooms
 * 2. Creates fresh rooms
 * 3. Verifies they work
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
 * Destroy a room (if it exists)
 */
async function destroyRoom(roomJid) {
  console.log(`\n🗑️  Attempting to destroy: ${roomJid}`);

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log("  ⏱️  Timeout (room probably doesn't exist to destroy)");
      xmpp.stop();
      resolve({ destroyed: false, reason: "timeout" });
    }, 8000);

    xmpp.on("error", (err) => {
      console.log(`  ⚠️  Connection error: ${err.message}`);
      clearTimeout(timeout);
      xmpp.stop();
      resolve({ destroyed: false, reason: "connection_error" });
    });

    xmpp.on("online", async () => {
      await xmpp.send(xml("presence"));
      await wait(500);

      // First, try to join as owner
      console.log("  📡 Joining room as owner...");
      await xmpp.send(xml(
        "presence",
        { to: `${roomJid}/admin` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      ));
    });

    let joined = false;

    xmpp.on("stanza", async (stanza) => {
      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        if (from && from.startsWith(roomJid)) {
          if (type === "error") {
            console.log("  ℹ️  Room doesn't exist or can't join (this is ok)");
            clearTimeout(timeout);
            xmpp.stop();
            resolve({ destroyed: false, reason: "room_not_found" });
          } else if (!type || type === "available") {
            console.log("  ✅ Joined room");
            joined = true;

            // Send destroy request
            console.log("  💥 Sending destroy command...");
            const destroyIQ = xml(
              "iq",
              { type: "set", to: roomJid, id: `destroy_${Date.now()}` },
              xml(
                "query",
                { xmlns: "http://jabber.org/protocol/muc#owner" },
                xml("destroy", { jid: roomJid },
                  xml("reason", {}, "Recreating room")
                )
              )
            );

            await xmpp.send(destroyIQ);
          }
        }
      } else if (stanza.is("iq") && joined) {
        const type = stanza.attrs.type;

        if (type === "result") {
          console.log("  ✅ Room destroyed successfully");
          clearTimeout(timeout);
          xmpp.stop();
          resolve({ destroyed: true });
        } else if (type === "error") {
          console.log("  ⚠️  Destroy command failed (might not have permission)");
          clearTimeout(timeout);
          xmpp.stop();
          resolve({ destroyed: false, reason: "destroy_failed" });
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      console.log(`  ⚠️  Failed to connect: ${err.message}`);
      resolve({ destroyed: false, reason: "connection_failed" });
    });
  });
}

/**
 * Create a room properly
 */
async function createRoom(roomJid) {
  console.log(`\n✨ Creating: ${roomJid}`);

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log("  ⏱️  Timeout - no response from server");
      reject(new Error("Timeout creating room"));
      xmpp.stop();
    }, 20000);

    let roomCreated = false;

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`XMPP error: ${err.message}`));
    });

    xmpp.on("online", async () => {
      console.log("  ✅ Connected");
      await xmpp.send(xml("presence"));
      await wait(500);

      console.log("  📡 Creating/joining room...");
      await xmpp.send(xml(
        "presence",
        { to: `${roomJid}/admin` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      ));
    });

    xmpp.on("stanza", async (stanza) => {
      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        if (from && from.startsWith(roomJid)) {
          if (type === "error") {
            const error = stanza.getChild("error");
            const errorCondition = error?.children[0]?.name || "unknown";
            clearTimeout(timeout);
            reject(new Error(`Room creation failed: ${errorCondition}`));
            xmpp.stop();
          } else if (!type || type === "available") {
            console.log("  ✅ Joined room");
            roomCreated = true;

            const x = stanza.getChild("x");
            if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
              const statuses = x.getChildren("status");
              const created = statuses.some(s => s.attrs.code === "201");

              if (created) {
                console.log("  🎉 Room created (status 201)");
              } else {
                console.log("  ℹ️  Room already existed");
              }
            } else {
              console.log("  ℹ️  Room joined (no status info)");
            }

            // Always configure as public, persistent room
            console.log("  ⚙️  Configuring room...");
            const configIQ = xml(
              "iq",
              { type: "set", to: roomJid, id: `config_${Date.now()}` },
              xml(
                "query",
                { xmlns: "http://jabber.org/protocol/muc#owner" },
                xml("x", { xmlns: "jabber:x:data", type: "submit" },
                  xml("field", { var: "FORM_TYPE", type: "hidden" },
                    xml("value", {}, "http://jabber.org/protocol/muc#roomconfig")
                  ),
                  xml("field", { var: "muc#roomconfig_persistentroom" },
                    xml("value", {}, "1")
                  ),
                  xml("field", { var: "muc#roomconfig_publicroom" },
                    xml("value", {}, "1")
                  ),
                  xml("field", { var: "muc#roomconfig_membersonly" },
                    xml("value", {}, "0")
                  )
                )
              )
            );

            await xmpp.send(configIQ);
          }
        }
      } else if (stanza.is("iq") && roomCreated) {
        const type = stanza.attrs.type;
        const id = stanza.attrs.id;

        if (type === "result") {
          console.log("  ✅ Room configured as persistent/public");

          // Send a welcome message
          await wait(500);
          console.log("  📝 Sending welcome message...");
          await xmpp.send(xml(
            "message",
            { type: "groupchat", to: roomJid },
            xml("body", {}, `MFR ${roomJid.split('@')[0]} room is ready!`)
          ));

          await wait(1000);
          clearTimeout(timeout);
          xmpp.stop();
          resolve({ success: true });
        } else if (type === "error") {
          const error = stanza.getChild("error");
          const errorCondition = error?.children[0]?.name || "unknown";
          console.log(`  ⚠️  Configuration error: ${errorCondition}`);
          // Still resolve as success since room exists
          await wait(500);
          clearTimeout(timeout);
          xmpp.stop();
          resolve({ success: true, configWarning: true });
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(new Error(`Connection failed: ${err.message}`));
    });
  });
}

/**
 * Verify room exists and is joinable
 */
async function verifyRoom(roomJid) {
  console.log(`\n🔍 Verifying: ${roomJid}`);

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log("  ❌ Verification timeout");
      xmpp.stop();
      resolve({ verified: false, reason: "timeout" });
    }, 8000);

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      xmpp.stop();
      resolve({ verified: false, reason: "connection_error" });
    });

    xmpp.on("online", async () => {
      await xmpp.send(xml("presence"));
      await wait(500);

      console.log("  📡 Attempting to join...");
      await xmpp.send(xml(
        "presence",
        { to: `${roomJid}/verifier` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      ));
    });

    xmpp.on("stanza", (stanza) => {
      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        if (from && from.startsWith(roomJid)) {
          if (type === "error") {
            const error = stanza.getChild("error");
            const errorCondition = error?.children[0]?.name || "unknown";
            console.log(`  ❌ Verification failed: ${errorCondition}`);
            clearTimeout(timeout);
            xmpp.stop();
            resolve({ verified: false, reason: errorCondition });
          } else if (!type || type === "available") {
            console.log("  ✅ Room is joinable!");
            clearTimeout(timeout);
            xmpp.stop();
            resolve({ verified: true });
          }
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      resolve({ verified: false, reason: "connection_failed" });
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log("=== Cleanup and Create MFR Rooms ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`User: ${USERNAME}`);
  console.log("");

  const results = [];

  for (const roomJid of MFR_ROOMS) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Processing: ${roomJid}`);
    console.log("=".repeat(60));

    try {
      // Step 1: Try to destroy any existing ghost room
      const destroyResult = await destroyRoom(roomJid);
      await wait(2000); // Wait for destruction to complete

      // Step 2: Create the room fresh
      const createResult = await createRoom(roomJid);
      await wait(2000);

      // Step 3: Verify it works
      const verifyResult = await verifyRoom(roomJid);
      await wait(1000);

      results.push({
        roomJid,
        destroyed: destroyResult.destroyed,
        created: createResult.success,
        verified: verifyResult.verified,
        success: createResult.success && verifyResult.verified
      });

      if (createResult.success && verifyResult.verified) {
        console.log(`\n✅ ${roomJid} - SUCCESS`);
      } else {
        console.log(`\n❌ ${roomJid} - FAILED`);
      }

    } catch (error) {
      console.error(`\n❌ ${roomJid} - ERROR: ${error.message}`);
      results.push({
        roomJid,
        success: false,
        error: error.message
      });
    }

    await wait(1000);
  }

  // Final summary
  console.log("\n\n" + "=".repeat(60));
  console.log("FINAL SUMMARY");
  console.log("=".repeat(60) + "\n");

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.roomJid}`);
      console.log(`   - Created: ${r.created ? "Yes" : "No"}`);
      console.log(`   - Verified: ${r.verified ? "Yes" : "No"}`);
    } else {
      console.log(`❌ ${r.roomJid}`);
      if (r.error) {
        console.log(`   - Error: ${r.error}`);
      }
    }
    console.log("");
  });

  console.log(`Success rate: ${successful.length}/${MFR_ROOMS.length}\n`);

  if (successful.length === MFR_ROOMS.length) {
    console.log("🎉 All MFR rooms are ready!");
    console.log("\nNext steps:");
    console.log("1. Start the MFR system: ./start-all.sh mfr");
    console.log("2. Run a test session: node src/examples/run-mfr-session.js \"your problem\"");
    process.exit(0);
  } else {
    console.log("⚠️  Some rooms failed to set up properly.");
    console.log("\nTroubleshooting:");
    console.log("1. Check Prosody logs: sudo journalctl -u prosody -f");
    console.log("2. Verify MUC configuration in prosody.cfg.lua");
    console.log("3. Try manually with: prosodyctl mod_muc delete_room <room-jid>");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
