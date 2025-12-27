import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";

export class ChairProvider {
  constructor({ nickname, logger = console }) {
    if (!nickname) throw new Error("ChairProvider requires a nickname");
    this.nickname = nickname;
    this.logger = logger;
    this.currentIssue = null;
    this.positions = [];
    this.arguments = [];
    this.consensusSent = false;
    this.verbose = false;
    this.quiet = false;
    // Legacy IBIS constructs
    this.ideas = [];
    this.questions = [];
    this.decisions = [];
    this.references = [];
    this.notes = [];
  }

  updateState(structure, content, sender) {
    if (structure.issues.length) {
      this.currentIssue = structure.issues[0].label || content;
      this.positions = [];
      this.arguments = [];
      this.consensusSent = false;
      this.verbose = hasVerboseFlag(content);
      this.quiet = hasQuietFlag(content);
      // Clear legacy constructs when new issue starts
      this.ideas = [];
      this.questions = [];
      this.decisions = [];
      this.references = [];
      this.notes = [];
    }
    structure.positions.forEach((p) => {
      this.positions.push({ text: p.label, sender });
    });
    structure.arguments.forEach((a) => {
      this.arguments.push({ text: a.label, sender, stance: a.stance });
    });
    // Capture legacy IBIS constructs
    (structure.ideas || []).forEach((i) => {
      this.ideas.push({ text: i.label, sender });
    });
    (structure.questions || []).forEach((q) => {
      this.questions.push({ text: q.label, sender });
    });
    (structure.decisions || []).forEach((d) => {
      this.decisions.push({ text: d.label, sender });
    });
    (structure.references || []).forEach((r) => {
      this.references.push({ text: r.label, sender });
    });
    (structure.notes || []).forEach((n) => {
      this.notes.push({ text: n.label, sender });
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

    // Legacy IBIS constructs (only include if present)
    const parts = [issue, positions, argumentsText];

    if (this.ideas.length > 0) {
      parts.push(`Ideas:\n- ${this.ideas.map((i) => i.text).join("\n- ")}`);
    }
    if (this.questions.length > 0) {
      parts.push(`Questions:\n- ${this.questions.map((q) => q.text).join("\n- ")}`);
    }
    if (this.decisions.length > 0) {
      parts.push(`Decisions:\n- ${this.decisions.map((d) => d.text).join("\n- ")}`);
    }
    if (this.references.length > 0) {
      parts.push(`References:\n- ${this.references.map((r) => r.text).join("\n- ")}`);
    }
    if (this.notes.length > 0) {
      parts.push(`Notes:\n- ${this.notes.map((n) => n.text).join("\n- ")}`);
    }

    return parts.join("\n");
  }

  async handle({ content, rawMessage, metadata }) {
    const text = content || rawMessage || "";
    const trimmedText = text.trim();
    const lower = trimmedText.toLowerCase();

    // Debug logging for MFR debate detection
    this.logger.debug?.(`[Chair] Received message: "${trimmedText.substring(0, 100)}..."`);

    // Ignore MFR coordinator commands (those are for the Coordinator, not Chair)
    // BUT don't ignore "debate" alone - that's for Chair to facilitate
    if (lower.startsWith("mfr-") || lower.match(/^(start|contribute|validate|solve|status|list|help)\s/)) {
      this.logger.debug?.(`[Chair] Ignoring MFR command: ${trimmedText.substring(0, 50)}`);
      return null;
    }

    // Also ignore single-word "debate" command (that's for Coordinator)
    // but DO respond to debate issues that Coordinator broadcasts
    if (lower === "debate" || lower.match(/^debate\s+[^:]/)) {
      this.logger.debug?.(`[Chair] Ignoring debate command (for Coordinator): ${trimmedText.substring(0, 50)}`);
      return null;
    }

    // Ignore MFR workflow/technical messages to reduce noise
    if (lower.includes("mfr contribution from") ||
        lower.includes("action schema from") ||
        lower.includes("role assignment:") ||
        lower.includes("solution proposal from") ||
        lower.includes("mfr session started:") ||
        lower.includes("mfr session complete:") ||
        lower.includes("mfr contribution request") ||
        lower.includes("mfr solution request") ||
        lower.includes("plan execution request")) {
      this.logger.debug?.(`[Chair] Ignoring MFR workflow message: ${trimmedText.substring(0, 50)}`);
      return null;
    }

    // Check for MFR debate initiation FIRST (before general IBIS detection)
    // This ensures Coordinator's debate issue gets explicit response
    if (lower.includes("which tools and agents should we use") ||
        lower.includes("available agents:") ||
        (lower.startsWith("issue:") && lower.includes("tool"))) {
      this.currentIssue = trimmedText.replace(/^issue:\s*/i, "").trim() || trimmedText;
      this.positions = [];
      this.arguments = [];
      this.consensusSent = false;
      this.verbose = hasVerboseFlag(trimmedText);
      this.quiet = hasQuietFlag(trimmedText);
      // Clear legacy constructs
      this.ideas = [];
      this.questions = [];
      this.decisions = [];
      this.references = [];
      this.notes = [];
      this.logger.info?.(`[Chair] Debate started for issue: ${this.currentIssue.substring(0, 50)}...`);
      if (this.quiet) {
        return "Debate started.";
      }
      return this.verbose
        ? `Debate started. Issue: ${this.currentIssue}\nPlease provide Positions and Arguments.`
        : "Debate started. Provide Position/Support/Objection.";
    }

    // Check for explicit debate start commands
    if (lower.includes("start debate") || lower.startsWith("issue:") || lower.startsWith("i:")) {
      this.currentIssue = text.replace(/^(issue|i):\s*/i, "").trim() || text;
      this.positions = [];
      this.arguments = [];
      this.consensusSent = false;
      this.verbose = hasVerboseFlag(text);
      this.quiet = hasQuietFlag(text);
      // Clear legacy constructs
      this.ideas = [];
      this.questions = [];
      this.decisions = [];
      this.references = [];
      this.notes = [];
      if (this.quiet) {
        return "Debate started.";
      }
      return this.verbose
        ? `Debate started. Issue: ${this.currentIssue}\nPlease provide Positions and Arguments.`
        : "Debate started. Provide Position/Support/Objection.";
    }

    // General IBIS structure detection (for position/argument contributions)
    const structure = detectIBISStructure(text);

    // Always acknowledge explicit IBIS markers (Position:, Support:, Objection:, Idea:, Question:, etc.)
    // Or acknowledge if confidence threshold is met
    const hasExplicitIBIS = structure.positions.length > 0 ||
                           structure.arguments.length > 0 ||
                           (structure.ideas || []).length > 0 ||
                           (structure.questions || []).length > 0 ||
                           (structure.decisions || []).length > 0 ||
                           (structure.references || []).length > 0 ||
                           (structure.notes || []).length > 0;
    const hasAnyContent = structure.issues.length ||
                         structure.positions.length ||
                         structure.arguments.length ||
                         (structure.ideas || []).length ||
                         (structure.questions || []).length ||
                         (structure.decisions || []).length ||
                         (structure.references || []).length ||
                         (structure.notes || []).length;
    if ((hasExplicitIBIS || structure.confidence >= 0.5) && hasAnyContent) {
      this.updateState(structure, text, metadata.sender);
      if (this.quiet) {
        const consensus = this.detectToolConsensus();
        if (consensus.reached && !this.consensusSent) {
          this.consensusSent = true;
          return consensus.summary;
        }
        return "Noted.";
      }
      if (!this.verbose) {
        const consensus = this.detectToolConsensus();
        if (consensus.reached && !this.consensusSent) {
          this.consensusSent = true;
          return `Noted. ${consensus.summary}`;
        }
        return "Noted.";
      }
      const summary = summarizeIBIS(structure);
      const issueText = this.currentIssue?.toLowerCase() || "";
      const isToolIssue = issueText.includes("tool") || issueText.includes("agent");
      const consensus = this.detectToolConsensus();
      if (isToolIssue && consensus.reached && !this.consensusSent) {
        this.consensusSent = true;
        return `Noted. ${summary}\n${consensus.summary}`;
      }
      return `Noted. ${summary}`;
    }

    if (lower.includes("status") || lower.includes("consensus") || lower.includes("summary")) {
      if (this.quiet) {
        return `Issue: ${this.currentIssue || "none"}\nPositions: ${this.positions.length}\nArguments: ${this.arguments.length}`;
      }
      if (!this.verbose) {
        return `Issue: ${this.currentIssue || "none"}\nPositions: ${this.positions.length}\nArguments: ${this.arguments.length}`;
      }
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

    // Default prompt to contribute - only if there's an active issue
    if (!this.currentIssue) {
      // No active debate, don't prompt
      return null;
    }

    if (this.quiet) {
      return "Provide Position/Support/Objection.";
    }
    return this.verbose
      ? `Please contribute Position: ... or Argument: ...${this.currentIssue ? ` (Issue: ${this.currentIssue})` : ""}`
      : "Please contribute Position/Support/Objection.";
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

function hasVerboseFlag(text) {
  return /(^|\s)-v(\s|$|[.,!?])/i.test(text || "");
}

function hasQuietFlag(text) {
  return /(^|\s)-q(\s|$|[.,!?])/i.test(text || "");
}
