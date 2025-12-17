# Agents Overview

This repository provides several XMPP agents/bots. Each has its own startup script and capabilities. Configure them via `.env` (see `docs/testing.md` for details).

## Common XMPP settings (env)
```
XMPP_SERVICE=xmpp://your-host:5222     # or xmpps://... with NODE_TLS_REJECT_UNAUTHORIZED=0
XMPP_DOMAIN=your-domain
XMPP_USERNAME=your-user
XMPP_PASSWORD=your-pass
MUC_ROOM=general@conference.your-domain
XMPP_RESOURCE=...                      # optional; defaults to bot nickname
```

## Agents

### Mistral Bot
- **Script**: `src/services/mistral-bot.js`
- **Start**: `./start-mistral-bot.sh`
- **Env**:
  - `MISTRAL_API_KEY` (required)
  - `BOT_NICKNAME` (default `MistralBot`)
  - `MISTRAL_MODEL` (default `mistral-small-latest`)
- **Behavior**: Joins the MUC, responds when mentioned (`nickname`, `bot:`, `@mistralbot`) or in DMs using the Mistral API.

### Semem Agent
- **Script**: `src/services/semem-agent.js`
- **Start**: `./start-semem-agent.sh`
- **Env**:
  - `SEMEM_BASE_URL` (default `https://mcp.tensegrity.it`)
  - `SEMEM_AUTH_TOKEN` (if required)
  - `SEMEM_NICKNAME` (default profile name) or `SEMEM_LITE_NICKNAME` (lite profile)
  - `AGENT_NICKNAME` (one-off override), `AGENT_RESOURCE` (resource override)
  - `AGENT_PROFILE` (`default` or `lite`), toggles feature flags (Wikipedia/Wikidata)
- **Triggers in MUC/DM**:
  - `Semem tell <text>`: calls `/tell` to store content with metadata.
  - `Semem ask <question>`: calls `/ask` with context.
  - `Semem augment <text>`: calls `/augment`.
  - Default (mention): calls `/chat/enhanced`, replies, then stores the interaction via `/tell`.

### MCP Debug Agent
- **Script**: `src/mcp/servers/Echo.js`
- **Start**: `node src/mcp/servers/Echo.js` (or via npx from the package)
- **Env**:
  - Uses the same XMPP vars; `MCP_BOT_NICKNAME` sets its nickname/resource.
- **Capabilities**:
  - MCP methods: `initialize`, `echo`, `xmppStatus` (reports connection + last message), `xmppSend` (posts a test message to the MUC).
  - Useful for connectivity debugging.

### Demo Bot
- **Script**: `src/services/demo-bot.js`
- **Start**: `./start-demo-bot.sh`
- **Env**: `BOT_NICKNAME` (default `DemoBot`), uses XMPP vars.
- **Behavior**: Simple demo responses (no external API).

## Running multiple agents
- Use `./start-all-agents.sh` to spawn semem, mistral, and demo under one supervisor. Set distinct nicknames/resources per agent to avoid MUC confusion:
  ```
  BOT_NICKNAME=Mistral1
  SEMEM_NICKNAME=Semem1
  MCP_BOT_NICKNAME=McpDebug1
  XMPP_RESOURCE (or AGENT_RESOURCE) to match each nickname
  ```
- Alternatively, run agents individually with their start scripts and tailored env.

## Testing
- Unit tests: `npm test`
- Integration (XMPP + bots, opt-in for Semem): `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration`
  - Mistral bot test runs when `MISTRAL_API_KEY` is set (skip with `RUN_MISTRAL_BOT_TEST=false`).
  - Semem bot test runs only if `RUN_SEMEM_BOT_TEST=true` (requires Semem endpoint). Set `SEMEM_NICKNAME`/`AGENT_NICKNAME` as needed.
