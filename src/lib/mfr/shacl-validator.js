import SHACLValidator from "rdf-validate-shacl";
import { RdfUtils } from "./rdf-utils.js";
import { VALIDATION_STATUS } from "./constants.js";

/**
 * SHACL validator for MFR problem models
 */
export class MfrShaclValidator {
  constructor({ shapesGraph, logger = console } = {}) {
    this.shapesGraph = shapesGraph;
    this.logger = logger;
    this.validator = null;

    if (shapesGraph) {
      this.validator = new SHACLValidator(shapesGraph);
    }
  }

  /**
   * Initialize validator with shapes graph
   * @param {Object} shapesGraph - RDF dataset containing SHACL shapes
   */
  setShapesGraph(shapesGraph) {
    this.shapesGraph = shapesGraph;
    this.validator = new SHACLValidator(shapesGraph);
  }

  /**
   * Validate an RDF dataset against SHACL shapes
   * @param {Object} dataGraph - RDF dataset to validate
   * @returns {Promise<Object>} Validation report
   */
  async validate(dataGraph) {
    if (!this.validator) {
      throw new Error("Validator not initialized with shapes graph");
    }

    try {
      this.logger.debug?.("[MfrShaclValidator] Running SHACL validation");

      const report = this.validator.validate(dataGraph);

      const result = {
        conforms: report.conforms,
        violations: [],
        timestamp: new Date().toISOString()
      };

      // Extract violations if validation failed
      if (!report.conforms) {
        for (const resultQuad of report.results) {
          const violation = this.extractViolation(resultQuad, report.dataset);
          result.violations.push(violation);
        }

        this.logger.debug?.(
          `[MfrShaclValidator] Validation failed with ${result.violations.length} violation(s)`
        );
      } else {
        this.logger.debug?.("[MfrShaclValidator] Validation passed");
      }

      return result;
    } catch (error) {
      this.logger.error?.(
        `[MfrShaclValidator] Validation error: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Extract violation details from a result node
   * @param {Object} resultNode - Validation result node
   * @param {Object} reportDataset - Report dataset
   * @returns {Object} Violation details
   */
  extractViolation(resultNode, reportDataset) {
    const violation = {
      message: null,
      path: null,
      focusNode: null,
      resultSeverity: "Violation",
      sourceConstraintComponent: null,
      sourceShape: null,
      value: null
    };

    // Extract message
    const messages = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#resultMessage"
    );
    if (messages.length > 0) {
      violation.message = messages[0];
    }

    // Extract path
    const paths = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#resultPath"
    );
    if (paths.length > 0) {
      violation.path = paths[0];
    }

    // Extract focus node
    const focusNodes = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#focusNode"
    );
    if (focusNodes.length > 0) {
      violation.focusNode = focusNodes[0];
    }

    // Extract severity
    const severities = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#resultSeverity"
    );
    if (severities.length > 0) {
      const severityUri = severities[0];
      if (severityUri.includes("Violation")) {
        violation.resultSeverity = "Violation";
      } else if (severityUri.includes("Warning")) {
        violation.resultSeverity = "Warning";
      } else if (severityUri.includes("Info")) {
        violation.resultSeverity = "Info";
      }
    }

    // Extract source constraint component
    const components = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#sourceConstraintComponent"
    );
    if (components.length > 0) {
      violation.sourceConstraintComponent = components[0];
    }

    // Extract source shape
    const shapes = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#sourceShape"
    );
    if (shapes.length > 0) {
      violation.sourceShape = shapes[0];
    }

    // Extract value
    const values = RdfUtils.extractValues(
      reportDataset,
      resultNode.value,
      "http://www.w3.org/ns/shacl#value"
    );
    if (values.length > 0) {
      violation.value = values[0];
    }

    return violation;
  }

  /**
   * Validate model completeness
   * @param {Object} model - RDF dataset
   * @returns {Promise<Object>} Validation result with completeness status
   */
  async validateCompleteness(model) {
    const report = await this.validate(model);

    const completenessViolations = report.violations.filter((v) =>
      this.isCompletenessViolation(v)
    );

    return {
      ...report,
      status: report.conforms
        ? VALIDATION_STATUS.VALID
        : completenessViolations.length > 0
          ? VALIDATION_STATUS.INCOMPLETE
          : VALIDATION_STATUS.INVALID,
      completenessViolations
    };
  }

  /**
   * Detect conflicts in the model
   * @param {Object} model - RDF dataset
   * @returns {Promise<Array<Object>>} Array of detected conflicts
   */
  async detectConflicts(model) {
    const report = await this.validate(model);

    const conflicts = report.violations.filter((v) =>
      this.isConflictViolation(v)
    );

    return conflicts.map((v) => ({
      message: v.message,
      focusNode: v.focusNode,
      path: v.path,
      value: v.value,
      type: "constraint_violation"
    }));
  }

  /**
   * Check if a violation indicates missing required properties
   * @param {Object} violation - Violation object
   * @returns {boolean} True if completeness violation
   */
  isCompletenessViolation(violation) {
    const message = (violation.message || "").toLowerCase();
    const component = (violation.sourceConstraintComponent || "").toLowerCase();

    return (
      component.includes("mincount") ||
      message.includes("required") ||
      message.includes("must have") ||
      message.includes("at least one")
    );
  }

  /**
   * Check if a violation indicates a conflict
   * @param {Object} violation - Violation object
   * @returns {boolean} True if conflict violation
   */
  isConflictViolation(violation) {
    const message = (violation.message || "").toLowerCase();

    return (
      message.includes("conflict") ||
      message.includes("contradiction") ||
      message.includes("incompatible") ||
      message.includes("inconsistent")
    );
  }

  /**
   * Get human-readable validation summary
   * @param {Object} validationReport - Validation report
   * @returns {string} Summary text
   */
  formatValidationSummary(validationReport) {
    if (validationReport.conforms) {
      return "Model validation passed - no violations detected.";
    }

    const lines = [
      `Model validation failed with ${validationReport.violations.length} violation(s):`,
      ""
    ];

    validationReport.violations.forEach((v, index) => {
      lines.push(`${index + 1}. ${v.message || "Constraint violation"}`);

      if (v.path) {
        lines.push(`   Property: ${v.path}`);
      }

      if (v.focusNode) {
        lines.push(`   Focus Node: ${v.focusNode}`);
      }

      if (v.value) {
        lines.push(`   Value: ${v.value}`);
      }

      if (v.resultSeverity !== "Violation") {
        lines.push(`   Severity: ${v.resultSeverity}`);
      }

      lines.push("");
    });

    return lines.join("\n");
  }

  /**
   * Filter violations by severity
   * @param {Object} validationReport - Validation report
   * @param {string} severity - Severity level (Violation, Warning, Info)
   * @returns {Array<Object>} Filtered violations
   */
  filterBySeverity(validationReport, severity = "Violation") {
    return validationReport.violations.filter(
      (v) => v.resultSeverity === severity
    );
  }

  /**
   * Get validation statistics
   * @param {Object} validationReport - Validation report
   * @returns {Object} Statistics
   */
  getValidationStats(validationReport) {
    const violationsBySeverity = {
      Violation: 0,
      Warning: 0,
      Info: 0
    };

    validationReport.violations.forEach((v) => {
      violationsBySeverity[v.resultSeverity] =
        (violationsBySeverity[v.resultSeverity] || 0) + 1;
    });

    return {
      conforms: validationReport.conforms,
      totalViolations: validationReport.violations.length,
      violationsBySeverity,
      hasErrors: violationsBySeverity.Violation > 0,
      hasWarnings: violationsBySeverity.Warning > 0,
      hasInfo: violationsBySeverity.Info > 0
    };
  }
}

export default MfrShaclValidator;
