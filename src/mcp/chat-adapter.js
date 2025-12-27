import { XmppRoomAgent } from "../lib/xmpp-room-agent.js";
import { profileToTurtle } from "../agents/profile-loader.js";

export class McpChatAdapter {
  constructor({
    xmppConfig,
    roomJid,
    nickname,
    profile,
    negotiator = null,
    logger = console,
    maxBufferedMessages = 50,
    extraRooms = []
  }) {
    this.xmppConfig = xmppConfig;
    this.roomJid = roomJid;
    this.nickname = nickname;
    this.profile = profile;
    this.negotiator = negotiator;
    this.logger = logger;
    this.maxBufferedMessages = maxBufferedMessages;
    this.extraRooms = Array.isArray(extraRooms) ? extraRooms.filter(Boolean) : [];
    this.messageBuffer = [];
    this.agent = new XmppRoomAgent({
      xmppConfig,
      roomJid,
      nickname,
      onMessage: (message) => this.recordMessage(message),
      allowSelfMessages: true,
      logger
    });
  }

  recordMessage(message) {
    try {
      const { body, sender, from, roomJid, type } = message;
      const entry = {
        body,
        sender,
        from,
        roomJid,
        type,
        timestamp: new Date().toISOString()
      };
      this.messageBuffer.push(entry);
      if (this.messageBuffer.length > this.maxBufferedMessages) {
        this.messageBuffer.splice(0, this.messageBuffer.length - this.maxBufferedMessages);
      }
    } catch (err) {
      this.logger.warn?.("[MCP] Failed to record message:", err);
    }
  }

  getRecentMessages({ limit = 20, roomJid = null } = {}) {
    const safeLimit = Math.max(1, Math.min(limit, this.maxBufferedMessages));
    const messages = roomJid
      ? this.messageBuffer.filter((entry) => entry.roomJid === roomJid)
      : this.messageBuffer;
    return messages.slice(-safeLimit);
  }

  async start() {
    await this.agent.start();
    for (const room of this.extraRooms) {
      if (room && room !== this.roomJid) {
        await this.agent.joinAdditionalRoom(room);
      }
    }
  }

  async stop() {
    await this.agent.stop();
  }

  async sendMessage({ text, directJid = null, roomJid = null }) {
    if (directJid) {
      await this.agent.sendDirectMessage(directJid, text);
      return { sent: true, to: directJid, type: "chat" };
    }
    if (roomJid && roomJid !== this.roomJid) {
      await this.agent.sendToRoom(roomJid, text);
      return { sent: true, to: roomJid, type: "groupchat" };
    }
    await this.agent.sendGroupMessage(text);
    return { sent: true, to: this.roomJid, type: "groupchat" };
  }

  async offerLingueMode({ peerJid, modes }) {
    if (!this.negotiator) {
      throw new Error("Lingue negotiator not configured");
    }
    await this.negotiator.offerExchange(peerJid, modes);
    return { offered: true, peerJid, modes };
  }

  async getProfileTurtle() {
    if (!this.profile) return "";
    return await profileToTurtle(this.profile);
  }
}
