# Lingue Protocol Integration Plan

> **Status**: Planning Phase
> **Updated**: 2024-12-19
> **Goal**: Full Lingue protocol support with modular, NPM-ready architecture

## Overview

Integrate complete Lingue protocol support into TIA, enabling structured agent-to-agent communication with language negotiation capabilities. The system will support XMPP-based capability discovery, profile exchange, and multi-modal communication (HumanChat, IBISText, PrologProgram, AgentProfileExchange).

**Primary Goal**: Make TIA agents fully Lingue-capable and prepare the codebase for release as an NPM library with clear, modular interfaces.

## Current State

### Existing Infrastructure ✅
- Basic disco#info responder (`src/lib/lingue-capabilities.js`)
- IBIS RDF handling (`src/lib/ibis-rdf.js`, `src/lib/lingue-store.js`)
- Lingue exchange utilities (`src/lib/lingue-exchange.js`)
- IBIS detection in providers (MistralProvider)
- RDF profile system with capability support (COMPLETED)

### Gaps to Address ❌
- Agent profiles don't declare Lingue capabilities in RDF
- No language mode negotiation protocol
- No ASK/TELL exchange implementation beyond basic IBIS
- Missing Prolog and profile exchange modes
- Hardcoded feature URIs (don't match current Lingue spec)
- Not structured for library consumption

## Architecture Principles

### 1. Modularity
Every component must have:
- Clear, documented interface
- Minimal dependencies
- Constructor-based dependency injection
- Testable in isolation
- No tight coupling to XMPP internals

### 2. NPM Library Readiness
```javascript
// Target consumer usage
import { AgentRunner, LingueNegotiator, createProfile } from '@tia/agents';

const profile = createProfile({
  nickname: "MyAgent",
  supports: [lng.HumanChat, lng.IBISText],
  prefers: lng.HumanChat,
  xmpp: { /* config */ }
});

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    'lng:HumanChat': humanChatHandler,
    'lng:IBISText': ibisHandler
  }
});

const runner = new AgentRunner({ profile, negotiator });
await runner.start();
```

### 3. Standards Compliance
- Use exact Lingue ontology URIs from `http://purl.org/stuff/lingue/` - local copies of vocabs are in /home/danny/hyperdata/tia/vocabs
- Follow XEP-0030 (disco#info) and XEP-0045 (MUC) standards
- Support all defined language modes per Lingue spec
- Implement ASK/TELL semantics correctly

---

## Implementation Phases

### Phase 1: Profile Extension (RDF Schema) 🎯

**Objective**: Extend agent RDF profiles with Lingue capability declarations

**Files to Modify**:
- `config/agents/*.ttl` - Add lng:supports, lng:prefers, lng:understands
- `src/agents/profile/agent-profile.js` - Add Lingue property accessors
- `src/agents/profile-loader.js` - Parse Lingue properties from RDF

**New Vocabulary in Profiles**:
```turtle
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .

<#mistral> a agent:ConversationalAgent, lng:Agent ;
  foaf:nick "Mistral" ;

  # Lingue capabilities
  lng:supports lng:HumanChat, lng:IBISText, lng:AgentProfileExchange ;
  lng:prefers lng:HumanChat ;
  lng:understands ibis: ;
  lng:profile <#mistral-lingue-profile> ;

  # XMPP and provider config...

<#mistral-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + IBIS RDF" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
```

**Implementation Steps**:
1. Update `PREFIXES` in `profile-loader.js` to include `lng:` and `ibis:`
2. Add extraction functions:
   - `extractLingueCapabilities(dataset, subject)`
   - `extractLingueProfile(dataset, subject)`
3. Extend `AgentProfile` class with Lingue properties
4. Update all 5 agent profiles (mistral, semem, demo, chair, recorder)

**Tests**: `test/lingue-profile-loading.test.js`

**Success Criteria**:
- [ ] All profiles parse with Lingue metadata
- [ ] `profile.lingue.supports` contains Set of mode URIs
- [ ] Tests pass for all 5 agents

**Progress**: ⬜ Not started

---

### Phase 2: Negotiation Protocol Module 🎯

**Objective**: Create modular, testable language negotiation system

**New Module Structure**:
```
src/lib/lingue/
├── index.js                      # Main exports
├── negotiator.js                 # LingueNegotiator class
├── constants.js                  # URIs, MIME types, feature lists
├── discovery.js                  # Disco#info utilities
├── offer-accept.js               # Negotiation state machine
├── exchange-router.js            # Route messages by mode
└── payload-handlers.js           # Base handler interfaces
```

**Key Interface**:
```javascript
export class LingueNegotiator {
  constructor({ profile, xmppClient, handlers, logger })

  async discover(peerJid)           // Get peer capabilities
  async offerExchange(peerJid, modes) // Propose structured mode
  async acceptMode(peerJid, mode)   // Accept negotiation
  async send(peerJid, { mode, payload, summary }) // Send structured msg
  async handleStanza(stanza)        // Route incoming negotiation
}
```

**Constants** (`constants.js`):
```javascript
export const LINGUE_NS = 'http://purl.org/stuff/lingue/';

export const LANGUAGE_MODES = {
  HUMAN_CHAT: `${LINGUE_NS}HumanChat`,
  IBIS_TEXT: `${LINGUE_NS}IBISText`,
  PROLOG: `${LINGUE_NS}PrologProgram`,
  PROFILE_EXCHANGE: `${LINGUE_NS}AgentProfileExchange`
};

export const FEATURES = {
  LANG_HUMAN_CHAT: `${LINGUE_NS}feature/lang/human-chat`,
  LANG_IBIS_TEXT: `${LINGUE_NS}feature/lang/ibis-text`,
  // ...
};
```

**Tests**: `test/lingue-negotiation.test.js`, `test/lingue-discovery.test.js`

**Success Criteria**:
- [ ] Full offer/accept flow works
- [ ] Discovery parses disco#info correctly
- [ ] State machine handles all transitions
- [ ] All tests pass with mocked XMPP

**Progress**: ⬜ Not started

---

### Phase 3: Payload Handlers 🎯

**Objective**: Implement handlers for each Lingue language mode

**Handler Interface**:
```javascript
export class LanguageModeHandler {
  constructor({ mode, mimeType, logger })
  createStanza(to, payload, summary)  // Build outgoing XMPP stanza
  parseStanza(stanza)                  // Extract payload from stanza
  validate(payload)                    // Optional validation
}
```

**Implementations**:

1. **HumanChatHandler** (`handlers/human-chat.js`)
   - Simple text messages
   - MIME: `text/plain`

2. **IBISTextHandler** (`handlers/ibis-text.js`)
   - Plain text + optional Turtle CDATA
   - Reuses `ibis-rdf.js` utilities
   - MIME: `text/plain` with `text/turtle` attachment

3. **PrologProgramHandler** (`handlers/prolog.js`)
   - Prolog clauses in CDATA
   - MIME: `text/x-prolog`
   - Stub execution (future: tau-prolog integration)

4. **ProfileExchangeHandler** (`handlers/profile-exchange.js`)
   - Uses `profileToTurtle()` and `parseAgentProfile()`
   - MIME: `text/turtle`

**Tests**: `test/lingue-handlers/*.test.js` (one per handler)

**Success Criteria**:
- [ ] All 4 handlers implemented
- [ ] Round-trip tests pass (create → parse → verify)
- [ ] Integration with existing IBIS utilities works

**Progress**: ⬜ Not started

---

### Phase 4: AgentRunner Integration 🎯

**Objective**: Wire negotiation layer into agent message flow

**Modify**: `src/agents/core/agent-runner.js`

**New Constructor**:
```javascript
export class AgentRunner {
  constructor({
    profile,          // NEW: AgentProfile (not separate xmpp/nickname)
    provider,
    negotiator = null, // NEW: Optional LingueNegotiator
    mentionDetector,
    commandParser,
    allowSelfMessages = false,
    respondToAll = false,
    logger = console
  })
}
```

**Message Routing**:
```javascript
async handleMessage({ body, sender, type, roomJid, reply, stanza }) {
  // NEW: Check Lingue negotiation first
  if (this.negotiator && await this.negotiator.handleStanza(stanza)) {
    return; // Handled by negotiation layer
  }

  // Existing message handling...
}
```

**Backward Compatibility**:
- Extract xmppConfig, nickname, roomJid from `profile.toConfig()`
- Negotiator is optional (agents work without it)

**Tests**: `test/agent-runner-lingue.test.js`

**Success Criteria**:
- [ ] AgentRunner accepts profile + negotiator
- [ ] Messages route correctly (negotiation vs regular)
- [ ] Backward compatible with existing agents
- [ ] Integration tests pass

**Progress**: ⬜ Not started

---

### Phase 5: Service File Updates 🎯

**Objective**: Enable Lingue in production agent services

**Pattern for Each Service**:
```javascript
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler } from "../lib/lingue/handlers/index.js";

const profile = await loadAgentProfile(profileName);

// Create handlers based on profile capabilities
const handlers = {};
if (profile.supportsLingueMode('lng:HumanChat')) {
  handlers['lng:HumanChat'] = new HumanChatHandler();
}
if (profile.supportsLingueMode('lng:IBISText')) {
  handlers['lng:IBISText'] = new IBISTextHandler();
}

const negotiator = new LingueNegotiator({
  profile,
  xmppClient: null, // Set by AgentRunner
  handlers
});

const runner = new AgentRunner({ profile, provider, negotiator });
```

**Files to Update**:
- `src/services/mistral-bot.js` - HumanChat + IBISText
- `src/services/semem-agent.js` - + ProfileExchange
- `src/services/chair-agent.js` - HumanChat + IBISText
- `src/services/recorder-agent.js` - All modes
- `src/services/demo-bot.js` - HumanChat only (minimal example)

**Tests**: Integration tests with disco#info requests

**Success Criteria**:
- [ ] All agents respond to disco#info with correct features
- [ ] Mistral/Chair support IBISText
- [ ] Semem supports ProfileExchange
- [ ] All agents start without errors

**Progress**: ⬜ Not started

---

### Phase 6: NPM Library Preparation 🎯

**Objective**: Structure code for external library consumption

**Main Exports** (`src/index.js`):
```javascript
// Core
export { AgentRunner } from './agents/core/agent-runner.js';
export { AgentProfile, XmppConfig } from './agents/profile/index.js';
export { loadAgentProfile, profileToTurtle } from './agents/profile-loader.js';

// Lingue
export { LingueNegotiator } from './lib/lingue/index.js';
export * as LINGUE from './lib/lingue/constants.js';
export * as Handlers from './lib/lingue/handlers/index.js';

// Utilities
export { XmppRoomAgent } from './lib/xmpp-room-agent.js';
export { createMentionDetector } from './agents/core/mention-detector.js';

// Provider base
export { BaseProvider } from './agents/providers/base-provider.js';
```

**Package.json**:
```json
{
  "name": "@tia/agents",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./core": "./src/agents/core/index.js",
    "./lingue": "./src/lib/lingue/index.js",
    "./providers": "./src/agents/providers/index.js"
  },
  "peerDependencies": {
    "@xmpp/client": "^0.13.x"
  }
}
```

**Example** (`examples/minimal-agent.js`):
```javascript
import { AgentRunner, loadAgentProfile, LingueNegotiator, LINGUE, Handlers } from '@tia/agents';

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const profile = await loadAgentProfile('my-agent');

const runner = new AgentRunner({
  profile,
  provider: new EchoProvider(),
  negotiator: new LingueNegotiator({
    profile,
    handlers: {
      [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
    }
  })
});

await runner.start();
```

**New Files**:
- `src/providers/base-provider.js` - Interface documentation
- `examples/` - Working examples
- `README-NPM.md` - Library usage guide

**Tests**: `test/npm-exports.test.js`

**Success Criteria**:
- [ ] Clean export structure
- [ ] Examples run successfully
- [ ] Documented provider interface
- [ ] No internal dependencies exposed

**Progress**: ⬜ Not started

---

### Phase 7: Documentation Updates 🎯

**Objective**: Complete documentation for library users and developers

**Files to Update/Create**:

1. **`docs/agent-dev-prompt.md`** ⬅ CRITICAL UPDATE
   - Add Lingue protocol section
   - Document profile Lingue properties
   - Negotiation examples
   - Updated agent creation procedure

2. **`README.md`**
   - Library usage section
   - Link to examples
   - Lingue protocol support highlights

3. **`docs/lingue-integration.md`** (NEW)
   - Complete Lingue protocol guide
   - Capability advertisement
   - Negotiation flows
   - Handler implementation
   - ASK/TELL semantics

4. **`docs/api-reference.md`** (NEW)
   - Full API documentation
   - All exported classes/functions
   - TypeScript-style signatures

5. **`CHANGELOG.md`**
   - Document all changes
   - Migration guide

**Tests**: Documentation examples should be runnable

**Success Criteria**:
- [ ] agent-dev-prompt.md updated
- [ ] Complete API reference
- [ ] Working examples in docs
- [ ] Clear migration guide

**Progress**: ⬜ Not started

---

## Progress Tracking

### Completed ✅
- RDF profile system (from previous plan)
- Basic IBIS detection and RDF utilities
- XMPP room agent infrastructure

### Phase 1: Profile Extension ⬜
- [x] Update profile-loader.js with lng: prefix
- [x] Add Lingue property extraction functions
- [x] Extend AgentProfile class with lingue properties
- [x] Convert all 5 .ttl profiles with Lingue metadata
- [x] Write and pass profile loading tests

### Phase 2: Negotiation Module ⬜
- [x] Create src/lib/lingue/ directory structure
- [x] Implement constants.js
- [x] Implement negotiator.js core class
- [x] Implement discovery.js (disco#info)
- [x] Implement offer-accept.js (state machine)
- [x] Write and pass unit tests

### Phase 3: Payload Handlers ⬜
- [x] Implement HumanChatHandler
- [x] Implement IBISTextHandler
- [x] Implement PrologProgramHandler
- [x] Implement ProfileExchangeHandler
- [x] Write and pass handler tests

### Phase 4: AgentRunner Integration ⬜
- [x] Update AgentRunner constructor signature
- [x] Add negotiation message routing
- [x] Update handleMessage flow
- [x] Write integration tests

### Phase 5: Service Updates ⬜
- [x] Update mistral-bot.js
- [x] Update semem-agent.js
- [x] Update chair-agent.js
- [x] Update recorder-agent.js
- [x] Update demo-bot.js
- [ ] Test disco#info for all agents

### Phase 6: NPM Library Prep ⬜
- [x] Create src/index.js main exports
- [x] Document BaseProvider interface
- [x] Create examples/ directory with working examples
- [x] Update package.json for library mode
- [x] Test all exports

### Phase 7: Documentation ⬜
- [x] Update agent-dev-prompt.md
- [x] Update README.md
- [x] Create lingue-integration.md
- [x] Create api-reference.md
- [x] Update CHANGELOG.md

---

## Testing Strategy

### Unit Tests
- Profile loading with Lingue properties ✓ Isolation
- Negotiator state machine ✓ Mocked XMPP
- Each handler (create/parse roundtrip) ✓ Pure functions
- Discovery parsing ✓ Fixtures

### Integration Tests
- Full negotiation flow (2 agents)
- Message routing (negotiated vs plain)
- Multi-mode support
- Fallback behavior

### End-to-End Tests
- Disco#info exchange
- Offer/accept flow
- Structured message exchange
- MUC transparency (summaries visible)

---

## Dependencies

### Already Installed ✅
- `@xmpp/client` - XMPP protocol
- `n3` - Turtle parsing/writing
- `rdf-ext` - RDF datasets

### May Need 🔍
- `shacl-js` (optional) - Protocol shape validation
- `tau-prolog` (optional) - Prolog execution

---

## Success Criteria (Overall)

**Functional**:
- [ ] All 5 agents are Lingue-capable
- [ ] Agents discover peer capabilities via disco#info
- [ ] Agents negotiate language modes
- [ ] Structured exchanges work (all 4 modes)
- [ ] ASK/TELL semantics implemented

**Technical**:
- [ ] Code is modular and DI-based
- [ ] Library-ready exports
- [ ] All tests pass
- [ ] Examples work out of the box
- [ ] Documentation complete

---

## Open Questions

1. **Prolog Execution**: Execute code or just validate/store?
2. **Package Structure**: Monolithic or split (@tia/agents, @tia/lingue)?
3. **Session Persistence**: Persist negotiated sessions across restarts?
4. **Timeouts**: How to handle negotiation timeouts/retries?
5. **Migration**: Path for existing production agents?

---

## Related Documentation

- [Lingue Protocol Spec](../../lingue/docs/lingue-protocol.md)
- [Lingue Ontology](../../lingue/docs/lingue-ontology.md)
- [Lingue Vocabulary](../../lingue/vocabs/lingue.ttl)
- [Agent Dev Prompt](./agent-dev-prompt.md)
- [RDF Profile Migration](../.claude/plans/woolly-tickling-whisper.md) - COMPLETED ✅

---

## Protocol Details (Draft)

### Capability Advertisement (Disco#Info)
**Goal**: Share Lingue support so peers can negotiate mode.

**Disco features**:
- `http://purl.org/stuff/lingue/feature/lang/human-chat`
- `http://purl.org/stuff/lingue/feature/lang/ibis-text`
- `http://purl.org/stuff/lingue/feature/lang/prolog-program`
- `http://purl.org/stuff/lingue/feature/lang/profile-exchange`

**Identity**:
- category: `client` or `component` (per agent role)
- type: `bot`
- name: agent nick or configured display name

**Notes**:
- Feature URIs must align with the Lingue ontology.
- Avoid adding Lingue features unless the handler is active.

### Negotiation Flow (Offer/Accept)
**Goal**: Establish a language mode between two agents.

**Proposed flow**:
1. Sender `offerExchange(peer, [modes])`
2. Receiver checks supported modes and replies with acceptance
3. Both sides store `activeMode[peerJid] = mode`
4. Sender sends structured payloads using the accepted mode

**State machine**:
- `idle` -> `offered` -> `accepted`
- `offered` -> `rejected` (fallback to HumanChat)
- `accepted` -> `idle` (timeout or explicit end)

**Timeouts**:
- 30s for offer acceptance (configurable)
- 10m inactivity for mode expiration (configurable)

### ASK/TELL Semantics (IBIS + Lingue)
**Goal**: Standardize question/answer and assertion flow.

**Concepts**:
- `ASK`: A request for information or decision
- `TELL`: An assertion or conclusion

**Mapping**:
- `ASK` -> IBIS `Issue` or `Question`
- `TELL` -> IBIS `Position` or `Argument`

**Rules**:
- Each `ASK` should have `summary` (short human text)
- `TELL` should include a stable identifier and a link to the related `ASK`
- Handlers should validate RDF shape minimally (presence of type and label)

---

## Message Formats (Draft)

### HumanChat (text/plain)
```
<message to="room@conference" type="groupchat">
  <body>Hello everyone.</body>
</message>
```

### IBISText (text/plain + text/turtle)
```
<message to="room@conference" type="groupchat">
  <body>[summary] I suggest option A because...</body>
  <lingue:payload mime="text/turtle"><![CDATA[
    @prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
    _:issue a ibis:Issue ; rdfs:label "Which option?" .
  ]]></lingue:payload>
</message>
```

### PrologProgram (text/x-prolog)
```
<message to="room@conference" type="groupchat">
  <body>[summary] Proposed ruleset.</body>
  <lingue:payload mime="text/x-prolog"><![CDATA[
    rule(a) :- fact(b).
  ]]></lingue:payload>
</message>
```

### ProfileExchange (text/turtle)
```
<message to="peer@server" type="chat">
  <body>[summary] Agent profile.</body>
  <lingue:payload mime="text/turtle"><![CDATA[
    @prefix lng: <http://purl.org/stuff/lingue/> .
    <#agent> a lng:Agent ; lng:supports lng:HumanChat .
  ]]></lingue:payload>
</message>
```

**Notes**:
- Use `<lingue:payload>` as a single child element (custom stanza extension).
- `summary` always included for MUC readability.
- Payload CDATA is optional for HumanChat and required for other modes.

---

## Implementation Notes

### Routing Rules
- If a stanza includes a Lingue payload, route by payload MIME.
- If no payload, route to HumanChat handler by default.
- Allow handlers to short-circuit and mark a stanza as handled.

### Interop Guarantees
- Maintain backwards compatibility with non-Lingue agents.
- For MUC rooms, preserve normal message bodies for human readability.
- ProfileExchange should use direct chat by default (not groupchat).

### Logging
- Use `src/lib/logger.js` at info level for negotiation events.
- Log mode switches and rejections once per peer.

---

## Risks and Mitigations

- **Spec mismatch**: Validate URIs against `/vocabs/lingue.ttl` before coding.
- **State leaks**: Store negotiation sessions with TTL and cleanup.
- **Handler drift**: Keep handler interfaces stable; add adapters if needed.
- **MUC noise**: Keep summaries short; avoid posting large Turtle in body.

---

## Milestones (Suggested)

1. **RDF Profile Extension** (Phase 1)
2. **Negotiation Core** (Phase 2)
3. **Handlers + Tests** (Phase 3)
4. **AgentRunner Integration** (Phase 4)
5. **Service Updates** (Phase 5)
6. **Library Exports** (Phase 6)
7. **Documentation** (Phase 7)

---

## Checklist for Each Phase

**Design**
- [ ] Finalize interface and MIME choices
- [ ] Confirm vocab URIs

**Build**
- [ ] Implement core module
- [ ] Add tests

**Verify**
- [ ] Run example scripts
- [ ] Validate disco#info output

**Document**
- [ ] Update README
- [ ] Update docs/lingue-integration.md
