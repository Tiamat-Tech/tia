import { MFR_MESSAGE_TYPES, MFR_PHASES } from "./constants.js";
import {
  loadGolemRoles,
  getRole,
  searchRoles,
  getRolesForPhase
} from "./golem-role-loader.js";

/**
 * Manages Golem agent role assignments within MFR sessions
 */
export class GolemManager {
  constructor({ logger = console, negotiator = null, roleLibrary = null }) {
    this.logger = logger;
    this.negotiator = negotiator;
    this.roleLibrary = roleLibrary; // Will be loaded if null
    this.currentRole = null;
    this.roleHistory = [];
    this.pendingRequests = new Map();
    this.sessionRoles = new Map(); // sessionId -> role assignments
    this._initPromise = null;
  }

  /**
   * Initialize the GolemManager by loading roles if needed
   * @returns {Promise<GolemManager>}
   */
  async initialize() {
    if (!this._initPromise) {
      this._initPromise = this._loadRoles();
    }
    await this._initPromise;
    return this;
  }

  /**
   * Load role library from Turtle file
   * @private
   */
  async _loadRoles() {
    if (!this.roleLibrary) {
      try {
        this.roleLibrary = await loadGolemRoles();
        this.logger.info?.("[GolemManager] Loaded role library from RDF");
      } catch (error) {
        this.logger.error?.(`[GolemManager] Failed to load roles: ${error.message}`);
        this.roleLibrary = {}; // Fallback to empty library
      }
    }
  }

  /**
   * Ensure roles are loaded before operations
   * @private
   */
  async _ensureRoles() {
    if (!this.roleLibrary) {
      await this.initialize();
    }
  }

  /**
   * Get current role information
   */
  getCurrentRole() {
    return this.currentRole;
  }

  /**
   * Get role history
   */
  getRoleHistory() {
    return [...this.roleHistory];
  }

  /**
   * Assign a role to Golem
   */
  async assignRole({
    sessionId,
    domain,
    roleName,
    systemPrompt = null,
    requestingAgent = "coordinator",
    phase = null,
    rationale = null,
    roomJid = null
  }) {
    await this._ensureRoles();

    // Get role from library if not providing custom prompt
    let roleData = null;
    if (!systemPrompt && domain && roleName) {
      roleData = getRole(this.roleLibrary, domain, roleName);
      if (!roleData) {
        this.logger.error?.(`[GolemManager] Unknown role: ${domain}/${roleName}`);
        return null;
      }
      systemPrompt = roleData.systemPrompt;
    }

    if (!systemPrompt) {
      this.logger.error?.(`[GolemManager] No system prompt provided for role assignment`);
      return null;
    }

    const assignment = {
      sessionId,
      domain,
      roleName,
      name: roleData?.name || roleName,
      systemPrompt,
      requestingAgent,
      phase,
      rationale,
      timestamp: new Date().toISOString(),
      capabilities: roleData?.capabilities || []
    };

    this.currentRole = assignment;
    this.roleHistory.push(assignment);

    // Track per session
    if (sessionId) {
      if (!this.sessionRoles.has(sessionId)) {
        this.sessionRoles.set(sessionId, []);
      }
      this.sessionRoles.get(sessionId).push(assignment);
    }

    this.logger.info?.(
      `[GolemManager] Assigned role "${assignment.name}" for session ${sessionId} (requested by ${requestingAgent})`
    );

    // Send role assignment via MODEL_NEGOTIATION
    if (this.negotiator && roomJid) {
      await this.sendRoleAssignment(roomJid, assignment);
    }

    return assignment;
  }

  /**
   * Send role assignment message via Lingue negotiator
   */
  async sendRoleAssignment(roomJid, assignment) {
    try {
      const payload = {
        messageType: MFR_MESSAGE_TYPES.GOLEM_ROLE_ASSIGNMENT,
        sessionId: assignment.sessionId,
        domain: assignment.domain,
        roleName: assignment.roleName,
        roleName: assignment.name,
        systemPrompt: assignment.systemPrompt,
        phase: assignment.phase,
        rationale: assignment.rationale,
        requestingAgent: assignment.requestingAgent,
        timestamp: assignment.timestamp
      };

      await this.negotiator.send(roomJid, {
        mode: "http://purl.org/stuff/lingue/ModelNegotiation",
        payload,
        summary: `Role assignment: ${assignment.name} for Golem`
      });

      this.logger.info?.(`[GolemManager] Sent role assignment to ${roomJid}`);
    } catch (error) {
      this.logger.error?.(`[GolemManager] Failed to send role assignment: ${error.message}`);
    }
  }

  /**
   * Handle assistance request from another agent
   */
  async handleAssistanceRequest({
    requestingAgent,
    sessionId,
    desiredRole,
    context,
    duration = "session-scoped",
    roomJid = null
  }) {
    await this._ensureRoles();

    this.logger.info?.(
      `[GolemManager] Assistance request from ${requestingAgent}: ${desiredRole}`
    );

    // Search for matching role
    const matches = searchRoles(this.roleLibrary, desiredRole);
    if (matches.length === 0) {
      this.logger.warn?.(`[GolemManager] No matching role found for: ${desiredRole}`);
      return null;
    }

    // Use first match
    const role = matches[0];

    // Optionally customize prompt with context
    let systemPrompt = role.systemPrompt;
    if (context) {
      systemPrompt += `\n\nContext: ${context}`;
    }

    const assignment = await this.assignRole({
      sessionId,
      domain: role.domain,
      roleName: role.id,
      systemPrompt,
      requestingAgent,
      phase: role.phase,
      rationale: `Assistance requested by ${requestingAgent}: ${context}`,
      roomJid
    });

    return assignment;
  }

