# MFR Debate Integration: Tool Selection Through Structured Dialogue

**Status:** ✅ Phase 1 Complete - Enabled by default via `config/agents/coordinator.ttl` (`mfr:enableDebate true`)

## How to Try This Out

### Step 1: Confirm Debate is Enabled

Debate is enabled by default in `config/agents/coordinator.ttl`:

```turtle
mfr:enableDebate "true"^^xsd:boolean ;
mfr:debateTimeout "60000"^^xsd:integer
```

### Step 2: Start the Agents

Start the MFR system with the Chair agent included:

```bash
./start-all.sh mfr
```

This will start:
- **Coordinator** (with debate feature enabled)
- **Chair** (debate facilitator)
- **Mistral** (entity extraction + debate participant)
- **Data** (knowledge grounding)
- **Prolog** (reasoning)
- **MFR-Semantic** (constraint extraction)
- **Executor** (plan execution)

### Step 3: Connect via REPL

In another terminal, connect to the chatroom:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js <your-username> <your-password>
```

### Step 4: Start a Debate Session

Once connected, try the debate command or shorthand:

```
debate Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions.
Q: Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions.
```

You should see:
1. **Coordinator** announces debate session started with the configured timeout
2. **Chair** presents the debate issue listing available agents
3. Agents can contribute positions like:
   - `Position: I recommend Mistral for entity extraction because...`
   - `Position: Data agent would help ground drug names to Wikidata`
   - `Support: Prolog is essential for checking constraint satisfaction`
4. After the timeout (or if Chair detects consensus), the debate concludes
5. **Coordinator** requests contributions from the selected agents (or all agents if no consensus)
6. System proceeds to normal MFR entity discovery phase

### Comparison with Standard MFR

To see the difference, you can also run the standard MFR workflow:

```
mfr-start Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions.
```

The `mfr-start` command skips the debate phase and goes directly to entity discovery (existing behavior - no changes).

### What Currently Responds

**Phase 1 (Current Implementation):**
- ✅ **Coordinator** - Manages the debate session, broadcasts issue, enforces timeout
- ✅ **Chair** - Detects debate start, tracks positions/arguments, reports consensus
- ✅ **Humans** - Can contribute positions and arguments during the debate window
- ❌ **Other agents (Mistral, Data, Prolog)** - Do NOT automatically participate yet (Phase 3 work)

**How to participate as a human:**
```
Position: I recommend Data agent for grounding drug names to Wikidata
Support: Prolog excels at constraint satisfaction for scheduling
Objection: We should avoid Mistral for medical facts due to hallucination risk
```

**Check consensus:**
```
Chair: tool consensus
```

Or check debate status:
```
Chair: status
```

---

## Overview

This document describes the integration of the **Chair agent** into the MFR (Model-First Reasoning) workflow to enable structured debate about tool selection and problem-solving approaches. Rather than having the Coordinator implicitly decide which agents contribute what, a debate phase allows agents (and potentially humans) to discuss, argue for, and reach consensus on the best approach.

[![debate diagram](debate.png)](debate.svg)  [![dataflow diagram](dataflow.png)](dataflow.svg)

Diagram: `docs/debate.svg` (pre-flow) and `docs/dataflow.svg` (main MFR).

## Current MFR Flow vs. Debate-Enhanced Flow

### Current Flow (Implicit Tool Selection)

```
User Problem
    ↓
Coordinator broadcasts contribution request
    ↓
All agents contribute simultaneously
    ↓
Coordinator merges contributions
    ↓
Validation → Reasoning → Solution
```

**Issues:**
- No explicit discussion of *why* certain tools are appropriate
- Agents may contribute irrelevant information
- No mechanism for agents to suggest alternative approaches
- Humans can't easily guide the tool selection

### Proposed Debate-Enhanced Flow

```
User Problem
    ↓
Coordinator initiates TOOL_SELECTION_DEBATE phase
    ↓
Chair agent facilitates debate:
  - Issue: "Which tools/agents should address this problem?"
  - Agents propose Positions (tool recommendations)
  - Agents provide Arguments (supporting/objecting)
  - Humans can contribute positions
    ↓
