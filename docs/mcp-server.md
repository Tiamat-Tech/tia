# MCP Server Guide

TIA MCP server support lives in `src/mcp/server-bridge.js`.

## Chat + Lingue Server (stdio)

```bash
AGENT_PROFILE=mistral node src/mcp/servers/tia-mcp-server.js
```

Tools exposed:
- `sendMessage`
- `offerLingueMode`
- `getProfile`
- `summarizeLingue`

## SPARQL Test Server

```bash
SPARQL_QUERY_ENDPOINT=https://dbpedia.org/sparql \
SPARQL_UPDATE_ENDPOINT=https://dbpedia.org/sparql \
node src/mcp/servers/sparql-server.js
```

Tools exposed:
- `sparqlQuery`
- `sparqlUpdate`

## MCP Loopback Agent

```bash
AGENT_PROFILE=mcp-loopback MCP_LOOPBACK_MODE=in-memory node src/services/mcp-loopback-agent.js
```

`MCP_LOOPBACK_MODE` can be `in-memory` (default) or `stdio` for an external stdio server.
