import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { PrologProvider } from "../agents/providers/prolog-provider.js";
import logger from "../lib/logger-lite.js";
import { xml } from "@xmpp/client";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { loadSystemConfig } from "../lib/system-config.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import {
  HumanChatHandler,
  ModelFirstRdfHandler,
  ModelNegotiationHandler,
  PrologProgramHandler
} from "../lib/lingue/handlers/index.js";
import { MFR_MESSAGE_TYPES } from "../lib/mfr/constants.js";
import { loadAgentRoster } from "../agents/profile-roster.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "prolog";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Prolog agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Prolog agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Prolog agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;

const provider = new PrologProvider({ nickname: BOT_NICKNAME, logger });

let negotiator = null;
const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROLOG_PROGRAM)) {
  handlers[LANGUAGE_MODES.PROLOG_PROGRAM] = new PrologProgramHandler({
    logger,
    onPayload: async ({ payload }) => {
      return provider.handle({
        command: "chat",
        content: payload
      });
    }
  });
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
      let rdf = "";
      if (messageType === MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST) {
        if (!sessionId) {
          logger.warn?.("[PrologAgent] MFR contribution request missing sessionId");
          return null;
        }

        rdf = await provider.handleMfrContributionRequest(payload);
      } else if (messageType === MFR_MESSAGE_TYPES.ACTION_SCHEMA) {
        if (!sessionId) {
          logger.warn?.("[PrologAgent] Action schema missing sessionId");
          return null;
        }
        rdf = await provider.handleActionSchema(payload);
      } else if (messageType === MFR_MESSAGE_TYPES.SOLUTION_REQUEST) {
        logger.info?.(`[PrologAgent] Received solution request for session ${payload?.sessionId}`);
        const solution = await provider.handleSolutionRequest(payload);
        if (!solution || !negotiator?.xmppClient) {
          logger.warn?.(`[PrologAgent] No solution generated or client missing (solution=${!!solution})`);
          return null;
        }

        const targetRoom = roomJid || stanza?.attrs?.from?.split("/")?.[0];
        if (!targetRoom) {
          logger.warn?.("[PrologAgent] Cannot determine target room for solution proposal");
          return null;
        }

        logger.info?.(
          `[PrologAgent] Sending solution proposal to ${targetRoom}: ${solution.message}`
        );
        await negotiator.send(targetRoom, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: {
            messageType: MFR_MESSAGE_TYPES.SOLUTION_PROPOSAL,
            sessionId: payload?.sessionId,
            solution,
            timestamp: new Date().toISOString()
          },
          summary: `Solution proposal from ${BOT_NICKNAME} for ${payload?.sessionId}`
        });
        return null;
      } else if (messageType === MFR_MESSAGE_TYPES.PLAN_EXECUTION_REQUEST) {
        const sessionId = payload?.sessionId;
        const program = payload?.program;
        const query = payload?.query;
        if (!sessionId || !program || !query) {
          logger.debug?.("[PrologAgent] Plan execution request missing sessionId/program/query");
          return null;
        }

        const targetRoom = roomJid || stanza?.attrs?.from?.split("/")?.[0];
        if (!targetRoom) {
          logger.warn?.("[PrologAgent] Cannot determine target room for plan execution result");
          return null;
        }

        logger.info?.(`[PrologAgent] Executing plan program for session ${sessionId}`);
        if (negotiator?.xmppClient) {
          await negotiator.xmppClient.send(
            xml(
              "message",
              { to: targetRoom, type: "groupchat" },
              xml("body", {}, `Prolog: executing plan for ${sessionId}`)
            )
          );
        }
        let bindings = [];
        let executionError = null;
        try {
          const timeoutMs = 20000;
          bindings = await Promise.race([
            provider.runProgramQuery(program, query),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Execution timeout")), timeoutMs);
            })
          ]);
        } catch (error) {
          executionError = error?.message || "Execution failed";
          logger.warn?.(`[PrologAgent] Plan execution failed: ${executionError}`);
        }

        await negotiator.send(targetRoom, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: {
            messageType: MFR_MESSAGE_TYPES.PLAN_EXECUTION_RESULT,
            sessionId,
            bindings: Array.isArray(bindings) ? bindings : [],
            query,
            error: executionError,
            timestamp: new Date().toISOString()
          },
          summary: `Plan execution result from ${BOT_NICKNAME} for ${sessionId}`
        });

        if (negotiator?.xmppClient) {
          const count = Array.isArray(bindings) ? bindings.length : 0;
          await negotiator.xmppClient.send(
            xml(
              "message",
              { to: targetRoom, type: "groupchat" },
              xml(
                "body",
                {},
                executionError
                  ? `Prolog: execution failed for ${sessionId} (${executionError})`
                  : `Prolog: sent execution result (${count} binding(s)) for ${sessionId}`
              )
            )
          );
        }

        return null;
      } else {
        return null;
      }

      if (!rdf || !rdf.trim()) {
        return null;
      }

      if (!modelFirstRdfHandler || !negotiator?.xmppClient) {
        logger.warn?.("[PrologAgent] Cannot send MFR contribution (handler or client missing)");
        return null;
      }

      const targetRoom = roomJid || stanza?.attrs?.from?.split("/")?.[0];
      if (!targetRoom) {
        logger.warn?.("[PrologAgent] Cannot determine target room for MFR contribution");
        return null;
      }

      const contributionStanza = modelFirstRdfHandler.createStanza(
        targetRoom,
        rdf,
        `MFR contribution from ${BOT_NICKNAME}`,
        { metadata: { sessionId } }
      );

      await negotiator.xmppClient.send(contributionStanza);
      return null;
    }
  });
}

negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

function createStrictPrefixedParser(prefixes = []) {
  return (text) => {
    const trimmed = (text || "").trim();
    const lowered = trimmed.toLowerCase();
    for (const prefix of prefixes) {
      if (lowered.startsWith(prefix)) {
        return defaultCommandParser(trimmed.slice(prefix.length).trim());
      }
    }
    return { command: null, content: "" };
  };
}

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: createStrictPrefixedParser([
    `${BOT_NICKNAME.toLowerCase()},`,
    `${BOT_NICKNAME.toLowerCase()}:`
  ]),
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Prolog agent "${BOT_NICKNAME}"`);
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
  console.error("Failed to start Prolog agent:", err);
  process.exit(1);
});
