import { BaseProvider } from "tia-agents";

/**
 * Simple provider template - minimal implementation
 * This shows the basic structure of a provider.
 *
 * A provider must implement the handle() method which receives:
 * - command: The command type ("chat", "ask", "tell", etc.)
 * - content: The message content (without command prefix)
 * - metadata: Information about the sender and message
 * - reply: Async function for multi-part responses
 * - rawMessage: The original full message
 *
 * The handle() method should return a string (the response) or null/falsy for silent operation.
 */
export class SimpleProviderTemplate extends BaseProvider {
  constructor({ nickname = "Bot", logger = console } = {}) {
    super();
    this.nickname = nickname;
    this.logger = logger;
  }

  async handle({ command, content, metadata, reply }) {
    this.logger.info(`Received command: ${command}, content: ${content}`);

    // Only respond to chat commands
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "bot: <your message>"`;
    }

    // Extract sender from metadata
    const sender = metadata.sender || "someone";

    // Simple echo response
    return `@${sender} You said: ${content}`;
  }
}
