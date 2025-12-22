# Data Agent

The Data agent queries SPARQL endpoints (Wikidata by default) to answer questions about entities and return knowledge graph data in human-friendly format.

## Overview

The Data agent is a **knowledge query agent** that:
- Queries SPARQL endpoints like Wikidata, DBpedia, or custom triplestores
- Supports three query modes: command-based, natural language, and direct SPARQL
- Returns human-friendly summaries instead of raw JSON
- Uses Lingue protocol for SPARQL query negotiation
- Is fully configurable via RDF profiles with no hardcoded defaults

## Architecture

```
User Message → Command Parser → DataProvider → MCP Bridge → SPARQL Server → Endpoint
                                       ↓
                                 Mistral API (for entity extraction)
                                       ↓
                                Human-friendly summary ← JSON results
```

**Key Components:**
- **DataProvider** (`src/agents/providers/data-provider.js`) - Core provider logic
- **SPARQL Server** (`src/mcp/servers/sparql-server.js`) - MCP server for SPARQL queries
- **Profile** (`config/agents/data.ttl`) - RDF configuration
- **Lingue Handler** (`src/lib/lingue/handlers/sparql-query-handler.js`) - SparqlQuery mode

## Three Query Modes

### 1. Command Mode: `query: <entity>`

Direct entity lookup using the `query:` command prefix.

**Examples:**
```
Data, query: Albert Einstein
Data, query: Marie Curie
Data, query: JavaScript
```

**How it works:**
1. User provides entity name after `query:`
2. DataProvider builds Wikidata SPARQL query
3. Query executed via MCP SPARQL server
4. Results formatted as human-readable summary

### 2. Natural Language Mode

Ask questions naturally; the agent extracts the entity using Mistral API.

**Examples:**
```
Data, who was Albert Einstein?
Data, what is JavaScript?
Data, tell me about Marie Curie
```

**How it works:**
1. User asks natural language question
2. Mistral API extracts main entity from question
3. Same as command mode with extracted entity
4. Returns formatted summary

**Requires:** `MISTRAL_API_KEY` environment variable

### 3. Direct SPARQL Mode: `sparql: <query>`

Execute arbitrary SPARQL queries directly against the endpoint.

**Examples:**
```
Data, sparql: SELECT ?label WHERE { wd:Q937 rdfs:label ?label } LIMIT 1
Data, sparql: SELECT * WHERE {?s ?p ?o} LIMIT 5
```

**How it works:**
1. User provides complete SPARQL query
2. Query executed as-is via MCP server
3. Results formatted as summary

**Via Lingue:** Direct SPARQL queries can also be sent via the `lng:SparqlQuery` Lingue mode for agent-to-agent communication.

## Usage

### Starting the Agent

```bash
# Basic start
./start-data-agent.sh

# With custom profile
AGENT_PROFILE=data-dbpedia node src/services/data-agent.js
```

### In Chat

**Mention the agent:**
```
Data, query: Isaac Newton
Data, who invented the telephone?
```

**Direct Message:**
Send DMs to the Data agent's JID for private queries.

**Command Syntax:**
- `query: <entity>` or `query <entity>` - Entity lookup
- `sparql: <query>` or `sparql <query>` - Direct SPARQL
- Natural language - Any other question

## Configuration

### RDF Profile (`config/agents/data.ttl`)

```turtle
<#data> a agent:ConversationalAgent, agent:KnowledgeAgent, lng:Agent, mcp:Client ;
  foaf:nick "Data" ;
  schema:identifier "data" ;

  agent:xmppAccount [
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "data" ;
    xmpp:passwordKey "data" ;
    xmpp:resource "Data"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:dataProvider [
    a ai:DataProvider ;
    ai:sparqlEndpoint "https://query.wikidata.org/sparql" ;
    ai:extractionModel "mistral-small-latest" ;
    ai:extractionApiKeyEnv "MISTRAL_API_KEY" ;
    ai:maxTokens "50"^^xsd:integer ;
    ai:temperature "0.3"^^xsd:float
  ] ;

  lng:supports lng:HumanChat, lng:SparqlQuery ;
  lng:prefers lng:SparqlQuery .
```

