import { RdfUtils } from "./rdf-utils.js";
import { MFR_NS } from "./constants.js";

/**
 * Store for managing MFR problem models and agent contributions
 */
export class MfrModelStore {
  constructor({ logger = console } = {}) {
    this.logger = logger;

    // Map: problemId -> merged RDF dataset
    this.models = new Map();

    // Map: problemId -> array of contributions
    this.contributions = new Map();

    // Map: problemId -> metadata
    this.metadata = new Map();
  }

  /**
   * Create a new problem model
   * @param {string} problemId - Unique identifier for the problem
   * @param {string} initialDescription - Natural language problem description
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created model metadata
   */
  async createModel(problemId, initialDescription, metadata = {}) {
    if (this.models.has(problemId)) {
      throw new Error(`Model ${problemId} already exists`);
    }

    this.logger.debug?.(`[MfrModelStore] Creating model: ${problemId}`);

    // Create empty dataset for the model
    const dataset = RdfUtils.createDataset();

    // Add problem model metadata
    const modelUri = `${MFR_NS}model/${problemId}`;
    const problemModelNode = RdfUtils.namedNode(modelUri);

    dataset.add(
      RdfUtils.quad(
        problemModelNode,
        RdfUtils.namedNode(`${MFR_NS}sessionId`),
        RdfUtils.literal(problemId)
      )
    );

    dataset.add(
      RdfUtils.quad(
        problemModelNode,
        RdfUtils.namedNode(`${MFR_NS}problemDescription`),
        RdfUtils.literal(initialDescription)
      )
    );

    dataset.add(
      RdfUtils.quad(
        problemModelNode,
        RdfUtils.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        ),
        RdfUtils.namedNode(`${MFR_NS}ProblemModel`)
      )
    );

    this.models.set(problemId, dataset);
    this.contributions.set(problemId, []);
    this.metadata.set(problemId, {
      ...metadata,
      created: new Date().toISOString(),
      problemDescription: initialDescription
    });

