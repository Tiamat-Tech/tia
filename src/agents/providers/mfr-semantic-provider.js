import { Mistral } from "@mistralai/mistralai";
import { MFR_CONTRIBUTION_TYPES } from "../../lib/mfr/constants.js";

export class MfrSemanticProvider {
  constructor({ nickname, apiKey, model, logger = console } = {}) {
    if (!nickname) {
      throw new Error("MfrSemanticProvider requires a nickname");
    }

    this.nickname = nickname;
    this.logger = logger;
    this.model = model || null;
    this.client = apiKey && model ? new Mistral({ apiKey }) : null;
  }

  async handle() {
    return null;
  }

  async extractConstraints(problemDescription) {
    if (!problemDescription) return [];

    if (this.client) {
      return this.extractConstraintsWithModel(problemDescription);
    }

    return this.extractConstraintsHeuristic(problemDescription);
  }

  async extractConstraintsWithModel(problemDescription) {
    try {
      const prompt = `Extract constraints from this problem description.
Return a JSON array of objects:
[
  {
    "description": "constraint text",
    "type": "temporal|resource|logic|safety|policy",
    "severity": "critical|warning|info",
    "entities": ["Entity1", "Entity2"]
  }
]

Problem:
${problemDescription}

Respond with ONLY the JSON array.`;

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 400,
        temperature: 0.2
      });

      const content = response.choices[0]?.message?.content?.trim() || "[]";
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
        content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonText);
    } catch (error) {
      this.logger.error?.(
        `[MfrSemanticProvider] Constraint extraction error: ${error.message}`
      );
      return [];
    }
  }

  extractConstraintsHeuristic(problemDescription) {
    const sentences = problemDescription
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const signals = /(must|should|cannot|can't|only|ensure|avoid|never|no\s+)/i;

    return sentences
      .filter((sentence) => signals.test(sentence))
      .map((sentence) => ({
        description: sentence,
        type: "heuristic",
        severity: "info",
        entities: []
      }));
  }

  async extractDomainRules(problemDescription) {
    if (!problemDescription) return [];

    if (this.client) {
      return this.extractDomainRulesWithModel(problemDescription);
    }

    return this.extractDomainRulesHeuristic(problemDescription);
  }

  async extractDomainRulesWithModel(problemDescription) {
    try {
      const prompt = `Extract domain-specific rules, invariants, or policies from this problem.
Return ONLY a JSON array of rule strings.

Problem:
${problemDescription}`;

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 300,
        temperature: 0.2
      });

      const content = response.choices[0]?.message?.content?.trim() || "[]";
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
        content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonText);
    } catch (error) {
      this.logger.error?.(
        `[MfrSemanticProvider] Domain rule extraction error: ${error.message}`
      );
      return [];
    }
  }

  extractDomainRulesHeuristic(problemDescription) {
    const sentences = problemDescription
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const signals = /(policy|rule|regulation|requirement|must|should)/i;
    return sentences.filter((sentence) => signals.test(sentence));
  }

  async generateConstraintRdf(constraints, sessionId) {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Constraints from ${this.nickname} for session ${sessionId}`,
      ``
    ];

    constraints.forEach((constraint, index) => {
      const constraintId = `constraint-${this.slugify(this.nickname)}-${index + 1}`;
      const constraintUri = `<${MFR_NS}${sessionId}/${constraintId}>`;
      const description = constraint.description || String(constraint);

      lines.push(`${constraintUri} a mfr:Constraint ;`);
      lines.push(`  schema:name "Constraint ${index + 1}" ;`);
      lines.push(`  mfr:constraintType "${constraint.type || 'general'}" ;`);

      if (description) {
        const escapedDesc = description.replace(/"/g, '\\"');
        lines.push(`  rdfs:comment "${escapedDesc}" ;`);
      }

      if (constraint.severity) {
        lines.push(`  mfr:severity "${constraint.severity}" ;`);
      }

      // SHACL requires at least one appliesTo
      if (Array.isArray(constraint.entities) && constraint.entities.length > 0) {
        constraint.entities.forEach((entity) => {
          lines.push(`  mfr:appliesTo "${entity}" ;`);
        });
      } else {
        lines.push(`  mfr:appliesTo "problem" ;`);
      }

      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    });

    return lines.join("\n");
  }

  async generateDomainRulesRdf(rules, sessionId) {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Domain rules from ${this.nickname} for session ${sessionId}`,
      ``
    ];

    rules.forEach((rule, index) => {
      const ruleId = `rule-${this.slugify(this.nickname)}-${index + 1}`;
      const ruleUri = `<${MFR_NS}${sessionId}/${ruleId}>`;
      const escapedRule = String(rule).replace(/"/g, '\\"');

      lines.push(`${ruleUri} a mfr:DomainRule ;`);
      lines.push(`  schema:name "Rule ${index + 1}" ;`);
      lines.push(`  rdfs:comment "${escapedRule}" ;`);
      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    });

    return lines.join("\n");
  }

  async handleMfrContributionRequest(request) {
    const { sessionId, problemDescription, requestedContributions } = request || {};

    if (!sessionId || !problemDescription) {
      return "";
    }

    this.logger.info?.(
      `[MfrSemanticProvider] Handling MFR contribution request for ${sessionId}`
    );

    const contributions = [];

    if (requestedContributions?.includes(MFR_CONTRIBUTION_TYPES.CONSTRAINT)) {
      const constraints = await this.extractConstraints(problemDescription);
      if (constraints.length > 0) {
        contributions.push(await this.generateConstraintRdf(constraints, sessionId));
      }
    }

    if (requestedContributions?.includes(MFR_CONTRIBUTION_TYPES.ONTOLOGY_VALIDATION)) {
      const rules = await this.extractDomainRules(problemDescription);
      if (rules.length > 0) {
        contributions.push(await this.generateDomainRulesRdf(rules, sessionId));
      }
    }

    return contributions.join("\n\n");
  }

  slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/--+/g, "-") || "agent";
  }
}

export default MfrSemanticProvider;
