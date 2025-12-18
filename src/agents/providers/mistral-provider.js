import { Mistral } from "@mistralai/mistralai";
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";
import { attachDiscoInfoResponder } from "../../lib/lingue-capabilities.js";

export class MistralProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    lingueEnabled = true,
    lingueConfidenceMin = 0.5,
    xmppClient = null,
    logger = console
  }) {
    if (!apiKey) throw new Error("MISTRAL_API_KEY is required for MistralProvider");
    this.client = new Mistral({ apiKey });
    this.model = model;
    this.nickname = nickname;
    this.lingueEnabled = lingueEnabled;
    this.lingueConfidenceMin = lingueConfidenceMin;
    this.xmppClient = xmppClient;
    this.logger = logger;

    // Advertise Lingue capabilities when possible
    if (lingueEnabled && xmppClient) {
      attachDiscoInfoResponder(xmppClient);
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
      const systemPrompt = `You are ${this.nickname}, a helpful assistant in an XMPP chat room. Keep responses concise (1-3 sentences) and conversational.`;
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        maxTokens: 150,
        temperature: 0.7
      });

      const replyText = response.choices[0]?.message?.content?.trim();
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
}

export default MistralProvider;
