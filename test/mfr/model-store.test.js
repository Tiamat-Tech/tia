/**
 * Unit tests for MFR Model Store
 */
import { describe, it, expect, beforeEach } from "vitest";
import { MfrModelStore } from "../../src/lib/mfr/model-store.js";

describe("MfrModelStore", () => {
  let store;
  const testLogger = {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {}
  };

  beforeEach(() => {
    store = new MfrModelStore({ logger: testLogger });
  });

  describe("createModel", () => {
    it("should create a new problem model", async () => {
      const problemId = "test-session-1";
      const description = "Test problem";

      await store.createModel(problemId, description);

      const model = store.getModel(problemId);
      expect(model).toBeDefined();
      expect(model.problemDescription).toBe(description);
      expect(model.contributions).toEqual([]);
    });

    it("should throw error for duplicate problemId", async () => {
      const problemId = "test-session-1";

      await store.createModel(problemId, "First");

      await expect(
        store.createModel(problemId, "Second")
      ).rejects.toThrow("already exists");
    });

    it("should initialize empty RDF dataset", async () => {
      const problemId = "test-session-1";

      await store.createModel(problemId, "Test");

      const model = store.getModel(problemId);
      expect(model.rdfDataset).toBeDefined();
      expect(model.rdfDataset.size).toBe(0);
    });
  });

  describe("addContribution", () => {
    const problemId = "test-session-1";
    const agentId = "TestAgent";
    const contributionRdf = `
      @prefix mfr: <http://purl.org/stuff/mfr/> .
      @prefix schema: <http://schema.org/> .

      <#entity1> a mfr:Entity ;
        schema:name "Alice" ;
        mfr:contributedBy "${agentId}" .
    `;

    beforeEach(async () => {
      await store.createModel(problemId, "Test problem");
    });

    it("should add contribution to model", async () => {
      await store.addContribution(problemId, agentId, contributionRdf);

      const model = store.getModel(problemId);
      expect(model.contributions.length).toBe(1);
      expect(model.contributions[0].agentId).toBe(agentId);
    });

    it("should merge contribution RDF into model", async () => {
      await store.addContribution(problemId, agentId, contributionRdf);

      const model = store.getModel(problemId);
      expect(model.rdfDataset.size).toBeGreaterThan(0);
    });

    it("should track contribution metadata", async () => {
      const metadata = { type: "EntityDiscovery", count: 1 };

      await store.addContribution(problemId, agentId, contributionRdf, metadata);

      const model = store.getModel(problemId);
      const contribution = model.contributions[0];

      expect(contribution.metadata).toEqual(metadata);
      expect(contribution.timestamp).toBeDefined();
    });

    it("should handle multiple contributions from different agents", async () => {
      const rdf1 = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
      `;

      const rdf2 = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#action1> a mfr:Action .
      `;

      await store.addContribution(problemId, "Agent1", rdf1);
      await store.addContribution(problemId, "Agent2", rdf2);

      const model = store.getModel(problemId);
      expect(model.contributions.length).toBe(2);
      expect(model.rdfDataset.size).toBeGreaterThan(0);
    });

    it("should throw error for non-existent problemId", async () => {
      await expect(
        store.addContribution("nonexistent", agentId, contributionRdf)
      ).rejects.toThrow("not found");
    });
  });

  describe("getModel", () => {
    it("should return model for valid problemId", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      const model = store.getModel(problemId);

      expect(model).toBeDefined();
      expect(model.problemId).toBe(problemId);
    });

    it("should return null for non-existent problemId", () => {
      const model = store.getModel("nonexistent");

      expect(model).toBeNull();
    });
  });

  describe("getAllModels", () => {
    it("should return all models", async () => {
      await store.createModel("session-1", "Problem 1");
      await store.createModel("session-2", "Problem 2");
      await store.createModel("session-3", "Problem 3");

      const models = store.getAllModels();

      expect(models.length).toBe(3);
      expect(models.map(m => m.problemId)).toContain("session-1");
      expect(models.map(m => m.problemId)).toContain("session-2");
      expect(models.map(m => m.problemId)).toContain("session-3");
    });

    it("should return empty array when no models", () => {
      const models = store.getAllModels();

      expect(models).toEqual([]);
    });
  });

  describe("getModelAsRdf", () => {
    it("should serialize model to Turtle RDF", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      const rdf = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
      `;

      await store.addContribution(problemId, "TestAgent", rdf);

      const turtle = await store.getModelAsRdf(problemId);

      expect(turtle).toBeDefined();
      expect(typeof turtle).toBe("string");
      expect(turtle.length).toBeGreaterThan(0);
    });

    it("should return empty string for non-existent model", async () => {
      const turtle = await store.getModelAsRdf("nonexistent");

      expect(turtle).toBe("");
    });
  });

  describe("deleteModel", () => {
    it("should delete model by problemId", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      store.deleteModel(problemId);

      const model = store.getModel(problemId);
      expect(model).toBeNull();
    });

    it("should not throw error for non-existent problemId", () => {
      expect(() => {
        store.deleteModel("nonexistent");
      }).not.toThrow();
    });
  });

  describe("getContributions", () => {
    it("should return contributions for problemId", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      const rdf = `@prefix mfr: <http://purl.org/stuff/mfr/> . <#e1> a mfr:Entity .`;
      await store.addContribution(problemId, "Agent1", rdf);
      await store.addContribution(problemId, "Agent2", rdf);

      const contributions = store.getContributions(problemId);

      expect(contributions.length).toBe(2);
      expect(contributions[0].agentId).toBe("Agent1");
      expect(contributions[1].agentId).toBe("Agent2");
    });

    it("should return empty array for non-existent problemId", () => {
      const contributions = store.getContributions("nonexistent");

      expect(contributions).toEqual([]);
    });
  });

  describe("getSessionStatistics", () => {
    it("should return statistics for session", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      const rdf = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
        <#action1> a mfr:Action .
        <#constraint1> a mfr:Constraint .
      `;

      await store.addContribution(problemId, "Agent1", rdf);
      await store.addContribution(problemId, "Agent2", rdf);

      const stats = store.getSessionStatistics(problemId);

      expect(stats).toBeDefined();
      expect(stats.contributions).toBe(2);
      expect(stats.contributors).toContain("Agent1");
      expect(stats.contributors).toContain("Agent2");
      expect(stats.entities).toBeGreaterThan(0);
      expect(stats.actions).toBeGreaterThan(0);
      expect(stats.constraints).toBeGreaterThan(0);
    });

    it("should return null for non-existent session", () => {
      const stats = store.getSessionStatistics("nonexistent");

      expect(stats).toBeNull();
    });
  });

  describe("getContributorList", () => {
    it("should return unique list of contributors", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      const rdf = `@prefix mfr: <http://purl.org/stuff/mfr/> . <#e1> a mfr:Entity .`;

      await store.addContribution(problemId, "Agent1", rdf);
      await store.addContribution(problemId, "Agent2", rdf);
      await store.addContribution(problemId, "Agent1", rdf); // duplicate

      const contributors = store.getContributorList(problemId);

      expect(contributors.length).toBe(2);
      expect(contributors).toContain("Agent1");
      expect(contributors).toContain("Agent2");
    });

    it("should return empty array for non-existent session", () => {
      const contributors = store.getContributorList("nonexistent");

      expect(contributors).toEqual([]);
    });
  });

  describe("hasModel", () => {
    it("should return true for existing model", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      expect(store.hasModel(problemId)).toBe(true);
    });

    it("should return false for non-existent model", () => {
      expect(store.hasModel("nonexistent")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty RDF contributions", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      await store.addContribution(problemId, "Agent1", "");

      const model = store.getModel(problemId);
      expect(model.contributions.length).toBe(1);
      expect(model.rdfDataset.size).toBe(0);
    });

    it("should handle malformed RDF gracefully", async () => {
      const problemId = "test-session-1";
      await store.createModel(problemId, "Test");

      const invalidRdf = "this is not valid RDF @#$%";

      await expect(
        store.addContribution(problemId, "Agent1", invalidRdf)
      ).rejects.toThrow();
    });

    it("should handle very long problem descriptions", async () => {
      const longDescription = "x".repeat(10000);
      const problemId = "test-session-1";

      await store.createModel(problemId, longDescription);

      const model = store.getModel(problemId);
      expect(model.problemDescription).toBe(longDescription);
    });
  });
});