### Configuration Properties

**Data Provider (`agent:dataProvider`):**
- `ai:sparqlEndpoint` - SPARQL endpoint URL (required)
- `ai:extractionModel` - Mistral model for entity extraction (optional, for natural language mode)
- `ai:extractionApiKeyEnv` - Env var name for Mistral API key (default: `MISTRAL_API_KEY`)
- `ai:maxTokens` - Max tokens for extraction (default: 50)
- `ai:temperature` - Temperature for extraction (default: 0.3)

**XMPP Account:**
- Standard XMPP configuration (service, domain, username, resource)
- Password stored in `config/agents/secrets.json` under key specified by `xmpp:passwordKey`

**Lingue Modes:**
- `lng:HumanChat` - Natural language chat
- `lng:SparqlQuery` - Direct SPARQL queries via Lingue protocol

### Secrets (`config/agents/secrets.json`)

```json
{
  "xmpp": {
    "data": "your-password-here"
  }
}
```

### Environment Variables

**Required:**
- None (all configuration from profile)

**Optional:**
- `MISTRAL_API_KEY` - For natural language entity extraction
- `AGENT_PROFILE` - Profile name to load (default: `data`)
- XMPP overrides (if needed): `XMPP_SERVICE`, `XMPP_DOMAIN`, `MUC_ROOM`, etc.

## Adapting for Other SPARQL Endpoints

The Data agent can query any SPARQL endpoint by changing the profile.

### DBpedia Example

Create `config/agents/data-dbpedia.ttl`:

```turtle
<#data-dbpedia> a agent:ConversationalAgent, agent:KnowledgeAgent ;
  foaf:nick "DBpedia" ;
  schema:identifier "data-dbpedia" ;

  agent:dataProvider [
    a ai:DataProvider ;
    ai:sparqlEndpoint "https://dbpedia.org/sparql" ;
    ai:extractionModel "mistral-small-latest" ;
    ai:extractionApiKeyEnv "MISTRAL_API_KEY"
  ] ;
  # ... rest of profile
```

Start with: `AGENT_PROFILE=data-dbpedia node src/services/data-agent.js`

### Local Triplestore Example

For a local Apache Jena Fuseki instance:

```turtle
agent:dataProvider [
  a ai:DataProvider ;
  ai:sparqlEndpoint "http://localhost:3030/dataset/sparql" ;
  ai:extractionModel "mistral-small-latest" ;
  ai:extractionApiKeyEnv "MISTRAL_API_KEY"
] ;
```

### Endpoint-Specific Query Builders

The DataProvider includes a Wikidata query builder (`buildWikidataQuery`). For other endpoints, you can:

1. Extend DataProvider with custom query builders
2. Use direct SPARQL mode with endpoint-specific queries
3. Create a derived provider class for complex endpoint logic

## Response Format

Results are formatted as human-friendly summaries:

```
Query: "Data, query: Albert Einstein"

Response:
1. Albert Einstein: German-born theoretical physicist (human)
2. Albert Einstein: Wikimedia disambiguation page (Wikimedia disambiguation page)
```

Format:
```
<number>. <label>: <description> (<type>)
```

**Empty results:**
```
No results found.
```

**Errors:**
```
Query timeout - the SPARQL endpoint took too long to respond.
Connection error - could not reach SPARQL endpoint.
Query error - malformed SPARQL query.
```

## Lingue Integration

The Data agent supports the **SparqlQuery** Lingue mode for agent-to-agent SPARQL query exchange.

**Mode URI:** `http://purl.org/stuff/lingue/SparqlQuery`

**Feature:** `http://purl.org/stuff/lingue/feature/lang/sparql-query`

**MIME Type:** `application/sparql-query`

