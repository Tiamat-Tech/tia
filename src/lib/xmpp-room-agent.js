import { client, xml } from "@xmpp/client";

export class XmppRoomAgent {
  constructor({ xmppConfig, roomJid, nickname, onMessage, allowSelfMessages = false, logger = console }) {
    this.xmpp = client(xmppConfig);
    this.roomJid = roomJid;
    this.nickname = nickname;
    this.onMessage = onMessage;
    this.logger = logger;
    this.isInRoom = false;
    this.allowSelfMessages = allowSelfMessages;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.xmpp.on("error", (err) => {
      this.logger.error("XMPP Error:", err);
    });

    this.xmpp.on("offline", () => {
      this.logger.info("Agent offline");
      this.isInRoom = false;
    });

    this.xmpp.on("online", async (address) => {
      this.logger.info(`Agent connected as ${address.toString()}`);
      await this.joinRoom();
    });

    this.xmpp.on("stanza", async (stanza) => {
      if (stanza.is("presence") && stanza.attrs.from?.startsWith(this.roomJid)) {
        if (stanza.attrs.from === `${this.roomJid}/${this.nickname}`) {
          this.isInRoom = true;
          this.logger.info(`Joined room ${this.roomJid}`);
        }
        return;
      }

      if (!stanza.is("message")) return;
      const type = stanza.attrs.type;
      const body = stanza.getChildText("body");
      if (!body) return;

      if (type === "groupchat") {
        const from = stanza.attrs.from;
        if (
          !from ||
          (!this.allowSelfMessages && from.endsWith(`/${this.nickname}`)) ||
          stanza.getChild("delay")
        ) {
          return;
        }
        const sender = from.split("/")[1] || "unknown";
        this.logger.debug?.(`Groupchat from ${sender}: ${body}`);
        if (this.onMessage) {
          await this.onMessage({
            body,
            sender,
            from,
            roomJid: this.roomJid,
            type: "groupchat",
            reply: (text) => this.sendGroupMessage(text)
          });
        }
      }

      if (type === "chat") {
        const from = stanza.attrs.from;
        if (!from) return;
        this.logger.debug?.(`Direct message from ${from}: ${body}`);
        if (this.onMessage) {
          await this.onMessage({
            body,
            sender: from.split("@")[0],
            from,
            roomJid: null,
            type: "chat",
            reply: (text) => this.sendDirectMessage(from, text)
          });
        }
      }
    });
  }

  async joinRoom() {
    const presence = xml(
      "presence",
      { to: `${this.roomJid}/${this.nickname}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );
    await this.xmpp.send(presence);
    this.logger.info(`Joining room ${this.roomJid}`);
  }

  async sendGroupMessage(message) {
    if (!this.isInRoom) {
      this.logger.warn("Cannot send group message before joining the room");
      return;
    }
    const mucMessage = xml(
      "message",
      { type: "groupchat", to: this.roomJid },
      xml("body", {}, message)
    );
    await this.xmpp.send(mucMessage);
  }

  async sendDirectMessage(jid, message) {
    const directMessage = xml("message", { type: "chat", to: jid }, xml("body", {}, message));
    await this.xmpp.send(directMessage);
  }

  async start() {
    await this.xmpp.start();
  }

  async stop() {
    this.logger.info("Stopping agent");
    await this.xmpp.stop();
  }
}

export default XmppRoomAgent;
