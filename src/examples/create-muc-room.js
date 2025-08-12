import { client, xml } from "@xmpp/client";

const ROOM = "general@conference.xmpp";
const NICKNAME = "admin";

async function createMUCRoomCorrectly() {
  console.log("=== Creating MUC Room with Correct Protocol ===");
  console.log(`Room: ${ROOM}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  const xmpp = client({
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "admin",
    password: "admin123",
    tls: { rejectUnauthorized: false },
  });

  let roomCreated = false;

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);
    
    // Send initial presence
    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");
    
    // Join MUC room with proper MUC namespace
    console.log(`🏠 Joining room with MUC protocol: ${ROOM}/${NICKNAME}`);
    
    const mucPresence = xml(
      "presence",
      { to: `${ROOM}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );
    
    await xmpp.send(mucPresence);
    console.log("📤 Sent MUC join presence with proper <x> element");
  });

  xmpp.on("stanza", async (stanza) => {
    if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;
      
      console.log(`📥 Presence from: ${from}, type: ${type || 'available'}`);
      
      if (from && from.startsWith(ROOM)) {
        if (from === `${ROOM}/${NICKNAME}`) {
          if (type === "error") {
            const error = stanza.getChild("error");
            console.error("❌ Failed to join room:", error);
            process.exit(1);
          } else if (!type || type === "available") {
            console.log("✅ Successfully joined room!");
            roomCreated = true;
            
            // Check for room creation status
            const x = stanza.getChild("x");
            if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
              const status = x.getChild("status");
              if (status) {
                console.log(`🔧 Room status code: ${status.attrs.code}`);
                if (status.attrs.code === "201") {
                  console.log("🎉 Room was created! Configuring as instant room...");
                  
                  // Send instant room configuration
                  await xmpp.send(xml(
                    "iq",
                    { type: "set", to: ROOM, id: "create_instant" },
                    xml(
                      "query",
                      { xmlns: "http://jabber.org/protocol/muc#owner" },
                      xml("x", { xmlns: "jabber:x:data", type: "submit" })
                    )
                  ));
                } else if (status.attrs.code === "110") {
                  console.log("👤 This is our own presence");
                }
              }
            }
            
            // Send a welcome message
            setTimeout(async () => {
              console.log("📝 Sending welcome message...");
              await xmpp.send(xml(
                "message",
                { type: "groupchat", to: ROOM },
                xml("body", {}, "🎉 General chat room is now available! Welcome!")
              ));
              
              setTimeout(() => {
                console.log("\n✅ MUC room creation completed successfully!");
                console.log("The bot should now be able to join and communicate in this room.");
                xmpp.stop();
                process.exit(0);
              }, 2000);
            }, 1000);
          }
        }
      }
    } else if (stanza.is("iq")) {
      const type = stanza.attrs.type;
      const id = stanza.attrs.id;
      
      if (id === "create_instant") {
        if (type === "result") {
          console.log("✅ Room configured as instant room!");
        } else if (type === "error") {
          console.log("⚠️  Room configuration error, but room should still work");
        }
      }
    } else if (stanza.is("message")) {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      const type = stanza.attrs.type;
      
      if (body && type === "groupchat" && from && from.startsWith(ROOM)) {
        const sender = from.split('/')[1] || 'unknown';
        console.log(`💬 [${sender}]: ${body}`);
      }
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);
  
  // Timeout
  setTimeout(() => {
    if (!roomCreated) {
      console.log("❌ Failed to create room within timeout");
      process.exit(1);
    }
  }, 15000);
}

createMUCRoomCorrectly().catch(console.error);