    return {
      problemId,
      modelUri,
      created: new Date().toISOString()
    };
  }

  /**
   * Add a contribution to a problem model
   * @param {string} problemId - Problem identifier
   * @param {string} agentId - Agent making the contribution
   * @param {string} contributionRdf - RDF content in Turtle format
   * @param {Object} metadata - Contribution metadata
   * @returns {Promise<Object>} Contribution record
   */
  async addContribution(
    problemId,
    agentId,
    contributionRdf,
    metadata = {}
  ) {
    if (!this.models.has(problemId)) {
      throw new Error(`Model ${problemId} not found`);
    }

    this.logger.debug?.(
      `[MfrModelStore] Adding contribution from ${agentId} to ${problemId}`
    );

    // Parse the contribution RDF
    const contributionDataset = await RdfUtils.parseTurtle(contributionRdf);

    const contribution = {
      agentId,
      dataset: contributionDataset,
      rdf: contributionRdf,
      timestamp: new Date().toISOString(),
      metadata
    };

    const contributions = this.contributions.get(problemId);
    contributions.push(contribution);

    this.logger.debug?.(
      `[MfrModelStore] ${contributions.length} contribution(s) for ${problemId}`
    );

    return contribution;
  }

  /**
   * Merge all contributions into the model dataset
   * @param {string} problemId - Problem identifier
   * @returns {Promise<Object>} Merged dataset
   */
  async mergeContributions(problemId) {
    if (!this.models.has(problemId)) {
      throw new Error(`Model ${problemId} not found`);
    }

    const contributions = this.contributions.get(problemId);

    this.logger.debug?.(
      `[MfrModelStore] Merging ${contributions.length} contributions for ${problemId}`
    );

    // Get base model
    const baseModel = this.models.get(problemId);

    // Collect all contribution datasets
    const datasets = [baseModel, ...contributions.map((c) => c.dataset)];

    // Merge all datasets
    const merged = await RdfUtils.mergeDatasets(datasets);

    // Link entities, goals, actions, and constraints to the ProblemModel
    this.linkComponentsToModel(merged, problemId);

    // Update the stored model
    this.models.set(problemId, merged);

    this.logger.debug?.(
      `[MfrModelStore] Merged model has ${RdfUtils.countQuads(merged)} quads`
    );

    return merged;
  }

  /**
   * Link entities, goals, actions, and constraints to the ProblemModel node
   * @param {Object} dataset - RDF dataset
   * @param {string} problemId - Problem identifier
   */
  linkComponentsToModel(dataset, problemId) {
    const modelUri = `${MFR_NS}model/${problemId}`;
    const modelNode = RdfUtils.namedNode(modelUri);
    const rdfType = RdfUtils.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

    let entityCount = 0;
    let goalCount = 0;
    let actionCount = 0;
    let constraintCount = 0;

    // Find and link all entities
    const entityType = RdfUtils.namedNode(`${MFR_NS}Entity`);
    const hasEntity = RdfUtils.namedNode(`${MFR_NS}hasEntity`);
    for (const quad of dataset) {
      if (quad.predicate.equals(rdfType) && quad.object.equals(entityType)) {
        dataset.add(RdfUtils.quad(modelNode, hasEntity, quad.subject));
        entityCount++;
      }
    }

    // Find and link all goals
    const goalType = RdfUtils.namedNode(`${MFR_NS}Goal`);
    const hasGoal = RdfUtils.namedNode(`${MFR_NS}hasGoal`);
    for (const quad of dataset) {
      if (quad.predicate.equals(rdfType) && quad.object.equals(goalType)) {
        dataset.add(RdfUtils.quad(modelNode, hasGoal, quad.subject));
        goalCount++;
      }
    }

    // Find and link all actions
    const actionType = RdfUtils.namedNode(`${MFR_NS}Action`);
    const hasAction = RdfUtils.namedNode(`${MFR_NS}hasAction`);
    for (const quad of dataset) {
      if (quad.predicate.equals(rdfType) && quad.object.equals(actionType)) {
        dataset.add(RdfUtils.quad(modelNode, hasAction, quad.subject));
        actionCount++;
      }
    }

    // Find and link all constraints
    const constraintType = RdfUtils.namedNode(`${MFR_NS}Constraint`);
    const hasConstraint = RdfUtils.namedNode(`${MFR_NS}hasConstraint`);
    for (const quad of dataset) {
      if (quad.predicate.equals(rdfType) && quad.object.equals(constraintType)) {
        dataset.add(RdfUtils.quad(modelNode, hasConstraint, quad.subject));
        constraintCount++;
      }
    }

    this.logger.info?.(
      `[MfrModelStore] Linked components: ${entityCount} entities, ${goalCount} goals, ${actionCount} actions, ${constraintCount} constraints`
    );
  }

  /**
   * Get the current model dataset
   * @param {string} problemId - Problem identifier
   * @returns {Promise<Object|null>} RDF dataset or null if not found
   */
  async getModel(problemId) {
    return this.models.get(problemId) || null;
  }

  /**
   * Get model as Turtle string
   * @param {string} problemId - Problem identifier
   * @returns {Promise<string|null>} Turtle RDF or null if not found
   */
  async getModelAsturtle(problemId) {
    const dataset = await this.getModel(problemId);
    if (!dataset) return null;

    return RdfUtils.serializeTurtle(dataset);
  }

  /**
   * List all contributors to a problem model
   * @param {string} problemId - Problem identifier
   * @returns {Promise<Array<string>>} Array of agent IDs
   */
  async listContributors(problemId) {
    const contributions = this.contributions.get(problemId);
    if (!contributions) return [];

    const contributors = new Set(contributions.map((c) => c.agentId));
    return Array.from(contributors);
  }

  /**
   * Get all contributions for a problem
   * @param {string} problemId - Problem identifier
   * @returns {Promise<Array<Object>>} Array of contribution records
   */
  async getContributions(problemId) {
    return this.contributions.get(problemId) || [];
  }

  /**
   * Get contributions from a specific agent
   * @param {string} problemId - Problem identifier
   * @param {string} agentId - Agent identifier
   * @returns {Promise<Array<Object>>} Array of contribution records
   */
  async getContributionsByAgent(problemId, agentId) {
    const contributions = this.contributions.get(problemId) || [];
    return contributions.filter((c) => c.agentId === agentId);
  }

  /**
   * Get model metadata
   * @param {string} problemId - Problem identifier
   * @returns {Promise<Object|null>} Metadata or null if not found
   */
  async getMetadata(problemId) {
    return this.metadata.get(problemId) || null;
  }

  /**
   * Update model metadata
   * @param {string} problemId - Problem identifier
   * @param {Object} updates - Metadata updates
   * @returns {Promise<Object>} Updated metadata
   */
  async updateMetadata(problemId, updates) {
    const current = this.metadata.get(problemId) || {};
    const updated = { ...current, ...updates };
    this.metadata.set(problemId, updated);
    return updated;
  }

  /**
   * Delete a problem model and all its contributions
   * @param {string} problemId - Problem identifier
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteModel(problemId) {
    const existed =
      this.models.has(problemId) ||
      this.contributions.has(problemId) ||
      this.metadata.has(problemId);

    this.models.delete(problemId);
    this.contributions.delete(problemId);
    this.metadata.delete(problemId);

    if (existed) {
      this.logger.debug?.(`[MfrModelStore] Deleted model: ${problemId}`);
    }

    return existed;
  }

  /**
   * List all problem IDs in the store
   * @returns {Promise<Array<string>>} Array of problem IDs
   */
  async listModels() {
    return Array.from(this.models.keys());
  }

  /**
   * Get statistics about a model
   * @param {string} problemId - Problem identifier
   * @returns {Promise<Object|null>} Statistics or null if not found
   */
  async getModelStats(problemId) {
    const dataset = this.models.get(problemId);
    if (!dataset) return null;

    const contributions = this.contributions.get(problemId) || [];
    const contributors = await this.listContributors(problemId);

    return {
      problemId,
      quadCount: RdfUtils.countQuads(dataset),
      contributionCount: contributions.length,
      contributorCount: contributors.length,
      contributors,
      created: this.metadata.get(problemId)?.created
    };
  }

  /**
   * Check if a model exists
   * @param {string} problemId - Problem identifier
   * @returns {Promise<boolean>} True if model exists
   */
  async hasModel(problemId) {
    return this.models.has(problemId);
  }

  /**
   * Clear all models (use with caution)
   * @returns {Promise<void>}
   */
  async clearAll() {
    this.logger.warn?.("[MfrModelStore] Clearing all models");
    this.models.clear();
    this.contributions.clear();
    this.metadata.clear();
  }
}

export default MfrModelStore;
