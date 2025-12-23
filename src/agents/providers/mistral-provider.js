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

  // ========================================
  // MFR (Model-First Reasoning) Methods
  // ========================================

  /**
   * Extract entities from natural language problem description
   * @param {string} problemDescription - Natural language problem
   * @returns {Promise<Array<Object>>} Extracted entities
   */
  async extractEntities(problemDescription) {
    try {
      const prompt = `Extract all entities (people, objects, concepts) from this problem description.
Return ONLY a JSON array of entities with their types.

Problem: ${problemDescription}

Format: [{"name": "EntityName", "type": "EntityType", "description": "brief description"}]

Respond with ONLY the JSON array, no other text.`;

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 500,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content?.trim();

      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      const entities = JSON.parse(jsonText);
      this.logger.debug?.(`[MistralProvider] Extracted ${entities.length} entities`);
      return entities;
    } catch (error) {
      this.logger.error?.(`[MistralProvider] Entity extraction error: ${error.message}`);
      return [];
    }
  }

  /**
   * Identify goals from problem description
   * @param {string} problemDescription - Natural language problem
   * @returns {Promise<Array<Object>>} Identified goals
   */
  async extractGoals(problemDescription) {
    try {
      const prompt = `Identify the goals or objectives in this problem description.
Return ONLY a JSON array of goals.

Problem: ${problemDescription}

Format: [{"goal": "description of goal", "priority": "high|medium|low"}]

Respond with ONLY the JSON array, no other text.`;

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 300,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content?.trim();

      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      const goals = JSON.parse(jsonText);
      this.logger.debug?.(`[MistralProvider] Extracted ${goals.length} goals`);
      return goals;
    } catch (error) {
      this.logger.error?.(`[MistralProvider] Goal extraction error: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate RDF representation of entities
   * @param {Array<Object>} entities - Extracted entities
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateEntityRdf(entities, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";
    const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdf: <${RDF_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Entities extracted by ${this.nickname} for session ${sessionId}`,
      ``
    ];

    entities.forEach((entity, index) => {
      const entityId = `entity-${index + 1}`;
      const entityUri = `<${MFR_NS}${sessionId}/${entityId}>`;

      lines.push(`${entityUri} a mfr:Entity ;`);
      lines.push(`  rdf:type mfr:Entity ;`);
      lines.push(`  schema:name "${entity.name}" ;`);

      if (entity.type) {
        lines.push(`  mfr:entityType "${entity.type}" ;`);
      }

      if (entity.description) {
        lines.push(`  rdfs:comment "${entity.description}" ;`);
      }

      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  /**
   * Generate RDF representation of goals
   * @param {Array<Object>} goals - Extracted goals
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateGoalRdf(goals, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Goals extracted by ${this.nickname} for session ${sessionId}`,
      ``
    ];

    goals.forEach((goal, index) => {
      const goalId = `goal-${index + 1}`;
      const goalUri = `<${MFR_NS}${sessionId}/${goalId}>`;

      lines.push(`${goalUri} a mfr:Goal ;`);
      lines.push(`  rdfs:label "${goal.goal}" ;`);

      if (goal.priority) {
        lines.push(`  mfr:priority "${goal.priority}" ;`);
      }

      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  /**
   * Explain a solution in natural language
   * @param {Object} solution - Solution object
   * @param {string} modelTurtle - Problem model in Turtle format
   * @returns {Promise<string>} Natural language explanation
   */
  async explainSolution(solution, modelTurtle) {
    try {
      const prompt = `Given this problem model and solution, explain the solution in clear, natural language.

Problem Model (RDF):
${modelTurtle.substring(0, 1000)}...

Solution:
${JSON.stringify(solution, null, 2)}

Provide a concise explanation (2-3 sentences) of what the solution accomplishes and why it works.`;

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 200,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content?.trim() || "Solution explanation unavailable.";
    } catch (error) {
      this.logger.error?.(`[MistralProvider] Solution explanation error: ${error.message}`);
      return "Unable to generate solution explanation.";
    }
  }

  /**
   * Handle MFR contribution request
   * @param {Object} request - Contribution request message
   * @returns {Promise<string>} RDF contribution
   */
  async handleMfrContributionRequest(request) {
    const { sessionId, problemDescription, requestedContributions } = request;

    this.logger.info?.(`[MistralProvider] Handling MFR contribution request for ${sessionId}`);

    const contributions = [];

    // Extract entities
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/EntityDiscovery")) {
      const entities = await this.extractEntities(problemDescription);
      if (entities.length > 0) {
        const entityRdf = await this.generateEntityRdf(entities, sessionId);
        contributions.push(entityRdf);
      }
    }

    // Extract goals
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/GoalIdentification")) {
      const goals = await this.extractGoals(problemDescription);
      if (goals.length > 0) {
        const goalRdf = await this.generateGoalRdf(goals, sessionId);
        contributions.push(goalRdf);
      }
    }

    // Combine all contributions
    return contributions.join('\n\n');
  }
}

export default MistralProvider;

function renderTemplate(template, data) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : "";
  });
}
