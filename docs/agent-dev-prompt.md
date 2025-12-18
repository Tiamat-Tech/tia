You are a coding agent updating tia-agents. Read the following files before making changes:
- `docs/agents.md` (capabilities and commands)
- `docs/testing.md` (env/tests)
- `docs/mcp.md` (MCP endpoints and XMPP debug)
- `docs/server.md` (systemd/runtime)
- `docs/debating-society.md` (Chair/Recorder behavior)
- `config/agents/*.json` for the agent you are modifying (XMPP creds, nick/resource, roomJid, provider settings)
- `src/agents/core/*` (agent runner, mention detector, command parser)
- Provider files under `src/agents/providers/*` relevant to the agent
- Start scripts (`start-all-agents.sh`, `start-debate-agents.sh`)
- The agent service file in `src/services/<agent>.js`

Procedure to create a new agent:
1) Add a profile file under `config/agents/<name>.json` with XMPP service/domain/username/password/resource and roomJid; keep secrets in `.env` (API keys/tokens only).
2) If you need a new behavior, add a provider under `src/agents/providers/` implementing `handle({command, content, metadata, ...})`.
3) Wire the agent entry point in `src/services/<name>.js` using `AgentRunner`, the provider, `createMentionDetector(nickname)`, and `defaultCommandParser`. Do not hardcode nick/resource; load from the profile.
4) Add a start script if needed or register the agent in `run-all-agents.js` with `AGENT_PROFILE=<name>`.
5) Update docs if behavior is user-facing; add tests where feasible (Vitest for profile loading/logic).
6) Ensure XMPP usernames/resources remain distinct; do not fall back to “bot”.
