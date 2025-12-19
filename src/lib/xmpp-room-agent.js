import { client, xml } from "@xmpp/client";
import { LINGUE_NS } from "./lingue/constants.js";

export class XmppRoomAgent {
  constructor({
    xmppConfig,
    roomJid,
    nickname,
    onMessage,
    allowSelfMessages = false,
    onConflictRename = true,
    maxJoinRetries = 3,
    logger = console
  }) {
    this.xmpp = client(xmppConfig);
    this.roomJid = roomJid;
    this.nickname = nickname;
    this.currentNickname = nickname;
    this.onMessage = onMessage;
    this.logger = logger;
    this.isInRoom = false;
    this.allowSelfMessages = allowSelfMessages;
    this.onConflictRename = onConflictRename;
    this.maxJoinRetries = maxJoinRetries;
    this.joinAttempts = 0;

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
      // Handle MUC errors (e.g., nickname conflict)
      if (stanza.is("presence") && stanza.attrs.type === "error" && stanza.attrs.from?.startsWith(this.roomJid)) {
        const errorNode = stanza.getChild("error");
        const conflict = errorNode?.getChild("conflict");
        if (conflict && this.onConflictRename && this.joinAttempts < this.maxJoinRetries) {
          this.joinAttempts += 1;
          const newNick = `${this.nickname}-${Math.random().toString(16).slice(2, 6)}`;
          this.logger.warn(
            `[XMPP] Nickname conflict detected for ${this.currentNickname}. Retrying as ${newNick} (${this.joinAttempts}/${this.maxJoinRetries})`
          );
          this.currentNickname = newNick;
          await this.joinRoom();
          return;
        }
        this.logger.error(
          `[XMPP] Presence error from room ${this.roomJid}: ${errorNode ? errorNode.toString() : "unknown"}`
        );
        return;
      }

      if (stanza.is("presence") && stanza.attrs.from?.startsWith(this.roomJid)) {
        if (stanza.attrs.from === `${this.roomJid}/${this.currentNickname}`) {
          this.isInRoom = true;
          this.logger.info(`Joined room ${this.roomJid} as ${this.currentNickname}`);
        }
        return;
      }

      if (!stanza.is("message")) return;
      const type = stanza.attrs.type;
      const body = stanza.getChildText("body") || "";
      const hasLingue =
        stanza.getChild("offer", LINGUE_NS) ||
        stanza.getChild("accept", LINGUE_NS) ||
        stanza.getChild("payload", LINGUE_NS);
      if (!body && !hasLingue) return;

      if (type === "groupchat") {
        const from = stanza.attrs.from;
        if (
          !from ||
          (!this.allowSelfMessages && from.endsWith(`/${this.currentNickname}`)) ||
          stanza.getChild("delay")
        ) {
          if (this.logger.debug) {
            this.logger.debug(
              "[XMPP] Ignoring groupchat",
              JSON.stringify({
                reason: !from
                  ? "missing-from"
                  : (!this.allowSelfMessages && from.endsWith(`/${this.nickname}`))
                  ? "self-message"
                  : "delayed",
                from,
                body
              })
            );
          }
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
            reply: (text) => this.sendGroupMessage(text),
            stanza
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
            reply: (text) => this.sendDirectMessage(from, text),
            stanza
          });
        }
      }
    });
  }

  async joinRoom() {
    this.isInRoom = false;
    const presence = xml(
      "presence",
      { to: `${this.roomJid}/${this.currentNickname}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );
    await this.xmpp.send(presence);
    this.logger.info(`Joining room ${this.roomJid} as ${this.currentNickname}`);
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
