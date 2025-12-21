import { client, xml } from "@xmpp/client";
import { LINGUE_NS } from "./lingue/constants.js";
import { autoConnectXmpp } from "./xmpp-auto-connect.js";

export class XmppRoomAgent {
  constructor({
    xmppConfig,
    roomJid,
    nickname,
    onMessage,
    allowSelfMessages = false,
    onConflictRename = true,
    maxJoinRetries = 3,
    reconnect = true,
    reconnectDelayMs = 2000,
    maxReconnectDelayMs = 30000,
    autoRegister = false,
    secretsPath,
    logger = console
  }) {
    this.xmppConfig = xmppConfig;
    this.autoRegister = autoRegister;
    this.secretsPath = secretsPath;
    this.xmpp = null;  // Will be set in start()
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
    this.joinWaiters = [];
    this.pendingGroupMessages = [];
    this.reconnect = reconnect;
    this.reconnectDelayMs = reconnectDelayMs;
    this.maxReconnectDelayMs = maxReconnectDelayMs;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.manualStop = false;
    this.isOnline = false;
  }

  setupEventHandlers() {
    this.xmpp.on("error", (err) => {
      this.logger.error("XMPP Error:", err);
      if (!this.manualStop && this.reconnect && (!this.isOnline || err.condition === "conflict")) {
        this.scheduleReconnect("error");
      }
    });

    this.xmpp.on("offline", () => {
      this.logger.info("Agent offline");
      this.isInRoom = false;
      this.isOnline = false;
      if (!this.manualStop && this.reconnect) {
        this.scheduleReconnect("offline");
      }
    });

    this.xmpp.on("online", async (address) => {
      this.logger.info(`Agent connected as ${address.toString()}`);
      this.isOnline = true;
      this.reconnectAttempts = 0;
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
          this.resolveJoinWaiters();
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
      this.pendingGroupMessages.push(message);
      await this.waitForJoin();
    }
    this.logger.info(`Sending group message to ${this.roomJid} as ${this.currentNickname}`);
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
    this.manualStop = false;

    // Create XMPP client (with auto-registration if enabled)
    if (this.autoRegister) {
      this.logger.info("[XmppRoomAgent] Auto-registration enabled, attempting connection...");
      try {
        const { xmpp, credentials } = await autoConnectXmpp({
          service: this.xmppConfig.service,
          domain: this.xmppConfig.domain,
          username: this.xmppConfig.username,
          password: this.xmppConfig.password,
          resource: this.xmppConfig.resource,
          tls: this.xmppConfig.tls,
          secretsPath: this.secretsPath,
          autoRegister: true,
          logger: this.logger
        });

        this.xmpp = xmpp;
        this.isOnline = true;
        this.reconnectAttempts = 0;
        this.logger.info(`[XmppRoomAgent] Connected successfully${credentials.registered ? ' (new account registered)' : ''}`);
      } catch (err) {
        this.logger.error("[XmppRoomAgent] Auto-connect failed:", err.message);
        throw err;
      }
    } else {
      // Regular connection (no auto-registration)
      this.xmpp = client(this.xmppConfig);
    }

    // Setup event handlers now that xmpp client exists
    this.setupEventHandlers();

    // Start the client if not already started (autoConnectXmpp already starts it)
    if (!this.autoRegister) {
      await this.xmpp.start();
    } else {
      // autoConnectXmpp resolves after "online" fires, so we need to join explicitly
      await this.joinRoom();
    }
  }

  async stop() {
    this.logger.info("Stopping agent");
    this.manualStop = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    await this.xmpp.stop();
  }

  scheduleReconnect(reason = "unknown") {
    if (this.reconnectTimer) return;
    const attempt = this.reconnectAttempts + 1;
    const delay = Math.min(
      this.maxReconnectDelayMs,
      this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts)
    );
    this.reconnectAttempts = attempt;
    this.logger.warn(`Reconnecting after ${delay}ms (attempt ${attempt}, reason: ${reason})`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.manualStop) return;
      try {
        await this.xmpp.stop().catch(() => {});
        await this.xmpp.start();
      } catch (err) {
        this.logger.error("Reconnect failed:", err);
        if (this.reconnect && !this.manualStop) {
          this.scheduleReconnect("retry");
        }
      }
    }, delay).unref?.();
  }

  resolveJoinWaiters() {
    if (!this.isInRoom) return;
    const waiters = this.joinWaiters;
    this.joinWaiters = [];
    waiters.forEach(({ resolve }) => resolve());
    if (this.pendingGroupMessages.length) {
      const pending = this.pendingGroupMessages;
      this.pendingGroupMessages = [];
      pending.forEach((message) => {
        this.sendGroupMessage(message).catch((err) => {
          this.logger.warn("Failed to send queued group message:", err);
        });
      });
    }
  }

  waitForJoin() {
    if (this.isInRoom) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out waiting for room join"));
      }, 15000);
      this.joinWaiters.push({
        resolve: () => {
          clearTimeout(timeout);
          resolve();
        },
        reject
      });
    });
  }
}

export default XmppRoomAgent;
