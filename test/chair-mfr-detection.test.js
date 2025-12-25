import { describe, it, expect } from "vitest";
import { ChairProvider } from "../src/agents/providers/chair-provider.js";

describe("Chair MFR debate detection", () => {
  it("should detect Coordinator's MFR debate issue", async () => {
    const chair = new ChairProvider({
      nickname: "TestChair",
      logger: { debug: () => {}, info: () => {} }
    });

    // Exact message that Coordinator sends
    const coordinatorMessage = `Issue: Which tools and agents should we use to solve this problem?

Problem: Schedule appointments for patients.

Available agents:
  - Mistral: Natural language processing, entity extraction
  - Data: Wikidata/DBpedia knowledge grounding
  - Prolog: Logical reasoning, constraint satisfaction
  - MFR-Semantic: Constraint extraction from domain knowledge

Please contribute:
  Position: I recommend [agent] because...
  Support: [agent] would help because...
  Objection: [agent] may not work because...
`;

    const response = await chair.handle({
      content: coordinatorMessage,
      rawMessage: coordinatorMessage,
      metadata: { sender: "Coordinator" }
    });

    expect(response).toContain("Debate started");
    expect(response).toContain("Issue:");
    expect(response).not.toContain("Please contribute Position:");
  });

  it("should detect MFR pattern with 'which tools'", async () => {
    const chair = new ChairProvider({
      nickname: "TestChair",
      logger: { debug: () => {}, info: () => {} }
    });

    const response = await chair.handle({
      content: "Issue: Which tools and agents should we use?",
      rawMessage: "",
      metadata: { sender: "User" }
    });

    expect(response).toContain("Debate started");
  });

  it("should detect MFR pattern with 'available agents'", async () => {
    const chair = new ChairProvider({
      nickname: "TestChair",
      logger: { debug: () => {}, info: () => {} }
    });

    const response = await chair.handle({
      content: "Available agents:\n- Mistral\n- Data",
      rawMessage: "",
      metadata: { sender: "User" }
    });

    expect(response).toContain("Debate started");
  });

  it("should detect MFR pattern with 'issue:' and 'tool'", async () => {
    const chair = new ChairProvider({
      nickname: "TestChair",
      logger: { debug: () => {}, info: () => {} }
    });

    const response = await chair.handle({
      content: "Issue: What tools should we use?",
      rawMessage: "",
      metadata: { sender: "User" }
    });

    expect(response).toContain("Debate started");
  });

  it("should ignore debate commands (those are for Coordinator)", async () => {
    const chair = new ChairProvider({
      nickname: "TestChair",
      logger: { debug: () => {}, info: () => {} }
    });

    const response = await chair.handle({
      content: "debate Schedule appointments for patients",
      rawMessage: "",
      metadata: { sender: "User" }
    });

    // Should return null (don't respond to coordinator commands)
    expect(response).toBeNull();
  });

  it("should ignore other MFR commands", async () => {
    const chair = new ChairProvider({
      nickname: "TestChair",
      logger: { debug: () => {}, info: () => {} }
    });

    const commands = ["mfr-start Test", "mfr-status abc-123", "mfr-solve abc-123"];

    for (const cmd of commands) {
      const response = await chair.handle({
        content: cmd,
        rawMessage: "",
        metadata: { sender: "User" }
      });
      expect(response).toBeNull();
    }
  });
});
