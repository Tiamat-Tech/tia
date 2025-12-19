import dotenv from "dotenv";
import { loadAgentProfile } from "./agent-registry.js";
import { loadAgentProfile as loadLingueProfile } from "../agents/profile-loader.js";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { SememProvider } from "../agents/providers/semem-provider.js";
import logger from "../lib/logger-lite.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler, ProfileExchangeHandler } from "../lib/lingue/handlers/index.js";

dotenv.config();

const requestedProfile = process.env.AGENT_PROFILE || "semem";
const profile = await loadAgentProfile(requestedProfile);
if (!profile?.nickname || !profile?.xmppConfig?.username) {
  throw new Error("Semem agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: profile.xmppConfig?.service,
  domain: profile.xmppConfig?.domain,
  username: profile.xmppConfig?.username,
  password: profile.xmppConfig?.password,
  resource: profile.xmppConfig?.resource || profile.nickname,
  tls: { rejectUnauthorized: false }
};
if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Semem agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = profile.roomJid;
const BOT_NICKNAME = profile.nickname;
const CHAT_FEATURES = profile.features || {};
const ACTIVE_PROFILE = profile.profileName;
const lingueProfile = await loadLingueProfile(requestedProfile)
  || await loadLingueProfile("semem");

const sememProvider = new SememProvider({
  sememConfig: profile.sememConfig,
  botNickname: BOT_NICKNAME,
  chatFeatures: CHAT_FEATURES,
  logger
});

const handlers = {};
if (lingueProfile?.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (lingueProfile?.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}
if (lingueProfile?.supportsLingueMode(LANGUAGE_MODES.PROFILE_EXCHANGE)) {
  handlers[LANGUAGE_MODES.PROFILE_EXCHANGE] = new ProfileExchangeHandler({ logger });
}

const negotiator = lingueProfile
  ? new LingueNegotiator({
      profile: lingueProfile,
      handlers,
      logger
    })
  : null;

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider: sememProvider,
  negotiator,
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
