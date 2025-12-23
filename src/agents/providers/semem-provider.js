import { SememClient } from "../../lib/semem-client.js";

export class SememProvider {
  constructor({ sememConfig, botNickname, chatFeatures = {}, logger = console }) {
    this.client = new SememClient(sememConfig);
    this.botNickname = botNickname;
    this.chatFeatures = chatFeatures;
    this.logger = logger;
  }

  buildMetadata(metadata) {
    return {
      sender: metadata.sender,
      channel: metadata.type,
      room: metadata.type === "groupchat" ? metadata.roomJid : metadata.sender,
      agent: this.botNickname
    };
  }

  async handle({ command, content, metadata, reply }) {
    try {
      if (command === "tell") {
        if (!content) return "Nothing to store. Usage: Semem tell <text>";
        await this.client.tell(content, { metadata: this.buildMetadata(metadata) });
        return "Stored in Semem via /tell.";
      }

      if (command === "ask") {
        if (!content) return "Nothing to ask. Usage: Semem ask <question>";
        const question = `${content}\n\nKeep responses brief.`;
        const result = await this.client.ask(question, { useContext: true });
        return result?.content || result?.answer || "No answer returned.";
      }

      if (command === "augment") {
        if (!content) return "Nothing to augment. Usage: Semem augment <text>";
        const target = `${content}\n\nKeep responses brief.`;
        const result = await this.client.augment(target);
        return result?.success ? "Augment completed and stored." : "Augment did not report success.";
      }

      // Default: chat
      const chatPrompt = `${content}\n\nKeep responses brief.`;
      const response = await this.client.chatEnhanced(chatPrompt, this.chatFeatures);
      const replyText =
        response?.content || response?.answer || "I could not get a response from Semem just now.";

      // Mirror into tell (best-effort)
      this.client
        .tell(`Query: ${content}\nAnswer: ${replyText}`, {
          metadata: this.buildMetadata(metadata)
        })
        .catch((err) => this.logger.error("Semem /tell failed:", err.message));

      return replyText;
    } catch (error) {
      this.logger.error("Semem provider error:", error.message);
      return "Semem is unavailable right now. Please try again shortly.";
    }
  }

  // ========================================
  // MFR (Model-First Reasoning) Methods
  // ========================================

  /**
   * Extract constraints from problem description
   * @param {string} problemDescription - Natural language problem
   * @returns {Promise<Array<Object>>} Extracted constraints
   */
  async extractConstraints(problemDescription) {
    try {
      const prompt = `Identify all constraints, rules, and restrictions in this problem description.
Extract constraints as structured objects with type, description, and entities involved.

Problem: ${problemDescription}

Return a JSON array of constraints in this format:
[
  {
    "type": "temporal|resource|logical|physical|business",
    "description": "constraint description",
    "entities": ["entity1", "entity2"],
    "severity": "hard|soft"
  }
]

Respond with ONLY the JSON array.`;

      const result = await this.client.ask(prompt, { useContext: false });
      const content = result?.content || result?.answer || "[]";

      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      const constraints = JSON.parse(jsonText);
      this.logger.debug?.(`[SememProvider] Extracted ${constraints.length} constraints`);
      return constraints;
    } catch (error) {
      this.logger.error?.(`[SememProvider] Constraint extraction error: ${error.message}`);
      return [];
    }
  }

