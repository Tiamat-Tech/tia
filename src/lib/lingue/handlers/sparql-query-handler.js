/**
 * Handler for SPARQL query Lingue mode
 */
export class SparqlQueryHandler {
  constructor({ logger = console, onPayload = null } = {}) {
    this.logger = logger;
    this.onPayload = onPayload;
  }

  async handle({ payload, metadata, reply }) {
    this.logger.info("[SparqlQueryHandler] Received SPARQL query");

    if (!this.onPayload) {
      this.logger.warn("[SparqlQueryHandler] No onPayload callback configured");
      return "SPARQL query handler not configured";
    }

    try {
      const result = await this.onPayload({ payload, metadata });
      return result;
    } catch (error) {
      this.logger.error("[SparqlQueryHandler] Error:", error.message);
      return "Error executing SPARQL query";
    }
  }
}

export default SparqlQueryHandler;
