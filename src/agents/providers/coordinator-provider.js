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
import { LANGUAGE_MODES, LINGUE_NS, MIME_TYPES } from "../../lib/lingue/constants.js";
import { randomUUID } from "crypto";
import { xml } from "@xmpp/client";

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
    negotiator = null,
    primaryRoomJid = null,
    logRoomJid = process.env.LOG_ROOM_JID || "log@conference.tensegrity.it",
    enableDebate = false,
    debateTimeoutMs = null,
    contributionTimeoutMs = null,
    logger = console
  } = {}) {
    super();

    this.modelStore = modelStore || new MfrModelStore({ logger });
    this.validator = validator;
    this.merger = merger || new MfrModelMerger({ logger });
    this.shapesLoader = shapesLoader || new ShapesLoader({ logger });
    this.agentRegistry = agentRegistry;
    this.negotiator = negotiator;
    this.primaryRoomJid = primaryRoomJid;
    this.logRoomJid = logRoomJid;
    this.enableDebate = enableDebate;
    this.debateTimeoutMs = debateTimeoutMs;
    this.contributionTimeoutMs = contributionTimeoutMs;
    this.logger = logger;

    // Active MFR sessions: Map<sessionId, MfrProtocolState>
    this.activeSessions = new Map();

    // Expected contributions tracking: Map<sessionId, Set<agentId>>
    this.expectedContributions = new Map();

    // Solution tracking: Map<sessionId, Array<solution>>
    this.solutions = new Map();

    // Pending plan executions: Map<sessionId, { solution, sender }>
    this.pendingExecutions = new Map();

    // Debate tracking: Map<sessionId, debateData>
    this.activeDebates = new Map();

    // Golem manager (will be set externally)
    this.golemManager = null;
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

        case "mfr-consensus":
          return await this.startConsensusSession(content, metadata, reply);

        case "mfr-debate":
        case "debate":
          if (!this.enableDebate) {
            return "Debate feature not enabled. Use 'mfr-start' to proceed with standard MFR session.";
          }
          return await this.startDebateSession(content, metadata, reply);

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

        default:
          if (command === "chat") {
            const consensusSessionId = this.getActiveConsensusSessionId();
            if (consensusSessionId) {
              this.recordConsensusEntry(consensusSessionId, rawMessage, metadata);
            }
          }
          if (this.enableDebate) {
            const consensusResult = await this.handleDebateConsensus(
              content || rawMessage || "",
              metadata
            );
            if (consensusResult) {
              return consensusResult;
            }
          }
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
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);

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
      startedBy: metadata?.sender,
      verbose,
      quiet
    });

    // Move to entity discovery
    state.transition(MFR_PHASES.ENTITY_DISCOVERY);

    // Assign optimal Golem role for this session
    await this.assignGolemRole(sessionId, problemDescription, MFR_PHASES.ENTITY_DISCOVERY);

    // Broadcast contribution request
    await this.broadcastContributionRequest(sessionId, problemDescription);

    if (quiet) {
      return `MFR session started: ${sessionId}.`;
    }
    return verbose
      ? `MFR session started: ${sessionId}\nWaiting for agent contributions...`
      : `MFR session started: ${sessionId}.`;
  }

  /**
   * Start debate session for tool selection
   * @param {string} problemDescription - Problem description
   * @param {Object} metadata - Message metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async startDebateSession(problemDescription, metadata, reply) {
    const sessionId = randomUUID();
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);

    this.logger.info?.(
      `[CoordinatorProvider] Starting debate session: ${sessionId}`
    );

    // Create protocol state in debate phase
    const state = new MfrProtocolState(sessionId, {
      logger: this.logger,
      initialPhase: MFR_PHASES.PROBLEM_INTERPRETATION
    });
    this.activeSessions.set(sessionId, state);

    // Transition to debate phase
    state.transition(MFR_PHASES.TOOL_SELECTION_DEBATE, {
      problemDescription,
      startedBy: metadata?.sender,
      verbose,
      quiet
    });

    // Store debate metadata
    this.activeDebates.set(sessionId, {
      problemDescription,
      startTime: Date.now(),
      positions: [],
      consensusReached: false,
      selectedAgents: [],
      verbose,
      quiet
    });

    // Format debate issue for Chair and participants
    const debateIssue = quiet
      ? [
        `Session: ${sessionId}`,
        `Issue: Which tools and agents should we use to solve this problem?`,
        `Problem: ${problemDescription}`,
        `Respond with Position/Support/Objection.`,
        ``
      ].join('\n')
      : verbose
      ? [
        `Session: ${sessionId}`,
        ``,
        `Issue: Which tools and agents should we use to solve this problem?`,
        ``,
        `Problem: ${problemDescription}`,
        ``,
        `Available agents:`,
        `  - Mistral: Natural language processing, entity extraction`,
        `  - Data: Wikidata/DBpedia knowledge grounding`,
        `  - Prolog: Logical reasoning, constraint satisfaction`,
        `  - MFR-Semantic: Constraint extraction from domain knowledge`,
        ``,
        `Please contribute:`,
        `  Position: I recommend [agent] because...`,
        `  Support: [agent] would help because...`,
        `  Objection: [agent] may not work because...`,
        ``
      ].join('\n')
      : [
        `Session: ${sessionId}`,
        `Issue: Which tools and agents should we use to solve this problem?`,
        `Problem: ${problemDescription}`,
        `Available agents: Mistral, Data, Prolog, MFR-Semantic.`,
        `Respond with Position/Support/Objection.`,
        ``
      ].join('\n');

    // Send debate issue to primary room
    this.logger.info?.(`[CoordinatorProvider] Sending debate issue to room: ${this.primaryRoomJid}`);
    this.logger.debug?.(`[CoordinatorProvider] Debate issue text: ${debateIssue.substring(0, 100)}...`);
    await this.sendStatusMessage(debateIssue, { forceChat: true });

    if (!Number.isFinite(this.debateTimeoutMs)) {
      throw new Error("Debate timeout missing or invalid; check profile mfrConfig.");
    }

    // Set timeout for debate phase
    setTimeout(async () => {
      await this.concludeDebate(sessionId);
    }, this.debateTimeoutMs);

    const debateSeconds = Math.round(this.debateTimeoutMs / 1000);
    if (quiet) {
      return `Debate started: ${sessionId}.`;
    }
    return verbose
      ? `Debate session started: ${sessionId}\n\nDebate window: ${debateSeconds} seconds\nType positions and arguments or wait for Chair to detect consensus.`
      : `Debate started: ${sessionId}. Window: ${debateSeconds}s.`;
  }

  /**
   * Start consensus session for community answers
   * @param {string} problemDescription - Problem description
   * @param {Object} metadata - Message metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async startConsensusSession(problemDescription, metadata, reply) {
    const sessionId = randomUUID();
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);

    this.logger.info?.(
      `[CoordinatorProvider] Starting consensus session: ${sessionId}`
    );

    const state = new MfrProtocolState(sessionId, {
      logger: this.logger,
      initialPhase: MFR_PHASES.PROBLEM_INTERPRETATION
    });
    this.activeSessions.set(sessionId, state);

    state.transition(MFR_PHASES.CONSENSUS_DISCOVERY, {
      problemDescription,
      startedBy: metadata?.sender,
      verbose,
      quiet
    });

    this.activeDebates.set(sessionId, {
      mode: "consensus",
      problemDescription,
      startTime: Date.now(),
      positions: [],
      rawMessages: [],
      consensusReached: false,
      selectedAgents: [],
      verbose,
      quiet
    });

    const agentMentions = Array.from(this.agentRegistry.values() || [])
      .map((entry) => entry?.nickname)
      .filter(Boolean)
      .filter((name) => name.toLowerCase() !== "coordinator")
      .map((name) => `@${name}`)
      .join(" ");

    const consensusIssue = [
      `Session: ${sessionId}`,
      `Issue: Please provide Position/Support/Objection for the following question.`,
      `Question: ${problemDescription}`,
      agentMentions ? `Agents: ${agentMentions}` : null,
      agentMentions ? `Agents listed above: reply in this room with "Position:", "Support:", or "Objection:" (one or more lines).` : null,
      `Respond with Position/Support/Objection.`,
      ``
    ].filter(Boolean).join("\n");

    await this.sendStatusMessage(consensusIssue, { forceChat: true });

    if (!Number.isFinite(this.debateTimeoutMs)) {
      throw new Error("Consensus timeout missing or invalid; check profile mfrConfig.");
    }

    setTimeout(async () => {
      await this.concludeConsensus(sessionId);
    }, this.debateTimeoutMs);

    const consensusSeconds = Math.round(this.debateTimeoutMs / 1000);
    if (quiet) {
      return `Consensus started: ${sessionId}.`;
    }
    return verbose
      ? `Consensus session started: ${sessionId}\n\nWindow: ${consensusSeconds} seconds\nWaiting for Position/Support/Objection entries...`
      : `Consensus started: ${sessionId}. Window: ${consensusSeconds}s.`;
  }

  /**
   * Conclude debate and transition to entity discovery
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async concludeDebate(sessionId, { selectedAgents } = {}) {
    const state = this.activeSessions.get(sessionId);
    const debateData = this.activeDebates.get(sessionId);

    if (!state || !debateData) {
      this.logger.warn?.(`[CoordinatorProvider] No active debate for ${sessionId}`);
      return;
    }

    // Check if already concluded
    if (!state.isPhase(MFR_PHASES.TOOL_SELECTION_DEBATE)) {
      return;
    }

    this.logger.info?.(
      `[CoordinatorProvider] Concluding debate for ${sessionId}`
    );

    if (debateData.mode === "consensus") {
      await this.concludeConsensus(sessionId);
      return;
    }

    // For now, proceed with all agents (consensus detection to be added with Chair integration)
    const selected = Array.isArray(selectedAgents) && selectedAgents.length > 0
      ? selectedAgents
      : (debateData.selectedAgents || []);
    const hasSelection = selected.length > 0;
    const message = debateData.consensusReached
      ? `${hasSelection ? `Consensus reached. Selected agents: ${selected.join(", ")}.` : "Consensus reached."}`
      : "Debate timeout reached. Proceeding with all available agents.";

    await this.sendStatusMessage(message, { sessionId, system: true });

    // Create model
    await this.modelStore.createModel(sessionId, debateData.problemDescription);

    // Transition to entity discovery
    state.transition(MFR_PHASES.ENTITY_DISCOVERY);

    // Broadcast contribution request (same as normal MFR session)
    await this.broadcastContributionRequest(sessionId, debateData.problemDescription, selected);

    // Clean up debate data
    this.activeDebates.delete(sessionId);
  }

  /**
   * Broadcast model contribution request to all agents
   * @param {string} sessionId - Session ID
   * @param {string} problemDescription - Problem description
   * @returns {Promise<void>}
   */
  async broadcastContributionRequest(sessionId, problemDescription, requestedAgents = null) {
    this.logger.debug?.(
      `[CoordinatorProvider] Broadcasting contribution request for ${sessionId}`
    );

    await this.maybeReportLingueMode(sessionId, {
      direction: "->",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "ModelContributionRequest"
    });

    const message = {
      messageType: MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST,
      sessionId,
      problemDescription,
      verbose: this.getSessionVerbose(sessionId),
      requestedAgents: Array.isArray(requestedAgents) && requestedAgents.length > 0
        ? requestedAgents
        : undefined,
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

    if (this.negotiator && targetRooms.size > 0) {
      const summary = `MFR contribution request for ${sessionId}`;
      for (const roomJid of targetRooms) {
        await this.negotiator.send(roomJid, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: message,
          summary
        });
      }
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
      this.logger.warn?.(
        `[CoordinatorProvider] Ignoring contribution for unknown session ${sessionId}`
      );
      return null;
    }

    const agentId = metadata?.sender || "unknown";

    this.logger.debug?.(
      `[CoordinatorProvider] Receiving contribution from ${agentId} for ${sessionId}`
    );

    await this.maybeReportLingueMode(sessionId, {
      direction: "<-",
      mode: LANGUAGE_MODES.MODEL_FIRST_RDF,
      mimeType: "text/turtle",
      detail: `ModelFirstRDF from ${agentId}`
    });

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

    return null;
  }

  /**
   * Set timeout for contribution collection phase
   * @param {string} sessionId - Session ID
   */
  setContributionTimeout(sessionId) {
    if (!Number.isFinite(this.contributionTimeoutMs)) {
      throw new Error("Contribution timeout missing or invalid; check profile mfrConfig.");
    }
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
    }, this.contributionTimeoutMs);
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

    // Debug: Check what's in the model
    const quadCount = RdfUtils.countQuads(model);
    const modelUri = `http://purl.org/stuff/mfr/model/${sessionId}`;
    const hasEntityPredicate = `http://purl.org/stuff/mfr/hasEntity`;
    const entityLinks = RdfUtils.queryBySubject(model, modelUri).filter(
      q => q.predicate.value === hasEntityPredicate
    );
    this.logger.info?.(
      `[CoordinatorProvider] Model has ${quadCount} quads, ${entityLinks.length} hasEntity links`
    );

    // Validate
    const report = await this.validator.validateCompleteness(model);

    // Check for conflicts
    const conflicts = await this.merger.detectConflicts(model);

    // Check if we have only non-critical violations
    const hasErrors = report.violations.some(v => {
      const severity = this.validator.normalizeTerm(v.resultSeverity);
      return severity === "Violation" || severity === "http://www.w3.org/ns/shacl#Violation";
    });

    if (report.conforms && conflicts.length === 0) {
      // Valid model, no conflicts - proceed to reasoning
      state.transition(MFR_PHASES.CONSTRAINED_REASONING);

      const message = `Model validation passed for ${sessionId}\n${RdfUtils.countQuads(model)} quads validated\nProceeding to reasoning phase...`;

      this.logger.info?.(`[CoordinatorProvider] ${message}`);
      await this.sendStatusMessage(message, { sessionId, system: true });

      const reasoningMessage = await this.initiateReasoning(sessionId, {}, () => {});
      if (reasoningMessage) {
        await this.sendStatusMessage(reasoningMessage, { sessionId, system: true });
      }

      return message;
    } else if (!hasErrors && conflicts.length === 0) {
      // Only warnings/info, no conflicts - proceed with caution
      state.transition(MFR_PHASES.CONSTRAINED_REASONING);

      const summary = this.validator.formatValidationSummary(report);
      const message = `Model validation completed with warnings for ${sessionId}:\n${summary}\n\nProceeding to reasoning phase...`;

      this.logger.info?.(`[CoordinatorProvider] ${message}`);
      await this.sendStatusMessage(message, { sessionId, system: true });

      const reasoningMessage = await this.initiateReasoning(sessionId, {}, () => {});
      if (reasoningMessage) {
        await this.sendStatusMessage(reasoningMessage, { sessionId, system: true });
      }

      return message;
    } else {
      // Validation errors or conflicts detected
      state.transition(MFR_PHASES.CONFLICT_NEGOTIATION, {
        report,
        conflicts
      });

      const summary = this.validator.formatValidationSummary(report);
      const conflictSummary =
        conflicts.length > 0
          ? `\n\nDetected ${conflicts.length} conflict(s):\n${conflicts.map((c) => `- ${c.message}`).join("\n")}`
          : "";

      const message = `Model validation issues for ${sessionId}:\n${summary}${conflictSummary}`;
      await this.sendStatusMessage(message, { sessionId, system: true });
      return message;
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

    await this.maybeReportLingueMode(sessionId, {
      direction: "->",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "SolutionRequest"
    });

    // Get validated model
    const model = await this.modelStore.getModel(sessionId);
    const modelTurtle = await RdfUtils.serializeTurtle(model);

    // Broadcast solution request
    const message = {
      messageType: MFR_MESSAGE_TYPES.SOLUTION_REQUEST,
      sessionId,
      model: modelTurtle,
      verbose: this.getSessionVerbose(sessionId),
      timestamp: new Date().toISOString()
    };

    const targetRooms = new Set();

    if (this.primaryRoomJid) {
      targetRooms.add(this.primaryRoomJid);
    }

    if (this.negotiator && targetRooms.size > 0) {
      const summary = `MFR solution request for ${sessionId}`;
      this.logger.info?.(
        `[CoordinatorProvider] Broadcasting solution request to ${targetRooms.size} room(s)`
      );
      for (const roomJid of targetRooms) {
        this.logger.info?.(
          `[CoordinatorProvider] Sending solution request to ${roomJid}`
        );
        await this.negotiator.send(roomJid, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: message,
          summary
        });
      }
    }

    return `Solution request broadcast for ${sessionId}\nWaiting for agent solutions...`;
  }

  /**
   * Handle negotiation payloads (solution proposals, etc.)
   * @param {Object} payload - Negotiation payload
   * @param {Object} metadata - Metadata (sender, etc.)
   * @returns {Promise<string|null>} Optional response string
   */
  async handleNegotiationPayload(payload, metadata = {}) {
    const messageType = payload?.messageType;
    if (messageType === MFR_MESSAGE_TYPES.SOLUTION_PROPOSAL) {
      return await this.handleSolutionProposal(payload, metadata);
    }
    if (messageType === MFR_MESSAGE_TYPES.PLAN_EXECUTION_REQUEST) {
      const sessionId = payload?.sessionId || metadata?.sessionId;
      const detail = payload?.program && payload?.query
        ? "PlanExecutionRequest (Prolog program + query)"
        : "PlanExecutionRequest";
      await this.maybeReportLingueMode(sessionId, {
        direction: "<-",
        mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
        mimeType: "application/json",
        detail
      });
      return null;
    }
    if (messageType === MFR_MESSAGE_TYPES.PLAN_EXECUTION_RESULT) {
      return await this.handleExecutionResult(payload, metadata);
    }
    return null;
  }

  /**
   * Track and synthesize solution proposals
   * @param {Object} payload - Solution proposal payload
   * @param {Object} metadata - Metadata including sender
   * @returns {Promise<string|null>} Synthesis summary (if available)
   */
  async handleSolutionProposal(payload, metadata = {}) {
    const sessionId = payload?.sessionId || metadata?.sessionId;
    if (!sessionId) {
      return null;
    }

    const solution = payload?.solution;
    if (!solution) {
      return null;
    }

    const sender = metadata?.sender || "unknown";
    this.logger.info?.(
      `[CoordinatorProvider] Received solution proposal from ${sender} for ${sessionId}`
    );

    await this.maybeReportLingueMode(sessionId, {
      direction: "<-",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: `SolutionProposal from ${sender}`
    });

    if (this.shouldExecutePlan(solution)) {
      const interim = this.formatSolutionEntry({
        sender,
        solution,
        receivedAt: new Date().toISOString()
      });
      await this.sendStatusMessage(interim, { sessionId, system: true });
      await this.requestPlanExecution(sessionId, solution, sender);
      return `Plan received for ${sessionId}. Executing for bindings...`;
    }

    return await this.finalizeSolution(sessionId, solution, sender);
  }

  shouldExecutePlan(solution) {
    return Array.isArray(solution?.plan) &&
      solution.plan.length > 0 &&
      !solution.bindings;
  }

  async requestPlanExecution(sessionId, solution, sender) {
    if (!this.negotiator || !this.primaryRoomJid) {
      return;
    }

    const model = await this.modelStore.getModel(sessionId);
    const modelTurtle = model ? await RdfUtils.serializeTurtle(model) : "";
    const metadata = await this.modelStore.getMetadata(sessionId);
    const problemDescription = metadata?.problemDescription || "";

    this.pendingExecutions.set(sessionId, { solution, sender });

    await this.maybeReportLingueMode(sessionId, {
      direction: "->",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "PlanExecutionRequest (plan only; Prolog program added by Executor)"
    });

    await this.negotiator.send(this.primaryRoomJid, {
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      payload: {
        messageType: MFR_MESSAGE_TYPES.PLAN_EXECUTION_REQUEST,
        sessionId,
        plan: solution.plan,
        problemDescription,
        model: modelTurtle,
        verbose: this.getSessionVerbose(sessionId),
        timestamp: new Date().toISOString()
      },
      summary: `Plan execution request for ${sessionId}`
    });
  }

  async handleExecutionResult(payload, metadata = {}) {
    const sessionId = payload?.sessionId || metadata?.sessionId;
    if (!sessionId) {
      return null;
    }

    const pending = this.pendingExecutions.get(sessionId);
    if (!pending) {
      return null;
    }

    await this.maybeReportLingueMode(sessionId, {
      direction: "<-",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "PlanExecutionResult"
    });

    this.pendingExecutions.delete(sessionId);

    const updatedSolution = {
      ...pending.solution,
      bindings: payload?.bindings || [],
      executionQuery: payload?.query || null,
      executionError: payload?.error || null
    };

    return await this.finalizeSolution(sessionId, updatedSolution, pending.sender);
  }

  async finalizeSolution(sessionId, solution, sender) {
    const existing = this.solutions.get(sessionId) || [];
    existing.push({
      sender,
      solution,
      receivedAt: new Date().toISOString()
    });
    this.solutions.set(sessionId, existing);

    const state = this.activeSessions.get(sessionId);
    if (state && !state.isComplete()) {
      state.transition(MFR_PHASES.COMPLETE, {
        solutionCount: existing.length
      });
    }

    const summary = this.summarizeSolutions(sessionId, existing);
    await this.broadcastSessionComplete(sessionId, existing);
    await this.sendSolutionMessage(existing);
    await this.sendFinalAnswer(sessionId, existing);
    return `MFR session complete: ${sessionId}\n${summary}`;
  }

  async sendSolutionMessage(solutions = []) {
    if (solutions.length === 0) return;

    const lines = ["", "=== SOLUTION ===", ""];
    solutions.forEach((entry, index) => {
      lines.push(this.formatSolutionEntry(entry, { index, total: solutions.length }));
      lines.push("");
    });

    await this.sendStatusMessage(lines.join("\n"), { forceChat: true });
  }

  async sendFinalAnswer(sessionId, solutions = []) {
    const state = this.activeSessions.get(sessionId);
    const problemDescription =
      state?.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION)?.problemDescription || "";
    if (!problemDescription || !/^\\s*Q:\\s*/i.test(problemDescription)) return;

    const answer = deriveSyllogismAnswer(problemDescription);
    if (!answer) {
      const executionError = solutions.find((entry) => entry.solution?.executionError)
        ?.solution?.executionError;
      const fallback = executionError
        ? `Answer: Unable to derive a concise answer (execution error: ${executionError}).`
        : "Answer: Unable to derive a concise answer from the solution.";
      await this.sendStatusMessage(fallback, { sessionId, forceChat: true });
      return;
    }

    await this.sendStatusMessage(`Answer: ${answer}`, { sessionId, forceChat: true });
  }

  formatSolutionEntry(entry, { index = 0, total = 1 } = {}) {
    const solution = entry.solution;
    const sender = entry.sender;
    const lines = [];

    if (total > 1) {
      lines.push(`Solution #${index + 1} (from ${sender}):`);
    } else {
      lines.push(`Solution from ${sender}:`);
    }

    if (solution.message) {
      lines.push(`  ${solution.message}`);
    }

    if (Array.isArray(solution.plan) && solution.plan.length > 0) {
      lines.push(`  Plan steps:`);
      solution.plan.forEach((step, i) => {
        lines.push(`    ${i + 1}. ${step}`);
      });
    }

    if (Array.isArray(solution.bindings) && solution.bindings.length > 0) {
      lines.push(`  Bindings:`);
      solution.bindings.forEach((binding, i) => {
        lines.push(`    ${i + 1}. ${binding}`);
      });
    }

    if (solution.executionError) {
      lines.push(`  Execution error: ${solution.executionError}`);
    }

    if (Array.isArray(solution.satisfiesGoals) && solution.satisfiesGoals.length > 0) {
      lines.push(`  Achieves goals:`);
      solution.satisfiesGoals.forEach((g) => {
        const status = g.satisfied ? "✓" : "✗";
        lines.push(`    ${status} ${g.goal}`);
      });
    }

    if (solution.success === false) {
      lines.push(`  Status: ⚠️  ${solution.message || "Failed to generate solution"}`);
    }

    return lines.join("\n");
  }

  /**
   * Broadcast a structured session complete payload
   * @param {string} sessionId - Session ID
   * @param {Array<Object>} solutions - Solution entries
   */
  async broadcastSessionComplete(sessionId, solutions = []) {
    const payload = {
      messageType: MFR_MESSAGE_TYPES.SESSION_COMPLETE,
      sessionId,
      solutions: solutions.map((entry) => entry.solution),
      timestamp: new Date().toISOString()
    };

    const summary = `Session complete ${sessionId} (${solutions.length} solution(s))`;

    if (this.negotiator && this.primaryRoomJid) {
      await this.negotiator.send(this.primaryRoomJid, {
        mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
        payload,
        summary
      });
    }
  }

  /**
   * Create a concise solution summary for the session
   * @param {string} sessionId - Session ID
   * @param {Array<Object>} solutions - Solution entries
   * @returns {string} Summary text
   */
  summarizeSolutions(sessionId, solutions = []) {
    const lines = [
      `Solutions received: ${solutions.length}`
    ];

    solutions.forEach((entry, index) => {
      const label = entry.solution?.message || "Solution proposal";
      lines.push(`${index + 1}. ${label} (from ${entry.sender})`);

      const plan = entry.solution?.plan;
      if (Array.isArray(plan) && plan.length > 0) {
        lines.push(`   Plan: ${plan.join(", ")}`);
      }
    });

    return lines.join("\n");
  }

  /**
   * Send a status message to the primary room if available
   * @param {string} message - Status message
   * @param {Object} options - { sessionId, system, forceChat }
   */
  async sendStatusMessage(message, { sessionId = null, system = false, forceChat = false } = {}) {
    if (!message) return;
    if (!this.primaryRoomJid || !this.negotiator?.xmppClient) return;

    const verbose = sessionId ? this.getSessionVerbose(sessionId) : true;
    const prefix = system ? "SYS: " : "";

    if (system) {
      await this.sendLingueStatusPayload({ message, sessionId });
    }

    if (forceChat || !system || verbose) {
      await this.negotiator.xmppClient.send(
        xml(
          "message",
          { to: this.primaryRoomJid, type: "groupchat" },
          xml("body", {}, `${prefix}${message}`)
        )
      );
    }
  }

  async sendLogMessage(message) {
    if (!message) return;
    if (!this.logRoomJid || !this.negotiator?.xmppClient) return;
    await this.negotiator.xmppClient.send(
      xml(
        "message",
        { to: this.logRoomJid, type: "groupchat" },
        xml("body", {}, message)
      )
    );
  }

  getSessionVerbose(sessionId) {
    const debateData = this.activeDebates.get(sessionId);
    if (debateData?.verbose) return true;

    const state = this.activeSessions.get(sessionId);
    const problemData = state?.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION);
    if (problemData?.verbose) return true;
    const debatePhase = state?.getPhaseData(MFR_PHASES.TOOL_SELECTION_DEBATE);
    return !!debatePhase?.verbose;
  }

  async maybeReportLingueMode(sessionId, { direction, mode, mimeType, detail }) {
    if (!sessionId || !this.getSessionVerbose(sessionId)) {
      return;
    }
    const modeLabel = mode?.split("/").pop() || mode || "unknown";
    const line = `Lingue ${direction} ${modeLabel} (${mimeType})${detail ? ` — ${detail}` : ""}`;
    this.logger.info?.(`[CoordinatorProvider] ${line} [${sessionId}]`);
    await this.sendStatusMessage(line, { sessionId, system: true, forceChat: true });
  }

  async sendLingueStatusPayload({ message, sessionId }) {
    const payload = JSON.stringify({
      type: "status",
      sessionId,
      message,
      timestamp: new Date().toISOString()
    });
    await this.negotiator.xmppClient.send(
      xml(
        "message",
        { to: this.primaryRoomJid, type: "groupchat" },
        xml("body", {}, ""),
        xml(
          "payload",
          {
            xmlns: LINGUE_NS,
            mime: MIME_TYPES.HUMAN_CHAT,
            mode: LANGUAGE_MODES.HUMAN_CHAT
          },
          payload
        )
      )
    );
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

  getActiveDebateSessionId() {
    let latest = null;
    for (const [sessionId, debateData] of this.activeDebates.entries()) {
      if (debateData.mode === "consensus") {
        continue;
      }
      if (!latest || debateData.startTime > latest.startTime) {
        latest = { sessionId, startTime: debateData.startTime };
      }
    }
    return latest?.sessionId || null;
  }

  getActiveConsensusSessionId() {
    let latest = null;
    for (const [sessionId, debateData] of this.activeDebates.entries()) {
      if (debateData.mode !== "consensus") {
        continue;
      }
      if (!latest || debateData.startTime > latest.startTime) {
        latest = { sessionId, startTime: debateData.startTime };
      }
    }
    return latest?.sessionId || null;
  }

  extractConsensusAgents(message) {
    if (!message) return [];
    const lower = message.toLowerCase();
    const match = lower.match(/consensus reached.*use\s+(.+?)(?:\.|$)/i) ||
      lower.match(/consensus reached.*tools?:\s*(.+?)(?:\.|$)/i);
    if (!match) return [];
    const normalized = match[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace("mfr-semantic", "semantic").replace("mfr semantic", "semantic"));
    return Array.from(new Set(normalized));
  }

  async handleDebateConsensus(message, metadata = {}) {
    const text = (message || "").trim();
    if (!text) return null;
    if (!/consensus reached/i.test(text)) {
      return null;
    }

    const sessionId = this.getActiveDebateSessionId();
    if (!sessionId) {
      return null;
    }

    const debateData = this.activeDebates.get(sessionId);
    if (!debateData) {
      return null;
    }

    const selectedAgents = this.extractConsensusAgents(text);
    debateData.consensusReached = true;
    debateData.selectedAgents = selectedAgents;

    await this.sendStatusMessage(
      selectedAgents.length > 0
        ? `Consensus noted for ${sessionId}. Selected agents: ${selectedAgents.join(", ")}.`
        : `Consensus noted for ${sessionId}.`,
      { sessionId, system: true }
    );

    await this.concludeDebate(sessionId, { selectedAgents });
    if (debateData.quiet) {
      return `Consensus received for ${sessionId}.`;
    }
    return debateData.verbose
      ? `Consensus received for ${sessionId}. Proceeding with contribution requests...`
      : `Consensus received for ${sessionId}.`;
  }

  recordConsensusEntry(sessionId, message, metadata = {}) {
    const debateData = this.activeDebates.get(sessionId);
    if (!debateData || debateData.mode !== "consensus") return;

    const entries = parseConsensusEntries(message || "");
    if (entries.length === 0) {
      const rawMessages = debateData.rawMessages || [];
      if (rawMessages.length < 200) {
        rawMessages.push({
          sender: metadata?.sender || "unknown",
          text: String(message || "").trim(),
          timestamp: new Date().toISOString()
        });
        debateData.rawMessages = rawMessages;
      }
      return;
    }

    entries.forEach((entry) => {
      debateData.positions.push({
        ...entry,
        sender: metadata?.sender || "unknown",
        timestamp: new Date().toISOString()
      });
    });
  }

  async concludeConsensus(sessionId) {
    const state = this.activeSessions.get(sessionId);
    const debateData = this.activeDebates.get(sessionId);

    if (!state || !debateData) {
      this.logger.warn?.(`[CoordinatorProvider] No active consensus for ${sessionId}`);
      return;
    }

    if (!state.isPhase(MFR_PHASES.CONSENSUS_DISCOVERY)) {
      return;
    }

    this.logger.info?.(
      `[CoordinatorProvider] Concluding consensus for ${sessionId}`
    );

    const summary = synthesizeConsensus(debateData);
    const lines = [
      `Consensus session complete: ${sessionId}`,
      `Answer: ${summary.answer || "No clear consensus reached."}`
    ];
    if (summary.support.length > 0) {
      lines.push(`Support: ${summary.support.join(" | ")}`);
    }
    if (summary.objections.length > 0) {
      lines.push(`Objections: ${summary.objections.join(" | ")}`);
    }

    await this.sendStatusMessage(lines.join("\n"), { sessionId, forceChat: true });
    await this.sendConsensusLog(sessionId, debateData, summary);

    state.transition(MFR_PHASES.COMPLETE, {
      consensus: summary.answer || null
    });
    this.activeDebates.delete(sessionId);
  }

  async sendConsensusLog(sessionId, debateData, summary) {
    if (!debateData || debateData.mode !== "consensus") return;
    const question = debateData.problemDescription || "";
    const entries = debateData.positions || [];
    const rawMessages = debateData.rawMessages || [];
    const lines = [
      `[Consensus Log] ${sessionId}`,
      `Question: ${question}`,
      `Answer: ${summary.answer || "No clear consensus reached."}`,
      `Entries: ${entries.length}`,
      ""
    ];

    if (entries.length > 0) {
      lines.push("Parsed entries:");
      entries.forEach((entry, index) => {
        const sender = entry.sender || "unknown";
        const type = entry.type || "note";
        const text = entry.text || "";
        const timestamp = entry.timestamp || "";
        lines.push(`${index + 1}. [${type}] ${sender} ${timestamp}`.trim());
        if (text) {
          lines.push(`   ${text}`);
        }
      });
    }

    if (rawMessages.length > 0) {
      lines.push("", "Raw messages:");
      rawMessages.slice(0, 50).forEach((entry, index) => {
        const sender = entry.sender || "unknown";
        const text = entry.text || "";
        const timestamp = entry.timestamp || "";
        lines.push(`${index + 1}. ${sender} ${timestamp}`.trim());
        if (text) {
          lines.push(`   ${text}`);
        }
      });
    }

    await this.sendLogMessage(lines.join("\n"));
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
    const baseCommands = `MFR Coordinator Commands:
  mfr-start <problem description> - Start new MFR session
  mfr-contribute <sessionId> <rdf> - Submit contribution
  mfr-validate <sessionId> - Validate model
  mfr-solve <sessionId> - Request solutions
  mfr-status <sessionId> - Get session status
  mfr-list - List active sessions`;

    const debateCommand = this.enableDebate
      ? `\n  debate <problem description> - Start debate-driven MFR session (tool selection via Chair)`
      : '';

    return baseCommands + debateCommand;
  }

  /**
   * Assign optimal Golem role for a session phase
   * @param {string} sessionId - Session ID
   * @param {string} problemDescription - Problem description
   * @param {string} phase - Current MFR phase
   * @returns {Promise<void>}
   */
  async assignGolemRole(sessionId, problemDescription, phase) {
    if (!this.golemManager) {
      this.logger.debug?.('[CoordinatorProvider] GolemManager not available, skipping role assignment');
      return;
    }

    try {
      const availableAgents = Array.from(this.agentRegistry.values());
      const roomJid = this.primaryRoomJid;

      const assignment = await this.golemManager.selectOptimalRole({
        problemDescription,
        currentPhase: phase,
        availableAgents,
        sessionId,
        roomJid
      });

      if (assignment) {
        this.logger.info?.(
          `[CoordinatorProvider] Assigned Golem role: ${assignment.name} (${assignment.domain}/${assignment.roleName})`
        );
      }
    } catch (error) {
      this.logger.error?.(`[CoordinatorProvider] Failed to assign Golem role: ${error.message}`);
    }
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

function isVerboseRequest(text) {
  return /(^|\s)-v(\s|$|[.,!?])/i.test(text || "");
}

function isQuietRequest(text) {
  return /(^|\s)-q(\s|$|[.,!?])/i.test(text || "");
}

function deriveSyllogismAnswer(text) {
  const question = String(text || "").replace(/^\s*Q:\s*/i, "").trim();
  const normalized = question.replace(/\s+/g, " ");
  const match = normalized.match(
    /if all (.+?) are (.+?) and no (.+?) are (.+?), can any (.+?) be (.+?)\??$/i
  );
  if (!match) return null;

  const subject1 = match[1];
  const middle1 = match[2];
  const middle2 = match[3];
  const predicate1 = match[4];
  const subject2 = match[5];
  const predicate2 = match[6];

  if (!termsMatch(subject1, subject2)) return null;
  if (!termsMatch(middle1, middle2)) return null;
  if (!termsMatch(predicate1, predicate2)) return null;

  const subject = cleanTerm(subject1);
  const middle = cleanTerm(middle1);
  const predicate = cleanTerm(predicate1);
  return `No. If all ${subject} are ${middle} and no ${middle} are ${predicate}, then no ${subject} are ${predicate}.`;
}

function termsMatch(a, b) {
  return normalizeTerm(a) === normalizeTerm(b);
}

function normalizeTerm(value) {
  const cleaned = cleanTerm(value).toLowerCase();
  const noArticles = cleaned.replace(/\b(a|an|the)\b/g, "").trim();
  if (noArticles.endsWith("s") && !noArticles.endsWith("ss")) {
    return noArticles.slice(0, -1);
  }
  return noArticles;
}

function cleanTerm(value) {
  return String(value || "")
    .trim()
    .replace(/[?.,!]+$/g, "")
    .replace(/\s+/g, " ");
}

function parseConsensusEntries(message) {
  const text = String(message || "").trim();
  if (!text) return [];
  const entries = [];
  const lines = text.split(/\r?\n/);
  const pattern = /^(?:[-*•>]\s*)?(?:\*{1,2})?(position|support|objection)(?:\*{1,2})?\s*[:\-–—]\s*(.+)$/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(pattern);
    if (!match) continue;
    entries.push({
      type: match[1].toLowerCase(),
      text: match[2].trim()
    });
  }
  return entries;
}

function synthesizeConsensus(debateData) {
  const positions = debateData.positions || [];
  const positionCounts = new Map();
  const support = [];
  const objections = [];

  positions.forEach((entry) => {
    if (!entry?.text) return;
    if (entry.type === "position") {
      const key = entry.text.toLowerCase();
      positionCounts.set(key, {
        count: (positionCounts.get(key)?.count || 0) + 1,
        text: entry.text
      });
    } else if (entry.type === "support") {
      if (support.length < 3) support.push(entry.text);
    } else if (entry.type === "objection") {
      if (objections.length < 3) objections.push(entry.text);
    }
  });

  let answer = null;
  if (positionCounts.size > 0) {
    const sorted = Array.from(positionCounts.values()).sort((a, b) => b.count - a.count);
    answer = sorted[0]?.text || null;
  }

  return { answer, support, objections };
}
