import { randomUUID } from "crypto";
import { MfrShaclValidator } from "../../../lib/mfr/shacl-validator.js";
import { RdfUtils } from "../../../lib/mfr/rdf-utils.js";
import { MFR_MESSAGE_TYPES, MFR_PHASES } from "../../../lib/mfr/constants.js";
import { LANGUAGE_MODES } from "../../../lib/lingue/constants.js";
import { isQuietRequest, isVerboseRequest } from "./utils.js";
import { MfrProtocolState } from "../../../lib/mfr/protocol-state.js";

export class WorkflowCoordinator {
  constructor(provider) {
    this.provider = provider;
  }

  async startMfrSession(problemDescription, metadata, reply) {
    const provider = this.provider;
    const sessionId = randomUUID();
    const verbose = isVerboseRequest(problemDescription);
    const quiet = isQuietRequest(problemDescription);
    const planningRoute = metadata?.planningRoute || null;
    const planningSessionId = metadata?.planningSessionId || null;
    const golemRoleName = metadata?.golemRoleName || null;

    provider.logger.info?.(
      `[CoordinatorProvider] Starting MFR session: ${sessionId}`
    );

    const state = new MfrProtocolState(sessionId, { logger: provider.logger });
    provider.activeSessions.set(sessionId, state);

    await provider.modelStore.createModel(sessionId, problemDescription);

    state.transition(MFR_PHASES.PROBLEM_INTERPRETATION, {
      problemDescription,
      startedBy: metadata?.sender,
      verbose,
      quiet,
      planningRoute,
      planningSessionId,
      golemRoleName
    });

    state.transition(MFR_PHASES.ENTITY_DISCOVERY);

    await provider.assignGolemRole(sessionId, problemDescription, MFR_PHASES.ENTITY_DISCOVERY);

    await provider.broadcastContributionRequest(sessionId, problemDescription);

    if (quiet) {
      return `MFR session started: ${sessionId}.`;
    }
    return verbose
      ? `MFR session started: ${sessionId}\nWaiting for agent contributions...`
      : `MFR session started: ${sessionId}.`;
  }

  async handleContribution(content, metadata, reply) {
    const provider = this.provider;
    let sessionId = metadata?.sessionId;

    if (!sessionId && typeof content === "object" && content.sessionId) {
      sessionId = content.sessionId;
    }

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    const state = provider.activeSessions.get(sessionId);
    if (!state) {
      provider.logger.warn?.(
        `[CoordinatorProvider] Ignoring contribution for unknown session ${sessionId}`
      );
      return null;
    }

    const agentId = metadata?.sender || "unknown";

    provider.logger.debug?.(
      `[CoordinatorProvider] Receiving contribution from ${agentId} for ${sessionId}`
    );

    await provider.maybeReportLingueMode(sessionId, {
      direction: "<-",
      mode: LANGUAGE_MODES.MODEL_FIRST_RDF,
      mimeType: "text/turtle",
      detail: `ModelFirstRDF from ${agentId}`
    });

    let contributionRdf;
    if (typeof content === "string") {
      contributionRdf = content;
    } else if (content.rdf) {
      contributionRdf = content.rdf;
    } else {
      return "Error: Invalid contribution format";
    }

    await provider.modelStore.addContribution(
      sessionId,
      agentId,
      contributionRdf,
      metadata
    );

    const expected = provider.expectedContributions.get(sessionId);
    if (expected) {
      expected.add(agentId);
    }

    return null;
  }

  setContributionTimeout(sessionId) {
    const provider = this.provider;
    if (!Number.isFinite(provider.contributionTimeoutMs)) {
      throw new Error("Contribution timeout missing or invalid; check profile mfrConfig.");
    }
    setTimeout(async () => {
      const state = provider.activeSessions.get(sessionId);
      if (!state || !state.isActive()) {
        return;
      }

      if (
        state.isPhase(MFR_PHASES.ENTITY_DISCOVERY) ||
        state.isPhase(MFR_PHASES.CONSTRAINT_IDENTIFICATION) ||
        state.isPhase(MFR_PHASES.ACTION_DEFINITION)
      ) {
        provider.logger.info?.(
          `[CoordinatorProvider] Contribution timeout for ${sessionId}, proceeding to merge`
        );

        await this.proceedToMerge(sessionId);
      }
    }, provider.contributionTimeoutMs);
  }

  async proceedToMerge(sessionId) {
    const provider = this.provider;
    const state = provider.activeSessions.get(sessionId);
    if (!state) return;

    provider.logger.info?.(`[CoordinatorProvider] Merging model for ${sessionId}`);

    state.transition(MFR_PHASES.MODEL_MERGE);

    await provider.modelStore.mergeContributions(sessionId);

    const stats = await provider.modelStore.getModelStats(sessionId);
    provider.logger.debug?.(
      `[CoordinatorProvider] Merged model: ${stats.quadCount} quads from ${stats.contributorCount} contributors`
    );

    await this.proceedToValidation(sessionId);
  }

  async validateModel(sessionIdOrContent, metadata, reply) {
    const sessionId =
      typeof sessionIdOrContent === "string"
        ? sessionIdOrContent
        : sessionIdOrContent?.sessionId || metadata?.sessionId;

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    return await this.proceedToValidation(sessionId);
  }

