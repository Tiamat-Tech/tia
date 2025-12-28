# Architecture Overview

Status: maintained; review after major changes.

This document summarizes the system architecture, agent lifecycle, and configuration model.

## Core Components

- **AgentRunner** (`src/agents/core/agent-runner.js`): Connects to XMPP, joins rooms, and routes messages to a provider. It enforces mention detection, agent round limits, and command parsing.
- **Providers** (`src/agents/providers/*.js`): Implement `handle()` (or similar) for agent behavior. Some providers are plain classes, some extend `BaseProvider` or `BaseLLMProvider`.
- **Profiles** (`config/agents/*.ttl`): RDF profiles define XMPP accounts, rooms, Lingue modes, capabilities, and agent config.
- **Lingue** (`src/lib/lingue/*`): Handles structured payloads (model negotiation, RDF, SHACL, IBIS, etc.).
- **MFR** (`src/lib/mfr/*`): Model-First Reasoning protocol, state machine, and multi-room orchestration.

## Runtime Flow

1. **Load profile** via `loadAgentProfile()`, merge with base profiles if any.
2. **Build config** from profile (`profile.toConfig()`).
3. **Create provider** with required dependencies (LLM clients, validators, bridges).
4. **Start AgentRunner** to connect to XMPP and process messages.
5. **Handle messages** with `commandParser` → provider `handle()` → optional Lingue mode handlers.

## Dependency Injection

TIA uses lightweight dependency injection:

- Providers accept dependencies via constructor arguments (logger, LLM client, model store, validator, negotiator, etc.).
- `AgentRunner` is constructed with a provider instance, negotiator, command parser, and room config.
- Profiles are loaded at runtime; system behavior shifts by changing `config/agents/*.ttl`.

There is no global IoC container; DI is explicit and composed in each `src/services/*-agent.js` entrypoint.

## Inheritance & Base Classes

- `BaseProvider` is a minimal base with `handle()` contract (`src/agents/providers/base-provider.js`).
- `BaseLLMProvider` wraps LLM client logic and is extended by `MistralProvider` and `GroqProvider`.
- Many providers are plain classes with `handle()` or task-specific methods; inheritance is used sparingly.

## Configuration Model

- **XMPP credentials** are stored in `config/agents/secrets.json` (gitignored).
- **Agent profiles** are RDF Turtle files under `config/agents/`.
- **Runtime config** is derived from profiles; avoid hard-coded defaults in services.
- Environment variables are used for remote service API keys.

## MCP Loopback

The MCP Loopback agent (`src/services/mcp-loopback-agent.js`) runs a client bridge against a local echo MCP server for integration testing. It can run in-memory or via stdio transport and is configured by the `mcp-loopback.ttl` profile.
