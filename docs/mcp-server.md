# MCP Server Guide

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that enables AI assistants like Claude to securely connect to external data sources and tools. MCP servers expose capabilities (tools, resources, prompts) that AI clients can discover and use dynamically.

TIA implements MCP servers that expose XMPP chat operations and semantic processing capabilities, allowing AI assistants to participate in chat rooms, negotiate structured dialogue modes (Lingue), and interact with knowledge graphs via SPARQL.

## Architecture

TIA's MCP server implementation (`src/mcp/server-bridge.js`) provides:
- **stdio transport**: Standard JSON-RPC 2.0 communication over stdin/stdout
- **Tool registration**: Dynamic tool discovery and invocation
- **XMPP integration**: Bridge between MCP calls and XMPP operations
- **Lingue support**: Structured dialogue negotiation (IBIS, Prolog, profile exchange)

## Available MCP Servers

### 1. Chat + Lingue Server (stdio)

**Purpose**: Exposes XMPP multi-user chat (MUC) and Lingue protocol operations as MCP tools.

**Start the server:**
```bash
AGENT_PROFILE=mistral node src/mcp/servers/tia-mcp-server.js
```

**Tools exposed:**

- **`sendMessage`**: Send a message to the MUC room or direct message a specific JID
  - Parameters: `text` (string), `directJid` (string, optional)
  - Use case: Post messages to chat rooms, send DMs

- **`offerLingueMode`**: Negotiate a structured dialogue mode with a peer
  - Parameters: `peerJid` (string), `modes` (array of strings)
  - Modes: `human-chat`, `ibis-text`, `prolog-program`, `profile-exchange`
  - Use case: Switch from free-form chat to structured formats (IBIS debate, Prolog queries)

- **`getProfile`**: Retrieve the agent's RDF profile as Turtle
  - Parameters: none
  - Returns: Agent capabilities, supported modes, endpoints as RDF
  - Use case: Discover agent capabilities, share semantic metadata

- **`summarizeLingue`**: Analyze text and generate IBIS-style structured summary
  - Parameters: `text` (string)
  - Returns: Detected IBIS elements (Issues, Positions, Arguments)
  - Use case: Extract structured debate elements from conversation

**Configuration:**
The server uses the agent profile specified by `AGENT_PROFILE` (default: `mistral`). Profile files live in `config/agents/*.ttl` and define XMPP connection settings, supported Lingue modes, and capabilities.

### 2. SPARQL Server

**Purpose**: Provides SPARQL query and update operations against remote endpoints (e.g., DBpedia, Wikidata, custom triple stores).

**Start the server:**
```bash
SPARQL_QUERY_ENDPOINT=https://dbpedia.org/sparql \
SPARQL_UPDATE_ENDPOINT=https://dbpedia.org/sparql \
node src/mcp/servers/sparql-server.js
```

**Tools exposed:**

- **`sparqlQuery`**: Execute SPARQL SELECT/ASK/CONSTRUCT queries
  - Parameters: `query` (string), `endpoint` (string, optional override)
  - Returns: JSON results or RDF serialization
  - Use case: Query knowledge graphs, retrieve linked data

- **`sparqlUpdate`**: Execute SPARQL INSERT/DELETE/UPDATE operations
  - Parameters: `update` (string), `endpoint` (string, optional override)
  - Returns: Update confirmation
  - Use case: Modify triple stores, add facts to knowledge graphs

**Example queries:**
```sparql
# Find information about a person
SELECT ?property ?value WHERE {
  <http://dbpedia.org/resource/Albert_Einstein> ?property ?value .
} LIMIT 10

# Find all programming languages
SELECT ?lang ?label WHERE {
  ?lang a dbo:ProgrammingLanguage .
  ?lang rdfs:label ?label .
  FILTER (lang(?label) = 'en')
} LIMIT 20
```

### 3. MCP Loopback Agent

**Purpose**: Test/debug agent that echoes MCP calls back for integration testing.

**Start the server:**
```bash
AGENT_PROFILE=mcp-loopback MCP_LOOPBACK_MODE=in-memory node src/services/mcp-loopback-agent.js
```

**Modes:**
- `in-memory` (default): Server runs in same process
- `stdio`: External stdio server for testing transport

## Using TIA MCP Servers with Claude Code

Claude Code (and other MCP clients like Claude Desktop) can connect to TIA's MCP servers to gain new capabilities.

### Setup for Claude Code

**1. Add the server to your MCP configuration:**

Edit your Claude Code MCP settings (typically `~/.config/claude-code/mcp.json` or via CLI):

```bash
claude mcp add tia-chat node /path/to/tia/src/mcp/servers/tia-mcp-server.js
```

Or manually add to your config:
```json
{
  "mcpServers": {
    "tia-chat": {
      "command": "node",
      "args": ["/path/to/tia/src/mcp/servers/tia-mcp-server.js"],
      "env": {
        "AGENT_PROFILE": "mistral"
      }
    }
  }
}
```

**2. Restart Claude Code to load the new server**

**3. Verify the tools are available:**

Ask Claude: "What MCP tools do you have access to?"

You should see `sendMessage`, `offerLingueMode`, `getProfile`, and `summarizeLingue`.

### Example Usage

**Send a message to your XMPP chat room:**
```
Claude, please use sendMessage to post "Hello from Claude Code!" to the chat room.
```

**Analyze a conversation for IBIS structure:**
```
Claude, use summarizeLingue to analyze this text:
"Issue: Should we use REST or GraphQL?
Position: Use GraphQL because it's more flexible.
Argument: GraphQL allows clients to request exactly what they need."
```

**Retrieve agent capabilities:**
```
Claude, use getProfile to show me what this agent can do.
```

**Query DBpedia (with SPARQL server configured):**
```
Claude, use sparqlQuery to find 10 facts about Ada Lovelace from DBpedia.
```

### Advanced: Multiple Server Configuration

You can run multiple TIA MCP servers simultaneously for different purposes:

```json
{
  "mcpServers": {
    "tia-chat": {
      "command": "node",
      "args": ["/path/to/tia/src/mcp/servers/tia-mcp-server.js"],
      "env": {
        "AGENT_PROFILE": "mistral"
      }
    },
    "tia-sparql": {
      "command": "node",
      "args": ["/path/to/tia/src/mcp/servers/sparql-server.js"],
      "env": {
        "SPARQL_QUERY_ENDPOINT": "https://dbpedia.org/sparql"
      }
    }
  }
}
```

## Troubleshooting

**Server not connecting:**
- Check that Node.js is in your PATH
- Verify the script path is absolute
- Check logs in Claude Code's MCP output panel

**XMPP authentication failures:**
- Ensure `config/agents/secrets.json` contains valid credentials
- Verify XMPP server is reachable
- Check `AGENT_PROFILE` points to a valid profile in `config/agents/`

**SPARQL errors:**
- Verify endpoint URL is correct and accessible
- Check query syntax (try in a SPARQL client first)
- Some endpoints require authentication (configure via env vars)

## Development

**Creating custom MCP tools:**

1. Extend `src/mcp/tool-definitions.js` with new tool schemas
2. Implement handlers that call XMPP/Lingue operations via `chatAdapter`
3. Register tools in `McpServerBridge`

**Testing:**
```bash
# Test stdio communication
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node src/mcp/servers/tia-mcp-server.js

# Integration tests
npm test -- --grep "MCP"
```

## See Also

- [MCP Client Guide](mcp-client.md) - Using TIA agents as MCP clients
- [Lingue Integration](lingue-integration.md) - Structured dialogue modes
- [Agent Profiles](agents.md) - Configuring agent capabilities
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Official protocol docs
