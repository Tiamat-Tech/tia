# TIA
TIA Intelligence Agency

An experimental XMPP (Jabber) agent framework that combines chat, Lingue/IBIS structured dialogue, and MCP tool integrations into a modular Node.js codebase.

## What TIA Is

TIA is a set of composable building blocks for creating conversational agents that can:
- Participate in XMPP multi-user chats and direct messages.
- Negotiate Lingue language modes and exchange structured payloads.
- Act as MCP clients (discovering tools/resources from servers).
- Act as MCP servers (exposing chat and Lingue tools to external clients).

The design goal is a clean, library-ready architecture that supports both deployable bots and reusable modules.

## Key Concepts

- **XMPP room agents**: long-running bots anchored in MUC rooms.
- **Lingue protocol**: language-mode negotiation + structured payloads (IBIS, Prolog, profiles).
- **MCP bridges**: MCP client and server adapters for tool discovery and exposure.
- **Profiles (RDF)**: agent capabilities live in RDF profiles with shared vocabularies.

## Start Here (Docs)

- [Agent capabilities & commands](docs/agents.md)
- [Lingue integration](docs/lingue-integration.md)
- [MCP client guide](docs/mcp-client.md)
- [MCP server guide](docs/mcp-server.md)
- [API reference](docs/api-reference.md)
- [Testing & env](docs/testing.md)
- [Server deployment](docs/server.md)
- [Debate/Chair/Recorder notes](docs/debating-society.md)
- [Lingue ontology & protocol specs](https://danja.github.io/lingue/)

## Architecture At A Glance

- `src/agents` — AgentRunner, providers, and profile system.
- `src/lib` — XMPP helpers, Lingue utilities, logging, RDF tools.
- `src/mcp` — MCP client/server bridges and test servers.
- `config/agents/*.ttl` — RDF profiles describing each agent.
- `docs/` — integration guides and operational docs.

## Implemented Agents

- **Mistral** — AI chat agent backed by Mistral API with Lingue/IBIS summaries.
- **Semem** — MCP-backed knowledge agent for `tell/ask/augment` flows.
- **Demo** — Minimal chat bot for quick XMPP smoke checks.
- **Chair** — Debate facilitator/Moderator agent.
- **Recorder** — Meeting logger/recorder agent that listens broadly.
- **Prolog** — Logic agent using tau-prolog for queries.
- **MCP Loopback** — MCP client/server echo agent for integration tests.

## Library Usage

```javascript
import { AgentRunner, LingueNegotiator, LINGUE, Handlers } from "tia-agents";

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({ profile, provider, negotiator });
await runner.start();
```

See [examples/minimal-agent.js](examples/minimal-agent.js) for a runnable local example.

## Installation & Running

Installation, configuration, and run scripts are documented in:
- [Testing](docs/testing.md)
- [Server](docs/server.md)
- [MCP Server](docs/mcp-server.md)
