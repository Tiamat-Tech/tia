import { describe, it, expect } from "vitest";
import { Capability } from "../src/agents/profile/capability.js";
import { createCapabilityCommandParser } from "../src/agents/core/capability-command-parser.js";

describe("Capability-based command parser", () => {
  describe("Capability.matches()", () => {
    it("matches primary command", () => {
      const cap = new Capability({
        name: "start-session",
        command: "mfr-start",
        aliases: ["start"]
      });

      expect(cap.matches("mfr-start problem description")).toBe(true);
      expect(cap.matches("MFR-START problem description")).toBe(true);
      expect(cap.matches("mfr-status")).toBe(false);
    });

    it("matches aliases", () => {
      const cap = new Capability({
        name: "start-session",
        command: "mfr-start",
        aliases: ["start"]
      });

      expect(cap.matches("start problem description")).toBe(true);
      expect(cap.matches("START problem description")).toBe(true);
      expect(cap.matches("starting")).toBe(false); // must be prefix, not substring
    });

    it("handles empty or null text", () => {
      const cap = new Capability({
        name: "test",
        command: "test-cmd",
        aliases: []
      });

      expect(cap.matches("")).toBe(false);
      expect(cap.matches(null)).toBe(false);
      expect(cap.matches(undefined)).toBe(false);
    });

    it("handles capability without command or aliases", () => {
      const cap = new Capability({
        name: "test",
        command: null,
        aliases: []
      });

      expect(cap.matches("anything")).toBe(false);
    });
  });

  describe("Capability.extractContent()", () => {
    it("extracts content after primary command", () => {
      const cap = new Capability({
        name: "start-session",
        command: "mfr-start",
        aliases: ["start"]
      });

      expect(cap.extractContent("mfr-start problem description")).toBe("problem description");
      expect(cap.extractContent("MFR-START problem description")).toBe("problem description");
    });

    it("extracts content after alias", () => {
      const cap = new Capability({
        name: "start-session",
        command: "mfr-start",
        aliases: ["start"]
      });

      expect(cap.extractContent("start problem description")).toBe("problem description");
      expect(cap.extractContent("START problem description")).toBe("problem description");
    });

    it("trims whitespace from extracted content", () => {
      const cap = new Capability({
        name: "test",
        command: "test",
        aliases: []
      });

      expect(cap.extractContent("test   multiple   spaces")).toBe("multiple   spaces");
      expect(cap.extractContent("test\t\ttab content")).toBe("tab content");
    });

    it("returns original text if no match", () => {
      const cap = new Capability({
        name: "test",
        command: "test-cmd",
        aliases: []
      });

      expect(cap.extractContent("other-cmd content")).toBe("other-cmd content");
    });

    it("handles empty content after command", () => {
      const cap = new Capability({
        name: "test",
        command: "test",
        aliases: []
      });

      expect(cap.extractContent("test")).toBe("");
      expect(cap.extractContent("test   ")).toBe("");
    });
  });

  describe("createCapabilityCommandParser()", () => {
    it("matches capability and returns command with content", () => {
      const capabilities = [
        new Capability({
          name: "start-session",
          command: "mfr-start",
          aliases: ["start"]
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);
      const result = parser("mfr-start solve this problem");

      expect(result.command).toBe("mfr-start");
      expect(result.content).toBe("solve this problem");
      expect(result.capability).toBeDefined();
      expect(result.capability.name).toBe("start-session");
    });

    it("matches alias and returns primary command", () => {
      const capabilities = [
        new Capability({
          name: "start-session",
          command: "mfr-start",
          aliases: ["start"]
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);
      const result = parser("start solve this problem");

      expect(result.command).toBe("mfr-start");
      expect(result.content).toBe("solve this problem");
    });

    it("matches first capability in order when multiple match", () => {
      const capabilities = [
        new Capability({
          name: "specific",
          command: "test-specific",
          aliases: []
        }),
        new Capability({
          name: "general",
          command: "test",
          aliases: []
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);
      const result = parser("test-specific content");

      expect(result.command).toBe("test-specific");
      expect(result.capability.name).toBe("specific");
    });

    it("falls back to legacy parser when no capability matches", () => {
      const capabilities = [
        new Capability({
          name: "start-session",
          command: "mfr-start",
          aliases: ["start"]
        })
      ];

      const legacyParser = (text) => ({
        command: "legacy-command",
        content: text
      });

      const parser = createCapabilityCommandParser(capabilities, legacyParser);
      const result = parser("some-other-command content");

      expect(result.command).toBe("legacy-command");
      expect(result.content).toBe("some-other-command content");
    });

    it("defaults to chat command when no capability matches and no fallback", () => {
      const capabilities = [
        new Capability({
          name: "start-session",
          command: "mfr-start",
          aliases: []
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);
      const result = parser("regular chat message");

      expect(result.command).toBe("chat");
      expect(result.content).toBe("regular chat message");
    });

    it("handles empty capabilities array", () => {
      const parser = createCapabilityCommandParser([]);
      const result = parser("any message");

      expect(result.command).toBe("chat");
      expect(result.content).toBe("any message");
    });

    it("handles null/undefined capabilities", () => {
      const parser = createCapabilityCommandParser(null);
      const result = parser("any message");

      expect(result.command).toBe("chat");
      expect(result.content).toBe("any message");
    });

    it("preserves capability metadata in result", () => {
      const capabilities = [
        new Capability({
          name: "test-cap",
          label: "Test Capability",
          description: "A test capability",
          command: "test",
          aliases: [],
          metadata: { custom: "data" }
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);
      const result = parser("test content");

      expect(result.capability.label).toBe("Test Capability");
      expect(result.capability.description).toBe("A test capability");
      expect(result.capability.metadata.custom).toBe("data");
    });

    it("backward compatible: works without capabilities (legacy mode)", () => {
      const legacyParser = (text) => {
        if (text.startsWith("tell")) {
          return { command: "tell", content: text.slice(4).trim() };
        }
        return { command: "chat", content: text };
      };

      const parser = createCapabilityCommandParser([], legacyParser);

      expect(parser("tell something").command).toBe("tell");
      expect(parser("regular chat").command).toBe("chat");
    });

    it("capability-based takes precedence over legacy parser", () => {
      const capabilities = [
        new Capability({
          name: "new-tell",
          command: "tell",
          aliases: []
        })
      ];

      const legacyParser = (text) => ({
        command: "legacy-tell",
        content: text
      });

      const parser = createCapabilityCommandParser(capabilities, legacyParser);
      const result = parser("tell something");

      expect(result.command).toBe("tell");
      expect(result.capability).toBeDefined();
      expect(result.capability.name).toBe("new-tell");
    });
  });

  describe("Integration scenarios", () => {
    it("MFR coordinator command routing", () => {
      const mfrCapabilities = [
        new Capability({ name: "start", command: "mfr-start", aliases: ["start"] }),
        new Capability({ name: "debate", command: "mfr-debate", aliases: ["debate"] }),
        new Capability({ name: "contribute", command: "mfr-contribute", aliases: ["contribute"] }),
        new Capability({ name: "status", command: "mfr-status", aliases: ["status"] })
      ];

      const parser = createCapabilityCommandParser(mfrCapabilities);

      expect(parser("mfr-start problem X").command).toBe("mfr-start");
      expect(parser("start problem X").command).toBe("mfr-start");
      expect(parser("debate which tools").command).toBe("mfr-debate");
      expect(parser("status").command).toBe("mfr-status");
    });

    it("Multiple aliases for same capability", () => {
      const capabilities = [
        new Capability({
          name: "query",
          command: "query",
          aliases: ["ask", "q", "?"]
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);

      expect(parser("query what is X").command).toBe("query");
      expect(parser("ask what is X").command).toBe("query");
      expect(parser("q what is X").command).toBe("query");
      expect(parser("? what is X").command).toBe("query");
    });

    it("Case-insensitive matching", () => {
      const capabilities = [
        new Capability({
          name: "help",
          command: "help",
          aliases: ["HELP", "Help", "h"]
        })
      ];

      const parser = createCapabilityCommandParser(capabilities);

      expect(parser("help").command).toBe("help");
      expect(parser("HELP").command).toBe("help");
      expect(parser("HeLp").command).toBe("help");
      expect(parser("h").command).toBe("help");
      expect(parser("H").command).toBe("help");
    });
  });
});
