# Model-First Reasoning Multi-Agent Architecture

Status: maintained; review after major changes.

## Executive Summary

This document outlines an architecture for implementing Model-First Reasoning (MFR) in a multi-agent system, leveraging RDF ontologies and the Lingue language negotiation framework.

**Key Innovation**: Separating problem modeling from problem solving across specialized agents, with explicit RDF-based model construction preceding any reasoning phase.

## Core Concepts

### Model-First Reasoning (MFR)

MFR is a two-phase paradigm:

1. **Phase 1: Model Construction** - Explicitly define:
   - Entities (objects in the problem space)
   - State Variables (mutable properties)
   - Actions (transformations with preconditions/effects)
   - Constraints (invariants that must hold)

2. **Phase 2: Constrained Reasoning** - All reasoning operates strictly within the defined model

### Why MFR for Multi-Agent Systems?

- **Shared Understanding**: All agents work from the same explicit model
- **Verifiable Solutions**: Constraints are checkable against the model
- **Reduced Hallucinations**: Explicit representation prevents implicit assumptions
- **Compositional Expertise**: Different agents contribute their specialized knowledge to model construction
- **Interpretability**: Model + reasoning trace = auditable decision process

## Architecture Components

### 1. Ontology Stack

```
┌─────────────────────────────────────┐
│   Domain-Specific Ontologies        │
│   (Medical, Logistics, Finance)     │
├─────────────────────────────────────┤
│   MFR Problem Model Ontology        │
│   (Entities, Actions, Constraints)  │
├─────────────────────────────────────┤
│   Lingue Communication Ontology     │
│   (Agents, Profiles, Exchanges)     │
├─────────────────────────────────────┤
│   MCP Tool Integration Ontology     │
│   (External capabilities)           │
└─────────────────────────────────────┘
```

### 2. Agent Roles in MFR

#### **Coordinator Agent**
- Orchestrates model construction
- Manages negotiation protocol
- Validates final model with SHACL
- Synthesizes multi-agent solutions

#### **Knowledge Query Agent** (e.g., Data)
- Contributes entity definitions
- Grounds entities in external knowledge bases (Wikidata)
- Identifies state variables from domain knowledge
- Validates entity relationships

#### **Semantic Reasoning Agent** (e.g., MFR Semantic)
- Contributes constraint definitions
- Validates ontological consistency
- Performs semantic alignment
- Checks logical coherence

#### **Logical Reasoning Agent** (e.g., Prolog)
- Defines action preconditions and effects
- Contributes logical constraints
- Validates state transitions
- Performs rule-based inference

#### **Natural Language Agent** (e.g., Mistral)
- Interprets user problem descriptions
- Extracts initial entities and goals
- Explains solutions in natural language
- Mediates human-machine communication

#### **Executor Agent** (in progress)
- Translates high-level plans into Prolog-ready execution queries
- Requests concrete bindings from the Prolog agent
- Feeds bindings back to the coordinator for final synthesis

### 3. Protocol Flow

```
User Request
     ↓
┌─────────────────────────────────────┐
│  PHASE 1: Collaborative Model       │
│           Construction              │
└─────────────────────────────────────┘
     ↓
1. Problem Interpretation (NL Agent)
     ↓
2. Entity Discovery (Knowledge Agent)
     ↓
3. Constraint Identification (Semantic Agent)
     ↓
4. Action Definition (Logic Agent)
     ↓
5. Model Merge & Validation (Coordinator)
     ↓
6. Conflict Negotiation (All Agents)
     ↓
┌─────────────────────────────────────┐
│  Validated Problem Model (RDF)      │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│  PHASE 2: Constrained Reasoning     │
└─────────────────────────────────────┘
     ↓
7. Parallel Reasoning (All Agents)
     ↓
8. Solution Validation (Against Model)
     ↓
9. Plan Execution Preparation (Executor, in progress)
     ↓
10. Plan Execution & Binding (Prolog)
     ↓
11. Synthesis & Ranking (Coordinator)
     ↓
12. Explanation Generation (NL Agent)
     ↓
Response to User
```

### 4. Lingue Integration

**Language Mode Negotiation** ensures agents can communicate effectively:

- **Agent Capabilities**: Each agent declares supported language modes in its Lingue profile
- **Exchange Negotiation**: Coordinator finds common modes for model exchange
- **Content Negotiation**: Model can be expressed in multiple serializations (Turtle, JSON-LD, etc.)

