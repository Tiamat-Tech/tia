import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { DataProvider } from "../agents/providers/data-provider.js";
import { McpClientBridge } from "../mcp/client-bridge.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import {
  HumanChatHandler,
  ModelFirstRdfHandler,
  ModelNegotiationHandler,
  SparqlQueryHandler
} from "../lib/lingue/handlers/index.js";
import { MFR_MESSAGE_TYPES } from "../lib/mfr/constants.js";
import { reportLingueMode } from "../lib/lingue/verbose.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "data";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Data agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Data agent profile is missing nickname or XMPP username");
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
  throw new Error("Data agent XMPP config incomplete; check profile file and secrets.json");
}

const MUC_ROOM = fileConfig.roomJid;
const BOT_NICKNAME = fileConfig.nickname;

const dataConfig = fileConfig.data;
if (!dataConfig?.sparqlEndpoint) {
  throw new Error("Data agent profile missing sparqlEndpoint");
}

const extractionApiKeyEnv = dataConfig.extractionApiKeyEnv || "MISTRAL_API_KEY";
const extractionApiKey = process.env[extractionApiKeyEnv];
if (!extractionApiKey) {
  logger.warn(`${extractionApiKeyEnv} not set - natural language queries will be disabled`);
}

const mcpBridge = new McpClientBridge({
  profile,
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: {
      ...process.env,
      SPARQL_QUERY_ENDPOINT: dataConfig.sparqlEndpoint
    }
  },
  logger
});

await mcpBridge.connect();

const provider = new DataProvider({
  endpoint: dataConfig.sparqlEndpoint,
  extractionModel: dataConfig.extractionModel,
  extractionApiKey,
  mcpBridge,
  nickname: BOT_NICKNAME,
  logger
});

let negotiator = null;
const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.SPARQL_QUERY)) {
  handlers[LANGUAGE_MODES.SPARQL_QUERY] = new SparqlQueryHandler({
    logger,
    onPayload: async ({ payload }) => {
      return provider.handleDirectSparql(payload);
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
        logger.warn?.("[DataAgent] MFR contribution request missing sessionId");
        return null;
      }

      const rdf = await provider.handleMfrContributionRequest(payload);
      if (!rdf || !rdf.trim()) {
        return null;
      }

      if (!modelFirstRdfHandler || !negotiator?.xmppClient) {
        logger.warn?.("[DataAgent] Cannot send MFR contribution (handler or client missing)");
        return null;
      }

      if (!targetRoom) {
        logger.warn?.("[DataAgent] Cannot determine target room for MFR contribution");
        return null;
      }

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
  console.log(`Starting Data agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`SPARQL Endpoint: ${dataConfig.sparqlEndpoint}`);
  console.log(`Extraction Model: ${dataConfig.extractionModel || "none"}`);
  if (!extractionApiKey) {
    console.log("Note: Natural language queries disabled (no API key)");
  }
  await runner.start();
}

async function stop() {
  await mcpBridge.close();
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
  console.error("Failed to start Data agent:", err);
  process.exit(1);
});
