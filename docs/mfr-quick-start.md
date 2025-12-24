# MFR Quick Start Tutorial

Get started with the TIA Model-First Reasoning system in 10 minutes.

## Prerequisites

- Node.js v18+
- XMPP server (Prosody) running
- Mistral API key

## Step 1: Install Dependencies

```bash
cd /path/to/tia
npm install
```

## Step 2: Configure Secrets

Create `config/agents/secrets.json`:

```json
{
  "coordinator": "secure_password_1",
  "mistral": "secure_password_2",
  "data": "secure_password_3",
  "prolog": "secure_password_4",
  "semem": "secure_password_5"
}
```

Create `.env`:

```bash
MISTRAL_API_KEY=your_mistral_api_key_here
XMPP_SERVICE=xmpp://tensegrity.it:5222
XMPP_DOMAIN=tensegrity.it
```

## Step 3: Create MUC Rooms

```bash
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

## Step 4: Start the MFR System

```bash
./start-mfr-system.sh
```

This starts:
- Coordinator (orchestrator)
- Mistral (natural language)
- Data (knowledge grounding)
- Prolog (logical reasoning)
- Semem (semantic reasoning) - if configured

Check logs:
```bash
tail -f logs/coordinator.log
```

## Step 5: Run Your First MFR Session

### Example 1: Simple Scheduling

```bash
node src/examples/run-mfr-session.js \
  "Schedule meetings for Alice, Bob, and Carol. Alice is only available in the morning."
```

**What Happens**:
1. Coordinator receives problem, creates session
2. Mistral extracts entities (Alice, Bob, Carol)
3. Data grounds entities (if available in Wikidata)
4. Prolog defines scheduling actions
5. Semem identifies time constraints
6. Model is validated
7. Solution is generated

### Example 2: Medical Appointments

```bash
node src/examples/run-mfr-session.js \
  "Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions."
```

**What Happens**:
1. Entity extraction: patients and drugs
2. Entity grounding: drugs linked to Wikidata
3. Relationship discovery: drug interaction data
4. Constraint identification: interaction constraints
5. Solution with safety considerations

### Example 3: Resource Allocation

```bash
node src/examples/run-mfr-session.js \
  "Allocate 3 servers to 5 tasks: database, web, cache, worker, backup. Database needs high memory."
```

## Step 6: Monitor the Session

Watch the MFR protocol phases:

```bash
tail -f logs/coordinator.log logs/mistral.log logs/data.log logs/prolog.log
```

**Phases You'll See**:
1. ✅ Initialization
2. 🔍 Entity Discovery
3. 🔗 Relationship Discovery
4. ⚙️  Action Definition
5. 🚫 Constraint Identification
6. 🎯 Model Validation
7. 🧠 Constrained Reasoning
8. ✨ Solution Delivery

## Understanding the Output

### Session Started
```
🎯 [Coordinator]
MFR session started: session-abc123
Broadcasting contribution request...
```

### Agent Contributions
```
💬 [Mistral]
Extracted 3 entities: Alice, Bob, Carol

💬 [Data]
Grounded entity Alice to http://www.wikidata.org/entity/Q...

💬 [Prolog]
Defined 2 actions: schedule, assign

💬 [Semem]
Identified 1 constraint: temporal availability
```

### Validation
```
🎯 [Coordinator]
Model validation: PASS
Entities: 3, Actions: 2, Constraints: 1
Transitioning to constrained reasoning...
```

### Solution
```
🎯 [Coordinator]
Solution generated:
1. Schedule Alice at 9:00 AM
2. Schedule Bob at 2:00 PM
3. Schedule Carol at 11:00 AM
```

## Common Patterns

### Pattern 1: Scheduling with Constraints

**Problem Template**:
```
Schedule [entities] with [constraints].
[Entity 1] requires/prefers [constraint 1].
[Entity 2] must/cannot [constraint 2].
```

**Example**:
```
Schedule meetings for team members. Alice is only available in mornings. Bob needs 2-hour slots. Carol can't meet before Bob.
```

### Pattern 2: Resource Allocation

**Problem Template**:
```
Allocate [resources] to [tasks].
[Task 1] needs [requirement 1].
[Task 2] requires [requirement 2].
```

**Example**:
```
Allocate 3 servers to 5 tasks.
Database needs high memory.
Web server needs good network.
Cache and worker can share.
```

### Pattern 3: Planning with Dependencies

**Problem Template**:
```
Plan [sequence] from [start] to [end].
[Step 1] must happen before [Step 2].
[Constraint] applies to [step].
```

**Example**:
```
Plan project phases for product launch.
Requirements must be complete before design.
Design must be approved before development.
Budget is $100k, deadline is 6 months.
```

## Troubleshooting

### Agents Not Responding

**Check**: Are all agents running?
```bash
ps aux | grep node
```

**Fix**: Restart the system
```bash
pkill -f 'node src/services'
./start-mfr-system.sh
```

### Session Timeout

**Check**: API rate limits
- Mistral API: 60 requests/minute
- Wikidata: Rate limited

**Fix**: Simplify problem or add delays
```javascript
// In run-mfr-session.js, increase timeout
const TIMEOUT_MS = 120000; // 2 minutes
```

### Validation Failures

**Check**: Model completeness
```bash
grep "validation" logs/coordinator.log
```

**Fix**: Ensure all agents contributed
- Entities (Mistral + Data)
- Actions (Prolog)
- Constraints (Semem)
- Goals (Mistral)

### Connection Errors

**Check**: XMPP server status
```bash
prosodyctl status
```

**Fix**: Restart Prosody
```bash
sudo systemctl restart prosody
```

## Next Steps

### 1. Run Integration Test

```bash
node src/examples/test-mfr-session.js
```

This comprehensive test validates the entire MFR flow.

### 2. Try Complex Problems

**Multi-Constraint Scheduling**:
```bash
node src/examples/run-mfr-session.js \
  "Schedule 5 tasks with resource constraints, time dependencies, and priority ordering. Task A requires resource X and must complete before Task B. Task C has highest priority. Tasks D and E can run in parallel but need separate resources."
