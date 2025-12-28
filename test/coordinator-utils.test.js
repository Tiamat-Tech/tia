import { describe, it, expect } from "vitest";
import {
  isProcessStatusMessage,
  deriveSyllogismAnswer,
  parseConsensusEntries,
  shouldTreatAsConsensusEntry,
  shouldIgnoreConsensusEntry,
  parsePlanningRoute,
  tallyPlanningVotes
} from "../src/agents/providers/coordinator/utils.js";

describe("coordinator utils", () => {
  it("detects process status messages", () => {
    expect(isProcessStatusMessage("Planning poll started: abc")).toBe(true);
    expect(isProcessStatusMessage("Session complete xyz")).toBe(true);
    expect(isProcessStatusMessage("Random chatter")).toBe(false);
  });

  it("derives syllogism answer for supported pattern", () => {
    const question = "Q: If all cats are mammals and no mammals are reptiles, can any cats be reptiles?";
    expect(deriveSyllogismAnswer(question)).toBe(
      "No. If all cats are mammals and no mammals are reptiles, then no cats are reptiles."
    );
  });

  it("parses consensus entries from lines and inline markers", () => {
    const lines = "Position: Use logic\nSupport: It is deterministic";
    expect(parseConsensusEntries(lines)).toEqual([
      { type: "position", text: "Use logic" },
      { type: "support", text: "It is deterministic" }
    ]);

    const inline = "We should proceed. Position: route=logic and Support: speed.";
    expect(parseConsensusEntries(inline)).toEqual([
      { type: "position", text: "route=logic and Support: speed." },
      { type: "support", text: "speed." }
    ]);
  });

  it("filters consensus entries by sender and content", () => {
    expect(shouldTreatAsConsensusEntry("Chair", "Position: x")).toBe(false);
    expect(shouldTreatAsConsensusEntry("User", "Position: x")).toBe(true);
    expect(shouldIgnoreConsensusEntry({ sender: "Demo", text: "hello" })).toBe(true);
    expect(shouldIgnoreConsensusEntry({ sender: "Semem", text: "Position: ok" })).toBe(false);
  });

  it("parses planning routes and tallies votes", () => {
    expect(parsePlanningRoute("Position: route=consensus")).toBe("consensus");
    expect(parsePlanningRoute("I think logic is best")).toBe("logic");

    const votes = new Map([
      ["a", "logic"],
      ["b", "consensus"],
      ["c", "logic"]
    ]);
    const tally = tallyPlanningVotes(votes);
    expect(tally.total).toBe(3);
    expect(tally.sorted[0]).toEqual({ route: "logic", count: 2 });
  });
});
