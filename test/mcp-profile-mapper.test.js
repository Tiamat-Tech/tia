import { describe, it, expect } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { McpToolRegistry } from "../src/mcp/tool-registry.js";
import { applyMcpMetadata } from "../src/mcp/profile-mapper.js";

describe("MCP profile mapper", () => {
  it("maps tool metadata into profile", () => {
    const profile = new AgentProfile({
      identifier: "demo",
      nickname: "Demo",
      roomJid: "test@conference"
    });

    const registry = new McpToolRegistry();
    registry.update({
      tools: [{
        name: "sparqlQuery",
        description: "Query tool",
        _meta: { tia: { endpoints: { query: "https://example.org/sparql" } } }
      }],
      resources: [],
      prompts: []
    });

    applyMcpMetadata(profile, registry);

    expect(profile.mcp.tools).toHaveLength(1);
    expect(profile.mcp.tools[0].name).toBe("sparqlQuery");
    expect(profile.mcp.endpoints).toContain("https://example.org/sparql");
  });
});
