import { client, xml } from "@xmpp/client";

const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "danja",
  password: "Claudiopup",
  tls: { rejectUnauthorized: false },
});

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err.message);
  process.exit(1);
});

xmpp.on("offline", () => {
  console.log("Disconnected");
  process.exit(0);
});

xmpp.on("online", async (address) => {
  console.log("Connected as", address.toString());
  
  // Send presence
  await xmpp.send(xml("presence"));
  console.log("Sent presence");
  
  // Join the MUC room
  const roomJid = "general@conference.xmpp";
  const nickname = "danja";
  
  await xmpp.send(xml("presence", { to: `${roomJid}/${nickname}` }));
  console.log(`Joined room: ${roomJid}`);
  
  // Wait a moment then send message to bot
  setTimeout(async () => {
    console.log("Sending message to MistralBot...");
    await xmpp.send(xml(
      "message",
      { type: "groupchat", to: roomJid },
      xml("body", {}, "MistralBot, what is 2+2?")
    ));
    
    // Wait for response then exit
    setTimeout(() => {
      console.log("Test complete");
      xmpp.stop();
    }, 8000);
  }, 2000);
});

xmpp.on("stanza", (stanza) => {
  if (stanza.is("message") && stanza.getChildText("body")) {
    const from = stanza.attrs.from;
    const body = stanza.getChildText("body");
    console.log(`Message from ${from}: ${body}`);
  }
});

console.log("Starting test...");
xmpp.start().catch(console.error);