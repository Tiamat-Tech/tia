# Agents Overview

Status: updated for planning polls, log-room traces, and the current roster.

This page is for users first, then operators. It covers what each bot can do in chat, how to address it, and how to run it. For the full list of profiles, see `docs/agent-roster.md`.

## What each bot can do (in the MUC or DMs)

### Coordinator
- Orchestrates planning polls and routes `Q:` questions to logic, consensus, or Golem-role workflows.
- Starts MFR sessions and assembles final solutions (plus route metadata).

### Chair
- Moderates debate sessions and requests Position/Support/Objection.
- Keeps consensus workflows structured and prompts for explicit positions.

### Recorder
- Logs verbose traces and minutes to the log room.

## Custom agent API
- For building your own agent with the library API, see `docs/agent-dev-prompt.md` and `examples/minimal-agent.js`.

### Mistral Bot
- Mention it: `MistralBot, how do I ...?`, `bot: ...`, or `@mistralbot`.
- Replies with LLM answers (1–3 sentences, friendly).
- Lingue/IBIS: when Lingue is enabled (default), it detects Issues/Positions/Arguments and posts short IBIS summaries if confidence is high.
- Profiles: `mistral` (default), `mistral-analyst`, `mistral-creative` via `AGENT_PROFILE`.

### Semem Agent
- Mention it: `Semem, ...` (comma/colon supported) or DM.
- Semem verbs (explicit triggers):
  - `Semem tell <text>` → store via `/tell`.
  - `Semem ask <question>` → query via `/ask`.
  - `Semem augment <text>` → extract concepts via `/augment`.

### MFR Semantic Agent
- Role: extract constraints and domain rules for Model-First Reasoning sessions.
- Listens for MFR `ModelContributionRequest` in Lingue `ModelNegotiation` mode.
- Responds with RDF constraints in Lingue `ModelFirstRDF` mode.
  - Default mention/DM → `/chat/enhanced`, then auto-store the exchange via `/tell`.
- Lingue/IBIS: responds to mentions like Mistral when Lingue is enabled (IBIS summaries when confidence is high).

### MCP Debug Agent
- Not a chatty bot; used for diagnostics.
- MCP verbs exposed: `initialize`, `echo`, `xmppStatus` (reports connection + last message), `xmppSend` (posts a test message to the MUC).

### MCP Loopback Agent
- Echoes MCP calls back into the system for integration testing.
- Useful for validating MCP tool wiring and request/response flow.

### Demo Bot
- Simple canned/demo responses; no external API.

### Data Agent
- Mention it: `Data, ...` (comma/colon supported) or DM.
- Query modes:
  - `Data query: <entity>` → lookup entity facts from SPARQL endpoint (Wikidata by default).
  - `Data sparql: <query>` → execute direct SPARQL query.
  - `Data, <natural language question>` → extracts entity with Mistral, then queries.
- Returns human-friendly summaries instead of raw JSON.
- Lingue/SPARQL: supports `lng:SparqlQuery` mode for agent-to-agent SPARQL exchange.
- Fully configurable via RDF profile - can be adapted to any SPARQL endpoint (DBpedia, local triplestores, etc.).
- See [Data Agent Guide](data-agent.md) for detailed documentation.

### Prolog Agent
- Logic solver using tau-prolog; responds to logic-flavored MFR sessions.
- Emits Prolog programs to the log room for debugging.

### Executor Agent
- Converts high-level plan statements into executable Prolog action programs.

### Golem Agent
- Adaptive role player used for domain- or logic-specific reasoning.
- Can be assigned a logic-focused role during planning polls.

### GroqBot
- LLM chat agent backed by Groq APIs.

## Running the bots

Common XMPP env (put in `.env` or RDF profiles):
```
XMPP_SERVICE=xmpp://your-host:5222     # or xmpps://... with NODE_TLS_REJECT_UNAUTHORIZED=0
XMPP_DOMAIN=your-domain
MUC_ROOM=general@conference.your-domain
LOG_ROOM_JID=log@conference.your-domain
XMPP_RESOURCE=...                      # optional; defaults to bot nickname
```
Ensure the log room exists on the XMPP server (create it once and reuse it).

XMPP passwords live in `config/agents/secrets.json` (ignored by git). Override the path
with `AGENT_SECRETS_PATH` if needed.

### Mistral Bot
- Start: `./start-mistral-bot.sh`
- Env: `MISTRAL_API_KEY` (required), `BOT_NICKNAME` (default `MistralBot`), `MISTRAL_MODEL` (default `mistral-small-latest`).
- Auto-renames on nickname conflict by appending a short suffix.

### Semem Agent
- Start: `./start-semem-agent.sh`
- Env:
  - `SEMEM_BASE_URL` (default `https://mcp.tensegrity.it`)
  - `SEMEM_AUTH_TOKEN` if needed
  - `SEMEM_HTTP_TIMEOUT_MS` (default 8000) timeout for Semem HTTP calls
  - `SEMEM_NICKNAME` (default profile) or `SEMEM_LITE_NICKNAME` (lite profile)
  - `AGENT_NICKNAME` (one-off override), `AGENT_RESOURCE` (resource override)
  - `AGENT_PROFILE` (`default` or `lite`) toggles feature flags (Wikipedia/Wikidata)
- Auto-renames on nickname conflict (short suffix, limited retries).

### MCP Debug Agent
- Start: `node src/mcp/servers/Echo.js` (or via npx from the package)
- Env: same XMPP vars; `MCP_BOT_NICKNAME` sets nickname/resource.
- Auto-renames on conflict.

### Demo Bot
- Start: `./start-demo-bot.sh`
- Env: `BOT_NICKNAME` (default `DemoBot`), uses XMPP vars.

### Data Agent
- Start: `./start-data-agent.sh`
- Env:
  - `MISTRAL_API_KEY` (optional, for natural language entity extraction)
  - `AGENT_PROFILE` (default `data`) - use different profiles for different SPARQL endpoints
  - Standard XMPP vars from profile
- SPARQL endpoint and other config defined in RDF profile (`config/agents/data.ttl`)
- See [Data Agent Guide](data-agent.md) for query modes and configuration.

## Running multiple agents
- `./start-all-agents.sh` spawns all known agents (Semem, Mistral variants, Demo, Data, Prolog, Chair, Recorder). Use distinct nicknames/resources to avoid MUC confusion, e.g.:
  ```
  BOT_NICKNAME=Mistral1
  SEMEM_NICKNAME=Semem1
  MCP_BOT_NICKNAME=McpDebug1
  XMPP_RESOURCE / AGENT_RESOURCE set per agent
  ```
- Or run start scripts individually with tailored env.

## Testing
- Unit tests: `npm test`
- Integration (XMPP + bots, opt-in for Semem): `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration`
  - Mistral bot test runs when `MISTRAL_API_KEY` is set (skip with `RUN_MISTRAL_BOT_TEST=false`).
  - Semem bot test runs only when `RUN_SEMEM_BOT_TEST=true` (requires Semem endpoint).
