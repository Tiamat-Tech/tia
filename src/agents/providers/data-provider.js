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
}

export default DataProvider;
