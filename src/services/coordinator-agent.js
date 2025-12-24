import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { coordinatorCommandParser } from "../agents/core/coordinator-command-parser.js";
import { CoordinatorProvider } from "../agents/providers/coordinator-provider.js";
import { MfrModelStore } from "../lib/mfr/model-store.js";
import { MfrShaclValidator } from "../lib/mfr/shacl-validator.js";
import { MfrModelMerger } from "../lib/mfr/model-merger.js";
import { ShapesLoader } from "../lib/mfr/shapes-loader.js";
import { MultiRoomManager } from "../lib/mfr/multi-room-manager.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import {
  LingueNegotiator,
  LANGUAGE_MODES
} from "../lib/lingue/index.js";
import {
  HumanChatHandler,
  ModelFirstRdfHandler,
  ModelNegotiationHandler,
  ShaclValidationHandler
} from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

// Load coordinator profile
const profileName = process.env.AGENT_PROFILE || "coordinator";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Coordinator agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error(
    "Coordinator agent profile is missing nickname or XMPP username"
  );
}

// XMPP configuration
const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: fileConfig.xmpp?.tlsRejectUnauthorized ?? false }
};

if (
  !XMPP_CONFIG.service ||
  !XMPP_CONFIG.domain ||
  !XMPP_CONFIG.username ||
  !XMPP_CONFIG.password
) {
  throw new Error(
    "Coordinator XMPP config incomplete; check profile file and secrets.json"
  );
}

const MUC_ROOM = fileConfig.roomJid;
const BOT_NICKNAME = fileConfig.nickname;

// MFR configuration
const mfrConfig = fileConfig.mfrConfig || {};
const mfrRooms = fileConfig.mfrRooms || {
  construct: "mfr-construct@conference.tensegrity.it",
  validate: "mfr-validate@conference.tensegrity.it",
  reason: "mfr-reason@conference.tensegrity.it"
};

logger.info(`Coordinator MFR Configuration:`);
logger.info(`  Shapes Path: ${mfrConfig.shapesPath || "vocabs/mfr-shapes.ttl"}`);
logger.info(`  Multi-Room: ${mfrConfig.enableMultiRoom !== false}`);
logger.info(`  Construct Room: ${mfrRooms.construct}`);
logger.info(`  Validate Room: ${mfrRooms.validate}`);
logger.info(`  Reason Room: ${mfrRooms.reason}`);

// Create MFR components
const modelStore = new MfrModelStore({ logger });
const shapesLoader = new ShapesLoader({ logger });
const merger = new MfrModelMerger({ logger });

// Load SHACL shapes
const shapesPath = mfrConfig.shapesPath || "vocabs/mfr-shapes.ttl";
let validator = null;

try {
  const shapesGraph = await shapesLoader.loadShapes(shapesPath);
  validator = new MfrShaclValidator({ shapesGraph, logger });
  logger.info(`Loaded SHACL shapes from ${shapesPath}`);
} catch (error) {
  logger.warn(`Failed to load SHACL shapes: ${error.message}`);
  logger.warn(`Coordinator will start without validation capability`);
}

// Create agent registry (for tracking expected contributions)
const agentRegistry = new Map();
// Populate from agent roster
for (const agentNick of agentRoster) {
  agentRegistry.set(agentNick.toLowerCase(), { nickname: agentNick });
}

// Create provider
const provider = new CoordinatorProvider({
  modelStore,
  validator,
  merger,
  shapesLoader,
  agentRegistry,
  negotiator: null,
  primaryRoomJid: MUC_ROOM,
  logger
});

// Create Lingue handlers
const handlers = {};

if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}

if (profile.supportsLingueMode(LANGUAGE_MODES.MODEL_FIRST_RDF)) {
  handlers[LANGUAGE_MODES.MODEL_FIRST_RDF] = new ModelFirstRdfHandler({
    logger,
    onPayload: async ({ payload, summary, from, metadata }) => {
      // Handle RDF contributions
      return await provider.handleContribution(payload, {
        ...metadata,
        sender: from
      });
    }
  });
}

if (profile.supportsLingueMode(LANGUAGE_MODES.MODEL_NEGOTIATION)) {
  handlers[LANGUAGE_MODES.MODEL_NEGOTIATION] = new ModelNegotiationHandler({
    logger,
    onPayload: async ({ payload, summary, from, metadata }) => {
      // Handle negotiation messages
      logger.debug(
        `Received negotiation message from ${from}: ${payload.messageType}`
      );
      return await provider.handleNegotiationPayload(payload, {
        ...metadata,
        sender: from
      });
    }
  });
}

if (profile.supportsLingueMode(LANGUAGE_MODES.SHACL_VALIDATION)) {
  handlers[LANGUAGE_MODES.SHACL_VALIDATION] = new ShaclValidationHandler({
    logger
  });
}

// Create negotiator
const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

provider.negotiator = negotiator;

// Create agent runner
const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: coordinatorCommandParser,
  allowSelfMessages: false,
  respondToAll: true,  // Coordinator should process all commands in room
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

// Create multi-room manager after runner starts
let multiRoomManager = null;

async function start() {
  console.log(`Starting Coordinator agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Primary Room: ${MUC_ROOM}`);
  console.log(
    `MFR Rooms: construct=${mfrRooms.construct}, validate=${mfrRooms.validate}, reason=${mfrRooms.reason}`
  );

  await runner.start();

  // Initialize multi-room manager if enabled
  if (mfrConfig.enableMultiRoom !== false && runner.agent?.xmpp) {
    multiRoomManager = new MultiRoomManager({
      xmppClient: runner.agent.xmpp,
      rooms: mfrRooms,
      nickname: BOT_NICKNAME,
      logger
    });

    // Join all MFR rooms
    try {
      await multiRoomManager.joinAllRooms();
      logger.info(`Joined all MFR rooms`);

      // Inject multi-room manager into provider
      provider.multiRoomManager = multiRoomManager;
    } catch (error) {
      logger.error(`Failed to join MFR rooms: ${error.message}`);
    }
  }

  console.log(`Coordinator agent ready`);
}

async function stop() {
  console.log("Stopping Coordinator agent...");

  // Leave MFR rooms
  if (multiRoomManager) {
    await multiRoomManager.leaveAllRooms().catch((err) => {
      logger.warn(`Error leaving MFR rooms: ${err.message}`);
    });
  }

  await runner.stop();
  console.log("Coordinator agent stopped");
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
  console.error("Failed to start Coordinator agent:", err);
  process.exit(1);
});
