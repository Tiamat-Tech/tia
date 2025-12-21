// Core
export { AgentRunner } from "./agents/core/agent-runner.js";
export { AgentProfile, XmppConfig } from "./agents/profile/index.js";
export { loadAgentProfile, profileToTurtle, setDefaultProfileDir, parseAgentProfile } from "./agents/profile-loader.js";
export { loadAgentRoster } from "./agents/profile-roster.js";

// Factory functions (simplified bot creation)
export { createAgent, createSimpleAgent } from "./factories/agent-factory.js";

// Lingue
export { LingueNegotiator } from "./lib/lingue/index.js";
export * as LINGUE from "./lib/lingue/constants.js";
export * as Handlers from "./lib/lingue/handlers/index.js";

// Utilities
export { XmppRoomAgent } from "./lib/xmpp-room-agent.js";
export { createMentionDetector } from "./agents/core/mention-detector.js";
export { defaultCommandParser } from "./agents/core/command-parser.js";
export { InMemoryHistoryStore, HistoryStore, HISTORY_TERMS } from "./lib/history/index.js";
export { loadSystemConfig } from "./lib/system-config.js";

// Auto-registration
export { autoConnectXmpp } from "./lib/xmpp-auto-connect.js";
export { registerXmppAccount, generatePassword } from "./lib/xmpp-register.js";

// Provider base and example
export { BaseProvider } from "./agents/providers/base-provider.js";
export { DemoProvider } from "./agents/providers/demo-provider.js";

// MCP
export * as MCP from "./mcp/index.js";

// Version
export const VERSION = "0.3.0";