Chair detects consensus
    ↓
Coordinator requests contributions from agreed-upon agents
    ↓
Model construction with selected tools
    ↓
Validation → Reasoning → Solution
```

## Integration Points

### 1. New MFR Phase: `TOOL_SELECTION_DEBATE`

Add to `src/lib/mfr/constants.js`:

```javascript
export const MFR_PHASES = {
  // Existing phases
  INITIALIZATION: 'initialization',
  PROBLEM_INTERPRETATION: 'problem_interpretation',

  // NEW: Debate phase for tool selection
  TOOL_SELECTION_DEBATE: 'tool_selection_debate',

  // Existing phases continue
  ENTITY_DISCOVERY: 'entity_discovery',
  // ... rest of phases
};
```

Update phase transitions:

```javascript
[MFR_PHASES.PROBLEM_INTERPRETATION]: [
  MFR_PHASES.TOOL_SELECTION_DEBATE,  // NEW path
  MFR_PHASES.ENTITY_DISCOVERY        // Existing direct path
],
[MFR_PHASES.TOOL_SELECTION_DEBATE]: [
  MFR_PHASES.ENTITY_DISCOVERY
],
```

### 2. Chair Agent Integration

The Chair agent already has the core IBIS (Issue-Based Information System) functionality:

**Existing capabilities:**
- Detects Issues, Positions, Arguments
- Tracks debate state
- Summarizes IBIS structures
- Polls for consensus

**Needed enhancements:**
- Understand MFR message types
- Recognize when consensus is reached
- Report consensus back to Coordinator
- Support tool/agent-specific vocabulary

### 3. Coordinator Modifications

#### New Command: `mfr-debate`

Initiates tool selection debate:

```javascript
case "mfr-debate":
case "debate":
  return await this.initiateToolSelectionDebate(content, metadata, reply);
```

#### Implementation:

```javascript
async initiateToolSelectionDebate(problemDescription, metadata, reply) {
  const sessionId = randomUUID();
  const state = new MfrProtocolState(sessionId, {
    logger: this.logger,
    initialPhase: MFR_PHASES.TOOL_SELECTION_DEBATE
  });

  this.activeSessions.set(sessionId, state);

  // Format debate issue
  const debateIssue = `Issue: Which tools and agents should we use to solve this problem?\n\nProblem: ${problemDescription}\n\nAvailable agents: Mistral (NLP), Data (Wikidata), Prolog (logic), MFR-Semantic (constraints)\n\nPlease provide:\n- Position: I recommend [agent] because...\n- Support: [Agent] would help because...\n- Objection: [Agent] may not work because...`;

  // Send to Chair agent (or broadcast if Chair listening)
  await this.sendStatusMessage(debateIssue);

  // Set timeout for debate phase
  setTimeout(() => {
    this.concludeDebate(sessionId);
  }, 60000); // 60 second debate window

  return `Tool selection debate started for session ${sessionId}\n${debateIssue}`;
}
```

### 4. IBIS Message Types for MFR

Extend IBIS vocabulary with MFR-specific concepts:

```javascript
// In src/lib/ibis-detect.js or new file

export const MFR_TOOL_VOCABULARY = {
  // Agent names
  agents: ['mistral', 'data', 'prolog', 'semantic', 'wikidata', 'sparql'],

  // Tool capabilities
  capabilities: [
    'entity extraction',
    'knowledge grounding',
    'logical reasoning',
    'constraint detection',
    'natural language',
    'semantic validation'
  ],

  // Common position patterns
  positionPatterns: [
    /position:\s*use\s+(\w+)\s+for\s+(.+)/i,
    /position:\s*(\w+)\s+is\s+best\s+for\s+(.+)/i,
    /i\s+recommend\s+(\w+)\s+because\s+(.+)/i
  ],

  // Argument patterns
  supportPatterns: [
    /(\w+)\s+can\s+handle\s+(.+)/i,
    /(\w+)\s+excels\s+at\s+(.+)/i,
    /(\w+)\s+has\s+access\s+to\s+(.+)/i
  ],

  objectionPatterns: [
    /(\w+)\s+cannot\s+(.+)/i,
    /(\w+)\s+lacks\s+(.+)/i,
    /(\w+)\s+would\s+struggle\s+with\s+(.+)/i
  ]
};
```

### 5. Consensus Detection

The Chair agent needs to detect when consensus is reached:

```javascript
// In chair-provider.js

