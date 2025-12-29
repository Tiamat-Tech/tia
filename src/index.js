// Core agent framework
export { AgentRunner } from "./agents/core/agent-runner.js";
export { AgentProfile, XmppConfig } from "./agents/profile/index.js";
export { loadAgentProfile, profileToTurtle, setDefaultProfileDir, parseAgentProfile } from "./agents/profile-loader.js";
export { loadAgentRoster } from "./agents/profile-roster.js";

// Factory functions (simplified bot creation)
export { createAgent, createSimpleAgent } from "./factories/agent-factory.js";

// Lingue protocol
export { LingueNegotiator } from "./lib/lingue/index.js";
export * as LINGUE from "./lib/lingue/constants.js";
export * as Handlers from "./lib/lingue/handlers/index.js";

// XMPP utilities
export { XmppRoomAgent } from "./lib/xmpp-room-agent.js";
export { autoConnectXmpp } from "./lib/xmpp-auto-connect.js";
export { registerXmppAccount, generatePassword } from "./lib/xmpp-register.js";

// History stores
export { InMemoryHistoryStore, HistoryStore, HISTORY_TERMS } from "./lib/history/index.js";

// Agent utilities
export { createMentionDetector } from "./agents/core/mention-detector.js";
export { defaultCommandParser } from "./agents/core/command-parser.js";
export { loadSystemConfig } from "./lib/system-config.js";

// Provider base classes (for building custom providers)
// Note: For LLM API clients, use the 'hyperdata-clients' package
export { BaseProvider } from "./agents/providers/base-provider.js";
export { BaseLLMProvider } from "./agents/providers/base-llm-provider.js";
export { DemoProvider } from "./agents/providers/demo-provider.js";

// MCP integration
export * as MCP from "./mcp/index.js";

// Version
export const VERSION = "0.4.0";
