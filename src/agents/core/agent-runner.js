import { XmppRoomAgent } from "../../lib/xmpp-room-agent.js";
import { createMentionDetector } from "./mention-detector.js";
import { defaultCommandParser } from "./command-parser.js";

export class AgentRunner {
  constructor({
    profile,
    xmppConfig,
    roomJid,
    nickname,
    provider,
    negotiator = null,
    mentionDetector,
    commandParser,
    allowSelfMessages = false,
    respondToAll = false,
    agentRoster = [],
    maxAgentRounds = 5,
    logger = console
  }) {
    if (!provider?.handle) {
      throw new Error("AgentRunner requires a provider with a handle() method");
    }

    const profileConfig = profile?.toConfig ? profile.toConfig() : {};
    const resolvedXmppConfig = profileConfig.xmpp || xmppConfig;
    const resolvedRoomJid = profileConfig.roomJid || roomJid;
    const resolvedNickname = profileConfig.nickname || nickname;

    this.nickname = resolvedNickname;
    this.provider = provider;
    this.negotiator = negotiator;
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
      logger
    });

    if (this.negotiator?.setXmppClient) {
      this.negotiator.setXmppClient(this.agent.xmpp);
    } else if (this.negotiator) {
      this.negotiator.xmppClient = this.agent.xmpp;
    }
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
      reply
    });

    if (typeof result === "string" && result.trim()) {
      await reply(result);
    }
  }

  async start() {
    await this.agent.start();
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
}

export default AgentRunner;
