import { describe, it, expect } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { McpLoopbackProvider } from "../src/agents/providers/mcp-loopback-provider.js";

describe("MCP loopback provider", () => {
  it("echoes via MCP client/server", async () => {
    const profile = new AgentProfile({
      identifier: "loopback",
      nickname: "Loopback",
      roomJid: "test@conference"
    });

    const provider = new McpLoopbackProvider({ profile, mode: "in-memory" });

    const result = await provider.handle({ command: "chat", content: "hello" });
    expect(result).toContain("Echo: hello");
    await provider.close();
  });
});
