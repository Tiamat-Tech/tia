import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, ModelNegotiationHandler } from "../lib/lingue/handlers/index.js";
import { MFR_MESSAGE_TYPES } from "../lib/mfr/constants.js";
import { ExecutorProvider } from "../agents/providers/executor-provider.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "executor";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Executor agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Executor agent profile is missing nickname or XMPP username");
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
  throw new Error("Executor agent XMPP config incomplete; check profile file and secrets.json");
}

const MUC_ROOM = fileConfig.roomJid;
const BOT_NICKNAME = fileConfig.nickname;

const providerConfig = fileConfig.mistral;
if (!providerConfig) {
  throw new Error("Executor agent requires a Mistral provider configuration");
}

const apiKeyEnv = providerConfig.apiKeyEnv;
if (!apiKeyEnv) {
  throw new Error("Executor agent provider missing apiKeyEnv");
}

const apiKey = process.env[apiKeyEnv];
if (!apiKey) {
  throw new Error(`${apiKeyEnv} not set for executor agent`);
}

const executorProvider = new ExecutorProvider({
  apiKey,
  model: providerConfig.model,
  maxTokens: providerConfig.maxTokens,
  temperature: providerConfig.temperature,
  systemPrompt: providerConfig.systemPrompt,
  nickname: BOT_NICKNAME,
  logger
});

let negotiator = null;
const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}

if (profile.supportsLingueMode(LANGUAGE_MODES.MODEL_NEGOTIATION)) {
  handlers[LANGUAGE_MODES.MODEL_NEGOTIATION] = new ModelNegotiationHandler({
    logger,
    onPayload: async ({ payload, roomJid, stanza, reply }) => {
      const messageType = payload?.messageType;
      if (messageType !== MFR_MESSAGE_TYPES.PLAN_EXECUTION_REQUEST) {
        return null;
      }

      if (payload.program && payload.query) {
        return null;
      }

      const sessionId = payload?.sessionId;
      const plan = payload?.plan;
      if (!sessionId || !Array.isArray(plan) || plan.length === 0) {
        logger.warn?.("[ExecutorAgent] Plan execution request missing sessionId or plan");
        return null;
      }

      const targetRoom = roomJid || stanza?.attrs?.from?.split("/")?.[0];
      if (!targetRoom) {
        logger.warn?.("[ExecutorAgent] Cannot determine target room for plan execution");
        return null;
      }

      const problemDescription = payload?.problemDescription || "";
      const modelTurtle = payload?.model || "";
      if (!problemDescription && !modelTurtle) {
        logger.warn?.("[ExecutorAgent] Plan execution request missing problem description and model");
        return "Executor: missing problem description and model for plan execution.";
      }

      if (reply) {
        await reply(`Executor: preparing plan execution for ${sessionId}.`);
      }

      const prepared = await executorProvider.generateExecutionProgram({
        plan,
        problemDescription,
        modelTurtle
      });

      if (!prepared?.program || !prepared?.query) {
        logger.warn?.("[ExecutorAgent] Failed to prepare Prolog program/query");
        if (negotiator?.xmppClient) {
          await negotiator.send(targetRoom, {
            mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
            payload: {
              messageType: MFR_MESSAGE_TYPES.PLAN_EXECUTION_RESULT,
              sessionId,
              bindings: [],
              error: "Executor failed to generate Prolog program/query",
              timestamp: new Date().toISOString()
            },
            summary: `Plan execution failed for ${sessionId}`
          });
        }

        return `Executor: unable to generate Prolog program for ${sessionId}.`;
      }

      await negotiator.send(targetRoom, {
        mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
        payload: {
          messageType: MFR_MESSAGE_TYPES.PLAN_EXECUTION_REQUEST,
          sessionId,
          plan,
          problemDescription,
          model: modelTurtle,
          program: prepared.program,
          query: prepared.query,
          preparedBy: BOT_NICKNAME,
          timestamp: new Date().toISOString()
        },
        summary: `Plan execution request prepared by ${BOT_NICKNAME} for ${sessionId}`
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

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider: executorProvider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Executor agent "${BOT_NICKNAME}"`);
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
  console.error("Failed to start Executor agent:", err);
  process.exit(1);
});
