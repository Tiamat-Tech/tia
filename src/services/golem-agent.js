import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { GolemProvider } from "../agents/providers/golem-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import { HumanChatHandler } from "../lib/lingue/handlers/index.js";
import { InMemoryHistoryStore } from "../lib/history/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "golem";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Golem agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Golem agent profile is missing nickname or XMPP username");
}

const baseXmpp = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME,
  resource: process.env.GOLEM_RESOURCE
};

// Merge, but only include fileConfig.xmpp values that are not undefined
const profileXmpp = fileConfig.xmpp || {};
const XMPP_CONFIG = {
  service: profileXmpp.service || baseXmpp.service,
  domain: profileXmpp.domain || baseXmpp.domain,
  username: profileXmpp.username || baseXmpp.username,
  password: profileXmpp.password,
  resource: profileXmpp.resource || baseXmpp.resource
};

const MUC_ROOM = fileConfig.roomJid || process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = fileConfig.nickname;
XMPP_CONFIG.resource = XMPP_CONFIG.resource || fileConfig.xmpp?.resource || BOT_NICKNAME;

const LINGUE_ENABLED = process.env.LINGUE_ENABLED !== "false";
const LINGUE_CONFIDENCE_MIN = parseFloat(process.env.LINGUE_CONFIDENCE_MIN || "0.5");

const provider = new GolemProvider({
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

let negotiator = null;
const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}

negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

// Custom message handler to intercept "Golem, prompt" commands
class GolemRunner extends AgentRunner {
  async handleMessage({ body, sender, type, roomJid, reply, stanza }) {
    // Check for prompt change command
    const promptMatch = body.match(/^Golem,\s*prompt\s+(.+)/i);
    if (promptMatch) {
      const newPrompt = promptMatch[1].trim();
      provider.updateSystemPrompt(newPrompt);
      await reply(`System prompt updated. I am now: ${newPrompt.substring(0, 100)}${newPrompt.length > 100 ? '...' : ''}`);
      return;
    }

    // Check for prompt reset command
    if (/^Golem,\s*reset\s*prompt/i.test(body)) {
      provider.resetSystemPrompt();
      const currentPrompt = provider.getCurrentSystemPrompt();
      await reply(`System prompt reset to original: ${currentPrompt.substring(0, 100)}${currentPrompt.length > 100 ? '...' : ''}`);
      return;
    }

    // Check for prompt show command
    if (/^Golem,\s*show\s*prompt/i.test(body)) {
      const currentPrompt = provider.getCurrentSystemPrompt();
      await reply(`Current system prompt: ${currentPrompt}`);
      return;
    }

    // Pass to default handler
    await super.handleMessage({ body, sender, type, roomJid, reply, stanza });
  }
}

const runner = new GolemRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Golem agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Mistral Model: ${process.env.MISTRAL_MODEL || "mistral-small-latest"}`);
  console.log(`Commands:`);
  console.log(`  - "Golem, prompt <new prompt>" - Change system prompt`);
  console.log(`  - "Golem, reset prompt" - Reset to original prompt`);
  console.log(`  - "Golem, show prompt" - Show current prompt`);
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
  console.error("Failed to start Golem agent:", err);
  process.exit(1);
});
