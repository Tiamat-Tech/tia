import { SememClient } from "../../lib/semem-client.js";
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";

export class RecorderProvider {
  constructor({ sememConfig, botNickname, logger = console }) {
    if (!sememConfig?.baseUrl) {
      throw new Error("RecorderProvider requires sememConfig.baseUrl");
    }
    this.client = new SememClient(sememConfig);
    this.botNickname = botNickname;
    this.logger = logger;
    this.minutes = [];
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

    // Read-back request
    if (command === "ask" || text.toLowerCase().includes("minutes")) {
      if (this.minutes.length === 0) {
        return "No minutes recorded yet.";
      }
      const summary = this.minutes.map((m, idx) => `${idx + 1}. ${m.kind}: ${m.text}`).join("\n");
      return `Minutes:\n${summary}`;
    }

    const structure = detectIBISStructure(text);
    const hasIbis =
      structure.confidence >= 0.5 &&
      (structure.issues.length || structure.positions.length || structure.arguments.length);

    if (!hasIbis) {
      // Ignore non-IBIS messages for recording
      return null;
    }

    // Record issues/positions/arguments
    const readItemText = (item) => item?.text || item?.label || item?.value || "Unlabeled";
    structure.issues.forEach((i) => this.minutes.push({ kind: "Issue", text: readItemText(i), sender: metadata.sender }));
    structure.positions.forEach((p) => this.minutes.push({ kind: "Position", text: readItemText(p), sender: metadata.sender }));
    structure.arguments.forEach((a) => this.minutes.push({ kind: "Argument", text: readItemText(a), sender: metadata.sender }));

    // Store to Semem
    try {
      const summary = summarizeIBIS(structure);
      await this.client.tell(`IBIS: ${summary}`, { metadata: this.buildMetadata(metadata) });
    } catch (err) {
      this.logger.error("Recorder /tell failed:", err.message);
    }

    return null;
  }
}

export default RecorderProvider;
