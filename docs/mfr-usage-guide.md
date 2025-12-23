# MFR (Model-First Reasoning) Usage Guide

This guide explains how to use the TIA Multi-Agent Model-First Reasoning system.

## Overview

The MFR system enables collaborative problem-solving through a two-phase approach:
1. **Model Construction Phase**: Multiple specialized agents collaboratively build an explicit RDF model of the problem
2. **Constrained Reasoning Phase**: Agents generate solutions constrained by the validated model

## Architecture

### Agents

- **Coordinator**: Orchestrates the MFR protocol, manages model construction, performs SHACL validation
- **Mistral** (Natural Language Agent): Extracts entities and goals from natural language descriptions
- **Data** (Knowledge Query Agent): Grounds entities to Wikidata URIs, discovers relationships
- **Prolog** (Logical Reasoning Agent): Models actions, state variables, validates action sequences, generates plans
- **Semem** (Semantic Reasoning Agent): Identifies constraints, detects conflicts, validates model consistency

### MUC Rooms

The system uses multiple XMPP MUC rooms for phase-based communication:
- `general@conference.tensegrity.it`: Primary room where coordinator receives requests
- `mfr-construct@conference.tensegrity.it`: Model construction phase communication
- `mfr-validate@conference.tensegrity.it`: Validation phase communication
- `mfr-reason@conference.tensegrity.it`: Reasoning phase communication

## Setup

### Prerequisites

1. **XMPP Server**: Prosody or compatible XMPP server running
2. **Node.js**: v18+ with ESM support
3. **API Keys**:
   - `MISTRAL_API_KEY`: For Mistral agent
   - `SEMEM_AUTH_TOKEN`: For Semem agent (optional)

### Installation

```bash
# Install dependencies
npm install

# Create secrets file
cat > config/agents/secrets.json <<EOF
{
  "coordinator": "password1",
  "mistral": "password2",
  "data": "password3",
  "prolog": "password4",
  "semem": "password5"
}
EOF

# Set environment variables
export MISTRAL_API_KEY=your_mistral_api_key
export SEMEM_AUTH_TOKEN=your_semem_token  # optional
```

### Create MUC Rooms

```bash
# Create the MFR MUC rooms
node src/examples/create-mfr-rooms.js
```

Expected output:
```
=== Creating MFR MUC Rooms ===
✅ Joined room: mfr-construct@conference.tensegrity.it
✅ Joined room: mfr-validate@conference.tensegrity.it
✅ Joined room: mfr-reason@conference.tensegrity.it
✅ All MFR rooms created successfully!
```

## Running the System

### Start All Agents

```bash
# Start the complete MFR system
./start-mfr-system.sh
```

This starts:
- Coordinator agent
- Data agent
- Prolog agent
- Mistral agent
- Semem agent (if configured)

Logs are written to `logs/` directory.

### Monitor Agent Logs

```bash
# Watch all agent activity
tail -f logs/coordinator.log logs/mistral.log logs/data.log logs/prolog.log
```

### Stop All Agents

```bash
# Kill all running agent processes
pkill -f 'node src/services'
```

## Usage Examples

### Example 1: Simple Scheduling

```bash
node src/examples/run-mfr-session.js \
  "Schedule meetings for Alice, Bob, and Carol. Alice is only available in the morning, Bob needs 2 hours, Carol can't meet before Bob."
```

**Expected Flow**:
1. Coordinator receives request, starts MFR session
2. Mistral extracts entities: Alice, Bob, Carol
3. Data grounds entities (if they exist in Wikidata)
4. Prolog defines scheduling actions and constraints
5. Semem identifies temporal constraints
6. Model is validated via SHACL
7. Prolog generates solution plan
8. Mistral generates natural language explanation

### Example 2: Medical Appointment Scheduling

```bash
node src/examples/run-mfr-session.js \
  "Schedule appointments for patients Alice, Bob, Carol. Alice takes warfarin, Bob takes aspirin, Carol takes ibuprofen. Ensure no drug interactions."
```

**Expected Flow**:
1. Entity extraction: patients and drugs
2. Entity grounding: drugs linked to Wikidata
3. Relationship discovery: drug interaction data from Wikidata
4. Constraint identification: drug interaction constraints
5. Action modeling: appointment scheduling with constraints
6. Plan generation: schedule avoiding conflicts
7. Solution explanation with safety notes

### Example 3: Resource Allocation

```bash
node src/examples/run-mfr-session.js \
  "Allocate 3 servers to 5 tasks: database, web, cache, worker, backup. Database needs high memory, web needs good network."
```

### Example 4: Interactive Testing

```bash
# Run comprehensive integration test
node src/examples/test-mfr-session.js
```

This test:
- Connects to coordinator room
- Submits test problem
- Monitors all MFR phases
- Reports success/failure

## MFR Commands

### Coordinator Commands

Send these as messages in the coordinator room:

#### Start MFR Session
```
Coordinator: mfr-start <problem description>
```

Example:
```
Coordinator: mfr-start Schedule 3 meetings with time constraints
```

#### Request Contribution
```
Coordinator: mfr-contribute <session-id> <contribution-type>
```

Example:
```
Coordinator: mfr-contribute abc123 EntityDiscovery
```

