/**
 * Diagnostic tool to check coordinator room connectivity
 *
 * Usage:
 *   node src/examples/diagnose-coordinator-room.js
 */

import { client, xml } from "@xmpp/client";

const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const USERNAME = process.env.XMPP_USERNAME || "admin";
const PASSWORD = process.env.XMPP_PASSWORD || "admin123";
const COORDINATOR_ROOM = process.env.COORDINATOR_ROOM || "general@conference.tensegrity.it";
const CONFERENCE_SERVICE = "conference.tensegrity.it";

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function diagnoseCoordinatorRoom() {
  console.log("=== Coordinator Room Diagnostic ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`Username: ${USERNAME}`);
  console.log(`Target Room: ${COORDINATOR_ROOM}`);
  console.log("");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log("\n⏱️  Timeout reached");
      xmpp.stop();
      resolve({ timedOut: true });
    }, 15000);

    let connected = false;
    let roomsListed = false;
    let joinAttempted = false;

    xmpp.on("error", (err) => {
      console.error("❌ XMPP Error:", err.message);
      clearTimeout(timeout);
      xmpp.stop();
      reject(err);
    });

    xmpp.on("online", async (address) => {
      console.log(`✅ Connected as: ${address.toString()}\n`);
      connected = true;

      await xmpp.send(xml("presence"));
      await wait(500);

      // Step 1: List all rooms on conference service
      console.log("Step 1: Listing all rooms on conference service...");
      const discoItems = xml(
        "iq",
        { type: "get", to: CONFERENCE_SERVICE, id: "disco_items" },
        xml("query", { xmlns: "http://jabber.org/protocol/disco#items" })
      );
      await xmpp.send(discoItems);
    });

    xmpp.on("stanza", async (stanza) => {
      try {
        // Handle room list response
        if (stanza.is("iq") && stanza.attrs.id === "disco_items") {
          const type = stanza.attrs.type;

          if (type === "result") {
            const query = stanza.getChild("query");
            if (query) {
              const items = query.getChildren("item");
              const rooms = items.map(item => ({
                jid: item.attrs.jid,
                name: item.attrs.name || "Unnamed"
              }));

              console.log(`\nFound ${rooms.length} rooms:`);
              rooms.forEach((room, idx) => {
                const isTarget = room.jid === COORDINATOR_ROOM;
                const marker = isTarget ? "👉" : "  ";
                console.log(`${marker} ${idx + 1}. ${room.jid}`);
                console.log(`     Name: ${room.name}`);
              });

              const targetRoom = rooms.find(r => r.jid === COORDINATOR_ROOM);
              if (targetRoom) {
                console.log(`\n✅ Target room "${COORDINATOR_ROOM}" found in server list`);
              } else {
                console.log(`\n❌ Target room "${COORDINATOR_ROOM}" NOT found in server list`);
                console.log(`   The room may need to be created first.`);
              }

              roomsListed = true;

              // Step 2: Try to join the coordinator room
              await wait(1000);
              console.log(`\nStep 2: Attempting to join ${COORDINATOR_ROOM}...`);
              joinAttempted = true;

              await xmpp.send(xml(
                "presence",
                { to: `${COORDINATOR_ROOM}/Diagnostic` },
                xml("x", { xmlns: "http://jabber.org/protocol/muc" })
              ));
            }
          } else if (type === "error") {
            console.error("❌ Error listing rooms");
            clearTimeout(timeout);
            xmpp.stop();
            resolve({ error: "disco_error" });
          }
        }

        // Handle room join response
        if (stanza.is("presence") && joinAttempted) {
          const from = stanza.attrs.from;
          const type = stanza.attrs.type;

          if (from && from.startsWith(COORDINATOR_ROOM)) {
            console.log(`\n📥 Presence from: ${from}, type: ${type || "available"}`);

            if (type === "error") {
              const error = stanza.getChild("error");
              const errorType = error?.attrs?.type || "unknown";
              const errorChildren = error?.children || [];
              const errorCondition = errorChildren[0]?.name || "unknown";
              const errorText = error?.getChildText("text") || "";

              console.log(`\n❌ Error joining room:`);
              console.log(`   Type: ${errorType}`);
              console.log(`   Condition: ${errorCondition}`);
              if (errorText) {
                console.log(`   Text: ${errorText}`);
              }

              if (errorCondition === "item-not-found") {
                console.log(`\n💡 Room does NOT exist`);
                console.log(`   Create it with: prosodyctl mod_muc create_room ${COORDINATOR_ROOM}`);
                console.log(`   Or have a user join to auto-create it`);
              } else if (errorCondition === "forbidden" || errorCondition === "not-authorized") {
                console.log(`\n💡 Room exists but you don't have permission to join`);
              } else if (errorCondition === "registration-required") {
                console.log(`\n💡 Room exists but is members-only`);
              }

              clearTimeout(timeout);
              xmpp.stop();
              resolve({ joined: false, error: errorCondition });
            } else if (!type || type === "available") {
              console.log(`\n✅ Successfully joined room!`);

              // Check for room occupants
              const x = stanza.getChild("x");
              if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
                const item = x.getChild("item");
                if (item) {
                  console.log(`   Your affiliation: ${item.attrs.affiliation || "none"}`);
                  console.log(`   Your role: ${item.attrs.role || "none"}`);
                }
              }

              // Step 3: Get room information
              await wait(500);
              console.log(`\nStep 3: Querying room information...`);
              await xmpp.send(xml(
                "iq",
                { type: "get", to: COORDINATOR_ROOM, id: "room_info" },
                xml("query", { xmlns: "http://jabber.org/protocol/disco#info" })
              ));
            }
          }
        }

        // Handle room info response
        if (stanza.is("iq") && stanza.attrs.id === "room_info") {
          const type = stanza.attrs.type;

          if (type === "result") {
            const query = stanza.getChild("query");
            if (query) {
              const identities = query.getChildren("identity");
              const features = query.getChildren("feature");

              console.log(`\n✅ Room information retrieved:`);
              identities.forEach(id => {
                console.log(`   Identity: ${id.attrs.category}/${id.attrs.type}`);
                if (id.attrs.name) {
                  console.log(`   Name: ${id.attrs.name}`);
                }
              });
              console.log(`   Features: ${features.length}`);

              const isPersistent = features.some(f => f.attrs.var === "muc_persistent");
              const isPublic = features.some(f => f.attrs.var === "muc_public");
              const isModerated = features.some(f => f.attrs.var === "muc_moderated");

              console.log(`\n   Configuration:`);
              console.log(`   - Persistent: ${isPersistent ? "✅ Yes" : "❌ No"}`);
              console.log(`   - Public: ${isPublic ? "✅ Yes" : "❌ No"}`);
              console.log(`   - Moderated: ${isModerated ? "⚠️  Yes" : "✅ No"}`);

              // Step 4: Check for Coordinator agent
              await wait(500);
              console.log(`\nStep 4: Checking for Coordinator agent in room...`);

              // Send a test message
              await xmpp.send(xml(
                "message",
                { type: "groupchat", to: COORDINATOR_ROOM },
                xml("body", {}, "help")
              ));

              // Wait for response
              await wait(3000);
            }

            clearTimeout(timeout);
            xmpp.stop();
            resolve({ joined: true, checked: true });
          } else if (type === "error") {
            console.log(`\n⚠️  Could not retrieve room information`);
            clearTimeout(timeout);
            xmpp.stop();
            resolve({ joined: true, checked: false });
          }
        }

        // Listen for coordinator response
        if (stanza.is("message")) {
          const from = stanza.attrs.from;
          const body = stanza.getChildText("body");
          const type = stanza.attrs.type;

          if (body && type === "groupchat" && from && from.startsWith(COORDINATOR_ROOM)) {
            const sender = from.split('/')[1] || 'unknown';

            if (sender !== "Diagnostic") {
              console.log(`\n💬 Message from ${sender}:`);
              console.log(`   ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);

              if (sender === "Coordinator") {
                console.log(`\n✅ Coordinator agent is active and responding!`);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error processing stanza:", err);
      }
    });

    console.log("🔌 Connecting...\n");
    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Run diagnostic
diagnoseCoordinatorRoom()
  .then((result) => {
    console.log("\n\n=== Diagnostic Summary ===");

    if (result.timedOut) {
      console.log("❌ Diagnostic timed out");
      console.log("   This may indicate connection issues or slow server response");
    } else if (result.error) {
      console.log(`❌ Diagnostic failed: ${result.error}`);
    } else if (result.joined) {
      console.log("✅ Room is accessible");
      if (result.checked) {
        console.log("✅ Room information retrieved");
      }
      console.log("\nIf you didn't see a Coordinator response:");
      console.log("  1. Check if coordinator agent is running: pgrep -fa coordinator-agent");
      console.log("  2. Check coordinator logs for errors");
      console.log("  3. Restart coordinator: ./start-all.sh mfr");
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Diagnostic error:", err.message);
    process.exit(1);
  });
