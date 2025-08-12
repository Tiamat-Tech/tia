#!/usr/bin/env node

import { client, xml } from "@xmpp/client";
import readline from 'readline';
import process from 'process';

const XMPP_SERVICE = "xmpp://localhost:5222";
const XMPP_DOMAIN = "xmpp";

function showUsage() {
  console.log('XMPP CLI Client');
  console.log('');
  console.log('Usage: node src/client/repl.js <username> <password>');
  console.log('');
  console.log('Examples:');
  console.log('  NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js danja Claudiopup');
  console.log('  NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js alice wonderland');
  console.log('');
  console.log('Commands in REPL:');
  console.log('  /help         - Show this help');
  console.log('  /status       - Show connection status');
  console.log('  /quit         - Exit the client');
  console.log('  /to <jid>     - Set target JID for messages');
  console.log('  /join <room>  - Join MUC room (e.g. /join general@conference.xmpp)');
  console.log('  /leave        - Leave current MUC room');
  console.log('  <message>     - Send message to current target or room');
}

if (process.argv.length < 4) {
  showUsage();
  process.exit(1);
}

const username = process.argv[2];
const password = process.argv[3];

let currentTarget = null;
let currentRoom = null;
let isOnline = false;

const xmpp = client({
  service: XMPP_SERVICE,
  domain: XMPP_DOMAIN,
  username: username,
  password: password,
  tls: { rejectUnauthorized: false },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${username}@${XMPP_DOMAIN}> `
});

xmpp.on("error", (err) => {
  console.error(`\n❌ XMPP Error: ${err.message}`);
  console.error(`Error details:`, err);
  if (err.condition === 'not-authorized') {
    console.error('Check your username and password');
    process.exit(1);
  }
});

xmpp.on("offline", () => {
  console.log("\n📴 Disconnected from server");
  isOnline = false;
  process.exit(0);
});

xmpp.on("online", async (address) => {
  console.log(`\n✅ Connected as ${address.toString()}`);
  isOnline = true;
  
  await xmpp.send(xml("presence"));
  console.log("📡 Presence sent - you are now online");
  
  console.log("\n💬 XMPP CLI Client ready!");
  console.log("Type /help for commands or just start typing to send messages");
  console.log("Set a target with: /to user@xmpp");
  console.log("");
  
  rl.prompt();
});

xmpp.on("stanza", async (stanza) => {
  if (stanza.is("message")) {
    const from = stanza.attrs.from;
    const type = stanza.attrs.type || "chat";
    const body = stanza.getChildText("body");
    
    if (body) {
      const timestamp = new Date().toLocaleTimeString();
      
      if (type === "groupchat") {
        // MUC message
        const roomJid = from.split('/')[0];
        const nickname = from.split('/')[1] || 'Unknown';
        console.log(`\n🏠 [${roomJid}] ${nickname}: ${body}`);
      } else {
        // Direct message
        console.log(`\n💬 [${timestamp}] ${from}: ${body}`);
      }
      
      rl.prompt();
    }
  } else if (stanza.is("presence")) {
    const from = stanza.attrs.from;
    const type = stanza.attrs.type;
    
    if (type === "unavailable") {
      console.log(`\n👋 ${from} went offline`);
    } else if (!type) {
      console.log(`\n👋 ${from} is online`);
    }
    
    rl.prompt();
  }
});

rl.on('line', async (input) => {
  const line = input.trim();
  
  if (!line) {
    rl.prompt();
    return;
  }
  
  if (line.startsWith('/')) {
    const [command, ...args] = line.split(' ');
    
    switch (command) {
      case '/help':
        showUsage();
        break;
        
      case '/status':
        console.log(`Connection: ${isOnline ? '✅ Online' : '❌ Offline'}`);
        console.log(`Current target: ${currentTarget || 'None'}`);
        console.log(`Current room: ${currentRoom || 'None'}`);
        break;
        
      case '/quit':
      case '/exit':
        console.log("👋 Goodbye!");
        await xmpp.send(xml("presence", { type: "unavailable" }));
        await xmpp.stop();
        process.exit(0);
        break;
        
      case '/to':
        if (args.length === 0) {
          console.log("Usage: /to <jid>");
          console.log("Example: /to alice@xmpp");
        } else {
          currentTarget = args[0];
          currentRoom = null; // Clear room when setting direct target
          console.log(`🎯 Target set to: ${currentTarget}`);
        }
        break;
        
      case '/join':
        if (args.length === 0) {
          console.log("Usage: /join <room@conference.domain>");
          console.log("Example: /join general@conference.xmpp");
        } else {
          const roomJid = args[0];
          const nickname = username;
          
          try {
            await xmpp.send(xml("presence", { to: `${roomJid}/${nickname}` }));
            currentRoom = roomJid;
            currentTarget = null; // Clear direct target when joining room
            console.log(`🏠 Joining room: ${roomJid} as ${nickname}`);
          } catch (error) {
            console.error(`❌ Failed to join room: ${error.message}`);
          }
        }
        break;
        
      case '/leave':
        if (!currentRoom) {
          console.log("❌ Not in any room");
        } else {
          try {
            await xmpp.send(xml("presence", { 
              to: `${currentRoom}/${username}`,
              type: "unavailable"
            }));
            console.log(`👋 Left room: ${currentRoom}`);
            currentRoom = null;
          } catch (error) {
            console.error(`❌ Failed to leave room: ${error.message}`);
          }
        }
        break;
        
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log("Type /help for available commands");
    }
  } else {
    // Send message
    if (!isOnline) {
      console.log("❌ Not connected to server");
    } else if (currentRoom) {
      // Send to MUC room
      try {
        await xmpp.send(xml(
          "message",
          { type: "groupchat", to: currentRoom },
          xml("body", {}, line)
        ));
        console.log(`🏠 → [${currentRoom}]: ${line}`);
      } catch (error) {
        console.error(`❌ Failed to send message to room: ${error.message}`);
      }
    } else if (currentTarget) {
      // Send direct message
      try {
        await xmpp.send(xml(
          "message",
          { type: "chat", to: currentTarget },
          xml("body", {}, line)
        ));
        console.log(`💬 → ${currentTarget}: ${line}`);
      } catch (error) {
        console.error(`❌ Failed to send message: ${error.message}`);
      }
    } else {
      console.log("❌ No target set. Use /to <jid> or /join <room> first");
    }
  }
  
  rl.prompt();
});

rl.on('close', async () => {
  console.log("\n👋 Goodbye!");
  if (isOnline) {
    await xmpp.send(xml("presence", { type: "unavailable" }));
    await xmpp.stop();
  }
  process.exit(0);
});

console.log("🔌 Connecting to XMPP server...");
xmpp.start().catch((err) => {
  console.error("❌ Failed to connect:", err.message);
  process.exit(1);
});