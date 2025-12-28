import { Mistral } from "@mistralai/mistralai";
import { BaseLLMProvider } from "./base-llm-provider.js";

/**
 * Mistral AI provider implementation
 * Extends BaseLLMProvider with Mistral-specific API integration
 */
export class MistralProvider extends BaseLLMProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    systemPrompt = null,
    systemTemplate = null,
    historyStore = null,
    lingueEnabled = true,
    lingueConfidenceMin = 0.5,
    ibisSummaryEnabled = false,
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
      ibisSummaryEnabled,
      discoFeatures,
      xmppClient,
      logger
    });
  }

  /**
   * Initialize Mistral API client
   */
  initializeClient(apiKey) {
    return new Mistral({ apiKey });
  }

  /**
   * Complete chat request using Mistral API
   */
  async completeChatRequest({ messages, maxTokens, temperature }) {
    return await this.client.chat.complete({
      model: this.model,
      messages,
      maxTokens,
      temperature
    });
  }

  /**
   * Extract response text from Mistral API response
   */
  extractResponseText(response) {
    return response.choices[0]?.message?.content?.trim() || null;
  }

}

export default MistralProvider;
