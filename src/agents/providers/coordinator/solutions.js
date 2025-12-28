import { MFR_MESSAGE_TYPES, MFR_PHASES } from "../../../lib/mfr/constants.js";
import { LANGUAGE_MODES } from "../../../lib/lingue/constants.js";
import { RdfUtils } from "../../../lib/mfr/rdf-utils.js";
import { deriveSyllogismAnswer } from "./utils.js";

export class SolutionCoordinator {
  constructor(provider) {
    this.provider = provider;
  }

  async handleSolutionProposal(payload, metadata = {}) {
    const provider = this.provider;
    const sessionId = payload?.sessionId || metadata?.sessionId;
    if (!sessionId) {
      return null;
    }

    const solution = payload?.solution;
    if (!solution) {
      return null;
    }

    const sender = metadata?.sender || "unknown";
    provider.logger.info?.(
      `[CoordinatorProvider] Received solution proposal from ${sender} for ${sessionId}`
    );

    await provider.maybeReportLingueMode(sessionId, {
      direction: "<-",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: `SolutionProposal from ${sender}`
    });

    if (this.shouldExecutePlan(solution)) {
      const interim = this.formatSolutionEntry({
        sender,
        solution,
        receivedAt: new Date().toISOString()
      });
      await provider.sendStatusMessage(interim, { sessionId, system: true });
      await this.requestPlanExecution(sessionId, solution, sender);
      return `Plan received for ${sessionId}. Executing for bindings...`;
    }

    return await this.finalizeSolution(sessionId, solution, sender);
  }

  shouldExecutePlan(solution) {
    return Array.isArray(solution?.plan) &&
      solution.plan.length > 0 &&
      !solution.bindings;
  }

  async requestPlanExecution(sessionId, solution, sender) {
    const provider = this.provider;
    if (!provider.negotiator || !provider.primaryRoomJid) {
      return;
    }

    const model = await provider.modelStore.getModel(sessionId);
    const modelTurtle = model ? await RdfUtils.serializeTurtle(model) : "";
    const metadata = await provider.modelStore.getMetadata(sessionId);
    const problemDescription = metadata?.problemDescription || "";

    provider.pendingExecutions.set(sessionId, { solution, sender });

    await provider.maybeReportLingueMode(sessionId, {
      direction: "->",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "PlanExecutionRequest (plan only; Prolog program added by Executor)"
    });

    await provider.negotiator.send(provider.primaryRoomJid, {
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      payload: {
        messageType: MFR_MESSAGE_TYPES.PLAN_EXECUTION_REQUEST,
        sessionId,
        plan: solution.plan,
        problemDescription,
        model: modelTurtle,
        verbose: provider.getSessionVerbose(sessionId),
        timestamp: new Date().toISOString()
      },
      summary: `Plan execution request for ${sessionId}`
    });
  }

  async handleExecutionResult(payload, metadata = {}) {
    const provider = this.provider;
    const sessionId = payload?.sessionId || metadata?.sessionId;
    if (!sessionId) {
      return null;
    }

    const pending = provider.pendingExecutions.get(sessionId);
    if (!pending) {
      return null;
    }

    await provider.maybeReportLingueMode(sessionId, {
      direction: "<-",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "PlanExecutionResult"
    });

    provider.pendingExecutions.delete(sessionId);

    const updatedSolution = {
      ...pending.solution,
      bindings: payload?.bindings || [],
      executionQuery: payload?.query || null,
      executionError: payload?.error || null
    };

    return await this.finalizeSolution(sessionId, updatedSolution, pending.sender);
  }

  async finalizeSolution(sessionId, solution, sender) {
    const provider = this.provider;
    const existing = provider.solutions.get(sessionId) || [];
    existing.push({
      sender,
      solution,
      receivedAt: new Date().toISOString()
    });
    provider.solutions.set(sessionId, existing);

    const state = provider.activeSessions.get(sessionId);
    if (state && !state.isComplete()) {
      state.transition(MFR_PHASES.COMPLETE, {
        solutionCount: existing.length
      });
    }

    const summary = this.summarizeSolutions(sessionId, existing);
    await this.broadcastSessionComplete(sessionId, existing);
    await this.sendSolutionMessage(existing, sessionId);
    await this.sendFinalAnswer(sessionId, existing);
    return `MFR session complete: ${sessionId}\n${summary}`;
  }

