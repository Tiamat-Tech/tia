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
    const resultId = this.getResultId(resultNode);
    const violation = {
      message: null,
      path: null,
      focusNode: null,
      resultSeverity: "Violation",
      sourceConstraintComponent: null,
      sourceShape: null,
      value: null,
      details: [],
      resultId
    };

    if (resultNode) {
      if (resultNode.message) {
        violation.message = this.normalizeTerm(resultNode.message);
      }
      if (resultNode.path) {
        violation.path = this.normalizeTerm(resultNode.path);
      }
      if (resultNode.focusNode) {
        violation.focusNode = this.normalizeTerm(resultNode.focusNode);
      }
      if (resultNode.severity) {
        violation.resultSeverity = this.normalizeTerm(resultNode.severity);
      }
      if (resultNode.sourceConstraintComponent) {
        violation.sourceConstraintComponent = this.normalizeTerm(
          resultNode.sourceConstraintComponent
        );
      }
      if (resultNode.sourceShape) {
        violation.sourceShape = this.normalizeTerm(resultNode.sourceShape);
      }
      if (resultNode.value) {
        violation.value = this.normalizeTerm(resultNode.value);
      }
    }

    // Extract message
    const messages = RdfUtils.extractValues(
      reportDataset,
      resultNode?.value,
      "http://www.w3.org/ns/shacl#resultMessage"
    );
    if (messages.length > 0) {
      violation.message = messages[0];
    }

    // Extract path
    const paths = RdfUtils.extractValues(
      reportDataset,
      resultNode?.value,
      "http://www.w3.org/ns/shacl#resultPath"
    );
    if (paths.length > 0) {
      violation.path = paths[0];
    }

    // Extract focus node
    const focusNodes = RdfUtils.extractValues(
      reportDataset,
      resultNode?.value,
      "http://www.w3.org/ns/shacl#focusNode"
    );
    if (focusNodes.length > 0) {
      violation.focusNode = focusNodes[0];
    }

    // Extract severity
    const severities = RdfUtils.extractValues(
      reportDataset,
      resultNode?.value,
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
      resultNode?.value,
      "http://www.w3.org/ns/shacl#sourceConstraintComponent"
    );
    if (components.length > 0) {
      violation.sourceConstraintComponent = components[0];
    }

    // Extract source shape
    const shapes = RdfUtils.extractValues(
      reportDataset,
      resultNode?.value,
      "http://www.w3.org/ns/shacl#sourceShape"
    );
    if (shapes.length > 0) {
      violation.sourceShape = shapes[0];
    }

    // Extract value
    const values = RdfUtils.extractValues(
      reportDataset,
      resultNode?.value,
      "http://www.w3.org/ns/shacl#value"
    );
    if (values.length > 0) {
      violation.value = values[0];
    }

    if (resultId) {
      violation.details = this.extractResultDetails(reportDataset, resultId);
      if (!violation.message && violation.details.length > 0) {
        const detail = violation.details[0];
        violation.message = `${detail.predicate} ${detail.object}`;
      }
    }

    if (violation.sourceShape && (!violation.path || !violation.message)) {
      violation.shapeDetails = this.describeShape(violation.sourceShape);
    }

    return violation;
  }

  normalizeTerm(term) {
    if (!term) return null;
    if (typeof term === "string") return term;
    if (typeof term === "object") {
      if (typeof term.value === "string") return term.value;
      if (typeof term.id === "string") return term.id;
      if (term.termType && typeof term.toString === "function") {
        return term.toString();
      }
    }
    return String(term);
  }

  getResultId(resultNode) {
    if (!resultNode) return null;
    if (resultNode.value) return resultNode.value;
    if (resultNode.id) return resultNode.id;
    if (resultNode.term && resultNode.term.value) return resultNode.term.value;
    return null;
  }

  extractResultDetails(reportDataset, resultId) {
    const details = [];
    for (const quad of reportDataset) {
      if (quad.subject?.value === resultId) {
        details.push({
          predicate: quad.predicate?.value,
          object:
            quad.object?.termType === "Literal"
              ? quad.object.value
              : quad.object?.value
        });
      }
    }
    return details;
  }

  describeShape(shapeId) {
    if (!this.shapesGraph || !shapeId) {
      return {};
    }

    const SHACL = "http://www.w3.org/ns/shacl#";
    const details = {
      path: null,
      message: null,
      minCount: null,
      maxCount: null,
      class: null,
      datatype: null
    };

    const path = RdfUtils.extractValues(this.shapesGraph, shapeId, `${SHACL}path`);
    if (path.length > 0) details.path = path[0];

    const message = RdfUtils.extractValues(this.shapesGraph, shapeId, `${SHACL}message`);
    if (message.length > 0) details.message = message[0];

    const minCount = RdfUtils.extractValues(this.shapesGraph, shapeId, `${SHACL}minCount`);
    if (minCount.length > 0) details.minCount = minCount[0];

    const maxCount = RdfUtils.extractValues(this.shapesGraph, shapeId, `${SHACL}maxCount`);
    if (maxCount.length > 0) details.maxCount = maxCount[0];

    const shapeClass = RdfUtils.extractValues(this.shapesGraph, shapeId, `${SHACL}class`);
    if (shapeClass.length > 0) details.class = shapeClass[0];

    const datatype = RdfUtils.extractValues(this.shapesGraph, shapeId, `${SHACL}datatype`);
    if (datatype.length > 0) details.datatype = datatype[0];

    return details;
  }

  /**
   * Validate model completeness
   * @param {Object} model - RDF dataset
   * @returns {Promise<Object>} Validation result with completeness status
   */
  async validateCompleteness(model) {
    const report = await this.validate(model);

    const nonInfoViolations = report.violations.filter(
      (v) => v.resultSeverity !== "Info"
    );
    const completenessViolations = nonInfoViolations.filter((v) =>
      this.isCompletenessViolation(v)
    );
    const effectiveConforms = nonInfoViolations.length === 0;

    return {
      ...report,
      conforms: effectiveConforms,
      status: effectiveConforms
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
    const message = String(violation.message || "").toLowerCase();
    const component = String(violation.sourceConstraintComponent || "").toLowerCase();

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

    // Filter to show only actual violations (errors), not warnings or info
    const errors = validationReport.violations.filter(v => {
      const severity = this.normalizeTerm(v.resultSeverity);
      return severity === "Violation" || severity === "http://www.w3.org/ns/shacl#Violation";
    });

    const warnings = validationReport.violations.filter(v => {
      const severity = this.normalizeTerm(v.resultSeverity);
      return severity === "Warning" || severity === "http://www.w3.org/ns/shacl#Warning";
    });

    const infos = validationReport.violations.filter(v => {
      const severity = this.normalizeTerm(v.resultSeverity);
      return severity === "Info" || severity === "http://www.w3.org/ns/shacl#Info";
    });

    // Only show errors in detail
    const lines = [];
    if (errors.length > 0) {
      lines.push(`Model validation failed with ${errors.length} error(s):`);
      lines.push("");
    } else {
      lines.push(`Model validation passed (${warnings.length} warning(s), ${infos.length} info)`);
      return lines.join("\n");
    }

    errors.forEach((v, index) => {
      const messageText = this.normalizeTerm(v.message);
      let safeMessage = "Constraint violation";
      if (messageText && messageText !== "[object Object]") {
        safeMessage = messageText;
      } else if (v.path) {
        safeMessage = `Constraint violation on ${this.normalizeTerm(v.path)}`;
      } else if (v.sourceShape) {
        safeMessage = `Constraint violation in shape ${this.normalizeTerm(v.sourceShape)}`;
      }
      lines.push(`${index + 1}. ${safeMessage}`);

      if (v.path) {
        lines.push(`   Property: ${String(v.path)}`);
      }

      if (v.focusNode) {
        lines.push(`   Focus Node: ${String(v.focusNode)}`);
      }

      if (v.value) {
        lines.push(`   Value: ${String(v.value)}`);
      }

      if (v.resultSeverity !== "Violation") {
        lines.push(`   Severity: ${String(v.resultSeverity)}`);
      }

      if (v.sourceConstraintComponent) {
        lines.push(`   Constraint: ${String(v.sourceConstraintComponent)}`);
      }

      if (v.sourceShape) {
        lines.push(`   Shape: ${String(v.sourceShape)}`);
      }

      if (v.shapeDetails) {
        const shapeParts = [];
        if (v.shapeDetails.path) shapeParts.push(`path=${v.shapeDetails.path}`);
        if (v.shapeDetails.minCount) shapeParts.push(`minCount=${v.shapeDetails.minCount}`);
        if (v.shapeDetails.maxCount) shapeParts.push(`maxCount=${v.shapeDetails.maxCount}`);
        if (v.shapeDetails.class) shapeParts.push(`class=${v.shapeDetails.class}`);
        if (v.shapeDetails.datatype) shapeParts.push(`datatype=${v.shapeDetails.datatype}`);
        if (v.shapeDetails.message) shapeParts.push(`message=${v.shapeDetails.message}`);
        if (shapeParts.length > 0) {
          lines.push(`   Shape details: ${shapeParts.join(", ")}`);
        }
      }

      if (v.details && v.details.length > 0) {
        const detailLines = v.details.slice(0, 5).map(
          (detail) => `   Detail: ${detail.predicate} -> ${detail.object}`
        );
        lines.push(...detailLines);
      } else if (v.resultId) {
        lines.push(`   Result node: ${v.resultId}`);
      }

      const onlyTypeDetail =
        v.details &&
        v.details.length === 1 &&
        v.details[0].predicate ===
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
      if (
        !v.message &&
        !v.path &&
        !v.focusNode &&
        !v.value &&
        (v.details.length === 0 || onlyTypeDetail)
      ) {
        lines.push("   Detail: No SHACL result fields available in report.");
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
