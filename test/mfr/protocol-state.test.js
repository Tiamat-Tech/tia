/**
 * Unit tests for MFR Protocol State Machine
 */
import { describe, it, expect, beforeEach } from "vitest";
import { MfrProtocolState } from "../../src/lib/mfr/protocol-state.js";
import { MFR_PHASES } from "../../src/lib/mfr/constants.js";

describe("MfrProtocolState", () => {
  let state;
  const testLogger = {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {}
  };

  beforeEach(() => {
    state = new MfrProtocolState("test-session-1", { logger: testLogger });
  });

  describe("initialization", () => {
    it("should initialize with INITIALIZATION phase", () => {
      expect(state.phase).toBe(MFR_PHASES.INITIALIZATION);
    });

    it("should store sessionId", () => {
      expect(state.sessionId).toBe("test-session-1");
    });

    it("should initialize empty transition history", () => {
      expect(state.transitions).toEqual([]);
    });

    it("should initialize empty metadata", () => {
      expect(state.metadata).toEqual({});
    });
  });

  describe("transition", () => {
    it("should transition to valid next phase", () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);

      expect(state.phase).toBe(MFR_PHASES.PROBLEM_INTERPRETATION);
    });

    it("should record transition in history", () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);

      expect(state.transitions.length).toBe(1);
      expect(state.transitions[0].from).toBe(MFR_PHASES.INITIALIZATION);
      expect(state.transitions[0].to).toBe(MFR_PHASES.PROBLEM_INTERPRETATION);
      expect(state.transitions[0].timestamp).toBeDefined();
    });

    it("should throw error for invalid transition", () => {
      // Can't jump directly to SOLUTION_SYNTHESIS from INITIALIZATION
      expect(() => {
        state.transition(MFR_PHASES.SOLUTION_SYNTHESIS);
      }).toThrow(/Invalid transition/);
    });

    it("should attach metadata to transition", () => {
      const metadata = { reason: "test", agentCount: 3 };

      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION, metadata);

      expect(state.transitions[0].data).toEqual(metadata);
    });
  });

  describe("canTransitionTo", () => {
    it("should allow valid transitions", () => {
      expect(state.canTransitionTo(MFR_PHASES.PROBLEM_INTERPRETATION)).toBe(true);
    });

    it("should reject invalid transitions", () => {
      expect(state.canTransitionTo(MFR_PHASES.SOLUTION_SYNTHESIS)).toBe(false);
    });

    it("should allow re-entry to current phase", () => {
      expect(state.canTransitionTo(MFR_PHASES.INITIALIZATION)).toBe(true);
    });
  });

  describe("getValidNextPhases", () => {
    it("should return array of valid next phases", () => {
      const nextPhases = state.getValidNextPhases();

      expect(Array.isArray(nextPhases)).toBe(true);
      expect(nextPhases.length).toBeGreaterThan(0);
      expect(nextPhases).toContain(MFR_PHASES.PROBLEM_INTERPRETATION);
    });

    it("should update as state progresses", () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      state.transition(MFR_PHASES.ENTITY_DISCOVERY);

      const nextPhases = state.getValidNextPhases();

      expect(nextPhases).toContain(MFR_PHASES.RELATIONSHIP_DISCOVERY);
      expect(nextPhases).not.toContain(MFR_PHASES.INITIALIZATION);
    });
  });

  describe("getPhaseHistory", () => {
    it("should return chronological phase history", () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      state.transition(MFR_PHASES.ENTITY_DISCOVERY);
      state.transition(MFR_PHASES.RELATIONSHIP_DISCOVERY);

      const history = state.getPhaseHistory();

      expect(history).toEqual([
        MFR_PHASES.INITIALIZATION,
        MFR_PHASES.PROBLEM_INTERPRETATION,
        MFR_PHASES.ENTITY_DISCOVERY,
        MFR_PHASES.RELATIONSHIP_DISCOVERY
      ]);
    });

    it("should include current phase", () => {
      const history = state.getPhaseHistory();

      expect(history[history.length - 1]).toBe(state.phase);
    });
  });

  describe("getDuration", () => {
    it("should return session duration in milliseconds", async () => {
      await new Promise(resolve => setTimeout(resolve, 10));

      const duration = state.getDuration();

      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe("number");
    });
  });

  describe("getPhaseDuration", () => {
    it("should return duration for current phase", async () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      await new Promise(resolve => setTimeout(resolve, 10));

      const duration = state.getPhaseDuration(MFR_PHASES.PROBLEM_INTERPRETATION);

      expect(duration).toBeGreaterThan(0);
    });

    it("should return 0 for phase not yet entered", () => {
      const duration = state.getPhaseDuration(MFR_PHASES.SOLUTION_SYNTHESIS);

      expect(duration).toBe(0);
    });

    it("should track multiple phase durations", async () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      await new Promise(resolve => setTimeout(resolve, 5));

      state.transition(MFR_PHASES.ENTITY_DISCOVERY);
      await new Promise(resolve => setTimeout(resolve, 5));

      const duration1 = state.getPhaseDuration(MFR_PHASES.PROBLEM_INTERPRETATION);
      const duration2 = state.getPhaseDuration(MFR_PHASES.ENTITY_DISCOVERY);

      expect(duration1).toBeGreaterThan(0);
      expect(duration2).toBeGreaterThan(0);
    });
  });

  describe("complete workflow", () => {
    it("should successfully transition through full MFR protocol", () => {
      // Phase 1: Model Construction
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      state.transition(MFR_PHASES.ENTITY_DISCOVERY);
      state.transition(MFR_PHASES.RELATIONSHIP_DISCOVERY);
      state.transition(MFR_PHASES.ACTION_DEFINITION);
      state.transition(MFR_PHASES.CONSTRAINT_IDENTIFICATION);
      state.transition(MFR_PHASES.GOAL_SPECIFICATION);
      state.transition(MFR_PHASES.MODEL_CONSOLIDATION);

      // Phase 2: Validation
      state.transition(MFR_PHASES.MODEL_VALIDATION);

      // If validation passes, move to reasoning
      state.transition(MFR_PHASES.CONSTRAINED_REASONING);
      state.transition(MFR_PHASES.SOLUTION_GENERATION);
      state.transition(MFR_PHASES.SOLUTION_VALIDATION);
      state.transition(MFR_PHASES.SOLUTION_RANKING);
      state.transition(MFR_PHASES.SOLUTION_SYNTHESIS);

      // Final phase
      state.transition(MFR_PHASES.SOLUTION_DELIVERY);

      expect(state.phase).toBe(MFR_PHASES.SOLUTION_DELIVERY);
      expect(state.transitions.length).toBeGreaterThan(10);
    });

    it("should handle validation failure and negotiation", () => {
      // Go through initial phases
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      state.transition(MFR_PHASES.ENTITY_DISCOVERY);
      state.transition(MFR_PHASES.MODEL_CONSOLIDATION);
      state.transition(MFR_PHASES.MODEL_VALIDATION);

      // Validation fails, enter negotiation
      state.transition(MFR_PHASES.MODEL_NEGOTIATION);

      // After negotiation, go back to consolidation
      state.transition(MFR_PHASES.MODEL_CONSOLIDATION);

      // Try validation again
      state.transition(MFR_PHASES.MODEL_VALIDATION);

      expect(state.phase).toBe(MFR_PHASES.MODEL_VALIDATION);
      expect(state.getPhaseHistory()).toContain(MFR_PHASES.MODEL_NEGOTIATION);
    });
  });

  describe("setMetadata and getMetadata", () => {
    it("should store and retrieve metadata", () => {
      state.setMetadata("contributorCount", 4);
      state.setMetadata("validationAttempts", 1);

      expect(state.getMetadata("contributorCount")).toBe(4);
      expect(state.getMetadata("validationAttempts")).toBe(1);
    });

    it("should return undefined for non-existent keys", () => {
      expect(state.getMetadata("nonexistent")).toBeUndefined();
    });

    it("should allow overwriting metadata", () => {
      state.setMetadata("count", 1);
      state.setMetadata("count", 2);

      expect(state.getMetadata("count")).toBe(2);
    });
  });

  describe("toJSON", () => {
    it("should serialize state to JSON", () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      state.transition(MFR_PHASES.ENTITY_DISCOVERY);
      state.setMetadata("test", "value");

      const json = state.toJSON();

      expect(json.sessionId).toBe("test-session-1");
      expect(json.currentPhase).toBe(MFR_PHASES.ENTITY_DISCOVERY);
      expect(json.transitions.length).toBe(2);
      expect(json.metadata.test).toBe("value");
    });

    it("should include timestamps", () => {
      const json = state.toJSON();

      expect(json.startTime).toBeDefined();
      expect(json.currentPhaseStartTime).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid transitions", () => {
      state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
      state.transition(MFR_PHASES.ENTITY_DISCOVERY);
      state.transition(MFR_PHASES.RELATIONSHIP_DISCOVERY);

      expect(state.phase).toBe(MFR_PHASES.RELATIONSHIP_DISCOVERY);
      expect(state.transitions.length).toBe(3);
    });

    it("should prevent transition to undefined phase", () => {
      expect(() => {
        state.transition("INVALID_PHASE");
      }).toThrow();
    });

    it("should handle metadata with complex types", () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { key: "value" },
        number: 42
      };

      state.setMetadata("complex", complexData);

      expect(state.getMetadata("complex")).toEqual(complexData);
    });
  });
});
