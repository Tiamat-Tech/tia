import { SememClient } from "../../lib/semem-client.js";
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";

export class RecorderProvider {
  constructor({ sememConfig, botNickname, logger = console }) {
    this.client = new SememClient(sememConfig);
    this.botNickname = botNickname;
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

  async handle({ command, content, rawMessage, metadata }) {
    const text = content || rawMessage || "";

    // Always store the message via tell
    try {
      await this.client.tell(text, { metadata: this.buildMetadata(metadata) });
    } catch (err) {
      this.logger.error("Recorder /tell failed:", err.message);
    }

    // Optional IBIS summary
    const structure = detectIBISStructure(text);
    if (structure.confidence >= 0.5 && (structure.issues.length || structure.positions.length || structure.arguments.length)) {
      try {
        const summary = summarizeIBIS(structure);
        await this.client.tell(`IBIS Summary: ${summary}`, { metadata: this.buildMetadata(metadata) });
      } catch (err) {
        this.logger.error("Recorder IBIS summary failed:", err.message);
      }
    }

    // Recorder doesn't need to reply unless explicitly asked
    if (command === "ask" || command === "chat") {
      return "Recorded.";
    }
    return null;
  }
}

export default RecorderProvider;
