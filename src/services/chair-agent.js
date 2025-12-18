import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { MistralProvider } from "../agents/providers/mistral-provider.js";
import logger from "../lib/logger-lite.js";
import loadAgentConfig from "../agents/config-loader.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "chair";
const fileConfig = loadAgentConfig(profileName) || {};
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Chair agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || fileConfig.xmpp?.service || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || fileConfig.xmpp?.domain || "xmpp",
  username: process.env.XMPP_USERNAME || fileConfig.xmpp?.username,
  password: process.env.XMPP_PASSWORD || fileConfig.xmpp?.password,
  resource: process.env.CHAIR_RESOURCE || fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = fileConfig.roomJid || process.env.MUC_ROOM || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  model: (fileConfig.mistral && fileConfig.mistral.model) || process.env.MISTRAL_MODEL || "mistral-small-latest",
  nickname: BOT_NICKNAME,
  lingueEnabled: process.env.LINGUE_ENABLED !== "false",
  lingueConfidenceMin: parseFloat(process.env.LINGUE_CONFIDENCE_MIN || "0.5"),
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
  logger
});

async function start() {
  console.log(`Starting Chair agent "${BOT_NICKNAME}"`);
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
  console.error("Failed to start Chair agent:", err);
  process.exit(1);
});