detectConsensus() {
  // Simple consensus: majority of positions agree on a set of tools
  // Or: no objections in last N messages
  // Or: explicit "consensus" or "agreed" messages

  const toolVotes = new Map();

  this.positions.forEach(position => {
    const tools = extractToolsFromPosition(position.text);
    tools.forEach(tool => {
      toolVotes.set(tool, (toolVotes.get(tool) || 0) + 1);
    });
  });

  // Consensus if any tool has > 50% of positions
  const totalPositions = this.positions.length;
  const consensusTools = [];

  for (const [tool, votes] of toolVotes) {
    if (votes > totalPositions / 2) {
      consensusTools.push(tool);
    }
  }

  // Also check for explicit objections
  const hasUnresolvedObjections = this.arguments.some(arg =>
    arg.stance === 'object' && !this.isObjectionResolved(arg)
  );

  if (consensusTools.length > 0 && !hasUnresolvedObjections) {
    return {
      reached: true,
      tools: consensusTools,
      summary: this.summarizeConsensus(consensusTools)
    };
  }

  return { reached: false };
}

summarizeConsensus(tools) {
  return `Consensus reached: Use ${tools.join(', ')} for this problem.\n` +
         `Based on ${this.positions.length} positions and ${this.arguments.length} arguments.`;
}
```

### 6. Message Flow Example

#### Step 1: User Initiates Debate

```
User: mfr-debate Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions.
```

#### Step 2: Coordinator → Chair

```
Coordinator: Issue: Which tools and agents should we use to solve this problem?

Problem: Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions.

Available agents: Mistral (NLP), Data (Wikidata), Prolog (logic), MFR-Semantic (constraints)

Please provide:
- Position: I recommend [agent] because...
- Support: [Agent] would help because...
- Objection: [Agent] may not work because...
```

#### Step 3: Agents Participate

```
Mistral: Position: Use Data agent for drug information lookup because warfarin and aspirin are well-documented in Wikidata.

Data: Support: I can ground drug entities and retrieve interaction data from Wikidata's pharmaceutical ontology.

Prolog: Position: Use Prolog for scheduling constraints because appointment scheduling is a classic constraint satisfaction problem.

MFR-Semantic: Support: I can extract drug interaction constraints from medical ontologies to feed into the planning phase.

Human (optional): Position: We should also use MFR-Semantic to ensure we catch all safety constraints, not just known drug interactions.
```

#### Step 4: Chair Detects Consensus

```
Chair: IBIS summary
Issue: Which tools and agents should we use to solve this problem
- Position: Use Data agent for drug information lookup
- Position: Use Prolog for scheduling constraints
- Position: Use MFR-Semantic for safety constraints
- Support: Data can ground drug entities
- Support: Prolog excels at constraint satisfaction
- Support: MFR-Semantic can extract constraints