```

**Supply Chain Optimization**:
```bash
node src/examples/run-mfr-session.js \
  "Optimize delivery routes for 3 trucks serving 10 locations. Truck 1 has capacity 100, Truck 2 has capacity 150, Truck 3 has capacity 200. Location A needs delivery before 10 AM. Locations B and C must use same truck."
```

### 3. Extend the System

**Add Custom Agent**:
1. Create provider in `src/agents/providers/`
2. Implement `handleMfrContributionRequest()`
3. Create profile in `config/agents/`
4. Add to `start-mfr-system.sh`

**Add Custom Constraints**:
1. Edit `vocabs/mfr-shapes.ttl`
2. Add new SHACL shapes
3. Restart coordinator

**Add Custom Ontology**:
1. Edit `vocabs/mfr-ontology.ttl`
2. Add new classes/properties
3. Update agent providers

### 4. Monitor Performance

**Session Statistics**:
```javascript
const stats = store.getSessionStatistics(sessionId);
console.log(`Duration: ${stats.durationMs}ms`);
console.log(`Contributors: ${stats.contributors.length}`);
console.log(`Contributions: ${stats.contributions}`);
```

**Phase Timing**:
```javascript
const entityDiscoveryTime = state.getPhaseDuration(MFR_PHASES.ENTITY_DISCOVERY);
const validationTime = state.getPhaseDuration(MFR_PHASES.MODEL_VALIDATION);
console.log(`Entity discovery: ${entityDiscoveryTime}ms`);
console.log(`Validation: ${validationTime}ms`);
```

## Tips for Best Results

1. **Be Specific**: Clear problem descriptions get better results
   - ❌ "Schedule some meetings"
   - ✅ "Schedule 3 meetings for Alice, Bob, and Carol with specific time constraints"

2. **State Constraints Explicitly**: Don't assume agents will infer constraints
   - ❌ "Schedule meetings efficiently"
   - ✅ "Schedule meetings. Alice only available mornings. Bob needs 2-hour slots."

3. **Use Domain Terms**: Agents recognize common domain vocabulary
   - Medical: patient, drug, interaction, appointment
   - Logistics: truck, route, capacity, delivery
   - Project: task, resource, dependency, milestone

4. **Start Simple**: Test with simple problems before complex ones
   - Start: 3 entities, 2 constraints
   - Then: 5 entities, 4 constraints, 2 dependencies
   - Finally: 10+ entities, complex constraint networks

5. **Check Logs**: Agents log their reasoning
   ```bash
   grep "extracted" logs/mistral.log
   grep "grounded" logs/data.log
   grep "defined" logs/prolog.log
   grep "constraint" logs/semem.log
   ```

## Resources

- **Architecture**: `docs/mfr-architecture-overview.md`
- **Usage Guide**: `docs/mfr-usage-guide.md`
- **API Reference**: `docs/mfr-api-reference.md`
- **Implementation**: `MFR_IMPLEMENTATION_SUMMARY.md`

## Support

- Check `logs/` directory for detailed agent activity
- Review XMPP server logs for connection issues
- Examine RDF models in coordinator logs
- File issues on project repository

---

**Congratulations!** You've completed the MFR Quick Start. You now have a working multi-agent system that collaboratively constructs explicit problem models before reasoning.
