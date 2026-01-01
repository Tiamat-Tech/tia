# MCP HTTP Server

Status: maintained; review after major changes.

TIA exposes an MCP Streamable HTTP endpoint in addition to stdio. This is the preferred transport for general HTTP clients because it supports session IDs, SSE streaming, and standard JSON-RPC requests.

## Enable the HTTP Endpoint

Set either `MCP_HTTP_ENABLED=1` or provide a port via `MCP_HTTP_PORT`.

```bash
MCP_HTTP_ENABLED=1 MCP_HTTP_PORT=7000 node src/mcp/servers/tia-mcp-server.js
```

Defaults:
- Host: `0.0.0.0` (set with `MCP_HTTP_HOST`)
- Path: `/mcp` (set with `MCP_HTTP_PATH`)
- Schema: `/mcp/schema`

## OpenAPI Schema

Fetch a lightweight schema for the HTTP transport:

```bash
curl http://localhost:7000/mcp/schema
```

The schema describes the JSON-RPC envelope and required headers (`Mcp-Session-Id`).

## Client Example (Node)

See `src/examples/mcp-http-client.js` for a small client that connects over Streamable HTTP and calls tools.

## Notes

- The HTTP endpoint follows the MCP Streamable HTTP specification (GET/POST/DELETE).
- Sessions are created on `initialize` and tracked via `Mcp-Session-Id` headers.
- The endpoint is unauthenticated by default (per current project settings).

## Curl Smoke Test

```bash
curl -s http://localhost:7000/mcp/schema | head -n 20
```
