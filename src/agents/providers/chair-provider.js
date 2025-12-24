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
    const lower = text.toLowerCase();

    // Check for MFR debate initiation FIRST (before general IBIS detection)
    // This ensures Coordinator's debate issue gets explicit response
    if (lower.includes("which tools and agents should we use") ||
        lower.includes("available agents:") ||
        (lower.startsWith("issue:") && lower.includes("tools"))) {
      this.currentIssue = text.replace(/^issue:\s*/i, "").trim() || text;
      this.positions = [];
      this.arguments = [];
      return `Debate started. Issue: ${this.currentIssue}\nPlease provide Positions and Arguments.`;
    }

    // Check for explicit debate start commands
    if (lower.includes("start debate") || lower.startsWith("issue:") || lower.startsWith("i:")) {
      this.currentIssue = text.replace(/^(issue|i):\s*/i, "").trim() || text;
      this.positions = [];
      this.arguments = [];
      return `Debate started. Issue: ${this.currentIssue}\nPlease provide Positions and Arguments.`;
    }

    // General IBIS structure detection (for position/argument contributions)
    const structure = detectIBISStructure(text);

    if (structure.confidence >= 0.5 && (structure.issues.length || structure.positions.length || structure.arguments.length)) {
      this.updateState(structure, text, metadata.sender);
      const summary = summarizeIBIS(structure);
      return `Noted. ${summary}`;
    }

    if (lower.includes("status") || lower.includes("consensus") || lower.includes("summary")) {
      return this.summarizeState();
    }

    // NEW: Check for tool consensus request (for MFR debate integration)
    if (lower.includes("tool consensus")) {
      const consensus = this.detectToolConsensus();
      if (consensus.reached) {
        return `${consensus.summary}\nBased on ${this.positions.length} positions and ${this.arguments.length} arguments.`;
      }
      return this.summarizeState();  // Fallback to regular summary
    }

    // Default prompt to contribute
    return `Please contribute Position: ... or Argument: ...${this.currentIssue ? ` (Issue: ${this.currentIssue})` : ""}`;
  }

  /**
   * Extract tool recommendations from positions (MFR debate integration)
   * @returns {Map<string, number>} Tool names and vote counts
   */
  extractToolRecommendations() {
    const MFR_AGENTS = ['mistral', 'data', 'prolog', 'semantic', 'mfr-semantic', 'mfr semantic'];
    const recommendations = new Map();

    this.positions.forEach(position => {
      const text = position.text.toLowerCase();
      MFR_AGENTS.forEach(agent => {
        if (text.includes(agent)) {
          const normalizedAgent = agent.replace('mfr-semantic', 'semantic').replace('mfr semantic', 'semantic');
          recommendations.set(normalizedAgent, (recommendations.get(normalizedAgent) || 0) + 1);
        }
      });
    });

    return recommendations;
  }

  /**
   * Detect if tool consensus has been reached (MFR debate integration)
   * @returns {Object} { reached: boolean, tools?: string[], summary?: string }
   */
  detectToolConsensus() {
    const recommendations = this.extractToolRecommendations();
    const totalPositions = this.positions.length;

    if (totalPositions === 0) {
      return { reached: false };
    }

    // Tools with more than 50% of positions
    const agreedTools = [];
    for (const [tool, count] of recommendations) {
      if (count > totalPositions / 2) {
        agreedTools.push(tool);
      }
    }

    // Check for unresolved objections
    const hasUnresolvedObjections = this.arguments.some(arg =>
      arg.stance === 'object'
    );

    if (agreedTools.length > 0 && !hasUnresolvedObjections) {
      return {
        reached: true,
        tools: agreedTools,
        summary: `Consensus reached: Use ${agreedTools.join(', ')} for this problem.`
      };
    }

    return { reached: false };
  }
}

export default ChairProvider;
