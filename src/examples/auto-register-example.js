import dotenv from "dotenv";
import { autoConnectXmpp } from "../lib/xmpp-auto-connect.js";
import { XmppRoomAgent } from "../lib/xmpp-room-agent.js";

dotenv.config();

/**
 * Example: Auto-register an XMPP agent and join a MUC room
 *
 * This example demonstrates automatic account registration:
 * 1. If the agent has no saved credentials, it registers a new account
 * 2. Credentials are saved to config/agents/secrets.json for future use
 * 3. The agent joins a MUC room and sends a test message
 *
 * Usage:
 *   XMPP_SERVICE=xmpp://tensegrity.it:5222 \
 *   XMPP_DOMAIN=tensegrity.it \
 *   MUC_ROOM=general@conference.tensegrity.it \
 *   node src/examples/auto-register-example.js
 */

const XMPP_SERVICE = process.env.XMPP_SERVICE || "xmpp://localhost:5222";
const XMPP_DOMAIN = process.env.XMPP_DOMAIN || "localhost";
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.localhost";
const USERNAME = process.env.XMPP_USERNAME || `auto-agent-${Math.random().toString(16).slice(2, 8)}`;
const NICKNAME = process.env.BOT_NICKNAME || "AutoAgent";

async function main() {
  console.log("=== XMPP Auto-Registration Example ===");
  console.log(`Service: ${XMPP_SERVICE}`);
  console.log(`Domain: ${XMPP_DOMAIN}`);
  console.log(`Username: ${USERNAME}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  // Step 1: Auto-connect (will register if needed)
  console.log("Step 1: Connecting with auto-registration...");

  const { xmpp, credentials } = await autoConnectXmpp({
    service: XMPP_SERVICE,
    domain: XMPP_DOMAIN,
    username: USERNAME,
    // password: undefined, // Omit to trigger auto-registration
    resource: "AutoRegExample",
    tls: { rejectUnauthorized: false },
    autoRegister: true,
    logger: console
  });

  console.log(`✅ Connected as ${credentials.username}@${XMPP_DOMAIN}`);
  if (credentials.registered) {
    console.log("🆕 New account was registered");
    console.log(`🔑 Password: ${credentials.password}`);
    console.log("💾 Credentials saved to config/agents/secrets.json");
  } else {
    console.log("🔄 Used existing credentials");
  }
  console.log("");

  // Stop the basic client
  await xmpp.stop();

  // Step 2: Create agent with registered credentials
  console.log("Step 2: Creating XmppRoomAgent...");

  const agent = new XmppRoomAgent({
    xmppConfig: {
      service: XMPP_SERVICE,
      domain: XMPP_DOMAIN,
      username: credentials.username,
      password: credentials.password,
      tls: { rejectUnauthorized: false }
    },
    roomJid: MUC_ROOM,
    nickname: NICKNAME,
    onMessage: async (payload) => {
      console.log(`📨 [${payload.sender}]: ${payload.body}`);

      // Echo back
      if (payload.body.startsWith("ping")) {
        await payload.reply(`pong from ${NICKNAME}!`);
      }
    },
    allowSelfMessages: true,
    logger: console
  });

  // Step 3: Start agent and join room
  console.log("Step 3: Starting agent...");
  await agent.start();

  // Wait for room join
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (agent.isInRoom) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });

  console.log(`✅ Joined room ${MUC_ROOM} as ${NICKNAME}`);
  console.log("");

  // Step 4: Send a test message
  console.log("Step 4: Sending test message...");
  const testMessage = `Hello! I'm ${NICKNAME}, an auto-registered agent. Send "ping" to test!`;
  await agent.sendGroupMessage(testMessage);
  console.log(`✅ Sent: ${testMessage}`);
  console.log("");

  console.log("Agent is running. Press Ctrl+C to exit.");
  console.log("Try sending 'ping' in the room to get a response!");

  // Keep running
  process.on("SIGINT", async () => {
    console.log("\n\nShutting down...");
    await agent.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