  async sendSolutionMessage(solutions = [], sessionId = null) {
    const provider = this.provider;
    if (solutions.length === 0) return;

    const lines = ["", "=== SOLUTION ===", ""];
    solutions.forEach((entry, index) => {
      lines.push(this.formatSolutionEntry(entry, { index, total: solutions.length }));
      lines.push("");
    });

    if (sessionId) {
      const state = provider.activeSessions.get(sessionId);
      const planning = state?.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION) || {};
      if (planning.planningRoute) {
        lines.push(`Route: ${planning.planningRoute}`);
        if (planning.planningSessionId) {
          lines.push(`Planning poll: ${planning.planningSessionId}`);
        }
        if (planning.golemRoleName) {
          lines.push(`Golem role: ${planning.golemRoleName}`);
        }
        lines.push("");
      }
    }

    await provider.sendStatusMessage(lines.join("\n"), { forceChat: true });
  }

  async sendFinalAnswer(sessionId, solutions = []) {
    const provider = this.provider;
    const state = provider.activeSessions.get(sessionId);
    const problemDescription =
      state?.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION)?.problemDescription || "";
    if (!problemDescription || !/^\s*Q:\s*/i.test(problemDescription)) return;

    const answer = deriveSyllogismAnswer(problemDescription);
    if (!answer) {
      const executionError = solutions.find((entry) => entry.solution?.executionError)
        ?.solution?.executionError;
      const fallback = executionError
        ? `Answer: Unable to derive a concise answer (execution error: ${executionError}).`
        : "Answer: Unable to derive a concise answer from the solution.";
      await provider.sendStatusMessage(fallback, { sessionId, forceChat: true });
      return;
    }

    await provider.sendStatusMessage(`Answer: ${answer}`, { sessionId, forceChat: true });
  }

  formatSolutionEntry(entry, { index = 0, total = 1 } = {}) {
    const solution = entry.solution;
    const sender = entry.sender;
    const lines = [];

    if (total > 1) {
      lines.push(`Solution #${index + 1} (from ${sender}):`);
    } else {
      lines.push(`Solution from ${sender}:`);
    }

    if (solution.message) {
      lines.push(`  ${solution.message}`);
    }

    if (Array.isArray(solution.plan) && solution.plan.length > 0) {
      lines.push(`  Plan steps:`);
      solution.plan.forEach((step, i) => {
        lines.push(`    ${i + 1}. ${step}`);
      });
    }

    if (Array.isArray(solution.bindings) && solution.bindings.length > 0) {
      lines.push(`  Bindings:`);
      solution.bindings.forEach((binding, i) => {
        lines.push(`    ${i + 1}. ${binding}`);
      });
    }

    if (solution.executionError) {
      lines.push(`  Execution error: ${solution.executionError}`);
    }

    if (Array.isArray(solution.satisfiesGoals) && solution.satisfiesGoals.length > 0) {
      lines.push(`  Achieves goals:`);
      solution.satisfiesGoals.forEach((g) => {
        const status = g.satisfied ? "✓" : "✗";
        lines.push(`    ${status} ${g.goal}`);
      });
    }

    if (solution.success === false) {
      lines.push(`  Status: ⚠️  ${solution.message || "Failed to generate solution"}`);
    }

    return lines.join("\n");
  }

  async broadcastSessionComplete(sessionId, solutions = []) {
    const provider = this.provider;
    const payload = {
      messageType: MFR_MESSAGE_TYPES.SESSION_COMPLETE,
      sessionId,
      solutions: solutions.map((entry) => entry.solution),
      timestamp: new Date().toISOString()
    };

    const summary = `Session complete ${sessionId} (${solutions.length} solution(s))`;

    if (provider.negotiator && provider.primaryRoomJid) {
      await provider.negotiator.send(provider.primaryRoomJid, {
        mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
        payload,
        summary
      });
    }
  }

  summarizeSolutions(sessionId, solutions = []) {
    const lines = [
      `Solutions received: ${solutions.length}`
    ];

    solutions.forEach((entry, index) => {
      const label = entry.solution?.message || "Solution proposal";
      lines.push(`${index + 1}. ${label} (from ${entry.sender})`);

      const plan = entry.solution?.plan;
      if (Array.isArray(plan) && plan.length > 0) {
        lines.push(`   Plan: ${plan.join(", ")}`);
      }
    });

    return lines.join("\n");
  }
}
