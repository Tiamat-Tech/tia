import dotenv from "dotenv";
import { client, xml } from "@xmpp/client";
import logger from "../lib/logger-lite.js";

dotenv.config();

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.TEST_USERNAME || "testuser",
  password: process.env.TEST_PASSWORD || "testpass",
  resource: "DataAgentTest"
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = "Data";

const xmppClient = client({
  service: XMPP_CONFIG.service,
  domain: XMPP_CONFIG.domain,
  username: XMPP_CONFIG.username,
  password: XMPP_CONFIG.password,
  resource: XMPP_CONFIG.resource
});

const testMessages = [
  {
    text: `${BOT_NICKNAME}, query: Albert Einstein`,
    desc: "Command mode - entity query"
  },
  {
    text: `${BOT_NICKNAME}, who was Marie Curie?`,
    desc: "Natural language mode - LLM extraction"
  },
  {
    text: `${BOT_NICKNAME}, sparql: SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5`,
    desc: "Direct SPARQL mode"
  }
];

let messageIndex = 0;
const responses = [];
let responseTimer = null;

async function sendNextTest() {
  if (messageIndex >= testMessages.length) {
    console.log("\n=== Test Results ===");
    responses.forEach((r, i) => {
      console.log(`\nTest ${i + 1}: ${testMessages[i].desc}`);
      console.log(`Sent: ${testMessages[i].text}`);
      console.log(`Response: ${r}`);
    });
    console.log("\n=== Tests Complete ===");
    await xmppClient.stop();
    process.exit(0);
  }

  const testMsg = testMessages[messageIndex];
  console.log(`\n[${messageIndex + 1}/${testMessages.length}] ${testMsg.desc}`);
  console.log(`Sending: ${testMsg.text}`);

  const msgXml = xml(
    "message",
    { type: "groupchat", to: MUC_ROOM },
    xml("body", {}, testMsg.text)
  );

  await xmppClient.send(msgXml);
  messageIndex++;

  responseTimer = setTimeout(() => {
    console.log("Timeout waiting for response");
    responses.push("(no response)");
    sendNextTest();
  }, 10000);
}

xmppClient.on("online", async () => {
  console.log("Connected to XMPP");

  const presence = xml(
    "presence",
    { to: `${MUC_ROOM}/${XMPP_CONFIG.resource}` },
    xml("x", { xmlns: "http://jabber.org/protocol/muc" })
  );

  await xmppClient.send(presence);

  setTimeout(() => sendNextTest(), 2000);
});

xmppClient.on("stanza", async (stanza) => {
  if (stanza.is("message") && stanza.attrs.type === "groupchat") {
    const from = stanza.attrs.from;
    const body = stanza.getChildText("body");

    if (from?.includes(BOT_NICKNAME) && body) {
      console.log(`Received: ${body.substring(0, 200)}${body.length > 200 ? "..." : ""}`);
      responses.push(body);

      if (responseTimer) {
        clearTimeout(responseTimer);
        responseTimer = null;
      }

      setTimeout(() => sendNextTest(), 2000);
    }
  }
});

xmppClient.on("error", (err) => {
  console.error("XMPP error:", err.message);
});

console.log("Starting Data Agent test...");
console.log(`Will test ${testMessages.length} query modes`);
console.log(`XMPP Server: ${XMPP_CONFIG.service}`);
console.log(`MUC Room: ${MUC_ROOM}`);
console.log(`Bot Nickname: ${BOT_NICKNAME}`);
console.log("");

xmppClient.start().catch(console.error);
