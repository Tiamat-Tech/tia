import { MFR_PHASES } from "../../../lib/mfr/constants.js";

export class CoordinatorHelpers {
  constructor(provider) {
    this.provider = provider;
  }

  async getSessionStatus(sessionId, metadata, reply) {
    const provider = this.provider;
    if (!sessionId) {
      sessionId = metadata?.sessionId;
    }

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    const state = provider.activeSessions.get(sessionId);
    if (!state) {
      return `Session ${sessionId} not found`;
    }

    const summary = state.getSummary();
    const stats = await provider.modelStore.getModelStats(sessionId);

    const lines = [
      `Session: ${sessionId}`,
      `Phase: ${summary.currentPhase}`,
      `Created: ${summary.created}`,
      `Transitions: ${summary.transitionCount}`,
      ""
    ];

    if (stats) {
      lines.push(`Model Statistics:`);
      lines.push(`  Quads: ${stats.quadCount}`);
      lines.push(`  Contributions: ${stats.contributionCount}`);
      lines.push(`  Contributors: ${stats.contributors.join(", ")}`);
    }

    return lines.join("\n");
  }

  async listActiveSessions(metadata, reply) {
    const provider = this.provider;
    const sessionIds = Array.from(provider.activeSessions.keys());

    if (sessionIds.length === 0) {
      return "No active MFR sessions";
    }

    const lines = [`Active MFR Sessions (${sessionIds.length}):`];

    for (const sessionId of sessionIds) {
      const state = provider.activeSessions.get(sessionId);
      const summary = state.getSummary();
      lines.push(
        `  - ${sessionId} (${summary.currentPhase}) - created ${summary.created}`
      );
    }

    return lines.join("\n");
  }

  getHelpMessage() {
    const provider = this.provider;
    const baseCommands = `MFR Coordinator Commands:
  mfr-start <problem description> - Start new MFR session
  mfr-contribute <sessionId> <rdf> - Submit contribution
  mfr-validate <sessionId> - Validate model
  mfr-solve <sessionId> - Request solutions
  mfr-status <sessionId> - Get session status
  mfr-list - List active sessions`;

    const debateCommand = provider.enableDebate
      ? `\n  debate <problem description> - Start debate-driven MFR session (tool selection via Chair)`
      : '';

    return baseCommands + debateCommand;
  }

  async assignGolemRole(sessionId, problemDescription, phase) {
    const provider = this.provider;
    if (!provider.golemManager) {
      provider.logger.debug?.('[CoordinatorProvider] GolemManager not available, skipping role assignment');
      return;
    }

    try {
      const availableAgents = Array.from(provider.agentRegistry.values());
      const roomJid = provider.primaryRoomJid;

      const assignment = await provider.golemManager.selectOptimalRole({
        problemDescription,
        currentPhase: phase,
        availableAgents,
        sessionId,
        roomJid
      });

      if (assignment) {
        provider.logger.info?.(
          `[CoordinatorProvider] Assigned Golem role: ${assignment.name} (${assignment.domain}/${assignment.roleName})`
        );
      }
    } catch (error) {
      provider.logger.error?.(`[CoordinatorProvider] Failed to assign Golem role: ${error.message}`);
    }
  }

  async orchestratePhase(phase, sessionId) {
    const provider = this.provider;
    const state = provider.activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    provider.logger.debug?.(
      `[CoordinatorProvider] Orchestrating phase ${phase} for ${sessionId}`
    );

    switch (phase) {
      case MFR_PHASES.ENTITY_DISCOVERY:
        await provider.broadcastContributionRequest(
          sessionId,
          state.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION)
            ?.problemDescription
        );
        break;

      case MFR_PHASES.MODEL_MERGE:
        await provider.proceedToMerge(sessionId);
        break;

      case MFR_PHASES.MODEL_VALIDATION:
        await provider.proceedToValidation(sessionId);
        break;

      case MFR_PHASES.CONSTRAINED_REASONING:
        await provider.initiateReasoning(sessionId, {}, () => {});
        break;

      default:
        provider.logger.warn?.(
          `[CoordinatorProvider] No orchestration defined for phase: ${phase}`
        );
    }
  }
}
