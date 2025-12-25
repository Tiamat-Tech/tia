import { describe, it, expect, beforeEach } from "vitest";
import { detectIBISStructure, summarizeIBIS } from "../src/lib/ibis-detect.js";
import { structureToDataset, datasetToStructure, datasetToTurtle } from "../src/lib/ibis-rdf.js";
import { ChairProvider } from "../src/agents/providers/chair-provider.js";

describe("Legacy IBIS Detection", () => {
  describe("Idea detection", () => {
    it("detects ideas with full marker", () => {
      const text = "Idea: Use a microservices architecture";
      const structure = detectIBISStructure(text);

      expect(structure.ideas).toBeDefined();
      expect(structure.ideas.length).toBe(1);
      expect(structure.ideas[0].label).toBe("use a microservices architecture");
      expect(structure.ideas[0].id).toMatch(/^idea-\d+$/);
    });

    it("detects ideas with abbreviated marker", () => {
      const text = "Id: Implement caching layer";
      const structure = detectIBISStructure(text);

      expect(structure.ideas.length).toBe(1);
      expect(structure.ideas[0].label).toBe("implement caching layer");
    });

    it("detects multiple ideas", () => {
      const text = `Idea: Use Redis for caching. Id: Add rate limiting.`;
      const structure = detectIBISStructure(text);

      expect(structure.ideas.length).toBe(2);
      expect(structure.ideas[0].label).toContain("redis");
      expect(structure.ideas[1].label).toContain("rate limiting");
    });
  });

  describe("Question detection", () => {
    it("detects questions with full marker", () => {
      const text = "Question: Should we use SQL or NoSQL?";
      const structure = detectIBISStructure(text);

      expect(structure.questions).toBeDefined();
      expect(structure.questions.length).toBe(1);
      expect(structure.questions[0].label).toBe("should we use sql or nosql");
      expect(structure.questions[0].id).toMatch(/^question-\d+$/);
    });

    it("detects questions with abbreviated marker", () => {
      const text = "Q: What database should we use?";
      const structure = detectIBISStructure(text);

      expect(structure.questions.length).toBe(1);
      expect(structure.questions[0].label).toBe("what database should we use");
    });

    it("detects multiple questions", () => {
      const text = `Question: How should we handle errors? Q: What about authentication?`;
      const structure = detectIBISStructure(text);

      expect(structure.questions.length).toBe(2);
    });
  });

  describe("Decision detection", () => {
    it("detects decisions with full marker", () => {
      const text = "Decision: We will use PostgreSQL";
      const structure = detectIBISStructure(text);

      expect(structure.decisions).toBeDefined();
      expect(structure.decisions.length).toBe(1);
      expect(structure.decisions[0].label).toBe("we will use postgresql");
      expect(structure.decisions[0].id).toMatch(/^decision-\d+$/);
    });

    it("detects decisions with abbreviated marker", () => {
      const text = "D: Adopt TypeScript for the project";
      const structure = detectIBISStructure(text);

      expect(structure.decisions.length).toBe(1);
      expect(structure.decisions[0].label).toBe("adopt typescript for the project");
    });
  });

  describe("Reference detection", () => {
    it("detects references with full marker", () => {
      const text = "Reference: See RFC 7231 for HTTP semantics";
      const structure = detectIBISStructure(text);

      expect(structure.references).toBeDefined();
      expect(structure.references.length).toBe(1);
      expect(structure.references[0].label).toBe("see rfc 7231 for http semantics");
      expect(structure.references[0].id).toMatch(/^reference-\d+$/);
    });

    it("detects references with abbreviated marker", () => {
      const text = "Ref: See documentation at example.com";
      const structure = detectIBISStructure(text);

      expect(structure.references.length).toBe(1);
      expect(structure.references[0].label).toBe("see documentation at example");
    });
  });

  describe("Note detection", () => {
    it("detects notes with full marker", () => {
      const text = "Note: This needs further investigation";
      const structure = detectIBISStructure(text);

      expect(structure.notes).toBeDefined();
      expect(structure.notes.length).toBe(1);
      expect(structure.notes[0].label).toBe("this needs further investigation");
      expect(structure.notes[0].id).toMatch(/^note-\d+$/);
    });

    it("detects notes with abbreviated marker", () => {
      const text = "N: Remember to update documentation";
      const structure = detectIBISStructure(text);

      expect(structure.notes.length).toBe(1);
      expect(structure.notes[0].label).toBe("remember to update documentation");
    });
  });

  describe("Confidence scoring", () => {
    it("increases confidence with legacy constructs", () => {
      const textWithLegacy = `Question: What should we do? Idea: Try approach A. Decision: We'll use approach B.`;

      const structure = detectIBISStructure(textWithLegacy);
      expect(structure.confidence).toBeGreaterThan(0.5);
    });

    it("combines legacy and standard IBIS elements", () => {
      const text = `Issue: How to optimize performance? Position: Use caching. Idea: Add CDN support. Question: What about database indexing?`;

      const structure = detectIBISStructure(text);
      expect(structure.issues.length).toBe(1);
      expect(structure.positions.length).toBe(1);
      expect(structure.ideas.length).toBe(1);
      expect(structure.questions.length).toBe(1);
      expect(structure.confidence).toBeGreaterThan(0.7);
    });
  });

  describe("IBIS summarization", () => {
    it("includes legacy constructs in summary", () => {
      const structure = {
        issues: [{ id: "issue-1", label: "Test issue" }],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [{ id: "question-1", label: "Test question" }],
        decisions: [{ id: "decision-1", label: "Test decision" }],
        references: [{ id: "reference-1", label: "Test reference" }],
        notes: [{ id: "note-1", label: "Test note" }],
        confidence: 0.8
      };

      const summary = summarizeIBIS(structure);

      expect(summary).toContain("Idea: Test idea");
      expect(summary).toContain("Question: Test question");
      expect(summary).toContain("Decision: Test decision");
      expect(summary).toContain("Reference: Test reference");
      expect(summary).toContain("Note: Test note");
    });

    it("omits empty legacy construct sections", () => {
      const structure = {
        issues: [{ id: "issue-1", label: "Test issue" }],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [],
        decisions: [],
        references: [],
        notes: [],
        confidence: 0.6
      };

      const summary = summarizeIBIS(structure);

      expect(summary).toContain("Idea: Test idea");
      expect(summary).not.toContain("Question:");
      expect(summary).not.toContain("Decision:");
    });
  });
});

