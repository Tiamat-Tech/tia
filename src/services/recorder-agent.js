import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { RecorderProvider } from "../agents/providers/recorder-provider.js";
import logger from "../lib/logger-lite.js";
import loadAgentConfig from "../agents/config-loader.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "recorder";
const fileConfig = loadAgentConfig(profileName) || {};
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Recorder agent profile is missing nickname or XMPP username");
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
  throw new Error("Recorder agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;

const sememConfig = {
  baseUrl: fileConfig.semem?.baseUrl || process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it",
  authToken: process.env[fileConfig.semem?.authTokenEnv || "SEMEM_AUTH_TOKEN"],
  timeoutMs: fileConfig.semem?.timeoutMs || parseInt(process.env.SEMEM_HTTP_TIMEOUT_MS || "8000", 10)
};

const provider = new RecorderProvider({
  sememConfig,
  botNickname: BOT_NICKNAME,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  respondToAll: true, // Recorder should capture all messages
  logger
});

async function start() {
  console.log(`Starting Recorder agent "${BOT_NICKNAME}"`);
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
  console.error("Failed to start Recorder agent:", err);
  process.exit(1);
});
