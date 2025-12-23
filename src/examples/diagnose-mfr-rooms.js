/**
 * Diagnostic tool for MFR room issues
 *
 * This script:
 * 1. Lists all rooms on the conference service
 * 2. Attempts to join each MFR room
 * 3. Shows detailed error information
 * 4. Provides recommendations
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
const CONFERENCE_SERVICE = "conference.tensegrity.it";

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * List all rooms on the conference service
 */
async function listAllRooms() {
  console.log("\n=== Listing All Rooms on Conference Service ===\n");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout listing rooms"));
      xmpp.stop();
    }, 10000);

    let roomList = [];

    xmpp.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`XMPP error: ${err.message}`));
    });

    xmpp.on("online", async () => {
      console.log("✅ Connected");
      await xmpp.send(xml("presence"));
      await wait(500);

      // Query for room list
      const discoItems = xml(
        "iq",
        { type: "get", to: CONFERENCE_SERVICE, id: "disco_items" },
        xml("query", { xmlns: "http://jabber.org/protocol/disco#items" })
      );

      await xmpp.send(discoItems);
    });

    xmpp.on("stanza", async (stanza) => {
      if (stanza.is("iq") && stanza.attrs.id === "disco_items") {
        const type = stanza.attrs.type;

        if (type === "result") {
          const query = stanza.getChild("query");
          if (query) {
            const items = query.getChildren("item");
            roomList = items.map(item => ({
              jid: item.attrs.jid,
              name: item.attrs.name || "Unnamed"
            }));

            console.log(`Found ${roomList.length} rooms:\n`);
            roomList.forEach((room, idx) => {
              console.log(`${idx + 1}. ${room.jid}`);
              console.log(`   Name: ${room.name}`);
            });

            if (roomList.length === 0) {
              console.log("⚠️  No rooms found on server!");
            }

            console.log("");
          }

          clearTimeout(timeout);
          xmpp.stop();
          resolve(roomList);
        } else if (type === "error") {
          const error = stanza.getChild("error");
          console.error("❌ Error listing rooms:", error);
          clearTimeout(timeout);
          xmpp.stop();
          reject(new Error("Failed to list rooms"));
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Try to join a room and report detailed results
 */
async function diagnoseRoom(roomJid) {
  console.log(`\n=== Diagnosing: ${roomJid} ===\n`);

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log("⏱️  Timeout - no response from room");
      xmpp.stop();
      resolve({
        exists: false,
        error: "timeout",
        details: "No response received when attempting to join"
      });
    }, 8000);

    const result = {
      exists: false,
      joinable: false,
      error: null,
      details: null,
      stanzasReceived: []
    };

    xmpp.on("error", (err) => {
      console.log(`❌ Connection error: ${err.message}`);
      clearTimeout(timeout);
      result.error = "connection_error";
      result.details = err.message;
      resolve(result);
    });

    xmpp.on("online", async () => {
      console.log("✅ Connected");
      await xmpp.send(xml("presence"));
      await wait(500);

      // Try to join the room
      console.log("📡 Attempting to join room...");
      const mucPresence = xml(
        "presence",
        { to: `${roomJid}/diagnostic` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      );

      await xmpp.send(mucPresence);
    });

    xmpp.on("stanza", async (stanza) => {
      const stanzaType = stanza.name;
      result.stanzasReceived.push(stanzaType);

      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        console.log(`📥 Presence from: ${from}, type: ${type || "available"}`);

        if (from && from.startsWith(roomJid)) {
          if (type === "error") {
            const error = stanza.getChild("error");
            const errorType = error?.attrs?.type || "unknown";
            const errorChildren = error?.children || [];
            const errorCondition = errorChildren[0]?.name || "unknown";
            const errorText = error?.getChildText("text") || "";

            console.log(`❌ Error joining room:`);
            console.log(`   Type: ${errorType}`);
            console.log(`   Condition: ${errorCondition}`);
            if (errorText) {
              console.log(`   Text: ${errorText}`);
            }

            result.error = errorCondition;
            result.details = `${errorType}: ${errorCondition}${errorText ? " - " + errorText : ""}`;

            if (errorCondition === "item-not-found") {
              console.log("\n💡 Room does NOT exist (item-not-found)");
              result.exists = false;
            } else if (errorCondition === "forbidden" || errorCondition === "not-authorized") {
              console.log("\n💡 Room might exist but you don't have permission");
              result.exists = true;
              result.joinable = false;
            } else if (errorCondition === "registration-required") {
              console.log("\n💡 Room exists but is members-only");
              result.exists = true;
              result.joinable = false;
            } else {
              console.log("\n💡 Room might exist but there's an access issue");
              result.exists = true;
              result.joinable = false;
            }

            clearTimeout(timeout);
            xmpp.stop();
            resolve(result);
          } else if (!type || type === "available") {
            console.log("✅ Successfully joined room!");
            result.exists = true;
            result.joinable = true;

            // Check for creation status
            const x = stanza.getChild("x");
            if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
              const statuses = x.getChildren("status");
              statuses.forEach(s => {
                console.log(`   Status code: ${s.attrs.code}`);
                if (s.attrs.code === "201") {
                  console.log("   🎉 Room was just created (didn't exist before)");
                  result.wasCreated = true;
                } else if (s.attrs.code === "110") {
                  console.log("   👤 This is our own presence");
                }
              });

              const item = x.getChild("item");
              if (item) {
                console.log(`   Affiliation: ${item.attrs.affiliation || "none"}`);
                console.log(`   Role: ${item.attrs.role || "none"}`);
              }
            }

            clearTimeout(timeout);
            xmpp.stop();
            resolve(result);
          }
        }
      } else if (stanza.is("message")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;
        if (type === "error") {
          console.log(`📨 Message error from ${from}`);
          const error = stanza.getChild("error");
          if (error) {
            const errorCondition = error?.children[0]?.name || "unknown";
            console.log(`   Condition: ${errorCondition}`);
          }
        }
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      console.log(`❌ Failed to start connection: ${err.message}`);
      result.error = "connection_failed";
      result.details = err.message;
      resolve(result);
    });
  });
}