  /**
   * Select optimal role based on problem analysis
   */
  async selectOptimalRole({
    problemDescription,
    currentPhase,
    availableAgents = [],
    sessionId = null,
    roomJid = null
  }) {
    await this._ensureRoles();

    this.logger.info?.(`[GolemManager] Selecting optimal role for phase ${currentPhase}`);

    // Analyze problem domain
    const domain = this.analyzeProblemDomain(problemDescription);
    this.logger.info?.(`[GolemManager] Detected domain: ${domain}`);

    // Get roles suitable for current phase and domain
    const phaseRoles = getRolesForPhase(this.roleLibrary, currentPhase);
    const domainRoles = phaseRoles.filter(r => r.domain === domain);

    if (domainRoles.length === 0) {
      // Fall back to general roles
      this.logger.info?.(`[GolemManager] No domain-specific roles, using general roles`);
      const generalRoles = phaseRoles.filter(r => r.domain === "general");
      if (generalRoles.length > 0) {
        const role = generalRoles[0];
        return await this.assignRole({
          sessionId,
          domain: role.domain,
          roleName: role.id,
          requestingAgent: "coordinator",
          phase: currentPhase,
          rationale: `Auto-selected for ${currentPhase} phase`,
          roomJid
        });
      }
      return null;
    }

    // Check for capability gaps
    const capabilityGaps = this.identifyCapabilityGaps(availableAgents, currentPhase);

    // Select role that fills the most gaps
    const role = this.selectRoleForGaps(domainRoles, capabilityGaps);

    return await this.assignRole({
      sessionId,
      domain: role.domain,
      roleName: role.id,
      requestingAgent: "coordinator",
      phase: currentPhase,
      rationale: `Auto-selected for ${currentPhase} in ${domain} domain`,
      roomJid
    });
  }

  /**
   * Analyze problem description to identify domain
   */
  analyzeProblemDomain(problemDescription) {
    const text = problemDescription.toLowerCase();

    // Medical keywords
    if (
      /\b(patient|symptom|diagnosis|disease|treatment|medical|clinical|therapy|prescription)\b/.test(text)
    ) {
      return "medical";
    }

    // Software keywords
    if (
      /\b(software|system|application|code|api|database|microservice|architecture|deploy)\b/.test(text)
    ) {
      return "software";
    }

    // Scientific keywords
    if (
      /\b(experiment|hypothesis|data|analysis|statistical|physics|chemistry|molecule|quantum)\b/.test(text)
    ) {
      return "scientific";
    }

    // Business keywords
    if (
      /\b(business|strategy|market|revenue|cost|profit|customer|stakeholder|competitive)\b/.test(text)
    ) {
      return "business";
    }

    // Creative keywords
    if (
      /\b(story|narrative|character|plot|creative|novel|script|dialogue|fiction)\b/.test(text)
    ) {
      return "creative";
    }

    // Educational keywords
    if (
      /\b(learning|teaching|curriculum|student|educational|assessment|pedagogy|course)\b/.test(text)
    ) {
      return "educational";
    }

    // Default to general
    return "general";
  }

  /**
   * Identify capability gaps in current agent roster
   */
  identifyCapabilityGaps(availableAgents, phase) {
    // This is a simplified version
    // In production, would analyze agent capabilities more deeply
    const gaps = [];

    // Check if we have constraint identification capabilities
    const hasConstraintIdentifier = availableAgents.some(
      agent => agent.capabilities?.includes("constraint-identification")
    );
    if (!hasConstraintIdentifier && phase === MFR_PHASES.CONSTRAINT_IDENTIFICATION) {
      gaps.push("constraint-identification");
    }

    // Check if we have entity discovery capabilities
    const hasEntityDiscoverer = availableAgents.some(
      agent => agent.capabilities?.includes("entity-discovery")
    );
    if (!hasEntityDiscoverer && phase === MFR_PHASES.ENTITY_DISCOVERY) {
      gaps.push("entity-discovery");
    }

    return gaps;
  }

  /**
   * Select best role to fill capability gaps
   */
  selectRoleForGaps(roles, gaps) {
    if (gaps.length === 0 || roles.length === 0) {
      return roles[0]; // Return first role if no gaps or no roles
    }

    // Find role that covers most gaps
    let bestRole = roles[0];
    let maxCoverage = 0;

    for (const role of roles) {
      const coverage = gaps.filter(gap => role.capabilities.includes(gap)).length;
      if (coverage > maxCoverage) {
        maxCoverage = coverage;
        bestRole = role;
      }
    }

    return bestRole;
  }

  /**
   * Reset Golem to default role
   */
  async resetRole({ sessionId = null, roomJid = null }) {
    this.logger.info?.(`[GolemManager] Resetting Golem to default role`);

    const assignment = await this.assignRole({
      sessionId,
      domain: "general",
      roleName: "systems_thinker",
      requestingAgent: "coordinator",
      phase: null,
      rationale: "Reset to default role",
      roomJid
    });

    return assignment;
  }

  /**
   * Get roles assigned during a session
   */
  getSessionRoles(sessionId) {
    return this.sessionRoles.get(sessionId) || [];
  }

  /**
   * Clear session data
   */
  clearSession(sessionId) {
    this.sessionRoles.delete(sessionId);
    if (this.currentRole?.sessionId === sessionId) {
      this.currentRole = null;
    }
  }
}

export default GolemManager;
