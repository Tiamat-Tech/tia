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

    const addressed = this.respondToAll || type === "chat" || this.mentionDetector(body);
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
}

export default AgentRunner;
