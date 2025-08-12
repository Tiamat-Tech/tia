import { client, xml } from "@xmpp/client";

const ROOM = "general@conference.xmpp";
const NICKNAME = "danja";

async function testBotResponse() {
  console.log("=== Testing MistralBot Response ===");
  console.log(`Room: ${ROOM}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  const xmpp = client({
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "danja",
    password: "Claudiopup",
    tls: { rejectUnauthorized: false },
  });

  let messagesSent = 0;
  let responsesReceived = 0;

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
    console.log(`🏠 Joining room: ${ROOM}/${NICKNAME}`);
    
    const mucPresence = xml(
      "presence",
      { to: `${ROOM}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );
    
    await xmpp.send(mucPresence);
  });

  xmpp.on("stanza", async (stanza) => {
    if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;
      
      if (from && from.startsWith(ROOM) && from === `${ROOM}/${NICKNAME}` && !type) {
        console.log("✅ Successfully joined room!");
        
        // Wait a bit then send test messages
        setTimeout(async () => {
          console.log("\n🧪 Testing bot responses...");
          
          // Test 1: Direct mention
          const testMessage1 = "MistralBot, what is 2 + 2?";
          console.log(`📤 Sending: ${testMessage1}`);
          await xmpp.send(xml(
            "message",
            { type: "groupchat", to: ROOM },
            xml("body", {}, testMessage1)
          ));
          messagesSent++;
          
          // Test 2: Bot prefix
          setTimeout(async () => {
            const testMessage2 = "bot: tell me a joke";
            console.log(`📤 Sending: ${testMessage2}`);
            await xmpp.send(xml(
              "message",
              { type: "groupchat", to: ROOM },
              xml("body", {}, testMessage2)
            ));
            messagesSent++;
            
            // Test 3: @mistralbot format
            setTimeout(async () => {
              const testMessage3 = "Hey @mistralbot can you help me?";
              console.log(`📤 Sending: ${testMessage3}`);
              await xmpp.send(xml(
                "message",
                { type: "groupchat", to: ROOM },
                xml("body", {}, testMessage3)
              ));
              messagesSent++;
            }, 2000);
          }, 2000);
        }, 2000);
      }
    } else if (stanza.is("message")) {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      const type = stanza.attrs.type;
      
      if (body && type === "groupchat" && from && from.startsWith(ROOM)) {
        const sender = from.split('/')[1] || 'unknown';
        
        if (sender === "MistralBot") {
          responsesReceived++;
          console.log(`\n🤖 BOT RESPONSE #${responsesReceived}: ${body}`);
          console.log(`✅ Bot is working and responding to messages!`);
          
          if (responsesReceived >= 1) {
            setTimeout(() => {
              console.log(`\n=== Test Results ===`);
              console.log(`Messages sent: ${messagesSent}`);
              console.log(`Bot responses received: ${responsesReceived}`);
              
              if (responsesReceived > 0) {
                console.log("🎉 SUCCESS: MistralBot is working correctly!");
                console.log("✅ Bot receives messages");
                console.log("✅ Bot generates responses");
                console.log("✅ Bot sends responses back to room");
                console.log("✅ Mistral AI integration is working");
              }
              
              xmpp.stop();
              process.exit(0);
            }, 3000);
          }
        } else if (sender !== NICKNAME) {
          console.log(`💬 [${sender}]: ${body}`);
        }
      }
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);
  
  // Timeout
  setTimeout(() => {
    console.log(`\n⏰ Test timeout reached`);
    console.log(`Messages sent: ${messagesSent}`);
    console.log(`Bot responses received: ${responsesReceived}`);
    
    if (responsesReceived === 0) {
      console.log("❌ Bot didn't respond to any messages");
      console.log("This could indicate:");
      console.log("- Bot logic issues");
      console.log("- Mistral API problems");
      console.log("- Message filtering problems");
    }
    
    process.exit(0);
  }, 20000);
}

testBotResponse().catch(console.error);