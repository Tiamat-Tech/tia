import { loadAgentProfile } from "../agents/profile-loader.js";
import { McpClientBridge } from "../mcp/client-bridge.js";

const profile = await loadAgentProfile("demo");
if (!profile) {
  throw new Error("Demo profile not found.");
}

const bridge = new McpClientBridge({
  profile,
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: process.env
  }
});

await bridge.connect();
await bridge.populateProfile();

console.log("MCP tools:", profile.mcp.tools.map(tool => tool.name));
console.log("MCP endpoints:", profile.mcp.endpoints);

await bridge.close();
