# NPM Packaging Implementation Plan for tia-agents

Status: template; candidate for removal if unused.

**Status**: ✅ Completed

## Goal
Make tia-agents npm-ready so external users can easily create bots using either:
1. **Programmatic API**: Import package, write custom provider, configure via code
2. **Config-driven**: Provide .ttl profile + secrets.json, run with minimal code

## Key Changes Overview

### 1. Package Structure & Publishing
- Create `.npmignore` to exclude internal files
- Update `package.json` exports, files, keywords, peer dependencies
- Move `@mistralai/mistralai` from dependencies → peerDependencies (optional)
- Version bump: 0.2.0 → 0.3.0

### 2. Enhanced Public API
- Export DemoProvider (working example, no dependencies)
- Export factory functions for common patterns
- Add configurable profile directory support
- Expose command parser utilities

### 3. Templates for Quick Start
- Create `templates/` directory with:
  - Profile templates (.ttl files)
  - Provider templates (simple & LLM patterns)
  - Runnable example scripts

### 4. Documentation
- Update `docs/api-reference.md` (comprehensive API docs)
- Create `docs/quick-start.md` (getting started guide)
- Create `docs/provider-guide.md` (custom provider guide)
- Update main `README.md` with npm usage section

---

## Implementation Steps

### Step 1: Create .npmignore ✅
**File**: `/home/danny/hyperdata/tia/.npmignore`

Exclude from npm package:
- `test/`, `src/services/`, `src/examples/`, `src/client/`
- `config/` (but include `templates/config/`)
- Shell scripts (`start-*.sh`)
- Internal docs (keep api-reference, quick-start, provider-guide)
- `CLAUDE.md`, `AGENTS.md`, development logs

### Step 2: Update package.json ✅
**File**: `/home/danny/hyperdata/tia/package.json`

Changes:
1. Bump version: `"version": "0.3.0"`
2. Improve description: `"XMPP agent framework with Lingue protocol and MCP integration"`
3. Add `"files"` field: `["src/", "templates/", "docs/api-reference.md", "docs/quick-start.md", "docs/provider-guide.md", "README.md", "LICENSE"]`
4. Add keywords: `["xmpp", "jabber", "chatbot", "agent", "ai", "lingue", "mcp", "mistral", "conversation"]`
5. Enhance `"exports"`:
   ```json
   {
     ".": "./src/index.js",
     "./core": "./src/agents/core/index.js",
     "./lingue": "./src/lib/lingue/index.js",
     "./providers": "./src/agents/providers/index.js",
     "./providers/base": "./src/agents/providers/base-provider.js",
     "./providers/demo": "./src/agents/providers/demo-provider.js",
     "./mcp": "./src/mcp/index.js",
     "./templates/*": "./templates/*"
   }
   ```
6. Add `"peerDependencies"` and `"peerDependenciesMeta"`:
   ```json
   "peerDependencies": {
     "@mistralai/mistralai": "^0.4.0 || ^0.5.0"
   },
   "peerDependenciesMeta": {
     "@mistralai/mistralai": { "optional": true }
   }
   ```
7. Move `@mistralai/mistralai` from `dependencies` to `peerDependencies`
8. Add repository field if not present

### Step 3: Enhance src/index.js ✅
**File**: `/home/danny/hyperdata/tia/src/index.js`

Add exports:
```javascript
// Factory functions
export { createAgent, createSimpleAgent } from "./factories/agent-factory.js";

// DemoProvider - working example
export { DemoProvider } from "./agents/providers/demo-provider.js";

// Command parser utilities
export { defaultCommandParser } from "./agents/core/command-parser.js";

// System config loader
export { loadSystemConfig } from "./lib/system-config.js";

// Version
export const VERSION = "0.3.0";
```

### Step 4: Enhance Profile Loader ✅
**File**: `/home/danny/hyperdata/tia/src/agents/profile-loader.js`

Modifications:
1. Add constant near top (after imports):
   ```javascript
   const DEFAULT_PROFILE_DIR = path.join(process.cwd(), "config", "agents");
   ```

2. Update `loadAgentProfile()` function signature and directory resolution:
   ```javascript
   export async function loadAgentProfile(name, options = {}) {
     if (!name) return null;

     const profileDir = options.profileDir ||
                         process.env.AGENT_PROFILE_DIR ||
                         DEFAULT_PROFILE_DIR;
     const filePath = path.join(profileDir, `${name}.ttl`);
     // ... rest of function unchanged
   }
   ```

3. Update `loadAgentProfileWithSecrets()` similarly to accept `options.secretsPath`

4. Add utility function at end:
   ```javascript
   export function setDefaultProfileDir(dir) {
     process.env.AGENT_PROFILE_DIR = dir;
   }
   ```

### Step 5: Create Factory Functions ✅
**New File**: `/home/danny/hyperdata/tia/src/factories/agent-factory.js`

Two factory functions:

1. **`createAgent(profileName, provider, options)`**
   - Loads profile from .ttl file
   - Creates LingueNegotiator if profile supports Lingue
   - Wires up AgentRunner with all components
   - Options: `{ profileDir, secretsPath, logger, allowSelfMessages, historyStore }`
   - Returns AgentRunner instance ready to start

