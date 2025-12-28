import { xml } from "@xmpp/client";
import { LANGUAGE_MODES, LINGUE_NS, MIME_TYPES } from "../../../lib/lingue/constants.js";
import { MFR_PHASES } from "../../../lib/mfr/constants.js";
import { isProcessStatusMessage } from "./utils.js";

export class MessagingCoordinator {
  constructor(provider) {
    this.provider = provider;
  }

  async sendStatusMessage(message, { sessionId = null, system = false, forceChat = false } = {}) {
    const provider = this.provider;
    if (!message) return;
    if (!provider.primaryRoomJid || !provider.negotiator?.xmppClient) return;

    const verbose = sessionId ? this.getSessionVerbose(sessionId) : true;
    const prefix = system ? "SYS: " : "";
    const isProcess = isProcessStatusMessage(message);

    if (system) {
      await this.sendLingueStatusPayload({ message, sessionId });
    }

    if (isProcess && !forceChat) {
      await this.sendLogMessage(`${prefix}${message}`);
      return;
    }

    if (forceChat || !system || verbose) {
      await provider.negotiator.xmppClient.send(
        xml(
          "message",
          { to: provider.primaryRoomJid, type: "groupchat" },
          xml("body", {}, `${prefix}${message}`)
        )
      );
    }
  }

  async sendLogMessage(message) {
    const provider = this.provider;
    if (!message) return;
    if (!provider.logRoomJid || !provider.negotiator?.xmppClient) return;
    await provider.negotiator.xmppClient.send(
      xml(
        "message",
        { to: provider.logRoomJid, type: "groupchat" },
        xml("body", {}, message)
      )
    );
  }

  getSessionVerbose(sessionId) {
    const provider = this.provider;
    const debateData = provider.activeDebates.get(sessionId);
    if (debateData?.verbose) return true;

    const state = provider.activeSessions.get(sessionId);
    const problemData = state?.getPhaseData(MFR_PHASES.PROBLEM_INTERPRETATION);
    if (problemData?.verbose) return true;
    const debatePhase = state?.getPhaseData(MFR_PHASES.TOOL_SELECTION_DEBATE);
    return !!debatePhase?.verbose;
  }

  async maybeReportLingueMode(sessionId, { direction, mode, mimeType, detail }) {
    const provider = this.provider;
    if (!sessionId || !this.getSessionVerbose(sessionId)) {
      return;
    }
    const modeLabel = mode?.split("/").pop() || mode || "unknown";
    const line = `Lingue ${direction} ${modeLabel} (${mimeType})${detail ? ` — ${detail}` : ""}`;
    provider.logger.info?.(`[CoordinatorProvider] ${line} [${sessionId}]`);
    await this.sendStatusMessage(line, { sessionId, system: true, forceChat: true });
  }

  async sendLingueStatusPayload({ message, sessionId }) {
    const provider = this.provider;
    const payload = JSON.stringify({
      type: "status",
      sessionId,
      message,
      timestamp: new Date().toISOString()
    });
    await provider.negotiator.xmppClient.send(
      xml(
        "message",
        { to: provider.primaryRoomJid, type: "groupchat" },
        xml("body", {}, ""),
        xml(
          "payload",
          {
            xmlns: LINGUE_NS,
            mime: MIME_TYPES.HUMAN_CHAT,
            mode: LANGUAGE_MODES.HUMAN_CHAT
          },
          payload
        )
      )
    );
  }

  async sendConsensusDirectPrompts(sessionId, problemDescription) {
    const provider = this.provider;
    if (!provider.negotiator?.xmppClient) return;
    const recipients = Array.from(provider.agentRegistry.values() || [])
      .map((entry) => ({
        nickname: entry?.nickname,
        jid: entry?.jid
      }))
      .filter((entry) => entry.nickname && entry.jid)
      .filter((entry) => entry.nickname.toLowerCase() !== "coordinator");

    if (recipients.length === 0) {
      await this.sendLogMessage(`[Consensus DM] ${sessionId} no recipients with JIDs.`);
      return;
    }

    const promptLines = [
      `Consensus request ${sessionId}`,
      `Question: ${problemDescription}`,
      `Please reply in ${provider.primaryRoomJid} with lines starting:`,
      `Position: ...`,
      `Support: ...`,
      `Objection: ...`,
      `Example: Position: Prioritize stability for a reliable release.`
    ];
    const prompt = promptLines.join("\n");

    await this.sendLogMessage(
      `[Consensus DM] ${sessionId} sending to ${recipients.length} agent(s).`
    );

    for (const recipient of recipients) {
      try {
        await provider.negotiator.xmppClient.send(
          xml(
            "message",
            { to: recipient.jid, type: "chat" },
            xml("body", {}, prompt)
          )
        );
        await this.sendLogMessage(
          `[Consensus DM] ${sessionId} sent to ${recipient.nickname} (${recipient.jid}).`
        );
      } catch (error) {
        await this.sendLogMessage(
          `[Consensus DM] ${sessionId} failed for ${recipient.nickname} (${recipient.jid}): ${error.message}`
        );
      }
    }
  }
}
