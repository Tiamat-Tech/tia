import { RdfUtils } from "./rdf-utils.js";
import { MFR_NS, CONFLICT_RESOLUTION_STRATEGIES } from "./constants.js";

/**
 * Merger for combining RDF contributions from multiple agents
 */
export class MfrModelMerger {
  constructor({ logger = console } = {}) {
    this.logger = logger;
  }

  /**
   * Merge RDF graphs from multiple agent contributions
   * @param {Array<Object>} contributions - Array of contribution objects
   * @returns {Promise<Object>} Merge result with dataset and metadata
   */
  async merge(contributions) {
    if (!Array.isArray(contributions)) {
      throw new Error("contributions must be an array");
    }

    this.logger.debug?.(
      `[MfrModelMerger] Merging ${contributions.length} contributions`
    );

    const datasets = contributions
      .filter((c) => c.dataset)
      .map((c) => c.dataset);

    const mergedDataset = await RdfUtils.mergeDatasets(datasets);

    const provenance = this.trackProvenance(contributions, mergedDataset);

    const quadCount = RdfUtils.countQuads(mergedDataset);
    this.logger.debug?.(
      `[MfrModelMerger] Merged dataset has ${quadCount} quads`
    );

    return {
      dataset: mergedDataset,
      quadCount,
      provenance,
      contributionCount: contributions.length
    };
  }

  /**
   * Track which agent contributed which triples
   * @param {Array<Object>} contributions - Array of contribution objects
   * @param {Object} mergedDataset - Merged RDF dataset
   * @returns {Object} Provenance map
   */
  trackProvenance(contributions, mergedDataset) {
    const provenance = {
      byAgent: {},
      byQuad: new Map()
    };

    for (const contribution of contributions) {
      const agentId = contribution.agentId;

      if (!provenance.byAgent[agentId]) {
        provenance.byAgent[agentId] = {
          quadCount: 0,
          timestamp: contribution.timestamp
        };
      }

      // Track which quads came from this agent
      for (const quad of contribution.dataset) {
        const quadKey = this.quadToKey(quad);

        if (!provenance.byQuad.has(quadKey)) {
          provenance.byQuad.set(quadKey, []);
        }

        provenance.byQuad.get(quadKey).push(agentId);
        provenance.byAgent[agentId].quadCount++;
      }
    }

    return provenance;
  }

  /**
   * Convert quad to unique key string
   * @param {Object} quad - RDF quad
   * @returns {string} Unique key
   */
  quadToKey(quad) {
    return `${quad.subject.value}|${quad.predicate.value}|${quad.object.value}`;
  }

  /**
   * Detect conflicts in merged graph
   * @param {Object} mergedDataset - Merged RDF dataset
   * @param {Object} provenance - Provenance tracking
   * @returns {Promise<Array<Object>>} Array of detected conflicts
   */
  async detectConflicts(mergedDataset, provenance = null) {
    const conflicts = [];
    const multiValuePredicates = new Set([
      "http://purl.org/stuff/mfr/hasParameter",
      "http://purl.org/stuff/mfr/hasPrecondition",
      "http://purl.org/stuff/mfr/hasEffect",
      "http://purl.org/stuff/mfr/constrainsEntity",
      "http://purl.org/stuff/mfr/appliesTo"
    ]);

    this.logger.debug?.("[MfrModelMerger] Detecting conflicts");

    // Group quads by subject-predicate pairs
    const subjectPredicateMap = new Map();

    for (const quad of mergedDataset) {
      const key = `${quad.subject.value}|${quad.predicate.value}`;

      if (!subjectPredicateMap.has(key)) {
        subjectPredicateMap.set(key, []);
      }

      subjectPredicateMap.get(key).push(quad);
    }

    // Check for conflicting values
    for (const [key, quads] of subjectPredicateMap.entries()) {
      if (quads.length > 1) {
        // Multiple values for same subject-predicate
        const uniqueObjects = new Set(quads.map((q) => q.object.value));

        if (uniqueObjects.size > 1) {
          const [, predicateUri] = key.split("|");
          if (
            multiValuePredicates.has(predicateUri) ||
            predicateUri.startsWith("http://purl.org/stuff/mfr/has")
          ) {
            continue;
          }
          // Different values - potential conflict
          const [subject, predicate] = key.split("|");

          const conflict = {
            type: "value_conflict",
            subject,
            predicate,
            values: Array.from(uniqueObjects),
            message: `Conflicting values for ${predicate} on ${subject}`
          };

          // Add provenance if available
          if (provenance) {
            conflict.sources = quads.map((quad) => {
              const quadKey = this.quadToKey(quad);
              return provenance.byQuad.get(quadKey) || [];
            });
          }

          conflicts.push(conflict);
        }
      }
    }

    this.logger.debug?.(
      `[MfrModelMerger] Detected ${conflicts.length} conflict(s)`
    );

    return conflicts;
  }

