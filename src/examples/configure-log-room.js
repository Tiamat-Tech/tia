import { client, xml } from "@xmpp/client";
import dotenv from "dotenv";

dotenv.config();

const ROOM = "log@conference.tensegrity.it";
const NICKNAME = "admin";
const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function configureLogRoom() {
  console.log("=== Configuring Log Room as Persistent ===");
  console.log(`Room: ${ROOM}`);
  console.log(`Service: ${SERVICE}`);
  console.log("");

  const xmpp = client({
    service: SERVICE,
    domain: DOMAIN,
    username: "admin",
    password: PASSWORD,
    tls: { rejectUnauthorized: false },
  });

  let roomJoined = false;

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

      if (from && from === `${ROOM}/${NICKNAME}`) {
        if (type === "error") {
          const error = stanza.getChild("error");
          console.error("❌ Failed to join room:", error);
          process.exit(1);
        } else if (!type || type === "available") {
          console.log("✅ Successfully joined room!");
          roomJoined = true;

          // Send full room configuration to make it persistent and public
          console.log("⚙️  Configuring room as persistent and public...");

          const configForm = xml(
            "iq",
            { type: "set", to: ROOM, id: "config1" },
            xml(
              "query",
              { xmlns: "http://jabber.org/protocol/muc#owner" },
              xml(
                "x",
                { xmlns: "jabber:x:data", type: "submit" },
                xml(
                  "field",
                  { var: "FORM_TYPE" },
                  xml("value", {}, "http://jabber.org/protocol/muc#roomconfig")
                ),
                xml(
                  "field",
                  { var: "muc#roomconfig_persistentroom" },
                  xml("value", {}, "1")
                ),
                xml(
                  "field",
                  { var: "muc#roomconfig_publicroom" },
                  xml("value", {}, "1")
                ),
                xml(
                  "field",
                  { var: "muc#roomconfig_roomname" },
                  xml("value", {}, "Technical Log Room")
                ),
                xml(
                  "field",
                  { var: "muc#roomconfig_roomdesc" },
                  xml("value", {}, "Verbose logs and technical details from agents")
                )
              )
            )
          );

          await xmpp.send(configForm);
        }
      }
    } else if (stanza.is("iq")) {
      const type = stanza.attrs.type;
      const id = stanza.attrs.id;

      if (id === "config1") {
        if (type === "result") {
          console.log("✅ Room configured successfully!");
          console.log("   - Persistent: Yes");
          console.log("   - Public: Yes");
          console.log("   - Name: Technical Log Room");

          setTimeout(() => {
            console.log("\n✅ Log room configuration completed!");
            xmpp.stop();
            process.exit(0);
          }, 1000);
        } else if (type === "error") {
          console.log("⚠️  Room configuration error");
          const error = stanza.getChild("error");
          if (error) {
            console.log("Error details:", error.toString());
          }
          setTimeout(() => xmpp.stop(), 1000);
        }
      }
    }
  });

  console.log("🔌 Connecting...");
  await xmpp.start();

  setTimeout(() => {
    if (!roomJoined) {
      console.log("❌ Failed to configure room within timeout");
      process.exit(1);
    }
  }, 15000);
}

configureLogRoom().catch(console.error);
