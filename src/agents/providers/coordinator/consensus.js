import { randomUUID } from "crypto";
import { MfrProtocolState } from "../../../lib/mfr/protocol-state.js";
import { MFR_PHASES } from "../../../lib/mfr/constants.js";
import {
  isVerboseRequest,
  isQuietRequest,
  parseConsensusEntries,
  shouldTreatAsConsensusEntry,
  synthesizeConsensus
} from "./utils.js";

export class ConsensusCoordinator {
  constructor(provider) {
    this.provider = provider;
  }

  async startConsensusSession(problemDescription, metadata, reply) {
    const provider = this.provider;
    const sessionId = randomUUID();
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);

    provider.logger.info?.(
      `[CoordinatorProvider] Starting consensus session: ${sessionId}`
    );

    const state = new MfrProtocolState(sessionId, {
      logger: provider.logger,
      initialPhase: MFR_PHASES.PROBLEM_INTERPRETATION
    });
    provider.activeSessions.set(sessionId, state);

    state.transition(MFR_PHASES.CONSENSUS_DISCOVERY, {
      problemDescription,
      startedBy: metadata?.sender,
      verbose,
      quiet
    });

    provider.activeDebates.set(sessionId, {
      mode: "consensus",
      problemDescription,
      startTime: Date.now(),
      positions: [],
      rawMessages: [],
      consensusReached: false,
      selectedAgents: [],
      verbose,
      quiet
    });

    const agentMentions = Array.from(provider.agentRegistry.values() || [])
      .map((entry) => entry?.nickname)
      .filter(Boolean)
      .filter((name) => name.toLowerCase() !== "coordinator")
      .map((name) => `@${name}`)
      .join(" ");

    const consensusIssue = [
      `Session: ${sessionId}`,
      `Issue: Please provide Position/Support/Objection for the following question.`,
      `Question: ${problemDescription}`,
      agentMentions ? `Agents: ${agentMentions}` : null,
      agentMentions ? `Direct request: ${agentMentions} — reply in this room with "Position:", "Support:", or "Objection:" (one or more lines).` : null,
      `Example: Position: Prioritize stability for a reliable release.`,
      `Respond with Position/Support/Objection.`,
      ``
    ].filter(Boolean).join("\n");

    await provider.sendStatusMessage(consensusIssue, { forceChat: true });

    if (!Number.isFinite(provider.debateTimeoutMs)) {
      throw new Error("Consensus timeout missing or invalid; check profile mfrConfig.");
    }

    setTimeout(async () => {
      await this.concludeConsensus(sessionId);
    }, provider.debateTimeoutMs);

    const consensusSeconds = Math.round(provider.debateTimeoutMs / 1000);
    if (quiet) {
      return `Consensus started: ${sessionId}.`;
    }
    return verbose
      ? `Consensus session started: ${sessionId}\n\nWindow: ${consensusSeconds} seconds\nWaiting for Position/Support/Objection entries...`
      : `Consensus started: ${sessionId}. Window: ${consensusSeconds}s.`;
  }

  recordConsensusEntry(sessionId, message, metadata = {}) {
    const provider = this.provider;
    const debateData = provider.activeDebates.get(sessionId);
    if (!debateData || debateData.mode !== "consensus") return;

    const text = String(message || "").trim();
    const sender = metadata?.sender || "unknown";
    const rawMessages = debateData.rawMessages || [];
    if (rawMessages.length < 200) {
      rawMessages.push({
        sender,
        text,
        timestamp: new Date().toISOString()
      });
      debateData.rawMessages = rawMessages;
    }

    const entries = parseConsensusEntries(text);
    if (entries.length === 0) {
      if (shouldTreatAsConsensusEntry(sender, text)) {
        debateData.positions.push({
          type: "position",
          text,
          sender,
          timestamp: new Date().toISOString()
        });
      }
      return;
    }

    entries.forEach((entry) => {
      debateData.positions.push({
        ...entry,
        sender,
        timestamp: new Date().toISOString()
      });
    });
  }

  async concludeConsensus(sessionId) {
    const provider = this.provider;
    const state = provider.activeSessions.get(sessionId);
    const debateData = provider.activeDebates.get(sessionId);

    if (!state || !debateData) {
      provider.logger.warn?.(`[CoordinatorProvider] No active consensus for ${sessionId}`);
      return;
    }

    if (!state.isPhase(MFR_PHASES.CONSENSUS_DISCOVERY)) {
      return;
    }

    provider.logger.info?.(
      `[CoordinatorProvider] Concluding consensus for ${sessionId}`
    );

    const summary = synthesizeConsensus(debateData);
    const lines = [
      `Consensus session complete: ${sessionId}`,
      `Answer: ${summary.answer || "No clear consensus reached."}`
    ];
    if (summary.support.length > 0) {
      lines.push(`Support: ${summary.support.join(" | ")}`);
    }
    if (summary.objections.length > 0) {
      lines.push(`Objections: ${summary.objections.join(" | ")}`);
    }

    await provider.sendStatusMessage(lines.join("\n"), { sessionId, forceChat: true });
    await provider.sendConsensusLog(sessionId, debateData, summary);

    state.transition(MFR_PHASES.COMPLETE, {
      consensus: summary.answer || null
    });
    provider.activeDebates.delete(sessionId);
  }
}
