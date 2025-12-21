import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { McpLoopbackProvider } from "../agents/providers/mcp-loopback-provider.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { autoConnectXmpp } from "../lib/xmpp-auto-connect.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mcp-loopback";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Loopback agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Loopback agent profile is missing nickname or XMPP username");
}

// Auto-connect with registration if needed
console.log(`[MCP Loopback] Connecting as ${fileConfig.xmpp?.username}@${fileConfig.xmpp?.domain}`);
const { credentials } = await autoConnectXmpp({
  service: fileConfig.xmpp?.service || process.env.XMPP_SERVICE,
  domain: fileConfig.xmpp?.domain || process.env.XMPP_DOMAIN,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" },
  autoRegister: true,
  logger
});

if (credentials.registered) {
  console.log(`[MCP Loopback] ✅ New account registered: ${credentials.username}`);
  console.log(`[MCP Loopback] Password saved to config/agents/secrets.json`);
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service || process.env.XMPP_SERVICE,
  domain: fileConfig.xmpp?.domain || process.env.XMPP_DOMAIN,
  username: credentials.username,
  password: credentials.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username) {
  throw new Error("Loopback agent XMPP config incomplete; check profile file and environment");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;
const LOOPBACK_MODE = process.env.MCP_LOOPBACK_MODE || "in-memory";

const provider = new McpLoopbackProvider({
  profile,
  logger,
  mode: LOOPBACK_MODE
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting MCP loopback agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start MCP loopback agent:", err);
  process.exit(1);
});
