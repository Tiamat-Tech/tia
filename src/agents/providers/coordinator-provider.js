import { BaseProvider } from "./base-provider.js";
import { MfrModelStore } from "../../lib/mfr/model-store.js";
import { MfrShaclValidator } from "../../lib/mfr/shacl-validator.js";
import { MfrModelMerger } from "../../lib/mfr/model-merger.js";
import { MfrProtocolState } from "../../lib/mfr/protocol-state.js";
import { ShapesLoader } from "../../lib/mfr/shapes-loader.js";
import { RdfUtils } from "../../lib/mfr/rdf-utils.js";
import {
  MFR_PHASES,
  MFR_MESSAGE_TYPES,
  MFR_CONTRIBUTION_TYPES,
  VALIDATION_STATUS
} from "../../lib/mfr/constants.js";
import { LANGUAGE_MODES } from "../../lib/lingue/constants.js";
import { randomUUID } from "crypto";

/**
 * Coordinator provider for MFR protocol orchestration
 */
export class CoordinatorProvider extends BaseProvider {
  constructor({
    modelStore,
    validator,
    merger,
    shapesLoader,
    agentRegistry = new Map(),
    multiRoomManager = null,
    negotiator = null,
    primaryRoomJid = null,
    logger = console
  } = {}) {
    super();

    this.modelStore = modelStore || new MfrModelStore({ logger });
    this.validator = validator;
    this.merger = merger || new MfrModelMerger({ logger });
    this.shapesLoader = shapesLoader || new ShapesLoader({ logger });
    this.agentRegistry = agentRegistry;
    this.multiRoomManager = multiRoomManager;
    this.negotiator = negotiator;
    this.primaryRoomJid = primaryRoomJid;
    this.logger = logger;

    // Active MFR sessions: Map<sessionId, MfrProtocolState>
    this.activeSessions = new Map();

    // Expected contributions tracking: Map<sessionId, Set<agentId>>
    this.expectedContributions = new Map();

    // Solution tracking: Map<sessionId, Array<solution>>
    this.solutions = new Map();
  }

  /**
   * Handle coordinator commands
   * @param {Object} params - Command parameters
   * @returns {Promise<string>} Response message
   */
  async handle({ command, content, metadata, reply, rawMessage }) {
    this.logger.debug?.(`[CoordinatorProvider] Command: ${command}`);

    try {
      switch (command) {
        case "mfr-start":
        case "start":
          return await this.startMfrSession(content, metadata, reply);

        case "mfr-contribute":
        case "contribute":
          return await this.handleContribution(content, metadata, reply);

        case "mfr-validate":
        case "validate":
          return await this.validateModel(content, metadata, reply);

        case "mfr-solve":
        case "solve":
          return await this.initiateReasoning(content, metadata, reply);

        case "mfr-status":
        case "status":
          return await this.getSessionStatus(content, metadata, reply);

        case "mfr-list":
        case "list":
          return await this.listActiveSessions(metadata, reply);

        case "help":
        case "mfr-help":
          return this.getHelpMessage();

        case "chat":
        default:
          // Don't respond to regular chat messages
          return null;
      }
    } catch (error) {
      this.logger.error?.(
        `[CoordinatorProvider] Error handling ${command}: ${error.message}`
      );
      return `Error: ${error.message}`;
    }
  }

