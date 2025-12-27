import { client, xml } from "@xmpp/client";
import dotenv from "dotenv";

dotenv.config();

const SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const USERNAME = process.env.XMPP_USERNAME || "admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const CONFERENCE_SERVICE = "conference.tensegrity.it";

async function listRooms() {
  console.log("=== Listing MUC Rooms ===");
  console.log(`Service: ${SERVICE}`);
  console.log(`Conference Service: ${CONFERENCE_SERVICE}`);
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

    // Send disco#items query to get list of rooms
    const discoQuery = xml(
      "iq",
      { type: "get", to: CONFERENCE_SERVICE, id: "disco1" },
      xml("query", { xmlns: "http://jabber.org/protocol/disco#items" })
    );

    await xmpp.send(discoQuery);
    console.log("📡 Sent disco#items query");
  });

  xmpp.on("stanza", async (stanza) => {
    if (stanza.is("iq") && stanza.attrs.id === "disco1") {
      const query = stanza.getChild("query");
      if (query) {
        const items = query.getChildren("item");
        console.log(`\n📋 Found ${items.length} rooms:\n`);
        items.forEach((item, index) => {
          const jid = item.attrs.jid;
          const name = item.attrs.name || "(no name)";
          console.log(`${index + 1}. ${jid}`);
          if (name !== "(no name)") {
            console.log(`   Name: ${name}`);
          }
        });
      }
      console.log("");
      await xmpp.stop();
      process.exit(0);
    }
  });

  console.log("🔌 Connecting...");
  await xmpp.start();

  setTimeout(() => {
    console.log("❌ Timeout waiting for room list");
    process.exit(1);
  }, 10000);
}

listRooms().catch(console.error);
