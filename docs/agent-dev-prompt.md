You are a coding agent updating tia-agents. Read the following files before making changes:
- `docs/agents.md` (capabilities and commands)
- `docs/testing.md` (env/tests)
- `docs/mcp.md` (MCP endpoints and XMPP debug)
- `docs/server.md` (systemd/runtime)
- `docs/debating-society.md` (Chair/Recorder behavior)
- `config/agents/*.ttl` for the agent you are modifying (XMPP creds, nick/resource, roomJid, provider settings)
- `vocabs/lingue.ttl` for Lingue vocabulary references
- `src/agents/core/*` (agent runner, mention detector, command parser)
- Provider files under `src/agents/providers/*` relevant to the agent
- Start scripts (`start-all-agents.sh`, `start-debate-agents.sh`)
- The agent service file in `src/services/<agent>.js`
- `src/lib/history/*` if you need per-agent conversation context

Procedure to create a new agent:
1) Add a profile file under `config/agents/<name>.ttl` with XMPP service/domain/username/passwordKey/resource and roomJid; keep XMPP passwords in `config/agents/secrets.json` and API keys/tokens in `.env`.
2) If you need a new behavior, add a provider under `src/agents/providers/` implementing `handle({command, content, metadata, ...})`.
3) Wire the agent entry point in `src/services/<name>.js` using `AgentRunner`, the provider, `createMentionDetector(nickname)`, and `defaultCommandParser`. Do not hardcode nick/resource; load from the profile.
4) If the agent is Lingue-capable, add `LingueNegotiator` + handlers based on `profile.supportsLingueMode()` and pass `negotiator` into the runner.
5) Add a start script if needed or register the agent in `run-all-agents.js` with `AGENT_PROFILE=<name>`.
6) Update docs if behavior is user-facing; add tests where feasible (Vitest for profile loading/logic).
7) Ensure XMPP usernames/resources remain distinct; do not fall back to "bot".

Lingue checklist:
- Add `lng:supports`, `lng:prefers`, and `lng:profile` to the agent profile.
- Use `LingueNegotiator` in the service file with handlers for supported modes.
- Keep MUC messages human-readable via `summary` in structured payloads.

## Custom Agent API (library usage)
Minimal setup using the exported API:
```javascript
import {
  AgentRunner,
  loadAgentProfile,
  createMentionDetector,
  LingueNegotiator,
  LINGUE,
  Handlers,
  InMemoryHistoryStore
} from "tia-agents";

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const profile = await loadAgentProfile("demo");
const xmppConfig = profile.toConfig().xmpp;

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({
  xmppConfig,
  roomJid: profile.roomJid,
  nickname: profile.nickname,
  provider: new EchoProvider(),
  negotiator,
  mentionDetector: createMentionDetector(profile.nickname),
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});

await runner.start();
```

Notes:
- Profiles are RDF-based; see `config/agents/*.ttl` and `config/agents/secrets.json`.
- For Mistral providers, pass `historyStore` into the provider to keep context across API calls.
