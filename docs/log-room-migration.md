# Log Room Migration Plan

## Overview
The system now has infrastructure for a separate log room (`log@conference.tensegrity.it`) where verbose/technical messages should be sent instead of cluttering the main chat room.

## Infrastructure Completed
- ✅ `XmppRoomAgent.sendToRoom(roomJid, message)` - Send to any room
- ✅ `XmppRoomAgent.joinAdditionalRoom(roomJid)` - Join secondary rooms
- ✅ `AgentRunner.sendToLog(message)` - Helper to send to log room
- ✅ `AgentRunner` auto-joins log room on startup
- ✅ `sendToLog` passed to providers via `handle()` method

## Messages That Should Move to Log Room

### High Priority (Technical/Verbose):
1. **RDF Payloads** - Full Turtle/RDF content from MFR contributions
   - Currently: Sent via MODEL_FIRST_RDF to main room
   - Should: Also log to log room with session ID and contributor name

2. **Action Schemas** - JSON action definitions
   - Currently: "Action schema from Golem for {sessionId}" in main room
   - Should: Full schema JSON in log room, brief confirmation in main

3. **Prolog Code** - Generated Prolog programs
   - Currently: May be sent to main room during execution
   - Should: Full Prolog code in log room

4. **Role Assignment Details** - Full role info including system prompts
   - Currently: "Role assignment: Medical Diagnostician for Golem" in main room
   - Should: Full assignment details (systemPrompt, capabilities, rationale) in log room

5. **Validation Reports** - SHACL validation detailed results
   - Currently: May be verbose in main room
   - Should: Full reports in log room, summary in main

### Medium Priority (Status Messages):
6. **MFR Contribution Notifications**
   - Currently: "MFR contribution from Golem"
   - Keep in main room but Chair now ignores them

7. **Solution Proposals**
   - Currently: Full solution details in main room
   - Consider: Summary in main, full details in log

8. **Session State Transitions**
   - Currently: "MFR session started", "Phase transition to constraint_identification"
   - Consider: Log room only, except session complete

### Low Priority (Keep in Main Room):
9. **Consensus Reached** - Should stay visible
10. **Human-facing Explanations** - Generated for user understanding
11. **Error Messages** - Users need to see these

## Implementation Strategy

### For Lingue-based Messages:
Modify `LingueNegotiator.send()` to:
1. Send technical payload to log room
2. Send simplified summary to main room
3. Add flag to control verbose logging

### For Direct Messages:
Use `sendToLog()` in providers:
```javascript
// Example in Golem agent
const roleDetails = `
Role: ${assignment.name}
Domain: ${assignment.domain}
System Prompt: ${assignment.systemPrompt}
Capabilities: ${assignment.capabilities.join(', ')}
`;
await sendToLog(`[Role Assignment]\n${roleDetails}`);
```

### For Coordinator:
Modify coordinator to log:
- Full RDF models before/after merging
- SHACL validation details
- Prolog programs generated for reasoning

## Configuration
- Default log room: `log@conference.tensegrity.it`
- Can be overridden via `logRoomJid` parameter to AgentRunner
- Set to `null` to disable log room entirely

## Testing
1. Start agents with log room enabled
2. Run MFR session
3. Monitor main room (should be less cluttered)
4. Monitor log room (should have technical details)
5. Verify no information loss
