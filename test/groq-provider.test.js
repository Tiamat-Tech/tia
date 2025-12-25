/**
 * Unit tests for GroqProvider
 * Tests Groq-specific LLM provider implementation
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GroqProvider } from "../src/agents/providers/groq-provider.js";

const testLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

describe("GroqProvider", () => {
  describe("Constructor and initialization", () => {
    it("should initialize with required parameters", () => {
      const provider = new GroqProvider({
        apiKey: "test-groq-key",
        model: "llama-3.3-70b-versatile",
        nickname: "GroqBot",
        logger: testLogger
      });

      expect(provider).toBeDefined();
      expect(provider.model).toBe("llama-3.3-70b-versatile");
      expect(provider.nickname).toBe("GroqBot");
    });

    it("should use default model if not specified", () => {
      const provider = new GroqProvider({
        apiKey: "test-groq-key",
        nickname: "GroqBot",
        logger: testLogger
      });

      expect(provider.model).toBe("llama-3.3-70b-versatile");
    });

    it("should throw error if API key is missing", () => {
      expect(() => {
        new GroqProvider({
          apiKey: null,
          nickname: "GroqBot",
          logger: testLogger
        });
      }).toThrow("API key is required");
    });

    it("should accept custom configuration", () => {
      const provider = new GroqProvider({
        apiKey: "test-groq-key",
        model: "llama-3.1-8b-instant",
        nickname: "CustomGroq",
        systemPrompt: "You are a helpful assistant",
        lingueEnabled: false,
        lingueConfidenceMin: 0.8,
        logger: testLogger
      });

      expect(provider.model).toBe("llama-3.1-8b-instant");
      expect(provider.nickname).toBe("CustomGroq");
      expect(provider.lingueEnabled).toBe(false);
      expect(provider.lingueConfidenceMin).toBe(0.8);
    });
  });

  describe("Client initialization", () => {
    it("should initialize Groq client", () => {
      const provider = new GroqProvider({
        apiKey: "test-groq-key",
        nickname: "GroqBot",
        logger: testLogger
      });

      expect(provider.client).toBeDefined();
      // Groq client should have chat.completions.create method
      expect(provider.client.chat).toBeDefined();
    });
  });

  describe("Chat completion", () => {
    let provider;

    beforeEach(() => {
      provider = new GroqProvider({
        apiKey: "test-groq-key",
        model: "llama-3.3-70b-versatile",
        nickname: "GroqBot",
        logger: testLogger
      });

      // Mock the Groq client
      provider.client = {
        chat: {
          completions: {
            create: vi.fn()
          }
        }
      };
    });

    it("should make chat completion request with correct parameters", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: "Hello! How can I help you?"
          }
        }]
      });

      const messages = [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: "Hello" }
      ];

      const response = await provider.completeChatRequest({
        messages,
        maxTokens: 150,
        temperature: 0.7
      });

      expect(provider.client.chat.completions.create).toHaveBeenCalledWith({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 150,  // Note: Groq uses max_tokens (not maxTokens)
        temperature: 0.7
      });

      expect(response.choices[0].message.content).toBe("Hello! How can I help you?");
    });

    it("should handle different models", async () => {
      provider.model = "llama-3.1-8b-instant";
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: "Fast response"
          }
        }]
      });

      await provider.completeChatRequest({
        messages: [{ role: "user", content: "Quick question" }],
        maxTokens: 100,
        temperature: 0.5
      });

      expect(provider.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "llama-3.1-8b-instant"
        })
      );
    });
  });

  describe("Response extraction", () => {
    let provider;

    beforeEach(() => {
      provider = new GroqProvider({
        apiKey: "test-groq-key",
        nickname: "GroqBot",
        logger: testLogger
      });
    });

    it("should extract text from valid response", () => {
      const response = {
        choices: [{
          message: {
            content: "  This is a response  "
          }
        }]
      };

      const text = provider.extractResponseText(response);
      expect(text).toBe("This is a response");
    });

    it("should return null for empty response", () => {
      const response = {
        choices: [{
          message: {
            content: ""
          }
        }]
      };

      const text = provider.extractResponseText(response);
      expect(text).toBeNull();
    });

    it("should return null for missing content", () => {
      const response = {
        choices: [{
          message: {}
        }]
      };

      const text = provider.extractResponseText(response);
      expect(text).toBeNull();
    });

    it("should return null for missing message", () => {
      const response = {
        choices: [{}]
      };

      const text = provider.extractResponseText(response);
      expect(text).toBeNull();
    });

    it("should return null for empty choices", () => {
      const response = {
        choices: []
      };

      const text = provider.extractResponseText(response);
      expect(text).toBeNull();
    });
  });

  describe("MFR integration", () => {
    let provider;

    beforeEach(() => {
      provider = new GroqProvider({
        apiKey: "test-groq-key",
        model: "llama-3.3-70b-versatile",
        nickname: "GroqBot",
        logger: testLogger
      });

      // Mock the client
      provider.client = {
        chat: {
          completions: {
            create: vi.fn()
          }
        }
      };
    });

    it("should extract entities using Groq", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              entities: [
                { name: "Meeting", type: "event", description: "A scheduled meeting" },
                { name: "Participant", type: "person", description: "Meeting attendee" }
              ]
            })
          }
        }]
      });

      const entities = await provider.extractEntities("Schedule a meeting with participants");

      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(2);
      expect(entities[0].name).toBe("Meeting");
      expect(entities[1].name).toBe("Participant");
    });

    it("should extract goals using Groq", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              goals: [
                { name: "Schedule efficiently", priority: "high", description: "Optimize scheduling" }
              ]
            })
          }
        }]
      });

      const goals = await provider.extractGoals("Optimize meeting schedules");

      expect(Array.isArray(goals)).toBe(true);
      expect(goals.length).toBe(1);
      expect(goals[0].name).toBe("Schedule efficiently");
      expect(goals[0].priority).toBe("high");
    });

    it("should extract actions using Groq", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              actions: [
                { name: "schedule", parameters: ["meeting", "time"], description: "Schedule a meeting" },
                { name: "notify", parameters: ["participants"], description: "Notify attendees" }
              ]
            })
          }
        }]
      });

      const actions = await provider.extractActions("Schedule meetings and notify participants");

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBe(2);
      expect(actions[0].name).toBe("schedule");
      expect(actions[1].name).toBe("notify");
    });

    it("should generate RDF contributions", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
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

      const rdf = await provider.generateEntityRdf(
        [{ name: "Task", type: "entity", description: "A task to complete" }],
        "test-session-123"
      );

      expect(typeof rdf).toBe("string");
      expect(rdf).toContain("@prefix mfr:");
      expect(rdf).toContain("mfr:Entity");
      expect(rdf).toContain("Task");
      expect(rdf).toContain("test-session-123");
    });

    it("should explain solutions using Groq", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: "The solution involves scheduling tasks in priority order."
          }
        }]
      });

      const solution = {
        success: true,
        plan: ["schedule", "assign", "execute"]
      };

      const explanation = await provider.explainSolution(solution, "");

      expect(typeof explanation).toBe("string");
      expect(explanation).toContain("scheduling");
      expect(explanation).toContain("priority");
    });
  });

  describe("End-to-end chat flow", () => {
    let provider;

    beforeEach(() => {
      provider = new GroqProvider({
        apiKey: "test-groq-key",
        model: "llama-3.3-70b-versatile",
        nickname: "GroqBot",
        systemPrompt: "You are GroqBot, a helpful assistant",
        logger: testLogger
      });

      provider.client = {
        chat: {
          completions: {
            create: vi.fn()
          }
        }
      };
    });

    it("should handle a complete chat interaction", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: "I can help you schedule appointments efficiently."
          }
        }]
      });

      const mockReply = vi.fn();

      const result = await provider.handle({
        command: "chat",
        content: "How do I schedule appointments?",
        metadata: {},
        reply: mockReply
      });

      expect(result).toBe("I can help you schedule appointments efficiently.");
      expect(provider.client.chat.completions.create).toHaveBeenCalled();

      const callArgs = provider.client.chat.completions.create.mock.calls[0][0];
      expect(callArgs.model).toBe("llama-3.3-70b-versatile");
      expect(callArgs.messages[0].role).toBe("system");
      expect(callArgs.messages[0].content).toBe("You are GroqBot, a helpful assistant");
    });

    it("should handle conversation history", async () => {
      const { InMemoryHistoryStore } = await import("../src/lib/history/index.js");
      provider.historyStore = new InMemoryHistoryStore({ maxEntries: 10 });

      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: "Previous context is considered."
          }
        }]
      });

      const mockReply = vi.fn();

      // First message
      await provider.handle({
        command: "chat",
        content: "Hello",
        metadata: { sender: "user1" },
        reply: mockReply
      });

      // Second message (should include history)
      await provider.handle({
        command: "chat",
        content: "What did I just say?",
        metadata: { sender: "user1" },
        reply: mockReply
      });

      expect(provider.client.chat.completions.create).toHaveBeenCalledTimes(2);

      // Second call should have more messages (including history)
      const secondCallArgs = provider.client.chat.completions.create.mock.calls[1][0];
      expect(secondCallArgs.messages.length).toBeGreaterThan(2); // system + 2 user messages
    });
  });

  describe("Error handling", () => {
    let provider;

    beforeEach(() => {
      provider = new GroqProvider({
        apiKey: "test-groq-key",
        nickname: "GroqBot",
        logger: testLogger
      });

      provider.client = {
        chat: {
          completions: {
            create: vi.fn()
          }
        }
      };
    });

    it("should handle API errors gracefully", async () => {
      provider.client.chat.completions.create.mockRejectedValue(
        new Error("API rate limit exceeded")
      );

      const mockReply = vi.fn();

      const result = await provider.handle({
        command: "chat",
        content: "Hello",
        metadata: {},
        reply: mockReply
      });

      // BaseLLMProvider catches errors and returns an error message instead of throwing
      expect(result).toBe("I'm having trouble generating a response right now.");
    });

    it("should handle malformed JSON in MFR responses", async () => {
      provider.client.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: "Not valid JSON at all"
          }
        }]
      });

      const entities = await provider.extractEntities("Test problem");

      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(0);
    });
  });

  describe("Configuration variants", () => {
    it("should work with different Groq models", () => {
      const models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
      ];

      models.forEach(model => {
        const provider = new GroqProvider({
          apiKey: "test-key",
          model,
          nickname: "GroqBot",
          logger: testLogger
        });

        expect(provider.model).toBe(model);
      });
    });

    it("should support systemTemplate with nickname substitution", () => {
      const provider = new GroqProvider({
        apiKey: "test-key",
        nickname: "CustomBot",
        systemTemplate: "You are {{nickname}}, an AI assistant",
        logger: testLogger
      });

      const prompt = provider.buildSystemPrompt();
      expect(prompt).toBe("You are CustomBot, an AI assistant");
    });
  });
});