2. **`createSimpleAgent({ xmppConfig, roomJid, nickname, provider, logger })`**
   - No profile file needed
   - Simple programmatic configuration
   - Returns AgentRunner instance ready to start

Pattern based on `src/services/mistral-bot.js` and `src/services/demo-bot.js`

### Step 6: Create Templates Directory ✅
**New Directory**: `/home/danny/hyperdata/tia/templates/`

Structure:
```
templates/
├── config/
│   ├── agent-profile.ttl          # Basic agent template
│   ├── mistral-agent.ttl          # AI/LLM agent template
│   └── secrets.example.json       # Secrets file template
├── providers/
│   ├── simple-provider-template.js   # Minimal provider example
│   └── llm-provider-template.js      # LLM integration pattern
└── scripts/
    ├── basic-agent.js             # Config-driven example
    └── programmatic-agent.js      # Programmatic API example
```

**Content Guidelines**:
- `agent-profile.ttl`: Minimal valid profile with XMPP + room
- `mistral-agent.ttl`: Profile with AI provider configuration
- `secrets.example.json`: Shows structure with placeholder passwords
- `simple-provider-template.js`: Extends BaseProvider, shows handle() pattern
- `llm-provider-template.js`: Shows pattern from MistralProvider (API calls, history, error handling)
- `basic-agent.js`: Uses `createAgent()` with profile file
- `programmatic-agent.js`: Uses `createSimpleAgent()` with inline config

### Step 7: Create Documentation ✅

#### File: `docs/quick-start.md`
Sections:
1. Installation: `npm install tia-agents`
2. Two approaches overview
3. Quick example - Config-driven (copy templates, run script)
4. Quick example - Programmatic (import, create, start)
5. Next steps (link to api-reference, provider-guide)

#### File: `docs/provider-guide.md`
Sections:
1. Provider interface explanation
2. BaseProvider contract (`handle()` method)
3. DemoProvider walkthrough (full code + explanation)
4. Creating custom provider (step-by-step)
5. LLM integration pattern (based on MistralProvider)
6. History store usage
7. Error handling best practices
8. Testing providers

#### File: `docs/api-reference.md` (update existing)
Add comprehensive docs for:
- `createAgent()` factory function
- `createSimpleAgent()` factory function
- `loadAgentProfile()` options
- `setDefaultProfileDir()` utility
- `DemoProvider` class
- All exported classes with examples

### Step 8: Update README.md ✅
**File**: `/home/danny/hyperdata/tia/README.md`

Add new section after intro:
```markdown
## NPM Package Usage

Install via npm:
```bash
npm install tia-agents
```

### Quick Start - Config-Driven

1. Copy templates from `node_modules/tia-agents/templates/`
2. Customize `config/agents/mybot.ttl` and `config/agents/secrets.json`
3. Create script:

```javascript
import { createAgent, DemoProvider } from "tia-agents";

const runner = await createAgent("mybot", new DemoProvider());
await runner.start();
```

### Quick Start - Programmatic

```javascript
import { createSimpleAgent, DemoProvider } from "tia-agents";

const runner = await createSimpleAgent({
  xmppConfig: {
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "mybot",
    password: "secret"
  },
  roomJid: "general@conference.xmpp",
  nickname: "MyBot",
  provider: new DemoProvider()
});

await runner.start();
```

For detailed docs, see:
- [Quick Start Guide](./docs/quick-start.md)
- [API Reference](./docs/api-reference.md)
- [Provider Guide](./docs/provider-guide.md)
```

---

## Critical Files Summary

1. **package.json** - Publishing config, exports, peer deps
2. **src/index.js** - Public API surface
3. **src/agents/profile-loader.js** - Config directory flexibility
4. **src/factories/agent-factory.js** - NEW - Simplifies setup
5. **.npmignore** - NEW - Controls published files
6. **templates/** - NEW - User templates and examples
7. **docs/quick-start.md** - NEW - Getting started
8. **docs/provider-guide.md** - NEW - Custom providers
9. **docs/api-reference.md** - ENHANCE - Complete API
10. **README.md** - ENHANCE - Add npm usage section

---

## Backward Compatibility

✅ **No breaking changes for internal code**
- All existing services work unchanged
- Profile loader defaults to `config/agents/` (same as before)
- New options are additive only

⚠️ **One breaking change for external users** (if any exist)
- MistralProvider users must install `@mistralai/mistralai` as peer dependency
- Clearly document in migration notes

---

## Testing Checklist

Before publishing:
1. `npm pack --dry-run` - Verify package contents
2. `node -e "import('tia-agents').then(m => console.log(Object.keys(m)))"` - Test exports
3. `npm test` - Run full test suite
4. Test templates work: copy to temp project, run examples
5. Verify package size is reasonable
6. Check all links in documentation work

---

## Post-Implementation

1. Update CHANGELOG.md
2. Tag release: `git tag v0.3.0`
3. Publish: `npm publish` (or `npm publish --dry-run` first)
4. Create GitHub release with notes
5. Update any external documentation/wiki
