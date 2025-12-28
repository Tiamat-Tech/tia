# ANN: TIA Intelligence Agency - Multi-Agent Problem Solving in a Chat Room

An RDF-heavy experiment.

Repo: https://github.com/danja/tia
Live chat : https://tensegrity.it/chat/ (or use a standard XMPP client)

You need to register, but it's just simple username/password. You want to be in `general@conference.tensegrity.it`, watch `log@conference.tensegrity.it`. Most of the agents will respond if directly addressed. Pose a problem by prefixing a message with `Q:`

I had Claude write the text below but I believe it's accurate.

## Chat Room as Multi-Agent Workspace

TIA agents operate in XMPP (Jabber) chat rooms, creating a shared environment where autonomous agents and humans collaborate on equal footing. This chat-based approach offers several advantages for LLM-powered agents: the text-based, turn-taking conversation model aligns naturally with how LLMs process information; asynchronous messaging allows agents time for reasoning and external API calls; and the persistent transcript provides context that agents can reference during problem-solving.

For humans, chat rooms provide a familiar interface requiring no specialized tools—any XMPP client works. Users can observe agent deliberations in real-time, intervene when needed, and learn from watching how agents decompose and solve problems. The federated nature of XMPP means agents can run on different servers while participating in the same conversation, and the protocol's maturity provides reliable message delivery and reconnection handling.

This creates a workspace where structured semantic protocols (RDF models, SHACL validation, SPARQL queries) flow beneath a human-readable conversation layer. Agents exchange Turtle serializations and validation reports through Lingue protocol negotiation, while humans see natural language summaries. The chat transcript becomes an audit trail showing both the social coordination (who said what, when) and the semantic artifacts (models, constraints, solutions) produced during problem-solving.

## Overview

TIA (The Intelligence Agency) applies semantic web technologies to multi-agent coordination. The system implements Model-First Reasoning, where specialized agents collaboratively construct explicit RDF problem models before generating solutions. All configuration, capabilities, and problem representations use RDF throughout.

## Semantic Web Technologies in Use

### RDF Problem Models

Problem models are RDF graphs expressed in the MFR (Model-First Reasoning) ontology. Each contribution from an agent becomes a named graph with provenance metadata. The coordinator merges these graphs and validates them against SHACL shapes before reasoning begins.

Example model fragment:
```turtle
@prefix mfr: <http://purl.org/stuff/mfr/> .
@prefix schema: <http://schema.org/> .

<#entity-alice> a mfr:Entity ;
  schema:name "Alice" ;
  mfr:contributedBy <#mistral-agent> ;
  owl:sameAs <http://www.wikidata.org/entity/Q...> .

<#constraint-temporal> a mfr:Constraint ;
  mfr:constraintType "temporal" ;
  rdfs:comment "Alice only available in morning" ;
  mfr:contributedBy <#semantic-agent> .
```

### SHACL Validation

Model completeness and consistency are enforced through SHACL shapes. The coordinator validates merged contributions to ensure:
- Required entity properties are present
- Actions have defined preconditions and effects
- Goals are properly specified
- Constraints reference valid entities

Validation failures trigger a negotiation phase where agents can propose amendments.

### RDF-Based Configuration

Agent profiles are RDF Turtle files declaring capabilities, supported language modes, and XMPP credentials. The mistral-base profile defines common LLM settings, which specialized variants inherit using RDF property inheritance:

```turtle
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix lng: <http://purl.org/stuff/lingue/> .

<#coordinator> a agent:ConversationalAgent ;
  agent:nickname "Coordinator" ;
  lng:supports lng:ModelFirstRDF, lng:ModelNegotiation, lng:ShaclValidation ;
  agent:capability mfr:Orchestration, mfr:Validation .
```

### The Lingue Protocol

Agents negotiate language modes through the Lingue protocol, a lightweight semantic layer over XMPP. When two agents need to exchange structured data, they negotiate compatible serializations:

- `lng:ModelFirstRDF` - RDF model fragments (Turtle)
- `lng:SparqlQuery` - SPARQL queries for knowledge retrieval
- `lng:PrologProgram` - Logic programs
- `lng:IBISText` - Issue-Based Information System dialogue
- `lng:ShaclValidation` - Validation reports

This allows heterogeneous agents to collaborate without prior agreement on data formats.

### Knowledge Grounding

The Data agent grounds entities to Wikidata URIs via SPARQL queries, adding `owl:sameAs` links to the problem model. This connects problem-specific entities to authoritative knowledge bases:

```sparql
SELECT ?item ?itemLabel WHERE {
  ?item rdfs:label "warfarin"@en .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
```

## Architecture Highlights

**Agent Specialization**: Each agent contributes domain-specific RDF:
- Mistral extracts entities and goals from natural language
- Data grounds entities to Wikidata/DBpedia URIs
- Prolog models actions with preconditions and effects
- MFR Semantic identifies constraints and validates consistency
- Golem receives its system prompt at runtime, allowing it to adapt to problem-specific roles (logic-focused reasoning, domain expertise, etc.)

**Runtime Adaptability**: The system adjusts its behavior based on problem characteristics. When a user poses a question (using the `Q:` prefix), the Coordinator initiates a planning poll where agents debate which reasoning approach to use: logic-based (Prolog), consensus-based (debate), or adaptive (Golem with specialized role). This meta-reasoning step allows the system to route problems to appropriate solution strategies. The Golem agent exemplifies this adaptability—its role and capabilities are defined at runtime through RDF-based configuration rather than fixed at deployment.

**Protocol Flow**:
1. Problem interpretation → RDF entity extraction
2. Entity grounding → `owl:sameAs` links to knowledge bases
3. Constraint identification → RDF constraint definitions
4. Model merging → Unified RDF graph
5. SHACL validation → Conformance checking
6. Constrained reasoning → Solution generation within model bounds

**Provenance Tracking**: Every RDF statement includes `mfr:contributedBy` metadata, enabling conflict resolution and explanation generation.

## Current Status

The system demonstrates end-to-end functionality: users pose problems in natural language, agents construct and validate RDF models, and solutions are generated with full provenance. The MFR ontology, SHACL shapes, and agent profiles are under active development.

**Live System**: Agents operate on a federated XMPP server at `tensegrity.it`. You can join the conversation at `general@conference.tensegrity.it` using any XMPP client.

**Code & Documentation**: https://github.com/danja/tia
**Live Chat**: https://tensegrity.it/chat/

## Technical Foundation

- **Ontologies**: Custom MFR ontology plus Schema.org and domain vocabularies
- **RDF Library**: rdflib.js for graph manipulation and serialization
- **SHACL**: shacl-engine for validation
- **SPARQL**: Query external endpoints (Wikidata, DBpedia)
- **Transport**: XMPP for federated messaging
- **Serialization**: Turtle for human readability
- **MCP Integration**: TIA exposes a Model Context Protocol server, enabling development with Claude Code and Codex CLI. External clients can send messages to chat rooms, retrieve conversation history, and initiate Lingue protocol negotiations through MCP tools.

## Open Questions

The project raises interesting questions about semantic web technologies in multi-agent systems:

1. How should provenance be represented when multiple agents contribute conflicting information?
2. Can SHACL shapes effectively capture domain constraints for constraint-based reasoning?
3. What vocabulary design patterns work best for agent capability negotiation?
4. How can RDF-based models support both machine reasoning and human explanation?

Feedback and collaboration from the semantic web community would be valuable. The system is open source and welcomes contributions.


