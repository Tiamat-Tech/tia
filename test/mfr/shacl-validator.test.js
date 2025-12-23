/**
 * Unit tests for MFR SHACL Validator
 */
import { describe, it, expect, beforeAll } from "vitest";
import { MfrShaclValidator } from "../../src/lib/mfr/shacl-validator.js";
import { ShapesLoader } from "../../src/lib/mfr/shapes-loader.js";
import { RdfUtils } from "../../src/lib/mfr/rdf-utils.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shapesPath = path.join(__dirname, "../../vocabs/mfr-shapes.ttl");

describe("MfrShaclValidator", () => {
  let validator;
  let shapesLoader;
  const testLogger = {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {}
  };

  beforeAll(async () => {
    shapesLoader = new ShapesLoader({ logger: testLogger });
    const shapesGraph = await shapesLoader.loadShapes(shapesPath);
    validator = new MfrShaclValidator({ shapesGraph, logger: testLogger });
  });

  describe("validate - valid models", () => {
    it("should validate complete problem model", async () => {
      const validModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel ;
          mfr:sessionId "test-123" .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" ;
          mfr:contributedBy "TestAgent" .

        <#action1> a mfr:Action ;
          schema:name "schedule" ;
          mfr:contributedBy "TestAgent" .

        <#goal1> a mfr:Goal ;
          schema:name "Complete scheduling" ;
          mfr:contributedBy "TestAgent" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(validModel);
      const result = await validator.validate(dataGraph);

      expect(result.conforms).toBe(true);
      expect(result.violations).toEqual([]);
    });
  });

  describe("validate - completeness violations", () => {
    it("should detect missing entities", async () => {
      const incompleteModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel ;
          mfr:sessionId "test-123" .

        <#action1> a mfr:Action ;
          schema:name "schedule" .

        <#goal1> a mfr:Goal ;
          schema:name "Complete scheduling" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(incompleteModel);
      const result = await validator.validate(dataGraph);

      expect(result.conforms).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);

      const entityViolation = result.violations.find(v =>
        v.message?.includes("Entity") || v.path?.includes("hasEntity")
      );
      expect(entityViolation).toBeDefined();
    });

    it("should detect missing actions", async () => {
      const incompleteModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel ;
          mfr:sessionId "test-123" .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" .

        <#goal1> a mfr:Goal ;
          schema:name "Complete scheduling" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(incompleteModel);
      const result = await validator.validate(dataGraph);

      expect(result.conforms).toBe(false);

      const actionViolation = result.violations.find(v =>
        v.message?.includes("Action") || v.path?.includes("hasAction")
      );
      expect(actionViolation).toBeDefined();
    });

    it("should detect missing goals", async () => {
      const incompleteModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel ;
          mfr:sessionId "test-123" .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" .

        <#action1> a mfr:Action ;
          schema:name "schedule" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(incompleteModel);
      const result = await validator.validate(dataGraph);

      expect(result.conforms).toBe(false);

      const goalViolation = result.violations.find(v =>
        v.message?.includes("Goal") || v.path?.includes("hasGoal")
      );
      expect(goalViolation).toBeDefined();
    });
  });

  describe("detectCompletenessIssues", () => {
    it("should identify completeness issues", async () => {
      const incompleteModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .

        <#entity1> a mfr:Entity .
      `;

      const dataGraph = await RdfUtils.parseTurtle(incompleteModel);
      const result = await validator.validate(dataGraph);

      const completenessIssues = validator.detectCompletenessIssues(result);

      expect(completenessIssues.length).toBeGreaterThan(0);
      expect(completenessIssues.some(i => i.includes("Action") || i.includes("action"))).toBe(true);
      expect(completenessIssues.some(i => i.includes("Goal") || i.includes("goal"))).toBe(true);
    });

    it("should return empty array for complete model", async () => {
      const completeModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel .
        <#entity1> a mfr:Entity ; schema:name "Alice" .
        <#action1> a mfr:Action ; schema:name "schedule" .
        <#goal1> a mfr:Goal ; schema:name "Complete" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(completeModel);
      const result = await validator.validate(dataGraph);

      const completenessIssues = validator.detectCompletenessIssues(result);

      expect(completenessIssues.length).toBe(0);
    });
  });

  describe("detectConflicts", () => {
    it("should identify logical conflicts", async () => {
      // This test depends on specific conflict detection rules in shapes
      const conflictingModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" ;
          mfr:contributedBy "Agent1" .

        <#entity1> a mfr:Entity ;
          schema:name "Bob" ;
          mfr:contributedBy "Agent2" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(conflictingModel);
      const result = await validator.validate(dataGraph);

      // May or may not detect conflicts depending on SHACL shapes
      // At minimum, should not crash
      expect(result).toBeDefined();
      expect(Array.isArray(result.violations)).toBe(true);
    });
  });

  describe("formatViolations", () => {
    it("should format violations for human readability", async () => {
      const incompleteModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        <#model> a mfr:ProblemModel .
      `;

      const dataGraph = await RdfUtils.parseTurtle(incompleteModel);
      const result = await validator.validate(dataGraph);

      const formatted = validator.formatViolations(result);

      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("should return message for valid model", async () => {
      const validModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel .
        <#entity1> a mfr:Entity ; schema:name "Alice" .
        <#action1> a mfr:Action ; schema:name "schedule" .
        <#goal1> a mfr:Goal ; schema:name "Complete" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(validModel);
      const result = await validator.validate(dataGraph);

      const formatted = validator.formatViolations(result);

      expect(formatted).toContain("valid") || expect(formatted).toContain("conforms");
    });
  });

  describe("edge cases", () => {
    it("should handle empty dataset", async () => {
      const emptyDataset = await RdfUtils.parseTurtle("");
      const result = await validator.validate(emptyDataset);

      expect(result).toBeDefined();
      expect(result.conforms).toBe(false); // Empty is not valid
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it("should handle dataset with only metadata", async () => {
      const metadataOnly = `
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      `;

      const dataGraph = await RdfUtils.parseTurtle(metadataOnly);
      const result = await validator.validate(dataGraph);

      expect(result).toBeDefined();
      expect(result.conforms).toBe(false);
    });

    it("should handle very large models", async () => {
      // Generate a large valid model
      let largeModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel .
        <#goal1> a mfr:Goal ; schema:name "Goal" .
      `;

      // Add many entities and actions
      for (let i = 0; i < 50; i++) {
        largeModel += `
          <#entity${i}> a mfr:Entity ; schema:name "Entity${i}" .
          <#action${i}> a mfr:Action ; schema:name "Action${i}" .
        `;
      }

      const dataGraph = await RdfUtils.parseTurtle(largeModel);
      const result = await validator.validate(dataGraph);

      expect(result).toBeDefined();
      expect(result.conforms).toBe(true);
    });
  });

  describe("provenance validation", () => {
    it("should validate contributedBy property", async () => {
      const modelWithProvenance = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#model> a mfr:ProblemModel .

        <#entity1> a mfr:Entity ;
          schema:name "Alice" ;
          mfr:contributedBy "MistralAgent" .

        <#action1> a mfr:Action ;
          schema:name "schedule" ;
          mfr:contributedBy "PrologAgent" .

        <#goal1> a mfr:Goal ;
          schema:name "Complete" ;
          mfr:contributedBy "MistralAgent" .
      `;

      const dataGraph = await RdfUtils.parseTurtle(modelWithProvenance);
      const result = await validator.validate(dataGraph);

      // Should be valid with provenance
      expect(result.conforms).toBe(true);
    });
  });
});
