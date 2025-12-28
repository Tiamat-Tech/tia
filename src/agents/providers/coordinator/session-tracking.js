export class SessionTracker {
  constructor(provider) {
    this.provider = provider;
  }

  getActiveConsensusSessionId() {
    const provider = this.provider;
    let latest = null;
    for (const [sessionId, debateData] of provider.activeDebates.entries()) {
      if (debateData.mode !== "consensus") {
        continue;
      }
      if (!latest || debateData.startTime > latest.startTime) {
        latest = { sessionId, startTime: debateData.startTime };
      }
    }
    return latest?.sessionId || null;
  }

  getActivePlanningSessionId() {
    const provider = this.provider;
    let latest = null;
    for (const [sessionId, planData] of provider.activePlanning.entries()) {
      if (planData.concluded) {
        continue;
      }
      if (!latest || planData.startTime > latest.startTime) {
        latest = { sessionId, startTime: planData.startTime };
      }
    }
    return latest?.sessionId || null;
  }

  recordConsensusMessage({ body, sender }) {
    if (!body) return;
    const sessionId = this.getActiveConsensusSessionId();
    if (!sessionId) return;
    this.provider.recordConsensusEntry(sessionId, body, { sender });
  }

  recordPlanningMessage({ body, sender }) {
    if (!body) return;
    const sessionId = this.getActivePlanningSessionId();
    if (!sessionId) return;
    this.provider.recordPlanningEntry(sessionId, body, { sender });
  }

  async sendConsensusLog(sessionId, debateData, summary) {
    const provider = this.provider;
    if (!debateData || debateData.mode !== "consensus") return;
    const question = debateData.problemDescription || "";
    const entries = debateData.positions || [];
    const rawMessages = debateData.rawMessages || [];
    const lines = [
      `[Consensus Log] ${sessionId}`,
      `Question: ${question}`,
      `Answer: ${summary.answer || "No clear consensus reached."}`,
      `Entries: ${entries.length}`,
      ""
    ];

    if (entries.length > 0) {
      lines.push("Parsed entries:");
      entries.forEach((entry, index) => {
        const sender = entry.sender || "unknown";
        const type = entry.type || "note";
        const text = entry.text || "";
        const timestamp = entry.timestamp || "";
        lines.push(`${index + 1}. [${type}] ${sender} ${timestamp}`.trim());
        if (text) {
          lines.push(`   ${text}`);
        }
      });
    }

    if (rawMessages.length > 0) {
      lines.push("", "Raw messages:");
      rawMessages.slice(0, 50).forEach((entry, index) => {
        const sender = entry.sender || "unknown";
        const text = entry.text || "";
        const timestamp = entry.timestamp || "";
        lines.push(`${index + 1}. ${sender} ${timestamp}`.trim());
        if (text) {
          lines.push(`   ${text}`);
        }
      });
    }

    await provider.sendLogMessage(lines.join("\n"));
  }
}
