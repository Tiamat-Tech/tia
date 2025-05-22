import { client, xml } from "@xmpp/client";
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// XMPP Configuration (with .env overrides)
const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

// MUC Configuration (with .env overrides)
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = process.env.BOT_NICKNAME || "MistralBot";

// Mistral API Configuration (with .env overrides)
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";

if (!MISTRAL_API_KEY) {
  console.error("MISTRAL_API_KEY environment variable is required");
  console.error("Please create a .env file with your API key or set the environment variable");
  console.error("Example: echo 'MISTRAL_API_KEY=your_key_here' > .env");
  process.exit(1);
}

const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });

class MistralBot {
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
      console.log("Bot is offline");
      this.isInRoom = false;
    });

    this.xmpp.on("online", async (address) => {
      console.log(`Bot connected as ${address.toString()}`);
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
                           body.toLowerCase().startsWith('bot:') ||
                           body.includes('@mistralbot');

      if (shouldRespond) {
        await this.generateAndSendResponse(body, sender);
      }
    }

    // Handle direct messages
    if (stanza.is("message") && stanza.attrs.type === "chat") {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      
      if (body && from) {
        const sender = from.split('@')[0];
        console.log(`Direct message from ${sender}: ${body}`);
        await this.generateAndSendDirectResponse(body, from);
      }
    }
  }

  async generateAndSendResponse(message, sender) {
    try {
      console.log(`Generating response for: ${message}`);
      
      const systemPrompt = `You are MistralBot, a helpful assistant in an XMPP chat room. 
Keep responses concise (1-3 sentences max) and conversational. 
You're chatting with ${sender} and others in the room.
Be friendly but not overly chatty.`;

      const response = await mistralClient.chat.complete({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        maxTokens: 150,
        temperature: 0.7
      });

      const reply = response.choices[0]?.message?.content?.trim();
      
      if (reply && this.isInRoom) {
        const mucMessage = xml(
          "message",
          { type: "groupchat", to: MUC_ROOM },
          xml("body", {}, reply)
        );
        
        await this.xmpp.send(mucMessage);
        console.log(`Bot replied: ${reply}`);
      }
    } catch (err) {
      console.error("Failed to generate or send response:", err);
      
      // Send error message to room
      if (this.isInRoom) {
        const errorMsg = xml(
          "message",
          { type: "groupchat", to: MUC_ROOM },
          xml("body", {}, "Sorry, I'm having trouble generating a response right now.")
        );
        await this.xmpp.send(errorMsg);
      }
    }
  }

  async generateAndSendDirectResponse(message, to) {
    try {
      console.log(`Generating direct response for: ${message}`);
      
      const systemPrompt = `You are MistralBot, a helpful assistant. 
Keep responses concise and helpful. This is a private conversation.`;

      const response = await mistralClient.chat.complete({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        maxTokens: 200,
        temperature: 0.7
      });

      const reply = response.choices[0]?.message?.content?.trim();
      
      if (reply) {
        const directMessage = xml(
          "message",
          { type: "chat", to: to },
          xml("body", {}, reply)
        );
        
        await this.xmpp.send(directMessage);
        console.log(`Bot replied directly: ${reply}`);
      }
    } catch (err) {
      console.error("Failed to generate or send direct response:", err);
    }
  }

  async start() {
    try {
      console.log("Starting MistralBot...");
      await this.xmpp.start();
    } catch (err) {
      console.error("Failed to start bot:", err);
      process.exit(1);
    }
  }

  async stop() {
    try {
      console.log("Stopping MistralBot...");
      await this.xmpp.stop();
    } catch (err) {
      console.error("Failed to stop bot:", err);
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

process.on('SIGTERM', async () => {
  console.log("\nReceived SIGTERM, shutting down gracefully...");
  if (bot) {
    await bot.stop();
  }
  process.exit(0);
});

// Start the bot
const bot = new MistralBot();
bot.start().catch(console.error);