describe("Legacy IBIS RDF Serialization", () => {
  describe("structureToDataset", () => {
    it("serializes ideas to RDF with legacy namespace", async () => {
      const structure = {
        issues: [],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [],
        decisions: [],
        references: [],
        notes: []
      };

      const dataset = structureToDataset(structure);
      const turtle = await datasetToTurtle(dataset);

      expect(turtle).toContain("ibisLegacy:Idea");
      expect(turtle).toContain("Test idea");
      expect(turtle).toContain("#idea-1");
    });

    it("serializes all legacy construct types", async () => {
      const structure = {
        issues: [],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [{ id: "question-1", label: "Test question" }],
        decisions: [{ id: "decision-1", label: "Test decision" }],
        references: [{ id: "reference-1", label: "Test reference" }],
        notes: [{ id: "note-1", label: "Test note" }]
      };

      const dataset = structureToDataset(structure);
      const turtle = await datasetToTurtle(dataset);

      expect(turtle).toContain("ibisLegacy:Idea");
      expect(turtle).toContain("ibisLegacy:Question");
      expect(turtle).toContain("ibisLegacy:Decision");
      expect(turtle).toContain("ibisLegacy:Reference");
      expect(turtle).toContain("ibisLegacy:Note");
    });

    it("combines standard and legacy IBIS in RDF", async () => {
      const structure = {
        issues: [{ id: "issue-1", label: "Test issue" }],
        positions: [{ id: "pos-1", label: "Test position" }],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [],
        decisions: [],
        references: [],
        notes: []
      };

      const dataset = structureToDataset(structure);
      const turtle = await datasetToTurtle(dataset);

      expect(turtle).toContain("ibis:Issue");
      expect(turtle).toContain("ibis:Position");
      expect(turtle).toContain("ibisLegacy:Idea");
    });
  });

  describe("datasetToStructure", () => {
    it("deserializes legacy constructs from RDF", async () => {
      const structure = {
        issues: [],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [{ id: "question-1", label: "Test question" }],
        decisions: [{ id: "decision-1", label: "Test decision" }],
        references: [{ id: "reference-1", label: "Test reference" }],
        notes: [{ id: "note-1", label: "Test note" }]
      };

      const dataset = structureToDataset(structure);
      const deserialized = datasetToStructure(dataset);

      expect(deserialized.ideas.length).toBe(1);
      expect(deserialized.ideas[0].label).toBe("Test idea");
      expect(deserialized.questions.length).toBe(1);
      expect(deserialized.questions[0].label).toBe("Test question");
      expect(deserialized.decisions.length).toBe(1);
      expect(deserialized.decisions[0].label).toBe("Test decision");
      expect(deserialized.references.length).toBe(1);
      expect(deserialized.references[0].label).toBe("Test reference");
      expect(deserialized.notes.length).toBe(1);
      expect(deserialized.notes[0].label).toBe("Test note");
    });

    it("includes legacy constructs in confidence calculation", () => {
      const structure = {
        issues: [],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Test idea" }],
        questions: [{ id: "question-1", label: "Test question" }],
        decisions: [],
        references: [],
        notes: []
      };

      const dataset = structureToDataset(structure);
      const deserialized = datasetToStructure(dataset);

      expect(deserialized.confidence).toBe(0.7);
    });

    it("round-trips legacy constructs through RDF", async () => {
      const original = {
        issues: [{ id: "issue-1", label: "Original issue" }],
        positions: [],
        arguments: [],
        ideas: [{ id: "idea-1", label: "Original idea" }],
        questions: [{ id: "question-1", label: "Original question?" }],
        decisions: [{ id: "decision-1", label: "Original decision" }],
        references: [{ id: "reference-1", label: "See external source" }],
        notes: [{ id: "note-1", label: "Original note" }]
      };

      const dataset = structureToDataset(original);
      const roundtripped = datasetToStructure(dataset);

      expect(roundtripped.ideas[0].label).toBe("Original idea");
      expect(roundtripped.questions[0].label).toBe("Original question?");
      expect(roundtripped.decisions[0].label).toBe("Original decision");
      expect(roundtripped.references[0].label).toBe("See external source");
      expect(roundtripped.notes[0].label).toBe("Original note");
    });
  });
});

