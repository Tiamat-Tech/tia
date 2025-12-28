# MCP Integration Plan

Status: maintained; review after major changes.

> **Status**: Planning Phase
> **Updated**: 2025-02-14
> **Goal**: Add MCP client/server bridges for TIA agents and expose MCP capabilities via RDF profiles

## Overview

Implement two MCP bridges:
- **MCP Client Bridge**: TIA agent connects to MCP servers, loads tool metadata, and reflects capabilities into the agent profile (`vocabs/mcp-ontology.ttl`).
- **MCP Server Bridge**: TIA agent exposes core chat/Lingue facilities as MCP tools, backed by XMPP MUC operations.

For testing, create a **simple MCP server** that exposes a remote SPARQL store as tools and publishes endpoint metadata that the MCP client can ingest into a TIA profile.

## Design Principles

- Modular, DI-friendly classes in `src/mcp/`
- No direct coupling to XMPP internals; rely on thin adapters
- Profile metadata derives from MCP tool schemas (via `mcp-ontology.ttl`)
- Keep non-network logic testable with fixtures

---

## Phase 1: Planning & Vocabulary Mapping

**Objective**: Define RDF mapping from MCP tool metadata into TIA profiles.

**Work**:
- Review `vocabs/mcp-ontology.ttl` and define mapping rules.
- Draft profile extensions for MCP tool capabilities:
  - `mcp:Tool`
  - `mcp:hasTool`
  - `mcp:hasEndpoint`
  - `mcp:parameters` (as a literal or blank node)
- Identify how tool schemas map to RDF labels/description.

**Outputs**:
- Document mapping in this plan.
- Add helper functions stubbed in `src/mcp/`.

**Success Criteria**:
- Clear schema mapping for tool metadata → RDF profile fields.

**Mapping Notes**:
- MCP tools map to `profile.mcp.tools` entries with `{ name, description, inputSchema, endpoints }`.
- Endpoints come from tool `_meta.tia.endpoints` or `_meta.endpoints`, stored in `profile.mcp.endpoints`.
- Profile RDF adds `mcp:Client` type, `mcp:hasCapability`, and `mcp:providesTool` / `mcp:providesResource` / `mcp:providesPrompt` nodes.

---

## Phase 2: MCP Client Bridge

**Objective**: Create MCP client bridge that connects to an MCP server and exposes tools to TIA agent.

**Module Structure**:
```
src/mcp/
├── client-bridge.js      # MCP client wrapper
├── profile-mapper.js     # Tool metadata → RDF profile
├── tool-registry.js      # Normalize and store tool metadata
└── index.js
```

**Key Interfaces**:
```javascript
export class McpClientBridge {
  constructor({ client, profile, mapper, logger })
  async connect()
  async listTools()
  async callTool(name, args)
  async populateProfile()
}
```

**Integration Points**:
- `AgentProfile` gains `mcp` metadata section or uses `custom` namespace.
- `loadAgentProfile()` optionally merges MCP metadata from a server.

**Tests**:
- Mock MCP server and verify tool metadata mapping.

**Success Criteria**:
- Tool metadata parsed and stored.
- Client can call tools.

---

## Phase 3: MCP Server Bridge (TIA)

**Objective**: Expose TIA agent capabilities as MCP tools.

**Tools to Expose**:
- `sendMessage` (groupchat or direct)
- `fetchLingueSummary` (IBIS detection)
- `offerLingueMode` (initiate negotiation)
- `getProfile` (agent profile as Turtle)

**Module Structure**:
```
src/mcp/
├── server-bridge.js
├── tool-definitions.js
└── chat-adapter.js
```

**Integration Points**:
- XMPP adapter for sending messages
- Lingue negotiator hooks

**Tests**:
- Local MCP client calls against a mock XMPP adapter

**Success Criteria**:
- MCP server exposes tools and routes requests to XMPP/Lingue.

---

## Phase 4: SPARQL MCP Test Server

**Objective**: Provide a simple MCP server exposing SPARQL endpoints.

**Behavior**:
- Tools: `sparqlQuery`, `sparqlUpdate`
- Metadata: endpoint URLs added to tool schema and profile mapping
- Config: endpoints from env or config file

**Files**:
- `src/mcp/servers/sparql-server.js`
- `config/mcp/sparql.json` (or `.env`)

**Success Criteria**:
- MCP client lists SPARQL tools and stores endpoints in profile.

---

## Phase 5: Docs & Examples

**Objective**: Document usage for MCP client/server and SPARQL server test.

**Docs**:
- `docs/mcp-client.md`
- `docs/mcp-server.md`
- README update

**Examples**:
- `src/examples/mcp-client-demo.js`
- `src/examples/mcp-sparql-server.js`

---

## Progress Tracking

### Phase 1: Planning & Mapping ⬜
- [x] Review `vocabs/mcp-ontology.ttl`
- [x] Define RDF mapping for tool metadata
- [x] Add mapping notes to this plan

### Phase 2: MCP Client Bridge ⬜
- [x] Implement client bridge
- [x] Implement profile mapper
- [x] Implement tool registry
- [x] Add tests

### Phase 3: MCP Server Bridge (TIA) ⬜
- [x] Implement server bridge
- [x] Define tools and adapters
- [ ] Add tests

### Phase 4: SPARQL MCP Test Server ⬜
- [x] Implement SPARQL server
- [x] Configure endpoints
- [ ] Add tests

### Phase 5: Docs & Examples ⬜
- [x] Add MCP docs
- [x] Add examples
- [x] Update README

---

## Open Questions

1. Should MCP metadata be stored in `AgentProfile.custom` or as a first-class `mcp` property?
2. How should tool schemas map to RDF nodes (flattened vs. nested blank nodes)?
3. Should the MCP client auto-refresh tools on reconnect?
4. How to represent multiple MCP servers in a single TIA profile?
