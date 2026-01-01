# Model Context Protocol (MCP)

Status: maintained; review after major changes.

This document summarizes how TIA exposes MCP servers and how to connect with MCP clients.
For detailed tooling, see `docs/mcp-server.md` and `docs/mcp-client.md`.

## MCP Servers in This Repo

- **Chat + Lingue server**: `node src/mcp/servers/tia-mcp-server.js`
  - Exposes XMPP tools like `sendMessage`, `getRecentMessages`, `offerLingueMode`.
  - Optional HTTP transport at `/mcp` (see `docs/mcp-http.md`).
- **Echo/debug server**: `node src/mcp/servers/Echo.js`
  - Simple JSON-RPC echo plus basic XMPP diagnostics.
- **SPARQL server**: `node src/mcp/servers/sparql-server.js`
  - SPARQL query/update for knowledge graphs.

## Recommended Configuration

Use explicit profiles and room IDs (avoid implicit defaults):
```
AGENT_PROFILE=mistral
MUC_ROOM=general@conference.your-domain
LOG_ROOM_JID=log@conference.your-domain
```

XMPP credentials live in `config/agents/secrets.json` (or `AGENT_SECRETS_PATH`).

## Client Setup Examples

### Claude Code / Claude Desktop

```bash
claude mcp add tia-chat node /path/to/tia/src/mcp/servers/tia-mcp-server.js
```

### Codex CLI

```bash
codex mcp add tia-chat --env TIA_ENV_PATH=/path/to/tia/.env -- node /path/to/tia/src/mcp/servers/tia-mcp-server.js
```

## Notes

- The MCP chat server joins the log room and writes verbose traces there.
- Use `roomJid` in `sendMessage` and `getRecentMessages` to target specific rooms.