  async proceedToValidation(sessionId) {
    const provider = this.provider;
    const state = provider.activeSessions.get(sessionId);
    if (!state) {
      return `Error: Session ${sessionId} not found`;
    }

    provider.logger.info?.(
      `[CoordinatorProvider] Validating model for ${sessionId}`
    );

    state.transition(MFR_PHASES.MODEL_VALIDATION);

    if (!provider.validator) {
      const shapesGraph = await provider.shapesLoader.loadMfrShapes();
      provider.validator = new MfrShaclValidator({
        shapesGraph,
        logger: provider.logger
      });
    }

    const model = await provider.modelStore.getModel(sessionId);
    if (!model) {
      return `Error: Model not found for session ${sessionId}`;
    }

    const quadCount = RdfUtils.countQuads(model);
    const modelUri = `http://purl.org/stuff/mfr/model/${sessionId}`;
    const hasEntityPredicate = `http://purl.org/stuff/mfr/hasEntity`;
    const entityLinks = RdfUtils.queryBySubject(model, modelUri).filter(
      q => q.predicate.value === hasEntityPredicate
    );
    provider.logger.info?.(
      `[CoordinatorProvider] Model has ${quadCount} quads, ${entityLinks.length} hasEntity links`
    );

    const report = await provider.validator.validateCompleteness(model);

    const conflicts = await provider.merger.detectConflicts(model);

    const hasErrors = report.violations.some(v => {
      const severity = provider.validator.normalizeTerm(v.resultSeverity);
      return severity === "Violation" || severity === "http://www.w3.org/ns/shacl#Violation";
    });

    if (report.conforms && conflicts.length === 0) {
      state.transition(MFR_PHASES.CONSTRAINED_REASONING);

      const message = `Model validation passed for ${sessionId}\n${RdfUtils.countQuads(model)} quads validated\nProceeding to reasoning phase...`;

      provider.logger.info?.(`[CoordinatorProvider] ${message}`);
      await provider.sendStatusMessage(message, { sessionId, system: true });

      const reasoningMessage = await this.initiateReasoning(sessionId, {}, () => {});
      if (reasoningMessage) {
        await provider.sendStatusMessage(reasoningMessage, { sessionId, system: true });
      }

      return message;
    } else if (!hasErrors && conflicts.length === 0) {
      state.transition(MFR_PHASES.CONSTRAINED_REASONING);

      const summary = provider.validator.formatValidationSummary(report);
      const message = `Model validation completed with warnings for ${sessionId}:\n${summary}\n\nProceeding to reasoning phase...`;

      provider.logger.info?.(`[CoordinatorProvider] ${message}`);
      await provider.sendStatusMessage(message, { sessionId, system: true });

      const reasoningMessage = await this.initiateReasoning(sessionId, {}, () => {});
      if (reasoningMessage) {
        await provider.sendStatusMessage(reasoningMessage, { sessionId, system: true });
      }

      return message;
    }

    state.transition(MFR_PHASES.CONFLICT_NEGOTIATION, {
      report,
      conflicts
    });

    const summary = provider.validator.formatValidationSummary(report);
    const conflictSummary =
      conflicts.length > 0
        ? `\n\nDetected ${conflicts.length} conflict(s):\n${conflicts.map((c) => `- ${c.message}`).join("\n")}`
        : "";

    const message = `Model validation issues for ${sessionId}:\n${summary}${conflictSummary}`;
    await provider.sendStatusMessage(message, { sessionId, system: true });
    return message;
  }

  async initiateReasoning(sessionIdOrContent, metadata, reply) {
    const provider = this.provider;
    const sessionId =
      typeof sessionIdOrContent === "string"
        ? sessionIdOrContent
        : sessionIdOrContent?.sessionId || metadata?.sessionId;

    if (!sessionId) {
      return "Error: No session ID provided";
    }

    const state = provider.activeSessions.get(sessionId);
    if (!state) {
      return `Error: Session ${sessionId} not found`;
    }

    if (!state.isPhase(MFR_PHASES.CONSTRAINED_REASONING)) {
      return `Error: Session ${sessionId} is not ready for reasoning (current phase: ${state.getCurrentPhase()})`;
    }

    provider.logger.info?.(
      `[CoordinatorProvider] Initiating reasoning for ${sessionId}`
    );

    await provider.maybeReportLingueMode(sessionId, {
      direction: "->",
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: "application/json",
      detail: "SolutionRequest"
    });

    const model = await provider.modelStore.getModel(sessionId);
    const modelTurtle = await RdfUtils.serializeTurtle(model);

    const message = {
      messageType: MFR_MESSAGE_TYPES.SOLUTION_REQUEST,
      sessionId,
      model: modelTurtle,
      verbose: provider.getSessionVerbose(sessionId),
      timestamp: new Date().toISOString()
    };

    const targetRooms = new Set();

    if (provider.primaryRoomJid) {
      targetRooms.add(provider.primaryRoomJid);
    }

    if (provider.negotiator && targetRooms.size > 0) {
      const summary = `MFR solution request for ${sessionId}`;
      provider.logger.info?.(
        `[CoordinatorProvider] Broadcasting solution request to ${targetRooms.size} room(s)`
      );
      for (const roomJid of targetRooms) {
        provider.logger.info?.(
          `[CoordinatorProvider] Sending solution request to ${roomJid}`
        );
        await provider.negotiator.send(roomJid, {
          mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
          payload: message,
          summary
        });
      }
    }

    return `Solution request broadcast for ${sessionId}\nWaiting for agent solutions...`;
  }
}
