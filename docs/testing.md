# Testing Guide

This repository has two layers of tests:
- **Node unit tests** (fast, offline): `npm test`
- **Live XMPP integration tests** (exercise XMPP MUC and optional bots): `npm run test:integration`

## Prerequisites
- Node.js installed
- XMPP server reachable with a MUC room you can join
- `.env` file with XMPP credentials and room details

Example `.env` (self-signed TLS example):
```
NODE_TLS_REJECT_UNAUTHORIZED=0          # only if your XMPP TLS is self-signed
XMPP_SERVICE=xmpp://tensegrity.it:5222  # or xmpps://... if TLS-only
XMPP_DOMAIN=tensegrity.it
XMPP_USERNAME=dogbot
XMPP_PASSWORD=woofwoof
MUC_ROOM=general@conference.tensegrity.it

# Optional for bots under test
MISTRAL_API_KEY=...                     # required to test the Mistral bot
SEMEM_BASE_URL=https://mcp.tensegrity.it
SEMEM_AUTH_TOKEN=...                    # if your Semem endpoint needs auth
SEMEM_NICKNAME=SememTest                # optional nickname for Semem agent
MCP_BOT_NICKNAME=McpDebug               # nickname for MCP debug agent (if using)
```

> Tip: If your `.env` lives elsewhere, set `TIA_ENV_PATH=/path/to/.env` before running tests.

## Running the tests
Install deps once:
```
npm install
```

Unit tests (offline):
```
npm test
```

XMPP integration (live server required):
```
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration
```

### What the integration tests do
- `test/xmpp.integration.test.js`: joins the MUC with a transient nickname, posts a message, and confirms it is observed (self-messages allowed in the test).
- `test/xmpp.bots.integration.test.js`: joins the MUC and optionally spawns bots, then mentions them and waits for replies:
  - **Mistral bot**: runs when `MISTRAL_API_KEY` is set (skip with `RUN_MISTRAL_BOT_TEST=false`).
  - **Semem agent**: runs only if `RUN_SEMEM_BOT_TEST=true` (assumes Semem endpoint reachable). Uses `SEMEM_NICKNAME` or `AGENT_NICKNAME` if provided.

Both tests reuse the shared `XmppRoomAgent` helper and honor the same `.env` values.

### Environment gating for bot tests
Set these only when you want to exercise the bots:
```
# Mistral bot test (on by default if key is present)
MISTRAL_API_KEY=...
RUN_MISTRAL_BOT_TEST=true   # default; set to false to skip

# Semem agent test (opt-in)
RUN_SEMEM_BOT_TEST=true
SEMEM_BASE_URL=https://mcp.tensegrity.it
SEMEM_AUTH_TOKEN=...        # if required
SEMEM_NICKNAME=SememTest    # optional override
```

### Expected behavior and timeouts
- The integration tests give bots a few seconds to join the MUC and up to ~15s to respond after being pinged.
- If you see timeouts, verify:
  - XMPP host/port/domain/room are correct.
  - The MUC echoes messages back to the sender (needed for the self-observe test).
  - Bots have their required env (e.g., `MISTRAL_API_KEY`, `SEMEM_BASE_URL`/token).
  - Certificates: add `NODE_TLS_REJECT_UNAUTHORIZED=0` for self-signed TLS.

### Troubleshooting checklist
- `host-unknown` or no join: confirm `XMPP_SERVICE` (correct protocol/port), `XMPP_DOMAIN`, and MUC host (e.g., `conference.<domain>`).
- No bot reply: ensure the bot started (logs in test output), nickname matches, and required keys/URLs are set.
- TLS failures: add `NODE_TLS_REJECT_UNAUTHORIZED=0` when using `xmpps://` with self-signed certs.

## Quick commands
- Run only unit tests: `npm test`
- Run only XMPP integration: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration`
- Skip Mistral bot test: `RUN_MISTRAL_BOT_TEST=false npm run test:integration`
- Enable Semem bot test: `RUN_SEMEM_BOT_TEST=true npm run test:integration`
