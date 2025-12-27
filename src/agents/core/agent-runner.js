import { XmppRoomAgent } from "../../lib/xmpp-room-agent.js";
import { createMentionDetector } from "./mention-detector.js";
import { defaultCommandParser } from "./command-parser.js";

export class AgentRunner {
  constructor({
    profile,
    xmppConfig,
    roomJid,
    logRoomJid = null,
    nickname,
    provider,
    negotiator = null,
    mentionDetector,
    commandParser,
    allowSelfMessages = false,
    respondToAll = false,
    agentRoster = [],
    maxAgentRounds = 5,
    autoRegister = false,
    secretsPath,
    logger = console
  }) {
    if (!provider?.handle) {
      throw new Error("AgentRunner requires a provider with a handle() method");
    }

    const profileConfig = profile?.toConfig ? profile.toConfig() : {};
    const resolvedXmppConfig = profileConfig.xmpp || xmppConfig;
    const resolvedRoomJid = profileConfig.roomJid || roomJid;
    const resolvedNickname = profileConfig.nickname || nickname;
    const resolvedLogRoomJid = logRoomJid || "log@conference.tensegrity.it";

    this.nickname = resolvedNickname;
    this.profile = profile || null;
    this.provider = provider;
    this.negotiator = negotiator;
    this.logRoomJid = resolvedLogRoomJid;
    this.mentionDetector =
      mentionDetector || createMentionDetector(resolvedNickname, [resolvedNickname?.toLowerCase()]);
    this.commandParser = commandParser || defaultCommandParser;
    this.logger = logger;
    this.respondToAll = respondToAll;
    this.agentRoster = new Set(
      (agentRoster || [])
        .map((name) => name?.toLowerCase?.())
        .filter(Boolean)
    );
    this.maxAgentRounds = maxAgentRounds;
    this.agentRoundCount = 0;

    this.agent = new XmppRoomAgent({
      xmppConfig: resolvedXmppConfig,
      roomJid: resolvedRoomJid,
      nickname: resolvedNickname,
      onMessage: this.handleMessage.bind(this),
      allowSelfMessages,
      autoRegister,
      secretsPath,
      logger
    });
  }

  async handleMessage({ body, sender, type, roomJid, reply, stanza }) {
    if (this.negotiator && stanza) {
      const handled = await this.negotiator.handleStanza(stanza, {
        sender,
        type,
        roomJid,
        reply
      });
      if (handled) return;
    }

    if (this.isHelpRequest(body)) {
      const description = this.getHelpDescription();
      if (description) {
        await reply(description);
      }
      return;
    }

    if (this.isSystemStatus(body)) {
      this.logger.debug?.(`[AgentRunner] Ignoring system status message: ${body}`);
      return;
    }

    const senderIsAgent = this.isAgentSender(sender);
    if (senderIsAgent) {
      this.agentRoundCount += 1;
    } else {
      this.agentRoundCount = 0;
    }

    const explicitHumanAddress = type === "chat" || this.mentionDetector(body);
    if (this.shouldRequireHumanAddress() && (senderIsAgent || !explicitHumanAddress)) {
      this.logger.debug?.(
        `[AgentRunner] Suppressing message after agent rounds (${this.agentRoundCount})`
      );
      return;
    }

    const addressed = this.respondToAll || explicitHumanAddress;
    if (!addressed) {
      this.logger.debug?.(`[AgentRunner] Ignoring message (not addressed): ${body}`);
      return;
    }

    const { command, content } = this.commandParser(body);
    const metadata = { sender, type, roomJid };

    const result = await this.provider.handle({
      command,
      content,
      rawMessage: body,
      metadata,
      reply,
      sendToLog: this.sendToLog.bind(this)
    });

    if (typeof result === "string" && result.trim()) {
      await reply(result);
    }
  }

  async start() {
    await this.agent.start();

    // Setup negotiator with XMPP client after agent has started
    if (this.negotiator && this.agent.xmpp) {
      if (this.negotiator.setXmppClient) {
        this.negotiator.setXmppClient(this.agent.xmpp);
      } else {
        this.negotiator.xmppClient = this.agent.xmpp;
      }
    }

    // Join log room if specified
    if (this.logRoomJid) {
      try {
        await this.agent.joinAdditionalRoom(this.logRoomJid);
        this.logger.info?.(`[AgentRunner] Joined log room: ${this.logRoomJid}`);
      } catch (error) {
        this.logger.warn?.(`[AgentRunner] Failed to join log room ${this.logRoomJid}: ${error.message}`);
      }
    }
  }

  /**
   * Send a message to the log room
   * @param {string} message - The message to send
   */
  async sendToLog(message) {
    if (!this.logRoomJid) {
      this.logger.debug?.("[AgentRunner] No log room configured, message not sent");
      return;
    }
    if (!message || !message.trim()) {
      return;
    }
    try {
      await this.agent.sendToRoom(this.logRoomJid, message);
    } catch (error) {
      this.logger.error?.(`[AgentRunner] Failed to send to log room: ${error.message}`);
    }
  }

  async stop() {
    await this.agent.stop();
  }

  isAgentSender(sender) {
    if (!sender) return false;
    const lower = sender.toLowerCase();
    if (this.nickname && lower === this.nickname.toLowerCase()) {
      return false;
    }
    return this.agentRoster.has(lower);
  }

  shouldRequireHumanAddress() {
    if (!this.maxAgentRounds || this.maxAgentRounds < 1) return false;
    return this.agentRoundCount >= this.maxAgentRounds;
  }

  isHelpRequest(body) {
    if (!body || !this.nickname) return false;
    const trimmed = body.trim().toLowerCase();
    const nick = this.nickname.toLowerCase();
    if (!trimmed || !nick) return false;
    if (trimmed === `${nick} help` || trimmed === `help ${nick}`) return true;
    const escaped = nick.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^@?${escaped}\\s+help$|^help\\s+@?${escaped}$`, "i");
    return pattern.test(body.trim());
  }

  isSystemStatus(body) {
    if (!body) return false;
    const trimmed = body.trim();
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();
    return lower.startsWith("sys:") ||
      lower.startsWith("[mfr]") ||
      lower.startsWith("lingue ");
  }

  getHelpDescription() {
    const description = this.profile?.metadata?.description;
    if (description) {
      return `${this.nickname}: ${description}`;
    }
    if (this.profile?.identifier) {
      return `${this.nickname}: ${this.profile.identifier} agent`;
    }
    return this.nickname ? `${this.nickname}: agent` : null;
  }
}

export default AgentRunner;
