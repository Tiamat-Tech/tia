import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { DemoProvider } from "../agents/providers/demo-provider.js";
import logger from "../lib/logger-lite.js";
import loadAgentConfig from "../agents/config-loader.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "demo";
const fileConfig = loadAgentConfig(profileName) || {};

const DEMO_BOT_NICKNAME =
  fileConfig.nickname || process.env.DEMO_BOT_NICKNAME || "DemoBot";
const DEMO_XMPP_RESOURCE =
  process.env.DEMO_XMPP_RESOURCE || fileConfig.xmpp?.resource || DEMO_BOT_NICKNAME;

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || fileConfig.xmpp?.service || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || fileConfig.xmpp?.domain || "xmpp",
  username: process.env.XMPP_USERNAME || fileConfig.xmpp?.username,
  password: process.env.XMPP_PASSWORD || fileConfig.xmpp?.password,
  resource: DEMO_XMPP_RESOURCE,
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = fileConfig.roomJid || process.env.MUC_ROOM || "general@conference.xmpp";

const provider = new DemoProvider({ nickname: DEMO_BOT_NICKNAME, logger });

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: DEMO_BOT_NICKNAME,
  provider,
  mentionDetector: createMentionDetector(DEMO_BOT_NICKNAME, [DEMO_BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  logger
});

async function start() {
  console.log(`Starting DemoBot "${DEMO_BOT_NICKNAME}"`);
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
  console.error("Failed to start DemoBot:", err);
  process.exit(1);
});