Consensus reached: Use Data, Prolog, MFR-Semantic for this problem.
Based on 3 positions and 3 supporting arguments.
```

#### Step 5: Coordinator Proceeds with Selected Tools

```
Coordinator: MFR session started: abc-123
Requesting contributions from agreed-upon agents: Data, Prolog, MFR-Semantic
```

## Implementation Phases

### Phase 1: Basic Integration (Minimal Viable Product) ✅ COMPLETE

**Implemented:**
1. ✅ Added `TOOL_SELECTION_DEBATE` phase to MFR constants
2. ✅ Added `debate` command to Coordinator (config: `mfr:enableDebate` in coordinator profile)
3. ✅ Coordinator formats debate issue and sends to general room
4. ✅ Chair agent responds to all messages to detect debate issues (`respondToAll: true`, `maxAgentRounds: 0`)
5. ✅ Chair agent participates using existing IBIS detection
6. ✅ Added tool extraction methods to Chair (`extractToolRecommendations()`, `detectToolConsensus()`)
7. ✅ Configured timeout with fallback to all agents (`mfr:debateTimeout`)
8. ✅ Zero breaking changes - existing `mfr-start` workflow unchanged

**Files Modified:**
- `src/lib/mfr/constants.js` - New phase and transitions
- `src/agents/providers/coordinator-provider.js` - Debate session management
- `src/services/coordinator-agent.js` - Feature flag integration
- `src/agents/providers/chair-provider.js` - Tool extraction, consensus detection, and MFR-specific debate detection
- `src/services/chair-agent.js` - Added `respondToAll: true` to detect debate issues
- `test/mfr-debate.integration.test.js` - Comprehensive test suite (10/10 tests passing)

**Key Implementation Details:**
1. The Chair has `maxAgentRounds: 0` to disable agent-rounds limiting - this ensures Chair can see ALL messages including broadcasts from Coordinator (another agent)
2. The Chair checks for MFR debate patterns ("which tools and agents should we use", "available agents:") BEFORE general IBIS detection
3. The Chair ignores the `debate` command itself (returns null) so it doesn't interfere with Coordinator processing it

**Deliverable:** ✅ Chair can track debate, humans can guide tool selection, automated timeout

### Phase 2: Automated Consensus (COMPLETE)

**Implemented:**
1. ✅ Basic consensus detection in Chair agent (majority voting on tool names)
2. ✅ Chair automatically emits a consensus message when tools are agreed
3. ✅ Coordinator extracts selected tools from consensus message
4. ✅ Coordinator filters contribution requests to selected agents

**Deliverable:** Automatic tool selection based on debate

### Phase 3: Agent-Aware Debate

1. Extend IBIS detection with MFR tool vocabulary
2. Agents can express tool recommendations in structured way
3. Chair recognizes agent-specific position patterns
4. Better extraction of tool names from natural language

**Deliverable:** Agents actively participate in tool selection

### Phase 4: Advanced Features

1. Debate timeout with fallback to all-agents approach
2. Weighted voting (expert agents have more influence in their domain)
3. Learning from past debates (which tool combinations worked well)
4. Visual debate summary in Turtle/RDF for audit trail
5. Multi-round debates for complex problems

**Deliverable:** Production-ready debate-driven MFR

## Benefits

### For Users
- **Transparency**: See *why* certain tools were selected
- **Control**: Guide the system toward preferred approaches
- **Education**: Learn which tools are appropriate for which problems

### For Agents
- **Specialization**: Agents can advocate for their strengths
- **Collaboration**: Agents can defer to others' expertise
- **Efficiency**: Avoid unnecessary work on irrelevant tasks

### For the System
- **Adaptability**: Tool selection adapts to problem characteristics
- **Auditability**: Complete record of decision rationale in IBIS format
- **Extensibility**: New agents can participate without coordinator changes
- **Human-in-the-loop**: Natural integration point for human oversight

## Challenges & Solutions

### Challenge 1: Debate Takes Too Long

**Solution:**
- Set reasonable timeout (30-60 seconds)
- Fallback to all-agents if no consensus
- Cache consensus for similar problems

### Challenge 2: Agents Don't Participate

**Solution:**
- Each agent has a default position about its capabilities
- Coordinator can prompt non-responding agents
- Use agent profiles to infer recommendations

### Challenge 3: Conflicting Positions

**Solution:**
- Chair facilitates argument exchange
- Allow objections to be addressed
- Human can break ties
- Majority vote as fallback

### Challenge 4: Integration Complexity

**Solution:**
- Make debate phase optional (flag in coordinator)
- Preserve existing direct-contribution path
- Gradual rollout: start with logging only

## Example Use Cases

### Use Case 1: Medical Problem (High Stakes)

**Scenario:** Drug interaction checking requires validated data sources

**Debate outcome:**
- Consensus to use Data agent (Wikidata) + MFR-Semantic (medical ontologies)
- Objection to using Mistral for medical facts (hallucination risk)
- Human confirms: "Agreed, use only verified sources"

**Result:** Higher confidence in solution, appropriate tool selection

### Use Case 2: Creative Problem (Low Stakes)

**Scenario:** Plan a dinner party with dietary restrictions

**Debate outcome:**
- Quick consensus: Mistral for recipe suggestions, Prolog for constraint checking
- No objections, debate concludes in 15 seconds

**Result:** Fast tool selection, appropriate for informal problem

### Use Case 3: Novel Problem (Unknown Territory)

**Scenario:** Problem type not seen before

**Debate outcome:**
- Multiple positions proposed
- Arguments exchanged about tool applicability
- Human provides domain expertise: "This is actually a graph problem"
- Consensus: Use Data agent for graph structure, Prolog for traversal

**Result:** System adapts to new problem class with human guidance

## Technical Considerations

### RDF Representation

Debate outcomes can be serialized as RDF:

```turtle
@prefix mfr: <http://purl.org/stuff/mfr/> .
@prefix ibis: <http://purl.org/stuff/ibis/> .
@prefix schema: <http://schema.org/> .