  /**
   * Start a new MFR session
   * @param {string} problemDescription - Natural language problem description
   * @param {Object} metadata - Request metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async startMfrSession(problemDescription, metadata, reply) {
    const sessionId = randomUUID();

    this.logger.info?.(
      `[CoordinatorProvider] Starting MFR session: ${sessionId}`
    );

    // Create protocol state
    const state = new MfrProtocolState(sessionId, { logger: this.logger });
    this.activeSessions.set(sessionId, state);

    // Create model
    await this.modelStore.createModel(sessionId, problemDescription);

    // Transition to problem interpretation
    state.transition(MFR_PHASES.PROBLEM_INTERPRETATION, {
      problemDescription,
      startedBy: metadata?.sender
    });

    // Move to entity discovery
    state.transition(MFR_PHASES.ENTITY_DISCOVERY);

    // Broadcast contribution request
    await this.broadcastContributionRequest(sessionId, problemDescription);

    return `MFR session started: ${sessionId}\nWaiting for agent contributions...`;
  }

  /**
   * Broadcast model contribution request to all agents
   * @param {string} sessionId - Session ID
   * @param {string} problemDescription - Problem description
   * @returns {Promise<void>}
   */
  async broadcastContributionRequest(sessionId, problemDescription) {
    this.logger.debug?.(
      `[CoordinatorProvider] Broadcasting contribution request for ${sessionId}`
    );

    const message = {
      messageType: MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST,
      sessionId,
      problemDescription,
      requestedContributions: [
        MFR_CONTRIBUTION_TYPES.ENTITY,
        MFR_CONTRIBUTION_TYPES.CONSTRAINT,
        MFR_CONTRIBUTION_TYPES.ACTION,
        MFR_CONTRIBUTION_TYPES.GOAL
      ],
      timestamp: new Date().toISOString()
    };

    // Track expected contributions
    this.expectedContributions.set(sessionId, new Set());

    const state = this.activeSessions.get(sessionId);
    const phase = state?.getCurrentPhase();
    const targetRooms = new Set();

    if (this.primaryRoomJid) {
      targetRooms.add(this.primaryRoomJid);
    }

    if (this.multiRoomManager) {
      const roomType = this.multiRoomManager.getRoomTypeForPhase(
        phase || MFR_PHASES.ENTITY_DISCOVERY
      );
      const roomJid = this.multiRoomManager.getRoomJid(roomType);
      if (roomJid) {
        targetRooms.add(roomJid);
      }
    }

    if (this.negotiator && targetRooms.size > 0) {
      const summary = `MFR contribution request for ${sessionId}`;
      for (const roomJid of targetRooms) {
        await this.negotiator.send(roomJid, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: message,
          summary
        });
      }
    } else if (this.multiRoomManager) {
      await this.multiRoomManager.broadcastForPhase(
        phase || MFR_PHASES.ENTITY_DISCOVERY,
        JSON.stringify(message)
      );
    }

