import dotenv from "dotenv";
import { loadAgentProfile } from "./agent-registry.js";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { SememProvider } from "../agents/providers/semem-provider.js";
import logger from "../lib/logger-lite.js";

dotenv.config();

const requestedProfile = process.env.AGENT_PROFILE || "semem";
const profile = loadAgentProfile(requestedProfile);
if (!profile?.nickname || !profile?.xmppConfig?.username) {
  throw new Error("Semem agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = profile.xmppConfig;
const MUC_ROOM = profile.roomJid;
const BOT_NICKNAME = profile.nickname;
const CHAT_FEATURES = profile.features || {};
const ACTIVE_PROFILE = profile.profileName;
XMPP_CONFIG.resource =
  process.env.AGENT_RESOURCE || process.env.SEMEM_RESOURCE || profile.xmppConfig.resource || BOT_NICKNAME;

const sememProvider = new SememProvider({
  sememConfig: profile.sememConfig,
  botNickname: BOT_NICKNAME,
  chatFeatures: CHAT_FEATURES,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider: sememProvider,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  logger
});

async function start() {
  console.log(`Starting Semem agent "${BOT_NICKNAME}"`);
  if (requestedProfile !== ACTIVE_PROFILE) {
    console.log(`Requested profile "${requestedProfile}" not found. Using "${ACTIVE_PROFILE}"`);
  } else {
    console.log(`Profile: ${ACTIVE_PROFILE}`);
  }
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Semem API: ${profile.sememConfig.baseUrl}`);
  console.log(
    `Features: Wikipedia=${!!CHAT_FEATURES.useWikipedia}, Wikidata=${!!CHAT_FEATURES.useWikidata}, WebSearch=${!!CHAT_FEATURES.useWebSearch}`
  );
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
  console.error("Failed to start Semem agent:", err);
  process.exit(1);
});
