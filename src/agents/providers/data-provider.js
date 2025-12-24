/**
 * Data provider for SPARQL queries against Wikidata and other endpoints
 */
export class DataProvider {
  constructor({
    endpoint,
    extractionModel,
    extractionApiKey,
    mcpBridge,
    nickname = "Data",
    logger = console
  }) {
    if (!endpoint) {
      throw new Error("SPARQL endpoint is required for DataProvider");
    }
    if (!mcpBridge) {
      throw new Error("MCP bridge is required for DataProvider");
    }

    this.endpoint = endpoint;
    this.extractionModel = extractionModel;
    this.extractionApiKey = extractionApiKey;
    this.mcpBridge = mcpBridge;
    this.nickname = nickname;
    this.logger = logger;
    this.mistralClient = null;
    this.mistralInitialized = false;

    // Async initialization for optional Mistral dependency
    if (extractionApiKey && extractionModel) {
      this.initMistral();
    }
  }

  async initMistral() {
    if (this.mistralInitialized) return;
    this.mistralInitialized = true;

    try {
      const { Mistral } = await import("@mistralai/mistralai");
      this.mistralClient = new Mistral({ apiKey: this.extractionApiKey });
      this.logger.info("[DataProvider] Mistral client initialized for entity extraction");
    } catch (err) {
      this.logger.warn("[DataProvider] @mistralai/mistralai not available - natural language mode disabled");
    }
  }

  async handle({ command, content, metadata, reply }) {
    if (command === "query") {
      return await this.handleEntityQuery(content);
    }

    if (command === "sparql") {
      return await this.handleDirectSparql(content);
    }

    if (command === "chat") {
      return await this.handleNaturalLanguage(content);
    }

    return `${this.nickname} supports: query <entity>, sparql <query>, or natural language questions`;
  }

  /**
   * Mode 1: Command-based entity query (query: Albert Einstein)
   */
  async handleEntityQuery(entity) {
    try {
      this.logger.info(`[DataProvider] Entity query: ${entity}`);
      const query = this.buildWikidataQuery(entity);
      const result = await this.mcpBridge.callTool("sparqlQuery", {
        query,
        endpoint: this.endpoint
      });
      const jsonText = result.content[0].text;
      return this.formatResults(jsonText);
    } catch (error) {
      this.logger.error(`[DataProvider] Entity query error for "${entity}":`, error.message);
      return this.formatError(error);
    }
  }

  /**
   * Mode 2: Natural language with LLM entity extraction
   */
  async handleNaturalLanguage(text) {
    try {
      // Ensure Mistral is initialized
      await this.initMistral();

      if (!this.mistralClient) {
        return "Natural language queries require Mistral API key. Use 'query: <entity>' instead.";
      }

      this.logger.info(`[DataProvider] Natural language: ${text}`);
      const entity = await this.extractEntity(text);
      if (!entity) {
        return "Could not extract an entity from your question. Try 'query: <entity>' instead.";
      }

      this.logger.info(`[DataProvider] Extracted entity: ${entity}`);
      return await this.handleEntityQuery(entity);
    } catch (error) {
      this.logger.error(`[DataProvider] Natural language error:`, error.message);
      return this.formatError(error);
    }
  }

  /**
   * Mode 3: Direct SPARQL query
   */
  async handleDirectSparql(sparqlQuery) {
    try {
      this.logger.info(`[DataProvider] Direct SPARQL query`);
      const result = await this.mcpBridge.callTool("sparqlQuery", {
        query: sparqlQuery,
        endpoint: this.endpoint
      });
      const jsonText = result.content[0].text;
      return this.formatResults(jsonText);
    } catch (error) {
      this.logger.error(`[DataProvider] SPARQL query error:`, error.message);
      return this.formatError(error);
    }
  }

