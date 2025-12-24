# MFR Debate Integration: Agent Requirements & Backward Compatibility

## Executive Summary

This document analyzes the capabilities needed to add debate-driven tool selection to MFR, ensuring **zero breaking changes** to the existing system. The debate phase is **completely optional** - agents that don't implement debate features will continue to work exactly as they do now.

## Core Principle: Optional Enhancement

**The debate integration must be additive, not disruptive:**

1. ✅ Existing `mfr-start` command continues to work unchanged
2. ✅ New `mfr-debate` command is opt-in
3. ✅ Agents that don't understand debate messages simply ignore them
4. ✅ If no consensus is reached, fall back to current broadcast approach
5. ✅ All existing tests continue to pass

## Current Agent Capabilities (From Contracts)

### Coordinator Agent

**Current capabilities:**
- Accepts `mfr-start <problem>` commands
- Broadcasts `mfr:ModelContributionRequest`
- Collects RDF contributions
- Validates merged model with SHACL
- Requests solutions via `mfr:SolutionRequest`
- Returns `mfr:SessionComplete`

**Lingue modes:** `lng:ModelNegotiation`, `lng:ModelFirstRDF`, `lng:HumanChat`

### Mistral Agent

**Current capabilities:**
- Receives `mfr:ModelContributionRequest`
- Extracts entities and goals from problem text
- Emits `mfr:Entity` and `mfr:Goal` RDF
- Provides natural language explanations

**Lingue modes:** `lng:ModelNegotiation`, `lng:ModelFirstRDF`, `lng:HumanChat`

### Data Agent

**Current capabilities:**
- Receives `mfr:ModelContributionRequest`
- Extracts named entities
- Grounds entities in Wikidata
- Emits `mfr:Entity` with `owl:sameAs` links

**Lingue modes:** `lng:ModelNegotiation`, `lng:ModelFirstRDF`

### Prolog Agent

**Current capabilities:**
- Receives `mfr:ModelContributionRequest`
- Consumes action schemas
- Emits `mfr:Action` RDF with preconditions/effects
- Generates solution plans

**Lingue modes:** `lng:ModelNegotiation`, `lng:ModelFirstRDF`, `lng:PrologProgram`

### MFR-Semantic Agent

**Current capabilities:**
- Receives `mfr:ModelContributionRequest`
- Extracts constraints from problem text
- Emits `mfr:Constraint` RDF

**Lingue modes:** `lng:ModelNegotiation`, `lng:ModelFirstRDF`

### Chair Agent

**Current capabilities:**
- Detects IBIS structure (Issue/Position/Argument)
- Tracks debate state
- Summarizes positions and arguments
- Responds to "status" and "consensus" queries

**Lingue modes:** `lng:HumanChat`, `lng:IBISText`

## Required Changes Per Agent (Minimal)

### 1. Coordinator Agent

**New capability:** Handle `mfr-debate` command

**Implementation:**
```javascript
// In coordinator-provider.js
async handle({ command, content, metadata, reply }) {
  switch (command) {
    case "mfr-start":
    case "start":
      return await this.startMfrSession(content, metadata, reply);

    // NEW - completely separate from existing flow
    case "mfr-debate":
    case "debate":
      return await this.startDebateSession(content, metadata, reply);

    // ... existing cases unchanged
  }
}

async startDebateSession(problemDescription, metadata, reply) {
  // NEW method - doesn't touch existing startMfrSession()
  const sessionId = randomUUID();

  // Format debate issue for Chair
  const debateMessage = `Issue: Which tools should we use to solve this problem?\n\n` +
    `Problem: ${problemDescription}\n\n` +
    `Available agents: Mistral (NLP), Data (Wikidata), Prolog (logic), MFR-Semantic (constraints)\n\n` +
    `Please respond with:\n` +
    `- Position: I recommend [agent] because...\n` +
    `- Support: [reason]\n` +
    `- Objection: [concern]`;

  await this.sendStatusMessage(debateMessage);

  // Store session with debate flag
  this.activeSessions.set(sessionId, {
    type: 'debate',
    problemDescription,
    startTime: Date.now()
  });

  return `Debate started for session ${sessionId}\nWaiting for positions...`;
}
```

**New message type:**
```javascript
// In src/lib/mfr/constants.js
export const MFR_MESSAGE_TYPES = {
  // ... existing types unchanged ...

  // NEW - optional debate message type
  TOOL_RECOMMENDATION: `${MFR_NS}ToolRecommendation`,  // Optional
};
```