**Supported Language Modes**:
- `lng:ModelFirstRDF` - RDF-based problem models
- `lng:SparqlQuery` - For knowledge retrieval
- `lng:PrologProgram` - For logical rules
- `lng:HumanChat` - For user interaction
- `lng:ModelNegotiation` - For collaborative construction protocol

### 5. XMPP Communication Layer

**Channels**:
- **Model Construction MUC**: Room for collaborative model building
- **Reasoning MUC**: Room for solution generation
- **Validation MUC**: Room for constraint checking
- **Coordination Direct Messages**: For coordinator-agent communication

**Message Types**:
- `mfr:ModelContributionRequest`
- `mfr:EntityProposal`
- `mfr:ConstraintProposal`
- `mfr:ActionDefinition`
- `mfr:ModelValidationResult`
- `mfr:SolutionProposal`

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)

1. **Define MFR Ontology** (see `mfr-ontology.ttl`)
2. **Extend Lingue** with MFR language modes
3. **Create SHACL Shapes** for validation
4. **Update Agent Profiles** with MFR capabilities

### Phase 2: Coordinator Development (Week 3-4)

1. **Model Construction Service**
   - Parse incoming requests
   - Broadcast to specialized agents
   - Collect contributions
   - Merge RDF graphs
   
2. **Validation Service**
   - SHACL validation
   - Conflict detection
   - Negotiation protocol

### Phase 3: Agent Enhancement (Week 5-6)

1. **Update Existing Agents**
   - Add model contribution handlers
   - Implement constrained reasoning
   - Add model-aware response generation

2. **Testing**
   - Unit tests per agent
   - Integration tests across agents
   - End-to-end scenario tests

### Phase 4: Optimization (Week 7-8)

1. **Performance Tuning**
   - Model caching
   - Incremental validation
   - Parallel reasoning

2. **Monitoring & Observability**
   - Model construction metrics
   - Constraint violation tracking
   - Solution quality metrics

## Example Scenarios

### Scenario 1: Medical Appointment Scheduling

**Problem**: Schedule appointments considering drug interactions

**Model Construction**:
- Data agent: Retrieves drug entities from Wikidata
- MFR Semantic agent: Identifies interaction constraints from medical ontologies
- Prolog agent: Defines scheduling actions with temporal constraints
- Mistral agent: Extracts patient preferences and requirements

**Reasoning**:
- Each agent proposes schedules respecting their constraints
- Coordinator validates all proposals against full model
- Solutions ranked by optimality criteria

### Scenario 2: Supply Chain Optimization

**Problem**: Optimize delivery routes with multiple constraints

**Model Construction**:
- Data agent: Retrieves location, product, and vehicle entities
- MFR Semantic agent: Defines capacity, timing, and regulatory constraints
- Prolog agent: Models route actions and state transitions
- Mistral agent: Interprets business priorities

**Reasoning**:
- Logic agent generates feasible routes
- Knowledge agent validates against real-world data
- Semantic agent checks compliance
- Solutions synthesized and explained

### Scenario 3: Financial Risk Assessment

**Problem**: Evaluate investment portfolio risk

**Model Construction**:
- Data agent: Retrieves asset data and market information
- MFR Semantic agent: Defines regulatory and risk constraints
- Prolog agent: Models portfolio rebalancing actions
- Mistral agent: Interprets user risk preferences

**Reasoning**:
- Parallel risk calculations by multiple agents
- Constraint validation against regulatory requirements
- Scenario analysis and explanation

## Benefits

### For Users
- More reliable answers with fewer errors
- Transparent reasoning process
- Verifiable constraint adherence

### For Developers
- Clear separation of concerns
- Reusable problem models
- Easier debugging (model vs reasoning)

### For the System
- Better agent coordination
- Reduced redundant computation
- Scalable to new domains

## Future Extensions

1. **Learning from Models**: Agents learn common patterns in problem models
2. **Model Reuse**: Build library of reusable domain models
3. **Incremental Refinement**: Users can iteratively refine models
4. **Visual Model Editing**: GUI for model inspection and modification
5. **Federated Reasoning**: Distribute reasoning across multiple systems

## References

- Model-First Reasoning paper: `2512.14474v1.pdf`
- Lingue specification: `vocabs/lingue.ttl`
- Existing agent implementations: `config/agents/*.ttl`
- XMPP integration: `docs/lingue-integration.md`

## Getting Started

1. Review the ontology definitions in `mfr-ontology.ttl`
2. Examine the implementation examples in `mfr-implementation-examples.js`
3. Study the agent configuration updates in `mfr-agent-configs.ttl`
4. Follow the deployment guide for testing

## Contact & Support

For questions or contributions, refer to your project documentation and the MFR research paper included in this package.
