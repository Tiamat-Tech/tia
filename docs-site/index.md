# TIA Documentation

**TIA (The Intelligence Agency)** is an experimental multi-agent system built on open standards: XMPP for messaging, RDF for knowledge representation, and semantic protocols for inter-agent coordination. The system implements Model-First Reasoning (MFR), where specialized agents collaboratively construct explicit problem models before generating solutions.

**Key features:**
- 🤖 Multiple specialized AI agents (Mistral, Prolog, Data, Semantic)
- 📊 RDF-based knowledge representation and SHACL validation
- 🔄 Lingue protocol for language mode negotiation
- 🌐 XMPP/Jabber for federated, real-time communication
- 🔧 Model Context Protocol (MCP) integration
- ✅ Constraint-based reasoning with verifiable solutions

**Quick links:**
- 💬 [TIA Live Chat](https://tensegrity.it/chat/) - Join `general@conference.tensegrity.it`
- 🐙 [GitHub Repository](https://github.com/danja/tia)
- 📖 [Lingue Protocol Specification](https://danja.github.io/lingue/)

---

## 🚀 Getting Started

- **[Progress Report (Dec 24, 2025)](2025-12-24_tia-progress.html)** - Latest status and complete system walkthrough
- **[Quick Start Guide](quick-start.html)** - Get up and running with TIA agents
- **[MFR Quick Start](mfr-quick-start.html)** - Model-First Reasoning system setup
- **[Agent Overview](agents.html)** - Capabilities and commands for each agent
- **[System Architecture](architecture.html)** - Agent runtime, profiles, and DI overview

## 🏗️ Model-First Reasoning (MFR)

The core innovation of TIA: explicit model construction before reasoning.

### Core Documentation
- **[MFR Architecture Overview](mfr-architecture-overview.html)** - Four-phase problem solving workflow
- **[MFR Usage Guide](mfr-usage-guide.html)** - Practical guide to using MFR
- **[MFR API Reference](mfr-api-reference.html)** - Complete API documentation
- **[MFR Agent Contracts](mfr-agent-contracts.html)** - Expected agent behaviors

### Agent Contracts
Individual specifications for each MFR agent:
- **[Coordinator Agent](coordinator-agent-contract.html)** - Orchestrates the MFR protocol
- **[Data Agent](data-agent-contract.html)** - Wikidata/DBpedia knowledge grounding
- **[Mistral Agent](mistral-agent-contract.html)** - NLP entity extraction and explanation
- **[Prolog Agent](prolog-agent-contract.html)** - Logical reasoning and plan generation
- **[MFR Semantic Agent](mfr-semantic-agent-contract.html)** - Constraint identification
- **[Semem Agent](semem-agent-contract.html)** - Knowledge base integration

### Testing & Room Setup
- **[MFR Room Creation & Testing](mfr-room-creation-testing.html)** - Prosody MUC configuration

### Experimental Features
- **[MFR Debate Integration](mfr-debate-integration.html)** ✅ - Tool selection through structured dialogue (Phase 1 complete, enabled by default in `config/agents/coordinator.ttl`)
- **[MFR Debate Requirements](mfr-debate-agent-requirements.html)** - Implementation requirements ensuring zero breaking changes

## 🔌 Integration Protocols

### Lingue Protocol
Language mode negotiation for multi-agent communication:
- **[Lingue Integration](lingue-integration.html)** - How agents negotiate communication modes
- **[IBIS Structured Dialogue](ibis.html)** - Issue-Based Information System vocabulary
- **[Lingue Development Plan](LINGUE-PLAN.html)** - Protocol development roadmap

### Model Context Protocol (MCP)
Integration with external tools and services:
- **[MCP Overview](mcp.html)** - Model Context Protocol introduction
- **[MCP Server Guide](mcp-server.html)** - Exposing TIA as an MCP server
- **[MCP Client Guide](mcp-client.html)** - Consuming external MCP services
- **[MCP Development Plan](MCP-PLAN.html)** - MCP integration roadmap

## 🛠️ Development & Customization

- **[Agent Development Guide](agent-dev-prompt.html)** - Creating new agents
- **[Provider Guide](provider-guide.html)** - Building custom agent providers
- **[API Reference](api-reference.html)** - Core API documentation
- **[Auto-Registration](auto-registration.html)** - Automatic credential management
- **[Testing Guide](testing.html)** - Running tests and validation

## 📚 Specialized Topics

- **[Data Agent Deep Dive](data-agent.html)** - SPARQL queries, Wikidata integration
- **[Debating Society](debating-society.html)** - Chair, Recorder, and structured debates
- **[Server Deployment](server.html)** - Production deployment considerations
- **[TBox Note](tbox-note.html)** - Ontology design notes

## 📝 Blog Posts & Updates

- **[December 24, 2025 - TIA Progress](2025-12-24_tia-progress.html)** - Complete system overview
- **[December 21, 2025 - TIA Blog](2025-12-21_tia-blog.html)** - MFR implementation update
- **[December 21, 2025 - Notes](2025-12-21.html)** - Development notes
- **[September 2024 - Early Notes](2024-09.html)** - Initial project notes

## 🔧 Internal Documentation

Planning documents and development notes:
- **[Template Plan](TEMPLATE-PLAN.html)** - Planning template for new features
- **[Development Notes](notes.html)** - Ongoing development notes
- **[Temporary Notes](temp.html)** - Scratch notes and ideas

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
