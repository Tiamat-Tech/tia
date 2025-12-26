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
  }

  /**
   * Update the system prompt at runtime
   * @param {string} newPrompt - The new system prompt to use
   */
  updateSystemPrompt(newPrompt) {
    this.logger.info?.(`[GolemProvider] System prompt updated to: ${newPrompt.substring(0, 100)}...`);
    this.systemPrompt = newPrompt;
    // Clear systemTemplate so buildSystemPrompt uses the new systemPrompt
    this.systemTemplate = null;
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
}

export default GolemProvider;
