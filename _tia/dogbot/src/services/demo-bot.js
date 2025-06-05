import { client, xml } from "@xmpp/client";

// XMPP Configuration
const XMPP_CONFIG = {
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "dogbot",
  password: "woofwoof",
  tls: { rejectUnauthorized: false }
};

// MUC Configuration
const MUC_ROOM = "general@conference.xmpp";
const BOT_NICKNAME = "DemoBot";

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
        { to: `${MUC_ROOM}/${BOT_NICKNAME}` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      );
      
      await this.xmpp.send(presence);
      console.log(`Joining MUC room: ${MUC_ROOM}`);
    } catch (err) {
      console.error("Failed to join MUC:", err);
    }
  }

  async handleStanza(stanza) {
    // Handle MUC presence confirmations
    if (stanza.is("presence") && stanza.attrs.from?.startsWith(MUC_ROOM)) {
      if (stanza.attrs.from === `${MUC_ROOM}/${BOT_NICKNAME}`) {
        this.isInRoom = true;
        console.log("Successfully joined MUC room");
        
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
      
      if (!body || !from || from.endsWith(`/${BOT_NICKNAME}`)) {
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
    if (!this.isInRoom) return;
    
    const welcomeMsg = "🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!";
    
    const message = xml(
      "message",
      { type: "groupchat", to: MUC_ROOM },
      xml("body", {}, welcomeMsg)
    );
    
    await this.xmpp.send(message);
    console.log(`Sent welcome message`);
  }

  async sendDemoResponse(sender) {
    try {
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