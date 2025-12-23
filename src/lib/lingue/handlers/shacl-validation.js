import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

/**
 * Handler for ShaclValidation Lingue mode
 * Exchanges SHACL validation results and constraint violations
 */
export class ShaclValidationHandler extends LanguageModeHandler {
  constructor({ logger, onPayload } = {}) {
    super({
      mode: LANGUAGE_MODES.SHACL_VALIDATION,
      mimeType: MIME_TYPES.SHACL_VALIDATION,
      logger
    });
    this.onPayload = onPayload || null;
  }

  /**
   * Create XMPP stanza with validation report
   * @param {string} to - Recipient JID
   * @param {Object} payload - Validation report object
   * @param {string} summary - Human-readable summary
   * @param {Object} options - Additional options
   * @returns {Object} XMPP stanza
   */
  createStanza(to, payload, summary, options = {}) {
    const conforms = payload?.conforms ?? false;
    const violationCount = payload?.violations?.length || 0;

    const body =
      summary ||
      (conforms
        ? "Validation passed"
        : `Validation failed with ${violationCount} violation(s)`);

    // Serialize payload to JSON
    const payloadJson =
      typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

    const stanza = xml(
      "message",
      { to, type: options.type || "groupchat" },
      xml("body", {}, body),
      xml(
        "payload",
        {
          xmlns: LINGUE_NS,
          mime: this.mimeType,
          mode: this.mode,
          conforms: conforms.toString()
        },
        payloadJson
      )
    );

    return stanza;
  }

  /**
   * Parse validation report from XMPP stanza
   * @param {Object} stanza - XMPP stanza
   * @returns {Object} Parsed validation report
   */
  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "{}";
    const mimeType = payloadNode?.attrs?.mime || this.mimeType;
    const mode = payloadNode?.attrs?.mode || this.mode;
    const conforms = payloadNode?.attrs?.conforms === "true";

    // Parse JSON payload
    let payload = {};
    try {
      payload = JSON.parse(payloadText);
    } catch (error) {
      this.logger?.warn?.(
        `[ShaclValidationHandler] Failed to parse JSON payload: ${error.message}`
      );
      payload = { raw: payloadText, conforms: false };
    }

    return {
      summary: body,
      payload,
      mimeType,
      mode,
      metadata: {
        conforms: payload?.conforms ?? conforms
      }
    };
  }

  /**
   * Handle incoming validation report
   * @param {Object} params - Payload handling parameters
   * @returns {Promise<any>} Result from onPayload callback
   */
  async handlePayload({ payload, summary, from, stanza, reply, metadata }) {
    if (!this.onPayload) {
      this.logger?.warn?.(
        "[ShaclValidationHandler] No onPayload callback configured"
      );
      return null;
    }

    try {
      const conforms = metadata?.conforms ?? payload?.conforms ?? false;

      this.logger?.debug?.(
        `[ShaclValidationHandler] Processing validation report from ${from}: ${conforms ? "VALID" : "INVALID"}`
      );

      const result = await this.onPayload({
        payload,
        summary,
        from,
        stanza,
        reply,
        metadata: {
          ...metadata,
          conforms
        }
      });

      return result;
    } catch (error) {
      this.logger?.error?.(
        `[ShaclValidationHandler] Error processing payload: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Validate validation report structure
   * @param {Object} payload - Validation report object
   * @returns {boolean} True if payload has required structure
   */
  validate(payload) {
    if (!payload || typeof payload !== "object") {
      return false;
    }

    // Valid validation reports must have a conforms property
    return typeof payload.conforms === "boolean";
  }

  /**
   * Create a validation report payload
   * @param {boolean} conforms - Whether validation passed
   * @param {Array<Object>} violations - List of constraint violations
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Validation report payload
   */
  static createValidationReport(conforms, violations = [], metadata = {}) {
    return {
      conforms,
      violations: violations.map((v) => ({
        message: v.message || "Constraint violation",
        path: v.path || null,
        focusNode: v.focusNode || null,
        resultSeverity: v.resultSeverity || "Violation",
        sourceConstraintComponent: v.sourceConstraintComponent || null,
        sourceShape: v.sourceShape || null,
        value: v.value || null
      })),
      timestamp: new Date().toISOString(),
      ...metadata
    };
  }

  /**
   * Create a successful validation result
   * @param {Object} metadata - Additional metadata (sessionId, modelId, etc.)
   * @returns {Object} Validation report with conforms=true
   */
  static createSuccessReport(metadata = {}) {
    return this.createValidationReport(true, [], metadata);
  }

  /**
   * Create a failed validation result
   * @param {Array<Object>} violations - List of violations
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Validation report with conforms=false
   */
  static createFailureReport(violations, metadata = {}) {
    return this.createValidationReport(false, violations, metadata);
  }

  /**
   * Extract human-readable violation summary
   * @param {Object} validationReport - Validation report object
   * @returns {string} Summary of violations
   */
  static formatViolationSummary(validationReport) {
    if (validationReport.conforms) {
      return "Validation passed - no violations detected";
    }

    const violations = validationReport.violations || [];
    if (violations.length === 0) {
      return "Validation failed (no specific violations reported)";
    }

    const lines = [
      `Validation failed with ${violations.length} violation(s):`,
      ""
    ];

    violations.forEach((v, index) => {
      lines.push(`${index + 1}. ${v.message}`);
      if (v.path) {
        lines.push(`   Path: ${v.path}`);
      }
      if (v.focusNode) {
        lines.push(`   Focus Node: ${v.focusNode}`);
      }
      lines.push("");
    });

    return lines.join("\n");
  }

  /**
   * Check if validation report indicates completeness issues
   * @param {Object} validationReport - Validation report object
   * @returns {boolean} True if violations indicate missing required properties
   */
  static hasCompletenessViolations(validationReport) {
    if (validationReport.conforms) {
      return false;
    }

    const violations = validationReport.violations || [];
    return violations.some(
      (v) =>
        v.sourceConstraintComponent?.includes("MinCountConstraint") ||
        v.message?.toLowerCase().includes("required") ||
        v.message?.toLowerCase().includes("must have")
    );
  }

  /**
   * Check if validation report indicates conflicts
   * @param {Object} validationReport - Validation report object
   * @returns {boolean} True if violations indicate conflicts
   */
  static hasConflictViolations(validationReport) {
    if (validationReport.conforms) {
      return false;
    }

    const violations = validationReport.violations || [];
    return violations.some(
      (v) =>
        v.message?.toLowerCase().includes("conflict") ||
        v.message?.toLowerCase().includes("contradiction") ||
        v.message?.toLowerCase().includes("incompatible")
    );
  }
}

export default ShaclValidationHandler;
