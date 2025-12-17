import { client, xml } from "@xmpp/client";
import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
import { detectIBISStructure, summarizeIBIS } from "../lib/ibis-detect.js";
import { attachDiscoInfoResponder } from "../lib/lingue-capabilities.js";

// Load environment variables from .env file
dotenv.config();

// XMPP Configuration (with .env overrides)
const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  resource: process.env.XMPP_RESOURCE,
  tls: { rejectUnauthorized: false }
};

// MUC Configuration (with .env overrides)
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = process.env.BOT_NICKNAME || "MistralBot";
const LINGUE_ENABLED = process.env.LINGUE_ENABLED !== "false";
const LINGUE_CONFIDENCE_MIN = parseFloat(process.env.LINGUE_CONFIDENCE_MIN || "0.5");

// Mistral API Configuration (with .env overrides)
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";

// Prefer a stable resource that matches the bot nickname for clarity in logs
if (!XMPP_CONFIG.resource) {
  XMPP_CONFIG.resource = BOT_NICKNAME;
}

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
    this.nickname = BOT_NICKNAME;
    this.joinAttempts = 0;
    this.maxJoinRetries = 3;
    this.jidBare = null;
    this.setupEventHandlers();
    if (LINGUE_ENABLED) {
      attachDiscoInfoResponder(this.xmpp);
    }
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
      this.jidBare = address.bare().toString().toLowerCase();
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
    // Handle nickname conflicts
    if (stanza.is("presence") && stanza.attrs.type === "error" && stanza.attrs.from?.startsWith(MUC_ROOM)) {
      const errorNode = stanza.getChild("error");
      const conflict = errorNode?.getChild("conflict");
      if (conflict && this.joinAttempts < this.maxJoinRetries) {
        this.joinAttempts += 1;
        const newNick = `${BOT_NICKNAME}-${Math.random().toString(16).slice(2, 6)}`;
        console.warn(
          `[MistralBot] Nickname conflict, retrying as ${newNick} (${this.joinAttempts}/${this.maxJoinRetries})`
        );
        this.nickname = newNick;
        await this.joinMUC();
        return;
      }
      console.error(`[MistralBot] Presence error: ${errorNode ? errorNode.toString() : "unknown"}`);
      return;
    }

    // Handle MUC presence confirmations
    if (stanza.is("presence") && stanza.attrs.from?.startsWith(MUC_ROOM)) {
      if (stanza.attrs.from === `${MUC_ROOM}/${this.nickname}`) {
        this.isInRoom = true;
        console.log(`Successfully joined MUC room as ${this.nickname}`);
      }
      return;
    }

    // Handle MUC messages
    if (stanza.is("message") && stanza.attrs.type === "groupchat") {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      if (!body || !from) return;

      const fromLower = from.toLowerCase();
      const nickLower = this.nickname.toLowerCase();
      const isSelfNick = fromLower.endsWith(`/${nickLower}`);
      const isSelfBare = this.jidBare && fromLower.startsWith(`${this.jidBare}/`);
      const isDelayed = !!stanza.getChild("delay");

      if (isSelfNick || isSelfBare || isDelayed) {
        return; // Ignore our own or delayed messages
      }

      if (fromLower.includes(this.nickname.toLowerCase())) {
        // no-op; just avoid eslint unused
      }

      if (!body) {
        return; // Ignore empty messages or our own messages
      }

      const sender = from.split('/')[1] || 'unknown';
      console.log(`[${sender}]: ${body}`);

      // Respond if mentioned or if message starts with "bot:"
      const lowerBody = body.toLowerCase();
      const dynamicAtMention = `@${BOT_NICKNAME.toLowerCase()}`;
      const shouldRespond =
        lowerBody.includes(BOT_NICKNAME.toLowerCase()) ||
        lowerBody.startsWith("bot:") ||
        lowerBody.includes(dynamicAtMention) ||
        lowerBody.includes("@mistralbot"); // legacy tag

      if (shouldRespond && LINGUE_ENABLED) {
        await this.maybePostLingueSummary(body);
      }

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
        if (LINGUE_ENABLED) {
          await this.maybePostLingueSummary(body, { directTo: from });
        }
        await this.generateAndSendDirectResponse(body, from);
      }
    }
  }

  async maybePostLingueSummary(text, options = {}) {
    const structure = detectIBISStructure(text);
    if (structure.confidence < LINGUE_CONFIDENCE_MIN) return;

    const summary = summarizeIBIS(structure);
    const message = xml(
      "message",
      { type: options.directTo ? "chat" : "groupchat", to: options.directTo || MUC_ROOM },
      xml("body", {}, summary)
    );
    await this.xmpp.send(message);
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
