import { client, xml } from "@xmpp/client";

const MFR_ROOMS = [
  "mfr-construct@conference.tensegrity.it",
  "mfr-validate@conference.tensegrity.it",
  "mfr-reason@conference.tensegrity.it"
];
const NICKNAME = "admin";
const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const USERNAME = process.env.XMPP_USERNAME || "admin";
const PASSWORD = process.env.XMPP_PASSWORD || "admin123";

/**
 * Create a single MUC room
 */
async function createRoom(xmpp, roomJid) {
  return new Promise((resolve, reject) => {
    let roomCreated = false;
    const timeout = setTimeout(() => {
      if (!roomCreated) {
        reject(new Error(`Timeout creating room: ${roomJid}`));
      }
    }, 10000);

    const stanzaHandler = async (stanza) => {
      if (stanza.is("presence")) {
        const from = stanza.attrs.from;
        const type = stanza.attrs.type;

        if (from && from.startsWith(roomJid)) {
          if (from === `${roomJid}/${NICKNAME}`) {
            if (type === "error") {
              clearTimeout(timeout);
              xmpp.removeListener("stanza", stanzaHandler);
              const error = stanza.getChild("error");
              reject(new Error(`Failed to join room ${roomJid}: ${error}`));
            } else if (!type || type === "available") {
              console.log(`✅ Joined room: ${roomJid}`);

              // Check for room creation status
              const x = stanza.getChild("x");
              if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
                const status = x.getChild("status");
                if (status && status.attrs.code === "201") {
                  console.log(`🎉 Room created: ${roomJid}, configuring...`);

                  // Send instant room configuration
                  await xmpp.send(xml(
                    "iq",
                    { type: "set", to: roomJid, id: `create_${roomJid}` },
                    xml(
                      "query",
                      { xmlns: "http://jabber.org/protocol/muc#owner" },
                      xml("x", { xmlns: "jabber:x:data", type: "submit" })
                    )
                  ));
                }
              }

              // Send welcome message
              setTimeout(async () => {
                const roomName = roomJid.split('@')[0];
                await xmpp.send(xml(
                  "message",
                  { type: "groupchat", to: roomJid },
                  xml("body", {}, `MFR ${roomName} room is now available!`)
                ));

                setTimeout(() => {
                  clearTimeout(timeout);
                  xmpp.removeListener("stanza", stanzaHandler);
                  roomCreated = true;
                  resolve();
                }, 1000);
              }, 500);
            }
          }
        }
      } else if (stanza.is("iq")) {
        const type = stanza.attrs.type;
        const id = stanza.attrs.id;

        if (id === `create_${roomJid}`) {
          if (type === "result") {
            console.log(`✅ Room configured: ${roomJid}`);
          } else if (type === "error") {
            console.log(`⚠️  Room configuration error for ${roomJid}, but room should still work`);
          }
        }
      }
    };

    xmpp.on("stanza", stanzaHandler);

    // Send MUC join presence
    console.log(`🏠 Joining room: ${roomJid}/${NICKNAME}`);
    const mucPresence = xml(
      "presence",
      { to: `${roomJid}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );

    xmpp.send(mucPresence);
  });
}

/**
 * Create all MFR MUC rooms
 */
async function createAllMfrRooms() {
  console.log("=== Creating MFR MUC Rooms ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`Rooms to create: ${MFR_ROOMS.length}`);
  console.log("");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: USERNAME,
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);

    // Send initial presence
    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");
    console.log("");

    try {
      // Create rooms sequentially
      for (const roomJid of MFR_ROOMS) {
        await createRoom(xmpp, roomJid);
        console.log("");
      }

      console.log("✅ All MFR rooms created successfully!");
      console.log("\nRooms created:");
      MFR_ROOMS.forEach(room => console.log(`  - ${room}`));
      console.log("\nThe coordinator and agents can now join these rooms.");

      xmpp.stop();
      process.exit(0);
    } catch (error) {
      console.error("❌ Error creating rooms:", error.message);
      xmpp.stop();
      process.exit(1);
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });
}

createAllMfrRooms().catch(console.error);
