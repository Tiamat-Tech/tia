import { client, xml } from "@xmpp/client";

const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "alice",
  password: "wonderland",
  tls: { rejectUnauthorized: false }
});

const MUC_ROOM = "general@conference.xmpp";
const NICKNAME = "Alice";

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err);
});

xmpp.on("online", async (address) => {
  console.log(`Connected as ${address.toString()}`);
  
  // Join MUC room
  const presence = xml(
    "presence",
    { to: `${MUC_ROOM}/${NICKNAME}` },
    xml("x", { xmlns: "http://jabber.org/protocol/muc" })
  );
  
  await xmpp.send(presence);
  console.log(`Joining MUC room: ${MUC_ROOM}`);
  
  // Wait a bit then send a test message
  setTimeout(async () => {
    const message = xml(
      "message",
      { type: "groupchat", to: MUC_ROOM },
      xml("body", {}, "Hello MistralBot, can you help me?")
    );
    
    await xmpp.send(message);
    console.log("Sent test message to room");
    
    // Disconnect after a delay
    setTimeout(async () => {
      await xmpp.stop();
    }, 5000);
  }, 2000);
});

xmpp.on("stanza", (stanza) => {
  if (stanza.is("message") && stanza.attrs.type === "groupchat") {
    const from = stanza.attrs.from;
    const body = stanza.getChildText("body");
    
    if (body && from) {
      const sender = from.split('/')[1] || 'unknown';
      console.log(`[${sender}]: ${body}`);
    }
  }
});

xmpp.on("offline", () => {
  console.log("Disconnected from XMPP");
  process.exit(0);
});

xmpp.start().catch(console.error);