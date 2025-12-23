/**
 * Integration tests for Agent Providers with MFR capabilities
 */
import { describe, it, expect } from "vitest";
import { PrologProvider } from "../../src/agents/providers/prolog-provider.js";

const testLogger = {
  info: () => {},
  debug: () => {},
  error: () => {},
  warn: () => {}
};

describe("Agent Provider MFR Integration", () => {
  describe("PrologProvider MFR methods", () => {
    let provider;

    beforeEach(() => {
      provider = new PrologProvider({
        nickname: "TestProlog",
        logger: testLogger
      });
    });

    it("should extract actions from problem description", async () => {
      const problemDescription = `
        Schedule three meetings for the team.
        First, create the agenda, then assign participants, and finally send invitations.
      `;

      const actions = await provider.extractActions(problemDescription);

      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);

      // Should extract action verbs
      const actionNames = actions.map(a => a.name);
      expect(actionNames.some(name => name === "schedule" || name === "create" || name === "assign")).toBe(true);
    });

    it("should infer parameters for actions", () => {
      const params = provider.inferParameters("schedule");

      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params).toContain("entity");
    });

    it("should define action logic in Prolog", () => {
      const prolog = provider.defineActionLogic(
        "schedule",
        ["available(Resource)"],
        ["scheduled(Resource)"]
      );

      expect(typeof prolog).toBe("string");
      expect(prolog).toContain("action(schedule");
      expect(prolog).toContain("precondition");
      expect(prolog).toContain("effect");
      expect(prolog).toContain("available(Resource)");
      expect(prolog).toContain("scheduled(Resource)");
    });

    it("should generate RDF for actions", async () => {
      const actions = [
        { name: "schedule", parameters: ["entity", "time"], description: "Schedule an entity" },
        { name: "create", parameters: ["entity"], description: "Create something" }
      ];

      const rdf = await provider.generateActionRdf(actions, "test-session");

      expect(typeof rdf).toBe("string");
      expect(rdf).toContain("mfr:Action");
      expect(rdf).toContain("schedule");
      expect(rdf).toContain("create");
      expect(rdf).toContain("test-session");
      expect(rdf).toContain("contributedBy");
    });

    it("should generate RDF for state variables", async () => {
      const stateVars = ["status", "available", "count"];

      const rdf = await provider.generateStateVariableRdf(stateVars, "test-session");

      expect(typeof rdf).toBe("string");
      expect(rdf).toContain("mfr:StateVariable");
      expect(rdf).toContain("status");
      expect(rdf).toContain("available");
      expect(rdf).toContain("count");
    });

    it("should extract state variables from problem", () => {
      const problemDescription = `
        The system status must be active.
        Check if resources are available.
        Track the count of completed tasks.
      `;

      const stateVars = provider.extractStateVariables(problemDescription);

      expect(Array.isArray(stateVars)).toBe(true);
      expect(stateVars).toContain("status");
      expect(stateVars).toContain("available");
      expect(stateVars).toContain("count");
    });

    it("should handle MFR contribution request", async () => {
      const request = {
        sessionId: "test-123",
        problemDescription: "Schedule meetings and assign rooms",
        requestedContributions: [
          "http://purl.org/stuff/mfr/ActionDefinition",
          "http://purl.org/stuff/mfr/StateVariable"
        ]
      };

      const contribution = await provider.handleMfrContributionRequest(request);

      expect(typeof contribution).toBe("string");
      expect(contribution.length).toBeGreaterThan(0);
      expect(contribution).toContain("mfr:");
      expect(contribution).toContain("test-123");
    });

    it("should generate solution from model", async () => {
      const modelTurtle = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        <#action1> a mfr:Action ;
          schema:name "schedule" .

        <#action2> a mfr:Action ;
          schema:name "create" .
      `;

      const goals = ["Complete scheduling", "Create all items"];

      const solution = await provider.generateSolution(modelTurtle, goals);

      expect(solution).toBeDefined();
      expect(solution.success).toBeDefined();
      expect(solution.plan).toBeDefined();
      expect(Array.isArray(solution.plan)).toBe(true);
    });
  });

  describe("MFR workflow simulation", () => {
    it("should simulate complete MFR agent workflow", async () => {
      const prologProvider = new PrologProvider({
        nickname: "Prolog",
        logger: testLogger
      });

      // Simulate problem submission
      const problemDescription = `
        Schedule three appointments for patients.
        Create appointment slots, assign doctors, and send confirmations.
        Ensure no conflicts in the schedule.
      `;

      // Phase 1: Extract actions
      const actions = await prologProvider.extractActions(problemDescription);
      expect(actions.length).toBeGreaterThan(0);

      // Phase 2: Extract state variables
      const stateVars = prologProvider.extractStateVariables(problemDescription);
      expect(stateVars.length).toBeGreaterThanOrEqual(0);

      // Phase 3: Generate RDF contributions
      const actionRdf = await prologProvider.generateActionRdf(actions, "sim-123");
      expect(actionRdf).toContain("mfr:Action");

      if (stateVars.length > 0) {
        const stateRdf = await prologProvider.generateStateVariableRdf(stateVars, "sim-123");
        expect(stateRdf).toContain("mfr:StateVariable");
      }

      // Phase 4: Generate solution
      const mockModel = `
        @prefix mfr: <http://purl.org/stuff/mfr/> .
        @prefix schema: <http://schema.org/> .

        ${actions.map((a, i) => `
          <#action${i}> a mfr:Action ;
            schema:name "${a.name}" .
        `).join('\n')}
      `;

      const solution = await prologProvider.generateSolution(
        mockModel,
        ["Complete appointments"]
      );

      expect(solution.success).toBeDefined();
      expect(solution.plan).toBeDefined();
    });
  });

  describe("Prolog reasoning capabilities", () => {
    let provider;

    beforeEach(() => {
      provider = new PrologProvider({
        nickname: "TestProlog",
        logger: testLogger
      });
    });

    it("should consult and query Prolog programs", async () => {
      const program = `
        parent(tom, bob).
        parent(tom, liz).
        parent(bob, ann).

        grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
      `;

      await provider.consult(program);

      const answers = await provider.query("grandparent(tom, ann).");

      expect(Array.isArray(answers)).toBe(true);
      expect(answers.length).toBeGreaterThan(0);
      expect(answers[0]).toContain("true") || expect(answers[0]).toContain("yes");
    });

    it("should handle queries with variables", async () => {
      const program = `
        likes(mary, food).
        likes(mary, wine).
        likes(john, wine).
        likes(john, mary).
      `;

      await provider.consult(program);

      const answers = await provider.query("likes(mary, X).");

      expect(answers.length).toBeGreaterThan(0);
      expect(answers.some(a => a.includes("food"))).toBe(true);
      expect(answers.some(a => a.includes("wine"))).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle invalid problem descriptions gracefully", async () => {
      const provider = new PrologProvider({ nickname: "Test", logger: testLogger });

      const emptyProblem = "";
      const actions = await provider.extractActions(emptyProblem);

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBe(0);
    });

    it("should handle missing contribution types", async () => {
      const provider = new PrologProvider({ nickname: "Test", logger: testLogger });

      const request = {
        sessionId: "test-123",
        problemDescription: "Test problem",
        requestedContributions: [] // empty
      };

      const contribution = await provider.handleMfrContributionRequest(request);

      expect(typeof contribution).toBe("string");
      // Should return empty or minimal RDF
    });

    it("should handle very long problem descriptions", async () => {
      const provider = new PrologProvider({ nickname: "Test", logger: testLogger });

      const longProblem = "Schedule meetings and assign rooms. ".repeat(100);
      const actions = await provider.extractActions(longProblem);

      expect(Array.isArray(actions)).toBe(true);
      // Should not crash, may extract multiple actions
    });
  });
});