  /**
   * Extract entity from natural language using Mistral
   */
  async extractEntity(text) {
    const prompt = `Extract the main entity or topic from this question. Return ONLY the entity name, nothing else. If there are multiple entities, return the most important one.

Question: "${text}"

Entity:`;

    const response = await this.mistralClient.chat.complete({
      model: this.extractionModel,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 50,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content?.trim();
  }

  /**
   * Build SPARQL query for Wikidata entity lookup
   */
  buildWikidataQuery(entity) {
    const escapedEntity = entity.replace(/"/g, '\\"');
    return `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>

SELECT ?item ?itemLabel ?description ?instanceOfLabel WHERE {
  ?item rdfs:label "${escapedEntity}"@en .
  OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "en") }
  OPTIONAL { ?item wdt:P31 ?instanceOf . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5
    `.trim();
  }

  /**
   * Format SPARQL JSON results as human-friendly text
   */
  formatResults(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      const bindings = parsed.results?.bindings || [];

      if (bindings.length === 0) {
        return "No results found.";
      }

      const summaries = bindings.map((binding, idx) => {
        const label = binding.itemLabel?.value || binding.item?.value || "Unknown";
        const desc = binding.description?.value || "";
        const type = binding.instanceOfLabel?.value || "";

        let summary = `${idx + 1}. ${label}`;
        if (desc) summary += `: ${desc}`;
        if (type) summary += ` (${type})`;
        return summary;
      });

      return summaries.join("\n");
    } catch (error) {
      this.logger.error("[DataProvider] Error formatting results:", error.message);
      this.logger.error("[DataProvider] Raw response:", jsonText);
      return `Error formatting results: ${error.message}. Check logs for details.`;
    }
  }

  /**
   * Format error message for user
   */
  formatError(error) {
    const message = error.message || String(error);

    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return "Query timeout - the SPARQL endpoint took too long to respond.";
    }
    if (message.includes("ECONNREFUSED") || message.includes("connection")) {
      return "Connection error - could not reach SPARQL endpoint.";
    }
    if (message.includes("parse") || message.includes("syntax")) {
      return "Query error - malformed SPARQL query.";
    }

    return `Error executing query. Please try again or rephrase your request.`;
  }

  // ========================================
  // MFR (Model-First Reasoning) Methods
  // ========================================

  /**
   * Ground an entity by finding its Wikidata URI and properties
   * @param {string} entityName - Entity name to ground
   * @returns {Promise<Object|null>} Grounded entity with URI and properties
   */
  async groundEntity(entityName) {
    try {
      this.logger.debug?.(`[DataProvider] Grounding entity: ${entityName}`);

      const query = this.buildWikidataQuery(entityName);
      const result = await this.mcpBridge.callTool("sparqlQuery", {
        query,
        endpoint: this.endpoint
      });

      const jsonText = result.content[0].text;
      const parsed = JSON.parse(jsonText);
      const bindings = parsed.results?.bindings || [];

      if (bindings.length === 0) {
        this.logger.debug?.(`[DataProvider] No Wikidata match for: ${entityName}`);
        return null;
      }

      // Take the first result as the most likely match
      const binding = bindings[0];
      return {
        name: entityName,
        uri: binding.item?.value,
        label: binding.itemLabel?.value,
        description: binding.description?.value,
        type: binding.instanceOfLabel?.value,
        typeUri: binding.instanceOf?.value
      };
    } catch (error) {
      this.logger.error?.(`[DataProvider] Entity grounding error for "${entityName}": ${error.message}`);
      return null;
    }
  }

  /**
   * Get relationships for a grounded entity
   * @param {string} entityUri - Wikidata entity URI
   * @returns {Promise<Array<Object>>} Array of relationships
   */
  async getEntityRelationships(entityUri) {
    try {
      this.logger.debug?.(`[DataProvider] Getting relationships for: ${entityUri}`);

      // Extract entity ID from URI (e.g., http://www.wikidata.org/entity/Q937 -> Q937)
      const entityId = entityUri.split('/').pop();

      const query = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?propertyLabel ?value ?valueLabel WHERE {
  wd:${entityId} ?property ?value .
  ?property rdfs:label ?propertyLabel .
  FILTER(LANG(?propertyLabel) = "en")
  OPTIONAL { ?value rdfs:label ?valueLabel . FILTER(LANG(?valueLabel) = "en") }
  FILTER(STRSTARTS(STR(?property), "http://www.wikidata.org/prop/direct/"))
}
LIMIT 20
      `.trim();

      const result = await this.mcpBridge.callTool("sparqlQuery", {
        query,
        endpoint: this.endpoint
      });

      const jsonText = result.content[0].text;
      const parsed = JSON.parse(jsonText);
      const bindings = parsed.results?.bindings || [];

      return bindings.map(binding => ({
        property: binding.property?.value,
        propertyLabel: binding.propertyLabel?.value,
        value: binding.value?.value,
        valueLabel: binding.valueLabel?.value
      }));
    } catch (error) {
      this.logger.error?.(`[DataProvider] Relationship query error: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate RDF representation of grounded entities
   * @param {Array<Object>} entities - Entities to ground and convert to RDF
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateEntityRdf(entities, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";
    const WD_NS = "http://www.wikidata.org/entity/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix wd: <${WD_NS}> .`,
      `@prefix owl: <http://www.w3.org/2002/07/owl#> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Grounded entities from ${this.nickname} for session ${sessionId}`,
      ``
    ];

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const entityId = `entity-${this.slugify(this.nickname)}-${i + 1}`;
      const entityUri = `<${MFR_NS}${sessionId}/${entityId}>`;

      // Try to ground the entity
      const grounded = await this.groundEntity(entity.name || entity);

      lines.push(`${entityUri} a mfr:Entity ;`);
      lines.push(`  schema:name "${entity.name || entity}" ;`);

      if (grounded) {
        lines.push(`  owl:sameAs <${grounded.uri}> ;`);
        lines.push(`  mfr:entityType "${grounded.type || entity.name || entity}" ;`);

        if (grounded.label) {
          lines.push(`  rdfs:label "${grounded.label}" ;`);
        }

        if (grounded.description) {
          lines.push(`  rdfs:comment "${grounded.description}" ;`);
        }

        if (grounded.typeUri) {
          lines.push(`  mfr:hasType <${grounded.typeUri}> ;`);
        }

        lines.push(`  mfr:groundedBy "${this.nickname}" ;`);
        lines.push(`  mfr:wikidataEntity <${grounded.uri}> ;`);
      } else {
        lines.push(`  mfr:entityType "${entity.type || entity.name || entity}" ;`);
        lines.push(`  mfr:groundingStatus "ungrounded" ;`);
      }

      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    }

    return lines.join('\n');
  }

  /**
   * Generate RDF representation of entity relationships
   * @param {Array<Object>} groundedEntities - Grounded entities with URIs
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateRelationshipRdf(groundedEntities, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .`,
      ``,
      `# Entity relationships from ${this.nickname} for session ${sessionId}`,
      ``
    ];

    for (const entity of groundedEntities) {
      if (!entity.uri) continue;

      const relationships = await this.getEntityRelationships(entity.uri);

      if (relationships.length === 0) continue;

      lines.push(`# Relationships for ${entity.name}`);

      for (let i = 0; i < Math.min(relationships.length, 5); i++) {
        const rel = relationships[i];
        const relId = `rel-${this.slugify(this.nickname)}-${Date.now()}-${i}`;
        const relUri = `<${MFR_NS}${sessionId}/${relId}>`;

        lines.push(`${relUri} a mfr:Relationship ;`);
        lines.push(`  mfr:subject <${entity.uri}> ;`);
        lines.push(`  mfr:predicate <${rel.property}> ;`);

        if (rel.propertyLabel) {
          lines.push(`  mfr:predicateLabel "${rel.propertyLabel}" ;`);
        }

        if (rel.valueLabel) {
          lines.push(`  mfr:objectLabel "${rel.valueLabel}" ;`);
        }

        lines.push(`  mfr:contributedBy "${this.nickname}" .`);
        lines.push(``);
      }
    }

    return lines.join('\n');
  }

  slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/--+/g, "-") || "agent";
  }

  /**
   * Handle MFR contribution request
   * @param {Object} request - Contribution request message
   * @returns {Promise<string>} RDF contribution
   */
  async handleMfrContributionRequest(request) {
    const { sessionId, problemDescription, requestedContributions } = request;

    this.logger.info?.(`[DataProvider] Handling MFR contribution request for ${sessionId}`);

    const contributions = [];

    // Check if entity discovery is requested
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/EntityDiscovery")) {
      // Extract entities from problem description using Mistral
      await this.initMistral();

      if (this.mistralClient) {
        try {
          const entities = await this.extractEntitiesForMfr(problemDescription);
          if (entities.length > 0) {
            const entityRdf = await this.generateEntityRdf(entities, sessionId);
            contributions.push(entityRdf);

            // Also get relationships for grounded entities
            const groundedEntities = [];
            for (const entityName of entities) {
              const grounded = await this.groundEntity(entityName);
              if (grounded) {
                groundedEntities.push(grounded);
              }
            }

            if (groundedEntities.length > 0) {
              const relationshipRdf = await this.generateRelationshipRdf(groundedEntities, sessionId);
              contributions.push(relationshipRdf);
            }
          }
        } catch (error) {
          this.logger.error?.(`[DataProvider] MFR entity extraction error: ${error.message}`);
        }
      }
    }

    // Combine all contributions
    return contributions.join('\n\n');
  }

  /**
   * Extract entities from problem description for MFR
   * @param {string} problemDescription - Natural language problem
   * @returns {Promise<Array<string>>} Entity names
   */
  async extractEntitiesForMfr(problemDescription) {
    const prompt = `Extract all concrete entities (people, places, things, organizations) from this problem description.
Return ONLY a JSON array of entity names.

Problem: ${problemDescription}

Format: ["Entity1", "Entity2", "Entity3"]

Respond with ONLY the JSON array, no other text.`;

    const response = await this.mistralClient.chat.complete({
      model: this.extractionModel,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 200,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim();

    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                     content.match(/(\[[\s\S]*\])/);
    const jsonText = jsonMatch ? jsonMatch[1] : content;

    try {
      const entities = JSON.parse(jsonText);
      this.logger.debug?.(`[DataProvider] Extracted ${entities.length} entities for MFR`);
      return entities;
    } catch (error) {
      this.logger.error?.(`[DataProvider] Entity extraction parsing error: ${error.message}`);
      return [];
    }
  }
}

export default DataProvider;
