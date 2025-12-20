import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { McpLoopbackProvider } from "../agents/providers/mcp-loopback-provider.js";
import { loadAgentRoster } from "../agents/profile-roster.js";

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

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Loopback agent XMPP config incomplete; check profile file");
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
