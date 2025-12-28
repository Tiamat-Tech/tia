# MFR API Reference

Status: maintained; review after major changes.

Complete API documentation for the TIA Model-First Reasoning system.

## Table of Contents

- [Core Classes](#core-classes)
  - [MfrModelStore](#mfrmodelstore)
  - [MfrShaclValidator](#mfrshaclvalidator)
  - [MfrProtocolState](#mfrprotocolstate)
  - [MfrModelMerger](#mfrmodelmerger)
  - [MultiRoomManager](#multiroommanager)
  - [RdfUtils](#rdfutils)
  - [ShapesLoader](#shapesloader)
- [Agent Providers](#agent-providers)
  - [CoordinatorProvider](#coordinatorprovider)
  - [MistralProvider MFR Methods](#mistralprovider-mfr-methods)
  - [DataProvider MFR Methods](#dataprovider-mfr-methods)
  - [PrologProvider MFR Methods](#prologprovider-mfr-methods)
  - [SememProvider MFR Methods](#sememprovider-mfr-methods)
- [Lingue Handlers](#lingue-handlers)
  - [ModelFirstRdfHandler](#modelfirstrdfhandler)
  - [ModelNegotiationHandler](#modelnegotiationhandler)
  - [ShaclValidationHandler](#shaclvalidationhandler)
- [Constants](#constants)

---

## Core Classes

### MfrModelStore

Manages problem models and agent contributions with provenance tracking.

**Location**: `src/lib/mfr/model-store.js`

#### Constructor

```javascript
new MfrModelStore(options)
```

**Parameters**:
- `options.logger` (Object): Logger instance

**Example**:
```javascript
import { MfrModelStore } from './src/lib/mfr/model-store.js';

const store = new MfrModelStore({ logger: console });
```

#### Methods

##### createModel(problemId, problemDescription)

Creates a new problem model.

**Parameters**:
- `problemId` (String): Unique session identifier
- `problemDescription` (String): Natural language problem description

**Returns**: Promise<void>

**Throws**: Error if problemId already exists

**Example**:
```javascript
await store.createModel('session-123', 'Schedule three meetings...');
```

##### addContribution(problemId, agentId, contributionRdf, metadata)

Adds an agent's RDF contribution to the model.

**Parameters**:
- `problemId` (String): Session identifier
- `agentId` (String): Contributing agent identifier
- `contributionRdf` (String): RDF in Turtle format
- `metadata` (Object, optional): Contribution metadata

**Returns**: Promise<void>

**Example**:
```javascript
const rdf = `
  @prefix mfr: <http://purl.org/stuff/mfr/> .
  <#entity1> a mfr:Entity .
`;
await store.addContribution('session-123', 'MistralAgent', rdf, { type: 'EntityDiscovery' });
```

##### getModel(problemId)

Retrieves a model by ID.

**Parameters**:
- `problemId` (String): Session identifier

**Returns**: Object|null - Model object or null if not found

**Example**:
```javascript
const model = store.getModel('session-123');
console.log(model.problemDescription);
console.log(model.contributions.length);
```

##### getModelAsRdf(problemId)

Serializes model to Turtle RDF.

**Parameters**:
- `problemId` (String): Session identifier

**Returns**: Promise<String> - Turtle RDF string

**Example**:
```javascript
const turtle = await store.getModelAsRdf('session-123');
console.log(turtle);
```

##### getSessionStatistics(problemId)

Gets statistics for a session.

**Parameters**:
- `problemId` (String): Session identifier

**Returns**: Object|null - Statistics object

**Properties**:
- `contributions` (Number): Total contributions
- `contributors` (Array<String>): List of agent IDs
- `entities` (Number): Entity count
- `actions` (Number): Action count
- `constraints` (Number): Constraint count
- `goals` (Number): Goal count

**Example**:
```javascript
const stats = store.getSessionStatistics('session-123');
console.log(`${stats.contributions} contributions from ${stats.contributors.length} agents`);
```

##### deleteModel(problemId)

Deletes a model.

**Parameters**:
- `problemId` (String): Session identifier

**Returns**: void

---

### MfrShaclValidator

SHACL validation for MFR models.

**Location**: `src/lib/mfr/shacl-validator.js`

#### Constructor

```javascript
new MfrShaclValidator(options)
```

**Parameters**:
- `options.shapesGraph` (Dataset): RDF dataset containing SHACL shapes
- `options.logger` (Object): Logger instance

**Example**:
```javascript
import { MfrShaclValidator } from './src/lib/mfr/shacl-validator.js';
import { ShapesLoader } from './src/lib/mfr/shapes-loader.js';

const loader = new ShapesLoader({ logger: console });
const shapesGraph = await loader.loadShapes('./vocabs/mfr-shapes.ttl');
const validator = new MfrShaclValidator({ shapesGraph, logger: console });
```

#### Methods

##### validate(dataGraph)

Validates an RDF model against SHACL shapes.

**Parameters**:
- `dataGraph` (Dataset): RDF dataset to validate

**Returns**: Promise<Object> - Validation report

**Properties**:
- `conforms` (Boolean): True if valid
- `violations` (Array<Object>): List of violations
- `completenessIssues` (Array<String>): Completeness problems
- `conflicts` (Array<Object>): Detected conflicts

**Example**:
```javascript
import { RdfUtils } from './src/lib/mfr/rdf-utils.js';

const modelRdf = await store.getModelAsRdf('session-123');
const dataGraph = await RdfUtils.parseTurtle(modelRdf);
const report = await validator.validate(dataGraph);

if (report.conforms) {
  console.log('Model is valid!');
} else {
  console.log(`Found ${report.violations.length} violations`);
}
```

##### detectCompletenessIssues(validationReport)

Identifies completeness issues from validation report.

**Parameters**:
- `validationReport` (Object): Validation report from validate()

**Returns**: Array<String> - List of completeness issue descriptions

**Example**:
```javascript
const report = await validator.validate(dataGraph);
const issues = validator.detectCompletenessIssues(report);
issues.forEach(issue => console.log(`- ${issue}`));
```

##### detectConflicts(validationReport)

Identifies logical conflicts from validation report.

**Parameters**:
- `validationReport` (Object): Validation report from validate()

**Returns**: Array<Object> - List of conflicts

**Example**:
```javascript
const report = await validator.validate(dataGraph);
const conflicts = validator.detectConflicts(report);
conflicts.forEach(conflict => {
  console.log(`Conflict: ${conflict.description}`);
});
```

##### formatViolations(validationReport)

Formats violations for human readability.

**Parameters**:
- `validationReport` (Object): Validation report from validate()

**Returns**: String - Formatted violation text

**Example**:
```javascript
const report = await validator.validate(dataGraph);
const formatted = validator.formatViolations(report);
console.log(formatted);
```

---

### MfrProtocolState

State machine for MFR protocol orchestration.

**Location**: `src/lib/mfr/protocol-state.js`

#### Constructor

```javascript
new MfrProtocolState(sessionId, options)
```

**Parameters**:
- `sessionId` (String): Unique session identifier
- `options.logger` (Object): Logger instance

**Example**:
```javascript
import { MfrProtocolState } from './src/lib/mfr/protocol-state.js';
import { MFR_PHASES } from './src/lib/mfr/constants.js';

const state = new MfrProtocolState('session-123', { logger: console });
```

#### Properties

- `sessionId` (String): Session identifier
- `phase` (String): Current phase
- `transitions` (Array<Object>): Transition history
- `metadata` (Object): Session metadata

#### Methods

##### transition(toPhase, data)

Transitions to a new phase.

**Parameters**:
- `toPhase` (String): Target phase (from MFR_PHASES)
- `data` (Object, optional): Metadata for transition

**Returns**: void

**Throws**: Error if transition is invalid

**Example**:
```javascript
import { MFR_PHASES } from './src/lib/mfr/constants.js';

state.transition(MFR_PHASES.PROBLEM_INTERPRETATION);
state.transition(MFR_PHASES.ENTITY_DISCOVERY, { agentCount: 4 });
```

##### canTransitionTo(phase)

Checks if transition to phase is valid.

**Parameters**:
- `phase` (String): Target phase

**Returns**: Boolean

**Example**:
```javascript
if (state.canTransitionTo(MFR_PHASES.MODEL_VALIDATION)) {
  state.transition(MFR_PHASES.MODEL_VALIDATION);
}
```

##### getValidNextPhases()

Gets list of valid next phases.

**Returns**: Array<String> - Valid phase names

**Example**:
```javascript
const nextPhases = state.getValidNextPhases();
console.log(`Can transition to: ${nextPhases.join(', ')}`);
```

##### getPhaseHistory()

Gets chronological list of phases.

**Returns**: Array<String> - Phase names in order

**Example**:
```javascript
const history = state.getPhaseHistory();
console.log(`Phase progression: ${history.join(' → ')}`);
```

##### getDuration()

Gets total session duration in milliseconds.

**Returns**: Number - Duration in ms

**Example**:
```javascript
const durationMs = state.getDuration();
console.log(`Session duration: ${durationMs}ms`);
```

##### getPhaseDuration(phase)

Gets duration of a specific phase.

**Parameters**:
- `phase` (String): Phase name

**Returns**: Number - Duration in ms (0 if not entered)

**Example**:
```javascript
const duration = state.getPhaseDuration(MFR_PHASES.ENTITY_DISCOVERY);
console.log(`Entity discovery took ${duration}ms`);
```

##### setMetadata(key, value) / getMetadata(key)

Store and retrieve session metadata.

**Parameters**:
- `key` (String): Metadata key
- `value` (Any): Metadata value

**Returns**: value for getMetadata()

**Example**:
```javascript
state.setMetadata('contributorCount', 4);
state.setMetadata('validationAttempts', 1);

console.log(`Contributors: ${state.getMetadata('contributorCount')}`);
```

##### toJSON()

Serializes state to JSON.

**Returns**: Object - JSON-serializable state

**Example**:
```javascript
const json = state.toJSON();
console.log(JSON.stringify(json, null, 2));
```

---

### RdfUtils

Utility functions for RDF manipulation.

**Location**: `src/lib/mfr/rdf-utils.js`

All methods are static.

#### Methods

##### parseTurtle(turtleString)

Parses Turtle RDF to dataset.

**Parameters**:
- `turtleString` (String): Turtle RDF

**Returns**: Promise<Dataset> - RDF dataset

**Example**:
```javascript
import { RdfUtils } from './src/lib/mfr/rdf-utils.js';

const turtle = `
  @prefix mfr: <http://purl.org/stuff/mfr/> .
  <#entity1> a mfr:Entity .
`;
const dataset = await RdfUtils.parseTurtle(turtle);
```

##### serializeTurtle(dataset)

Serializes dataset to Turtle RDF.

**Parameters**:
- `dataset` (Dataset): RDF dataset

**Returns**: Promise<String> - Turtle RDF

**Example**:
```javascript
const turtle = await RdfUtils.serializeTurtle(dataset);
console.log(turtle);
```

##### mergeDatasets(datasets)

Merges multiple RDF datasets.

**Parameters**:
- `datasets` (Array<Dataset>): Datasets to merge

**Returns**: Promise<Dataset> - Merged dataset

**Example**:
```javascript
const merged = await RdfUtils.mergeDatasets([dataset1, dataset2, dataset3]);
```

##### queryTriples(dataset, pattern)

Queries triples by pattern.

**Parameters**:
- `dataset` (Dataset): RDF dataset
- `pattern` (Object): Query pattern
  - `subject` (String, optional): Subject URI
  - `predicate` (String, optional): Predicate URI
  - `object` (String, optional): Object URI

**Returns**: Array<Object> - Matching triples

**Example**:
```javascript
const entities = RdfUtils.queryTriples(dataset, {
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://purl.org/stuff/mfr/Entity'
});
```

##### extractEntities(dataset)

Extracts all entities from model.

**Parameters**:
- `dataset` (Dataset): RDF dataset

**Returns**: Array<Object> - Entity objects

**Example**:
```javascript
const entities = RdfUtils.extractEntities(dataset);
entities.forEach(entity => {
  console.log(`Entity: ${entity.uri}`);
});
```

##### countByType(dataset)

Counts resources by rdf:type.

**Parameters**:
- `dataset` (Dataset): RDF dataset

**Returns**: Object - Map of type URI to count

**Example**:
```javascript
const counts = RdfUtils.countByType(dataset);
console.log(`Entities: ${counts['http://purl.org/stuff/mfr/Entity']}`);
console.log(`Actions: ${counts['http://purl.org/stuff/mfr/Action']}`);
```

---

## Agent Providers

### CoordinatorProvider

MFR orchestration provider.

**Location**: `src/agents/providers/coordinator-provider.js`

#### Constructor

```javascript
new CoordinatorProvider(options)
```

**Parameters**:
- `options.modelStore` (MfrModelStore): Model store instance
- `options.validator` (MfrShaclValidator): SHACL validator
- `options.merger` (MfrModelMerger): Model merger
- `options.multiRoomManager` (MultiRoomManager): Room manager
- `options.debateTimeoutMs` (Number): Debate timeout in milliseconds
- `options.contributionTimeoutMs` (Number): Contribution timeout in milliseconds
- `options.logger` (Object): Logger instance

#### Commands

##### mfr-start <problem>

Starts a new MFR session.

**Usage**: `Coordinator: mfr-start <problem description>`

**Example**:
```
Coordinator: mfr-start Schedule three meetings for Alice, Bob, and Carol with time constraints
```

##### mfr-contribute <sessionId>

Requests contributions from agents.

**Usage**: `Coordinator: mfr-contribute <sessionId>`

##### mfr-validate <sessionId>

Validates the problem model.

**Usage**: `Coordinator: mfr-validate <sessionId>`

##### mfr-solve <sessionId>

Generates solutions for validated model.

**Usage**: `Coordinator: mfr-solve <sessionId>`

##### mfr-debate <problem>

Starts a debate-driven MFR session with Chair tool selection.

**Usage**: `Coordinator: mfr-debate <problem description>`

**Aliases**: `debate <problem>`, `Q: <problem>`

---

### MistralProvider MFR Methods

Natural language entity and goal extraction.

**Location**: `src/agents/providers/mistral-provider.js`

#### extractEntities(problemDescription)

Extracts entities from natural language.

**Parameters**:
- `problemDescription` (String): Problem text

**Returns**: Promise<Array<Object>> - Extracted entities

**Example**:
```javascript
const entities = await provider.extractEntities(
  'Schedule meetings for Alice, Bob, and Carol'
);
// Returns: [{ name: 'Alice', type: 'person' }, ...]
```

#### extractGoals(problemDescription)

Identifies goals from problem.

**Parameters**:
- `problemDescription` (String): Problem text

**Returns**: Promise<Array<Object>> - Extracted goals

#### generateEntityRdf(entities, sessionId)

Converts entities to RDF.

**Parameters**:
- `entities` (Array<Object>): Entity objects
- `sessionId` (String): Session ID

**Returns**: Promise<String> - Turtle RDF

#### handleMfrContributionRequest(request)

Handles MFR contribution requests.

**Parameters**:
- `request` (Object): Contribution request
  - `sessionId` (String): Session ID
  - `problemDescription` (String): Problem text
  - `requestedContributions` (Array<String>): Contribution type URIs

**Returns**: Promise<String> - RDF contribution

---

### DataProvider MFR Methods

Entity grounding and relationship discovery.

**Location**: `src/agents/providers/data-provider.js`

#### groundEntity(entityName)

Grounds entity to Wikidata URI.

**Parameters**:
- `entityName` (String): Entity name

**Returns**: Promise<Object|null> - Grounded entity with URI

**Properties**:
- `name` (String): Entity name
- `uri` (String): Wikidata URI
- `label` (String): Wikidata label
- `description` (String): Description
- `type` (String): Type label
- `typeUri` (String): Type URI

**Example**:
```javascript
const grounded = await provider.groundEntity('Albert Einstein');
console.log(grounded.uri); // http://www.wikidata.org/entity/Q937
```

#### getEntityRelationships(entityUri)

Discovers relationships for entity.

**Parameters**:
- `entityUri` (String): Wikidata entity URI

**Returns**: Promise<Array<Object>> - Relationships

#### generateEntityRdf(entities, sessionId)

Generates RDF for grounded entities.

**Parameters**:
- `entities` (Array): Entity names or objects
- `sessionId` (String): Session ID

**Returns**: Promise<String> - Turtle RDF with owl:sameAs links

---

### PrologProvider MFR Methods

Action modeling and planning.

**Location**: `src/agents/providers/prolog-provider.js`

#### extractActions(problemDescription)

Extracts actions from problem.

**Parameters**:
- `problemDescription` (String): Problem text

**Returns**: Promise<Array<Object>> - Actions with parameters

**Example**:
```javascript
const actions = await provider.extractActions(
  'Create agenda, schedule meetings, send invitations'
);
// Returns: [{ name: 'create', parameters: [...] }, ...]
```

#### defineActionLogic(actionName, preconditions, effects)

Defines action in Prolog.

**Parameters**:
- `actionName` (String): Action name
- `preconditions` (Array<String>): Precondition predicates
- `effects` (Array<String>): Effect predicates

**Returns**: String - Prolog code

#### generateActionRdf(actions, sessionId)

Converts actions to RDF.

**Parameters**:
- `actions` (Array<Object>): Action objects
- `sessionId` (String): Session ID

**Returns**: Promise<String> - Turtle RDF

#### validateActionSequence(actionSequence, initialState)

Validates action sequence using Prolog.

**Parameters**:
- `actionSequence` (Array<String>): Action names
- `initialState` (Object): Initial state predicates

**Returns**: Promise<Object> - Validation result

#### generateSolution(modelTurtle, goals)

Generates plan from model.

**Parameters**:
- `modelTurtle` (String): Problem model RDF
- `goals` (Array<String>): Goal descriptions

**Returns**: Promise<Object> - Solution object

---

### SememProvider MFR Methods

Constraint reasoning and conflict detection.

**Location**: `src/agents/providers/semem-provider.js`

#### extractConstraints(problemDescription)

Extracts constraints from problem.

**Parameters**:
- `problemDescription` (String): Problem text

**Returns**: Promise<Array<Object>> - Constraint objects

#### detectConflicts(statements)

Detects conflicts in statements.

**Parameters**:
- `statements` (Array<String>): Statements to check

**Returns**: Promise<Array<Object>> - Detected conflicts

#### validateModelConsistency(modelDescription)

Validates model consistency.

**Parameters**:
- `modelDescription` (String): Model description

**Returns**: Promise<Object> - Validation result

**Properties**:
- `consistent` (Boolean): True if consistent
- `issues` (Array<Object>): Issues found
- `score` (Number): Consistency score (0.0-1.0)

#### validateForReasoning(modelTurtle)

Assesses reasoning readiness.

**Parameters**:
- `modelTurtle` (String): Model RDF

**Returns**: Promise<Object> - Readiness assessment

**Properties**:
- `readyForReasoning` (Boolean): True if ready
- `completeness` (Object): Completeness flags
- `statistics` (Object): Model statistics

---

## Constants

### MFR_PHASES

Protocol phase identifiers.

**Location**: `src/lib/mfr/constants.js`

```javascript
import { MFR_PHASES } from './src/lib/mfr/constants.js';

console.log(MFR_PHASES.INITIALIZATION);
console.log(MFR_PHASES.ENTITY_DISCOVERY);
console.log(MFR_PHASES.MODEL_VALIDATION);
console.log(MFR_PHASES.CONSTRAINED_REASONING);
```

**All Phases**:
- `INITIALIZATION`
- `PROBLEM_INTERPRETATION`
- `ENTITY_DISCOVERY`
- `RELATIONSHIP_DISCOVERY`
- `ACTION_DEFINITION`
- `CONSTRAINT_IDENTIFICATION`
- `GOAL_SPECIFICATION`
- `MODEL_CONSOLIDATION`
- `MODEL_VALIDATION`
- `MODEL_NEGOTIATION`
- `CONSTRAINED_REASONING`
- `SOLUTION_GENERATION`
- `SOLUTION_VALIDATION`
- `SOLUTION_RANKING`
- `SOLUTION_SYNTHESIS`
- `SOLUTION_DELIVERY`

### MFR_MESSAGE_TYPES

Protocol message type URIs.

**Location**: `src/lib/mfr/constants.js`

```javascript
import { MFR_MESSAGE_TYPES } from './src/lib/mfr/constants.js';

console.log(MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_REQUEST);
console.log(MFR_MESSAGE_TYPES.MODEL_CONTRIBUTION_RESPONSE);
console.log(MFR_MESSAGE_TYPES.VALIDATION_REQUEST);
```

---

## Error Handling

All async methods may throw errors. Always use try-catch:

```javascript
try {
  await store.addContribution(sessionId, agentId, rdf);
} catch (error) {
  console.error('Failed to add contribution:', error.message);
}
```

Common errors:
- `Model not found` - Invalid sessionId
- `Invalid RDF` - Malformed Turtle
- `Invalid transition` - State machine violation
- `Validation failed` - SHACL constraint violation

---

## Complete Example

```javascript
import { MfrModelStore } from './src/lib/mfr/model-store.js';
import { MfrShaclValidator } from './src/lib/mfr/shacl-validator.js';
import { ShapesLoader } from './src/lib/mfr/shapes-loader.js';
import { MfrProtocolState } from './src/lib/mfr/protocol-state.js';
import { RdfUtils } from './src/lib/mfr/rdf-utils.js';
import { MFR_PHASES } from './src/lib/mfr/constants.js';

// Initialize components
const store = new MfrModelStore({ logger: console });
const loader = new ShapesLoader({ logger: console });
const shapesGraph = await loader.loadShapes('./vocabs/mfr-shapes.ttl');
const validator = new MfrShaclValidator({ shapesGraph, logger: console });
const state = new MfrProtocolState('session-123', { logger: console });

// Create model
await store.createModel('session-123', 'Schedule three meetings');

// Add contributions
const entityRdf = `
  @prefix mfr: <http://purl.org/stuff/mfr/> .
  <#entity1> a mfr:Entity ; schema:name "Alice" .
`;
await store.addContribution('session-123', 'MistralAgent', entityRdf);

// Validate model
const modelRdf = await store.getModelAsRdf('session-123');
const dataGraph = await RdfUtils.parseTurtle(modelRdf);
const report = await validator.validate(dataGraph);

if (report.conforms) {
  console.log('Model is valid!');
  state.transition(MFR_PHASES.CONSTRAINED_REASONING);
} else {
  console.log('Validation failed');
  const formatted = validator.formatViolations(report);
  console.log(formatted);
}

// Get statistics
const stats = store.getSessionStatistics('session-123');
console.log(`${stats.contributions} contributions from ${stats.contributors.length} agents`);
```