  /**
   * Resolve a conflict using a specified strategy
   * @param {Object} conflict - Conflict object
   * @param {string} strategy - Resolution strategy
   * @param {Object} mergedDataset - Dataset to modify
   * @param {Object} provenance - Provenance information
   * @returns {Promise<Object>} Resolution result
   */
  async resolveConflict(
    conflict,
    strategy = CONFLICT_RESOLUTION_STRATEGIES.MANUAL,
    mergedDataset,
    provenance
  ) {
    this.logger.debug?.(
      `[MfrModelMerger] Resolving conflict with strategy: ${strategy}`
    );

    switch (strategy) {
      case CONFLICT_RESOLUTION_STRATEGIES.MOST_RECENT:
        return this.resolveMostRecent(conflict, mergedDataset, provenance);

      case CONFLICT_RESOLUTION_STRATEGIES.AGENT_PRIORITY:
        return this.resolveByAgentPriority(
          conflict,
          mergedDataset,
          provenance
        );

      case CONFLICT_RESOLUTION_STRATEGIES.MOST_GROUNDED:
        return this.resolveMostGrounded(conflict, mergedDataset);

      case CONFLICT_RESOLUTION_STRATEGIES.MANUAL:
      default:
        return {
          strategy,
          resolved: false,
          message: "Manual resolution required",
          conflict
        };
    }
  }

  /**
   * Resolve conflict by keeping most recent contribution
   * @param {Object} conflict - Conflict object
   * @param {Object} mergedDataset - Dataset
   * @param {Object} provenance - Provenance information
   * @returns {Promise<Object>} Resolution result
   */
  async resolveMostRecent(conflict, mergedDataset, provenance) {
    // Implementation: keep quad from most recent contributor
    // This would require timestamp comparison from provenance

    return {
      strategy: CONFLICT_RESOLUTION_STRATEGIES.MOST_RECENT,
      resolved: false,
      message: "Most recent resolution not yet implemented",
      conflict
    };
  }

  /**
   * Resolve conflict by agent priority
   * @param {Object} conflict - Conflict object
   * @param {Object} mergedDataset - Dataset
   * @param {Object} provenance - Provenance information
   * @returns {Promise<Object>} Resolution result
   */
  async resolveByAgentPriority(conflict, mergedDataset, provenance) {
    // Implementation: use predefined agent priority order
    // This would require agent priority configuration

    return {
      strategy: CONFLICT_RESOLUTION_STRATEGIES.AGENT_PRIORITY,
      resolved: false,
      message: "Agent priority resolution not yet implemented",
      conflict
    };
  }

  /**
   * Resolve conflict by preferring most grounded values
   * @param {Object} conflict - Conflict object
   * @param {Object} mergedDataset - Dataset
   * @returns {Promise<Object>} Resolution result
   */
  async resolveMostGrounded(conflict, mergedDataset) {
    // Implementation: prefer values with external URI references
    const groundedValues = conflict.values.filter(
      (v) => v.startsWith("http://") || v.startsWith("https://")
    );

    if (groundedValues.length === 1) {
      // Clear winner - one grounded value
      const subject = RdfUtils.namedNode(conflict.subject);
      const predicate = RdfUtils.namedNode(conflict.predicate);

      // Remove all conflicting quads
      RdfUtils.removeMatching(mergedDataset, subject, predicate, null, null);

      // Add the grounded value
      const object = RdfUtils.namedNode(groundedValues[0]);
      mergedDataset.add(RdfUtils.quad(subject, predicate, object));

      return {
        strategy: CONFLICT_RESOLUTION_STRATEGIES.MOST_GROUNDED,
        resolved: true,
        selectedValue: groundedValues[0],
        message: "Conflict resolved by selecting grounded value"
      };
    }

    return {
      strategy: CONFLICT_RESOLUTION_STRATEGIES.MOST_GROUNDED,
      resolved: false,
      message: "No single grounded value found",
      conflict
    };
  }

  /**
   * Get merge statistics
   * @param {Object} mergeResult - Result from merge()
   * @returns {Object} Statistics
   */
  getMergeStats(mergeResult) {
    const agentContributions = Object.entries(
      mergeResult.provenance.byAgent
    ).map(([agentId, data]) => ({
      agentId,
      quadCount: data.quadCount,
      timestamp: data.timestamp
    }));

    return {
      totalQuads: mergeResult.quadCount,
      contributionCount: mergeResult.contributionCount,
      agentContributions,
      agentCount: agentContributions.length
    };
  }
}

export default MfrModelMerger;
