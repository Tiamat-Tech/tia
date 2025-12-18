import { XmppRoomAgent } from "../../lib/xmpp-room-agent.js";
import { createMentionDetector } from "./mention-detector.js";
import { defaultCommandParser } from "./command-parser.js";

export class AgentRunner {
  constructor({
    xmppConfig,
    roomJid,
    nickname,
    provider,
    mentionDetector,
    commandParser,
    allowSelfMessages = false,
    logger = console
  }) {
    if (!provider?.handle) {
      throw new Error("AgentRunner requires a provider with a handle() method");
    }

    this.nickname = nickname;
    this.provider = provider;
    this.mentionDetector =
      mentionDetector || createMentionDetector(nickname, [nickname?.toLowerCase()]);
    this.commandParser = commandParser || defaultCommandParser;
    this.logger = logger;

    this.agent = new XmppRoomAgent({
      xmppConfig,
      roomJid,
      nickname,
      onMessage: this.handleMessage.bind(this),
      allowSelfMessages,
      logger
    });
  }

  async handleMessage({ body, sender, type, roomJid, reply }) {
    const addressed = type === "chat" || this.mentionDetector(body);
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
