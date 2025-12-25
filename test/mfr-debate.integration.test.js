import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { CoordinatorProvider } from "../src/agents/providers/coordinator-provider.js";
import { MfrModelStore } from "../src/lib/mfr/model-store.js";
import { MfrModelMerger } from "../src/lib/mfr/model-merger.js";
import { ShapesLoader } from "../src/lib/mfr/shapes-loader.js";
import { MFR_PHASES } from "../src/lib/mfr/constants.js";
import logger from "../src/lib/logger-lite.js";

dotenv.config();

describe("MFR Debate Integration", () => {
  describe("Feature flag behavior", () => {
    it("should reject debate command when feature is disabled", async () => {
      const provider = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: false,
        logger
      });

      const response = await provider.handle({
        command: "mfr-debate",
        content: "Test problem",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      expect(response).toContain("Debate feature not enabled");
      expect(response).toContain("mfr-start");
    });

    it("should accept debate command when feature is enabled", async () => {
      const provider = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: true,
        logger
      });

      const response = await provider.handle({
        command: "mfr-debate",
        content: "Schedule appointments. Ensure no drug interactions.",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      expect(response).toContain("Debate session started");
      expect(response).toContain("60 seconds");
    });

    it("should still accept mfr-start regardless of debate flag", async () => {
      const providerWithDebate = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: true,
        logger
      });

      const providerWithoutDebate = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: false,
        logger
      });

      const responseWith = await providerWithDebate.handle({
        command: "mfr-start",
        content: "Test problem",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      const responseWithout = await providerWithoutDebate.handle({
        command: "mfr-start",
        content: "Test problem",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      expect(responseWith).toContain("MFR session started");
      expect(responseWithout).toContain("MFR session started");
    });
  });

  describe("Debate session workflow", () => {
    let provider;

    beforeAll(() => {
      provider = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: true,
        logger
      });
    });

    it("should create session in TOOL_SELECTION_DEBATE phase", async () => {
      const response = await provider.handle({
        command: "mfr-debate",
        content: "Test problem for debate",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      expect(response).toContain("Debate session started");

      const sessionId = response.match(/Debate session started: ([a-f0-9-]+)/)?.[1];
      expect(sessionId).toBeDefined();

      const state = provider.activeSessions.get(sessionId);
      expect(state).toBeDefined();
      expect(state.getCurrentPhase()).toBe(MFR_PHASES.TOOL_SELECTION_DEBATE);
    });

    it("should store debate metadata", async () => {
      const problemDescription = "Schedule appointments with drug interaction checking";

      const response = await provider.handle({
        command: "mfr-debate",
        content: problemDescription,
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      const sessionId = response.match(/Debate session started: ([a-f0-9-]+)/)?.[1];
      const debateData = provider.activeDebates.get(sessionId);

      expect(debateData).toBeDefined();
      expect(debateData.problemDescription).toBe(problemDescription);
      expect(debateData.positions).toEqual([]);
      expect(debateData.consensusReached).toBe(false);
      expect(debateData.startTime).toBeDefined();
    });

    it("should transition to entity discovery after conclude", async () => {
      const response = await provider.handle({
        command: "mfr-debate",
        content: "Test problem",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      const sessionId = response.match(/Debate session started: ([a-f0-9-]+)/)?.[1];

      // Manually conclude debate (simulating timeout)
      await provider.concludeDebate(sessionId);

      const state = provider.activeSessions.get(sessionId);
      expect(state.getCurrentPhase()).toBe(MFR_PHASES.ENTITY_DISCOVERY);

      // Debate data should be cleaned up
      expect(provider.activeDebates.has(sessionId)).toBe(false);
    });

    it("should include debate command in help when enabled", () => {
      const helpMessage = provider.getHelpMessage();
      expect(helpMessage).toContain("debate <problem description>");
      expect(helpMessage).toContain("debate-driven");
    });

    it("should exclude debate command from help when disabled", () => {
      const providerNoDebate = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: false,
        logger
      });

      const helpMessage = providerNoDebate.getHelpMessage();
      expect(helpMessage).not.toContain("debate <problem description>");
    });
  });

  describe("Phase transitions", () => {
    it("should allow PROBLEM_INTERPRETATION -> TOOL_SELECTION_DEBATE transition", async () => {
      const provider = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: true,
        logger
      });

      const response = await provider.handle({
        command: "mfr-debate",
        content: "Test problem",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      const sessionId = response.match(/Debate session started: ([a-f0-9-]+)/)?.[1];
      const state = provider.activeSessions.get(sessionId);

      // Should be in debate phase
      expect(state.getCurrentPhase()).toBe(MFR_PHASES.TOOL_SELECTION_DEBATE);

      // Should allow transition to entity discovery
      expect(state.canTransitionTo(MFR_PHASES.ENTITY_DISCOVERY)).toBe(true);
    });

    it("should allow PROBLEM_INTERPRETATION -> ENTITY_DISCOVERY direct transition", async () => {
      const provider = new CoordinatorProvider({
        modelStore: new MfrModelStore({ logger }),
        merger: new MfrModelMerger({ logger }),
        shapesLoader: new ShapesLoader({ logger }),
        enableDebate: false,
        logger
      });

      const response = await provider.handle({
        command: "mfr-start",
        content: "Test problem",
        metadata: { sender: "test-user" },
        reply: () => {}
      });

      const sessionId = response.match(/MFR session started: ([a-f0-9-]+)/)?.[1];
      const state = provider.activeSessions.get(sessionId);

      // Should be in entity discovery (skipping debate)
      expect(state.getCurrentPhase()).toBe(MFR_PHASES.ENTITY_DISCOVERY);
    });
  });
});
