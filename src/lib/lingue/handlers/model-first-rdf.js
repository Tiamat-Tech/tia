import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

/**
 * Handler for ModelFirstRDF Lingue mode
 * Exchanges RDF model contributions in Turtle format
 */
export class ModelFirstRdfHandler extends LanguageModeHandler {
  constructor({ logger, onPayload } = {}) {
    super({
      mode: LANGUAGE_MODES.MODEL_FIRST_RDF,
      mimeType: MIME_TYPES.MODEL_FIRST_RDF,
      logger
    });
    this.onPayload = onPayload || null;
  }

  /**
   * Create XMPP stanza with RDF payload
   * @param {string} to - Recipient JID
   * @param {string} payload - RDF content in Turtle format
   * @param {string} summary - Human-readable summary of contribution
   * @param {Object} options - Additional options (type, metadata)
   * @returns {Object} XMPP stanza
   */
  createStanza(to, payload, summary, options = {}) {
    const body = summary || "RDF model contribution";
    const rdfPayload = payload || "";

    const messageChildren = [];
    if (!options.suppressBody) {
      messageChildren.push(xml("body", {}, body));
    }
    messageChildren.push(
      xml(
        "payload",
        {
          xmlns: LINGUE_NS,
          mime: this.mimeType,
          mode: this.mode
        },
        rdfPayload
      )
    );

    const stanza = xml(
      "message",
      { to, type: options.type || "groupchat" },
      ...messageChildren
    );

    // Add metadata if provided
    if (options.metadata) {
      const { sessionId, contributionType, agentRole } = options.metadata;

      if (sessionId) {
        stanza.append(xml("sessionId", { xmlns: LINGUE_NS }, sessionId));
      }

      if (contributionType) {
        stanza.append(
          xml("contributionType", { xmlns: LINGUE_NS }, contributionType)
        );
      }

      if (agentRole) {
        stanza.append(xml("agentRole", { xmlns: LINGUE_NS }, agentRole));
      }
    }

    return stanza;
  }

  /**
   * Parse RDF payload from XMPP stanza
   * @param {Object} stanza - XMPP stanza
   * @returns {Object} Parsed data with payload, summary, metadata
   */
  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const rdfPayload = payloadNode?.getText?.() || "";
    const mimeType = payloadNode?.attrs?.mime || this.mimeType;
    const mode = payloadNode?.attrs?.mode || this.mode;

    // Extract metadata
    const sessionId = stanza.getChildText("sessionId", LINGUE_NS) || null;
    const contributionType =
      stanza.getChildText("contributionType", LINGUE_NS) || null;
    const agentRole = stanza.getChildText("agentRole", LINGUE_NS) || null;

    return {
      summary: body,
      payload: rdfPayload,
      mimeType,
      mode,
      metadata: {
        sessionId,
        contributionType,
        agentRole
      }
    };
  }

  /**
   * Handle incoming RDF model payload
   * @param {Object} params - Payload handling parameters
   * @param {string} params.payload - RDF content
   * @param {string} params.summary - Summary text
   * @param {string} params.from - Sender JID
   * @param {Object} params.stanza - Original stanza
   * @param {Function} params.reply - Reply function
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<any>} Result from onPayload callback
   */
  async handlePayload({ payload, summary, from, stanza, reply, metadata }) {
    if (!this.onPayload) {
      this.logger?.warn?.(
        "[ModelFirstRdfHandler] No onPayload callback configured"
      );
      return null;
    }

    try {
      this.logger?.debug?.(
        `[ModelFirstRdfHandler] Processing RDF contribution from ${from}`
      );

      const result = await this.onPayload({
        payload,
        summary,
        from,
        stanza,
        reply,
        metadata
      });

      return result;
    } catch (error) {
      this.logger?.error?.(
        `[ModelFirstRdfHandler] Error processing payload: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Validate RDF payload (basic check)
   * @param {string} payload - RDF content
   * @returns {boolean} True if payload appears to be valid Turtle
   */
  validate(payload) {
    if (!payload || typeof payload !== "string") {
      return false;
    }

    // Basic validation: check for common Turtle patterns
    const hasPrefixes = /@prefix/.test(payload);
    const hasTriples = /\s+a\s+/.test(payload) || /\s*<.*>\s*<.*>\s*/.test(payload);

    return hasPrefixes || hasTriples;
  }
}

export default ModelFirstRdfHandler;
