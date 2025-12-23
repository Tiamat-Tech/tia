/**
 * Unit tests for RDF utilities
 */
import { describe, it, expect } from "vitest";
import { RdfUtils } from "../../src/lib/mfr/rdf-utils.js";

describe("RdfUtils", () => {
  describe("parseTurtle", () => {
    it("should parse valid Turtle RDF", async () => {
      const turtle = `
        @prefix schema: <http://schema.org/> .
        @prefix mfr: <http://purl.org/stuff/mfr/> .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      expect(dataset).toBeDefined();
      expect(dataset.size).toBeGreaterThan(0);
    });

    it("should throw error on invalid Turtle", async () => {
      const invalidTurtle = "this is not valid turtle @#$%";

      await expect(RdfUtils.parseTurtle(invalidTurtle)).rejects.toThrow();
    });

    it("should handle empty Turtle", async () => {
      const emptyTurtle = "";

      const dataset = await RdfUtils.parseTurtle(emptyTurtle);
      expect(dataset).toBeDefined();
      expect(dataset.size).toBe(0);
    });
  });

  describe("serializeTurtle", () => {
    it("should serialize dataset to Turtle", async () => {
      const turtle = `
        @prefix schema: <http://schema.org/> .
        <#test> schema:name "Test" .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const serialized = await RdfUtils.serializeTurtle(dataset);

      expect(serialized).toBeDefined();
      expect(typeof serialized).toBe("string");
      expect(serialized.length).toBeGreaterThan(0);
    });

    it("should handle empty dataset", async () => {
      const emptyDataset = await RdfUtils.parseTurtle("");
      const serialized = await RdfUtils.serializeTurtle(emptyDataset);

      expect(serialized).toBeDefined();
      expect(typeof serialized).toBe("string");
    });
  });

  describe("mergeDatasets", () => {
    it("should merge multiple datasets", async () => {
      const turtle1 = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
      `;

      const turtle2 = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity2> a mfr:Entity .
      `;

      const dataset1 = await RdfUtils.parseTurtle(turtle1);
      const dataset2 = await RdfUtils.parseTurtle(turtle2);

      const merged = await RdfUtils.mergeDatasets([dataset1, dataset2]);

      expect(merged).toBeDefined();
      expect(merged.size).toBe(dataset1.size + dataset2.size);
    });

    it("should handle empty array of datasets", async () => {
      const merged = await RdfUtils.mergeDatasets([]);

      expect(merged).toBeDefined();
      expect(merged.size).toBe(0);
    });

    it("should deduplicate identical triples", async () => {
      const turtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
      `;

      const dataset1 = await RdfUtils.parseTurtle(turtle);
      const dataset2 = await RdfUtils.parseTurtle(turtle);

      const merged = await RdfUtils.mergeDatasets([dataset1, dataset2]);

      // Should have same size as one dataset (deduplication)
      expect(merged.size).toBe(dataset1.size);
    });
  });

  describe("queryTriples", () => {
    it("should query triples by subject", async () => {
      const turtle = `
        @prefix schema: <http://schema.org/> .
        @prefix mfr: <http://purl.org/stuff/mfr/> .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" .

        <#entity2> a mfr:Entity ;
          schema:name "Bob" .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const results = RdfUtils.queryTriples(dataset, {
        subject: "#entity1"
      });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it("should query triples by predicate", async () => {
      const turtle = `
        @prefix schema: <http://schema.org/> .
        <#entity1> schema:name "Alice" .
        <#entity2> schema:name "Bob" .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const results = RdfUtils.queryTriples(dataset, {
        predicate: "http://schema.org/name"
      });

      expect(results.length).toBe(2);
    });

    it("should return empty array when no matches", async () => {
      const turtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const results = RdfUtils.queryTriples(dataset, {
        subject: "#nonexistent"
      });

      expect(results).toEqual([]);
    });
  });

  describe("extractEntities", () => {
    it("should extract entities from model", async () => {
      const turtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" .

        <#entity2> a mfr:Entity ;
          schema:name "Bob" .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const entities = RdfUtils.extractEntities(dataset);

      expect(entities).toBeDefined();
      expect(entities.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty array when no entities", async () => {
      const turtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#something> a mfr:Action .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const entities = RdfUtils.extractEntities(dataset);

      expect(entities).toBeDefined();
      expect(entities.length).toBe(0);
    });
  });

  describe("validateBasicStructure", () => {
    it("should validate well-formed RDF", async () => {
      const turtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#entity1> a mfr:Entity .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const isValid = RdfUtils.validateBasicStructure(dataset);

      expect(isValid).toBe(true);
    });

    it("should handle empty dataset", async () => {
      const dataset = await RdfUtils.parseTurtle("");
      const isValid = RdfUtils.validateBasicStructure(dataset);

      expect(isValid).toBe(true); // Empty is technically valid
    });
  });

  describe("countByType", () => {
    it("should count entities by type", async () => {
      const turtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .

        <#entity1> a mfr:Entity .
        <#entity2> a mfr:Entity .
        <#action1> a mfr:Action .
        <#constraint1> a mfr:Constraint .
      `;

      const dataset = await RdfUtils.parseTurtle(turtle);
      const counts = RdfUtils.countByType(dataset);

      expect(counts).toBeDefined();
      expect(counts["http://purl.org/stuff/mfr/Entity"]).toBe(2);
      expect(counts["http://purl.org/stuff/mfr/Action"]).toBe(1);
      expect(counts["http://purl.org/stuff/mfr/Constraint"]).toBe(1);
    });

    it("should return empty object for empty dataset", async () => {
      const dataset = await RdfUtils.parseTurtle("");
      const counts = RdfUtils.countByType(dataset);

      expect(counts).toBeDefined();
      expect(Object.keys(counts).length).toBe(0);
    });
  });

  describe("round-trip serialization", () => {
    it("should preserve data through parse-serialize cycle", async () => {
      const original = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" ;
          mfr:contributedBy "TestAgent" .
      `;

      const dataset = await RdfUtils.parseTurtle(original);
      const serialized = await RdfUtils.serializeTurtle(dataset);
      const reparsed = await RdfUtils.parseTurtle(serialized);

      expect(reparsed.size).toBe(dataset.size);
    });
  });
});