  /**
   * Check for conflicts in a set of statements
   * @param {Array<string>} statements - Statements to check
   * @returns {Promise<Array<Object>>} Detected conflicts
   */
  async detectConflicts(statements) {
    try {
      const statementsText = statements.map((s, i) => `${i + 1}. ${s}`).join('\n');

      const prompt = `Analyze these statements for logical conflicts, contradictions, or inconsistencies:

${statementsText}

Identify any conflicts and return as JSON:
[
  {
    "statementIds": [1, 3],
    "conflictType": "logical|temporal|resource",
    "description": "description of conflict",
    "severity": "critical|warning|info"
  }
]

Respond with ONLY the JSON array. If no conflicts, return [].`;

      const result = await this.client.ask(prompt, { useContext: false });
      const content = result?.content || result?.answer || "[]";

      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      const conflicts = JSON.parse(jsonText);
      this.logger.debug?.(`[SememProvider] Detected ${conflicts.length} conflicts`);
      return conflicts;
    } catch (error) {
      this.logger.error?.(`[SememProvider] Conflict detection error: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate consistency of a problem model
   * @param {string} modelDescription - Natural language description of model
   * @returns {Promise<Object>} Validation result
   */
  async validateModelConsistency(modelDescription) {
    try {
      const prompt = `Analyze this problem model for logical consistency:

${modelDescription}

Check for:
1. Contradictory statements
2. Missing prerequisites
3. Circular dependencies
4. Resource conflicts
5. Temporal impossibilities

Return JSON with validation results:
{
  "consistent": true|false,
  "issues": [
    {
      "type": "contradiction|missing|circular|conflict|temporal",
      "severity": "critical|warning|info",
      "description": "issue description",
      "location": "where in model"
    }
  ],
  "score": 0.0-1.0
}`;

      const result = await this.client.ask(prompt, { useContext: false });
      const content = result?.content || result?.answer || "{}";

      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       content.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      const validation = JSON.parse(jsonText);
      this.logger.debug?.(`[SememProvider] Model consistency: ${validation.consistent}, score: ${validation.score}`);
      return validation;
    } catch (error) {
      this.logger.error?.(`[SememProvider] Consistency validation error: ${error.message}`);
      return {
        consistent: false,
        issues: [{ type: "error", severity: "critical", description: error.message }],
        score: 0.0
      };
    }
  }

  /**
   * Generate RDF representation of constraints
   * @param {Array<Object>} constraints - Constraints to convert to RDF
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateConstraintRdf(constraints, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Constraints identified by ${this.botNickname} for session ${sessionId}`,
      ``
    ];

    constraints.forEach((constraint, index) => {
      const constraintId = `constraint-${index + 1}`;
      const constraintUri = `<${MFR_NS}${sessionId}/${constraintId}>`;

      lines.push(`${constraintUri} a mfr:Constraint ;`);
      lines.push(`  schema:name "Constraint ${index + 1}" ;`);

      if (constraint.type) {
        lines.push(`  mfr:constraintType "${constraint.type}" ;`);
      }

      if (constraint.description) {
        const escapedDesc = constraint.description.replace(/"/g, '\\"');
        lines.push(`  rdfs:comment "${escapedDesc}" ;`);
      }

      if (constraint.severity) {
        lines.push(`  mfr:severity "${constraint.severity}" ;`);
      }

      if (constraint.entities && constraint.entities.length > 0) {
        constraint.entities.forEach((entity) => {
          lines.push(`  mfr:constrainsEntity "${entity}" ;`);
        });
      }

      lines.push(`  mfr:contributedBy "${this.botNickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  /**
   * Generate RDF representation of detected conflicts
   * @param {Array<Object>} conflicts - Conflicts to convert to RDF
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateConflictRdf(conflicts, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Conflicts detected by ${this.botNickname} for session ${sessionId}`,
      ``
    ];

    conflicts.forEach((conflict, index) => {
      const conflictId = `conflict-${index + 1}`;
      const conflictUri = `<${MFR_NS}${sessionId}/${conflictId}>`;

      lines.push(`${conflictUri} a mfr:Conflict ;`);
      lines.push(`  schema:name "Conflict ${index + 1}" ;`);

      if (conflict.conflictType) {
        lines.push(`  mfr:conflictType "${conflict.conflictType}" ;`);
      }

      if (conflict.description) {
        const escapedDesc = conflict.description.replace(/"/g, '\\"');
        lines.push(`  rdfs:comment "${escapedDesc}" ;`);
      }

      if (conflict.severity) {
        lines.push(`  mfr:severity "${conflict.severity}" ;`);
      }

      if (conflict.statementIds && conflict.statementIds.length > 0) {
        conflict.statementIds.forEach((id) => {
          lines.push(`  mfr:involvesStatement "${id}" ;`);
        });
      }

      lines.push(`  mfr:detectedBy "${this.botNickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  /**
   * Extract domain rules from problem description
   * @param {string} problemDescription - Natural language problem
   * @returns {Promise<Array<string>>} Domain rules
   */
  async extractDomainRules(problemDescription) {
    try {
      const prompt = `Extract all domain-specific rules, invariants, and business logic from this problem:

${problemDescription}

Return as a JSON array of rule strings.
Example: ["Rule 1 description", "Rule 2 description"]

Respond with ONLY the JSON array.`;

      const result = await this.client.ask(prompt, { useContext: false });
      const content = result?.content || result?.answer || "[]";

      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       content.match(/(\[[\s\S]*\])/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;

      const rules = JSON.parse(jsonText);
      this.logger.debug?.(`[SememProvider] Extracted ${rules.length} domain rules`);
      return rules;
    } catch (error) {
      this.logger.error?.(`[SememProvider] Domain rule extraction error: ${error.message}`);
      return [];
    }
  }

  /**
   * Handle MFR contribution request
   * @param {Object} request - Contribution request message
   * @returns {Promise<string>} RDF contribution
   */
  async handleMfrContributionRequest(request) {
    const { sessionId, problemDescription, requestedContributions } = request;

    this.logger.info?.(`[SememProvider] Handling MFR contribution request for ${sessionId}`);

    const contributions = [];

    // Extract and model constraints
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/ConstraintDefinition")) {
      const constraints = await this.extractConstraints(problemDescription);

      if (constraints.length > 0) {
        const constraintRdf = await this.generateConstraintRdf(constraints, sessionId);
        contributions.push(constraintRdf);
      }
    }

    // Detect conflicts (if model summary provided)
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/ConflictDetection")) {
      // For conflict detection, we need existing model statements
      // In a full implementation, this would parse the current model
      // For now, just analyze the problem description
      const statements = problemDescription.split('.').filter(s => s.trim().length > 0);

      if (statements.length > 1) {
        const conflicts = await this.detectConflicts(statements);

        if (conflicts.length > 0) {
          const conflictRdf = await this.generateConflictRdf(conflicts, sessionId);
          contributions.push(conflictRdf);
        }
      }
    }

    // Extract domain rules
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/DomainRules")) {
      const rules = await this.extractDomainRules(problemDescription);

      if (rules.length > 0) {
        const rulesRdf = await this.generateDomainRulesRdf(rules, sessionId);
        contributions.push(rulesRdf);
      }
    }

    // Combine all contributions
    return contributions.join('\n\n');
  }

  /**
   * Generate RDF for domain rules
   * @param {Array<string>} rules - Domain rules
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateDomainRulesRdf(rules, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Domain rules from ${this.botNickname} for session ${sessionId}`,
      ``
    ];

    rules.forEach((rule, index) => {
      const ruleId = `rule-${index + 1}`;
      const ruleUri = `<${MFR_NS}${sessionId}/${ruleId}>`;

      lines.push(`${ruleUri} a mfr:DomainRule ;`);
      lines.push(`  schema:name "Rule ${index + 1}" ;`);

      const escapedRule = rule.replace(/"/g, '\\"');
      lines.push(`  rdfs:comment "${escapedRule}" ;`);
      lines.push(`  mfr:contributedBy "${this.botNickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  /**
   * Validate a complete problem model for reasoning readiness
   * @param {string} modelTurtle - Problem model in Turtle format
   * @returns {Promise<Object>} Validation result with reasoning readiness assessment
   */
  async validateForReasoning(modelTurtle) {
    try {
      // Extract key model elements for analysis
      const entities = (modelTurtle.match(/a mfr:Entity/g) || []).length;
      const actions = (modelTurtle.match(/a mfr:Action/g) || []).length;
      const constraints = (modelTurtle.match(/a mfr:Constraint/g) || []).length;
      const goals = (modelTurtle.match(/a mfr:Goal/g) || []).length;

      const summary = `Problem model contains:
- ${entities} entities
- ${actions} actions
- ${constraints} constraints
- ${goals} goals

Sample of model content (first 500 chars):
${modelTurtle.substring(0, 500)}`;

      const validation = await this.validateModelConsistency(summary);

      return {
        ...validation,
        readyForReasoning: validation.consistent && entities > 0 && actions > 0 && goals > 0,
        completeness: {
          hasEntities: entities > 0,
          hasActions: actions > 0,
          hasConstraints: constraints > 0,
          hasGoals: goals > 0
        },
        statistics: { entities, actions, constraints, goals }
      };
    } catch (error) {
      this.logger.error?.(`[SememProvider] Reasoning validation error: ${error.message}`);
      return {
        consistent: false,
        readyForReasoning: false,
        issues: [{ type: "error", severity: "critical", description: error.message }]
      };
    }
  }
}

export default SememProvider;
