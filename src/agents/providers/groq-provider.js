import Groq from "groq-sdk";
import { BaseLLMProvider } from "./base-llm-provider.js";

/**
 * Groq AI provider implementation
 * Extends BaseLLMProvider with Groq-specific API integration
 */
export class GroqProvider extends BaseLLMProvider {
  constructor({
    apiKey,
    model = "llama-3.3-70b-versatile",
    nickname = "GroqBot",
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
  }

  /**
   * Initialize Groq API client
   */
  initializeClient(apiKey) {
    return new Groq({ apiKey });
  }

  /**
   * Complete chat request using Groq API
   */
  async completeChatRequest({ messages, maxTokens, temperature }) {
    return await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: maxTokens,
      temperature
    });
  }

  /**
   * Extract response text from Groq API response
   */
  extractResponseText(response) {
    return response.choices[0]?.message?.content?.trim() || null;
  }
}

export default GroqProvider;
