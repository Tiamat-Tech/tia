import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";

export class ChairProvider {
  constructor({ nickname, logger = console }) {
    if (!nickname) throw new Error("ChairProvider requires a nickname");
    this.nickname = nickname;
    this.logger = logger;
    this.currentIssue = null;
    this.positions = [];
    this.arguments = [];
  }

  updateState(structure, content, sender) {
    if (structure.issues.length) {
      this.currentIssue = structure.issues[0].text || content;
      this.positions = [];
      this.arguments = [];
    }
    structure.positions.forEach((p) => {
      this.positions.push({ text: p.text, sender });
    });
    structure.arguments.forEach((a) => {
      this.arguments.push({ text: a.text, sender });
    });
  }

  summarizeState() {
    const issue = this.currentIssue ? `Issue: ${this.currentIssue}` : "No active issue.";
    const positions =
      this.positions.length > 0
        ? `Positions:\n- ${this.positions.map((p) => p.text).join("\n- ")}`
        : "Positions: (none yet)";
    const argumentsText =
      this.arguments.length > 0
        ? `Arguments:\n- ${this.arguments.map((a) => a.text).join("\n- ")}`
        : "Arguments: (none yet)";
    return `${issue}\n${positions}\n${argumentsText}`;
  }

  async handle({ content, rawMessage, metadata }) {
    const text = content || rawMessage || "";
    const structure = detectIBISStructure(text);

    if (structure.confidence >= 0.5 && (structure.issues.length || structure.positions.length || structure.arguments.length)) {
      this.updateState(structure, text, metadata.sender);
      const summary = summarizeIBIS(structure);
      return `Noted. ${summary}`;
    }

    const lower = text.toLowerCase();
    if (lower.includes("start debate") || lower.startsWith("issue:") || lower.startsWith("i:")) {
      this.currentIssue = text.replace(/^(issue|i):\s*/i, "").trim() || text;
      this.positions = [];
      this.arguments = [];
      return `Debate started. Issue: ${this.currentIssue}\nPlease provide Positions and Arguments.`;
    }

    if (lower.includes("status") || lower.includes("consensus") || lower.includes("summary")) {
      return this.summarizeState();
    }

    // Default prompt to contribute
    return `Please contribute Position: ... or Argument: ...${this.currentIssue ? ` (Issue: ${this.currentIssue})` : ""}`;
  }
}

export default ChairProvider;
