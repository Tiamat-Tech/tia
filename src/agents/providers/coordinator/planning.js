import { randomUUID } from "crypto";
import { isVerboseRequest, isQuietRequest, parsePlanningRoute, tallyPlanningVotes } from "./utils.js";

export class PlanningCoordinator {
  constructor(provider) {
    this.provider = provider;
  }

  async startPlanningSession(problemDescription, metadata, reply) {
    const provider = this.provider;
    const sessionId = randomUUID();
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);

    provider.logger.info?.(
      `[CoordinatorProvider] Starting planning poll: ${sessionId}`
    );

    provider.activePlanning.set(sessionId, {
      problemDescription,
      startTime: Date.now(),
      votes: new Map(),
      selectedRoute: null,
      verbose,
      quiet,
      concluded: false
    });

    const agentMentions = Array.from(provider.agentRegistry.values() || [])
      .map((entry) => entry?.nickname)
      .filter(Boolean)
      .filter((name) => name.toLowerCase() !== "coordinator")
      .map((name) => `@${name}`)
      .join(" ");

    const pollLines = [
      `Planning poll: ${sessionId}`,
      `Question: ${problemDescription}`,
      agentMentions ? `Agents: ${agentMentions}` : null,
      `Choose route (reply in this room):`,
      `Position: route=logic  (Use Prolog/MFR reasoning)`,
      `Position: route=consensus  (Use community consensus)`,
      `Position: route=golem-logic  (Assign Golem a logic role, then consensus)`,
      `If a clear consensus emerges early, the system will proceed immediately.`
    ].filter(Boolean);

    await provider.sendStatusMessage(pollLines.join("\n"), { forceChat: true });

    setTimeout(async () => {
      await this.concludePlanning(sessionId);
    }, 30000);

    if (quiet) {
      return `Planning poll started: ${sessionId}.`;
    }
    return verbose
      ? `Planning poll started: ${sessionId}\nWindow: 30s`
      : `Planning poll started: ${sessionId}. Window: 30s.`;
  }

  recordPlanningEntry(sessionId, message, metadata = {}) {
    const provider = this.provider;
    const planData = provider.activePlanning.get(sessionId);
    if (!planData || planData.concluded) return;
    const choice = parsePlanningRoute(message || "");
    if (!choice) return;
    const sender = String(metadata?.sender || "unknown").toLowerCase();
    if (planData.votes.has(sender)) return;
    planData.votes.set(sender, choice);
    this.maybeConcludePlanning(sessionId);
  }

  maybeConcludePlanning(sessionId) {
    const provider = this.provider;
    const planData = provider.activePlanning.get(sessionId);
    if (!planData || planData.concluded) return;
    const counts = tallyPlanningVotes(planData.votes);
    const totalVotes = counts.total;
    if (totalVotes < 2) return;
    const top = counts.sorted[0];
    const second = counts.sorted[1];
    if (!top) return;
    const lead = top.count - (second?.count || 0);
    if (top.count >= Math.ceil(totalVotes / 2) && lead >= 1) {
      this.concludePlanning(sessionId, top.route);
    }
  }

  async concludePlanning(sessionId, forcedRoute = null) {
    const provider = this.provider;
    const planData = provider.activePlanning.get(sessionId);
    if (!planData || planData.concluded) return;
    planData.concluded = true;

    const counts = tallyPlanningVotes(planData.votes);
    const route = forcedRoute || counts.sorted[0]?.route || provider.planningDefaultRoute;
    if (!route) {
      throw new Error("Planning default route missing; check coordinator mfrConfig.");
    }
    planData.selectedRoute = route;
    await provider.sendStatusMessage(
      `Planning poll complete: ${sessionId}\nSelected route: ${route}`,
      { forceChat: true }
    );

    provider.activePlanning.delete(sessionId);

    if (route === "logic") {
      if (!provider.enableDebate) {
        await provider.startMfrSession(planData.problemDescription, {
          planningRoute: route,
          planningSessionId: sessionId
        }, () => {});
      } else {
        await provider.startDebateSession(planData.problemDescription, {}, () => {});
      }
      return;
    }

    if (route === "golem-logic") {
      const assignment = await this.assignGolemLogicRole(sessionId, planData.problemDescription);
      await provider.startMfrSession(planData.problemDescription, {
        planningRoute: route,
        planningSessionId: sessionId,
        golemRoleName: assignment?.name || assignment?.roleName || null
      }, () => {});
      return;
    }

    await provider.startConsensusSession(planData.problemDescription, {}, () => {});
  }

  async assignGolemLogicRole(sessionId, problemDescription) {
    const provider = this.provider;
    if (!provider.golemManager) return;
    const desiredRole = "logical reasoning";
    return await provider.golemManager.handleAssistanceRequest({
      requestingAgent: "coordinator",
      sessionId,
      desiredRole,
      context: problemDescription,
      roomJid: provider.primaryRoomJid
    });
  }
}
