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
- **Profiles (RDF)**: agent capabilities live in RDF profiles with shared vocabularies (Mistral variants inherit from `mistral-base`).

## Start Here (Docs)

- [Agent Startup Guide](AGENT_STARTUP_GUIDE.md) - **Start here!** Unified script for starting agents
- [Agent capabilities & commands](docs/agents.md)
- [Data Agent guide](docs/data-agent.md) - SPARQL knowledge queries (Wikidata, DBpedia, custom endpoints)
- [Auto-connect & credentials](docs/auto-registration.md) - Automatic credential loading and connection
- [Lingue integration](docs/lingue-integration.md)
- [MCP client guide](docs/mcp-client.md)
- [MCP server guide](docs/mcp-server.md)
- [MFR Room Setup](MFR_ROOM_SETUP.md) - Model-First Reasoning multi-room configuration (**requires Prosody setup**)
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
- `config/agents/secrets.json` — local XMPP passwords keyed by profile (ignored in git).
- `docs/` — integration guides and operational docs.

## Implemented Agents

- **Coordinator** — MFR (Model-First Reasoning) orchestrator for multi-agent problem solving.
- **Mistral** — AI chat agent backed by Mistral API with Lingue/IBIS summaries.
- **Semem** — MCP-backed knowledge agent for `tell/ask/augment` flows.
- **Data** — SPARQL knowledge query agent for Wikidata, DBpedia, and custom endpoints. [Guide](docs/data-agent.md)
- **Demo** — Minimal chat bot for quick XMPP smoke checks.
- **Chair** — Debate facilitator/Moderator agent.
- **Recorder** — Meeting logger/recorder agent that listens broadly.
- **Prolog** — Logic agent using tau-prolog for queries.
- **MCP Loopback** — MCP client/server echo agent for integration tests.

## Quick Start: Running Agents

The `start-all.sh` script provides a unified way to start all agents or specific subsets:

```bash
# Start all available agents
./start-all.sh

# Start MFR (Model-First Reasoning) system
./start-all.sh mfr

# Start debate system
./start-all.sh debate

# Start basic agents
./start-all.sh basic

# Custom agent selection
AGENTS=mistral,data,prolog ./start-all.sh

# Get help
./start-all.sh help
```

**Prerequisites:**
1. Configure `.env` file with API keys (see `.env.example`)
2. Create `config/agents/secrets.json` with XMPP passwords
3. For MFR system: Configure Prosody MUC rooms (see [MFR Room Setup](MFR_ROOM_SETUP.md))

**Agent Presets:**
- `mfr` - MFR system (full suite): coordinator, mistral, analyst, creative, chair, recorder, semem, data, prolog, demo
- `debate` - Debate system: chair, recorder, mistral, analyst, creative
- `basic` - Basic agents: mistral, data, prolog, demo

The script automatically:
- Loads `.env` file
- Checks for required API keys
- Skips agents with missing credentials
- Provides restart on crash
- Handles graceful shutdown (SIGTERM/SIGINT)

## Library Usage

```javascript
import { AgentRunner, LingueNegotiator, LINGUE, Handlers, InMemoryHistoryStore } from "tia-agents";

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({
  profile,
  provider,
  negotiator,
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});
await runner.start();
```

See [examples/minimal-agent.js](examples/minimal-agent.js) for a runnable local example.

## NPM Package Usage

TIA is published as `tia-agents` on npm and supports two approaches to creating bots:

### Quick Start

```bash
npm install tia-agents
```

For a minimal, npm-packaged Mistral bot starter, see `mistral-minimal/README.md`.
If you're using the Mistral provider, install the peer dependency and ensure the API key env var referenced in your profile is set (default: `MISTRAL_API_KEY`).
If you want auto-registration, omit `xmpp:passwordKey` from the profile and set `autoRegister: true` when creating the agent.

### Approach 1: Config-Driven (Profile Files)

Create profile files and use the factory function:

```javascript
import { createAgent, DemoProvider } from "tia-agents";

// Load from config/agents/mybot.ttl
const runner = await createAgent("mybot", new DemoProvider());
await runner.start();
```

Profile file (`config/agents/mybot.ttl`):
```turtle
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .

<#mybot> a agent:ConversationalAgent ;
  agent:xmppAccount [
    xmpp:service "xmpp://localhost:5222" ;
    xmpp:domain "xmpp" ;
    xmpp:username "mybot" ;
    xmpp:passwordKey "mybot"
  ] ;
  agent:roomJid "general@conference.xmpp" .
```

### Approach 2: Programmatic (No Config Files)

Configure everything in code:

```javascript
import { createSimpleAgent, DemoProvider } from "tia-agents";

const runner = createSimpleAgent({
  xmppConfig: {
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "mybot",
    password: "secret"
  },
  roomJid: "general@conference.xmpp",
  nickname: "MyBot",
  provider: new DemoProvider()
});

await runner.start();
```

### Creating Custom Providers

Extend `BaseProvider` to implement your own logic:

```javascript
import { BaseProvider } from "tia-agents";

class MyProvider extends BaseProvider {
  async handle({ command, content, metadata }) {
    if (command !== "chat") return null;
    return `You said: ${content}`;
  }
}

const runner = createSimpleAgent({
  // ... config
  provider: new MyProvider()
});
```

### AI-Powered Bots

Install peer dependency:
```bash
npm install @mistralai/mistralai
```

Use MistralProvider:
```javascript
import { createAgent, InMemoryHistoryStore } from "tia-agents";
import { MistralProvider } from "tia-agents/providers/mistral";

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});

const runner = await createAgent("aibot", provider);
await runner.start();
```

### Templates & Examples

Copy templates to get started:
```bash
cp -r node_modules/tia-agents/templates/* ./
```

See templates for:
- Profile file examples (`.ttl`)
- Provider templates (simple & LLM patterns)
- Runnable example scripts

### Documentation

- 📚 [Quick Start Guide](docs/quick-start.md) - Detailed getting started guide
- 🔧 [Provider Guide](docs/provider-guide.md) - Creating custom providers
- 📖 [API Reference](docs/api-reference.md) - Complete API documentation
- 📁 [Templates](templates/) - Example configurations and code

## Custom Agent API

For a fuller walkthrough and profile-driven setup, see:
- [Agent developer prompt](docs/agent-dev-prompt.md)
- [Minimal agent example](examples/minimal-agent.js)

## Installation & Running

Quick start - see [Agent Startup Guide](AGENT_STARTUP_GUIDE.md) for complete instructions.

Additional documentation:
- [Agent Startup Guide](AGENT_STARTUP_GUIDE.md) - **Main guide for starting agents**
- [Testing](docs/testing.md)
- [Server](docs/server.md)
- [MCP Server](docs/mcp-server.md)
- [MFR Room Setup](MFR_ROOM_SETUP.md) - **Requires Prosody MUC configuration** for persistent rooms