<#debate-session-123> a mfr:ToolSelectionDebate ;
  mfr:forProblem <#problem-456> ;
  ibis:hasIssue [
    schema:name "Which tools should solve this problem?" ;
    schema:description "Schedule appointments with drug interaction checking"
  ] ;
  ibis:hasPosition [
    schema:name "Use Data agent for drug lookup" ;
    schema:author <#agent-data> ;
    mfr:recommendsTool <#tool-data-agent>
  ] ;
  ibis:hasArgument [
    schema:name "Data agent can access Wikidata pharmaceutical data" ;
    ibis:supports <#position-1> ;
    ibis:argumentType ibis:Support
  ] ;
  mfr:consensusReached true ;
  mfr:selectedTools ( <#tool-data-agent> <#tool-prolog> <#tool-mfr-semantic> ) .
```

### Lingue Mode Negotiation

Debate phase uses existing Lingue modes:
- `lng:HumanChat` - For natural language debate
- `lng:IBISText` - For structured Issue/Position/Argument
- `lng:ModelNegotiation` - For tool selection metadata

Agents negotiate which mode to use for debate participation.

### Performance Impact

**Minimal for simple problems:**
- 30-second debate with quick consensus
- Fallback to direct contribution on timeout

**Valuable for complex problems:**
- Prevents wasted computation on wrong tools
- Explicit rationale prevents repeated debates for similar problems

## Future Extensions

1. **Multi-stage debates:** Debate tool selection, then debate solution approaches
2. **Debate learning:** Record which tool combinations worked well
3. **Confidence levels:** Agents express uncertainty about recommendations
4. **Debate replay:** Visualize debate history for education/audit
5. **Cross-language debates:** Humans participate in their native language
6. **Formal argumentation:** Use argumentation frameworks for conflict resolution

## Conclusion

Integrating the Chair agent into MFR creates a more transparent, collaborative, and adaptable problem-solving system. The debate phase allows explicit discussion of tool selection, providing:

- **Transparency** in decision-making
- **Human oversight** at a natural intervention point
- **Agent collaboration** based on expertise
- **Audit trails** in structured IBIS format

The implementation is gradual, with Phase 1 complete and working in production.

---

**Status:** ✅ Phase 1 Implemented and Tested (Dec 24, 2025)
- Feature enabled by default in `config/agents/coordinator.ttl`
- Backward compatible (zero breaking changes)
- 10/10 integration tests passing
- Ready for production use

**Dependencies:**
- ✅ Chair agent (implemented)
- ✅ IBIS detection (implemented)
- ✅ MFR coordinator (implemented)
- ✅ Feature flag system (implemented)

**Next Steps:**
- Phase 2: Automatic consensus notification from Chair to Coordinator
- Phase 2: Agent filtering based on consensus
- Phase 3: Enhanced IBIS detection with MFR vocabulary
- Phase 4: Advanced features (multi-round debates, learning, etc.)
