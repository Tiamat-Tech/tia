import { randomUUID } from "crypto";
import { MfrProtocolState } from "../../../lib/mfr/protocol-state.js";
import { MFR_PHASES } from "../../../lib/mfr/constants.js";
import { isQuietRequest, isVerboseRequest } from "./utils.js";

export class DebateCoordinator {
  constructor(provider) {
    this.provider = provider;
  }

  async startDebateSession(problemDescription, metadata, reply) {
    const provider = this.provider;
    const sessionId = randomUUID();
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);

    provider.logger.info?.(
      `[CoordinatorProvider] Starting debate session: ${sessionId}`
    );

    const state = new MfrProtocolState(sessionId, {
      logger: provider.logger,
      initialPhase: MFR_PHASES.PROBLEM_INTERPRETATION
    });
    provider.activeSessions.set(sessionId, state);

    state.transition(MFR_PHASES.TOOL_SELECTION_DEBATE, {
      problemDescription,
      startedBy: metadata?.sender,
      verbose,
      quiet
    });

    provider.activeDebates.set(sessionId, {
      problemDescription,
      startTime: Date.now(),
      positions: [],
      consensusReached: false,
      selectedAgents: [],
      verbose,
      quiet
    });

    const debateIssue = quiet
      ? [
        `Session: ${sessionId}`,
        `Issue: Which tools and agents should we use to solve this problem?`,
        `Problem: ${problemDescription}`,
        `Respond with Position/Support/Objection.`,
        ``
      ].join('\n')
      : verbose
      ? [
        `Session: ${sessionId}`,
        ``,
        `Issue: Which tools and agents should we use to solve this problem?`,
        ``,
        `Problem: ${problemDescription}`,
        ``,
        `Available agents:`,
        `  - Mistral: Natural language processing, entity extraction`,
        `  - Data: Wikidata/DBpedia knowledge grounding`,
        `  - Prolog: Logical reasoning, constraint satisfaction`,
        `  - MFR-Semantic: Constraint extraction from domain knowledge`,
        ``,
        `Please contribute:`,
        `  Position: I recommend [agent] because...`,
        `  Support: [agent] would help because...`,
        `  Objection: [agent] may not work because...`,
        ``
      ].join('\n')
      : [
        `Session: ${sessionId}`,
        `Issue: Which tools and agents should we use to solve this problem?`,
        `Problem: ${problemDescription}`,
        `Available agents: Mistral, Data, Prolog, MFR-Semantic.`,
        `Respond with Position/Support/Objection.`,
        ``
      ].join('\n');

    provider.logger.info?.(`[CoordinatorProvider] Sending debate issue to room: ${provider.primaryRoomJid}`);
    provider.logger.debug?.(`[CoordinatorProvider] Debate issue text: ${debateIssue.substring(0, 100)}...`);
    await provider.sendStatusMessage(debateIssue, { forceChat: true });

    if (!Number.isFinite(provider.debateTimeoutMs)) {
      throw new Error("Debate timeout missing or invalid; check profile mfrConfig.");
    }

    setTimeout(async () => {
      await this.concludeDebate(sessionId);
    }, provider.debateTimeoutMs);

    const debateSeconds = Math.round(provider.debateTimeoutMs / 1000);
    if (quiet) {
      return `Debate started: ${sessionId}.`;
    }
    return verbose
      ? `Debate session started: ${sessionId}\n\nDebate window: ${debateSeconds} seconds\nType positions and arguments or wait for Chair to detect consensus.`
      : `Debate started: ${sessionId}. Window: ${debateSeconds}s.`;
  }

  async concludeDebate(sessionId, { selectedAgents } = {}) {
    const provider = this.provider;
    const state = provider.activeSessions.get(sessionId);
    const debateData = provider.activeDebates.get(sessionId);

    if (!state || !debateData) {
      provider.logger.warn?.(`[CoordinatorProvider] No active debate for ${sessionId}`);
      return;
    }

    if (!state.isPhase(MFR_PHASES.TOOL_SELECTION_DEBATE)) {
      return;
    }

    provider.logger.info?.(
      `[CoordinatorProvider] Concluding debate for ${sessionId}`
    );

    if (debateData.mode === "consensus") {
      await provider.concludeConsensus(sessionId);
      return;
    }

    const selected = Array.isArray(selectedAgents) && selectedAgents.length > 0
      ? selectedAgents
      : (debateData.selectedAgents || []);
    const hasSelection = selected.length > 0;
    const message = debateData.consensusReached
      ? `${hasSelection ? `Consensus reached. Selected agents: ${selected.join(", ")}.` : "Consensus reached."}`
      : "Debate timeout reached. Proceeding with all available agents.";

    await provider.sendStatusMessage(message, { sessionId, system: true });

    await provider.modelStore.createModel(sessionId, debateData.problemDescription);

    state.transition(MFR_PHASES.ENTITY_DISCOVERY);

    await provider.broadcastContributionRequest(sessionId, debateData.problemDescription, selected);

    provider.activeDebates.delete(sessionId);
  }

  getActiveDebateSessionId() {
    const provider = this.provider;
    let latest = null;
    for (const [sessionId, debateData] of provider.activeDebates.entries()) {
      if (debateData.mode === "consensus") {
        continue;
      }
      if (!latest || debateData.startTime > latest.startTime) {
        latest = { sessionId, startTime: debateData.startTime };
      }
    }
    return latest?.sessionId || null;
  }

  extractConsensusAgents(message) {
    if (!message) return [];
    const lower = message.toLowerCase();
    const match = lower.match(/consensus reached.*use\s+(.+?)(?:\.|$)/i) ||
      lower.match(/consensus reached.*tools?:\s*(.+?)(?:\.|$)/i);
    if (!match) return [];
    const normalized = match[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace("mfr-semantic", "semantic").replace("mfr semantic", "semantic"));
    return Array.from(new Set(normalized));
  }

  async handleDebateConsensus(message, metadata = {}) {
    const provider = this.provider;
    const text = (message || "").trim();
    if (!text) return null;
    if (!/consensus reached/i.test(text)) {
      return null;
    }

    const sessionId = this.getActiveDebateSessionId();
    if (!sessionId) {
      return null;
    }

    const debateData = provider.activeDebates.get(sessionId);
    if (!debateData) {
      return null;
    }

    const selectedAgents = this.extractConsensusAgents(text);
    debateData.consensusReached = true;
    debateData.selectedAgents = selectedAgents;

    await provider.sendStatusMessage(
      selectedAgents.length > 0
        ? `Consensus noted for ${sessionId}. Selected agents: ${selectedAgents.join(", ")}.`
        : `Consensus noted for ${sessionId}.`,
      { sessionId, system: true }
    );

    await this.concludeDebate(sessionId, { selectedAgents });
    if (debateData.quiet) {
      return `Consensus received for ${sessionId}.`;
    }
    return debateData.verbose
      ? `Consensus received for ${sessionId}. Proceeding with contribution requests...`
      : `Consensus received for ${sessionId}.`;
  }
}
