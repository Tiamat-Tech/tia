import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import {
  HumanChatHandler,
  ModelFirstRdfHandler,
  ModelNegotiationHandler
} from "../lib/lingue/handlers/index.js";
import { MFR_MESSAGE_TYPES } from "../lib/mfr/constants.js";
import { MfrSemanticProvider } from "../agents/providers/mfr-semantic-provider.js";
import { reportLingueMode } from "../lib/lingue/verbose.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mfr-semantic";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`MFR semantic agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("MFR semantic agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: fileConfig.xmpp?.tlsRejectUnauthorized ?? false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("MFR semantic agent XMPP config incomplete; check profile file and secrets.json");
}

const MUC_ROOM = fileConfig.roomJid;
const BOT_NICKNAME = fileConfig.nickname;

const providerConfig = fileConfig.mistral || {};
const apiKeyEnv = providerConfig.apiKeyEnv;
const apiKey = apiKeyEnv ? process.env[apiKeyEnv] : null;
const model = providerConfig.model || null;

if (apiKeyEnv && !apiKey) {
  logger.warn(`${apiKeyEnv} not set - semantic extraction will use heuristics only`);
}

const provider = new MfrSemanticProvider({
  nickname: BOT_NICKNAME,
  apiKey,
  model,
  logger
});

let runner = null;
let negotiator = null;
const handlers = {};

if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}

const modelFirstRdfHandler = profile.supportsLingueMode(LANGUAGE_MODES.MODEL_FIRST_RDF)
  ? new ModelFirstRdfHandler({ logger })
  : null;

if (profile.supportsLingueMode(LANGUAGE_MODES.MODEL_NEGOTIATION)) {
  handlers[LANGUAGE_MODES.MODEL_NEGOTIATION] = new ModelNegotiationHandler({
    logger,
    onPayload: async ({ payload, roomJid, stanza }) => {
      const messageType = payload?.messageType;
      if (messageType !== MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST) {
        return null;
      }

      const targetRoom = roomJid || stanza?.attrs?.from?.split("/")?.[0];
      await reportLingueMode({
        logger,
        xmppClient: negotiator?.xmppClient,
        roomJid: targetRoom,
        payload,
        direction: "<-",
        mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
        mimeType: "application/json",
        detail: messageType
      });

      const sessionId = payload?.sessionId;
      if (!sessionId) {
        logger.warn?.("[MfrSemanticAgent] MFR contribution request missing sessionId");
        return null;
      }

      const rdf = await provider.handleMfrContributionRequest(payload);
      if (!rdf || !rdf.trim()) {
        return null;
      }

      if (!modelFirstRdfHandler || !negotiator?.xmppClient) {
        logger.warn?.("[MfrSemanticAgent] Cannot send MFR contribution (handler or client missing)");
        return null;
      }

      if (!targetRoom) {
        logger.warn?.("[MfrSemanticAgent] Cannot determine target room for MFR contribution");
        return null;
      }

      const contributionSummary = `MFR contribution from ${BOT_NICKNAME}`;
      const contributionStanza = modelFirstRdfHandler.createStanza(
        targetRoom,
        rdf,
        contributionSummary,
        { metadata: { sessionId }, suppressBody: true }
      );

      await negotiator.xmppClient.send(contributionStanza);
      await runner?.sendToLog?.(contributionSummary);
      await reportLingueMode({
        logger,
        xmppClient: negotiator?.xmppClient,
        roomJid: targetRoom,
        payload,
        direction: "->",
        mode: LANGUAGE_MODES.MODEL_FIRST_RDF,
        mimeType: "text/turtle",
        detail: `ModelFirstRDF from ${BOT_NICKNAME}`
      });
      return null;
    }
  });
}

negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

runner = new AgentRunner({
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
  console.log(`Starting MFR semantic agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  if (model) {
    console.log(`Mistral Model: ${model}`);
  }
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
  console.error("Failed to start MFR semantic agent:", err);
  process.exit(1);
});