#### Validate Model
```
Coordinator: mfr-validate <session-id>
```

#### Solve Problem
```
Coordinator: mfr-solve <session-id>
```

## Protocol Flow

### Phase 1: Initialization
- User sends problem to Coordinator
- Coordinator creates session, initializes state machine
- Broadcasts to `mfr-construct` room

### Phase 2: Entity Discovery
- Coordinator requests entity contributions
- Mistral extracts entities from problem description
- Data grounds entities to Wikidata URIs
- Contributions merged into model

### Phase 3: Action & Constraint Definition
- Prolog extracts and models actions
- Semem identifies constraints
- All contributions added to model

### Phase 4: Model Validation
- Coordinator broadcasts to `mfr-validate` room
- SHACL validation performed
- Completeness checked (entities, actions, goals present)
- Conflicts detected by Semem
- If invalid, negotiation phase begins

### Phase 5: Constrained Reasoning
- Coordinator broadcasts validated model to `mfr-reason` room
- Prolog generates solution plans
- Semem validates solutions against constraints
- Coordinator ranks solutions

### Phase 6: Solution Delivery
- Mistral generates natural language explanation
- Solution sent to user in coordinator room

## RDF Model Structure

Example model for appointment scheduling:

```turtle
@prefix mfr: <http://purl.org/stuff/mfr/> .
@prefix schema: <http://schema.org/> .

<mfr:session-123/entity-1> a mfr:Entity ;
  schema:name "Alice" ;
  mfr:contributedBy "Mistral" .

<mfr:session-123/action-1> a mfr:Action ;
  schema:name "schedule" ;
  mfr:hasParameter "patient", "time", "doctor" ;
  mfr:contributedBy "Prolog" .

<mfr:session-123/constraint-1> a mfr:Constraint ;
  mfr:constraintType "temporal" ;
  rdfs:comment "Alice only available in morning" ;
  mfr:contributedBy "Semem" .
```

## Troubleshooting

### Agents Not Responding

**Problem**: Coordinator broadcasts contribution requests but no agents respond

**Solutions**:
- Check that all agents are running: `ps aux | grep node`
- Verify agents joined rooms: check agent logs
- Ensure agent profiles have MFR capability declarations
- Check XMPP connectivity

### SHACL Validation Failures

**Problem**: Model validation fails with completeness errors

**Solutions**:
- Check that all required agents contributed (Mistral, Data, Prolog, Semem)
- Review SHACL shapes in `vocabs/mfr-shapes.ttl`
- Examine merged model in coordinator logs
- Verify entity, action, and goal presence

### Session Timeouts

**Problem**: MFR sessions time out before completion

**Solutions**:
- Increase timeout in `run-mfr-session.js`
- Check API rate limits (Mistral, Wikidata)
- Review agent logs for errors
- Simplify problem description

### Connection Errors

**Problem**: Agents can't connect to XMPP server

**Solutions**:
- Verify XMPP server is running: `prosodyctl status`
- Check credentials in `config/agents/secrets.json`
- Ensure correct service URL in agent profiles
- Check firewall rules

## Advanced Usage

### Custom Agent Providers

To add a new specialized agent:

1. Create provider in `src/agents/providers/`
2. Implement `handleMfrContributionRequest(request)` method
3. Generate RDF contributions with provenance
4. Create agent profile in `config/agents/` with MFR capabilities
5. Update `start-mfr-system.sh` to include new agent

### Custom SHACL Shapes

To add domain-specific validation:

1. Edit `vocabs/mfr-shapes.ttl`
2. Add new shapes for your domain
3. Reload shapes in coordinator

### Custom Ontologies

To extend the MFR ontology:

1. Edit `vocabs/mfr-ontology.ttl`
2. Add new classes and properties
3. Update agent providers to use new vocabulary

## Performance Optimization

### Model Caching

The ModelStore caches merged models by session ID. Configure cache size:

```javascript
const modelStore = new MfrModelStore({
  logger,
  maxCacheSize: 100 // number of sessions to cache
});
```

### Parallel Reasoning

Enable parallel agent reasoning during contribution phase by adjusting coordinator timeout:

```javascript
const CONTRIBUTION_TIMEOUT_MS = 10000; // wait for all agents
```

### Incremental Validation

For large models, enable incremental validation:

```javascript
const validator = new MfrShaclValidator({
  shapesGraph,
  logger,
  incrementalMode: true
});
```

## Monitoring

### Session Metrics

Track session statistics:

```javascript
const stats = modelStore.getSessionStatistics(sessionId);
// Returns: { entities, actions, constraints, contributions, contributors }
```

### Validation Metrics

Monitor validation performance:

```javascript
const report = await validator.validate(dataGraph);
// report.validationTimeMs - time taken
// report.violations.length - number of issues
```

## API Reference

See:
- `docs/mfr-architecture-overview.md` - Architecture details
- `vocabs/mfr-ontology.ttl` - Complete ontology
- `vocabs/mfr-shapes.ttl` - SHACL validation shapes
- `MFR_IMPLEMENTATION_SUMMARY.md` - Implementation summary

## Support

For issues or questions:
- Check agent logs in `logs/` directory
- Review XMPP server logs
- Examine RDF model in coordinator logs
- File issues on project repository
