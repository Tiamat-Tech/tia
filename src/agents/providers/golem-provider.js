import { MistralProvider } from "./mistral-provider.js";

/**
 * Golem AI provider - a Mistral-based provider with runtime prompt changing
 * Extends MistralProvider to allow system prompt updates during runtime
 */
export class GolemProvider extends MistralProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "Golem",
    systemPrompt = null,
    systemTemplate = null,
    historyStore = null,
    lingueEnabled = true,
    lingueConfidenceMin = 0.5,
    discoFeatures = undefined,
    xmppClient = null,
    logger = console
  }) {
    super({
      apiKey,
      model,
      nickname,
      systemPrompt,
      systemTemplate,
      historyStore,
      lingueEnabled,
      lingueConfidenceMin,
      discoFeatures,
      xmppClient,
      logger
    });

    // Store original prompt for potential reset
    this.originalSystemPrompt = systemPrompt;

    // Track current role information
    this.currentRole = {
      domain: null,
      roleName: null,
      name: "Default Golem",
      sessionId: null,
      assignedBy: null,
      timestamp: null
    };
  }

  /**
   * Update the system prompt at runtime
   * @param {string} newPrompt - The new system prompt to use
   * @param {Object} roleInfo - Optional role metadata
   */
  updateSystemPrompt(newPrompt, roleInfo = {}) {
    this.logger.info?.(`[GolemProvider] System prompt updated to: ${newPrompt.substring(0, 100)}...`);
    this.systemPrompt = newPrompt;
    // Clear systemTemplate so buildSystemPrompt uses the new systemPrompt
    this.systemTemplate = null;

    // Update role information
    if (roleInfo) {
      this.currentRole = {
        domain: roleInfo.domain || this.currentRole.domain,
        roleName: roleInfo.roleName || this.currentRole.roleName,
        name: roleInfo.name || this.currentRole.name,
        sessionId: roleInfo.sessionId || this.currentRole.sessionId,
        assignedBy: roleInfo.assignedBy || this.currentRole.assignedBy,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reset to original system prompt
   */
  resetSystemPrompt() {
    this.logger.info?.(`[GolemProvider] System prompt reset to original`);
    this.systemPrompt = this.originalSystemPrompt;
  }

  /**
   * Get current system prompt
   */
  getCurrentSystemPrompt() {
    return this.buildSystemPrompt();
  }

  /**
   * Get current role information
   */
  getCurrentRole() {
    return {
      ...this.currentRole,
      systemPrompt: this.getCurrentSystemPrompt()
    };
  }

  /**
   * Set role from MFR role assignment
   */
  setRoleFromAssignment(assignment) {
    this.updateSystemPrompt(assignment.systemPrompt, {
      domain: assignment.domain,
      roleName: assignment.roleName,
      name: assignment.name || assignment.roleName,
      sessionId: assignment.sessionId,
      assignedBy: assignment.requestingAgent
    });

    this.logger.info?.(
      `[GolemProvider] Role set to "${this.currentRole.name}" (${assignment.domain}/${assignment.roleName})`
    );
  }
}

export default GolemProvider;
