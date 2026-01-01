# TIA Documentation

Status: maintained; review after major changes.

**TIA (The Intelligence Agency)** is an experimental multi-agent system built on open standards: XMPP for messaging, RDF for knowledge representation, and semantic protocols for inter-agent coordination. The system implements Model-First Reasoning (MFR), where specialized agents collaboratively construct explicit problem models before generating solutions.

**Key features:**
- 🤖 Multiple specialized AI agents (Mistral, Prolog, Data, Semantic)
- 📊 RDF-based knowledge representation and SHACL validation
- 🔄 Lingue protocol for language mode negotiation
- 🌐 XMPP/Jabber for federated, real-time communication
- 🔧 Model Context Protocol (MCP) integration
- ✅ Constraint-based reasoning with verifiable solutions
- 🧭 Planning polls that route questions to logic, consensus, or adaptive roles
- 🧾 Verbose traces sent to a dedicated log room

**Quick links:**
- 💬 [TIA Live Chat](https://tensegrity.it/chat/) - Join `general@conference.tensegrity.it`
- 🐙 [GitHub Repository](https://github.com/danja/tia)
- 📖 [Lingue Protocol Specification](https://danja.github.io/lingue/)

---

## 🚀 Getting Started

- **[Quick Start Guide](quick-start.md)** - Get up and running with TIA agents
- **[MFR Quick Start](mfr-quick-start.md)** - Model-First Reasoning system setup
- **[Agent Roster](agent-roster.md)** - All agent profiles at a glance
- **[Agent Overview](agents.md)** - Capabilities and commands for each agent
- **[System Architecture](architecture.md)** - Agent runtime, profiles, and DI overview
- **[Log Room Notes](log-room-migration.md)** - How verbose traces are handled

## 🏗️ Model-First Reasoning (MFR)

The core innovation of TIA: explicit model construction before reasoning.

### Core Documentation
- **[MFR Architecture Overview](mfr-architecture-overview.md)** - Four-phase problem solving workflow
- **[MFR Usage Guide](mfr-usage-guide.md)** - Practical guide to using MFR
- **[MFR API Reference](mfr-api-reference.md)** - Complete API documentation
- **[MFR Agent Contracts](mfr-agent-contracts.md)** - Expected agent behaviors

### Agent Contracts
Individual specifications for each MFR agent:
- **[Coordinator Agent](coordinator-agent-contract.md)** - Orchestrates the MFR protocol
- **[Data Agent](data-agent-contract.md)** - Wikidata/DBpedia knowledge grounding
- **[Mistral Agent](mistral-agent-contract.md)** - NLP entity extraction and explanation
- **[Prolog Agent](prolog-agent-contract.md)** - Logical reasoning and plan generation
- **[MFR Semantic Agent](mfr-semantic-agent-contract.md)** - Constraint identification
- **[Semem Agent](semem-agent-contract.md)** - Knowledge base integration

### Testing & Room Setup
- **[MFR Room Creation & Testing](mfr-room-creation-testing.md)** - Prosody MUC configuration

### Experimental Features
- **[MFR Debate Integration](mfr-debate-integration.md)** ✅ - Tool selection through structured dialogue (Phase 1 complete, enabled by default in `config/agents/coordinator.ttl`)
- **[MFR Debate Requirements](mfr-debate-agent-requirements.md)** - Implementation requirements ensuring zero breaking changes

## 🔌 Integration Protocols

### Lingue Protocol
Language mode negotiation for multi-agent communication:
- **[Lingue Integration](lingue-integration.md)** - How agents negotiate communication modes
- **[IBIS Structured Dialogue](ibis.md)** - Issue-Based Information System vocabulary
- **[Lingue Development Plan](LINGUE-PLAN.md)** - Protocol development roadmap

### Model Context Protocol (MCP)
Integration with external tools and services:
- **[MCP Overview](mcp.md)** - Model Context Protocol introduction
- **[MCP Server Guide](mcp-server.md)** - Exposing TIA as an MCP server
- **[MCP HTTP Server](mcp-http.md)** - Streamable HTTP endpoint details
- **[MCP Client Guide](mcp-client.md)** - Consuming external MCP services
- **[MCP Development Plan](MCP-PLAN.md)** - MCP integration roadmap

## 🛠️ Development & Customization

- **[Agent Development Guide](agent-dev-prompt.md)** - Creating new agents
- **[Provider Guide](provider-guide.md)** - Building custom agent providers
- **[API Reference](api-reference.md)** - Core API documentation
- **[Auto-Registration](auto-registration.md)** - Automatic credential management
- **[Testing Guide](testing.md)** - Running tests and validation

## 📚 Specialized Topics

- **[Data Agent Deep Dive](data-agent.md)** - SPARQL queries, Wikidata integration
- **[Debating Society](debating-society.md)** - Chair, Recorder, and structured debates
- **[Server Deployment](server.md)** - Production deployment considerations
- **[TBox Note](tbox-note.md)** - Ontology design notes

## 📝 Blog Posts & Updates

Archived updates live in `docs/archive/` (see Archive section).

## 🔧 Internal Documentation

Planning documents and development notes:
- Internal planning notes were moved to the archive.

---

## Documentation Organization

This documentation is organized hierarchically:

1. **Getting Started** - For new users and quick setup
2. **MFR System** - Core multi-agent reasoning documentation
3. **Integration Protocols** - Lingue and MCP integration guides
4. **Development** - For developers extending TIA
5. **Specialized Topics** - Deep dives into specific components
6. **Blog/Updates** - Progress reports and announcements

## Contributing

TIA is open source and welcomes contributions. See the [GitHub repository](https://github.com/danja/tia) for issues, pull requests, and development discussion.

## License

See repository for license information.

## Archive

Historical notes and scratch docs live here:
- `docs/archive/2024-09.md`
- `docs/archive/2025-12-21.md`
- `docs/archive/2025-12-21_tia-blog.md`
- `docs/archive/2025-12-24_tia-progress.md`
- `docs/archive/notes.md`
- `docs/archive/temp.md`
- `docs/archive/TEMPLATE-PLAN.md`
- `docs/archive/TODO.md`
