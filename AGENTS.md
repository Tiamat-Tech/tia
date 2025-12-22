# Repository Guidelines

## Project Structure & Modules
- `src/services`: Long-running bots (`mistral-bot.js`, `demo-bot.js`, `prolog-agent.js`, `mcp-loopback-agent.js`) started via the helper shell scripts.
- `src/examples`: Task-focused scripts for XMPP setup, MUC creation, and message flow testing; runnable directly with `node`.
- `src/lib`: Connection utilities for XMPP plus logging helpers; keep shared logic here.
- `src/client`: CLI REPL for interactive chats during manual verification.
- `src/mcp`: Model Context Protocol client/server bridges and test servers; integrations belong here.
- `docs`, `_README.md`, `README.md`: Reference material; mirror new behavior in `README.md`.

## Setup, Build, and Run
- Install deps: `npm install`.
- Start AI bot: `./start-mistral-bot.sh` (requires `.env` with `MISTRAL_API_KEY`, optional `XMPP_*` overrides).
- Start demo bot (no API key): `./start-demo-bot.sh`.
- Start Prolog agent: `AGENT_PROFILE=prolog node src/services/prolog-agent.js`.
- Start MCP loopback agent: `AGENT_PROFILE=mcp-loopback MCP_LOOPBACK_MODE=in-memory node src/services/mcp-loopback-agent.js`.
- Create MUC room: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/create-muc-room.js`.
- REPL client: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js <user> <pass>`.
- Example smoke tests: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-bot-interaction.js`. `npm test` runs unit and integration fixtures.

## Coding Style & Naming
- Node ESM (`type: "module"`); prefer `import`/`export` and avoid new CommonJS (refactor existing CJS when touched).
- Use async/await for I/O; keep logging terse via `src/lib/logger.js`.
- Two-space indentation, single-responsibility modules, and descriptive function names (`joinMUC`, `handleStanza`).
- Environment-driven config defaults live near the top of each file; keep new defaults together.
- There should be no defaults or fallbacks in the code, the parameters should be loaded from RDF profiles or secrets.json file (local to this app) or .env in the case of remote services
## Testing Guidelines
- `npm test` runs the current unit and integration test set.
- Favor runnable example scripts per feature alongside Vitest coverage.
- Name new checks after the scenario (`test-muc-joins.js`, `test-bot-interaction.js`) and place beside other examples.
- When adding behavior, supply a minimal reproduction script and expected output notes in comments or `docs/`.

## Commit & Pull Request Guidelines
- Follow the existing short imperative style seen in `git log` (e.g., `add muc helper`, `fix xmpp reconnect`); keep subjects under ~60 chars.
- One logical change per commit; include rationale in the body when behavior changes.
- PRs should state scope, how to run or reproduce, config/env needed, and screenshots or logs for UX-visible changes.

## Security & Configuration Tips
- Local Prosody uses self-signed TLS; prepend commands with `NODE_TLS_REJECT_UNAUTHORIZED=0` when connecting locally only.
- Keep API keys/tokens in `.env` (e.g., `MISTRAL_API_KEY`, `MUC_ROOM`, `BOT_NICKNAME`); keep XMPP passwords in `config/agents/secrets.json` (gitignored).
- When adding new services, thread configuration through env vars and document defaults in `README.md` and the relevant module header.
