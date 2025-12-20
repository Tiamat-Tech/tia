import { Mistral } from "@mistralai/mistralai";
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";
import { attachDiscoInfoResponder } from "../../lib/lingue/discovery.js";
import { FEATURES } from "../../lib/lingue/constants.js";

const LEGACY_LINGUE_FEATURES = [
  "http://purl.org/stuff/lingue/ibis-rdf",
  "http://purl.org/stuff/lingue/ask-tell",
  "http://purl.org/stuff/lingue/meta-transparent"
];

const DEFAULT_LINGUE_FEATURES = [
  FEATURES.LANG_HUMAN_CHAT,
  FEATURES.LANG_IBIS_TEXT,
  ...LEGACY_LINGUE_FEATURES
];

const DEFAULT_SYSTEM_TEMPLATE =
  "You are {{nickname}}, a helpful assistant in an XMPP chat room. Keep responses concise (1-3 sentences) and conversational.";

export class MistralProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    systemPrompt = null,
    systemTemplate = null,
    historyStore = null,
    lingueEnabled = true,
    lingueConfidenceMin = 0.5,
    discoFeatures = DEFAULT_LINGUE_FEATURES,
    xmppClient = null,
    logger = console
  }) {
    if (!apiKey) throw new Error("MISTRAL_API_KEY is required for MistralProvider");
    this.client = new Mistral({ apiKey });
    this.model = model;
    this.nickname = nickname;
    this.systemPrompt = systemPrompt;
    this.systemTemplate = systemTemplate;
    this.historyStore = historyStore;
    this.lingueEnabled = lingueEnabled;
    this.lingueConfidenceMin = lingueConfidenceMin;
    this.xmppClient = xmppClient;
    this.logger = logger;

    // Advertise Lingue capabilities when possible
    if (lingueEnabled && xmppClient) {
      attachDiscoInfoResponder(xmppClient, {
        features: discoFeatures
      });
    }
  }

  async maybePostLingueSummary(text, reply) {
    if (!this.lingueEnabled) return;
    const structure = detectIBISStructure(text);
    if (structure.confidence < this.lingueConfidenceMin) return;
    const summary = summarizeIBIS(structure);
    await reply(summary);
  }

  async handle({ command, content, metadata, reply }) {
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "${this.nickname}, <your question>"`;
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const historyMessages = this.historyStore?.getMessages?.() || [];
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content }
        ],
        maxTokens: 150,
        temperature: 0.7
      });

      const replyText = response.choices[0]?.message?.content?.trim();
      if (replyText && this.historyStore?.addTurn) {
        this.historyStore.addTurn({ role: "user", content });
        this.historyStore.addTurn({ role: "assistant", content: replyText });
      }
      if (this.lingueEnabled && replyText) {
        // Best-effort IBIS summary of the incoming content
        await this.maybePostLingueSummary(content, reply);
      }
      return replyText || "I had trouble generating a response.";
    } catch (error) {
      this.logger.error("Mistral provider error:", error.message);
      return "I'm having trouble generating a response right now.";
    }
  }

  buildSystemPrompt() {
    if (this.systemPrompt) return this.systemPrompt;
    const template = this.systemTemplate || DEFAULT_SYSTEM_TEMPLATE;
    return renderTemplate(template, { nickname: this.nickname });
  }
}

export default MistralProvider;

function renderTemplate(template, data) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : "";
  });
}
