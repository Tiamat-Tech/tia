import { client, xml } from "@xmpp/client";
import dotenv from "dotenv";

dotenv.config();

const ROOM = "log@conference.tensegrity.it";
const NICKNAME = "admin";
const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";

async function createLogRoom() {
  console.log("=== Creating Log Room ===");
  console.log(`Room: ${ROOM}`);
  console.log(`Service: ${SERVICE}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
    tls: { rejectUnauthorized: false },
  });

  let roomCreated = false;

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);

    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");

    console.log(`🏠 Joining room: ${ROOM}/${NICKNAME}`);

    const mucPresence = xml(
      "presence",
      { to: `${ROOM}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );

    await xmpp.send(mucPresence);
    console.log("📤 Sent MUC join presence");
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

            const x = stanza.getChild("x");
            if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
              const status = x.getChild("status");
              if (status && status.attrs.code === "201") {
                console.log("🎉 Room was created! Configuring as instant room...");

                await xmpp.send(xml(
                  "iq",
                  { type: "set", to: ROOM, id: "create_instant" },
                  xml(
                    "query",
                    { xmlns: "http://jabber.org/protocol/muc#owner" },
                    xml("x", { xmlns: "jabber:x:data", type: "submit" })
                  )
                ));
              }
            }

            setTimeout(async () => {
              console.log("📝 Sending welcome message...");
              await xmpp.send(xml(
                "message",
                { type: "groupchat", to: ROOM },
                xml("body", {}, "📋 Log room created. This room will receive verbose/technical messages from agents.")
              ));

              setTimeout(() => {
                console.log("\n✅ Log room creation completed successfully!");
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
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);

  setTimeout(() => {
    if (!roomCreated) {
      console.log("❌ Failed to create room within timeout");
      process.exit(1);
    }
  }, 15000);
}

createLogRoom().catch(console.error);
