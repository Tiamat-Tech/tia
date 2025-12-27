import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { GolemProvider } from "../agents/providers/golem-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import { HumanChatHandler, ModelNegotiationHandler, ModelFirstRdfHandler } from "../lib/lingue/handlers/index.js";
import { MFR_MESSAGE_TYPES, MFR_CONTRIBUTION_TYPES } from "../lib/mfr/constants.js";
import { reportLingueMode } from "../lib/lingue/verbose.js";
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

// Add MODEL_FIRST_RDF handler for MFR contributions
const modelFirstRdfHandler = profile.supportsLingueMode(LANGUAGE_MODES.MODEL_FIRST_RDF)
  ? new ModelFirstRdfHandler({ logger })
  : null;

// Add MODEL_NEGOTIATION handler for receiving role assignments and contribution requests
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

      // Handle MFR contribution requests
      if (messageType === MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST) {
        if (!sessionId) {
          logger.warn?.("[GolemAgent] MFR contribution request missing sessionId");
          return null;
        }

        if (!targetRoom) {
          logger.warn?.("[GolemAgent] Cannot determine target room for MFR contribution");
          return null;
        }

        logger.info?.(`[GolemAgent] Generating MFR contribution for session ${sessionId}`);
        const rdf = await provider.handleMfrContributionRequest(payload);
        if (rdf && rdf.trim() && modelFirstRdfHandler && negotiator?.xmppClient) {
          logger.info?.(`[GolemAgent] Sending ${rdf.length} bytes of RDF to ${targetRoom}`);
          const contributionStanza = modelFirstRdfHandler.createStanza(
            targetRoom,
            rdf,
            `MFR contribution from ${BOT_NICKNAME}`,
            { metadata: { sessionId } }
          );
          await negotiator.xmppClient.send(contributionStanza);
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
        } else {
          logger.warn?.(`[GolemAgent] No RDF generated or missing handler (rdf=${!!rdf}, handler=${!!modelFirstRdfHandler})`);
        }

        // Handle action schema extraction if requested
        if (payload.requestedContributions?.includes(MFR_CONTRIBUTION_TYPES.ACTION)) {
          const actions = await provider.extractActions(payload.problemDescription);
          if (actions.length > 0 && negotiator?.xmppClient) {
            await reportLingueMode({
              logger,
              xmppClient: negotiator?.xmppClient,
              roomJid: targetRoom,
              payload,
              direction: "->",
              mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
              mimeType: "application/json",
              detail: "ActionSchema"
            });
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

      // Handle role assignment messages
      if (messageType === MFR_MESSAGE_TYPES.GOLEM_ROLE_ASSIGNMENT) {
        logger.info?.(`[GolemAgent] Received role assignment: ${payload.roleName}`);

        // Update provider with new role
        provider.setRoleFromAssignment(payload);

        // Send acknowledgment
        if (negotiator?.xmppClient) {
          await negotiator.send(roomJid, {
            mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
            payload: {
              messageType: MFR_MESSAGE_TYPES.GOLEM_ROLE_ACKNOWLEDGMENT,
              sessionId: payload.sessionId,
              roleName: payload.roleName,
              domain: payload.domain,
              timestamp: new Date().toISOString()
            },
            summary: `Golem acknowledged role: ${payload.roleName}`
          });
        }

        return null;
      }

      // Handle role query messages
      if (messageType === MFR_MESSAGE_TYPES.GOLEM_ROLE_QUERY) {
        logger.info?.(`[GolemAgent] Received role query`);

        const currentRole = provider.getCurrentRole();

        // Send role status
        if (negotiator?.xmppClient) {
          await negotiator.send(roomJid, {
            mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
            payload: {
              messageType: MFR_MESSAGE_TYPES.GOLEM_ROLE_STATUS,
              sessionId: payload.sessionId,
              currentRole: currentRole,
              timestamp: new Date().toISOString()
            },
            summary: `Golem current role: ${currentRole.name}`
          });
        }

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

  // Provide sendToLog to provider for error logging
  provider.sendToLog = runner.sendToLog.bind(runner);
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