/**
 * Main diagnostic routine
 */
async function main() {
  console.log("=== MFR Room Diagnostic Tool ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`Domain: ${DOMAIN}`);
  console.log(`User: ${USERNAME}`);
  console.log("");

  try {
    // List all rooms on the server
    const allRooms = await listAllRooms();

    // Check if MFR rooms are in the list
    console.log("=== Checking MFR Rooms in Server List ===\n");
    MFR_ROOMS.forEach(room => {
      const found = allRooms.find(r => r.jid === room);
      if (found) {
        console.log(`✅ ${room} - Found in server list`);
        console.log(`   Name: ${found.name}`);
      } else {
        console.log(`❌ ${room} - NOT in server list`);
      }
    });

    await wait(1000);

    // Diagnose each MFR room
    const results = [];
    for (const roomJid of MFR_ROOMS) {
      const result = await diagnoseRoom(roomJid);
      results.push({ roomJid, ...result });
      await wait(1000);
    }

    // Summary
    console.log("\n\n=== Summary ===\n");
    results.forEach(r => {
      console.log(`${r.roomJid}:`);
      console.log(`  Exists: ${r.exists ? "✅ Yes" : "❌ No"}`);
      console.log(`  Joinable: ${r.joinable ? "✅ Yes" : "❌ No"}`);
      if (r.error) {
        console.log(`  Error: ${r.error}`);
        console.log(`  Details: ${r.details}`);
      }
      if (r.wasCreated) {
        console.log(`  ⚠️  Was created during this diagnostic (didn't exist before)`);
      }
      console.log("");
    });

    // Recommendations
    console.log("=== Recommendations ===\n");

    const nonExistent = results.filter(r => !r.exists);
    const existButNotJoinable = results.filter(r => r.exists && !r.joinable);
    const working = results.filter(r => r.exists && r.joinable);

    if (nonExistent.length > 0) {
      console.log("❌ Rooms that don't exist:");
      nonExistent.forEach(r => console.log(`   - ${r.roomJid}`));
      console.log("\n   Action: Create these rooms using:");
      console.log("   node src/examples/create-mfr-rooms.js");
      console.log("");
    }

    if (existButNotJoinable.length > 0) {
      console.log("⚠️  Rooms that exist but aren't joinable:");
      existButNotJoinable.forEach(r => {
        console.log(`   - ${r.roomJid}: ${r.error}`);
      });
      console.log("\n   Action: Check Prosody configuration for room permissions");
      console.log("");
    }

    if (working.length === MFR_ROOMS.length) {
      console.log("✅ All MFR rooms exist and are joinable!");
      console.log("\n   Next: Start the MFR system with:");
      console.log("   ./start-all.sh mfr");
    } else {
      console.log(`Status: ${working.length}/${MFR_ROOMS.length} rooms are functional`);
    }

  } catch (error) {
    console.error("\n❌ Diagnostic failed:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
