import { BaseProvider } from "tia-agents";

/**
 * LLM Provider Template - for integrating with language model APIs
 * This template shows the pattern used by MistralProvider for integrating with LLM APIs.
 *
 * Key features demonstrated:
 * - API client initialization
 * - Conversation history management
 * - System prompts and templates
 * - Error handling
 * - Multi-part responses via reply()
 */
export class LLMProviderTemplate extends BaseProvider {
  constructor({
    apiKey,
    model = "your-default-model",
    nickname = "LLMBot",
    systemPrompt = null,
    historyStore = null,
    logger = console
  }) {
    super();

    if (!apiKey) {
      throw new Error("API key is required");
    }

    // Initialize your LLM client
    // this.client = new YourLLMClient({ apiKey });

    this.apiKey = apiKey;
    this.model = model;
    this.nickname = nickname;
    this.systemPrompt = systemPrompt || `You are ${nickname}, a helpful assistant.`;
    this.historyStore = historyStore;
    this.logger = logger;
  }

  async handle({ command, content, metadata, reply }) {
    // Only respond to chat commands
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "bot: <your message>"`;
    }

    try {
      const sender = metadata.sender || "user";

      // Build conversation history
      const messages = [];

      // Add system prompt
      messages.push({
        role: "system",
        content: this.systemPrompt
      });

      // Add conversation history if available
      if (this.historyStore) {
        const history = await this.historyStore.getHistory();
        for (const entry of history) {
          messages.push({
            role: entry.role === "bot" ? "assistant" : "user",
            content: entry.content
          });
        }
      }

      // Add current user message
      messages.push({
        role: "user",
        content
      });

      // Call your LLM API
      // Example structure (adjust for your specific API):
      // const response = await this.client.chat.complete({
      //   model: this.model,
      //   messages: messages
      // });
      // const aiResponse = response.choices[0].message.content;

      // For this template, we'll simulate a response
      const aiResponse = `This is a simulated response to: "${content}". Replace this with actual LLM API call.`;

      // Store in history if available
      if (this.historyStore) {
        await this.historyStore.addEntry({
          role: "user",
          content,
          sender
        });
        await this.historyStore.addEntry({
          role: "bot",
          content: aiResponse,
          sender: this.nickname
        });
      }

      // Return the response
      return aiResponse;

    } catch (error) {
      this.logger.error("LLM error:", error);
      return `Sorry, I encountered an error: ${error.message}`;
    }
  }
}

/**
 * Example usage with MistralAI (requires @mistralai/mistralai package):
 *
 * import { Mistral } from "@mistralai/mistralai";
 * import { BaseProvider, InMemoryHistoryStore } from "tia-agents";
 *
 * export class MistralProvider extends BaseProvider {
 *   constructor({ apiKey, model = "mistral-small-latest", nickname = "MistralBot", historyStore, logger = console }) {
 *     super();
 *     if (!apiKey) throw new Error("MISTRAL_API_KEY is required");
 *     this.client = new Mistral({ apiKey });
 *     this.model = model;
 *     this.nickname = nickname;
 *     this.historyStore = historyStore || new InMemoryHistoryStore({ maxEntries: 40 });
 *     this.logger = logger;
 *   }
 *
 *   async handle({ command, content, metadata }) {
 *     if (command !== "chat") {
 *       return `${this.nickname} only supports chat`;
 *     }
 *
 *     try {
 *       const messages = [
 *         { role: "system", content: `You are ${this.nickname}, a helpful assistant.` }
 *       ];
 *
 *       const history = await this.historyStore.getHistory();
 *       messages.push(...history.map(h => ({
 *         role: h.role === "bot" ? "assistant" : "user",
 *         content: h.content
 *       })));
 *
 *       messages.push({ role: "user", content });
 *
 *       const response = await this.client.chat.complete({
 *         model: this.model,
 *         messages
 *       });
 *
 *       const aiResponse = response.choices[0].message.content;
 *
 *       await this.historyStore.addEntry({ role: "user", content, sender: metadata.sender });
 *       await this.historyStore.addEntry({ role: "bot", content: aiResponse });
 *
 *       return aiResponse;
 *     } catch (error) {
 *       this.logger.error("Mistral error:", error);
 *       return "Sorry, I encountered an error.";
 *     }
 *   }
 * }
 */