describe("ChairProvider with Legacy IBIS", () => {
  let chair;

  beforeEach(() => {
    chair = new ChairProvider({ nickname: "test-chair" });
  });

  describe("State tracking", () => {
    it("tracks ideas", async () => {
      const result = await chair.handle({
        content: "Idea: Use microservices",
        metadata: { sender: "alice" }
      });

      expect(chair.ideas.length).toBe(1);
      expect(chair.ideas[0].text).toBe("use microservices");
      expect(chair.ideas[0].sender).toBe("alice");
      expect(result).toContain("Noted");
    });

    it("tracks questions", async () => {
      const result = await chair.handle({
        content: "Question: Should we use GraphQL?",
        metadata: { sender: "bob" }
      });

      expect(chair.questions.length).toBe(1);
      expect(chair.questions[0].text).toBe("should we use graphql");
      expect(chair.questions[0].sender).toBe("bob");
    });

    it("tracks decisions", async () => {
      const result = await chair.handle({
        content: "Decision: We will use REST API",
        metadata: { sender: "charlie" }
      });

      expect(chair.decisions.length).toBe(1);
      expect(chair.decisions[0].text).toBe("we will use rest api");
    });

    it("tracks references", async () => {
      const result = await chair.handle({
        content: "Reference: See RFC 6749 for OAuth",
        metadata: { sender: "dave" }
      });

      expect(chair.references.length).toBe(1);
      expect(chair.references[0].text).toBe("see rfc 6749 for oauth");
    });

    it("tracks notes", async () => {
      const result = await chair.handle({
        content: "Note: Follow up next week",
        metadata: { sender: "eve" }
      });

      expect(chair.notes.length).toBe(1);
      expect(chair.notes[0].text).toBe("follow up next week");
    });

    it("clears legacy constructs when new issue starts", async () => {
      // First, set up an initial issue context
      await chair.handle({
        content: "Issue: Initial problem to solve",
        metadata: { sender: "alice" }
      });

      await chair.handle({
        content: "Idea: First idea for solution",
        metadata: { sender: "alice" }
      });

      expect(chair.ideas.length).toBe(1);

      // Start a new issue - this should clear previous ideas
      await chair.handle({
        content: "Issue: How should we handle the new requirements",
        metadata: { sender: "bob" }
      });

      expect(chair.ideas.length).toBe(0);
    });
  });

  describe("State summarization", () => {
    it("includes ideas in summary", async () => {
      chair.currentIssue = "Test issue";
      await chair.handle({
        content: "Idea: Use caching",
        metadata: { sender: "alice" }
      });

      const summary = chair.summarizeState();
      expect(summary).toContain("Ideas:");
      expect(summary).toContain("use caching");
    });

    it("includes all legacy constructs in summary", async () => {
      // Set issue first to avoid detection conflicts
      await chair.handle({
        content: "Issue: Architecture decision",
        metadata: { sender: "alice" }
      });

      await chair.handle({
        content: "Idea: Use microservices approach",
        metadata: { sender: "alice" }
      });
      await chair.handle({
        content: "Question: Consider monolith alternative",
        metadata: { sender: "bob" }
      });
      await chair.handle({
        content: "Decision: Start with monolith",
        metadata: { sender: "charlie" }
      });
      await chair.handle({
        content: "Reference: See Martin Fowler article",
        metadata: { sender: "dave" }
      });
      await chair.handle({
        content: "Note: Revisit in 6 months",
        metadata: { sender: "eve" }
      });

      const summary = chair.summarizeState();

      expect(summary).toContain("Ideas:");
      expect(summary).toContain("microservices");
      expect(summary).toContain("Questions:");
      expect(summary).toContain("monolith");
      expect(summary).toContain("Decisions:");
      expect(summary).toContain("start with monolith");
      expect(summary).toContain("References:");
      expect(summary).toContain("martin fowler");
      expect(summary).toContain("Notes:");
      expect(summary).toContain("revisit in 6 months");
    });

    it("omits empty legacy construct sections from summary", async () => {
      chair.currentIssue = "Test issue";
      await chair.handle({
        content: "Idea: Test idea",
        metadata: { sender: "alice" }
      });

      const summary = chair.summarizeState();

      expect(summary).toContain("Ideas:");
      expect(summary).not.toContain("Questions:");
      expect(summary).not.toContain("Decisions:");
      expect(summary).not.toContain("References:");
      expect(summary).not.toContain("Notes:");
    });
  });

  describe("Mixed IBIS elements", () => {
    it("handles standard and legacy IBIS together", async () => {
      await chair.handle({
        content: "Issue: Performance optimization needed",
        metadata: { sender: "alice" }
      });
      await chair.handle({
        content: "Position: Add caching layer",
        metadata: { sender: "bob" }
      });
      await chair.handle({
        content: "Idea: Try Redis for cache",
        metadata: { sender: "charlie" }
      });
      await chair.handle({
        content: "Question: Consider Memcached alternative",
        metadata: { sender: "dave" }
      });

      expect(chair.currentIssue.toLowerCase()).toContain("performance");
      expect(chair.positions.length).toBe(1);
      expect(chair.ideas.length).toBe(1);
      expect(chair.questions.length).toBe(1);

      const summary = chair.summarizeState();
      expect(summary.toLowerCase()).toContain("performance");
      expect(summary.toLowerCase()).toContain("caching layer");
      expect(summary.toLowerCase()).toContain("redis");
      expect(summary.toLowerCase()).toContain("memcached");
    });
  });
});
