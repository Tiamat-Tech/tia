# MCP Client Guide

Status: maintained; review after major changes.

TIA MCP client support lives in `src/mcp/client-bridge.js`.

## Basic Usage

```javascript
import { McpClientBridge } from "../src/mcp/client-bridge.js";
import { loadAgentProfile } from "../src/agents/profile-loader.js";

const profile = await loadAgentProfile("demo");
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

console.log(profile.mcp.tools);
console.log(profile.mcp.endpoints);
```

## Tool Metadata Mapping

- MCP tools → `profile.mcp.tools`
- MCP resources → `profile.mcp.resources`
- MCP prompts → `profile.mcp.prompts`
- Tool `_meta.tia.endpoints` → `profile.mcp.endpoints`

See `vocabs/mcp-ontology.ttl` for the RDF vocabulary.

## Room-aware messaging

When calling MCP chat tools from a client, pass explicit room IDs to avoid ambiguity:
- `sendMessage` supports `roomJid` for room delivery and `directJid` for DMs.
- `getRecentMessages` supports `roomJid` to filter to the general or log room.
