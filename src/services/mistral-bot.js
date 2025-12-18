import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { MistralProvider } from "../agents/providers/mistral-provider.js";

dotenv.config();

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  resource:
    process.env.MISTRAL_RESOURCE ||
    process.env.MISTRAL_NICKNAME ||
    process.env.BOT_NICKNAME ||
    undefined,
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = process.env.BOT_NICKNAME || "MistralBot";
XMPP_CONFIG.resource = XMPP_CONFIG.resource || BOT_NICKNAME;

const LINGUE_ENABLED = process.env.LINGUE_ENABLED !== "false";
const LINGUE_CONFIDENCE_MIN = parseFloat(process.env.LINGUE_CONFIDENCE_MIN || "0.5");

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  model: process.env.MISTRAL_MODEL || "mistral-small-latest",
  nickname: BOT_NICKNAME,
  lingueEnabled: LINGUE_ENABLED,
  lingueConfidenceMin: LINGUE_CONFIDENCE_MIN,
  logger: console
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME.toLowerCase(), "bot", "mistralbot"]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  logger: console
});

async function start() {
  console.log(`Starting MistralBot "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Mistral Model: ${process.env.MISTRAL_MODEL || "mistral-small-latest"}`);
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
  console.error("Failed to start MistralBot:", err);
  process.exit(1);
});
