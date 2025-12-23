import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

/**
 * Handler for ModelNegotiation Lingue mode
 * Manages collaborative model construction protocol messages
 */
export class ModelNegotiationHandler extends LanguageModeHandler {
  constructor({ logger, onPayload } = {}) {
    super({
      mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
      mimeType: MIME_TYPES.MODEL_NEGOTIATION,
      logger
    });
    this.onPayload = onPayload || null;
  }

  /**
   * Create XMPP stanza with negotiation message
   * @param {string} to - Recipient JID
   * @param {Object} payload - Negotiation message object
   * @param {string} summary - Human-readable summary
   * @param {Object} options - Additional options
   * @returns {Object} XMPP stanza
   */
  createStanza(to, payload, summary, options = {}) {
    const body = summary || payload?.type || "Model negotiation message";

    // Serialize payload to JSON
    const payloadJson = typeof payload === "string"
      ? payload
      : JSON.stringify(payload, null, 2);

    const stanza = xml(
      "message",
      { to, type: options.type || "groupchat" },
      xml("body", {}, body),
      xml(
        "payload",
        {
          xmlns: LINGUE_NS,
          mime: this.mimeType,
          mode: this.mode
        },
        payloadJson
      )
    );

    // Add message type as attribute if provided
    if (payload?.messageType) {
      const typeNode = stanza.getChild("payload", LINGUE_NS);
      if (typeNode) {
        typeNode.attrs.messageType = payload.messageType;
      }
    }

    return stanza;
  }

  /**
   * Parse negotiation payload from XMPP stanza
   * @param {Object} stanza - XMPP stanza
   * @returns {Object} Parsed negotiation message
   */
  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "{}";
    const mimeType = payloadNode?.attrs?.mime || this.mimeType;
    const mode = payloadNode?.attrs?.mode || this.mode;
    const messageType = payloadNode?.attrs?.messageType || null;

    // Parse JSON payload
    let payload = {};
    try {
      payload = JSON.parse(payloadText);
    } catch (error) {
      this.logger?.warn?.(
        `[ModelNegotiationHandler] Failed to parse JSON payload: ${error.message}`
      );
      payload = { raw: payloadText };
    }

    return {
      summary: body,
      payload,
      mimeType,
      mode,
      metadata: {
        messageType: messageType || payload?.messageType
      }
    };
  }

  /**
   * Handle incoming negotiation message
   * @param {Object} params - Payload handling parameters
   * @returns {Promise<any>} Result from onPayload callback
   */
  async handlePayload({ payload, summary, from, stanza, reply, metadata }) {
    if (!this.onPayload) {
      this.logger?.warn?.(
        "[ModelNegotiationHandler] No onPayload callback configured"
      );
      return null;
    }

    try {
      const messageType = metadata?.messageType || payload?.messageType;

      this.logger?.debug?.(
        `[ModelNegotiationHandler] Processing ${messageType} from ${from}`
      );

      const result = await this.onPayload({
        payload,
        summary,
        from,
        stanza,
        reply,
        metadata: {
          ...metadata,
          messageType
        }
      });

      return result;
    } catch (error) {
      this.logger?.error?.(
        `[ModelNegotiationHandler] Error processing payload: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Validate negotiation message payload
   * @param {Object} payload - Negotiation message object
   * @returns {boolean} True if payload is valid
   */
  validate(payload) {
    if (!payload || typeof payload !== "object") {
      return false;
    }

    // Valid negotiation messages should have a type or messageType
    return !!(payload.type || payload.messageType);
  }

  /**
   * Create a contribution request message
   * @param {string} sessionId - MFR session ID
   * @param {string} problemDescription - Problem description
   * @param {Array<string>} requestedContributions - Types of contributions needed
   * @returns {Object} Contribution request payload
   */
  static createContributionRequest(sessionId, problemDescription, requestedContributions = []) {
    return {
      messageType: "ModelContributionRequest",
      sessionId,
      problemDescription,
      requestedContributions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a conflict notification message
   * @param {string} sessionId - MFR session ID
   * @param {Array<Object>} conflicts - List of detected conflicts
   * @returns {Object} Conflict notification payload
   */
  static createConflictNotification(sessionId, conflicts) {
    return {
      messageType: "ModelConflict",
      sessionId,
      conflicts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a conflict resolution proposal
   * @param {string} sessionId - MFR session ID
   * @param {string} conflictId - ID of conflict being resolved
   * @param {string} strategy - Resolution strategy
   * @param {Object} resolution - Proposed resolution
   * @returns {Object} Resolution proposal payload
   */
  static createResolutionProposal(sessionId, conflictId, strategy, resolution) {
    return {
      messageType: "ConflictResolutionProposal",
      sessionId,
      conflictId,
      strategy,
      resolution,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a validation request message
   * @param {string} sessionId - MFR session ID
   * @param {string} modelId - ID of model to validate
   * @returns {Object} Validation request payload
   */
  static createValidationRequest(sessionId, modelId) {
    return {
      messageType: "ModelValidationRequest",
      sessionId,
      modelId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a solution request message
   * @param {string} sessionId - MFR session ID
   * @param {string} modelId - ID of validated model
   * @returns {Object} Solution request payload
   */
  static createSolutionRequest(sessionId, modelId) {
    return {
      messageType: "SolutionRequest",
      sessionId,
      modelId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a session complete message
   * @param {string} sessionId - MFR session ID
   * @param {Array<Object>} solutions - Final solutions
   * @returns {Object} Session complete payload
   */
  static createSessionComplete(sessionId, solutions) {
    return {
      messageType: "SessionComplete",
      sessionId,
      solutions,
      timestamp: new Date().toISOString()
    };
  }
}

export default ModelNegotiationHandler;
