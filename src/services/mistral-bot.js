import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { MistralProvider } from "../agents/providers/mistral-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import {
  HumanChatHandler,
  IBISTextHandler,
  ModelFirstRdfHandler,
  ModelNegotiationHandler
} from "../lib/lingue/handlers/index.js";
import { MFR_CONTRIBUTION_TYPES, MFR_MESSAGE_TYPES } from "../lib/mfr/constants.js";
import { xml } from "@xmpp/client";
import { InMemoryHistoryStore } from "../lib/history/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mistral";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Mistral agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

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

let negotiator = null;
const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}

const modelFirstRdfHandler = profile.supportsLingueMode(LANGUAGE_MODES.MODEL_FIRST_RDF)
  ? new ModelFirstRdfHandler({ logger })
  : null;

if (profile.supportsLingueMode(LANGUAGE_MODES.MODEL_NEGOTIATION)) {
  handlers[LANGUAGE_MODES.MODEL_NEGOTIATION] = new ModelNegotiationHandler({
    logger,
    onPayload: async ({ payload, roomJid, stanza }) => {
      const messageType = payload?.messageType;
      if (!messageType) {
        return null;
      }

      const sessionId = payload?.sessionId;
      const targetRoom = roomJid || stanza?.attrs?.from?.split("/")?.[0];

      if (messageType === MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST) {
        if (!sessionId) {
          logger.warn?.("[MistralBot] MFR contribution request missing sessionId");
          return null;
        }

        if (!targetRoom) {
          logger.warn?.("[MistralBot] Cannot determine target room for MFR contribution");
          return null;
        }

        logger.info?.(`[MistralBot] Generating MFR contribution for session ${sessionId}`);
        const rdf = await provider.handleMfrContributionRequest(payload);
        if (rdf && rdf.trim() && modelFirstRdfHandler && negotiator?.xmppClient) {
          logger.info?.(`[MistralBot] Sending ${rdf.length} bytes of RDF to ${targetRoom}`);
          const contributionStanza = modelFirstRdfHandler.createStanza(
            targetRoom,
            rdf,
            `MFR contribution from ${BOT_NICKNAME}`,
            { metadata: { sessionId } }
          );
          await negotiator.xmppClient.send(contributionStanza);
        } else {
          logger.warn?.(`[MistralBot] No RDF generated or missing handler (rdf=${!!rdf}, handler=${!!modelFirstRdfHandler})`);
        }

        if (payload.requestedContributions?.includes(MFR_CONTRIBUTION_TYPES.ACTION)) {
          const actions = await provider.extractActions(payload.problemDescription);
          if (actions.length > 0 && negotiator?.xmppClient) {
            await negotiator.send(targetRoom, {
              mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
              payload: {
                messageType: MFR_MESSAGE_TYPES.ACTION_SCHEMA,
                sessionId,
                actions,
                timestamp: new Date().toISOString()
              },
              summary: `Action schema from ${BOT_NICKNAME} for ${sessionId}`
            });
          }
        }

        return null;
      }

      if (messageType === MFR_MESSAGE_TYPES.SESSION_COMPLETE) {
        if (!sessionId || !targetRoom) {
          logger.warn?.("[MistralBot] SessionComplete missing sessionId or target room");
          return null;
        }

        const solution = Array.isArray(payload.solutions) ? payload.solutions[0] : payload.solution;
        if (!solution) {
          logger.warn?.("[MistralBot] SessionComplete missing solution payload");
          return null;
        }

        const explanation = await provider.explainSolution(solution, payload.model || "");
        if (!explanation || !explanation.trim()) {
          return null;
        }

        await negotiator.xmppClient.send(
          xml("message", { to: targetRoom, type: "groupchat" },
            xml("body", {}, `Solution explanation: ${explanation}`)
          )
        );

        return null;
      }

      return null;
    }
  });
}

negotiator = new LingueNegotiator({
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
  maxAgentRounds: systemConfig.maxAgentRounds,
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