**New phase (optional):**
```javascript
export const MFR_PHASES = {
  // ... existing phases unchanged ...

  // NEW - optional phase
  TOOL_SELECTION_DEBATE: 'tool_selection_debate',  // Optional
};

// Phase transitions - debate is optional path
export const VALID_PHASE_TRANSITIONS = {
  [MFR_PHASES.PROBLEM_INTERPRETATION]: [
    MFR_PHASES.TOOL_SELECTION_DEBATE,  // NEW optional path
    MFR_PHASES.ENTITY_DISCOVERY         // Existing path - still works!
  ],

  [MFR_PHASES.TOOL_SELECTION_DEBATE]: [
    MFR_PHASES.ENTITY_DISCOVERY
  ],

  // ... rest unchanged
};
```

**Backward compatibility:**
- `mfr-start` continues to work exactly as before
- `mfr-debate` is a new, separate code path
- Existing tests don't need changes

### 2. Chair Agent

**New capability:** Understand MFR tool names

**Implementation:**
```javascript
// In chair-provider.js - ADD new method, don't modify existing ones

// NEW method - optional enhancement
extractToolRecommendations() {
  const MFR_AGENTS = ['mistral', 'data', 'prolog', 'semantic', 'mfr-semantic'];
  const recommendations = new Map();

  this.positions.forEach(position => {
    const text = position.text.toLowerCase();
    MFR_AGENTS.forEach(agent => {
      if (text.includes(agent)) {
        recommendations.set(agent, (recommendations.get(agent) || 0) + 1);
      }
    });
  });

  return recommendations;
}

// NEW method - optional enhancement
detectToolConsensus() {
  const recommendations = this.extractToolRecommendations();
  const totalPositions = this.positions.length;

  if (totalPositions === 0) return { reached: false };

  const agreedTools = [];
  for (const [tool, count] of recommendations) {
    if (count > totalPositions / 2) {
      agreedTools.push(tool);
    }
  }

  const hasUnresolvedObjections = this.arguments.some(arg =>
    arg.stance === 'object' && !this.isResolved(arg)
  );

  if (agreedTools.length > 0 && !hasUnresolvedObjections) {
    return {
      reached: true,
      tools: agreedTools,
      summary: `Consensus: ${agreedTools.join(', ')}`
    };
  }

  return { reached: false };
}

// MODIFY existing handle method - add new capability
async handle({ content, rawMessage, metadata }) {
  const text = content || rawMessage || "";
  const structure = detectIBISStructure(text);

  // Existing IBIS detection - unchanged
  if (structure.confidence >= 0.5 &&
      (structure.issues.length || structure.positions.length || structure.arguments.length)) {
    this.updateState(structure, text, metadata.sender);
    const summary = summarizeIBIS(structure);
    return `Noted. ${summary}`;
  }

  // Existing debate controls - unchanged
  const lower = text.toLowerCase();
  if (lower.includes("start debate") || lower.startsWith("issue:")) {
    // ... existing code unchanged
  }

  // NEW - check for consensus request (backward compatible)
  if (lower.includes("consensus") || lower.includes("tool consensus")) {
    const consensus = this.detectToolConsensus();
    if (consensus.reached) {
      return `${consensus.summary}\nBased on ${this.positions.length} positions.`;
    }
    return this.summarizeState();  // Existing fallback
  }

  // Existing default - unchanged
  return `Please contribute Position: ... or Argument: ...`;
}
```

**Backward compatibility:**
- Existing IBIS detection unchanged
- New tool extraction is optional
- If no tool names mentioned, falls back to regular IBIS summary

### 3. Mistral Agent (Optional Enhancement)

**New capability:** Express tool recommendations (OPTIONAL)

**Implementation:**
```javascript
// In mistral-provider.js - NEW method, completely optional

// NEW - optional method for debate participation
async handleDebateParticipation(problemDescription) {
  // This is OPTIONAL - agent can choose not to implement
  // If not implemented, agent just doesn't participate in debate

  const prompt = `Problem: ${problemDescription}\n\n` +
    `As an NLP agent, should you be used for this problem?\n` +
    `Respond with: "Position: I recommend [agent] because..." or "I defer"`;

  const response = await this.callMistralAPI(prompt);

  return response; // Send to chat room
}

// EXISTING handle method - unchanged
async handle({ command, content, metadata }) {
  // All existing code unchanged
  // Debate participation is a separate method
}
```