    // Set timeout for contribution phase
    this.setContributionTimeout(sessionId);
  }

  /**
   * Handle an agent contribution
   * @param {string} content - Contribution content (RDF or message)
   * @param {Object} metadata - Contribution metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async handleContribution(content, metadata, reply) {
    // Extract session ID from metadata or content
    let sessionId = metadata?.sessionId;

    if (!sessionId && typeof content === "object" && content.sessionId) {
      sessionId = content.sessionId;
    }

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    const state = this.activeSessions.get(sessionId);
    if (!state) {
      return `Error: Session ${sessionId} not found`;
    }

    const agentId = metadata?.sender || "unknown";

    this.logger.debug?.(
      `[CoordinatorProvider] Receiving contribution from ${agentId} for ${sessionId}`
    );

    // Parse contribution
    let contributionRdf;
    if (typeof content === "string") {
      contributionRdf = content;
    } else if (content.rdf) {
      contributionRdf = content.rdf;
    } else {
      return "Error: Invalid contribution format";
    }

    // Store contribution
    await this.modelStore.addContribution(
      sessionId,
      agentId,
      contributionRdf,
      metadata
    );

    // Track that we received contribution from this agent
    const expected = this.expectedContributions.get(sessionId);
    if (expected) {
      expected.add(agentId);
    }

    return `Contribution received from ${agentId}`;
  }

  /**
   * Set timeout for contribution collection phase
   * @param {string} sessionId - Session ID
   */
  setContributionTimeout(sessionId) {
    setTimeout(async () => {
      const state = this.activeSessions.get(sessionId);
      if (!state || !state.isActive()) {
        return;
      }

      // Check if we're still waiting for contributions
      if (
        state.isPhase(MFR_PHASES.ENTITY_DISCOVERY) ||
        state.isPhase(MFR_PHASES.CONSTRAINT_IDENTIFICATION) ||
        state.isPhase(MFR_PHASES.ACTION_DEFINITION)
      ) {
        this.logger.info?.(
          `[CoordinatorProvider] Contribution timeout for ${sessionId}, proceeding to merge`
        );

        // Proceed to merge
        await this.proceedToMerge(sessionId);
      }
    }, 30000); // 30 second timeout
  }

  /**
   * Proceed to model merge phase
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async proceedToMerge(sessionId) {
    const state = this.activeSessions.get(sessionId);
    if (!state) return;

    this.logger.info?.(`[CoordinatorProvider] Merging model for ${sessionId}`);

    // Transition to merge phase
    state.transition(MFR_PHASES.MODEL_MERGE);

    // Merge contributions
    const mergedDataset = await this.modelStore.mergeContributions(sessionId);

    const stats = await this.modelStore.getModelStats(sessionId);
    this.logger.debug?.(
      `[CoordinatorProvider] Merged model: ${stats.quadCount} quads from ${stats.contributorCount} contributors`
    );

    // Proceed to validation
    await this.proceedToValidation(sessionId);
  }

  /**
   * Validate the merged model
   * @param {string} sessionIdOrContent - Session ID or content
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Validation result
   */
  async validateModel(sessionIdOrContent, metadata, reply) {
    const sessionId =
      typeof sessionIdOrContent === "string"
        ? sessionIdOrContent
        : sessionIdOrContent?.sessionId || metadata?.sessionId;

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    return await this.proceedToValidation(sessionId);
  }

  /**
   * Proceed to model validation phase
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} Validation result message
   */
  async proceedToValidation(sessionId) {
    const state = this.activeSessions.get(sessionId);
    if (!state) {
      return `Error: Session ${sessionId} not found`;
    }

    this.logger.info?.(
      `[CoordinatorProvider] Validating model for ${sessionId}`
    );

    state.transition(MFR_PHASES.MODEL_VALIDATION);

    // Ensure validator is initialized
    if (!this.validator) {
      const shapesGraph = await this.shapesLoader.loadMfrShapes();
      this.validator = new MfrShaclValidator({
        shapesGraph,
        logger: this.logger
      });
    }

    // Get model
    const model = await this.modelStore.getModel(sessionId);
    if (!model) {
      return `Error: Model not found for session ${sessionId}`;
    }

    // Validate
    const report = await this.validator.validateCompleteness(model);

    // Check for conflicts
    const conflicts = await this.merger.detectConflicts(model);

    if (report.conforms && conflicts.length === 0) {
      // Valid model, proceed to reasoning
      state.transition(MFR_PHASES.CONSTRAINED_REASONING);

      const message = `Model validation passed for ${sessionId}\n${RdfUtils.countQuads(model)} quads validated\nProceeding to reasoning phase...`;

      this.logger.info?.(`[CoordinatorProvider] ${message}`);

      return message;
    } else {
      // Validation failed or conflicts detected
      state.transition(MFR_PHASES.CONFLICT_NEGOTIATION, {
        report,
        conflicts
      });

      const summary = this.validator.formatValidationSummary(report);
      const conflictSummary =
        conflicts.length > 0
          ? `\n\nDetected ${conflicts.length} conflict(s):\n${conflicts.map((c) => `- ${c.message}`).join("\n")}`
          : "";

      return `Model validation issues for ${sessionId}:\n${summary}${conflictSummary}`;
    }
  }

  /**
   * Initiate constrained reasoning phase
   * @param {string} sessionIdOrContent - Session ID or content
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async initiateReasoning(sessionIdOrContent, metadata, reply) {
    const sessionId =
      typeof sessionIdOrContent === "string"
        ? sessionIdOrContent
        : sessionIdOrContent?.sessionId || metadata?.sessionId;

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    const state = this.activeSessions.get(sessionId);
    if (!state) {
      return `Error: Session ${sessionId} not found`;
    }

    if (!state.isPhase(MFR_PHASES.CONSTRAINED_REASONING)) {
      return `Error: Session ${sessionId} is not ready for reasoning (current phase: ${state.getCurrentPhase()})`;
    }

    this.logger.info?.(
      `[CoordinatorProvider] Initiating reasoning for ${sessionId}`
    );

    // Get validated model
    const model = await this.modelStore.getModel(sessionId);
    const modelTurtle = await RdfUtils.serializeTurtle(model);

    // Broadcast solution request
    const message = {
      messageType: MFR_MESSAGE_TYPES.SOLUTION_REQUEST,
      sessionId,
      model: modelTurtle,
      timestamp: new Date().toISOString()
    };

    const targetRooms = new Set();

    if (this.primaryRoomJid) {
      targetRooms.add(this.primaryRoomJid);
    }

    if (this.multiRoomManager) {
      const roomType = this.multiRoomManager.getRoomTypeForPhase(
        MFR_PHASES.CONSTRAINED_REASONING
      );
      const roomJid = this.multiRoomManager.getRoomJid(roomType);
      if (roomJid) {
        targetRooms.add(roomJid);
      }
    }

    if (this.negotiator && targetRooms.size > 0) {
      const summary = `MFR solution request for ${sessionId}`;
      for (const roomJid of targetRooms) {
        await this.negotiator.send(roomJid, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: message,
          summary
        });
      }
    } else if (this.multiRoomManager) {
      await this.multiRoomManager.broadcastForPhase(
        MFR_PHASES.CONSTRAINED_REASONING,
        JSON.stringify(message)
      );
    }

    return `Solution request broadcast for ${sessionId}\nWaiting for agent solutions...`;
  }

  /**
   * Get session status
   * @param {string} sessionId - Session ID
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Status message
   */
  async getSessionStatus(sessionId, metadata, reply) {
    if (!sessionId) {
      sessionId = metadata?.sessionId;
    }

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    const state = this.activeSessions.get(sessionId);
    if (!state) {
      return `Session ${sessionId} not found`;
    }

    const summary = state.getSummary();
    const stats = await this.modelStore.getModelStats(sessionId);

    const lines = [
      `Session: ${sessionId}`,
      `Phase: ${summary.currentPhase}`,
      `Created: ${summary.created}`,
      `Transitions: ${summary.transitionCount}`,
      ""
    ];

    if (stats) {
      lines.push(`Model Statistics:`);
      lines.push(`  Quads: ${stats.quadCount}`);
      lines.push(`  Contributions: ${stats.contributionCount}`);
      lines.push(`  Contributors: ${stats.contributors.join(", ")}`);
    }

    return lines.join("\n");
  }

  /**
   * List all active sessions
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} List of sessions
   */
  async listActiveSessions(metadata, reply) {
    const sessionIds = Array.from(this.activeSessions.keys());

    if (sessionIds.length === 0) {
      return "No active MFR sessions";
    }

    const lines = [`Active MFR Sessions (${sessionIds.length}):`];

    for (const sessionId of sessionIds) {
      const state = this.activeSessions.get(sessionId);
      const summary = state.getSummary();
      lines.push(
        `  - ${sessionId} (${summary.currentPhase}) - created ${summary.created}`
      );
    }

    return lines.join("\n");
  }

  /**
   * Get help message
   * @returns {string} Help text
   */
  getHelpMessage() {
    return `MFR Coordinator Commands:
  mfr-start <problem description> - Start new MFR session
  mfr-contribute <sessionId> <rdf> - Submit contribution
  mfr-validate <sessionId> - Validate model
  mfr-solve <sessionId> - Request solutions
  mfr-status <sessionId> - Get session status
  mfr-list - List active sessions`;
  }

  /**
   * Orchestrate a specific protocol phase
   * @param {string} phase - MFR phase
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async orchestratePhase(phase, sessionId) {
    const state = this.activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    this.logger.debug?.(
      `[CoordinatorProvider] Orchestrating phase ${phase} for ${sessionId}`
    );

    switch (phase) {
      case MFR_PHASES.ENTITY_DISCOVERY:
        await this.broadcastContributionRequest(
          sessionId,
          state.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION)
            ?.problemDescription
        );
        break;

      case MFR_PHASES.MODEL_MERGE:
        await this.proceedToMerge(sessionId);
        break;

      case MFR_PHASES.MODEL_VALIDATION:
        await this.proceedToValidation(sessionId);
        break;

      case MFR_PHASES.CONSTRAINED_REASONING:
        await this.initiateReasoning(sessionId, {}, () => {});
        break;

      default:
        this.logger.warn?.(
          `[CoordinatorProvider] No orchestration defined for phase: ${phase}`
        );
    }
  }
}

export default CoordinatorProvider;
