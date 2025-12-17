import { client, xml } from "@xmpp/client";
import dotenv from "dotenv";

dotenv.config();

// MUC Configuration (env overrides)
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = process.env.DEMO_BOT_NICKNAME || process.env.BOT_NICKNAME || "DemoBot";

// XMPP Configuration (env overrides)
const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  resource:
    process.env.DEMO_XMPP_RESOURCE ||
    process.env.XMPP_RESOURCE ||
    BOT_NICKNAME,
  tls: { rejectUnauthorized: false }
};

// Demo responses (no API required)
const DEMO_RESPONSES = [
  "Woof! I'm a demo bot. I'd normally use Mistral AI for responses.",
  "That's an interesting question! In a real deployment, I'd use AI to answer.",
  "I'm just a demo right now, but imagine I had the power of Mistral AI!",
  "Bark bark! Demo mode active. Set MISTRAL_API_KEY for real AI responses.",
  "Good question! I'd love to help with that using proper AI responses.",
  "Demo bot here! I can simulate conversations but need Mistral AI for real intelligence."
];

class DemoBot {
  constructor() {
    this.xmpp = client(XMPP_CONFIG);
    this.nickname = BOT_NICKNAME;
    this.joinAttempts = 0;
    this.maxJoinRetries = 3;
    this.setupEventHandlers();
    this.isInRoom = false;
  }

  setupEventHandlers() {
    this.xmpp.on("error", (err) => {
      console.error("XMPP Error:", err);
    });

    this.xmpp.on("offline", () => {
      console.log("Demo bot is offline");
      this.isInRoom = false;
    });

    this.xmpp.on("online", async (address) => {
      console.log(`Demo bot connected as ${address.toString()}`);
      await this.joinMUC();
    });

    this.xmpp.on("stanza", async (stanza) => {
      await this.handleStanza(stanza);
    });
  }

  async joinMUC() {
    try {
      const presence = xml(
        "presence",
        { to: `${MUC_ROOM}/${this.nickname}` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      );
      
      await this.xmpp.send(presence);
      console.log(`Joining MUC room: ${MUC_ROOM} as ${this.nickname}`);
    } catch (err) {
      console.error("Failed to join MUC:", err);
    }
  }

  async handleStanza(stanza) {
    // Handle presence errors (e.g., nick conflict)
    if (stanza.is("presence") && stanza.attrs.type === "error" && stanza.attrs.from?.startsWith(MUC_ROOM)) {
      const errorNode = stanza.getChild("error");
      const conflict = errorNode?.getChild("conflict");
      if (conflict && this.joinAttempts < this.maxJoinRetries) {
        this.joinAttempts += 1;
        const newNick = `${BOT_NICKNAME}-${Math.random().toString(16).slice(2, 6)}`;
        console.warn(`[DemoBot] Nickname conflict, retrying as ${newNick} (${this.joinAttempts}/${this.maxJoinRetries})`);
        this.nickname = newNick;
        await this.joinMUC();
        return;
      }
      console.error(`[DemoBot] Presence error from room: ${errorNode ? errorNode.toString() : "unknown"}`);
      return;
    }

    // Handle MUC presence confirmations
    if (stanza.is("presence") && stanza.attrs.from?.startsWith(MUC_ROOM)) {
      if (stanza.attrs.from === `${MUC_ROOM}/${this.nickname}`) {
        this.isInRoom = true;
        console.log(`Successfully joined MUC room as ${this.nickname}`);
        
        // Send welcome message
        setTimeout(async () => {
          await this.sendWelcomeMessage();
        }, 1000);
      }
      return;
    }

    // Handle MUC messages
    if (stanza.is("message") && stanza.attrs.type === "groupchat") {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      
      if (!body || !from || from.endsWith(`/${this.nickname}`)) {
        return; // Ignore empty messages or our own messages
      }

      const sender = from.split('/')[1] || 'unknown';
      console.log(`[${sender}]: ${body}`);

      // Respond if mentioned or if message starts with "bot:"
      const shouldRespond = body.toLowerCase().includes(BOT_NICKNAME.toLowerCase()) || 
                           body.toLowerCase().includes('demobot') ||
                           body.toLowerCase().startsWith('bot:') ||
                           body.includes('@demobot');

      if (shouldRespond) {
        await this.sendDemoResponse(sender);
      }
    }
  }

  async sendWelcomeMessage() {
    if (!this.isInRoom || !this.xmpp?.socket) {
      console.warn("[DemoBot] Skipping welcome message; not connected or socket unavailable");
      return;
    }

    const welcomeMsg = "🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!";
    
    const message = xml(
      "message",
      { type: "groupchat", to: MUC_ROOM },
      xml("body", {}, welcomeMsg)
    );

    try {
      await this.xmpp.send(message);
      console.log(`Sent welcome message`);
    } catch (err) {
      console.error("[DemoBot] Failed to send welcome message:", err.message);
    }
  }

  async sendDemoResponse(sender) {
    try {
      if (!this.isInRoom || !this.xmpp?.socket) {
        console.warn("[DemoBot] Skipping response; not connected or socket unavailable");
        return;
      }
      // Pick a random demo response
      const response = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
      const reply = `@${sender} ${response}`;
      
      if (this.isInRoom) {
        const mucMessage = xml(
          "message",
          { type: "groupchat", to: MUC_ROOM },
          xml("body", {}, reply)
        );

        await this.xmpp.send(mucMessage);
        console.log(`Demo bot replied: ${reply}`);
      }
    } catch (err) {
      console.error("Failed to send demo response:", err);
    }
  }

  async start() {
    try {
      console.log("Starting Demo Bot...");
      console.log("This is a demo version that doesn't require Mistral API");
      await this.xmpp.start();
    } catch (err) {
      console.error("Failed to start demo bot:", err);
      process.exit(1);
    }
  }

  async stop() {
    try {
      console.log("Stopping Demo Bot...");
      await this.xmpp.stop();
    } catch (err) {
      console.error("Failed to stop demo bot:", err);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log("\nReceived SIGINT, shutting down gracefully...");
  if (bot) {
    await bot.stop();
  }
  process.exit(0);
});

// Start the demo bot
const bot = new DemoBot();
bot.start().catch(console.error);
