import { BaseProvider } from "./base-provider.js";
import { MfrModelStore } from "../../lib/mfr/model-store.js";
import { MfrModelMerger } from "../../lib/mfr/model-merger.js";
import { PlanningCoordinator } from "./coordinator/planning.js";
import { ConsensusCoordinator } from "./coordinator/consensus.js";
import { ShapesLoader } from "../../lib/mfr/shapes-loader.js";
import { DebateCoordinator } from "./coordinator/debate.js";
import { WorkflowCoordinator } from "./coordinator/workflow.js";
import { MessagingCoordinator } from "./coordinator/messaging.js";
import { SessionTracker } from "./coordinator/session-tracking.js";
import { CoordinatorHelpers } from "./coordinator/helpers.js";
import { CoordinatorCommandRouter } from "./coordinator/command-router.js";
import { MFR_MESSAGE_TYPES, MFR_CONTRIBUTION_TYPES } from "../../lib/mfr/constants.js";
import { LANGUAGE_MODES } from "../../lib/lingue/constants.js";
import { SolutionCoordinator } from "./coordinator/solutions.js";

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
    planningDefaultRoute = null,
    debateTimeoutMs = null,
    contributionTimeoutMs = null,
    allowAgentSenders = [],
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
    this.planningDefaultRoute = planningDefaultRoute;
    this.debateTimeoutMs = debateTimeoutMs;
    this.contributionTimeoutMs = contributionTimeoutMs;
    this.allowAgentSenders = new Set(
      (allowAgentSenders || []).map((sender) => String(sender).toLowerCase()).filter(Boolean)
    );
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
    this.activePlanning = new Map();

    // Golem manager (will be set externally)
    this.golemManager = null;

    this.planning = new PlanningCoordinator(this);
    this.consensus = new ConsensusCoordinator(this);
    this.solutionCoordinator = new SolutionCoordinator(this);
    this.workflow = new WorkflowCoordinator(this);
    this.debate = new DebateCoordinator(this);
    this.messaging = new MessagingCoordinator(this);
    this.sessions = new SessionTracker(this);
    this.helpers = new CoordinatorHelpers(this);
    this.commandRouter = new CoordinatorCommandRouter(this);
  }

  /**
   * Handle coordinator commands
   * @param {Object} params - Command parameters
   * @returns {Promise<string>} Response message
   */
  async handle({ command, content, metadata, reply, rawMessage }) {
    return await this.commandRouter.handle({ command, content, metadata, reply, rawMessage });
  }

  /**
   * Start a new MFR session
   * @param {string} problemDescription - Natural language problem description
   * @param {Object} metadata - Request metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async startMfrSession(problemDescription, metadata, reply) {
    return await this.workflow.startMfrSession(problemDescription, metadata, reply);
  }

  /**
   * Start debate session for tool selection
   * @param {string} problemDescription - Problem description
   * @param {Object} metadata - Message metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async startDebateSession(problemDescription, metadata, reply) {
    return await this.debate.startDebateSession(problemDescription, metadata, reply);
  }

  /**
   * Start consensus session for community answers
   * @param {string} problemDescription - Problem description
   * @param {Object} metadata - Message metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async startConsensusSession(problemDescription, metadata, reply) {
    return await this.consensus.startConsensusSession(problemDescription, metadata, reply);
  }

  async startPlanningSession(problemDescription, metadata, reply) {
    return await this.planning.startPlanningSession(problemDescription, metadata, reply);
  }

  /**
   * Conclude debate and transition to entity discovery
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async concludeDebate(sessionId, { selectedAgents } = {}) {
    return await this.debate.concludeDebate(sessionId, { selectedAgents });
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
        await this.sendLogMessage(summary);
        await this.negotiator.send(roomJid, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: message,
          summary,
          options: { suppressBody: true }
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
    return await this.workflow.handleContribution(content, metadata, reply);
  }

  /**
   * Set timeout for contribution collection phase
   * @param {string} sessionId - Session ID
   */
  setContributionTimeout(sessionId) {
    return this.workflow.setContributionTimeout(sessionId);
  }

  /**
   * Proceed to model merge phase
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async proceedToMerge(sessionId) {
    return await this.workflow.proceedToMerge(sessionId);
  }

  /**
   * Validate the merged model
   * @param {string} sessionIdOrContent - Session ID or content
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Validation result
   */
  async validateModel(sessionIdOrContent, metadata, reply) {
    return await this.workflow.validateModel(sessionIdOrContent, metadata, reply);
  }

  /**
   * Proceed to model validation phase
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} Validation result message
   */
  async proceedToValidation(sessionId) {
    return await this.workflow.proceedToValidation(sessionId);
  }

  /**
   * Initiate constrained reasoning phase
   * @param {string} sessionIdOrContent - Session ID or content
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Response message
   */
  async initiateReasoning(sessionIdOrContent, metadata, reply) {
    return await this.workflow.initiateReasoning(sessionIdOrContent, metadata, reply);
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
    return await this.solutionCoordinator.handleSolutionProposal(payload, metadata);
  }

  shouldExecutePlan(solution) {
    return this.solutionCoordinator.shouldExecutePlan(solution);
  }

  async requestPlanExecution(sessionId, solution, sender) {
    return await this.solutionCoordinator.requestPlanExecution(sessionId, solution, sender);
  }

  async handleExecutionResult(payload, metadata = {}) {
    return await this.solutionCoordinator.handleExecutionResult(payload, metadata);
  }

  async finalizeSolution(sessionId, solution, sender) {
    return await this.solutionCoordinator.finalizeSolution(sessionId, solution, sender);
  }

  async sendSolutionMessage(solutions = [], sessionId = null) {
    return await this.solutionCoordinator.sendSolutionMessage(solutions, sessionId);
  }

  async sendFinalAnswer(sessionId, solutions = []) {
    return await this.solutionCoordinator.sendFinalAnswer(sessionId, solutions);
  }

  formatSolutionEntry(entry, { index = 0, total = 1 } = {}) {
    return this.solutionCoordinator.formatSolutionEntry(entry, { index, total });
  }

  /**
   * Broadcast a structured session complete payload
   * @param {string} sessionId - Session ID
   * @param {Array<Object>} solutions - Solution entries
   */
  async broadcastSessionComplete(sessionId, solutions = []) {
    return await this.solutionCoordinator.broadcastSessionComplete(sessionId, solutions);
  }

  /**
   * Create a concise solution summary for the session
   * @param {string} sessionId - Session ID
   * @param {Array<Object>} solutions - Solution entries
   * @returns {string} Summary text
   */
  summarizeSolutions(sessionId, solutions = []) {
    return this.solutionCoordinator.summarizeSolutions(sessionId, solutions);
  }

  /**
   * Send a status message to the primary room if available
   * @param {string} message - Status message
   * @param {Object} options - { sessionId, system, forceChat }
   */
  async sendStatusMessage(message, { sessionId = null, system = false, forceChat = false } = {}) {
    return await this.messaging.sendStatusMessage(message, { sessionId, system, forceChat });
  }

  async sendLogMessage(message) {
    return await this.messaging.sendLogMessage(message);
  }
  getSessionVerbose(sessionId) {
    return this.messaging.getSessionVerbose(sessionId);
  }

  async maybeReportLingueMode(sessionId, { direction, mode, mimeType, detail }) {
    return await this.messaging.maybeReportLingueMode(sessionId, { direction, mode, mimeType, detail });
  }

  async sendLingueStatusPayload({ message, sessionId }) {
    return await this.messaging.sendLingueStatusPayload({ message, sessionId });
  }

  /**
   * Get session status
   * @param {string} sessionId - Session ID
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} Status message
   */
  async getSessionStatus(sessionId, metadata, reply) {
    return await this.helpers.getSessionStatus(sessionId, metadata, reply);
  }

  getActiveDebateSessionId() {
    return this.debate.getActiveDebateSessionId();
  }

  getActiveConsensusSessionId() {
    return this.sessions.getActiveConsensusSessionId();
  }

  getActivePlanningSessionId() {
    return this.sessions.getActivePlanningSessionId();
  }

  recordConsensusMessage({ body, sender }) {
    return this.sessions.recordConsensusMessage({ body, sender });
  }

  recordPlanningMessage({ body, sender }) {
    return this.sessions.recordPlanningMessage({ body, sender });
  }

  extractConsensusAgents(message) {
    return this.debate.extractConsensusAgents(message);
  }

  async handleDebateConsensus(message, metadata = {}) {
    return await this.debate.handleDebateConsensus(message, metadata);
  }

  recordConsensusEntry(sessionId, message, metadata = {}) {
    this.consensus.recordConsensusEntry(sessionId, message, metadata);
  }

  recordPlanningEntry(sessionId, message, metadata = {}) {
    this.planning.recordPlanningEntry(sessionId, message, metadata);
  }

  maybeConcludePlanning(sessionId) {
    this.planning.maybeConcludePlanning(sessionId);
  }

  async concludePlanning(sessionId, forcedRoute = null) {
    return await this.planning.concludePlanning(sessionId, forcedRoute);
  }

  async assignGolemLogicRole(sessionId, problemDescription) {
    return await this.planning.assignGolemLogicRole(sessionId, problemDescription);
  }

  async concludeConsensus(sessionId) {
    return await this.consensus.concludeConsensus(sessionId);
  }

  async sendConsensusLog(sessionId, debateData, summary) {
    return await this.sessions.sendConsensusLog(sessionId, debateData, summary);
  }

  async sendConsensusDirectPrompts(sessionId, problemDescription) {
    return await this.messaging.sendConsensusDirectPrompts(sessionId, problemDescription);
  }

  /**
   * List all active sessions
   * @param {Object} metadata - Metadata
   * @param {Function} reply - Reply function
   * @returns {Promise<string>} List of sessions
   */
  async listActiveSessions(metadata, reply) {
    return await this.helpers.listActiveSessions(metadata, reply);
  }

  /**
   * Get help message
   * @returns {string} Help text
   */
  getHelpMessage() {
    return this.helpers.getHelpMessage();
  }

  /**
   * Assign optimal Golem role for a session phase
   * @param {string} sessionId - Session ID
   * @param {string} problemDescription - Problem description
   * @param {string} phase - Current MFR phase
   * @returns {Promise<void>}
   */
  async assignGolemRole(sessionId, problemDescription, phase) {
    return await this.helpers.assignGolemRole(sessionId, problemDescription, phase);
  }

  /**
   * Orchestrate a specific protocol phase
   * @param {string} phase - MFR phase
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async orchestratePhase(phase, sessionId) {
    return await this.helpers.orchestratePhase(phase, sessionId);
  }
}

export default CoordinatorProvider;
