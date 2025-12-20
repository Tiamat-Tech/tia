import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { MistralProvider } from "../agents/providers/mistral-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler } from "../lib/lingue/handlers/index.js";
import { InMemoryHistoryStore } from "../lib/history/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mistral";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Mistral agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Mistral agent profile is missing nickname or XMPP username");
}

const baseXmpp = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME,
  resource: process.env.MISTRAL_RESOURCE
};

const XMPP_CONFIG = {
  ...baseXmpp,
  ...(fileConfig.xmpp || {})
};

const MUC_ROOM = fileConfig.roomJid || process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = fileConfig.nickname;
XMPP_CONFIG.resource = XMPP_CONFIG.resource || fileConfig.xmpp?.resource || BOT_NICKNAME;

const LINGUE_ENABLED = process.env.LINGUE_ENABLED !== "false";
const LINGUE_CONFIDENCE_MIN = parseFloat(process.env.LINGUE_CONFIDENCE_MIN || "0.5");

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  model: (fileConfig.mistral && fileConfig.mistral.model) || process.env.MISTRAL_MODEL || "mistral-small-latest",
  nickname: BOT_NICKNAME,
  systemPrompt: fileConfig.mistral?.systemPrompt,
  systemTemplate: fileConfig.mistral?.systemTemplate,
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 }),
  lingueEnabled: LINGUE_ENABLED,
  lingueConfidenceMin: LINGUE_CONFIDENCE_MIN,
  discoFeatures: featuresForModes(profile.lingue.supports),
  logger
});

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  agentRoster,
  logger
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
