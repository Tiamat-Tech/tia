export class CoordinatorCommandRouter {
  constructor(provider) {
    this.provider = provider;
  }

  async handle({ command, content, metadata, reply, rawMessage }) {
    const provider = this.provider;
    provider.logger.debug?.(`[CoordinatorProvider] Command: ${command}`);

    try {
      if (
        metadata?.senderIsAgent &&
        ["mfr-start", "start", "mfr-discover", "mfr-consensus", "mfr-debate", "debate"].includes(command)
      ) {
        const senderLower = String(metadata?.sender || "").toLowerCase();
        if (provider.allowAgentSenders.has(senderLower)) {
          provider.logger.debug?.(
            `[CoordinatorProvider] Allowing ${command} from agent ${metadata.sender}`
          );
        } else {
          provider.logger.debug?.(
            `[CoordinatorProvider] Ignoring ${command} from agent ${metadata.sender}`
          );
          await provider.sendLogMessage(
            `[Coordinator] Ignored ${command} from agent ${metadata.sender || "unknown"}`
          );
          return null;
        }
      }

      switch (command) {
        case "mfr-start":
        case "start":
          return await provider.startMfrSession(content, metadata, reply);

        case "mfr-discover":
          return await provider.startPlanningSession(content, metadata, reply);

        case "mfr-consensus":
          return await provider.startConsensusSession(content, metadata, reply);

        case "mfr-debate":
        case "debate":
          if (!provider.enableDebate) {
            return "Debate feature not enabled. Use 'mfr-start' to proceed with standard MFR session.";
          }
          return await provider.startDebateSession(content, metadata, reply);

        case "mfr-contribute":
        case "contribute":
          return await provider.handleContribution(content, metadata, reply);

        case "mfr-validate":
        case "validate":
          return await provider.validateModel(content, metadata, reply);

        case "mfr-solve":
        case "solve":
          return await provider.initiateReasoning(content, metadata, reply);

        case "mfr-status":
        case "status":
          return await provider.getSessionStatus(content, metadata, reply);

        case "mfr-list":
        case "list":
          return await provider.listActiveSessions(metadata, reply);

        case "help":
        case "mfr-help":
          return provider.getHelpMessage();

        default:
          if (command === "chat") {
            const consensusSessionId = provider.getActiveConsensusSessionId();
            if (consensusSessionId) {
              provider.recordConsensusEntry(consensusSessionId, rawMessage, metadata);
            }
          }
          if (provider.enableDebate) {
            const consensusResult = await provider.handleDebateConsensus(
              content || rawMessage || "",
              metadata
            );
            if (consensusResult) {
              return consensusResult;
            }
          }
          return null;
      }
    } catch (error) {
      provider.logger.error?.(
        `[CoordinatorProvider] Error handling ${command}: ${error.message}`
      );
      return `Error: ${error.message}`;
    }
  }
}

// Note: This command router is intentionally standalone so it can be reused by other agents.