**Usage:**
- Other agents can send SPARQL queries to Data agent via Lingue negotiation
- Data agent responds with formatted results
- Useful for knowledge graph integration in multi-agent systems

## Testing

### Manual Testing

```bash
# Start the agent
./start-data-agent.sh

# In another terminal, use the test client
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js testuser testpass

# Send test queries
Data, query: Alan Turing
Data, who was Ada Lovelace?
Data, sparql: SELECT * WHERE {?s ?p ?o} LIMIT 3
```

### Automated Test Script

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-data-agent.js
```

Tests all three query modes and displays results.

## Implementation Details

### Provider Architecture

**DataProvider** extends the base provider pattern:

```javascript
async handle({ command, content, metadata, reply }) {
  if (command === "query") return await this.handleEntityQuery(content);
  if (command === "sparql") return await this.handleDirectSparql(content);
  if (command === "chat") return await this.handleNaturalLanguage(content);
  return `${this.nickname} supports: query <entity>, sparql <query>, or natural language`;
}
```

**Key methods:**
- `handleEntityQuery(entity)` - Build and execute entity query
- `handleNaturalLanguage(text)` - Extract entity with Mistral, then query
- `handleDirectSparql(sparql)` - Execute raw SPARQL
- `buildWikidataQuery(entity)` - Construct Wikidata SPARQL query
- `formatResults(jsonText)` - Parse and format JSON results
- `extractEntity(text)` - Use Mistral to extract entity from natural language

### MCP Integration

The Data agent uses `McpClientBridge` to communicate with the SPARQL server:

```javascript
const mcpBridge = new McpClientBridge({
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: { SPARQL_QUERY_ENDPOINT: endpoint }
  }
});

await mcpBridge.connect();
const result = await mcpBridge.callTool("sparqlQuery", { query, endpoint });
```

**Tools available:**
- `sparqlQuery` - Execute SELECT/ASK/CONSTRUCT queries
- `sparqlUpdate` - Execute UPDATE statements (if needed)

### Command Parser Extension

The default command parser was extended to support `query:` and `sparql:` commands:

```javascript
if (lowered.startsWith("query:") || lowered.startsWith("query ")) {
  return { command: "query", content: trimmed.slice(6).trim() };
}
if (lowered.startsWith("sparql:") || lowered.startsWith("sparql ")) {
  return { command: "sparql", content: trimmed.slice(7).trim() };
}
```

This makes the commands available to all agents using the default parser.

## Error Handling

**Network Errors:**
- Connection failures → "Connection error - could not reach SPARQL endpoint."
- Timeouts → "Query timeout - the SPARQL endpoint took too long to respond."

**Query Errors:**
- Malformed SPARQL → "Query error - malformed SPARQL query."
- No entity found → "No results found."

**Configuration Errors:**
- Missing endpoint → Throws error on startup
- Missing API key → Natural language mode disabled, warning logged

## Future Enhancements

**Potential improvements:**
- Support for SPARQL UPDATE operations (data modification)
- Query result caching for frequently asked entities
- Multiple endpoint federation (query across multiple knowledge graphs)
- Enhanced result formatting with custom templates
- Integration with semantic reasoning engines
- Support for named graphs and graph protocols
- Query optimization and rewriting
- Federation with external knowledge bases

## Related Documentation

- [MCP Server Guide](mcp-server.md) - SPARQL server implementation
- [MCP Client Guide](mcp-client.md) - MCP bridge usage
- [Lingue Integration](lingue-integration.md) - Lingue protocol details
- [Agents Overview](agents.md) - All available agents
- [API Reference](api-reference.md) - Agent framework API

## References

- [Wikidata Query Service](https://query.wikidata.org/)
- [SPARQL 1.1 Specification](https://www.w3.org/TR/sparql11-query/)
- [DBpedia SPARQL Endpoint](https://dbpedia.org/sparql)
- [Lingue Protocol](https://danja.github.io/lingue/)