**Backward compatibility:**
- Completely optional - if not implemented, agent works as before
- Existing contribution flow unchanged
- Agent chooses whether to participate in debates

### 4. Data Agent (Optional Enhancement)

Similar pattern to Mistral - optional debate participation method:

```javascript
// NEW optional method
async handleDebateParticipation(problemDescription) {
  // Detect if problem mentions entities that need grounding
  const needsGrounding = this.detectNamedEntities(problemDescription).length > 0;

  if (needsGrounding) {
    return `Position: I recommend Data agent because the problem mentions entities ` +
           `that should be grounded in Wikidata for factual accuracy.`;
  }

  return null; // Don't participate if not relevant
}
```

**Backward compatibility:**
- Optional method
- Existing code unchanged

### 5. Prolog Agent (Optional Enhancement)

```javascript
// NEW optional method
async handleDebateParticipation(problemDescription) {
  // Detect constraint satisfaction keywords
  const hasConstraints = /schedule|plan|allocate|assign|optimize/.test(
    problemDescription.toLowerCase()
  );

  if (hasConstraints) {
    return `Position: I recommend Prolog agent because this is a constraint ` +
           `satisfaction problem that requires logical reasoning.`;
  }

  return null;
}
```

**Backward compatibility:**
- Optional method
- Existing code unchanged

### 6. MFR-Semantic Agent (Optional Enhancement)

```javascript
// NEW optional method
async handleDebateParticipation(problemDescription) {
  // Detect constraint language
  const hasConstraints = /must|require|ensure|constraint|rule|policy/.test(
    problemDescription.toLowerCase()
  );

  if (hasConstraints) {
    return `Position: I recommend MFR-Semantic agent because explicit ` +
           `constraints need to be identified and validated.`;
  }

  return null;
}
```

**Backward compatibility:**
- Optional method
- Existing code unchanged

## Implementation Strategy: Zero Breaking Changes

### Phase 1: Infrastructure (Coordinator + Chair)

**Goal:** Add debate capability without changing existing MFR flow

**Changes:**
1. Add `mfr-debate` command to Coordinator (new code path)
2. Add tool extraction to Chair (new methods, existing unchanged)
3. Add new message type and phase constants
4. Update phase transition map (additive only)

**Testing:**
```bash
# Existing tests must pass unchanged
npm test

# New tests for debate feature
npm test -- test/mfr-debate.test.js
```

**Success criteria:**
- All existing tests pass
- `mfr-start` works identically to before
- `mfr-debate` command exists but doesn't break anything

### Phase 2: Optional Agent Participation

**Goal:** Agents can optionally participate in debates

**Changes:**
1. Add optional `handleDebateParticipation()` to agent providers
2. Agents check if they want to participate
3. Non-participating agents simply don't respond

**Testing:**
```javascript
// Test that debate works with NO agent participation
test('debate falls back to broadcast when no agents participate', async () => {
  // Start debate session
  // Wait for timeout
  // Verify it falls back to normal MFR flow
});

// Test that debate works with SOME agent participation
test('debate works with partial agent participation', async () => {
  // Mistral participates, others don't
  // Should still work
});
```

**Success criteria:**
- System works if zero agents participate
- System works if some agents participate
- Existing contribution flow unchanged

### Phase 3: Integration Testing

**Goal:** Verify debate enhances but doesn't break MFR

**Test scenarios:**
```javascript
// Scenario 1: User uses old command (existing behavior)
test('mfr-start works exactly as before', async () => {
  const result = await coordinator.handle({
    command: 'mfr-start',
    content: 'Schedule appointments...'
  });

  // Verify it broadcasts to all agents immediately
  // Verify no debate phase entered
  // Verify solution produced
});

// Scenario 2: User uses new command (new behavior)
test('mfr-debate enables debate phase', async () => {
  const result = await coordinator.handle({
    command: 'mfr-debate',
    content: 'Schedule appointments...'
  });

  // Verify debate issue posted
  // Verify agents can participate
  // Verify fallback to broadcast on timeout
});

// Scenario 3: Mixed environment
test('old and new agents coexist', async () => {
  // Some agents have debate capability
  // Some agents don't
  // System works correctly
});
```

## Configuration: Debate as Feature Flag

Make debate completely optional via configuration:

```javascript
// In coordinator-provider.js

constructor({ enableDebate = false, ...rest }) {
  this.enableDebate = enableDebate;
  // ...
}

async handle({ command, content, metadata, reply }) {
  switch (command) {
    case "mfr-debate":
    case "debate":
      if (!this.enableDebate) {
        return "Debate feature not enabled. Use 'mfr-start' instead.";
      }
      return await this.startDebateSession(content, metadata, reply);

    // ... rest unchanged
  }
}
```

**Configuration sources:**
```turtle
# In config/agents/coordinator.ttl
@prefix mfr: <http://purl.org/stuff/mfr/> .

<#coordinator> a agent:ConversationalAgent ;
  agent:nickname "Coordinator" ;
  mfr:enableDebate true ;  # NEW optional flag
  # ... existing config
```

Or via environment:
```bash
MFR_ENABLE_DEBATE=true node src/services/coordinator-agent.js
```

## Backward Compatibility Checklist

- [ ] All existing unit tests pass unchanged
- [ ] All existing integration tests pass unchanged
- [ ] `mfr-start` command works identically to before
- [ ] Agents without debate methods work unchanged
- [ ] Message format unchanged for existing types
- [ ] RDF ontology unchanged (debate uses existing IBIS vocabulary)
- [ ] Phase transitions allow both paths (debate and direct)
- [ ] Timeout behavior preserved
- [ ] SHACL validation unchanged
- [ ] Solution generation unchanged
- [ ] Human-readable output format unchanged

## Migration Path

### Step 1: Deploy Infrastructure (No Impact)
```bash
# Deploy coordinator with debate feature flag OFF
MFR_ENABLE_DEBATE=false node src/services/coordinator-agent.js
```
- System works exactly as before
- New code present but not active

### Step 2: Enable Feature (Opt-in)
```bash
# Enable debate feature
MFR_ENABLE_DEBATE=true node src/services/coordinator-agent.js
```
- Users can use `mfr-debate` if they want
- Users can still use `mfr-start` (unchanged)

### Step 3: Add Agent Capabilities (Gradual)
- Update Mistral agent with debate participation
- Test in isolation
- Update other agents one at a time
- Each agent update is independent

### Step 4: Full Rollout
- All agents have debate capability
- Users choose `mfr-start` or `mfr-debate`
- Both workflows fully supported

## New Contract Additions (Optional)

### Coordinator Agent Contract Addendum

**New inputs (optional):**
- `mfr-debate <problem>` command

**New outputs (optional):**
- Debate issue formatted for Chair
- Tool recommendation summary

**New phases (optional):**
- `TOOL_SELECTION_DEBATE`

**Backward compatibility:**
- All existing inputs/outputs unchanged
- New inputs/outputs are additive

### Agent Contract Addendum (All Agents - Optional)

**New method (optional):**
```javascript
async handleDebateParticipation(problemDescription) {
  // Optional: Return position/support/objection
  // Or: Return null to not participate
}
```

**Backward compatibility:**
- Method is completely optional
- If not implemented, agent works as before
- No breaking changes to existing contract

## Risk Mitigation

### Risk 1: Debate breaks existing MFR flow

**Mitigation:**
- Separate code paths (`mfr-start` vs `mfr-debate`)
- Feature flag to disable debate entirely
- Comprehensive regression tests

**Rollback plan:**
- Set `MFR_ENABLE_DEBATE=false`
- System returns to original behavior

### Risk 2: Agents break when they don't understand debate

**Mitigation:**
- Debate participation is optional method
- Agents without method just don't participate
- System works with zero debate participants

**Rollback plan:**
- Remove optional methods from agents
- Core functionality unchanged

### Risk 3: Chair agent changes break IBIS detection

**Mitigation:**
- Tool extraction is new method
- Existing IBIS methods unchanged
- Extensive tests for existing behavior

**Rollback plan:**
- Remove new methods
- Chair continues to work for regular debates

## Conclusion

The debate integration can be added with **zero breaking changes** by following these principles:

1. **Additive only**: New commands, new methods, new phases - nothing removed or changed
2. **Optional everywhere**: Debate is opt-in, agent participation is optional
3. **Separate code paths**: `mfr-start` and `mfr-debate` don't interfere
4. **Feature flags**: Can be disabled entirely if needed
5. **Gradual rollout**: Infrastructure first, agents later, fully independent

**Current system capabilities:** Unchanged, fully preserved
**New system capabilities:** Debate-driven tool selection, optional, additive

The implementation can proceed incrementally with confidence that existing functionality will not be impacted.
