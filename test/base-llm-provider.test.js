/**
 * Unit tests for BaseLLMProvider abstract class
 * Tests the shared functionality across all LLM providers
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseLLMProvider } from "../src/agents/providers/base-llm-provider.js";

const testLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

/**
 * Concrete test implementation of BaseLLMProvider
 */
class TestLLMProvider extends BaseLLMProvider {
  initializeClient(apiKey) {
    // Create and return a mock client
    return {
      chat: {
        complete: vi.fn()
      }
    };
  }

  async completeChatRequest({ messages, maxTokens, temperature }) {
    // Simulate API response
    return {
      choices: [{
        message: {
          content: "Test response"
        }
      }]
    };
  }

  extractResponseText(response) {
    return response.choices[0]?.message?.content?.trim() || null;
  }
}

describe("BaseLLMProvider", () => {
  describe("Constructor and initialization", () => {
    it("should throw error if API key is missing", () => {
      expect(() => {
        new TestLLMProvider({
          apiKey: null,
          model: "test-model",
          nickname: "TestBot",
          logger: testLogger
        });
      }).toThrow("API key is required");
    });

    it("should initialize with valid configuration", () => {
      const provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });

      expect(provider.model).toBe("test-model");
      expect(provider.nickname).toBe("TestBot");
      expect(provider.lingueEnabled).toBe(true); // default
      expect(provider.lingueConfidenceMin).toBe(0.5); // default
    });

    it("should accept custom configuration", () => {
      const provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "custom-model",
        nickname: "CustomBot",
        systemPrompt: "You are a helpful assistant",
        lingueEnabled: false,
        lingueConfidenceMin: 0.8,
        logger: testLogger
      });

      expect(provider.model).toBe("custom-model");
      expect(provider.nickname).toBe("CustomBot");
      expect(provider.lingueEnabled).toBe(false);
      expect(provider.lingueConfidenceMin).toBe(0.8);
    });

    it("should initialize client on construction", () => {
      const provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });

      expect(provider.client).toBeDefined();
      expect(provider.client.chat).toBeDefined();
    });
  });

  describe("Abstract method enforcement", () => {
    it("should throw error if initializeClient not implemented", () => {
      class IncompleteProvider extends BaseLLMProvider {}

      expect(() => {
        new IncompleteProvider({
          apiKey: "test-key",
          model: "test-model",
          nickname: "TestBot",
          logger: testLogger
        });
      }).toThrow("initializeClient() must be implemented by subclass");
    });

    it("should throw error if completeChatRequest not implemented", async () => {
      class IncompleteProvider extends BaseLLMProvider {
        initializeClient() {
          return {};
        }
      }

      const provider = new IncompleteProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });

      await expect(
        provider.completeChatRequest({ messages: [], maxTokens: 100, temperature: 0.7 })
      ).rejects.toThrow("completeChatRequest() must be implemented by subclass");
    });

    it("should throw error if extractResponseText not implemented", () => {
      class IncompleteProvider extends BaseLLMProvider {
        initializeClient() {
          return {};
        }
        async completeChatRequest() {
          return {};
        }
      }

      const provider = new IncompleteProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });

      expect(() => {
        provider.extractResponseText({});
      }).toThrow("extractResponseText() must be implemented by subclass");
    });
  });

  describe("System prompt building", () => {
    it("should use systemPrompt if provided", () => {
      const provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        systemPrompt: "Custom system prompt",
        logger: testLogger
      });

      const prompt = provider.buildSystemPrompt();
      expect(prompt).toBe("Custom system prompt");
    });

    it("should use systemTemplate with nickname substitution", () => {
      const provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        systemTemplate: "You are {{nickname}}, a helpful assistant",
        logger: testLogger
      });

      const prompt = provider.buildSystemPrompt();
      expect(prompt).toBe("You are TestBot, a helpful assistant");
    });

    it("should use default template if neither prompt nor template provided", () => {
      const provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });

      const prompt = provider.buildSystemPrompt();
      // BaseLLMProvider has a DEFAULT_SYSTEM_TEMPLATE
      expect(prompt).toBeDefined();
      expect(prompt).toContain("TestBot");
      expect(prompt).toContain("helpful assistant");
    });
  });

  describe("MFR entity extraction", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should extract entities from problem description", async () => {
      // Override completeChatRequest to return entity extraction
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              entities: [
                { name: "Patient", type: "person", description: "Medical patient" },
                { name: "Appointment", type: "event", description: "Medical appointment" }
              ]
            })
          }
        }]
      });

      const entities = await provider.extractEntities("Schedule appointments for patients");

      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(2);
      expect(entities[0].name).toBe("Patient");
      expect(entities[1].name).toBe("Appointment");
    });

    it("should handle empty problem description", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({ entities: [] })
          }
        }]
      });

      const entities = await provider.extractEntities("");
      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(0);
    });

    it("should handle malformed JSON response", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: "Not valid JSON"
          }
        }]
      });

      const entities = await provider.extractEntities("Test problem");
      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(0);
    });
  });

  describe("MFR goal extraction", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should extract goals from problem description", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              goals: [
                { name: "Complete scheduling", priority: "high", description: "Schedule all appointments" },
                { name: "Send confirmations", priority: "medium", description: "Confirm all bookings" }
              ]
            })
          }
        }]
      });

      const goals = await provider.extractGoals("Schedule appointments and send confirmations");

      expect(Array.isArray(goals)).toBe(true);
      expect(goals.length).toBe(2);
      expect(goals[0].name).toBe("Complete scheduling");
      expect(goals[1].name).toBe("Send confirmations");
    });

    it("should handle empty response", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({ goals: [] })
          }
        }]
      });

      const goals = await provider.extractGoals("");
      expect(Array.isArray(goals)).toBe(true);
      expect(goals.length).toBe(0);
    });
  });

  describe("MFR action extraction", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should extract actions from problem description", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              actions: [
                { name: "schedule", parameters: ["patient", "time"], description: "Schedule appointment" },
                { name: "confirm", parameters: ["appointment"], description: "Send confirmation" }
              ]
            })
          }
        }]
      });

      const actions = await provider.extractActions("Schedule and confirm appointments");

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBe(2);
      expect(actions[0].name).toBe("schedule");
      expect(actions[1].name).toBe("confirm");
    });
  });

  describe("RDF generation", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should generate entity RDF", async () => {
      const entities = [
        { name: "Patient", type: "person", description: "Medical patient" },
        { name: "Appointment", type: "event", description: "Medical appointment" }
      ];

      const rdf = await provider.generateEntityRdf(entities, "test-session-123");

      expect(typeof rdf).toBe("string");
      expect(rdf).toContain("@prefix mfr:");
      expect(rdf).toContain("mfr:Entity");
      expect(rdf).toContain("Patient");
      expect(rdf).toContain("Appointment");
      expect(rdf).toContain("test-session-123");
      expect(rdf).toContain("contributedBy");
    });

    it("should generate goal RDF", async () => {
      const goals = [
        { goal: "Complete scheduling", priority: "high", description: "Schedule all appointments" }
      ];

      const rdf = await provider.generateGoalRdf(goals, "test-session-456");

      expect(typeof rdf).toBe("string");
      expect(rdf).toContain("@prefix mfr:");
      expect(rdf).toContain("mfr:Goal");
      expect(rdf).toContain("Complete scheduling");
      expect(rdf).toContain("test-session-456");
    });

    it("should handle empty entity list", async () => {
      const rdf = await provider.generateEntityRdf([], "test-session");
      expect(typeof rdf).toBe("string");
      expect(rdf.length).toBeGreaterThan(0); // Should still have prefixes
    });
  });

  describe("Utility methods", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should slugify strings correctly", () => {
      expect(provider.slugify("Hello World")).toBe("hello-world");
      expect(provider.slugify("Test@123!")).toBe("test-123");
      expect(provider.slugify("Multiple   Spaces")).toBe("multiple-spaces");
      expect(provider.slugify("UPPERCASE")).toBe("uppercase");
    });
  });

  describe("Solution explanation", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should generate explanation for solution", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: "The solution involves scheduling appointments in sequence."
          }
        }]
      });

      const solution = {
        success: true,
        plan: ["schedule", "confirm"]
      };

      const explanation = await provider.explainSolution(solution, "");

      expect(typeof explanation).toBe("string");
      expect(explanation).toContain("scheduling");
    });

    it("should handle failed solutions", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: "No valid plan could be found."
          }
        }]
      });

      const solution = {
        success: false
      };

      const explanation = await provider.explainSolution(solution, "");

      expect(typeof explanation).toBe("string");
    });
  });

  describe("MFR contribution request handling", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        logger: testLogger
      });
    });

    it("should handle entity discovery request", async () => {
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              entities: [
                { name: "Task", type: "entity", description: "A task to complete" }
              ]
            })
          }
        }]
      });

      const request = {
        sessionId: "test-123",
        problemDescription: "Complete tasks efficiently",
        requestedContributions: ["http://purl.org/stuff/mfr/EntityDiscovery"]
      };

      const contribution = await provider.handleMfrContributionRequest(request);

      expect(typeof contribution).toBe("string");
      expect(contribution).toContain("mfr:Entity");
      expect(contribution).toContain("Task");
      expect(contribution).toContain("test-123");
    });

    it("should handle goal identification request", async () => {
      // Only one call needed - extractGoals is called, not extractEntities
      provider.completeChatRequest = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              goals: [
                { goal: "Maximize efficiency", priority: "high", description: "Work efficiently" }
              ]
            })
          }
        }]
      });

      const request = {
        sessionId: "test-456",
        problemDescription: "Improve workflow efficiency",
        requestedContributions: ["http://purl.org/stuff/mfr/GoalIdentification"]
      };

      const contribution = await provider.handleMfrContributionRequest(request);

      expect(typeof contribution).toBe("string");
      expect(contribution).toContain("mfr:Goal");
      expect(contribution).toContain("test-456");
    });

    it("should handle empty contribution types", async () => {
      const request = {
        sessionId: "test-789",
        problemDescription: "Test problem",
        requestedContributions: []
      };

      const contribution = await provider.handleMfrContributionRequest(request);

      expect(typeof contribution).toBe("string");
      // Should return minimal RDF with just prefixes
    });
  });

  describe("Chat handling", () => {
    let provider;

    beforeEach(() => {
      provider = new TestLLMProvider({
        apiKey: "test-key",
        model: "test-model",
        nickname: "TestBot",
        systemPrompt: "You are a helpful assistant",
        logger: testLogger
      });
    });

    it("should handle basic chat command", async () => {
      const mockReply = vi.fn();

      const result = await provider.handle({
        command: "chat",
        content: "How do I schedule appointments?",
        metadata: {},
        reply: mockReply
      });

      expect(result).toBe("Test response");
    });

    it("should include system prompt in messages", async () => {
      const mockReply = vi.fn();
      const completeSpy = vi.spyOn(provider, "completeChatRequest");

      await provider.handle({
        command: "chat",
        content: "Hello",
        metadata: {},
        reply: mockReply
      });

      const messages = completeSpy.mock.calls[0][0].messages;
      expect(messages[0].role).toBe("system");
      expect(messages[0].content).toBe("You are a helpful assistant");
    });
  });
});
