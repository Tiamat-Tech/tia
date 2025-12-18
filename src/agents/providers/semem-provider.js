import { SememClient } from "../../lib/semem-client.js";

export class SememProvider {
  constructor({ sememConfig, botNickname, chatFeatures = {}, logger = console }) {
    this.client = new SememClient(sememConfig);
    this.botNickname = botNickname;
    this.chatFeatures = chatFeatures;
    this.logger = logger;
  }

  buildMetadata(metadata) {
    return {
      sender: metadata.sender,
      channel: metadata.type,
      room: metadata.type === "groupchat" ? metadata.roomJid : metadata.sender,
      agent: this.botNickname
    };
  }

  async handle({ command, content, metadata, reply }) {
    try {
      if (command === "tell") {
        if (!content) return "Nothing to store. Usage: Semem tell <text>";
        await this.client.tell(content, { metadata: this.buildMetadata(metadata) });
        return "Stored in Semem via /tell.";
      }

      if (command === "ask") {
        if (!content) return "Nothing to ask. Usage: Semem ask <question>";
        const question = `${content}\n\nKeep responses brief.`;
        const result = await this.client.ask(question, { useContext: true });
        return result?.content || result?.answer || "No answer returned.";
      }

      if (command === "augment") {
        if (!content) return "Nothing to augment. Usage: Semem augment <text>";
        const target = `${content}\n\nKeep responses brief.`;
        const result = await this.client.augment(target);
        return result?.success ? "Augment completed and stored." : "Augment did not report success.";
      }

      // Default: chat
      const chatPrompt = `${content}\n\nKeep responses brief.`;
      const response = await this.client.chatEnhanced(chatPrompt, this.chatFeatures);
      const replyText =
        response?.content || response?.answer || "I could not get a response from Semem just now.";

      // Mirror into tell (best-effort)
      this.client
        .tell(`Query: ${content}\nAnswer: ${replyText}`, {
          metadata: this.buildMetadata(metadata)
        })
        .catch((err) => this.logger.error("Semem /tell failed:", err.message));

      return replyText;
    } catch (error) {
      this.logger.error("Semem provider error:", error.message);
      return "Semem is unavailable right now. Please try again shortly.";
    }
  }
}

export default SememProvider;
