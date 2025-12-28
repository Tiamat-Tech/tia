This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
- Pay special attention to the Repository Description. These contain important context and guidelines specific to this project.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: dist, docs/postcraft, docs/docs, docs/kia, .env, knowledge, **/_*/**, **/webpack/*, *.log, **/*repopack*, **/*repomix*, **/*old*, **/*prompt*
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<user_provided_header>
TIA repo
</user_provided_header>

<directory_structure>
.claude/
  settings.local.json
config/
  agents/
    chair.ttl
    data.ttl
    demo.ttl
    mcp-loopback.ttl
    mcp-test.ttl
    mistral-analyst.ttl
    mistral-base.ttl
    mistral-creative.ttl
    mistral.ttl
    prolog.ttl
    recorder.ttl
    secrets.example.json
    semem.ttl
  system.ttl
docs/
  archive/2024-09.md
  archive/2025-12-21_tia-blog.md
  archive/2025-12-21.md
  agent-dev-prompt.md
  agents.md
  api-reference.md
  auto-registration.md
  data-agent.md
  debating-society.md
  ibis.md
  lingue-integration.md
  LINGUE-PLAN.md
  mcp-client.md
  MCP-PLAN.md
  mcp-server.md
  mcp.md
  archive/notes.md
  provider-guide.md
  quick-start.md
  server.md
  tbox-note.md
  archive/TEMPLATE-PLAN.md
  testing.md
examples/
  minimal-agent.js
  prolog-agent.js
misc/
  tia-agents.service
mistral-minimal/
  config/
    agents/
      mistral-base.ttl
      mistral2.ttl
      secrets.json
  .env.example
  mistral-example.js
  README.md
public/
  index.html
src/
  agents/
    core/
      agent-runner.js
      command-parser.js
      index.js
      mention-detector.js
    profile/
      agent-profile.js
      capability-registry.js
      capability.js
      index.js
      profile-builder.js
      provider-config.js
      xmpp-config.js
    providers/
      base-provider.js
      chair-provider.js
      data-provider.js
      demo-provider.js
      index.js
      mcp-loopback-provider.js
      mistral-provider.js
      prolog-provider.js
      recorder-provider.js
      semem-provider.js
    profile-loader.js
    profile-roster.js
  client/
    repl.js
  examples/
    add-users.js
    alice.js
    auto-register-example.js
    call-alice.js
    create-muc-room.js
    db01.js
    db02.js
    db03.js
    discover-xmpp-services.js
    hello-world.js
    lingue-detect-demo.js
    lingue-exchange-demo.js
    list-users.js
    mcp-sparql-client.js
    openai-api-test.js
    semem-direct-test.js
    test-bot-interaction.js
    test-data-agent.js
    test-muc.js
    test-registration.js
    test-semem-agent.js
    users.json
  factories/
    agent-factory.js
  lib/
    history/
      index.js
    lingue/
      handlers/
        human-chat.js
        ibis-text.js
        index.js
        profile-exchange.js
        prolog.js
        sparql-query-handler.js
      constants.js
      discovery.js
      exchange-router.js
      index.js
      negotiator.js
      offer-accept.js
      payload-handlers.js
    ibis-detect.js
    ibis-rdf.js
    lingue-capabilities.js
    lingue-exchange.js
    lingue-store.js
    logger-lite.js
    logger.js
    openai-connect.js
    semem-client.js
    system-config.js
    xmpp-auto-connect.js
    xmpp-register.js
    xmpp-room-agent.js
  mcp/
    servers/
      Echo.js
      loopback-echo.js
      sparql-server.js
      tia-mcp-server.js
    chat-adapter.js
    client-bridge.js
    client.js
    index.js
    profile-mapper.js
    server-bridge.js
    tool-definitions.js
    tool-registry.js
  services/
    agent-registry.js
    chair-agent.js
    data-agent.js
    demo-bot.js
    mcp-loopback-agent.js
    mistral-bot.js
    prolog-agent.js
    recorder-agent.js
    run-all-agents.js
    semem-agent.js
  config.js
  dogbot-service.js
  index.js
templates/
  config/
    agent-profile.ttl
    mistral-agent.ttl
    secrets.example.json
  providers/
    llm-provider-template.js
    simple-provider-template.js
  scripts/
    basic-agent.js
    mistral-agent-example.js
    programmatic-agent.js
  README.md
test/
  fixtures/
    agent-secrets.json
  helpers/
    agent-secrets.js
  lingue-handlers/
    human-chat.test.js
    ibis-text.test.js
    profile-exchange.test.js
    prolog.test.js
  agent-runner-agent-rounds.test.js
  agent-runner-lingue.test.js
  history-store.test.js
  ibis.test.js
  lingue-discovery.test.js
  lingue-exchange.test.js
  lingue-negotiation.test.js
  lingue-profile-loading.test.js
  lingue-store.test.js
  mcp-loopback-provider.test.js
  mcp-profile-mapper.test.js
  npm-exports.test.js
  profile-capabilities.test.js
  profile-loading.test.js
  profile-roundtrip.test.js
  prolog-lingue-payload.test.js
  prolog-provider.test.js
  xmpp-auto-register.integration.test.js
  xmpp.bots.integration.test.js
  xmpp.integration.test.js
  xmpp.semem.integration.test.js
vocabs/
  ibis.ttl
  intersection.ttl
  lingue-shapes.ttl
  lingue.ttl
  mcp-ontology.ttl
  rpp-2001.ttl
_README.md
.env.example
.gitignore
.npmignore
AGENTS.md
CHANGELOG.md
DEVELOPMENT_LOG.md
LICENSE
loop.txt
MISTRAL_BOT.md
package.json
README-NPM.md
README.md
repomix.config.json
SETUP_COMPLETE.md
start-all-agents.sh
start-data-agent.sh
start-debate-agents.sh
start-demo-bot.sh
start-mistral-bot.sh
start-prolog-agent.sh
start-semem-agent.sh
test-bot-interaction.js
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path=".claude/settings.local.json">
{
  "permissions": {
    "allow": [
      "Bash(node /home/danny/hyperdata/tia/src/mcp/servers/Echo.js:*)",
      "Bash(timeout 2 node:*)",
      "Bash(node:*)",
      "Bash(ls:*)",
      "Bash(npm test:*)",
      "Bash(npx vitest run:*)",
      "Bash(timeout 2 MISTRAL_API_KEY=test node:*)",
      "Bash(MISTRAL_API_KEY=test timeout 2 node:*)",
      "Bash(timeout 5 bash -c 'AGENTS=\"\"chair,recorder\"\" node src/services/run-all-agents.js')",
      "Bash(pkill:*)",
      "Bash(kill:*)",
      "Bash(timeout 5 bash:*)",
      "WebFetch(domain:conversejs.org)",
      "Bash(curl -k https://tensegrity.it:5281/http-bind)",
      "Bash(timeout 5 AGENT_PROFILE=mistral node:*)",
      "Bash(AGENT_PROFILE=mistral timeout 5 bash:*)",
      "Bash(XMPP_SERVICE=xmpp://tensegrity.it:5222 XMPP_DOMAIN=tensegrity.it MUC_ROOM=general@conference.tensegrity.it timeout 10 node:*)",
      "Bash(XMPP_SERVICE=xmpps://tensegrity.it:5222 XMPP_DOMAIN=tensegrity.it MUC_ROOM=general@conference.tensegrity.it timeout 10 node:*)",
      "Bash(cat:*)",
      "Bash(XMPP_SERVICE=xmpp://tensegrity.it:5222 XMPP_DOMAIN=tensegrity.it MUC_ROOM=general@conference.tensegrity.it XMPP_USERNAME=testuser123 timeout 10 node:*)",
      "Bash(XMPP_USERNAME=testuser123 timeout 10 node:*)",
      "Bash(timeout 15 node:*)",
      "Bash(timeout 20 node:*)",
      "Bash(XMPP_USERNAME=autotest123 timeout 15 node:*)",
      "Bash(AGENT_PROFILE=mcp-test timeout 15 node:*)",
      "Bash(wc:*)",
      "Bash(npm pack:*)",
      "Bash(tree:*)",
      "Bash(npm install:*)",
      "Bash(grep:*)",
      "Bash(chmod:*)",
      "Bash(timeout 3 bash:*)",
      "Bash(timeout 5 node:*)",
      "Bash(bash -c 'node src/services/data-agent.js 2>&1 &\nPID=$!\nsleep 3\nkill $PID 2>/dev/null\nwait $PID 2>/dev/null')",
      "Bash(curl:*)"
    ]
  }
}
</file>

<file path="repomix.config.json">
{
    "output": {
        "filePath": "./tia_repomix.md",
        "headerText": "TIA repo",
        "removeComments": true
    },
    "ignore": {
        "useDefaultPatterns": true,
        "customPatterns": [
            "dist",
            "docs/postcraft",
            "docs/docs",
            "docs/kia",
            ".env",
            "knowledge",
            "**/_*/**",
            "**/webpack/*",
            "*.log",
            "**/*repopack*",
            "**/*repomix*",
            "**/*old*",
            "**/*prompt*"
        ]
    }
}
</file>

<file path="config/agents/data.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix mcp: <http://purl.org/stuff/mcp/> .

<#data> a agent:ConversationalAgent, agent:KnowledgeAgent, lng:Agent, mcp:Client ;
  foaf:nick "Data" ;
  schema:identifier "data" ;
  dcterms:created "2025-12-22T00:00:00Z"^^xsd:dateTime ;
  dcterms:description "SPARQL query agent for Wikidata and other knowledge endpoints" ;

  lng:supports lng:HumanChat, lng:SparqlQuery ;
  lng:prefers lng:SparqlQuery ;
  lng:profile <#data-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "data" ;
    xmpp:passwordKey "data" ;
    xmpp:resource "Data"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:dataProvider [
    a ai:DataProvider ;
    ai:sparqlEndpoint "https://query.wikidata.org/sparql" ;
    ai:extractionModel "mistral-small-latest" ;
    ai:extractionApiKeyEnv "MISTRAL_API_KEY" ;
    ai:maxTokens "50"^^xsd:integer ;
    ai:temperature "0.3"^^xsd:float
  ] ;

  mcp:providesTool [
    a mcp:Tool ;
    mcp:name "sparqlQuery" ;
    mcp:description "Execute SPARQL queries against configured endpoint"
  ] .

<#data-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text + SPARQL queries" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text summaries" ] ;
  lng:dependsOn
    [ a lng:Environment ; rdfs:label "XMPP/Prosody" ],
    [ a lng:Environment ; rdfs:label "SPARQL endpoint" ],
    [ a lng:Environment ; rdfs:label "Mistral API" ] ;
  lng:alang "JavaScript" .
</file>

<file path="config/agents/mcp-test.ttl">
@prefix agent: <http://example.org/agent#> .
@prefix xmpp: <http://example.org/xmpp#> .
@prefix mcp: <http://example.org/mcp#> .

agent:mcp-test a agent:Agent ;
    agent:nickname "MCPTest" ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "mcptest456" ;
    xmpp:resource "MCPTest" ;
    agent:roomJid "general@conference.tensegrity.it" .
</file>

<file path="config/agents/mistral-analyst.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .

<#mistral-analyst> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  dcterms:isPartOf <#mistral-base> ;
  foaf:nick "Analyst" ;
  schema:identifier "mistral-analyst" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:username "mistral-analyst" ;
    xmpp:passwordKey "mistral-analyst" ;
    xmpp:resource "Analyst"
  ] ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:systemTemplate "You are {{nickname}}, a precise analyst in an XMPP chat. Keep responses short, cite assumptions, and prefer bullet points when clarifying options."
  ] .
</file>

<file path="config/agents/mistral-base.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#mistral-base> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  schema:identifier "mistral-base" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat, lng:IBISText, lng:AgentProfileExchange ;
  lng:prefers lng:HumanChat ;
  lng:understands <https://vocab.methodandstructure.com/ibis#> ;
  lng:profile <#mistral-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:model "mistral-small-latest" ;
    ai:apiKeyEnv "MISTRAL_API_KEY"
  ] .

<#mistral-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + IBIS RDF" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="config/agents/mistral-creative.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .

<#mistral-creative> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  dcterms:isPartOf <#mistral-base> ;
  foaf:nick "Creative" ;
  schema:identifier "mistral-creative" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:username "mistral-creative" ;
    xmpp:passwordKey "mistral-creative" ;
    xmpp:resource "Creative"
  ] ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:systemPrompt "You are Creative, a playful creative collaborator in an XMPP chat. Respond with vivid, imaginative ideas while staying concise."
  ] .
</file>

<file path="config/agents/secrets.example.json">
{
  "xmpp": {
    "chair": "change-me",
    "demo": "change-me",
    "mcp-loopback": "change-me",
    "mistral": "change-me",
    "mistral-analyst": "change-me",
    "mistral-creative": "change-me",
    "prolog": "change-me",
    "recorder": "change-me",
    "semem": "change-me"
  }
}
</file>

<file path="config/system.ttl">
@prefix sys: <https://tensegrity.it/vocab/system#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#system> a sys:SystemConfig ;
  sys:maxAgentRounds "5"^^xsd:integer .
</file>

<file path="docs/archive/2024-09.md">
```bash
npm init -y

```
</file>

<file path="docs/archive/2025-12-21_tia-blog.md">
# TIA: A Small XMPP Lab That Talks Back

I am Codex and I helped Danny build this—TIA, a chatty little lab where bots hang out in an XMPP room and do useful (and occasionally quirky) things. The vibe is informal: you spin up a few agents, toss a prompt into the room, and watch them negotiate, reason, and riff in real time. But under the hood it’s tidy: agents are modular, they load their profiles from RDF, and they can speak via MCP tools as easily as they can speak via XMPP.

At its core, TIA is a collection of long-running bots. They live in `src/services`, and each one has a narrow personality: Mistral for general chat, Chair for IBIS-style debate, Prolog for logic puzzles, Creative for freeform imagination, Demo for quick smoke tests, and Semem for MCP-backed knowledge flows. The bots all connect to an XMPP MUC (multi-user chat) room, so when you watch the room it feels like a little society. Each agent has a profile in `config/agents/*.ttl`, which is nice because you can inspect or change the system by editing text files instead of digging through code.

The most practical part: TIA exposes a Model Context Protocol server. That means any MCP-compatible client can talk to the room, send messages, and even query for recent chat history. It’s a clean bridge between AI tools and a real-time chat environment. If you fire up the MCP server, it can auto-register a transient account like `mcp-583`, join the room, and send messages right away. You can also ask it for recent messages so you can poll for responses without a streaming connection.

What makes this system feel surprisingly robust is that the XMPP layer knows how to rejoin the room when connections flicker. It uses a simple reconnect-and-rejoin loop with backoff. That’s just enough resilience to survive the day-to-day hiccups of a local XMPP server without turning into a heavyweight reliability project.

There’s also a little bit of safety logic: the agents don’t respond forever to other agents unless they’re explicitly addressed. This keeps them from spinning into long bot-to-bot chatter loops. The default “agent rounds” limit is five, and it’s set in a small system config file (`config/system.ttl`), which is a nice nod to “configuration is data.”

If you want to poke it, the workflow is straightforward: install dependencies, start a bot, and watch the room. The demo bot runs without an API key, so it’s a good first step. When you want to add a new agent or tweak behavior, you usually just add a profile, adjust a setting, and the rest of the system adapts.

So that’s TIA in a nutshell: a modular, inspectable, and slightly playful XMPP bot lab with MCP bridges. It’s small enough to be understood, but expressive enough to do real collaborative chat workflows. If you enjoy systems where AI tools are first-class participants in a chat room, this is a fun one to explore.
</file>

<file path="docs/archive/2025-12-21.md">
# MCP chat troubleshooting (2025-12-21)

## Current status
- `tia-chat` MCP server now auto-builds a profile when `AGENT_PROFILE` is unset; it registers as `mcp-###` and joins `MUC_ROOM` (default `general@conference.tensegrity.it`).
- `autoConnectXmpp` temporary client is stopped before `XmppRoomAgent` starts to avoid XMPP resource conflict.
- `XmppRoomAgent` logs when sending group messages: `Sending group message to <room> as <nick>`.
- MCP server logs show registration/connect/join, but group messages still not visible in the room.
- Added buffering of incoming messages and a new MCP tool `getRecentMessages`.

## Files changed
- `src/mcp/servers/tia-mcp-server.js`
  - Default profile no longer `mistral`; random `mcp-###` profile built.
  - Stops auto-connect client before starting `XmppRoomAgent`.
  - Exposes `getRecentMessages` via MCP.
- `src/lib/xmpp-room-agent.js`
  - Logs when sending group message.
- `src/mcp/chat-adapter.js`
  - Records incoming messages into a ring buffer (default 50) and exposes `getRecentMessages`.
- `src/mcp/tool-definitions.js`
  - Adds `getRecentMessages(limit?)` MCP tool.

## Repro context
- MCP tool used: `sendMessage` with text (example: "Hello Chair").
- Registration logs example:
  - `Connected as mcp-583@tensegrity.it/mcp-583`
  - `Joining room general@conference.tensegrity.it as mcp-583`
  - `Joined room general@conference.tensegrity.it as mcp-583`
- Issue: no message appears in the MUC even though `sendMessage` returns `sent: true`.

## Next checks
- Restart MCP server to ensure updated code is running.
- Look for the send log line: `Sending group message to general@conference.tensegrity.it as mcp-###`.
- If the line is missing, the server is not on updated code.
- If the line is present but message still missing, inspect XMPP server logs / MUC permissions or stanza filtering.
- Use `getRecentMessages` to verify inbound messages are captured by MCP server.
</file>

<file path="docs/api-reference.md">
# API Reference (Draft)

## Core

### `AgentRunner`
```javascript
new AgentRunner({
  profile,
  xmppConfig,
  roomJid,
  nickname,
  provider,
  negotiator,
  mentionDetector,
  commandParser,
  allowSelfMessages,
  respondToAll,
  logger
})
```

### `AgentProfile`
```javascript
new AgentProfile({ identifier, nickname, type, xmppAccount, roomJid, provider, capabilities, lingue, metadata })
```

### `loadAgentProfile`
```javascript
const profile = await loadAgentProfile("mistral");
```

## Lingue

### `LingueNegotiator`
```javascript
new LingueNegotiator({ profile, xmppClient, handlers, logger })
```

### `LanguageModeHandler`
```javascript
class LanguageModeHandler { createStanza(); parseStanza(); }
```

### Constants
```javascript
import { LANGUAGE_MODES, FEATURES, MIME_TYPES } from "./lib/lingue/constants.js";
```

## Providers

### `BaseProvider`
```javascript
class BaseProvider { async handle({ command, content, metadata, reply }) {} }
```
</file>

<file path="docs/auto-registration.md">
# XMPP Auto-Connect & Registration

TIA provides automatic credential loading and connection management for agents. When an agent attempts to connect, it automatically loads credentials from `config/agents/secrets.json`, making deployment and configuration simpler.

## Features

- **Automatic credential loading**: Agents load passwords from `secrets.json` automatically
- **Simplified deployment**: No need to pass passwords via environment variables
- **Credential persistence**: Credentials are centrally managed in `config/agents/secrets.json`
- **Clear error messages**: Helpful feedback when credentials are missing or invalid

## Recommended Setup

For production use, we recommend creating accounts via `prosodyctl` on the server:

```bash
# On the Prosody server
prosodyctl register myagent tensegrity.it mypassword123
```

Then add the credentials to `config/agents/secrets.json`:
```json
{
  "xmpp": {
    "myagent": "mypassword123"
  }
}
```

## Server Setup

### Creating Accounts via Prosodyctl

The recommended way to create accounts is via `prosodyctl` on the server:

```bash
# SSH to your Prosody server
ssh user@tensegrity.it

# Register an account
prosodyctl register username tensegrity.it password123

# Verify the account
prosodyctl listusers tensegrity.it
```

### Optional: Enabling Self-Registration in Prosody

If you want to enable in-band registration (XEP-0077) for programmatic account creation:

Edit `/etc/prosody/prosody.cfg.lua`:

```lua
modules_enabled = {
    -- ... other modules ...
    "register"; -- Allow users to register accounts
}

-- Allow open registration
allow_registration = true

-- Optional: Rate limiting to prevent abuse
registration_throttle_max = 5
registration_throttle_period = 3600  -- 1 hour
```

Comment out invite-only registration:
```lua
-- "invites_register"; -- Comment this out for open registration
```

Restart Prosody:
```bash
sudo prosodyctl restart
```

## Usage

### Basic Usage (Recommended)

Create the account on the server first, then add credentials to `secrets.json`:

```javascript
import { autoConnectXmpp } from "tia-agents/lib/xmpp-auto-connect.js";

// Credentials will be loaded from config/agents/secrets.json
const { xmpp, credentials } = await autoConnectXmpp({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  autoRegister: false // Don't attempt registration
});

console.log(`Connected as ${credentials.username}`);
```

### Programmatic Registration (Client-Side)

Client-side registration via XEP-0077 in-band registration is now fully supported:

```javascript
import { registerXmppAccount, generatePassword } from "tia-agents/lib/xmpp-register.js";

const password = generatePassword(16);

const result = await registerXmppAccount({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  password,
  tls: { rejectUnauthorized: false }
});

console.log(result.message); // "Account myagent@tensegrity.it registered successfully"

// Credentials will be automatically saved if using autoConnectXmpp
```

### Auto-Registration (Fully Automatic)

The easiest approach - automatically registers if no credentials exist:

```javascript
import { autoConnectXmpp } from "tia-agents/lib/xmpp-auto-connect.js";

// If no password in secrets.json, automatically registers a new account
const { xmpp, credentials } = await autoConnectXmpp({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  autoRegister: true // Enable auto-registration
});

if (credentials.registered) {
  console.log(`New account created: ${credentials.username}`);
  console.log(`Password: ${credentials.password}`);
  console.log("Credentials saved to config/agents/secrets.json");
}
```

### With XmppRoomAgent

```javascript
import { autoConnectXmpp } from "tia-agents/lib/xmpp-auto-connect.js";
import { XmppRoomAgent } from "tia-agents/lib/xmpp-room-agent.js";

// First, auto-connect (registers if needed)
const { credentials } = await autoConnectXmpp({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  autoRegister: true
});

// Then create agent with credentials
const agent = new XmppRoomAgent({
  xmppConfig: {
    service: "xmpp://tensegrity.it:5222",
    domain: "tensegrity.it",
    username: credentials.username,
    password: credentials.password,
    tls: { rejectUnauthorized: false }
  },
  roomJid: "general@conference.tensegrity.it",
  nickname: "MyAgent",
  onMessage: async (payload) => {
    console.log(`Message from ${payload.sender}: ${payload.body}`);
  }
});

await agent.start();
```

### Manual Registration

If you want to register an account manually:

```javascript
import { registerXmppAccount, generatePassword } from "tia-agents/lib/xmpp-register.js";

const password = generatePassword(16); // Generate secure random password

const result = await registerXmppAccount({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  password,
  tls: { rejectUnauthorized: false }
});

console.log(result.message); // "Account myagent@tensegrity.it registered successfully"
```

## Configuration Options

### `autoConnectXmpp(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `service` | string | required | XMPP service URL (e.g., `xmpp://host:5222`) |
| `domain` | string | required | XMPP domain |
| `username` | string | required | Username to register/login |
| `password` | string | optional | Password (if omitted, triggers registration) |
| `resource` | string | optional | XMPP resource identifier |
| `tls` | object | `{rejectUnauthorized: false}` | TLS configuration |
| `secretsPath` | string | `config/agents/secrets.json` | Path to secrets file |
| `autoRegister` | boolean | `true` | Enable auto-registration |
| `logger` | object | `console` | Logger instance |

### `registerXmppAccount(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `service` | string | required | XMPP service URL |
| `domain` | string | required | XMPP domain |
| `username` | string | required | Desired username |
| `password` | string | required | Desired password |
| `tls` | object | `{rejectUnauthorized: false}` | TLS configuration |
| `logger` | object | `console` | Logger instance |

## Credential Storage

Registered credentials are automatically saved to `config/agents/secrets.json`:

```json
{
  "xmpp": {
    "myagent": "generated-password-here",
    "anotheragent": "another-password"
  }
}
```

This file is `.gitignore`d to prevent credentials from being committed.

## Integration Testing

Run integration tests against tensegrity.it:

```bash
RUN_TENSEGRITY_TESTS=true npm test -- xmpp-auto-register
```

The test suite will:
1. Generate a unique test username
2. Register the account automatically
3. Verify credentials are saved
4. Test reconnection using saved credentials
5. Verify the account can join MUC rooms and send messages
6. Test registration conflict handling
7. Clean up test artifacts

## Error Handling

Common errors and solutions:

### Registration Not Allowed

```
Error: Registration not allowed on this server
```

**Solution**: Enable the `register` module in Prosody and set `allow_registration = true`

### Username Already Exists

```
Error: Username myagent already exists
```

**Solution**: Choose a different username or use the existing credentials

### Server Does Not Support Registration

```
Error: Server does not support registration
```

**Solution**: The XMPP server doesn't implement XEP-0077. Register accounts manually via `prosodyctl`:

```bash
prosodyctl register myagent tensegrity.it mypassword
```

## Security Considerations

1. **Password Strength**: Auto-generated passwords are 16 characters, alphanumeric
2. **Secrets File**: `config/agents/secrets.json` must be protected with appropriate file permissions
3. **Rate Limiting**: Configure `registration_throttle_max` in Prosody to prevent abuse
4. **Production Use**: Consider using manual registration or external authentication for production deployments

## MCP Agent Example

The MCP agent can use auto-registration for easier deployment:

```bash
# No password needed - will auto-register
XMPP_SERVICE=xmpp://tensegrity.it:5222 \
XMPP_DOMAIN=tensegrity.it \
AGENT_PROFILE=mcp-loopback \
node src/services/mcp-loopback-agent.js
```

The agent will:
1. Check for existing credentials in `config/agents/secrets.json`
2. If not found, register a new account
3. Save credentials for future use
4. Connect and join the configured MUC room

## API Reference

### generatePassword(length)

Generates a cryptographically secure random password.

**Parameters:**
- `length` (number, default: 16): Password length

**Returns:** string - Random password

**Example:**
```javascript
import { generatePassword } from "tia-agents/lib/xmpp-register.js";

const password = generatePassword(20);
console.log(password); // "a3B9xP2mQ7nK5fL8wR4t"
```

## See Also

- [Agent Configuration](agents.md) - Configuring agent profiles
- [Testing](testing.md) - Running integration tests
- [XEP-0077: In-Band Registration](https://xmpp.org/extensions/xep-0077.html) - XMPP specification
</file>

<file path="docs/data-agent.md">
# Data Agent

The Data agent queries SPARQL endpoints (Wikidata by default) to answer questions about entities and return knowledge graph data in human-friendly format.

## Overview

The Data agent is a **knowledge query agent** that:
- Queries SPARQL endpoints like Wikidata, DBpedia, or custom triplestores
- Supports three query modes: command-based, natural language, and direct SPARQL
- Returns human-friendly summaries instead of raw JSON
- Uses Lingue protocol for SPARQL query negotiation
- Is fully configurable via RDF profiles with no hardcoded defaults

## Architecture

```
User Message → Command Parser → DataProvider → MCP Bridge → SPARQL Server → Endpoint
                                       ↓
                                 Mistral API (for entity extraction)
                                       ↓
                                Human-friendly summary ← JSON results
```

**Key Components:**
- **DataProvider** (`src/agents/providers/data-provider.js`) - Core provider logic
- **SPARQL Server** (`src/mcp/servers/sparql-server.js`) - MCP server for SPARQL queries
- **Profile** (`config/agents/data.ttl`) - RDF configuration
- **Lingue Handler** (`src/lib/lingue/handlers/sparql-query-handler.js`) - SparqlQuery mode

## Three Query Modes

### 1. Command Mode: `query: <entity>`

Direct entity lookup using the `query:` command prefix.

**Examples:**
```
Data, query: Albert Einstein
Data, query: Marie Curie
Data, query: JavaScript
```

**How it works:**
1. User provides entity name after `query:`
2. DataProvider builds Wikidata SPARQL query
3. Query executed via MCP SPARQL server
4. Results formatted as human-readable summary

### 2. Natural Language Mode

Ask questions naturally; the agent extracts the entity using Mistral API.

**Examples:**
```
Data, who was Albert Einstein?
Data, what is JavaScript?
Data, tell me about Marie Curie
```

**How it works:**
1. User asks natural language question
2. Mistral API extracts main entity from question
3. Same as command mode with extracted entity
4. Returns formatted summary

**Requires:** `MISTRAL_API_KEY` environment variable

### 3. Direct SPARQL Mode: `sparql: <query>`

Execute arbitrary SPARQL queries directly against the endpoint.

**Examples:**
```
Data, sparql: SELECT ?label WHERE { wd:Q937 rdfs:label ?label } LIMIT 1
Data, sparql: SELECT * WHERE {?s ?p ?o} LIMIT 5
```

**How it works:**
1. User provides complete SPARQL query
2. Query executed as-is via MCP server
3. Results formatted as summary

**Via Lingue:** Direct SPARQL queries can also be sent via the `lng:SparqlQuery` Lingue mode for agent-to-agent communication.

## Usage

### Starting the Agent

```bash
# Basic start
./start-data-agent.sh

# With custom profile
AGENT_PROFILE=data-dbpedia node src/services/data-agent.js
```

### In Chat

**Mention the agent:**
```
Data, query: Isaac Newton
Data, who invented the telephone?
```

**Direct Message:**
Send DMs to the Data agent's JID for private queries.

**Command Syntax:**
- `query: <entity>` or `query <entity>` - Entity lookup
- `sparql: <query>` or `sparql <query>` - Direct SPARQL
- Natural language - Any other question

## Configuration

### RDF Profile (`config/agents/data.ttl`)

```turtle
<#data> a agent:ConversationalAgent, agent:KnowledgeAgent, lng:Agent, mcp:Client ;
  foaf:nick "Data" ;
  schema:identifier "data" ;

  agent:xmppAccount [
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "data" ;
    xmpp:passwordKey "data" ;
    xmpp:resource "Data"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:dataProvider [
    a ai:DataProvider ;
    ai:sparqlEndpoint "https://query.wikidata.org/sparql" ;
    ai:extractionModel "mistral-small-latest" ;
    ai:extractionApiKeyEnv "MISTRAL_API_KEY" ;
    ai:maxTokens "50"^^xsd:integer ;
    ai:temperature "0.3"^^xsd:float
  ] ;

  lng:supports lng:HumanChat, lng:SparqlQuery ;
  lng:prefers lng:SparqlQuery .
```

### Configuration Properties

**Data Provider (`agent:dataProvider`):**
- `ai:sparqlEndpoint` - SPARQL endpoint URL (required)
- `ai:extractionModel` - Mistral model for entity extraction (optional, for natural language mode)
- `ai:extractionApiKeyEnv` - Env var name for Mistral API key (default: `MISTRAL_API_KEY`)
- `ai:maxTokens` - Max tokens for extraction (default: 50)
- `ai:temperature` - Temperature for extraction (default: 0.3)

**XMPP Account:**
- Standard XMPP configuration (service, domain, username, resource)
- Password stored in `config/agents/secrets.json` under key specified by `xmpp:passwordKey`

**Lingue Modes:**
- `lng:HumanChat` - Natural language chat
- `lng:SparqlQuery` - Direct SPARQL queries via Lingue protocol

### Secrets (`config/agents/secrets.json`)

```json
{
  "xmpp": {
    "data": "your-password-here"
  }
}
```

### Environment Variables

**Required:**
- None (all configuration from profile)

**Optional:**
- `MISTRAL_API_KEY` - For natural language entity extraction
- `AGENT_PROFILE` - Profile name to load (default: `data`)
- XMPP overrides (if needed): `XMPP_SERVICE`, `XMPP_DOMAIN`, `MUC_ROOM`, etc.

## Adapting for Other SPARQL Endpoints

The Data agent can query any SPARQL endpoint by changing the profile.

### DBpedia Example

Create `config/agents/data-dbpedia.ttl`:

```turtle
<#data-dbpedia> a agent:ConversationalAgent, agent:KnowledgeAgent ;
  foaf:nick "DBpedia" ;
  schema:identifier "data-dbpedia" ;

  agent:dataProvider [
    a ai:DataProvider ;
    ai:sparqlEndpoint "https://dbpedia.org/sparql" ;
    ai:extractionModel "mistral-small-latest" ;
    ai:extractionApiKeyEnv "MISTRAL_API_KEY"
  ] ;
  # ... rest of profile
```

Start with: `AGENT_PROFILE=data-dbpedia node src/services/data-agent.js`

### Local Triplestore Example

For a local Apache Jena Fuseki instance:

```turtle
agent:dataProvider [
  a ai:DataProvider ;
  ai:sparqlEndpoint "http://localhost:3030/dataset/sparql" ;
  ai:extractionModel "mistral-small-latest" ;
  ai:extractionApiKeyEnv "MISTRAL_API_KEY"
] ;
```

### Endpoint-Specific Query Builders

The DataProvider includes a Wikidata query builder (`buildWikidataQuery`). For other endpoints, you can:

1. Extend DataProvider with custom query builders
2. Use direct SPARQL mode with endpoint-specific queries
3. Create a derived provider class for complex endpoint logic

## Response Format

Results are formatted as human-friendly summaries:

```
Query: "Data, query: Albert Einstein"

Response:
1. Albert Einstein: German-born theoretical physicist (human)
2. Albert Einstein: Wikimedia disambiguation page (Wikimedia disambiguation page)
```

Format:
```
<number>. <label>: <description> (<type>)
```

**Empty results:**
```
No results found.
```

**Errors:**
```
Query timeout - the SPARQL endpoint took too long to respond.
Connection error - could not reach SPARQL endpoint.
Query error - malformed SPARQL query.
```

## Lingue Integration

The Data agent supports the **SparqlQuery** Lingue mode for agent-to-agent SPARQL query exchange.

**Mode URI:** `http://purl.org/stuff/lingue/SparqlQuery`

**Feature:** `http://purl.org/stuff/lingue/feature/lang/sparql-query`

**MIME Type:** `application/sparql-query`

**Usage:**
- Other agents can send SPARQL queries to Data agent via Lingue negotiation
- Data agent responds with formatted results
- Useful for knowledge graph integration in multi-agent systems

## Testing

### Manual Testing

```bash
# Start the agent
./start-data-agent.sh

# In another terminal, use the test client
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js testuser testpass

# Send test queries
Data, query: Alan Turing
Data, who was Ada Lovelace?
Data, sparql: SELECT * WHERE {?s ?p ?o} LIMIT 3
```

### Automated Test Script

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-data-agent.js
```

Tests all three query modes and displays results.

## Implementation Details

### Provider Architecture

**DataProvider** extends the base provider pattern:

```javascript
async handle({ command, content, metadata, reply }) {
  if (command === "query") return await this.handleEntityQuery(content);
  if (command === "sparql") return await this.handleDirectSparql(content);
  if (command === "chat") return await this.handleNaturalLanguage(content);
  return `${this.nickname} supports: query <entity>, sparql <query>, or natural language`;
}
```

**Key methods:**
- `handleEntityQuery(entity)` - Build and execute entity query
- `handleNaturalLanguage(text)` - Extract entity with Mistral, then query
- `handleDirectSparql(sparql)` - Execute raw SPARQL
- `buildWikidataQuery(entity)` - Construct Wikidata SPARQL query
- `formatResults(jsonText)` - Parse and format JSON results
- `extractEntity(text)` - Use Mistral to extract entity from natural language

### MCP Integration

The Data agent uses `McpClientBridge` to communicate with the SPARQL server:

```javascript
const mcpBridge = new McpClientBridge({
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: { SPARQL_QUERY_ENDPOINT: endpoint }
  }
});

await mcpBridge.connect();
const result = await mcpBridge.callTool("sparqlQuery", { query, endpoint });
```

**Tools available:**
- `sparqlQuery` - Execute SELECT/ASK/CONSTRUCT queries
- `sparqlUpdate` - Execute UPDATE statements (if needed)

### Command Parser Extension

The default command parser was extended to support `query:` and `sparql:` commands:

```javascript
if (lowered.startsWith("query:") || lowered.startsWith("query ")) {
  return { command: "query", content: trimmed.slice(6).trim() };
}
if (lowered.startsWith("sparql:") || lowered.startsWith("sparql ")) {
  return { command: "sparql", content: trimmed.slice(7).trim() };
}
```

This makes the commands available to all agents using the default parser.

## Error Handling

**Network Errors:**
- Connection failures → "Connection error - could not reach SPARQL endpoint."
- Timeouts → "Query timeout - the SPARQL endpoint took too long to respond."

**Query Errors:**
- Malformed SPARQL → "Query error - malformed SPARQL query."
- No entity found → "No results found."

**Configuration Errors:**
- Missing endpoint → Throws error on startup
- Missing API key → Natural language mode disabled, warning logged

## Future Enhancements

**Potential improvements:**
- Support for SPARQL UPDATE operations (data modification)
- Query result caching for frequently asked entities
- Multiple endpoint federation (query across multiple knowledge graphs)
- Enhanced result formatting with custom templates
- Integration with semantic reasoning engines
- Support for named graphs and graph protocols
- Query optimization and rewriting
- Federation with external knowledge bases

## Related Documentation

- [MCP Server Guide](mcp-server.md) - SPARQL server implementation
- [MCP Client Guide](mcp-client.md) - MCP bridge usage
- [Lingue Integration](lingue-integration.md) - Lingue protocol details
- [Agents Overview](agents.md) - All available agents
- [API Reference](api-reference.md) - Agent framework API

## References

- [Wikidata Query Service](https://query.wikidata.org/)
- [SPARQL 1.1 Specification](https://www.w3.org/TR/sparql11-query/)
- [DBpedia SPARQL Endpoint](https://dbpedia.org/sparql)
- [Lingue Protocol](https://danja.github.io/lingue/)
</file>

<file path="docs/debating-society.md">
The debating society is an experiment in a mixed environment of intelligent agents (including humans).
There will be two key agents with specific roles : Chair and Recorder
Chair will coordinate inter-agent exchange of profiles, so eg. Semem may declare in Lingue RDF vocabulary that it has the capability of looking things up in wikidata, Mistral can translate between plain English and IBIS declarations and Recorder will declare that it is taking minutes. 
Exchanges will operate through a baseline of regular human-style chat but the Chair will periodically poll for consensus, ask for opinions and statements of fact or other such IBIS operation.
A debate will be initiated with a question, for example "Is the Earth flat?". The Chair will decide from onsensus when the Issue is resolved.
The system will reuse the existing code infrastructure wherever possible, favoring a modular approach. Any new operational code of significance will be given Vitest tests. Separation of concerned will be maintained, so the eg. prompt construction will be carried out through templating of separate text files, not inline with the code. RDF operations will make use of the standard RDF libs in the project, again, no inline RDF or SPARQL.  

## Implementation Plan

1) Profiles & Roles
- Add dedicated agent profiles (config/agents) for Chair and Recorder (distinct XMPP accounts/resources). Chair orchestrates; Recorder stores minutes.
- Keep Mistral and Semem as supporting agents; ensure Lingue/IBIS enabled for all participants.

2) Chair Orchestration
- Chair listens for debate initiation (`Issue: ...` or a “start debate” trigger).
- Periodically polls for consensus, requests Positions/Arguments, and posts a brief IBIS summary using `summarizeIBIS`.
- Uses mention detection only from profile nickname; no hardcoded aliases.

3) Recorder Logging
- Recorder captures MUC traffic and persists structured minutes:
  - Store IBIS summaries and raw statements via Semem `/tell` (using existing Semem provider or Recorder-specific).
  - Use Lingue detection to tag Issues/Positions/Arguments.

4) IBIS/Lingue Integration
- Reuse `ibis-detect` and Lingue summaries; ensure `LINGUE_ENABLED=true` for Chair/Recorder.
- Add Vitest coverage for: IBIS detection -> summary -> Recorder store; Chair prompting for Positions -> response flow.

5) Prompt/Template Separation
- Store Chair/Recorder prompts in templates (e.g., `config/prompts/chair.txt`, `recorder.txt`) not inline.
- Chair prompt covers polling cadence, consensus checks, and brevity.

6) Storage & RDF
- Use existing Semem client for `/tell` (Recorder) and `/ask` (Chair retrieval).
- No inline RDF/SPARQL; rely on existing RDF libs if exporting IBIS structures later.

7) Start/Run
- Add profiles to `config/agents` for chair/recorder; launch via `start-all-agents.sh` or individual start scripts with `AGENT_PROFILE=<name>`.
- Ensure distinct XMPP users/resources to avoid “bot” identity collision.
- Debate-only start: use `./start-debate-agents.sh` (AGENTS=chair,recorder) for testing Chair/Recorder without other bots.

8) Testing
- Unit: prompt/template loading; IBIS detection path.
- Integration (when XMPP reachable): Chair responds to “start debate” and polls; Recorder stores summaries via Semem `/tell`.

9) Logging & Monitoring
- Use logger-lite with file output and concise log level; add key events (debate started, poll issued, summary stored).
</file>

<file path="docs/ibis.md">
# IBIS & Lingue Overview

This project can detect and surface IBIS (Issue-Based Information System) structures in chat when Lingue is enabled. IBIS identifies Issues, Positions, and Arguments in text and can emit short summaries in the MUC or DMs.

## What users see
- When Lingue is enabled, bots (Mistral, Semem) listen for Issue/Position/Argument patterns.
- If confidence is high, the bot posts a short IBIS-style summary alongside its normal reply.
- In DMs, the summary is sent privately; in MUC, the summary is sent to the room.

## How to trigger
- Mention the bot with Issue/Position/Argument language, e.g.:
  - “Issue: How should we handle authentication? I propose OAuth2 because it is standard, but the downside is complexity.”
  - “Position: Use X. Argument: It’s faster.”
- Shorthand labels also work:
  - `I:` / `Issue:` for issues
  - `P:` / `Position:` for positions
  - `A:` / `Arg:` / `Argument:` for arguments
  - `S:` / `Support:` for supporting arguments
  - `O:` / `Objection:` / `Oppose:` for objections
- `A:` is neutral by default; the detector infers support vs objection from nearby words (e.g., “because” → support, “however” → objection).
- Lingue runs automatically when `LINGUE_ENABLED=true` (default).

## Configuration
- `.env`:
  - `LINGUE_ENABLED=true` (default; set to `false` to disable)
  - `LINGUE_CONFIDENCE_MIN` (default `0.5`; raise to reduce summary frequency)
- Bots use these envs:
  - Mistral bot: `src/services/mistral-bot.js`
  - Semem agent: `src/services/semem-agent.js`

## Under the hood
- Detection functions live in `src/lib/ibis-detect.js`.
- Summaries are generated via `summarizeIBIS` and posted when confidence ≥ `LINGUE_CONFIDENCE_MIN`.
- IBIS structures can be converted to RDF/Turtle via `src/lib/ibis-rdf.js`, though chat bots only emit the text summary.

## Testing IBIS
- Unit test: `test/ibis.test.js` (runs with `npm test`).
- Quick demo: try the sample text above with Mistral or Semem in a MUC (with Lingue enabled) and watch for the IBIS summary message.
</file>

<file path="docs/lingue-integration.md">
# Lingue Integration Guide

This guide describes how to advertise Lingue capabilities, negotiate modes, and exchange structured payloads.

## Capability Advertisement

Agents should advertise Lingue support via XEP-0030 disco#info. Features are defined in `src/lib/lingue/constants.js`.

Example features:
- `http://purl.org/stuff/lingue/feature/lang/human-chat`
- `http://purl.org/stuff/lingue/feature/lang/ibis-text`
- `http://purl.org/stuff/lingue/feature/lang/prolog-program`
- `http://purl.org/stuff/lingue/feature/lang/profile-exchange`

## Profile Declarations

Add Lingue properties to each agent in `config/agents/*.ttl`:

```turtle
@prefix lng: <http://purl.org/stuff/lingue/> .

<#agent> a lng:Agent ;
  lng:supports lng:HumanChat, lng:IBISText ;
  lng:prefers lng:HumanChat ;
  lng:profile <#agent-lingue-profile> .
```

## Negotiation Flow

1. Sender offers one or more modes.
2. Receiver selects a supported mode.
3. Both sides store the active mode for the peer.

The `LingueNegotiator` handles offer/accept stanzas and routes structured messages via handlers.

## Handlers

Handlers implement mode-specific payloads:
- `HumanChatHandler` - text/plain
- `IBISTextHandler` - text/plain + text/turtle payload
- `PrologProgramHandler` - text/x-prolog payload
- `ProfileExchangeHandler` - text/turtle payload

Register handlers based on `profile.supportsLingueMode()` and pass them into `LingueNegotiator`.

## ASK/TELL Semantics

Use IBIS RDF for ASK/TELL:
- `ASK` maps to `ibis:Issue` or `ibis:Question`
- `TELL` maps to `ibis:Position` or `ibis:Argument`

Keep MUC messages human-readable with a short `summary` plus payload attachments.

## Prolog Agent Notes

The Prolog agent uses tau-prolog and supports:
- `tell <clauses>` to load clauses into the session.
- `ask <query>` to run a query.
- Inline program + query using `?-` (program above, query below).

The Lingue `PrologProgram` handler can carry program text in structured payloads.
</file>

<file path="docs/mcp-client.md">
# MCP Client Guide

TIA MCP client support lives in `src/mcp/client-bridge.js`.

## Basic Usage

```javascript
import { McpClientBridge } from "../src/mcp/client-bridge.js";
import { loadAgentProfile } from "../src/agents/profile-loader.js";

const profile = await loadAgentProfile("demo");
const bridge = new McpClientBridge({
  profile,
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: process.env
  }
});

await bridge.connect();
await bridge.populateProfile();

console.log(profile.mcp.tools);
console.log(profile.mcp.endpoints);
```

## Tool Metadata Mapping

- MCP tools → `profile.mcp.tools`
- MCP resources → `profile.mcp.resources`
- MCP prompts → `profile.mcp.prompts`
- Tool `_meta.tia.endpoints` → `profile.mcp.endpoints`

See `vocabs/mcp-ontology.ttl` for the RDF vocabulary.
</file>

<file path="docs/MCP-PLAN.md">
# MCP Integration Plan

> **Status**: Planning Phase
> **Updated**: 2025-02-14
> **Goal**: Add MCP client/server bridges for TIA agents and expose MCP capabilities via RDF profiles

## Overview

Implement two MCP bridges:
- **MCP Client Bridge**: TIA agent connects to MCP servers, loads tool metadata, and reflects capabilities into the agent profile (`vocabs/mcp-ontology.ttl`).
- **MCP Server Bridge**: TIA agent exposes core chat/Lingue facilities as MCP tools, backed by XMPP MUC operations.

For testing, create a **simple MCP server** that exposes a remote SPARQL store as tools and publishes endpoint metadata that the MCP client can ingest into a TIA profile.

## Design Principles

- Modular, DI-friendly classes in `src/mcp/`
- No direct coupling to XMPP internals; rely on thin adapters
- Profile metadata derives from MCP tool schemas (via `mcp-ontology.ttl`)
- Keep non-network logic testable with fixtures

---

## Phase 1: Planning & Vocabulary Mapping

**Objective**: Define RDF mapping from MCP tool metadata into TIA profiles.

**Work**:
- Review `vocabs/mcp-ontology.ttl` and define mapping rules.
- Draft profile extensions for MCP tool capabilities:
  - `mcp:Tool`
  - `mcp:hasTool`
  - `mcp:hasEndpoint`
  - `mcp:parameters` (as a literal or blank node)
- Identify how tool schemas map to RDF labels/description.

**Outputs**:
- Document mapping in this plan.
- Add helper functions stubbed in `src/mcp/`.

**Success Criteria**:
- Clear schema mapping for tool metadata → RDF profile fields.

**Mapping Notes**:
- MCP tools map to `profile.mcp.tools` entries with `{ name, description, inputSchema, endpoints }`.
- Endpoints come from tool `_meta.tia.endpoints` or `_meta.endpoints`, stored in `profile.mcp.endpoints`.
- Profile RDF adds `mcp:Client` type, `mcp:hasCapability`, and `mcp:providesTool` / `mcp:providesResource` / `mcp:providesPrompt` nodes.

---

## Phase 2: MCP Client Bridge

**Objective**: Create MCP client bridge that connects to an MCP server and exposes tools to TIA agent.

**Module Structure**:
```
src/mcp/
├── client-bridge.js      # MCP client wrapper
├── profile-mapper.js     # Tool metadata → RDF profile
├── tool-registry.js      # Normalize and store tool metadata
└── index.js
```

**Key Interfaces**:
```javascript
export class McpClientBridge {
  constructor({ client, profile, mapper, logger })
  async connect()
  async listTools()
  async callTool(name, args)
  async populateProfile()
}
```

**Integration Points**:
- `AgentProfile` gains `mcp` metadata section or uses `custom` namespace.
- `loadAgentProfile()` optionally merges MCP metadata from a server.

**Tests**:
- Mock MCP server and verify tool metadata mapping.

**Success Criteria**:
- Tool metadata parsed and stored.
- Client can call tools.

---

## Phase 3: MCP Server Bridge (TIA)

**Objective**: Expose TIA agent capabilities as MCP tools.

**Tools to Expose**:
- `sendMessage` (groupchat or direct)
- `fetchLingueSummary` (IBIS detection)
- `offerLingueMode` (initiate negotiation)
- `getProfile` (agent profile as Turtle)

**Module Structure**:
```
src/mcp/
├── server-bridge.js
├── tool-definitions.js
└── chat-adapter.js
```

**Integration Points**:
- XMPP adapter for sending messages
- Lingue negotiator hooks

**Tests**:
- Local MCP client calls against a mock XMPP adapter

**Success Criteria**:
- MCP server exposes tools and routes requests to XMPP/Lingue.

---

## Phase 4: SPARQL MCP Test Server

**Objective**: Provide a simple MCP server exposing SPARQL endpoints.

**Behavior**:
- Tools: `sparqlQuery`, `sparqlUpdate`
- Metadata: endpoint URLs added to tool schema and profile mapping
- Config: endpoints from env or config file

**Files**:
- `src/mcp/servers/sparql-server.js`
- `config/mcp/sparql.json` (or `.env`)

**Success Criteria**:
- MCP client lists SPARQL tools and stores endpoints in profile.

---

## Phase 5: Docs & Examples

**Objective**: Document usage for MCP client/server and SPARQL server test.

**Docs**:
- `docs/mcp-client.md`
- `docs/mcp-server.md`
- README update

**Examples**:
- `src/examples/mcp-client-demo.js`
- `src/examples/mcp-sparql-server.js`

---

## Progress Tracking

### Phase 1: Planning & Mapping ⬜
- [x] Review `vocabs/mcp-ontology.ttl`
- [x] Define RDF mapping for tool metadata
- [x] Add mapping notes to this plan

### Phase 2: MCP Client Bridge ⬜
- [x] Implement client bridge
- [x] Implement profile mapper
- [x] Implement tool registry
- [x] Add tests

### Phase 3: MCP Server Bridge (TIA) ⬜
- [x] Implement server bridge
- [x] Define tools and adapters
- [ ] Add tests

### Phase 4: SPARQL MCP Test Server ⬜
- [x] Implement SPARQL server
- [x] Configure endpoints
- [ ] Add tests

### Phase 5: Docs & Examples ⬜
- [x] Add MCP docs
- [x] Add examples
- [x] Update README

---

## Open Questions

1. Should MCP metadata be stored in `AgentProfile.custom` or as a first-class `mcp` property?
2. How should tool schemas map to RDF nodes (flattened vs. nested blank nodes)?
3. Should the MCP client auto-refresh tools on reconnect?
4. How to represent multiple MCP servers in a single TIA profile?
</file>

<file path="docs/provider-guide.md">
# Provider Guide

This guide explains how to create custom providers for tia-agents. Providers handle incoming messages and generate responses.

## Table of Contents

- [Provider Basics](#provider-basics)
- [BaseProvider Interface](#baseprovider-interface)
- [Simple Provider Example](#simple-provider-example)
- [LLM Integration Pattern](#llm-integration-pattern)
- [History Management](#history-management)
- [Error Handling](#error-handling)
- [Testing Providers](#testing-providers)
- [Advanced Topics](#advanced-topics)

---

## Provider Basics

A **provider** is a class that implements the message handling logic for your bot. It receives messages, processes them, and returns responses.

### Key Concepts

- Providers extend `BaseProvider` from tia-agents
- The `handle()` method is called for each message
- Providers are stateful - maintain conversation history, API clients, etc.
- Providers are framework-agnostic - use any API or logic you want

---

## BaseProvider Interface

All providers must extend `BaseProvider` and implement the `handle()` method:

```javascript
import { BaseProvider } from "tia-agents";

class MyProvider extends BaseProvider {
  async handle({ command, content, metadata, reply, rawMessage }) {
    // Your logic here
    return "response string";
  }
}
```

### handle() Parameters

The `handle()` method receives an object with:

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | string | Command type: "chat", "ask", "tell", "augment", etc. |
| `content` | string | Message content (without command prefix) |
| `metadata` | object | `{ sender, type, roomJid }` - message metadata |
| `reply` | async function | For multi-part responses: `await reply(text)` |
| `rawMessage` | string | Original full message (before parsing) |

### handle() Return Value

- **String**: The response to send back
- **Null/Falsy**: Silent operation (no response sent)

---

## Simple Provider Example

Let's build a simple echo provider:

```javascript
import { BaseProvider } from "tia-agents";

export class EchoProvider extends BaseProvider {
  constructor({ nickname = "EchoBot", logger = console } = {}) {
    super();
    this.nickname = nickname;
    this.logger = logger;
  }

  async handle({ command, content, metadata }) {
    this.logger.info(`Received: ${command} - ${content}`);

    // Only respond to chat commands
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "${this.nickname.toLowerCase()}: <message>"`;
    }

    const sender = metadata.sender || "someone";
    return `@${sender} You said: ${content}`;
  }
}
```

### Usage

```javascript
import { createSimpleAgent } from "tia-agents";
import { EchoProvider } from "./echo-provider.js";

const runner = createSimpleAgent({
  xmppConfig: { /* ... */ },
  roomJid: "general@conference.xmpp",
  nickname: "EchoBot",
  provider: new EchoProvider({ nickname: "EchoBot" })
});

await runner.start();
```

---

## LLM Integration Pattern

Integrating with language model APIs follows this pattern:

```javascript
import { BaseProvider } from "tia-agents";
import { Mistral } from "@mistralai/mistralai";

export class MistralProvider extends BaseProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    systemPrompt = null,
    historyStore = null,
    logger = console
  }) {
    super();

    if (!apiKey) {
      throw new Error("API key is required");
    }

    this.client = new Mistral({ apiKey });
    this.model = model;
    this.nickname = nickname;
    this.systemPrompt = systemPrompt || `You are ${nickname}, a helpful assistant.`;
    this.historyStore = historyStore;
    this.logger = logger;
  }

  async handle({ command, content, metadata }) {
    if (command !== "chat") {
      return `${this.nickname} only supports chat`;
    }

    try {
      // Build message array
      const messages = [
        { role: "system", content: this.systemPrompt }
      ];

      // Add history
      if (this.historyStore) {
        const history = await this.historyStore.getHistory();
        messages.push(...history.map(entry => ({
          role: entry.role === "bot" ? "assistant" : "user",
          content: entry.content
        })));
      }

      // Add current message
      messages.push({ role: "user", content });

      // Call API
      const response = await this.client.chat.complete({
        model: this.model,
        messages
      });

      const aiResponse = response.choices[0].message.content;

      // Store in history
      if (this.historyStore) {
        await this.historyStore.addEntry({
          role: "user",
          content,
          sender: metadata.sender
        });
        await this.historyStore.addEntry({
          role: "bot",
          content: aiResponse
        });
      }

      return aiResponse;

    } catch (error) {
      this.logger.error("LLM error:", error);
      return "Sorry, I encountered an error processing your message.";
    }
  }
}
```

### Key Patterns

1. **API Client Initialization**: Create client in constructor
2. **System Prompts**: Define bot personality/instructions
3. **History Management**: Use historyStore to maintain context
4. **Error Handling**: Catch API errors, return friendly messages
5. **Logging**: Use logger for debugging

---

## History Management

Use `InMemoryHistoryStore` for conversation context:

```javascript
import { InMemoryHistoryStore } from "tia-agents";

const historyStore = new InMemoryHistoryStore({
  maxEntries: 40  // Keep last 40 messages
});

// In your provider
await this.historyStore.addEntry({
  role: "user",  // or "bot"
  content: "message text",
  sender: "username"
});

const history = await this.historyStore.getHistory();
// Returns: [{ role, content, sender, timestamp }, ...]
```

### Custom History Store

Implement your own for persistence:

```javascript
import { HistoryStore } from "tia-agents";

export class DatabaseHistoryStore extends HistoryStore {
  async addEntry(entry) {
    // Store in database
  }

  async getHistory() {
    // Retrieve from database
    return entries;
  }

  async clear() {
    // Clear database entries
  }
}
```

---

## Error Handling

Always handle errors gracefully:

```javascript
async handle({ command, content, metadata }) {
  try {
    // Your logic
    const result = await someAsyncOperation(content);
    return result;

  } catch (error) {
    // Log the error
    this.logger.error("Error processing message:", error);

    // Return user-friendly message
    if (error.code === "API_LIMIT") {
      return "Sorry, I've reached my API limit. Try again later.";
    }

    return "Sorry, I encountered an error. Please try again.";
  }
}
```

### Best Practices

- ✅ Log errors with context (use `this.logger.error()`)
- ✅ Return user-friendly error messages
- ✅ Don't expose internal details or stack traces to users
- ✅ Handle specific error cases (rate limits, timeouts, etc.)
- ❌ Don't let errors crash the bot

---

## Multi-Part Responses

Use `reply()` for streaming or multi-part responses:

```javascript
async handle({ command, content, metadata, reply }) {
  if (command !== "chat") {
    return "I only support chat";
  }

  // Send first part
  await reply("Let me think about that...");

  // Do processing
  const result = await heavyComputation(content);

  // Send final response
  await reply(`Here's my answer: ${result}`);

  // Return value is optional when using reply()
  return null;
}
```

---

## Testing Providers

### Unit Testing

```javascript
import { describe, it, expect } from "vitest";
import { EchoProvider } from "./echo-provider.js";

describe("EchoProvider", () => {
  it("echoes message back to sender", async () => {
    const provider = new EchoProvider({ nickname: "TestBot" });

    const result = await provider.handle({
      command: "chat",
      content: "hello world",
      metadata: { sender: "alice" }
    });

    expect(result).toBe("@alice You said: hello world");
  });

  it("rejects non-chat commands", async () => {
    const provider = new EchoProvider({ nickname: "TestBot" });

    const result = await provider.handle({
      command: "ask",
      content: "question",
      metadata: { sender: "bob" }
    });

    expect(result).toContain("only supports chat");
  });
});
```

### Integration Testing

Test with a real bot runner (see `test/` directory for examples).

---

## Advanced Topics

### Command Routing

Handle multiple command types:

```javascript
async handle({ command, content, metadata }) {
  switch (command) {
    case "chat":
      return await this.handleChat(content, metadata);

    case "ask":
      return await this.handleQuestion(content, metadata);

    case "tell":
      return await this.handleKnowledge(content, metadata);

    default:
      return `Unknown command: ${command}`;
  }
}
```

### State Management

Maintain per-user state:

```javascript
constructor({ nickname, logger } = {}) {
  super();
  this.nickname = nickname;
  this.logger = logger;
  this.userStates = new Map();  // user -> state
}

async handle({ command, content, metadata }) {
  const sender = metadata.sender;

  if (!this.userStates.has(sender)) {
    this.userStates.set(sender, { count: 0 });
  }

  const userState = this.userStates.get(sender);
  userState.count++;

  return `Hello ${sender}, this is message #${userState.count} from you`;
}
```

### Lingue Protocol Support

For advanced language mode negotiation, providers can expose disco features:

```javascript
import { attachDiscoInfoResponder, FEATURES } from "tia-agents/lingue";

constructor({ xmppClient, ...options }) {
  super();
  // ... initialization

  if (xmppClient) {
    attachDiscoInfoResponder(xmppClient, {
      features: [
        FEATURES.LANG_HUMAN_CHAT,
        FEATURES.LANG_IBIS_TEXT
      ]
    });
  }
}
```

See the [API Reference](./api-reference.md#lingue) for details.

---

## Provider Examples

The package includes several providers for reference:

| Provider | Location | Purpose |
|----------|----------|---------|
| DemoProvider | `tia-agents/providers/demo` | Simple mock responses |
| BaseProvider | `tia-agents/providers/base` | Abstract base class |
| MistralProvider | `src/agents/providers/mistral-provider.js` | Mistral AI integration |

Check `templates/providers/` for additional templates.

---

## Next Steps

- Review [API Reference](./api-reference.md) for complete API details
- Explore `src/agents/providers/` for real-world examples
- Join the discussion on [GitHub Issues](https://github.com/danja/tia/issues)

## Summary

Creating a custom provider:

1. Extend `BaseProvider`
2. Implement `async handle({ command, content, metadata, reply })`
3. Return a string response or null
4. Handle errors gracefully
5. Use historyStore for conversation context
6. Test thoroughly

That's it! You now have the knowledge to create sophisticated bot providers.
</file>

<file path="docs/quick-start.md">
# Quick Start Guide

Get started with tia-agents in minutes! This guide covers installation and the two main approaches to creating XMPP bots.

## Installation

```bash
npm install tia-agents
```

## Two Approaches

tia-agents supports two ways to create bots:

1. **Config-Driven**: Use `.ttl` profile files and `secrets.json` for configuration
2. **Programmatic**: Configure everything in code without external files

Choose the approach that best fits your workflow.

---

## Approach 1: Config-Driven (Recommended for Multiple Bots)

Best for: Managing multiple bots, team environments, declarative configuration

### Step 1: Create Configuration Directory

```bash
mkdir -p config/agents
```

### Step 2: Copy Templates

```bash
# Copy profile template
cp node_modules/tia-agents/templates/config/agent-profile.ttl config/agents/mybot.ttl

# Copy secrets template
cp node_modules/tia-agents/templates/config/secrets.example.json config/agents/secrets.json
```

### Step 3: Edit Configuration

**config/agents/mybot.ttl**:
```turtle
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix lng: <http://purl.org/stuff/lingue/> .

<#mybot> a agent:ConversationalAgent ;
  foaf:nick "MyBot" ;

  agent:xmppAccount [
    xmpp:service "xmpp://your-server.com:5222" ;
    xmpp:domain "your-server.com" ;
    xmpp:username "mybot" ;
    xmpp:passwordKey "mybot" ;
    xmpp:resource "MyBot"
  ] ;

  agent:roomJid "general@conference.your-server.com" .
```

**config/agents/secrets.json**:
```json
{
  "xmpp": {
    "mybot": "your-xmpp-password"
  }
}
```

**Important**: Add `config/agents/secrets.json` to your `.gitignore`!

### Step 4: Create Bot Script

**mybot.js**:
```javascript
import { createAgent, DemoProvider } from "tia-agents";

const runner = await createAgent("mybot", new DemoProvider());
await runner.start();

process.on("SIGINT", async () => {
  await runner.stop();
  process.exit(0);
});
```

### Step 5: Run Your Bot

```bash
node mybot.js
```

---

## Approach 2: Programmatic (Quickest Start)

Best for: Quick prototyping, single bots, embedded scenarios

### Create and Run

**mybot.js**:
```javascript
import { createSimpleAgent, DemoProvider } from "tia-agents";

const runner = createSimpleAgent({
  xmppConfig: {
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "mybot",
    password: "your-password",
    resource: "MyBot"
  },
  roomJid: "general@conference.xmpp",
  nickname: "MyBot",
  provider: new DemoProvider()
});

await runner.start();

process.on("SIGINT", async () => {
  await runner.stop();
  process.exit(0);
});
```

```bash
node mybot.js
```

---

## Creating a Custom Provider

Replace `DemoProvider` with your own logic:

```javascript
import { BaseProvider } from "tia-agents";

class MyProvider extends BaseProvider {
  async handle({ command, content, metadata }) {
    if (command !== "chat") {
      return "I only support chat commands";
    }

    // Your logic here
    return `You said: ${content}`;
  }
}

// Use with createAgent or createSimpleAgent
const runner = createSimpleAgent({
  // ... xmpp config
  provider: new MyProvider()
});
```

See the [Provider Guide](./provider-guide.md) for detailed examples.

---

## AI-Powered Bot (Mistral Example)

### Install Peer Dependency

```bash
npm install @mistralai/mistralai
```

### Create Config

**config/agents/aibot.ttl**:
```turtle
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .

<#aibot> a agent:ConversationalAgent, agent:AIAgent ;
  foaf:nick "AIBot" ;

  agent:xmppAccount [
    xmpp:service "xmpp://localhost:5222" ;
    xmpp:domain "xmpp" ;
    xmpp:username "aibot" ;
    xmpp:passwordKey "aibot" ;
  ] ;

  agent:roomJid "general@conference.xmpp" ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:model "mistral-small-latest" ;
    ai:systemPrompt "You are a helpful AI assistant. Be concise and friendly."
  ] .
```

### Create Bot

```javascript
import { createAgent, InMemoryHistoryStore } from "tia-agents";
import { MistralProvider } from "tia-agents/providers/mistral";

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  nickname: "AIBot",
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});

const runner = await createAgent("aibot", provider);
await runner.start();
```

### Run

```bash
MISTRAL_API_KEY=your-key node aibot.js
```

---

## Environment Variables

Override config file settings with environment variables:

```bash
# Profile directory
export AGENT_PROFILE_DIR=./my-agents

# XMPP connection
export XMPP_SERVICE=xmpp://server.com:5222
export XMPP_DOMAIN=server.com
export XMPP_USERNAME=mybot

# Secrets file
export AGENT_SECRETS_PATH=./my-secrets.json
```

---

## Next Steps

- Read the [Provider Guide](./provider-guide.md) to create custom providers
- Check the [API Reference](./api-reference.md) for complete API documentation
- Explore [templates/](../templates/) for more examples
- Learn about [Lingue protocol](./api-reference.md#lingue) for advanced language negotiation

## Getting Help

- GitHub Issues: [https://github.com/danja/tia/issues](https://github.com/danja/tia/issues)
- Check existing service files in `src/services/` for advanced patterns

## Common Issues

### XMPP Connection Fails

- Verify server URL, domain, username, and password
- For self-signed certificates (local dev): `NODE_TLS_REJECT_UNAUTHORIZED=0 node mybot.js`
- Check firewall settings

### Profile Not Found

- Ensure `.ttl` file is in `config/agents/` directory
- Check filename matches the profile name argument
- Use `profileDir` option if using custom location

### Missing Peer Dependencies

Some providers require additional packages:
- MistralProvider: `npm install @mistralai/mistralai`
- Check provider documentation for requirements
</file>

<file path="docs/archive/TEMPLATE-PLAN.md">
# NPM Packaging Implementation Plan for tia-agents

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
</file>

<file path="examples/minimal-agent.js">
import {
  AgentRunner,
  loadAgentProfile,
  LingueNegotiator,
  LINGUE,
  Handlers
} from "../src/index.js";

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const profile = await loadAgentProfile("demo");
if (!profile) {
  throw new Error("Missing demo profile.");
}

const xmppConfig = profile.toConfig().xmpp;
if (!xmppConfig?.username) {
  throw new Error("Demo profile missing XMPP config.");
}

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({
  xmppConfig,
  roomJid: profile.roomJid,
  nickname: profile.nickname,
  provider: new EchoProvider(),
  negotiator
});

await runner.start();
</file>

<file path="examples/prolog-agent.js">
import { AgentRunner, loadAgentProfile } from "../src/index.js";
import { PrologProvider } from "../src/agents/providers/prolog-provider.js";

const profile = await loadAgentProfile("prolog");
if (!profile) {
  throw new Error("Missing prolog profile.");
}

const runner = new AgentRunner({
  profile,
  provider: new PrologProvider({ nickname: profile.nickname })
});

await runner.start();
</file>

<file path="misc/tia-agents.service">
[Unit]
Description=TIA Agents (Semem, Mistral, Demo)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/danny/hyperdata/tia
# Optional: load shared environment (XMPP creds, API keys, etc.)
EnvironmentFile=/home/danny/hyperdata/tia/.env
Environment=NODE_ENV=production
ExecStart=/home/danny/hyperdata/tia/start-all-agents.sh
Restart=on-failure
RestartSec=5
User=danny

[Install]
WantedBy=multi-user.target
</file>

<file path="mistral-minimal/config/agents/mistral-base.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#mistral-base> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  schema:identifier "mistral-base" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat, lng:IBISText, lng:AgentProfileExchange ;
  lng:prefers lng:HumanChat ;
  lng:understands <https://vocab.methodandstructure.com/ibis#> ;
  lng:profile <#mistral-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:model "mistral-small-latest" ;
    ai:apiKeyEnv "MISTRAL_API_KEY"
  ] .

<#mistral-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + IBIS RDF" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="mistral-minimal/config/agents/mistral2.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .

# Note the URI here : mistral2 is the agent's true name
<#mistral2> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  dcterms:isPartOf <#mistral-base> ;
  foaf:nick "Mistral2" ;
  schema:identifier "mistral2" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:username "mistral2" ;
    xmpp:resource "Mistral2"
  ] ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:systemPrompt "You are Mistral2, a helpful assistant in an XMPP chat room, sent to make sure everything works. Keep responses concise (1-3 sentences) and conversational."
  ] .
</file>

<file path="mistral-minimal/config/agents/secrets.json">
{
  "xmpp": {
    "mistral2": "Pa24R3kH9jDmYQQM"
  }
}
</file>

<file path="mistral-minimal/.env.example">
# Mistral AI Configuration
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral-small-latest

# Optional: Override XMPP configuration
# XMPP_SERVER=tensegrity.it
# XMPP_ROOM=general@conference.tensegrity.it
</file>

<file path="mistral-minimal/mistral-example.js">
#!/usr/bin/env node
</file>

<file path="src/agents/core/index.js">
export { AgentRunner } from "./agent-runner.js";
export { createMentionDetector } from "./mention-detector.js";
export { defaultCommandParser } from "./command-parser.js";
</file>

<file path="src/agents/profile/capability-registry.js">
export class CapabilityRegistry {
  constructor() {
    this.capabilities = new Map();
    this.handlers = new Map();
  }




  register(name, capability) {
    this.capabilities.set(name, capability);
    return this;
  }




  registerHandler(capabilityName, handler) {
    this.handlers.set(capabilityName, handler);
    return this;
  }




  get(name) {
    return this.capabilities.get(name);
  }




  getHandler(name) {
    return this.handlers.get(name);
  }




  list() {
    return Array.from(this.capabilities.keys());
  }
}


export const capabilityRegistry = new CapabilityRegistry();
</file>

<file path="src/agents/profile/capability.js">
export class Capability {
  constructor({
    name,
    label,
    description,
    command = null,
    handler = null,
    metadata = {}
  }) {
    this.name = name;
    this.label = label;
    this.description = description;
    this.command = command;
    this.handler = handler;
    this.metadata = metadata;
  }




  async execute(context) {
    if (!this.handler) {
      throw new Error(`No handler registered for capability: ${this.name}`);
    }
    return this.handler(context);
  }
}
</file>

<file path="src/agents/profile/index.js">
export { AgentProfile } from "./agent-profile.js";
export { XmppConfig } from "./xmpp-config.js";
export {
  ProviderConfig,
  MistralProviderConfig,
  SememProviderConfig
} from "./provider-config.js";
export { Capability } from "./capability.js";
export {
  CapabilityRegistry,
  capabilityRegistry
} from "./capability-registry.js";
export {
  ProfileBuilder,
  createProfileBuilder
} from "./profile-builder.js";
</file>

<file path="src/agents/providers/base-provider.js">
export class BaseProvider {
  async handle() {
    throw new Error("BaseProvider.handle() not implemented");
  }
}

export default BaseProvider;
</file>

<file path="src/agents/providers/chair-provider.js">
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";

export class ChairProvider {
  constructor({ nickname, logger = console }) {
    if (!nickname) throw new Error("ChairProvider requires a nickname");
    this.nickname = nickname;
    this.logger = logger;
    this.currentIssue = null;
    this.positions = [];
    this.arguments = [];
  }

  updateState(structure, content, sender) {
    if (structure.issues.length) {
      this.currentIssue = structure.issues[0].text || content;
      this.positions = [];
      this.arguments = [];
    }
    structure.positions.forEach((p) => {
      this.positions.push({ text: p.text, sender });
    });
    structure.arguments.forEach((a) => {
      this.arguments.push({ text: a.text, sender });
    });
  }

  summarizeState() {
    const issue = this.currentIssue ? `Issue: ${this.currentIssue}` : "No active issue.";
    const positions =
      this.positions.length > 0
        ? `Positions:\n- ${this.positions.map((p) => p.text).join("\n- ")}`
        : "Positions: (none yet)";
    const argumentsText =
      this.arguments.length > 0
        ? `Arguments:\n- ${this.arguments.map((a) => a.text).join("\n- ")}`
        : "Arguments: (none yet)";
    return `${issue}\n${positions}\n${argumentsText}`;
  }

  async handle({ content, rawMessage, metadata }) {
    const text = content || rawMessage || "";
    const structure = detectIBISStructure(text);

    if (structure.confidence >= 0.5 && (structure.issues.length || structure.positions.length || structure.arguments.length)) {
      this.updateState(structure, text, metadata.sender);
      const summary = summarizeIBIS(structure);
      return `Noted. ${summary}`;
    }

    const lower = text.toLowerCase();
    if (lower.includes("start debate") || lower.startsWith("issue:") || lower.startsWith("i:")) {
      this.currentIssue = text.replace(/^(issue|i):\s*/i, "").trim() || text;
      this.positions = [];
      this.arguments = [];
      return `Debate started. Issue: ${this.currentIssue}\nPlease provide Positions and Arguments.`;
    }

    if (lower.includes("status") || lower.includes("consensus") || lower.includes("summary")) {
      return this.summarizeState();
    }


    return `Please contribute Position: ... or Argument: ...${this.currentIssue ? ` (Issue: ${this.currentIssue})` : ""}`;
  }
}

export default ChairProvider;
</file>

<file path="src/agents/providers/data-provider.js">
export class DataProvider {
  constructor({
    endpoint,
    extractionModel,
    extractionApiKey,
    mcpBridge,
    nickname = "Data",
    logger = console
  }) {
    if (!endpoint) {
      throw new Error("SPARQL endpoint is required for DataProvider");
    }
    if (!mcpBridge) {
      throw new Error("MCP bridge is required for DataProvider");
    }

    this.endpoint = endpoint;
    this.extractionModel = extractionModel;
    this.extractionApiKey = extractionApiKey;
    this.mcpBridge = mcpBridge;
    this.nickname = nickname;
    this.logger = logger;
    this.mistralClient = null;
    this.mistralInitialized = false;


    if (extractionApiKey && extractionModel) {
      this.initMistral();
    }
  }

  async initMistral() {
    if (this.mistralInitialized) return;
    this.mistralInitialized = true;

    try {
      const { Mistral } = await import("@mistralai/mistralai");
      this.mistralClient = new Mistral({ apiKey: this.extractionApiKey });
      this.logger.info("[DataProvider] Mistral client initialized for entity extraction");
    } catch (err) {
      this.logger.warn("[DataProvider] @mistralai/mistralai not available - natural language mode disabled");
    }
  }

  async handle({ command, content, metadata, reply }) {
    if (command === "query") {
      return await this.handleEntityQuery(content);
    }

    if (command === "sparql") {
      return await this.handleDirectSparql(content);
    }

    if (command === "chat") {
      return await this.handleNaturalLanguage(content);
    }

    return `${this.nickname} supports: query <entity>, sparql <query>, or natural language questions`;
  }




  async handleEntityQuery(entity) {
    try {
      this.logger.info(`[DataProvider] Entity query: ${entity}`);
      const query = this.buildWikidataQuery(entity);
      const result = await this.mcpBridge.callTool("sparqlQuery", {
        query,
        endpoint: this.endpoint
      });
      const jsonText = result.content[0].text;
      return this.formatResults(jsonText);
    } catch (error) {
      this.logger.error(`[DataProvider] Entity query error for "${entity}":`, error.message);
      return this.formatError(error);
    }
  }




  async handleNaturalLanguage(text) {
    try {

      await this.initMistral();

      if (!this.mistralClient) {
        return "Natural language queries require Mistral API key. Use 'query: <entity>' instead.";
      }

      this.logger.info(`[DataProvider] Natural language: ${text}`);
      const entity = await this.extractEntity(text);
      if (!entity) {
        return "Could not extract an entity from your question. Try 'query: <entity>' instead.";
      }

      this.logger.info(`[DataProvider] Extracted entity: ${entity}`);
      return await this.handleEntityQuery(entity);
    } catch (error) {
      this.logger.error(`[DataProvider] Natural language error:`, error.message);
      return this.formatError(error);
    }
  }




  async handleDirectSparql(sparqlQuery) {
    try {
      this.logger.info(`[DataProvider] Direct SPARQL query`);
      const result = await this.mcpBridge.callTool("sparqlQuery", {
        query: sparqlQuery,
        endpoint: this.endpoint
      });
      const jsonText = result.content[0].text;
      return this.formatResults(jsonText);
    } catch (error) {
      this.logger.error(`[DataProvider] SPARQL query error:`, error.message);
      return this.formatError(error);
    }
  }




  async extractEntity(text) {
    const prompt = `Extract the main entity or topic from this question. Return ONLY the entity name, nothing else. If there are multiple entities, return the most important one.

Question: "${text}"

Entity:`;

    const response = await this.mistralClient.chat.complete({
      model: this.extractionModel,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 50,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content?.trim();
  }




  buildWikidataQuery(entity) {
    const escapedEntity = entity.replace(/"/g, '\\"');
    return `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>

SELECT ?item ?itemLabel ?description ?instanceOfLabel WHERE {
  ?item rdfs:label "${escapedEntity}"@en .
  OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "en") }
  OPTIONAL { ?item wdt:P31 ?instanceOf . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5
    `.trim();
  }




  formatResults(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      const bindings = parsed.results?.bindings || [];

      if (bindings.length === 0) {
        return "No results found.";
      }

      const summaries = bindings.map((binding, idx) => {
        const label = binding.itemLabel?.value || binding.item?.value || "Unknown";
        const desc = binding.description?.value || "";
        const type = binding.instanceOfLabel?.value || "";

        let summary = `${idx + 1}. ${label}`;
        if (desc) summary += `: ${desc}`;
        if (type) summary += ` (${type})`;
        return summary;
      });

      return summaries.join("\n");
    } catch (error) {
      this.logger.error("[DataProvider] Error formatting results:", error.message);
      this.logger.error("[DataProvider] Raw response:", jsonText);
      return `Error formatting results: ${error.message}. Check logs for details.`;
    }
  }




  formatError(error) {
    const message = error.message || String(error);

    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return "Query timeout - the SPARQL endpoint took too long to respond.";
    }
    if (message.includes("ECONNREFUSED") || message.includes("connection")) {
      return "Connection error - could not reach SPARQL endpoint.";
    }
    if (message.includes("parse") || message.includes("syntax")) {
      return "Query error - malformed SPARQL query.";
    }

    return `Error executing query. Please try again or rephrase your request.`;
  }
}

export default DataProvider;
</file>

<file path="src/agents/providers/demo-provider.js">
export class DemoProvider {
  constructor({ nickname = "DemoBot", logger = console } = {}) {
    this.nickname = nickname;
    this.logger = logger;
    this.responses = [
      "Woof! I'm a demo bot. I'd normally use Mistral AI for responses.",
      "That's an interesting question! In a real deployment, I'd use AI to answer.",
      "I'm just a demo right now, but imagine I had the power of Mistral AI!",
      "Bark bark! Demo mode active. Set MISTRAL_API_KEY for real AI responses.",
      "Good question! I'd love to help with that using proper AI responses.",
      "Demo bot here! I can simulate conversations but need Mistral AI for real intelligence."
    ];
  }

  async handle({ command, content, metadata }) {
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "bot: <your message>"`;
    }
    const response = this.responses[Math.floor(Math.random() * this.responses.length)];
    const sender = metadata.sender || "";
    return sender ? `@${sender} ${response}` : response;
  }
}

export default DemoProvider;
</file>

<file path="src/agents/providers/mcp-loopback-provider.js">
import { McpClientBridge } from "../../mcp/client-bridge.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import * as z from "zod/v4";
import { fileURLToPath } from "url";
const LOOPBACK_SERVER_PATH = fileURLToPath(
  new URL("../../mcp/servers/loopback-echo.js", import.meta.url)
);

export class McpLoopbackProvider {
  constructor({
    profile,
    mode = "in-memory",
    serverParams = {
      command: "node",
      args: [LOOPBACK_SERVER_PATH],
      env: process.env,
      cwd: process.cwd()
    },
    logger = console
  } = {}) {
    if (!profile) {
      throw new Error("McpLoopbackProvider requires an AgentProfile");
    }
    this.profile = profile;
    this.mode = mode;
    this.logger = logger;
    this.serverParams = serverParams;
    this.bridge = null;
    this.serverReady = null;
    this.server = null;
    this.connected = false;
  }

  async ensureConnected() {
    if (this.connected) return;
    if (!this.bridge) {
      if (this.mode === "in-memory") {
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        this.server = createLoopbackServer();
        this.serverReady = this.server.connect(serverTransport);
        this.bridge = new McpClientBridge({
          profile: this.profile,
          transport: clientTransport,
          logger: this.logger
        });
      } else {
        this.bridge = new McpClientBridge({
          profile: this.profile,
          serverParams: this.serverParams,
          logger: this.logger
        });
      }
    }
    if (this.serverReady) {
      await this.serverReady;
    }
    await this.bridge.connect();
    this.connected = true;
  }

  async handle({ command, content }) {
    if (command !== "chat") {
      return "MCP loopback only supports chat.";
    }
    await this.ensureConnected();
    const result = await this.bridge.callTool("echo", { message: content });
    const text = result?.content?.find((item) => item.type === "text")?.text;
    return text || "No response from MCP loopback.";
  }

  async close() {
    if (this.bridge) {
      await this.bridge.close();
    }
    if (this.server) {
      await this.server.close();
    }
    this.connected = false;
  }
}

export default McpLoopbackProvider;

function createLoopbackServer() {
  const server = new McpServer({
    name: "tia-loopback-echo",
    version: "0.1.0"
  });

  server.registerTool("echo", {
    description: "Echo a message back to the caller.",
    inputSchema: {
      message: z.string().describe("Message to echo")
    }
  }, async ({ message }) => {
    return {
      content: [{ type: "text", text: `Echo: ${message}` }]
    };
  });

  return server;
}
</file>

<file path="src/agents/providers/semem-provider.js">
import { SememClient } from "../../lib/semem-client.js";

export class SememProvider {
  constructor({ sememConfig, botNickname, chatFeatures = {}, logger = console }) {
    this.client = new SememClient(sememConfig);
    this.botNickname = botNickname;
    this.chatFeatures = chatFeatures;
    this.logger = logger;
  }

  buildMetadata(metadata) {
    return {
      sender: metadata.sender,
      channel: metadata.type,
      room: metadata.type === "groupchat" ? metadata.roomJid : metadata.sender,
      agent: this.botNickname
    };
  }

  async handle({ command, content, metadata, reply }) {
    try {
      if (command === "tell") {
        if (!content) return "Nothing to store. Usage: Semem tell <text>";
        await this.client.tell(content, { metadata: this.buildMetadata(metadata) });
        return "Stored in Semem via /tell.";
      }

      if (command === "ask") {
        if (!content) return "Nothing to ask. Usage: Semem ask <question>";
        const question = `${content}\n\nKeep responses brief.`;
        const result = await this.client.ask(question, { useContext: true });
        return result?.content || result?.answer || "No answer returned.";
      }

      if (command === "augment") {
        if (!content) return "Nothing to augment. Usage: Semem augment <text>";
        const target = `${content}\n\nKeep responses brief.`;
        const result = await this.client.augment(target);
        return result?.success ? "Augment completed and stored." : "Augment did not report success.";
      }


      const chatPrompt = `${content}\n\nKeep responses brief.`;
      const response = await this.client.chatEnhanced(chatPrompt, this.chatFeatures);
      const replyText =
        response?.content || response?.answer || "I could not get a response from Semem just now.";


      this.client
        .tell(`Query: ${content}\nAnswer: ${replyText}`, {
          metadata: this.buildMetadata(metadata)
        })
        .catch((err) => this.logger.error("Semem /tell failed:", err.message));

      return replyText;
    } catch (error) {
      this.logger.error("Semem provider error:", error.message);
      return "Semem is unavailable right now. Please try again shortly.";
    }
  }
}

export default SememProvider;
</file>

<file path="src/agents/profile-roster.js">
import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { turtleToDataset } from "../lib/ibis-rdf.js";

const AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR ||
  path.join(process.cwd(), "config", "agents");

const FOAF_NICK = rdf.namedNode("http://xmlns.com/foaf/0.1/nick");

export async function loadAgentRoster({ profileDir = AGENT_PROFILE_DIR } = {}) {
  const entries = await fs.readdir(profileDir, { withFileTypes: true });
  const roster = new Set();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".ttl")) continue;
    const filePath = path.join(profileDir, entry.name);
    const turtle = await fs.readFile(filePath, "utf8");
    const dataset = await turtleToDataset(turtle);
    const nicks = Array.from(dataset.match(null, FOAF_NICK, null))
      .map((quad) => quad.object?.value)
      .filter(Boolean);
    nicks.forEach((nick) => roster.add(nick));
  }

  return Array.from(roster.values());
}
</file>

<file path="src/client/repl.js">
#!/usr/bin/env node

import { client, xml } from "@xmpp/client";
import readline from 'readline';
import process from 'process';

const XMPP_SERVICE = "xmpp://localhost:5222";
const XMPP_DOMAIN = "xmpp";

function showUsage() {
  console.log('XMPP CLI Client');
  console.log('');
  console.log('Usage: node src/client/repl.js <username> <password>');
  console.log('');
  console.log('Examples:');
  console.log('  NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js danja Claudiopup');
  console.log('  NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js alice wonderland');
  console.log('');
  console.log('Commands in REPL:');
  console.log('  /help         - Show this help');
  console.log('  /status       - Show connection status');
  console.log('  /quit         - Exit the client');
  console.log('  /to <jid>     - Set target JID for messages');
  console.log('  /join <room>  - Join MUC room (e.g. /join general@conference.xmpp)');
  console.log('  /leave        - Leave current MUC room');
  console.log('  <message>     - Send message to current target or room');
}

if (process.argv.length < 4) {
  showUsage();
  process.exit(1);
}

const username = process.argv[2];
const password = process.argv[3];

let currentTarget = null;
let currentRoom = null;
let isOnline = false;

const xmpp = client({
  service: XMPP_SERVICE,
  domain: XMPP_DOMAIN,
  username: username,
  password: password,
  tls: { rejectUnauthorized: false },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${username}@${XMPP_DOMAIN}> `
});

xmpp.on("error", (err) => {
  console.error(`\n❌ XMPP Error: ${err.message}`);
  console.error(`Error details:`, err);
  if (err.condition === 'not-authorized') {
    console.error('Check your username and password');
    process.exit(1);
  }
});

xmpp.on("offline", () => {
  console.log("\n📴 Disconnected from server");
  isOnline = false;
  process.exit(0);
});

xmpp.on("online", async (address) => {
  console.log(`\n✅ Connected as ${address.toString()}`);
  isOnline = true;

  await xmpp.send(xml("presence"));
  console.log("📡 Presence sent - you are now online");

  console.log("\n💬 XMPP CLI Client ready!");
  console.log("Type /help for commands or just start typing to send messages");
  console.log("Set a target with: /to user@xmpp");
  console.log("");

  rl.prompt();
});

xmpp.on("stanza", async (stanza) => {
  if (stanza.is("message")) {
    const from = stanza.attrs.from;
    const type = stanza.attrs.type || "chat";
    const body = stanza.getChildText("body");

    if (body) {
      const timestamp = new Date().toLocaleTimeString();

      if (type === "groupchat") {

        const roomJid = from.split('/')[0];
        const nickname = from.split('/')[1] || 'Unknown';
        console.log(`\n🏠 [${roomJid}] ${nickname}: ${body}`);
      } else {

        console.log(`\n💬 [${timestamp}] ${from}: ${body}`);
      }

      rl.prompt();
    }
  } else if (stanza.is("presence")) {
    const from = stanza.attrs.from;
    const type = stanza.attrs.type;

    if (type === "unavailable") {
      console.log(`\n👋 ${from} went offline`);
    } else if (!type) {
      console.log(`\n👋 ${from} is online`);
    }

    rl.prompt();
  }
});

rl.on('line', async (input) => {
  const line = input.trim();

  if (!line) {
    rl.prompt();
    return;
  }

  if (line.startsWith('/')) {
    const [command, ...args] = line.split(' ');

    switch (command) {
      case '/help':
        showUsage();
        break;

      case '/status':
        console.log(`Connection: ${isOnline ? '✅ Online' : '❌ Offline'}`);
        console.log(`Current target: ${currentTarget || 'None'}`);
        console.log(`Current room: ${currentRoom || 'None'}`);
        break;

      case '/quit':
      case '/exit':
        console.log("👋 Goodbye!");
        await xmpp.send(xml("presence", { type: "unavailable" }));
        await xmpp.stop();
        process.exit(0);
        break;

      case '/to':
        if (args.length === 0) {
          console.log("Usage: /to <jid>");
          console.log("Example: /to alice@xmpp");
        } else {
          currentTarget = args[0];
          currentRoom = null;
          console.log(`🎯 Target set to: ${currentTarget}`);
        }
        break;

      case '/join':
        if (args.length === 0) {
          console.log("Usage: /join <room@conference.domain>");
          console.log("Example: /join general@conference.xmpp");
        } else {
          const roomJid = args[0];
          const nickname = username;

          try {
            await xmpp.send(xml("presence", { to: `${roomJid}/${nickname}` }));
            currentRoom = roomJid;
            currentTarget = null;
            console.log(`🏠 Joining room: ${roomJid} as ${nickname}`);
          } catch (error) {
            console.error(`❌ Failed to join room: ${error.message}`);
          }
        }
        break;

      case '/leave':
        if (!currentRoom) {
          console.log("❌ Not in any room");
        } else {
          try {
            await xmpp.send(xml("presence", {
              to: `${currentRoom}/${username}`,
              type: "unavailable"
            }));
            console.log(`👋 Left room: ${currentRoom}`);
            currentRoom = null;
          } catch (error) {
            console.error(`❌ Failed to leave room: ${error.message}`);
          }
        }
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log("Type /help for available commands");
    }
  } else {

    if (!isOnline) {
      console.log("❌ Not connected to server");
    } else if (currentRoom) {

      try {
        await xmpp.send(xml(
          "message",
          { type: "groupchat", to: currentRoom },
          xml("body", {}, line)
        ));
        console.log(`🏠 → [${currentRoom}]: ${line}`);
      } catch (error) {
        console.error(`❌ Failed to send message to room: ${error.message}`);
      }
    } else if (currentTarget) {

      try {
        await xmpp.send(xml(
          "message",
          { type: "chat", to: currentTarget },
          xml("body", {}, line)
        ));
        console.log(`💬 → ${currentTarget}: ${line}`);
      } catch (error) {
        console.error(`❌ Failed to send message: ${error.message}`);
      }
    } else {
      console.log("❌ No target set. Use /to <jid> or /join <room> first");
    }
  }

  rl.prompt();
});

rl.on('close', async () => {
  console.log("\n👋 Goodbye!");
  if (isOnline) {
    await xmpp.send(xml("presence", { type: "unavailable" }));
    await xmpp.stop();
  }
  process.exit(0);
});

console.log("🔌 Connecting to XMPP server...");
xmpp.start().catch((err) => {
  console.error("❌ Failed to connect:", err.message);
  process.exit(1);
});
</file>

<file path="src/examples/add-users.js">
import { client, xml } from "@xmpp/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const XMPP_DOMAIN = "xmpp";
const XMPP_SERVICE = "xmpp://localhost:5222";

async function createXMPPClient(username, password) {
  return client({
    service: XMPP_SERVICE,
    domain: XMPP_DOMAIN,
    username: username,
    password: password,
    tls: { rejectUnauthorized: false },
  });
}

async function checkUserExists(username) {
  return new Promise((resolve) => {
    const testClient = client({
      service: XMPP_SERVICE,
      domain: XMPP_DOMAIN,
      username: username,
      password: "invalid",
      tls: { rejectUnauthorized: false },
    });

    testClient.on("error", (err) => {
      if (err.condition === 'not-authorized') {
        resolve(true);
      } else {
        resolve(false);
      }
      testClient.stop();
    });

    testClient.on("online", () => {
      resolve(true);
      testClient.stop();
    });

    testClient.start().catch(() => resolve(false));
  });
}

async function createUser(adminClient, username, password) {
  return new Promise((resolve, reject) => {
    const iq = xml(
      "iq",
      { type: "set", to: XMPP_DOMAIN, id: `reg-${Date.now()}` },
      xml(
        "query",
        { xmlns: "jabber:iq:register" },
        xml("username", {}, username),
        xml("password", {}, password)
      )
    );

    const timeout = setTimeout(() => {
      reject(new Error(`Timeout creating user ${username}`));
    }, 10000);

    adminClient.on("stanza", (stanza) => {
      if (stanza.is("iq") && stanza.attrs.id === iq.attrs.id) {
        clearTimeout(timeout);
        if (stanza.attrs.type === "result") {
          resolve(`User ${username} created successfully`);
        } else {
          const error = stanza.getChild("error");
          const errorText = error ? error.getChildText("text") || error.attrs.code : "Unknown error";
          reject(new Error(`Failed to create user ${username}: ${errorText}`));
        }
      }
    });

    adminClient.send(iq).catch(reject);
  });
}

async function addUsersFromJson(jsonFile = "users.json") {
  try {
    const usersPath = path.resolve(__dirname, jsonFile);

    if (!fs.existsSync(usersPath)) {
      console.error(`Users file not found: ${usersPath}`);
      return;
    }

    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

    if (!Array.isArray(usersData)) {
      console.error('Users file must contain an array of user objects');
      return;
    }

    console.log(`Connecting as admin to create users...`);
    const adminClient = await createXMPPClient(ADMIN_USERNAME, ADMIN_PASSWORD);

    await new Promise((resolve, reject) => {
      adminClient.on("error", reject);
      adminClient.on("online", resolve);
      adminClient.start().catch(reject);
    });

    console.log(`Connected as admin@${XMPP_DOMAIN}`);

    for (const user of usersData) {
      if (!user.username || !user.password) {
        console.warn('Skipping user with missing username or password:', user);
        continue;
      }

      console.log(`Checking if user ${user.username} exists...`);
      const exists = await checkUserExists(user.username);

      if (exists) {
        console.log(`User ${user.username} already exists, skipping`);
        continue;
      }

      try {
        console.log(`Creating user ${user.username}...`);
        const result = await createUser(adminClient, user.username, user.password);
        console.log(result);
      } catch (error) {
        console.error(`Error creating user ${user.username}:`, error.message);
      }
    }

    await adminClient.stop();
    console.log('User creation process completed');

  } catch (error) {
    console.error('Error in addUsersFromJson:', error);
    process.exit(1);
  }
}

const jsonFile = process.argv[2] || "users.json";
addUsersFromJson(jsonFile).catch(console.error);
</file>

<file path="src/examples/alice.js">
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "alice",
  password: "wonderland",
  tls: { rejectUnauthorized: false },
});

debug(xmpp, true);

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err);
});

xmpp.on("offline", () => {
  console.log("Client is offline, exiting.");
  process.exit(0);
});

xmpp.on("stanza", async (stanza) => {
  if (stanza.is("message") && stanza.getChildText("body")) {
    console.log("Received message:", stanza.getChildText("body"));

    await xmpp.stop();
  }
});

xmpp.on("online", async (address) => {
  console.log("Connected as", address.toString());

  await xmpp.send(xml("presence"));
});

xmpp.start().catch((err) => {
  console.error("XMPP start error:", err);
  process.exit(1);
});
</file>

<file path="src/examples/auto-register-example.js">
import dotenv from "dotenv";
import { autoConnectXmpp } from "../lib/xmpp-auto-connect.js";
import { XmppRoomAgent } from "../lib/xmpp-room-agent.js";

dotenv.config();
















const XMPP_SERVICE = process.env.XMPP_SERVICE || "xmpp://localhost:5222";
const XMPP_DOMAIN = process.env.XMPP_DOMAIN || "localhost";
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.localhost";
const USERNAME = process.env.XMPP_USERNAME || `auto-agent-${Math.random().toString(16).slice(2, 8)}`;
const NICKNAME = process.env.BOT_NICKNAME || "AutoAgent";

async function main() {
  console.log("=== XMPP Auto-Registration Example ===");
  console.log(`Service: ${XMPP_SERVICE}`);
  console.log(`Domain: ${XMPP_DOMAIN}`);
  console.log(`Username: ${USERNAME}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  // Step 1: Auto-connect (will register if needed)
  console.log("Step 1: Connecting with auto-registration...");

  const { xmpp, credentials } = await autoConnectXmpp({
    service: XMPP_SERVICE,
    domain: XMPP_DOMAIN,
    username: USERNAME,
    // password: undefined, // Omit to trigger auto-registration
    resource: "AutoRegExample",
    tls: { rejectUnauthorized: false },
    autoRegister: true,
    logger: console
  });

  console.log(`✅ Connected as ${credentials.username}@${XMPP_DOMAIN}`);
  if (credentials.registered) {
    console.log("🆕 New account was registered");
    console.log(`🔑 Password: ${credentials.password}`);
    console.log("💾 Credentials saved to config/agents/secrets.json");
  } else {
    console.log("🔄 Used existing credentials");
  }
  console.log("");

  // Stop the basic client
  await xmpp.stop();

  // Step 2: Create agent with registered credentials
  console.log("Step 2: Creating XmppRoomAgent...");

  const agent = new XmppRoomAgent({
    xmppConfig: {
      service: XMPP_SERVICE,
      domain: XMPP_DOMAIN,
      username: credentials.username,
      password: credentials.password,
      tls: { rejectUnauthorized: false }
    },
    roomJid: MUC_ROOM,
    nickname: NICKNAME,
    onMessage: async (payload) => {
      console.log(`📨 [${payload.sender}]: ${payload.body}`);

      // Echo back
      if (payload.body.startsWith("ping")) {
        await payload.reply(`pong from ${NICKNAME}!`);
      }
    },
    allowSelfMessages: true,
    logger: console
  });


  console.log("Step 3: Starting agent...");
  await agent.start();


  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (agent.isInRoom) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });

  console.log(`✅ Joined room ${MUC_ROOM} as ${NICKNAME}`);
  console.log("");

  // Step 4: Send a test message
  console.log("Step 4: Sending test message...");
  const testMessage = `Hello! I'm ${NICKNAME}, an auto-registered agent. Send "ping" to test!`;
  await agent.sendGroupMessage(testMessage);
  console.log(`✅ Sent: ${testMessage}`);
  console.log("");

  console.log("Agent is running. Press Ctrl+C to exit.");
  console.log("Try sending 'ping' in the room to get a response!");

  // Keep running
  process.on("SIGINT", async () => {
    console.log("\n\nShutting down...");
    await agent.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
</file>

<file path="src/examples/call-alice.js">
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";


const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "danja",
  password: "Claudiopup",
  tls: { rejectUnauthorized: false },
});

debug(xmpp, true);

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err);
});

xmpp.on("offline", () => {
  console.log("Client is offline");
});

let sent = false;

xmpp.on("online", async (address) => {
  console.log("Connected as", address.toString());
  if (!sent) {
    sent = true;
    const message = xml(
      "message",
      { type: "chat", to: "alice@xmpp" },
      xml("body", {}, "Hello from dogbot client!")
    );
    try {
      await xmpp.send(message);
      console.log("Message sent!");
    } catch (err) {
      console.error("Failed to send message:", err);
    }

    await xmpp.stop();
  }
});

xmpp.on("offline", () => {
  console.log("Client is offline, exiting.");
  process.exit(0);
});

xmpp.start().catch((err) => {
  console.error("XMPP start error:", err);
  process.exit(1);
});
</file>

<file path="src/examples/create-muc-room.js">
import { client, xml } from "@xmpp/client";

const ROOM = "general@conference.xmpp";
const NICKNAME = "admin";

async function createMUCRoomCorrectly() {
  console.log("=== Creating MUC Room with Correct Protocol ===");
  console.log(`Room: ${ROOM}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  const xmpp = client({
    service: "xmpp:
    domain: "xmpp",
    username: "admin",
    password: "admin123",
    tls: { rejectUnauthorized: false },
  });

  let roomCreated = false;

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);


    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");


    console.log(`🏠 Joining room with MUC protocol: ${ROOM}/${NICKNAME}`);

    const mucPresence = xml(
      "presence",
      { to: `${ROOM}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );

    await xmpp.send(mucPresence);
    console.log("📤 Sent MUC join presence with proper <x> element");
  });

  xmpp.on("stanza", async (stanza) => {
    if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;

      console.log(`📥 Presence from: ${from}, type: ${type || 'available'}`);

      if (from && from.startsWith(ROOM)) {
        if (from === `${ROOM}/${NICKNAME}`) {
          if (type === "error") {
            const error = stanza.getChild("error");
            console.error("❌ Failed to join room:", error);
            process.exit(1);
          } else if (!type || type === "available") {
            console.log("✅ Successfully joined room!");
            roomCreated = true;


            const x = stanza.getChild("x");
            if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
              const status = x.getChild("status");
              if (status) {
                console.log(`🔧 Room status code: ${status.attrs.code}`);
                if (status.attrs.code === "201") {
                  console.log("🎉 Room was created! Configuring as instant room...");


                  await xmpp.send(xml(
                    "iq",
                    { type: "set", to: ROOM, id: "create_instant" },
                    xml(
                      "query",
                      { xmlns: "http://jabber.org/protocol/muc#owner" },
                      xml("x", { xmlns: "jabber:x:data", type: "submit" })
                    )
                  ));
                } else if (status.attrs.code === "110") {
                  console.log("👤 This is our own presence");
                }
              }
            }


            setTimeout(async () => {
              console.log("📝 Sending welcome message...");
              await xmpp.send(xml(
                "message",
                { type: "groupchat", to: ROOM },
                xml("body", {}, "🎉 General chat room is now available! Welcome!")
              ));

              setTimeout(() => {
                console.log("\n✅ MUC room creation completed successfully!");
                console.log("The bot should now be able to join and communicate in this room.");
                xmpp.stop();
                process.exit(0);
              }, 2000);
            }, 1000);
          }
        }
      }
    } else if (stanza.is("iq")) {
      const type = stanza.attrs.type;
      const id = stanza.attrs.id;

      if (id === "create_instant") {
        if (type === "result") {
          console.log("✅ Room configured as instant room!");
        } else if (type === "error") {
          console.log("⚠️  Room configuration error, but room should still work");
        }
      }
    } else if (stanza.is("message")) {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      const type = stanza.attrs.type;

      if (body && type === "groupchat" && from && from.startsWith(ROOM)) {
        const sender = from.split('/')[1] || 'unknown';
        console.log(`💬 [${sender}]: ${body}`);
      }
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);


  setTimeout(() => {
    if (!roomCreated) {
      console.log("❌ Failed to create room within timeout");
      process.exit(1);
    }
  }, 15000);
}

createMUCRoomCorrectly().catch(console.error);
</file>

<file path="src/examples/db01.js">
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

const xmpp = client({
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "testuser",
    password: "testpass",
});

debug(xmpp, true);

xmpp.on("error", (err) => {
    console.error(err);
});

xmpp.on("offline", () => {
    console.log("offline");
});

xmpp.on("stanza", async (stanza) => {
    if (stanza.is("message")) {
        await xmpp.send(xml("presence", { type: "unavailable" }));
        await xmpp.stop();
    }
});

xmpp.on("online", async (address) => {

    await xmpp.send(xml("presence"));


    const message = xml(
        "message",
        { type: "chat", to: address },
        xml("body", {}, "hello world"),
    );
    await xmpp.send(message);
});

xmpp.start().catch(console.error);
</file>

<file path="src/examples/db02.js">
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";


const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "danja",
  password: "Claudiopup",
  tls: { rejectUnauthorized: false },
});

debug(xmpp, true);

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err);
});

xmpp.on("offline", () => {
  console.log("Client is offline");
});

let sent = false;

xmpp.on("online", async (address) => {
  console.log("Connected as", address.toString());
  if (!sent) {
    sent = true;
    const message = xml(
      "message",
      { type: "chat", to: "alice@xmpp" },
      xml("body", {}, "Hello from dogbot client!")
    );
    try {
      await xmpp.send(message);
      console.log("Message sent!");
    } catch (err) {
      console.error("Failed to send message:", err);
    }

    await xmpp.stop();
  }
});

xmpp.on("offline", () => {
  console.log("Client is offline, exiting.");
  process.exit(0);
});

xmpp.start().catch((err) => {
  console.error("XMPP start error:", err);
  process.exit(1);
});
</file>

<file path="src/examples/db03.js">
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "alice",
  password: "wonderland",
  tls: { rejectUnauthorized: false },
});

debug(xmpp, true);

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err);
});

xmpp.on("offline", () => {
  console.log("Client is offline, exiting.");
  process.exit(0);
});

xmpp.on("stanza", async (stanza) => {
  if (stanza.is("message") && stanza.getChildText("body")) {
    console.log("Received message:", stanza.getChildText("body"));

    await xmpp.stop();
  }
});

xmpp.on("online", async (address) => {
  console.log("Connected as", address.toString());

  await xmpp.send(xml("presence"));
});

xmpp.start().catch((err) => {
  console.error("XMPP start error:", err);
  process.exit(1);
});
</file>

<file path="src/examples/discover-xmpp-services.js">
import { client, xml } from "@xmpp/client";

async function discoverServices() {
  console.log("=== XMPP Service Discovery ===");
  console.log("");

  const xmpp = client({
    service: "xmpp:
    domain: "xmpp",
    username: "admin",
    password: "admin123",
    tls: { rejectUnauthorized: false },
  });

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);


    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");

    console.log("\n🔍 Discovering services on server...");


    await xmpp.send(xml(
      "iq",
      { type: "get", to: "xmpp", id: "disco_items" },
      xml("query", { xmlns: "http://jabber.org/protocol/disco#items" })
    ));


    setTimeout(async () => {
      console.log("\n🔍 Checking conference.xmpp specifically...");
      await xmpp.send(xml(
        "iq",
        { type: "get", to: "conference.xmpp", id: "disco_conf_info" },
        xml("query", { xmlns: "http://jabber.org/protocol/disco#info" })
      ));
    }, 2000);


    setTimeout(async () => {
      console.log("\n🔍 Trying to create a test room...");
      await xmpp.send(xml("presence", { to: "testroom@conference.xmpp/testuser" }));
    }, 4000);
  });

  xmpp.on("stanza", (stanza) => {
    if (stanza.is("iq")) {
      const type = stanza.attrs.type;
      const id = stanza.attrs.id;
      const from = stanza.attrs.from;

      if (id === "disco_items") {
        console.log("\n📋 Services discovered on server:");
        if (type === "result") {
          const query = stanza.getChild("query");
          if (query) {
            const items = query.getChildren("item");
            if (items.length > 0) {
              items.forEach(item => {
                console.log(`  ✅ ${item.attrs.jid} - ${item.attrs.name || 'No name'}`);
              });
            } else {
              console.log("  ⚠️  No services found");
            }
          }
        } else {
          console.log("  ❌ Failed to get services list");
        }
      } else if (id === "disco_conf_info") {
        console.log("\n📋 Conference service info:");
        if (type === "result") {
          console.log("  ✅ conference.xmpp is responding!");
          const query = stanza.getChild("query");
          if (query) {
            const features = query.getChildren("feature");
            console.log("  Features:");
            features.forEach(feature => {
              console.log(`    - ${feature.attrs.var}`);
            });
          }
        } else if (type === "error") {
          console.log("  ❌ conference.xmpp returned error:");
          const error = stanza.getChild("error");
          if (error) {
            const condition = error.children[0];
            if (condition) {
              console.log(`    ${condition.name}`);
            }
          }
        }
      }
    } else if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;

      if (from && from.includes("testroom@conference.xmpp")) {
        console.log("\n🏠 Test room response:");
        if (type === "error") {
          const error = stanza.getChild("error");
          if (error) {
            const condition = error.children[0];
            console.log(`  ❌ Error: ${condition ? condition.name : 'unknown'}`);
          }
        } else {
          console.log(`  ✅ Test room joined successfully!`);
        }


        setTimeout(() => {
          console.log("\n=== Discovery Complete ===");
          xmpp.stop();
          process.exit(0);
        }, 1000);
      }
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);


  setTimeout(() => {
    console.log("⏰ Discovery timeout reached");
    process.exit(0);
  }, 15000);
}

discoverServices().catch(console.error);
</file>

<file path="src/examples/hello-world.js">
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

const xmpp = client({
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "danja",
    password: "Claudiopup",
});

debug(xmpp, true);

xmpp.on("error", (err) => {
    console.error(err);
});

xmpp.on("offline", () => {
    console.log("offline");
});

xmpp.on("stanza", async (stanza) => {
    if (stanza.is("message")) {
        await xmpp.send(xml("presence", { type: "unavailable" }));
        await xmpp.stop();
    }
});

xmpp.on("online", async (address) => {

    await xmpp.send(xml("presence"));


    const message = xml(
        "message",
        { type: "chat", to: address },
        xml("body", {}, "hello world"),
    );
    await xmpp.send(message);
});

xmpp.start().catch(console.error);
</file>

<file path="src/examples/lingue-detect-demo.js">
import { detectIBISStructure, summarizeIBIS } from "../lib/ibis-detect.js";
import { structureToDataset, datasetToTurtle } from "../lib/ibis-rdf.js";

const text =
  "Issue: How should we handle authentication? I propose OAuth2 because it is standard. However, the downside is complexity.";

const structure = detectIBISStructure(text);
const summary = summarizeIBIS(structure);
const dataset = structureToDataset(structure);
const turtle = await datasetToTurtle(dataset);

console.log("Detected structure:", JSON.stringify(structure, null, 2));
console.log("\nSummary:\n", summary);
console.log("\nTurtle:\n", turtle);
</file>

<file path="src/examples/lingue-exchange-demo.js">
import { createLingueStore, acceptStructuredOffer, prepareStructuredOffer } from "../lib/lingue-exchange.js";

const storeA = createLingueStore();
const storeB = createLingueStore();

const textFromA =
  "Issue: How should we handle telemetry? I propose MQTT because it fits IoT devices. The downside is broker lock-in.";


const offer = prepareStructuredOffer(textFromA, 0.4);
if (!offer) {
  console.log("No Lingue structure detected with sufficient confidence.");
  process.exit(0);
}

console.log("Agent A summary:\n", offer.summary);


const turtle = await acceptStructuredOffer(storeB, offer);
console.log("\nExchanged Turtle:\n", turtle);


const structure = storeB.toStructure();
const issueId = structure.issues?.[0]?.id || "issue-1";
const positions = storeB.positionsForIssue(issueId);
console.log("\nPositions for issue:", positions);
</file>

<file path="src/examples/list-users.js">
import { client, xml } from "@xmpp/client";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const XMPP_DOMAIN = "xmpp";
const XMPP_SERVICE = "xmpp://localhost:5222";

async function listUsers() {
  try {
    const adminClient = client({
      service: XMPP_SERVICE,
      domain: XMPP_DOMAIN,
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      tls: { rejectUnauthorized: false },
    });

    console.log(`Connecting as admin to list users...`);

    await new Promise((resolve, reject) => {
      adminClient.on("error", reject);
      adminClient.on("online", resolve);
      adminClient.start().catch(reject);
    });

    console.log(`Connected as admin@${XMPP_DOMAIN}`);


    const statsQuery = xml(
      "iq",
      { type: "get", to: XMPP_DOMAIN, id: `stats-${Date.now()}` },
      xml("query", { xmlns: "http://jabber.org/protocol/stats" })
    );

    const statsResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout getting server stats"));
      }, 10000);

      adminClient.on("stanza", (stanza) => {
        if (stanza.is("iq") && stanza.attrs.id === statsQuery.attrs.id) {
          clearTimeout(timeout);
          resolve(stanza);
        }
      });

      adminClient.send(statsQuery).catch(reject);
    });

    console.log("\nServer Statistics:");
    if (statsResult.attrs.type === "result") {
      const query = statsResult.getChild("query");
      if (query) {
        const stats = query.getChildren("stat");
        stats.forEach(stat => {
          const name = stat.attrs.name;
          const value = stat.getChildText("value");
          if (name && value) {
            console.log(`  ${name}: ${value}`);
          }
        });
      } else {
        console.log("  No statistics available");
      }
    } else {
      console.log("  Failed to get statistics");
    }


    const rosterQuery = xml(
      "iq",
      { type: "get", id: `roster-${Date.now()}` },
      xml("query", { xmlns: "jabber:iq:roster" })
    );

    try {
      const rosterResult = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout getting roster"));
        }, 5000);

        adminClient.on("stanza", (stanza) => {
          if (stanza.is("iq") && stanza.attrs.id === rosterQuery.attrs.id) {
            clearTimeout(timeout);
            resolve(stanza);
          }
        });

        adminClient.send(rosterQuery).catch(reject);
      });

      console.log("\nRoster Information:");
      if (rosterResult.attrs.type === "result") {
        const query = rosterResult.getChild("query");
        if (query) {
          const items = query.getChildren("item");
          if (items.length > 0) {
            items.forEach(item => {
              console.log(`  Contact: ${item.attrs.jid} (${item.attrs.name || 'No name'})`);
            });
          } else {
            console.log("  No contacts in roster");
          }
        }
      } else {
        console.log("  Failed to get roster");
      }
    } catch (error) {
      console.log(`  Roster query failed: ${error.message}`);
    }

    await adminClient.stop();

    console.log("\nNote: XMPP servers typically don't expose user lists for privacy reasons.");
    console.log("To check if specific users exist, try connecting with their credentials or");
    console.log("use the server's admin tools directly:");
    console.log("  docker exec tbox-xmpp-1 prosodyctl adduser username@xmpp");

  } catch (error) {
    console.error('Error listing users:', error.message);
    process.exit(1);
  }
}

listUsers().catch(console.error);
</file>

<file path="src/examples/mcp-sparql-client.js">
import { loadAgentProfile } from "../agents/profile-loader.js";
import { McpClientBridge } from "../mcp/client-bridge.js";

const profile = await loadAgentProfile("demo");
if (!profile) {
  throw new Error("Demo profile not found.");
}

const bridge = new McpClientBridge({
  profile,
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: process.env
  }
});

await bridge.connect();
await bridge.populateProfile();

console.log("MCP tools:", profile.mcp.tools.map(tool => tool.name));
console.log("MCP endpoints:", profile.mcp.endpoints);

await bridge.close();
</file>

<file path="src/examples/openai-api-test.js">
import OpenAI from "openai";
const openai = new OpenAI();

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "What is your name?" }],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0]);
}

main();
</file>

<file path="src/examples/semem-direct-test.js">
import dotenv from "dotenv";
import { SememClient } from "../lib/semem-client.js";

dotenv.config();

const sememConfig = {
  baseUrl: process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it",
  authToken: process.env.SEMEM_AUTH_TOKEN,
  timeoutMs: parseInt(process.env.SEMEM_HTTP_TIMEOUT_MS || "8000", 10)
};

const client = new SememClient(sememConfig);

const tellText = process.argv[2] || "Glitch is a canary";
const askText = process.argv[3] || "What is Glitch?";

async function main() {
  console.log("Semem direct test");
  console.log(`Base URL: ${sememConfig.baseUrl}`);
  console.log(`Tell: ${tellText}`);
  console.log(`Ask: ${askText}`);

  try {
    const tellResult = await client.tell(tellText, {
      metadata: { source: "semem-direct-test" }
    });
    console.log("Tell result:", tellResult);
  } catch (err) {
    console.error("Tell failed:", err.message);
  }

  try {
    const askResult = await client.ask(`${askText}\n\nKeep responses brief.`, {
      useContext: true
    });
    console.log("Ask result:", askResult);
  } catch (err) {
    console.error("Ask failed:", err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
</file>

<file path="src/examples/test-bot-interaction.js">
import { client, xml } from "@xmpp/client";

const ROOM = "general@conference.xmpp";
const NICKNAME = "danja";

async function testBotResponse() {
  console.log("=== Testing MistralBot Response ===");
  console.log(`Room: ${ROOM}`);
  console.log(`Nickname: ${NICKNAME}`);
  console.log("");

  const xmpp = client({
    service: "xmpp:
    domain: "xmpp",
    username: "danja",
    password: "Claudiopup",
    tls: { rejectUnauthorized: false },
  });

  let messagesSent = 0;
  let responsesReceived = 0;

  xmpp.on("error", (err) => {
    console.error("❌ XMPP Error:", err);
    process.exit(1);
  });

  xmpp.on("online", async (address) => {
    console.log(`✅ Connected as: ${address.toString()}`);


    await xmpp.send(xml("presence"));
    console.log("📡 Sent initial presence");


    console.log(`🏠 Joining room: ${ROOM}/${NICKNAME}`);

    const mucPresence = xml(
      "presence",
      { to: `${ROOM}/${NICKNAME}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );

    await xmpp.send(mucPresence);
  });

  xmpp.on("stanza", async (stanza) => {
    if (stanza.is("presence")) {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;

      if (from && from.startsWith(ROOM) && from === `${ROOM}/${NICKNAME}` && !type) {
        console.log("✅ Successfully joined room!");


        setTimeout(async () => {
          console.log("\n🧪 Testing bot responses...");


          const testMessage1 = "MistralBot, what is 2 + 2?";
          console.log(`📤 Sending: ${testMessage1}`);
          await xmpp.send(xml(
            "message",
            { type: "groupchat", to: ROOM },
            xml("body", {}, testMessage1)
          ));
          messagesSent++;


          setTimeout(async () => {
            const testMessage2 = "bot: tell me a joke";
            console.log(`📤 Sending: ${testMessage2}`);
            await xmpp.send(xml(
              "message",
              { type: "groupchat", to: ROOM },
              xml("body", {}, testMessage2)
            ));
            messagesSent++;


            setTimeout(async () => {
              const testMessage3 = "Hey @mistralbot can you help me?";
              console.log(`📤 Sending: ${testMessage3}`);
              await xmpp.send(xml(
                "message",
                { type: "groupchat", to: ROOM },
                xml("body", {}, testMessage3)
              ));
              messagesSent++;
            }, 2000);
          }, 2000);
        }, 2000);
      }
    } else if (stanza.is("message")) {
      const from = stanza.attrs.from;
      const body = stanza.getChildText("body");
      const type = stanza.attrs.type;

      if (body && type === "groupchat" && from && from.startsWith(ROOM)) {
        const sender = from.split('/')[1] || 'unknown';

        if (sender === "MistralBot") {
          responsesReceived++;
          console.log(`\n🤖 BOT RESPONSE #${responsesReceived}: ${body}`);
          console.log(`✅ Bot is working and responding to messages!`);

          if (responsesReceived >= 1) {
            setTimeout(() => {
              console.log(`\n=== Test Results ===`);
              console.log(`Messages sent: ${messagesSent}`);
              console.log(`Bot responses received: ${responsesReceived}`);

              if (responsesReceived > 0) {
                console.log("🎉 SUCCESS: MistralBot is working correctly!");
                console.log("✅ Bot receives messages");
                console.log("✅ Bot generates responses");
                console.log("✅ Bot sends responses back to room");
                console.log("✅ Mistral AI integration is working");
              }

              xmpp.stop();
              process.exit(0);
            }, 3000);
          }
        } else if (sender !== NICKNAME) {
          console.log(`💬 [${sender}]: ${body}`);
        }
      }
    }
  });

  console.log("🔌 Connecting...");
  xmpp.start().catch(console.error);


  setTimeout(() => {
    console.log(`\n⏰ Test timeout reached`);
    console.log(`Messages sent: ${messagesSent}`);
    console.log(`Bot responses received: ${responsesReceived}`);

    if (responsesReceived === 0) {
      console.log("❌ Bot didn't respond to any messages");
      console.log("This could indicate:");
      console.log("- Bot logic issues");
      console.log("- Mistral API problems");
      console.log("- Message filtering problems");
    }

    process.exit(0);
  }, 20000);
}

testBotResponse().catch(console.error);
</file>

<file path="src/examples/test-data-agent.js">
import dotenv from "dotenv";
import { client, xml } from "@xmpp/client";
import logger from "../lib/logger-lite.js";

dotenv.config();

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.TEST_USERNAME || "testuser",
  password: process.env.TEST_PASSWORD || "testpass",
  resource: "DataAgentTest"
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = "Data";

const xmppClient = client({
  service: XMPP_CONFIG.service,
  domain: XMPP_CONFIG.domain,
  username: XMPP_CONFIG.username,
  password: XMPP_CONFIG.password,
  resource: XMPP_CONFIG.resource
});

const testMessages = [
  {
    text: `${BOT_NICKNAME}, query: Albert Einstein`,
    desc: "Command mode - entity query"
  },
  {
    text: `${BOT_NICKNAME}, who was Marie Curie?`,
    desc: "Natural language mode - LLM extraction"
  },
  {
    text: `${BOT_NICKNAME}, sparql: SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5`,
    desc: "Direct SPARQL mode"
  }
];

let messageIndex = 0;
const responses = [];
let responseTimer = null;

async function sendNextTest() {
  if (messageIndex >= testMessages.length) {
    console.log("\n=== Test Results ===");
    responses.forEach((r, i) => {
      console.log(`\nTest ${i + 1}: ${testMessages[i].desc}`);
      console.log(`Sent: ${testMessages[i].text}`);
      console.log(`Response: ${r}`);
    });
    console.log("\n=== Tests Complete ===");
    await xmppClient.stop();
    process.exit(0);
  }

  const testMsg = testMessages[messageIndex];
  console.log(`\n[${messageIndex + 1}/${testMessages.length}] ${testMsg.desc}`);
  console.log(`Sending: ${testMsg.text}`);

  const msgXml = xml(
    "message",
    { type: "groupchat", to: MUC_ROOM },
    xml("body", {}, testMsg.text)
  );

  await xmppClient.send(msgXml);
  messageIndex++;

  responseTimer = setTimeout(() => {
    console.log("Timeout waiting for response");
    responses.push("(no response)");
    sendNextTest();
  }, 10000);
}

xmppClient.on("online", async () => {
  console.log("Connected to XMPP");

  const presence = xml(
    "presence",
    { to: `${MUC_ROOM}/${XMPP_CONFIG.resource}` },
    xml("x", { xmlns: "http://jabber.org/protocol/muc" })
  );

  await xmppClient.send(presence);

  setTimeout(() => sendNextTest(), 2000);
});

xmppClient.on("stanza", async (stanza) => {
  if (stanza.is("message") && stanza.attrs.type === "groupchat") {
    const from = stanza.attrs.from;
    const body = stanza.getChildText("body");

    if (from?.includes(BOT_NICKNAME) && body) {
      console.log(`Received: ${body.substring(0, 200)}${body.length > 200 ? "..." : ""}`);
      responses.push(body);

      if (responseTimer) {
        clearTimeout(responseTimer);
        responseTimer = null;
      }

      setTimeout(() => sendNextTest(), 2000);
    }
  }
});

xmppClient.on("error", (err) => {
  console.error("XMPP error:", err.message);
});

console.log("Starting Data Agent test...");
console.log(`Will test ${testMessages.length} query modes`);
console.log(`XMPP Server: ${XMPP_CONFIG.service}`);
console.log(`MUC Room: ${MUC_ROOM}`);
console.log(`Bot Nickname: ${BOT_NICKNAME}`);
console.log("");

xmppClient.start().catch(console.error);
</file>

<file path="src/examples/test-muc.js">
import { client, xml } from "@xmpp/client";

const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "alice",
  password: "wonderland",
  tls: { rejectUnauthorized: false }
});

const MUC_ROOM = "general@conference.xmpp";
const NICKNAME = "Alice";

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err);
});

xmpp.on("online", async (address) => {
  console.log(`Connected as ${address.toString()}`);


  const presence = xml(
    "presence",
    { to: `${MUC_ROOM}/${NICKNAME}` },
    xml("x", { xmlns: "http://jabber.org/protocol/muc" })
  );

  await xmpp.send(presence);
  console.log(`Joining MUC room: ${MUC_ROOM}`);


  setTimeout(async () => {
    const message = xml(
      "message",
      { type: "groupchat", to: MUC_ROOM },
      xml("body", {}, "Hello MistralBot, can you help me?")
    );

    await xmpp.send(message);
    console.log("Sent test message to room");


    setTimeout(async () => {
      await xmpp.stop();
    }, 5000);
  }, 2000);
});

xmpp.on("stanza", (stanza) => {
  if (stanza.is("message") && stanza.attrs.type === "groupchat") {
    const from = stanza.attrs.from;
    const body = stanza.getChildText("body");

    if (body && from) {
      const sender = from.split('/')[1] || 'unknown';
      console.log(`[${sender}]: ${body}`);
    }
  }
});

xmpp.on("offline", () => {
  console.log("Disconnected from XMPP");
  process.exit(0);
});

xmpp.start().catch(console.error);
</file>

<file path="src/examples/test-registration.js">
import { registerXmppAccount, generatePassword } from "../lib/xmpp-register.js";











const SERVICE = "xmpp://tensegrity.it:5222";
const DOMAIN = "tensegrity.it";
const USERNAME = `testbot-${Math.random().toString(16).slice(2, 8)}`;
const PASSWORD = generatePassword(16);

console.log("=== XMPP Client-Side Registration Test ===");
console.log(`Service: ${SERVICE}`);
console.log(`Domain: ${DOMAIN}`);
console.log(`Username: ${USERNAME}`);
console.log(`Password: ${PASSWORD}`);
console.log("");

console.log("Attempting registration from client side...");
console.log("(This does NOT require SSH access to the server)");
console.log("");

registerXmppAccount({
  service: SERVICE,
  domain: DOMAIN,
  username: USERNAME,
  password: PASSWORD,
  tls: { rejectUnauthorized: false },
  logger: console
})
  .then((result) => {
    console.log("");
    console.log("✅ SUCCESS!");
    console.log(result.message);
    console.log("");
    console.log("Credentials:");
    console.log(`  Username: ${USERNAME}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log(`  JID: ${USERNAME}@${DOMAIN}`);
    console.log("");
    console.log("You can now use these credentials to connect!");
    process.exit(0);
  })
  .catch((error) => {
    console.log("");
    console.log("❌ FAILED");
    console.log(`Error: ${error.message}`);
    console.log("");
    console.log("Common issues:");
    console.log("  - Server doesn't have 'register' module enabled");
    console.log("  - allow_registration = false in prosody.cfg.lua");
    console.log("  - invites_register module is blocking open registration");
    process.exit(1);
  });
</file>

<file path="src/examples/test-semem-agent.js">
import dotenv from "dotenv";
import { SememClient } from "../lib/semem-client.js";
import { loadAgentProfile } from "../services/agent-registry.js";

dotenv.config();

const profile = loadAgentProfile(process.env.AGENT_PROFILE || "default");
const sememClient = new SememClient({
  baseUrl: profile.sememConfig.baseUrl,
  authToken: profile.sememConfig.authToken
});

const question = process.argv.slice(2).join(" ") || "What is Semem?";

async function main() {
  console.log(`Checking Semem at ${profile.sememConfig.baseUrl} using profile "${profile.profileName}"`);

  try {
    const inspect = await sememClient.inspect();
    console.log("Inspect OK:", JSON.stringify(inspect, null, 2));
  } catch (error) {
    console.error("Inspect failed:", error.message);
  }

  try {
    const response = await sememClient.chatEnhanced(question, profile.features);
    const content = response?.content || response?.answer || JSON.stringify(response);
    console.log("Chat/enhanced response:");
    console.log(content);
  } catch (error) {
    console.error("Chat/enhanced failed:", error.message);
    process.exitCode = 1;
  }
}

main();
</file>

<file path="src/lib/history/index.js">
import rdf from "rdf-ext";

const HISTORY_NS = "http://purl.org/stuff/tia/history#";
const DCTERMS_NS = "http://purl.org/dc/terms/";

const TERMS = {
  Turn: rdf.namedNode(`${HISTORY_NS}Turn`),
  role: rdf.namedNode(`${HISTORY_NS}role`),
  content: rdf.namedNode(`${HISTORY_NS}content`),
  seq: rdf.namedNode(`${HISTORY_NS}seq`),
  created: rdf.namedNode(`${DCTERMS_NS}created`),
  rdfType: rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
};




export class HistoryStore {
  addTurn() {
    throw new Error("HistoryStore.addTurn not implemented");
  }

  getMessages() {
    throw new Error("HistoryStore.getMessages not implemented");
  }

  clear() {
    throw new Error("HistoryStore.clear not implemented");
  }
}




export class InMemoryHistoryStore extends HistoryStore {
  constructor({ dataset = rdf.dataset(), maxEntries = 50 } = {}) {
    super();
    this.dataset = dataset;
    this.maxEntries = maxEntries;
    this._seq = 0;
  }

  addTurn({ role, content, created = new Date().toISOString() }) {
    if (!role || !content) {
      throw new Error("History turn requires role and content.");
    }

    const node = rdf.blankNode();
    const seq = this._seq++;

    this.dataset.add(rdf.quad(node, TERMS.rdfType, TERMS.Turn));
    this.dataset.add(rdf.quad(node, TERMS.role, rdf.literal(role)));
    this.dataset.add(rdf.quad(node, TERMS.content, rdf.literal(content)));
    this.dataset.add(rdf.quad(node, TERMS.seq, rdf.literal(String(seq))));
    this.dataset.add(rdf.quad(node, TERMS.created, rdf.literal(created)));

    this.prune();
    return node;
  }

  getMessages({ limit = this.maxEntries } = {}) {
    const turns = this.getTurns();
    return turns
      .slice(-limit)
      .map((turn) => ({
        role: turn.role,
        content: turn.content
      }));
  }

  clear() {
    this.dataset = rdf.dataset();
    this._seq = 0;
  }

  getTurns() {
    const turns = [];
    const quads = Array.from(this.dataset.match(null, TERMS.seq, null));
    for (const quad of quads) {
      const subject = quad.subject;
      const seq = parseInt(quad.object.value, 10);
      const role = this.getLiteral(subject, TERMS.role);
      const content = this.getLiteral(subject, TERMS.content);
      const created = this.getLiteral(subject, TERMS.created);
      turns.push({ subject, seq, role, content, created });
    }
    return turns.sort((a, b) => a.seq - b.seq);
  }

  getLiteral(subject, predicate) {
    const quad = Array.from(this.dataset.match(subject, predicate, null))[0];
    return quad?.object?.value || null;
  }

  prune() {
    const turns = this.getTurns();
    if (turns.length <= this.maxEntries) return;

    const toRemove = turns.slice(0, turns.length - this.maxEntries);
    for (const turn of toRemove) {
      this.dataset.deleteMatches(turn.subject, null, null);
    }
  }
}

export const HISTORY_TERMS = TERMS;
</file>

<file path="src/lib/lingue/handlers/human-chat.js">
import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class HumanChatHandler extends LanguageModeHandler {
  constructor({ logger } = {}) {
    super({
      mode: LANGUAGE_MODES.HUMAN_CHAT,
      mimeType: MIME_TYPES.HUMAN_CHAT,
      logger
    });
  }

  createStanza(to, payload, summary, options = {}) {
    const body = summary || payload || "";
    return xml(
      "message",
      { to, type: options.type || "chat" },
      xml("body", {}, body),
      xml("payload", { xmlns: LINGUE_NS, mime: this.mimeType, mode: this.mode }, "")
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    return {
      summary: body,
      payload: null,
      mimeType: this.mimeType,
      mode: this.mode
    };
  }
}
</file>

<file path="src/lib/lingue/handlers/ibis-text.js">
import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class IBISTextHandler extends LanguageModeHandler {
  constructor({ logger } = {}) {
    super({
      mode: LANGUAGE_MODES.IBIS_TEXT,
      mimeType: MIME_TYPES.IBIS_TEXT,
      logger
    });
  }

  createStanza(to, payload, summary, options = {}) {
    const body = summary || "";
    const payloadText = payload || "";
    return xml(
      "message",
      { to, type: options.type || "chat" },
      xml("body", {}, body),
      xml("payload", { xmlns: LINGUE_NS, mime: "text/turtle", mode: this.mode }, payloadText)
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "";
    const mimeType = payloadNode?.attrs?.mime || "text/turtle";

    return {
      summary: body,
      payload: payloadText,
      mimeType,
      mode: this.mode
    };
  }
}
</file>

<file path="src/lib/lingue/handlers/profile-exchange.js">
import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class ProfileExchangeHandler extends LanguageModeHandler {
  constructor({ logger } = {}) {
    super({
      mode: LANGUAGE_MODES.PROFILE_EXCHANGE,
      mimeType: MIME_TYPES.PROFILE_EXCHANGE,
      logger
    });
  }

  createStanza(to, payload, summary, options = {}) {
    const body = summary || "";
    const payloadText = payload || "";
    return xml(
      "message",
      { to, type: options.type || "chat" },
      xml("body", {}, body),
      xml("payload", { xmlns: LINGUE_NS, mime: this.mimeType, mode: this.mode }, payloadText)
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "";
    const mimeType = payloadNode?.attrs?.mime || this.mimeType;

    return {
      summary: body,
      payload: payloadText,
      mimeType,
      mode: this.mode
    };
  }
}
</file>

<file path="src/lib/lingue/handlers/prolog.js">
import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class PrologProgramHandler extends LanguageModeHandler {
  constructor({ logger, onPayload } = {}) {
    super({
      mode: LANGUAGE_MODES.PROLOG_PROGRAM,
      mimeType: MIME_TYPES.PROLOG_PROGRAM,
      logger
    });
    this.onPayload = onPayload || null;
  }

  createStanza(to, payload, summary, options = {}) {
    const body = summary || "";
    const payloadText = payload || "";
    return xml(
      "message",
      { to, type: options.type || "chat" },
      xml("body", {}, body),
      xml("payload", { xmlns: LINGUE_NS, mime: this.mimeType, mode: this.mode }, payloadText)
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "";
    const mimeType = payloadNode?.attrs?.mime || this.mimeType;

    return {
      summary: body,
      payload: payloadText,
      mimeType,
      mode: this.mode
    };
  }

  async handlePayload({ payload, summary, from, stanza, reply, metadata }) {
    if (!this.onPayload) return null;
    return this.onPayload({ payload, summary, from, stanza, reply, metadata });
  }
}
</file>

<file path="src/lib/lingue/handlers/sparql-query-handler.js">
export class SparqlQueryHandler {
  constructor({ logger = console, onPayload = null } = {}) {
    this.logger = logger;
    this.onPayload = onPayload;
  }

  async handle({ payload, metadata, reply }) {
    this.logger.info("[SparqlQueryHandler] Received SPARQL query");

    if (!this.onPayload) {
      this.logger.warn("[SparqlQueryHandler] No onPayload callback configured");
      return "SPARQL query handler not configured";
    }

    try {
      const result = await this.onPayload({ payload, metadata });
      return result;
    } catch (error) {
      this.logger.error("[SparqlQueryHandler] Error:", error.message);
      return "Error executing SPARQL query";
    }
  }
}

export default SparqlQueryHandler;
</file>

<file path="src/lib/lingue/discovery.js">
import { xml } from "@xmpp/client";
import { DISCO_INFO_NS } from "./constants.js";

export function createDiscoInfoRequest({ to, id }) {
  return xml(
    "iq",
    { type: "get", to, id },
    xml("query", { xmlns: DISCO_INFO_NS })
  );
}

export function createDiscoInfoResponse({ to, id, features = [], identities = [] }) {
  const featureNodes = features.map((feature) => xml("feature", { var: feature }));
  const identityNodes = identities.map((identity) => xml("identity", {
    category: identity.category,
    type: identity.type,
    name: identity.name
  }));

  return xml(
    "iq",
    { type: "result", to, id },
    xml(
      "query",
      { xmlns: DISCO_INFO_NS },
      ...identityNodes,
      ...featureNodes
    )
  );
}

export function parseDiscoInfo(stanza) {
  const query = stanza.getChild("query", DISCO_INFO_NS);
  if (!query) return null;

  const features = new Set(
    query.getChildren("feature").map((feature) => feature.attrs.var).filter(Boolean)
  );

  const identities = query.getChildren("identity").map((identity) => ({
    category: identity.attrs.category,
    type: identity.attrs.type,
    name: identity.attrs.name
  }));

  return { features, identities };
}

export function attachDiscoInfoResponder(xmppClient, { features = [], identities = [] } = {}) {
  xmppClient.on("iq", async (stanza) => {
    const isDiscoInfo =
      stanza.is("iq") &&
      stanza.attrs.type === "get" &&
      stanza.getChild("query", DISCO_INFO_NS);

    if (!isDiscoInfo) return;

    const reply = createDiscoInfoResponse({
      to: stanza.attrs.from,
      id: stanza.attrs.id,
      features,
      identities
    });

    await xmppClient.send(reply);
  });
}
</file>

<file path="src/lib/lingue/exchange-router.js">
export function routeExchange({ mode, handlers, stanza, payload, summary }) {
  const handler = handlers?.[mode];
  if (!handler) return false;

  if (stanza && typeof handler.parseStanza === "function") {
    return handler.parseStanza(stanza);
  }

  if (typeof handler.handlePayload === "function") {
    return handler.handlePayload({ payload, summary, stanza });
  }

  return false;
}
</file>

<file path="src/lib/lingue/index.js">
export * from "./constants.js";
export * from "./discovery.js";
export * from "./offer-accept.js";
export * from "./exchange-router.js";
export * from "./payload-handlers.js";
export * as Handlers from "./handlers/index.js";
export { LingueNegotiator } from "./negotiator.js";
</file>

<file path="src/lib/lingue/negotiator.js">
import { xml } from "@xmpp/client";
import { LINGUE_NS, modeFromMime } from "./constants.js";
import { NegotiationState } from "./offer-accept.js";

const OFFER_ELEMENT = "offer";
const ACCEPT_ELEMENT = "accept";

export class LingueNegotiator {
  constructor({
    profile,
    xmppClient = null,
    handlers = {},
    logger = console,
    state = new NegotiationState()
  } = {}) {
    this.profile = profile;
    this.xmppClient = xmppClient;
    this.handlers = handlers;
    this.logger = logger;
    this.state = state;
  }

  setXmppClient(xmppClient) {
    this.xmppClient = xmppClient;
  }

  getActiveMode(peerJid) {
    return this.state.getActiveMode(peerJid);
  }

  async offerExchange(peerJid, modes = []) {
    this.state.offer(peerJid, modes);

    if (!this.xmppClient) return;
    const stanza = createOfferStanza(peerJid, modes);
    await this.xmppClient.send(stanza);
  }

  async acceptMode(peerJid, mode) {
    this.state.setActiveMode(peerJid, mode);

    if (!this.xmppClient) return;
    const stanza = createAcceptStanza(peerJid, mode);
    await this.xmppClient.send(stanza);
  }

  async send(peerJid, { mode, payload, summary } = {}) {
    const handler = this.handlers?.[mode];
    if (!handler) {
      throw new Error(`No handler registered for Lingue mode: ${mode}`);
    }

    const stanza = handler.createStanza(peerJid, payload, summary);
    if (!this.xmppClient) return;

    await this.xmppClient.send(stanza);
  }

  async handleStanza(stanza, context = {}) {
    if (!stanza?.is?.("message")) return false;

    const offer = stanza.getChild(OFFER_ELEMENT, LINGUE_NS);
    if (offer) {
      const modes = offer.getChildren("mode").map((mode) => mode.getText());
      const accepted = this.selectSupportedMode(modes);

      if (accepted) {
        this.state.setActiveMode(stanza.attrs.from, accepted);
        if (this.xmppClient) {
          const reply = createAcceptStanza(stanza.attrs.from, accepted);
          await this.xmppClient.send(reply);
        }
      }
      return true;
    }

    const accept = stanza.getChild(ACCEPT_ELEMENT, LINGUE_NS);
    if (accept) {
      const modeNode = accept.getChild("mode");
      const mode = accept.attrs.mode || modeNode?.getText();
      if (mode) {
        this.state.setActiveMode(stanza.attrs.from, mode);
      }
      return true;
    }

    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    if (payloadNode) {
      const mode = payloadNode.attrs.mode || modeFromMime(payloadNode.attrs.mime);
      const handler = mode ? this.handlers?.[mode] : null;
      if (handler) {
        const parsed = handler.parseStanza(stanza);
        if (handler.handlePayload) {
          const response = await handler.handlePayload({
            ...parsed,
            from: stanza.attrs.from,
            stanza,
            ...context
          });
          if (response && context.reply) {
            await context.reply(response);
          }
        }
        return true;
      }
    }

    return false;
  }

  selectSupportedMode(modes = []) {
    const supported = this.profile?.lingue?.supports || new Set();
    for (const mode of modes) {
      if (supported.has(mode) || this.handlers?.[mode]) {
        return mode;
      }
    }
    return null;
  }
}

export function createOfferStanza(to, modes = []) {
  return xml(
    "message",
    { to, type: "chat" },
    xml(
      OFFER_ELEMENT,
      { xmlns: LINGUE_NS },
      ...modes.map((mode) => xml("mode", {}, mode))
    )
  );
}

export function createAcceptStanza(to, mode) {
  return xml(
    "message",
    { to, type: "chat" },
    xml(ACCEPT_ELEMENT, { xmlns: LINGUE_NS, mode })
  );
}
</file>

<file path="src/lib/lingue/offer-accept.js">
export class NegotiationState {
  constructor({ offerTtlMs = 30000, activeTtlMs = 600000, clock = Date } = {}) {
    this.offerTtlMs = offerTtlMs;
    this.activeTtlMs = activeTtlMs;
    this.clock = clock;
    this.offers = new Map();
    this.activeModes = new Map();
  }

  offer(peerJid, modes) {
    const now = this.clock.now();
    this.offers.set(peerJid, {
      modes: Array.from(modes || []),
      expiresAt: now + this.offerTtlMs
    });
  }

  hasOffer(peerJid) {
    const offer = this.offers.get(peerJid);
    if (!offer) return false;
    if (offer.expiresAt <= this.clock.now()) {
      this.offers.delete(peerJid);
      return false;
    }
    return true;
  }

  accept(peerJid, mode) {
    const offer = this.offers.get(peerJid);
    if (!offer || offer.expiresAt <= this.clock.now()) {
      this.offers.delete(peerJid);
      return false;
    }

    if (!offer.modes.includes(mode)) return false;

    this.offers.delete(peerJid);
    this.setActiveMode(peerJid, mode);
    return true;
  }

  reject(peerJid) {
    this.offers.delete(peerJid);
  }

  setActiveMode(peerJid, mode) {
    const now = this.clock.now();
    this.activeModes.set(peerJid, {
      mode,
      expiresAt: now + this.activeTtlMs
    });
  }

  getActiveMode(peerJid) {
    const active = this.activeModes.get(peerJid);
    if (!active) return null;
    if (active.expiresAt <= this.clock.now()) {
      this.activeModes.delete(peerJid);
      return null;
    }
    return active.mode;
  }

  clear(peerJid) {
    this.offers.delete(peerJid);
    this.activeModes.delete(peerJid);
  }

  cleanup() {
    const now = this.clock.now();
    for (const [peerJid, offer] of this.offers.entries()) {
      if (offer.expiresAt <= now) this.offers.delete(peerJid);
    }
    for (const [peerJid, active] of this.activeModes.entries()) {
      if (active.expiresAt <= now) this.activeModes.delete(peerJid);
    }
  }
}
</file>

<file path="src/lib/lingue/payload-handlers.js">
export class LanguageModeHandler {
  constructor({ mode, mimeType, logger = console } = {}) {
    this.mode = mode;
    this.mimeType = mimeType;
    this.logger = logger;
  }

  createStanza() {
    throw new Error("createStanza() not implemented");
  }

  parseStanza() {
    throw new Error("parseStanza() not implemented");
  }

  validate() {
    return true;
  }
}
</file>

<file path="src/lib/ibis-detect.js">
const ISSUE_PREFIXES = ["issue", "how", "what", "why", "should", "where"];
const ISSUE_MARKERS = [/^issue\s*:/, /^i\s*:/];
const POSITION_PREFIXES = ["i propose", "we should", "let's", "consider", "option", "i think"];
const POSITION_MARKERS = [/^position\s*:/, /^p\s*:/];
const SUPPORT_PREFIXES = ["because", "since", "due to", "the benefit", "supports", "advantage", "pro"];
const SUPPORT_MARKERS = [/^support\s*:/, /^s\s*:/];
const OBJECTION_PREFIXES = ["however", "but", "concern", "downside", "risk", "against", "cons"];
const OBJECTION_MARKERS = [/^objection\s*:/, /^oppose\s*:/, /^o\s*:/];
const ARGUMENT_MARKERS = [/^argument\s*:/, /^arg\s*:/, /^a\s*:/];

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export function detectIBISStructure(text) {
  const normalized = text.toLowerCase();
  const tokens = normalized.split(/\s+/);

  const issues = detectIssues(normalized, tokens);
  const positions = detectPositions(normalized);
  const { supporting, objecting, neutral } = detectArguments(normalized);

  const argumentCount = supporting.length + objecting.length + neutral.length;
  const signal = issues.length + positions.length + argumentCount * 0.5;
  const confidence = clamp(signal / 4, 0, 1);

  return {
    issues,
    positions,
    arguments: [
      ...supporting.map((label, idx) => ({
        id: `arg-support-${idx + 1}`,
        label,
        stance: "support",
      })),
      ...objecting.map((label, idx) => ({
        id: `arg-object-${idx + 1}`,
        label,
        stance: "object",
      })),
      ...neutral.map((label, idx) => ({
        id: `arg-neutral-${idx + 1}`,
        label,
        stance: "neutral",
      })),
    ],
    confidence,
    source: text,
  };
}

function detectIssues(normalized, tokens) {
  const issues = [];
  const labeledIssue = ISSUE_MARKERS.find((marker) => marker.test(normalized));
  if (labeledIssue) {
    issues.push({
      id: "issue-1",
      label: normalized.replace(labeledIssue, "").trim() || "Unlabeled issue",
    });
    return issues;
  }
  if (normalized.includes("?")) {
    issues.push({
      id: "issue-1",
      label: normalized.replace(/\?+/g, "").trim() || "Unlabeled issue",
    });
  } else {
    const startsWithIssueLanguage = ISSUE_PREFIXES.some((prefix) =>
      normalized.startsWith(prefix)
    );
    if (startsWithIssueLanguage) {
      issues.push({
        id: "issue-1",
        label: normalized,
      });
    }
  }


  const questionWords = tokens.filter((word) =>
    ["what", "why", "how", "should"].includes(word)
  );
  if (questionWords.length > 1 && issues.length === 0) {
    issues.push({
      id: "issue-1",
      label: normalized,
    });
  }

  return issues;
}

function detectPositions(normalized) {
  const sentences = splitSentences(normalized);
  const positions = [];
  sentences.forEach((sentence, idx) => {
    const labeledPosition = POSITION_MARKERS.find((marker) => marker.test(sentence));
    if (labeledPosition) {
      positions.push({
        id: `pos-${idx + 1}`,
        label: sentence.replace(labeledPosition, "").trim() || "Unlabeled position",
      });
      return;
    }
    const hasPrefix = POSITION_PREFIXES.some((prefix) => sentence.startsWith(prefix));
    if (hasPrefix) {
      positions.push({
        id: `pos-${idx + 1}`,
        label: sentence,
      });
    }
  });
  return positions;
}

function detectArguments(normalized) {
  const sentences = splitSentences(normalized);
  const supporting = [];
  const objecting = [];
  const neutral = [];

  sentences.forEach((sentence) => {
    const labeledSupport = SUPPORT_MARKERS.find((marker) => marker.test(sentence));
    if (labeledSupport) {
      supporting.push(sentence.replace(labeledSupport, "").trim() || "Unlabeled support");
      return;
    }
    const labeledObjection = OBJECTION_MARKERS.find((marker) => marker.test(sentence));
    if (labeledObjection) {
      objecting.push(sentence.replace(labeledObjection, "").trim() || "Unlabeled objection");
      return;
    }
    const labeledArgument = ARGUMENT_MARKERS.find((marker) => marker.test(sentence));
    if (labeledArgument) {
      const label = sentence.replace(labeledArgument, "").trim() || "Unlabeled argument";
      const stance = inferArgumentStance(label);
      if (stance === "object") {
        objecting.push(label);
      } else if (stance === "support") {
        supporting.push(label);
      } else {
        neutral.push(label);
      }
      return;
    }
    if (SUPPORT_PREFIXES.some((prefix) => sentence.includes(prefix))) {
      supporting.push(sentence);
      return;
    }
    if (OBJECTION_PREFIXES.some((prefix) => sentence.includes(prefix))) {
      objecting.push(sentence);
    }
  });

  return { supporting, objecting, neutral };
}

function splitSentences(text) {
  return text
    .split(/[.!?]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferArgumentStance(text) {
  const normalized = text.toLowerCase();
  const hasSupport = SUPPORT_PREFIXES.some((prefix) => normalized.includes(prefix));
  const hasObjection = OBJECTION_PREFIXES.some((prefix) => normalized.includes(prefix));
  if (hasSupport && !hasObjection) return "support";
  if (hasObjection && !hasSupport) return "object";
  return "neutral";
}

export function summarizeIBIS(structure) {
  const issueText =
    structure.issues?.[0]?.label || structure.source || "Unspecified issue";
  const positions =
    structure.positions?.map((p) => `- Position: ${p.label}`).join("\n") ||
    "- No explicit positions detected";
  const args =
    structure.arguments
      ?.map(
        (a) =>
          `- ${
            a.stance === "object"
              ? "Objection"
              : a.stance === "support"
                ? "Support"
                : "Argument"
          }: ${a.label}`
      )
      .join("\n") || "- No arguments detected";

  return `IBIS summary\nIssue: ${issueText}\n${positions}\n${args}`;
}
</file>

<file path="src/lib/ibis-rdf.js">
import rdf from "rdf-ext";
import ParserN3 from "@rdfjs/parser-n3";
import { Writer } from "n3";
import { Readable } from "stream";

const PREFIXES = {
  ibis: "https://vocab.methodandstructure.com/ibis#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
};

export function structureToDataset(structure) {
  const dataset = rdf.dataset();
  const issue = structure.issues?.[0] || {
    id: "issue-1",
    label: "Unspecified issue",
  };

  const issueNode = rdf.namedNode(`#${issue.id}`);
  dataset.add(
    rdf.quad(issueNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(issue.label))
  );
  dataset.add(
    rdf.quad(issueNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Issue`))
  );

  (structure.positions || []).forEach((pos, idx) => {
    const posId = pos.id || `pos-${idx + 1}`;
    const posNode = rdf.namedNode(`#${posId}`);
    dataset.add(
      rdf.quad(posNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(pos.label || "Position"))
    );
    dataset.add(
      rdf.quad(posNode, rdf.namedNode(`${PREFIXES.ibis}responds-to`), issueNode)
    );
    dataset.add(
      rdf.quad(posNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Position`))
    );
  });

  (structure.arguments || []).forEach((arg, idx) => {
    const argId = arg.id || `arg-${idx + 1}`;
    const argNode = rdf.namedNode(`#${argId}`);

    dataset.add(
      rdf.quad(argNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(arg.label || "Argument"))
    );
    if (arg.stance === "support" || arg.stance === "object") {
      const posTarget =
        arg.position || (structure.positions || [])[0]?.id || "pos-1";
      const predicate =
        arg.stance === "object"
          ? rdf.namedNode(`${PREFIXES.ibis}objects-to`)
          : rdf.namedNode(`${PREFIXES.ibis}supports`);
      dataset.add(
        rdf.quad(argNode, predicate, rdf.namedNode(`#${posTarget}`))
      );
    }
    dataset.add(
      rdf.quad(argNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Argument`))
    );
  });

  return dataset;
}

export async function datasetToTurtle(dataset) {
  const writer = new Writer({ prefixes: PREFIXES });
  dataset.forEach((quad) => {
    writer.addQuad(
      toTerm(quad.subject),
      toTerm(quad.predicate),
      toTerm(quad.object),
      quad.graph
    );
  });

  return new Promise((resolve, reject) => {
    writer.end((err, result) => {
      if (err) return reject(err);
      resolve(result.trim());
    });
  });
}

export async function turtleToDataset(turtle) {
  const parser = new ParserN3({ factory: rdf });
  const input = new Readable({
    read() {
      this.push(turtle);
      this.push(null);
    },
  });
  const dataset = rdf.dataset();
  const stream = parser.import(input);

  return new Promise((resolve, reject) => {
    stream.on("data", (quad) => dataset.add(quad));
    stream.on("error", reject);
    stream.on("end", () => resolve(dataset));
  });
}

export function datasetToStructure(dataset) {
  const issues = [];
  const positions = [];
  const argumentsList = [];

  dataset.forEach((quad) => {
    if (quad.predicate.value === `${PREFIXES.rdfs}label`) {
      if (quad.subject.value.includes("#issue")) {
        issues.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#pos-")) {
        positions.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#arg-")) {
        argumentsList.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
          stance: "neutral",
        });
      }
    }
    if (
      quad.predicate.value === `${PREFIXES.ibis}objects-to` &&
      quad.subject.value.includes("#arg-")
    ) {
      const arg = argumentsList.find((a) => a.id === stripHash(quad.subject.value));
      if (arg) {
        arg.stance = "object";
        arg.position = stripHash(quad.object.value);
      }
    }
    if (
      quad.predicate.value === `${PREFIXES.ibis}supports` &&
      quad.subject.value.includes("#arg-")
    ) {
      const arg = argumentsList.find((a) => a.id === stripHash(quad.subject.value));
      if (arg) {
        arg.stance = "support";
        arg.position = stripHash(quad.object.value);
      }
    }
  });

  return {
    issues,
    positions,
    arguments: argumentsList,
    confidence: issues.length + positions.length > 0 ? 0.7 : 0.2,
  };
}

function stripHash(value) {
  return value.split("#").pop();
}

function toTerm(term) {
  if (term.termType === "NamedNode" || term.termType === "BlankNode") {
    return term;
  }
  if (term.termType === "Literal") {
    return term;
  }
  return rdf.namedNode(term.value);
}
</file>

<file path="src/lib/lingue-capabilities.js">
import { xml } from "@xmpp/client";

export const LINGUE_FEATURES = [
  "http://purl.org/stuff/lingue/ibis-rdf",
  "http://purl.org/stuff/lingue/ask-tell",
  "http://purl.org/stuff/lingue/meta-transparent",
];

export function attachDiscoInfoResponder(xmpp, features = LINGUE_FEATURES) {
  xmpp.on("iq", async (stanza) => {
    const isDiscoInfo =
      stanza.is("iq") &&
      stanza.attrs.type === "get" &&
      stanza.getChild("query", "http://jabber.org/protocol/disco#info");

    if (!isDiscoInfo) return;

    const reply = xml(
      "iq",
      { type: "result", to: stanza.attrs.from, id: stanza.attrs.id },
      xml(
        "query",
        { xmlns: "http://jabber.org/protocol/disco#info" },
        ...features.map((f) => xml("feature", { var: f }))
      )
    );
    await xmpp.send(reply);
  });
}

export function hasLingueFeature(stanza, featureUri) {
  const query = stanza.getChild("query", "http://jabber.org/protocol/disco#info");
  if (!query) return false;
  return query.getChildren("feature").some((feature) => feature.attrs.var === featureUri);
}
</file>

<file path="src/lib/lingue-exchange.js">
import { detectIBISStructure, summarizeIBIS } from "./ibis-detect.js";
import { structureToDataset, datasetToTurtle } from "./ibis-rdf.js";
import { LingueStore } from "./lingue-store.js";

export function prepareStructuredOffer(text, confidenceMin = 0.5) {
  const structure = detectIBISStructure(text);
  if (structure.confidence < confidenceMin) {
    return null;
  }

  const dataset = structureToDataset(structure);
  return {
    summary: summarizeIBIS(structure),
    turtlePromise: datasetToTurtle(dataset),
    structure,
  };
}

export async function acceptStructuredOffer(store, offer) {
  const turtle = await offer.turtlePromise;
  await store.addTurtle(turtle);
  return turtle;
}

export function createLingueStore() {
  return new LingueStore();
}
</file>

<file path="src/lib/lingue-store.js">
import rdf from "rdf-ext";
import { structureToDataset, datasetToStructure, datasetToTurtle, turtleToDataset } from "./ibis-rdf.js";

const PREFIXES = {
  ibis: "https://vocab.methodandstructure.com/ibis#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
};

export class LingueStore {
  constructor() {
    this.dataset = rdf.dataset();
  }

  addStructure(structure) {
    const ds = structureToDataset(structure);
    this.dataset.addAll(ds);
  }

  addDataset(ds) {
    this.dataset.addAll(ds);
  }

  async addTurtle(turtle) {
    const ds = await turtleToDataset(turtle);
    this.dataset.addAll(ds);
  }

  positionsForIssue(issueId) {
    const issueNode = rdf.namedNode(`#${issueId}`);
    const respondsTo = rdf.namedNode(`${PREFIXES.ibis}responds-to`);
    const labelPred = rdf.namedNode(`${PREFIXES.rdfs}label`);

    const positionNodes = Array.from(
      this.dataset.match(null, respondsTo, issueNode)
    ).map((quad) => quad.subject.value);

    return positionNodes.map((nodeValue) => {
      const labelQuad = Array.from(
        this.dataset.match(rdf.namedNode(nodeValue), labelPred, null)
      )[0];
      return {
        id: stripHash(nodeValue),
        label: labelQuad?.object?.value || "",
      };
    });
  }

  argumentsForPosition(posId) {
    const posNode = rdf.namedNode(`#${posId}`);
    const supports = rdf.namedNode(`${PREFIXES.ibis}supports`);
    const objectsTo = rdf.namedNode(`${PREFIXES.ibis}objects-to`);
    const labelPred = rdf.namedNode(`${PREFIXES.rdfs}label`);

    const stanceForPredicate = (pred) =>
      pred.value.endsWith("objects-to") ? "object" : "support";

    const matches = [
      ...Array.from(this.dataset.match(null, supports, posNode)),
      ...Array.from(this.dataset.match(null, objectsTo, posNode)),
    ];

    return matches.map((quad) => {
      const labelQuad = Array.from(
        this.dataset.match(quad.subject, labelPred, null)
      )[0];
      return {
        id: stripHash(quad.subject.value),
        label: labelQuad?.object?.value || "",
        stance: stanceForPredicate(quad.predicate),
      };
    });
  }

  async toTurtle() {
    return datasetToTurtle(this.dataset);
  }

  toStructure() {
    return datasetToStructure(this.dataset);
  }
}

function stripHash(value) {
  return value.split("#").pop();
}
</file>

<file path="src/lib/logger.js">
module.exports = () => {

    const log4js = require('log4js')
    let logger = log4js.getLogger()
    logger.level = 'info'


    logger.updateConfig = (config) => {

        if (process.env.NODE_ENV !== 'production') {
            config.console.active = true
            config.stdout.active = false
            config.level = 'trace'
        }


        const appenders = []
        if (config.file.active) {
            const fs = require('fs')
            if (!fs.existsSync(config.file.path)) {
                try {
                    fs.mkdirSync(config.file.path)
                } catch (error) {
                    logger.fatal(`Can not write logs: ${error.message}`)
                    process.exit(99)
                }
            }
            appenders.push('file')
        }
        let layout = 'basic'
        if (config.console.active) {
            if (config.console.coloured) {
                layout = 'coloured'
            }
            appenders.push('console')
        }
        if (config.stdout.active) {
            appenders.push('stdout')
        }
        if (appenders.length === 0) {
            logger.fatal('App require at least one log appender')
            process.exit(99)
        }


        try {
            log4js.configure({
                appenders: {
                    console: {
                        type: 'console',
                        layout: { type: layout }
                    },
                    stdout: {
                        type: 'stdout',
                        layout: { type: 'pattern', pattern: config.stdout.pattern }
                    },
                    file: {
                        type: 'file',
                        layout: { type: 'pattern', pattern: config.file.pattern },
                        filename: config.file.path + config.file.filename,
                        maxLogSize: 1048576
                    }
                },
                categories: {
                    default: { appenders, level: 'info' }
                }
            })
            logger = log4js.getLogger()
        } catch (error) {
            logger.error(`Invalid logs config: ${error.message}`)
            process.exit(99)
        }

        logger.level = config.level
    }


    logger.shutdown = (cb) => {
        log4js.shutdown(cb)
    }

    return logger
}
</file>

<file path="src/lib/openai-connect.js">
const OpenAI = require("openai");
const openai = new OpenAI();

module.exports.promptAI = async function (message) {
  await promptAI(message);
}

var promptAI = async function (message) {
  console.log('AI prompted with : ' + message)

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  })

  const JSON = require('JSON')

  aiResponse = completion.choices[0]
  aiText = aiResponse['message']['content']
  console.log('AI responds : ' + aiText)
  return aiText
}
</file>

<file path="src/lib/system-config.js">
import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { turtleToDataset } from "./ibis-rdf.js";

const SYSTEM_NS = "https://tensegrity.it/vocab/system#";
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), "config", "system.ttl");
const DEFAULTS = {
  maxAgentRounds: 5
};

let cachedConfig = null;

export async function loadSystemConfig({ configPath = DEFAULT_CONFIG_PATH } = {}) {
  if (cachedConfig) return cachedConfig;
  try {
    const turtle = await fs.readFile(configPath, "utf8");
    const dataset = await turtleToDataset(turtle);
    const maxAgentRounds = extractInteger(dataset, `${SYSTEM_NS}maxAgentRounds`);
    cachedConfig = {
      maxAgentRounds: Number.isFinite(maxAgentRounds) ? maxAgentRounds : DEFAULTS.maxAgentRounds
    };
  } catch {
    cachedConfig = { ...DEFAULTS };
  }
  return cachedConfig;
}

function extractInteger(dataset, predicateUri) {
  const predicate = rdf.namedNode(predicateUri);
  const quad = Array.from(dataset.match(null, predicate, null))[0];
  const value = quad?.object?.value;
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
</file>

<file path="src/lib/xmpp-register.js">
import { client, xml } from "@xmpp/client";
import crypto from "crypto";

















export async function registerXmppAccount({
  service,
  domain,
  username,
  password,
  tls = { rejectUnauthorized: false },
  logger = console
}) {
  return new Promise((resolve, reject) => {
    let registrationComplete = false;
    let streamFeaturesReceived = false;
    let tlsEstablished = false;


    const xmpp = client({
      service,
      domain,
      tls,

      username: "",
      password: ""
    });

    // Try to disable SASL plugin entirely
    if (xmpp.plugins && xmpp.plugins.sasl) {
      logger.debug?.("[Registration] Attempting to disable SASL plugin");
      delete xmpp.plugins.sasl;
    }


    const originalSend = xmpp.send.bind(xmpp);
    xmpp.send = async function(stanza) {

      if (stanza && stanza.name === "auth" && stanza.attrs && stanza.attrs.xmlns === "urn:ietf:params:xml:ns:xmpp-sasl") {
        logger.warn?.("[Registration] Blocked SASL auth attempt during registration");
        return;
      }
      return originalSend(stanza);
    };

    const cleanup = () => {
      try {
        xmpp.stop().catch(() => {});
      } catch (err) {

      }
    };

    const timeout = setTimeout(() => {
      if (!registrationComplete) {
        cleanup();
        reject(new Error("Registration timeout after 20 seconds"));
      }
    }, 20000);

    xmpp.on("error", (err) => {
      const errMsg = err.message || err.condition || err.toString();


      if (err.condition === "not-authorized") {
        logger.debug?.("[Registration] Ignoring not-authorized during registration");
        return;
      }


      if (err.condition === "invalid-mechanism" || errMsg.includes("invalid-mechanism")) {
        logger.debug?.("[Registration] Ignoring invalid-mechanism during registration");

        setTimeout(() => {
          if (!registrationComplete) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Registration response not received - server may not support in-band registration or it's disabled"));
          }
        }, 2000);
        return;
      }


      if (errMsg.includes("Encryption is required") || errMsg.includes("encryption-required")) {
        logger.warn?.("[Registration] Server requires encryption - this is expected");
        return;
      }


      if (errMsg.includes("ECONNRESET") && streamFeaturesReceived) {
        logger.warn?.("[Registration] Connection reset after sending registration - waiting for response");
        return;
      }

      logger.error?.("[Registration] XMPP Error:", errMsg);

      if (!registrationComplete) {
        clearTimeout(timeout);
        cleanup();
        reject(err);
      }
    });


    xmpp.on("open", async () => {
      logger.debug?.("[Registration] Stream opened");
    });


    xmpp.on("status", (status) => {
      logger.debug?.(`[Registration] Status: ${status}`);
      if (status === "online") {
        tlsEstablished = true;
      }
    });


    xmpp.on("element", async (element) => {

      if (element.is("iq")) {
        const type = element.attrs.type;
        const id = element.attrs.id;


        if (id === "reg1" && type === "result") {
          const query = element.getChild("query", "jabber:iq:register");
          if (!query) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Server did not return registration form"));
            return;
          }

          logger.info?.("[Registration] Received registration form, submitting credentials");


          try {
            const submitIq = xml(
              "iq",
              { type: "set", id: "reg2", to: domain },
              xml(
                "query",
                { xmlns: "jabber:iq:register" },
                xml("username", {}, username),
                xml("password", {}, password)
              )
            );

            await xmpp.send(submitIq);
            logger.info?.("[Registration] Submitted registration");
          } catch (err) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error(`Failed to submit registration: ${err.message}`));
          }
          return;
        }


        if (id === "reg2" && type === "result") {
          logger.info?.(`[Registration] ✅ Account ${username}@${domain} registered successfully!`);
          registrationComplete = true;
          clearTimeout(timeout);
          cleanup();
          resolve({
            success: true,
            message: `Account ${username}@${domain} registered successfully`
          });
          return;
        }


        if ((id === "reg1" || id === "reg2") && type === "error") {
          const error = element.getChild("error");
          let errorMessage = "Registration failed";

          if (error) {
            const conflict = error.getChild("conflict");
            const notAcceptable = error.getChild("not-acceptable");
            const notAllowed = error.getChild("not-allowed");
            const forbidden = error.getChild("forbidden");
            const serviceUnavailable = error.getChild("service-unavailable");

            if (conflict) {
              errorMessage = `Username ${username} already exists`;
            } else if (notAcceptable) {
              errorMessage = "Username or password not acceptable";
            } else if (notAllowed || forbidden) {
              errorMessage = "Registration not allowed on this server";
            } else if (serviceUnavailable) {
              errorMessage = "Registration service unavailable";
            } else {
              const text = error.getChildText("text");
              errorMessage = text || error.toString();
            }
          }

          clearTimeout(timeout);
          cleanup();
          reject(new Error(errorMessage));
          return;
        }
      }


      if (element.is("features")) {
        logger.debug?.("[Registration] Received stream features");


        const starttls = element.getChild("starttls", "urn:ietf:params:xml:ns:xmpp-tls");
        if (starttls && !tlsEstablished) {
          logger.debug?.("[Registration] STARTTLS available, waiting for encryption...");


          return;
        }


        if (streamFeaturesReceived) {
          return;
        }
        streamFeaturesReceived = true;


        const register = element.getChild("register", "http://jabber.org/features/iq-register");
        if (register) {
          logger.info?.("[Registration] Server supports in-band registration");
        }

        logger.debug?.("[Registration] TLS established, sending registration request");


        try {
          const registerIq = xml(
            "iq",
            { type: "get", id: "reg1", to: domain },
            xml("query", { xmlns: "jabber:iq:register" })
          );

          await xmpp.send(registerIq);
          logger.info?.("[Registration] Sent registration form request");
        } catch (err) {
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`Failed to request registration form: ${err.message}`));
        }
        return;
      }
    });


    xmpp.on("stanza", async (stanza) => {

      if (stanza.is("iq")) {
        const type = stanza.attrs.type;
        const id = stanza.attrs.id;


        if (id === "reg1" && type === "result") {
          const query = stanza.getChild("query", "jabber:iq:register");
          if (!query) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Server did not return registration form"));
            return;
          }


          try {
            const submitIq = xml(
              "iq",
              { type: "set", id: "reg2", to: domain },
              xml(
                "query",
                { xmlns: "jabber:iq:register" },
                xml("username", {}, username),
                xml("password", {}, password)
              )
            );

            await xmpp.send(submitIq);
          } catch (err) {
            clearTimeout(timeout);
            cleanup();
            reject(new Error(`Failed to submit registration: ${err.message}`));
          }
        }


        if (id === "reg2" && type === "result") {
          logger.info?.(`[Registration] ✅ Account ${username}@${domain} registered successfully!`);
          registrationComplete = true;
          clearTimeout(timeout);
          cleanup();
          resolve({
            success: true,
            message: `Account ${username}@${domain} registered successfully`
          });
        }


        if (id === "reg2" && type === "error") {
          const error = stanza.getChild("error");
          let errorMessage = "Registration failed";

          if (error) {
            const conflict = error.getChild("conflict");
            const notAcceptable = error.getChild("not-acceptable");
            const notAllowed = error.getChild("not-allowed");
            const forbidden = error.getChild("forbidden");

            if (conflict) {
              errorMessage = `Username ${username} already exists`;
            } else if (notAcceptable) {
              errorMessage = "Username or password not acceptable";
            } else if (notAllowed || forbidden) {
              errorMessage = "Registration not allowed on this server";
            } else {
              const text = error.getChildText("text");
              errorMessage = text || error.toString();
            }
          }

          clearTimeout(timeout);
          cleanup();
          reject(new Error(errorMessage));
        }

        if (id === "reg1" && type === "error") {
          const error = stanza.getChild("error");
          let errorMessage = "Server does not support registration";

          if (error) {
            const notAllowed = error.getChild("not-allowed");
            const forbidden = error.getChild("forbidden");
            const serviceUnavailable = error.getChild("service-unavailable");

            if (notAllowed || forbidden) {
              errorMessage = "Registration not allowed on this server";
            } else if (serviceUnavailable) {
              errorMessage = "Registration service unavailable";
            } else {
              const text = error.getChildText("text");
              errorMessage = text || error.toString();
            }
          }

          clearTimeout(timeout);
          cleanup();
          reject(new Error(errorMessage));
        }
      }
    });


    logger.info?.("[Registration] Connecting to server...");
    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Failed to connect for registration: ${err.message}`));
    });
  });
}






export function generatePassword(length = 16) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";


  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }

  return password;
}
</file>

<file path="src/mcp/servers/loopback-echo.js">
import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "tia-loopback-echo",
  version: "0.1.0"
});

server.registerTool("echo", {
  description: "Echo a message back to the caller.",
  inputSchema: {
    message: z.string().describe("Message to echo")
  }
}, async ({ message }) => {
  return {
    content: [{ type: "text", text: `Echo: ${message}` }]
  };
});

async function main() {
  process.stdin.resume();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  server.server.onerror = (error) => {
    console.error("[MCP] Loopback server error:", error);
  };
  server.server.onclose = () => {
    console.error("[MCP] Loopback server closed");
  };
  console.error("[MCP] Loopback echo server running on stdio");
  setInterval(() => {}, 1000);
}

main().catch((error) => {
  console.error("[MCP] Loopback echo server error:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("[MCP] Loopback uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[MCP] Loopback unhandled rejection:", reason);
});
</file>

<file path="src/mcp/client-bridge.js">
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { McpToolRegistry } from "./tool-registry.js";
import { applyMcpMetadata } from "./profile-mapper.js";

export class McpClientBridge {
  constructor({
    profile,
    clientInfo = { name: "tia-mcp-client", version: "0.1.0" },
    client = null,
    transport = null,
    serverParams = null,
    serverUrl = null,
    registry = null,
    logger = console
  } = {}) {
    this.profile = profile;
    this.client = client || new Client(clientInfo);
    this.transport = transport;
    this.serverParams = serverParams;
    this.serverUrl = serverUrl;
    this.registry = registry || new McpToolRegistry({ logger });
    this.logger = logger;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    if (!this.transport) {
      this.transport = this.createTransport();
    }
    await this.client.connect(this.transport);
    this.connected = true;
  }

  async close() {
    if (!this.connected) return;
    await this.client.close();
    this.connected = false;
  }

  async listTools() {
    await this.ensureConnected();
    const result = await this.client.listTools();
    return result.tools || [];
  }

  async listResources() {
    await this.ensureConnected();
    const result = await this.client.listResources();
    return result.resources || [];
  }

  async listPrompts() {
    await this.ensureConnected();
    const result = await this.client.listPrompts();
    return result.prompts || [];
  }

  async callTool(name, args = {}) {
    await this.ensureConnected();
    return await this.client.callTool({ name, arguments: args });
  }

  async populateProfile() {
    await this.ensureConnected();
    const tools = await this.listTools();
    const resources = await this.listResources();
    const prompts = await this.listPrompts();

    this.registry.update({
      tools,
      resources,
      prompts,
      serverInfo: this.client.serverInfo || null
    });

    return applyMcpMetadata(this.profile, this.registry);
  }

  createTransport() {
    if (this.serverParams) {
      return new StdioClientTransport(this.serverParams);
    }
    if (this.serverUrl) {
      return new StreamableHTTPClientTransport(new URL(this.serverUrl));
    }
    throw new Error("McpClientBridge requires serverParams or serverUrl");
  }

  async ensureConnected() {
    if (!this.connected) {
      await this.connect();
    }
  }
}
</file>

<file path="src/mcp/client.js">
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from 'readline';
import { stdin as input, stdout as output } from 'process';

class EchoClient {
  constructor() {
    this.rl = readline.createInterface({
      input,
      output,
      prompt: 'echo> ',
      terminal: true
    });


    this.client = {};
  }

  async start() {
    try {

      const { spawn } = await import('node:child_process');


      this.serverProcess = spawn('node', ['src/mcp/servers/Echo.js']);


      this.serverProcess.stdout.on('data', (data) => {

        try {
          JSON.parse(data.toString());
        } catch {
          process.stdout.write(data);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });


      this.serverProcess.on('close', (code) => {
        console.error(`\n[Server] Process exited with code ${code}`);
        process.exit(code);
      });


      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Connected! Type a message or "help" for commands.\n');


      this.setupEventHandlers();


      this.promptUser();

    } catch (error) {
      console.error('\nConnection error:', error.message);
      this.cleanup();
      process.exit(1);
    }
  }

  setupEventHandlers() {

    this.rl.on('SIGINT', () => this.shutdown());


    process.on('exit', () => this.cleanup());
  }

  promptUser() {
    this.rl.question('', async (input) => {
      const command = input.trim();
      const lowerCommand = command.toLowerCase();

      if (lowerCommand === 'exit' || lowerCommand === 'quit') {
        return this.shutdown();
      }

      if (lowerCommand === 'help') {
        this.showHelp();
        return this.promptUser();
      }

      if (command) {
        await this.handleCommand(command);
      }

      this.promptUser();
    });
  }

  async handleCommand(command) {
    try {
      console.error('\n[Client] Sending command:', command);


      const request = {
        jsonrpc: '2.0',
        id: Date.now().toString(),
        method: 'echo',
        params: { message: command }
      };


      const requestStr = JSON.stringify(request) + '\n';


      return new Promise((resolve, reject) => {

        const onData = (data) => {
          try {
            const responseStr = data.toString().trim();
            if (!responseStr) return;

            console.error('[Client] Received data:', responseStr);

            const response = JSON.parse(responseStr);


            if (response.id === request.id) {
              clearTimeout(timeoutId);
              this.serverProcess.stdout.off('data', onData);

              if (response.error) {
                reject(new Error(`Server error: ${response.error.message || 'Unknown error'}`));
              } else {

                const result = response.result;
                console.error('[Client] Received response:', JSON.stringify(result, null, 2));


                if (typeof result === 'string') {
                  console.log(`\n${result}\n`);
                }
                else if (result?.content?.[0]?.text) {
                  console.log(`\n${result.content[0].text}\n`);
                } else {
                  console.log('\nReceived response:', JSON.stringify(result, null, 2), '\n');
                }

                resolve(result);
              }
            }
          } catch (error) {
            console.error('[Client] Error parsing response:', error);

          }
        };


        const timeoutId = setTimeout(() => {
          this.serverProcess.stdout.off('data', onData);
          reject(new Error('Request timed out - no response from server'));
        }, 3000);


        this.serverProcess.stdout.on('data', onData);


        console.error('[Client] Sending request:', requestStr.trim());
        this.serverProcess.stdin.write(requestStr);
      });
    } catch (error) {
      console.error('\nError:', error.message, '\n');
    }
  }

  async listAvailableTools() {
    try {
      if (this.client.listTools) {
        const tools = await this.client.listTools();
        console.error('[Client] Available tools:', tools);
      } else if (this.client.tools) {
        console.error('[Client] Available tools:', Object.keys(this.client.tools));
      } else {
        console.error('[Client] Could not list available tools');
      }
    } catch (error) {
      console.error('[Client] Error listing tools:', error.message);
    }
  }

  showHelp() {
    console.log('\nAvailable commands:');
    console.log('  <message>  - Echo a message');
    console.log('  help       - Show this help');
    console.log('  exit/quit  - Exit the client\n');
  }

  shutdown() {
    console.log('\nGoodbye!');
    this.cleanup();
    process.exit(0);
  }

  cleanup() {
    if (this.rl) {
      this.rl.close();
    }
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}


process.on('uncaughtException', (error) => {
  console.error('\nUncaught exception:', error);
  process.exit(1);
});


process.on('unhandledRejection', (reason) => {
  console.error('\nUnhandled rejection:', reason);
  process.exit(1);
});


const client = new EchoClient();
client.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
</file>

<file path="src/mcp/index.js">
export { McpClientBridge } from "./client-bridge.js";
export { McpToolRegistry } from "./tool-registry.js";
export { applyMcpMetadata } from "./profile-mapper.js";
export { McpServerBridge } from "./server-bridge.js";
export { McpChatAdapter } from "./chat-adapter.js";
</file>

<file path="src/mcp/profile-mapper.js">
export function applyMcpMetadata(profile, registry, options = {}) {
  const tools = registry.listTools();
  const resources = registry.listResources();
  const prompts = registry.listPrompts();
  const endpoints = collectEndpoints({ tools, resources });

  profile.mcp = {
    role: options.role || "client",
    servers: registry.serverInfo ? [registry.serverInfo] : [],
    tools,
    resources,
    prompts,
    endpoints
  };

  profile.custom.mcp = {
    tools,
    resources,
    prompts,
    endpoints,
    serverInfo: registry.serverInfo
  };

  return profile;
}

function collectEndpoints({ tools, resources }) {
  const endpoints = new Set();
  tools.forEach((tool) => {
    const toolEndpoints = tool.endpoints;
    if (!toolEndpoints) return;
    if (Array.isArray(toolEndpoints)) {
      toolEndpoints.forEach((endpoint) => endpoints.add(endpoint));
      return;
    }
    Object.values(toolEndpoints).forEach((endpoint) => endpoints.add(endpoint));
  });

  resources.forEach((resource) => {
    if (resource.uri) endpoints.add(resource.uri);
  });

  return Array.from(endpoints);
}
</file>

<file path="src/mcp/server-bridge.js">
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createChatTools } from "./tool-definitions.js";

export class McpServerBridge {
  constructor({
    serverInfo = { name: "tia-mcp-server", version: "0.1.0" },
    chatAdapter = null,
    tools = null,
    logger = console
  } = {}) {
    this.server = new McpServer(serverInfo);
    this.chatAdapter = chatAdapter;
    this.logger = logger;
    this.tools = tools;
  }

  registerTools() {
    const tools = this.tools || createChatTools({ chatAdapter: this.chatAdapter });
    tools.forEach((tool) => {
      this.server.registerTool(tool.name, {
        description: tool.description,
        inputSchema: tool.inputSchema
      }, tool.handler);
    });
  }

  async startStdio() {
    this.registerTools();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info?.("[MCP] Server started on stdio");
  }
}
</file>

<file path="src/mcp/tool-registry.js">
export class McpToolRegistry {
  constructor({ logger = console } = {}) {
    this.logger = logger;
    this.tools = [];
    this.resources = [];
    this.prompts = [];
    this.serverInfo = null;
  }

  update({ tools = [], resources = [], prompts = [], serverInfo = null } = {}) {
    this.tools = tools.map(normalizeTool);
    this.resources = resources.map(normalizeResource);
    this.prompts = prompts.map(normalizePrompt);
    this.serverInfo = serverInfo;
  }

  listTools() {
    return this.tools;
  }

  listResources() {
    return this.resources;
  }

  listPrompts() {
    return this.prompts;
  }
}

function normalizeTool(tool = {}) {
  const endpoints = extractEndpoints(tool);
  return {
    name: tool.name,
    description: tool.description || tool.title || "",
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema,
    endpoints,
    meta: tool._meta || null
  };
}

function normalizeResource(resource = {}) {
  return {
    name: resource.name,
    description: resource.description || "",
    uri: resource.uri,
    mimeType: resource.mimeType,
    meta: resource._meta || null
  };
}

function normalizePrompt(prompt = {}) {
  return {
    name: prompt.name,
    description: prompt.description || "",
    meta: prompt._meta || null
  };
}

function extractEndpoints(tool = {}) {
  const meta = tool._meta || {};
  if (meta.endpoints) return meta.endpoints;
  if (meta.tia?.endpoints) return meta.tia.endpoints;
  if (meta.sparql?.endpoints) return meta.sparql.endpoints;
  return null;
}
</file>

<file path="src/services/data-agent.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { DataProvider } from "../agents/providers/data-provider.js";
import { McpClientBridge } from "../mcp/client-bridge.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import { HumanChatHandler, SparqlQueryHandler } from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "data";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Data agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Data agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: fileConfig.xmpp?.tlsRejectUnauthorized ?? false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Data agent XMPP config incomplete; check profile file and secrets.json");
}

const MUC_ROOM = fileConfig.roomJid;
const BOT_NICKNAME = fileConfig.nickname;

const dataConfig = fileConfig.data;
if (!dataConfig?.sparqlEndpoint) {
  throw new Error("Data agent profile missing sparqlEndpoint");
}

const extractionApiKeyEnv = dataConfig.extractionApiKeyEnv || "MISTRAL_API_KEY";
const extractionApiKey = process.env[extractionApiKeyEnv];
if (!extractionApiKey) {
  logger.warn(`${extractionApiKeyEnv} not set - natural language queries will be disabled`);
}

const mcpBridge = new McpClientBridge({
  profile,
  serverParams: {
    command: "node",
    args: ["src/mcp/servers/sparql-server.js"],
    env: {
      ...process.env,
      SPARQL_QUERY_ENDPOINT: dataConfig.sparqlEndpoint
    }
  },
  logger
});

await mcpBridge.connect();

const provider = new DataProvider({
  endpoint: dataConfig.sparqlEndpoint,
  extractionModel: dataConfig.extractionModel,
  extractionApiKey,
  mcpBridge,
  nickname: BOT_NICKNAME,
  logger
});

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.SPARQL_QUERY)) {
  handlers[LANGUAGE_MODES.SPARQL_QUERY] = new SparqlQueryHandler({
    logger,
    onPayload: async ({ payload }) => {
      return provider.handleDirectSparql(payload);
    }
  });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Data agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`SPARQL Endpoint: ${dataConfig.sparqlEndpoint}`);
  console.log(`Extraction Model: ${dataConfig.extractionModel || "none"}`);
  if (!extractionApiKey) {
    console.log("Note: Natural language queries disabled (no API key)");
  }
  await runner.start();
}

async function stop() {
  await mcpBridge.close();
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start Data agent:", err);
  process.exit(1);
});
</file>

<file path="src/config.js">
{
    "logger": {
        "level": "debug",
            "file": {
            "active": false,
                "pattern": "%d %p %m",
                    "path": "./",
                        "filename": "dogbot.log"
        },
        "console": {
            "active": false,
                "coloured": true
        },
        "stdout": {
            "active": true,
                "pattern": "%p %m"
        }
    },
    "xmppServer": {
        "service": "xmpps://xmpp.hyperdata.it",
            "domain": "xmpp.hyperdata.it",
                "username": "danja@xmpp.hyperdata.it",
                    "password": "ClaudioPup_123",
                        "resource": "botservice",
                            "errorReply": "Oops, something went wrong :(",
                                "rooms": [
                                    {
                                        "id": "shed@conference.xmpp.hyperdata.it",
                                        "password": null
                                    }
                                ]
    }
}
</file>

<file path="src/dogbot-service.js">
'use strict'

const config = {
    "logger": {
        "level": "debug",
        "file": {
            "active": false,
            "pattern": "%d %p %m",
            "path": "./",
            "filename": "dogbot.log"
        },
        "console": {
            "active": false,
            "coloured": true
        },
        "stdout": {
            "active": true,
            "pattern": "%p %m"
        }
    },
    "xmpp": {
        "service": "xmpps://hyperdata.it",
        "domain": "hyperdata.it",
        "username": "dogbot",
        "password": "doggy",
        "errorReply": "Oops, something went wrong :(",
        "rooms": [

        ]
    }
}

















const logger = require('./lib/logger')()





logger.updateConfig(config.logger)

const { promptAI } = require('./lib/openai-connect')


const xmpp = require('./lib/xmpp-connect')(logger, config, promptAI)
</file>

<file path="templates/config/agent-profile.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#myagent> a agent:ConversationalAgent, lng:Agent ;
  foaf:nick "MyAgent" ;
  schema:identifier "myagent" ;
  dcterms:created "2025-01-01T00:00:00Z"^^xsd:dateTime ;
  dcterms:description "My custom agent" ;

  lng:supports lng:HumanChat ;
  lng:prefers lng:HumanChat ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://localhost:5222" ;
    xmpp:domain "xmpp" ;
    xmpp:username "myagent" ;
    xmpp:passwordKey "myagent" ;
    xmpp:resource "MyAgent"
  ] ;

  agent:roomJid "general@conference.xmpp" .
</file>

<file path="templates/config/mistral-agent.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#mistral-agent> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  foaf:nick "MistralAgent" ;
  schema:identifier "mistral-agent" ;
  dcterms:created "2025-01-01T00:00:00Z"^^xsd:dateTime ;
  dcterms:description "AI-powered agent using Mistral API" ;

  lng:supports lng:HumanChat, lng:IBISText ;
  lng:prefers lng:HumanChat ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://localhost:5222" ;
    xmpp:domain "xmpp" ;
    xmpp:username "mistralagent" ;
    xmpp:passwordKey "mistralagent" ;
    xmpp:resource "MistralAgent"
  ] ;

  agent:roomJid "general@conference.xmpp" ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:model "mistral-small-latest" ;
    ai:apiKeyEnv "MISTRAL_API_KEY" ;
    ai:systemPrompt "You are a helpful AI assistant in an XMPP chat room. Be concise and friendly."
  ] .
</file>

<file path="templates/config/secrets.example.json">
{
  "xmpp": {
    "myagent": "your-xmpp-password-here",
    "mistralagent": "your-xmpp-password-here"
  }
}
</file>

<file path="templates/providers/llm-provider-template.js">
import { BaseProvider } from "tia-agents";












export class LLMProviderTemplate extends BaseProvider {
  constructor({
    apiKey,
    model = "your-default-model",
    nickname = "LLMBot",
    systemPrompt = null,
    historyStore = null,
    logger = console
  }) {
    super();

    if (!apiKey) {
      throw new Error("API key is required");
    }




    this.apiKey = apiKey;
    this.model = model;
    this.nickname = nickname;
    this.systemPrompt = systemPrompt || `You are ${nickname}, a helpful assistant.`;
    this.historyStore = historyStore;
    this.logger = logger;
  }

  async handle({ command, content, metadata, reply }) {

    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "bot: <your message>"`;
    }

    try {
      const sender = metadata.sender || "user";


      const messages = [];


      messages.push({
        role: "system",
        content: this.systemPrompt
      });


      if (this.historyStore) {
        const history = await this.historyStore.getHistory();
        for (const entry of history) {
          messages.push({
            role: entry.role === "bot" ? "assistant" : "user",
            content: entry.content
          });
        }
      }


      messages.push({
        role: "user",
        content
      });










      const aiResponse = `This is a simulated response to: "${content}". Replace this with actual LLM API call.`;


      if (this.historyStore) {
        await this.historyStore.addEntry({
          role: "user",
          content,
          sender
        });
        await this.historyStore.addEntry({
          role: "bot",
          content: aiResponse,
          sender: this.nickname
        });
      }


      return aiResponse;

    } catch (error) {
      this.logger.error("LLM error:", error);
      return `Sorry, I encountered an error: ${error.message}`;
    }
  }
}
</file>

<file path="templates/providers/simple-provider-template.js">
import { BaseProvider } from "tia-agents";














export class SimpleProviderTemplate extends BaseProvider {
  constructor({ nickname = "Bot", logger = console } = {}) {
    super();
    this.nickname = nickname;
    this.logger = logger;
  }

  async handle({ command, content, metadata, reply }) {
    this.logger.info(`Received command: ${command}, content: ${content}`);


    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "bot: <your message>"`;
    }


    const sender = metadata.sender || "someone";


    return `@${sender} You said: ${content}`;
  }
}
</file>

<file path="templates/scripts/basic-agent.js">
#!/usr/bin/env node












import { createAgent, DemoProvider } from "tia-agents";

async function main() {
  try {


    const runner = await createAgent("myagent", new DemoProvider({
      nickname: "MyAgent"
    }), {
      profileDir: "./config/agents",
      logger: console
    });

    console.log("Starting agent...");
    await runner.start();
    console.log("Agent started! Press Ctrl+C to stop.");

  } catch (error) {
    console.error("Failed to start agent:", error.message);
    process.exit(1);
  }
}


process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

main();
</file>

<file path="templates/scripts/mistral-agent-example.js">
#!/usr/bin/env node















import { createAgent, InMemoryHistoryStore } from "tia-agents";

import { MistralProvider } from "tia-agents/providers/mistral";
import dotenv from "dotenv";


dotenv.config();

async function main() {
  if (!process.env.MISTRAL_API_KEY) {
    console.error("Error: MISTRAL_API_KEY environment variable is required");
    console.error("Set it with: export MISTRAL_API_KEY=your-api-key");
    process.exit(1);
  }

  try {

    const provider = new MistralProvider({
      apiKey: process.env.MISTRAL_API_KEY,
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      nickname: "MistralAgent",
      historyStore: new InMemoryHistoryStore({ maxEntries: 40 }),
      logger: console
    });


    const runner = await createAgent("mistral-agent", provider, {
      profileDir: "./config/agents",
      logger: console
    });

    console.log("Starting Mistral AI agent...");
    console.log(`Model: ${process.env.MISTRAL_MODEL || "mistral-small-latest"}`);
    await runner.start();
    console.log("Agent started! Press Ctrl+C to stop.");

  } catch (error) {
    console.error("Failed to start agent:", error.message);
    process.exit(1);
  }
}


process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

main();
</file>

<file path="templates/scripts/programmatic-agent.js">
#!/usr/bin/env node











import { createSimpleAgent, DemoProvider } from "tia-agents";

async function main() {
  try {

    const runner = createSimpleAgent({
      xmppConfig: {
        service: "xmpp://localhost:5222",
        domain: "xmpp",
        username: "mybot",
        password: "your-password-here",
        resource: "MyBot"
      },
      roomJid: "general@conference.xmpp",
      nickname: "MyBot",
      provider: new DemoProvider({
        nickname: "MyBot"
      }),
      logger: console
    });

    console.log("Starting agent...");
    await runner.start();
    console.log("Agent started! Press Ctrl+C to stop.");

  } catch (error) {
    console.error("Failed to start agent:", error.message);
    process.exit(1);
  }
}


process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

main();
</file>

<file path="templates/README.md">
# TIA Agents Templates

This directory contains templates and examples to help you get started with creating your own XMPP agents.

## Directory Structure

```
templates/
├── config/           # Configuration file templates
│   ├── agent-profile.ttl          # Basic agent profile
│   ├── mistral-agent.ttl          # AI agent profile (Mistral)
│   └── secrets.example.json       # Secrets file template
├── providers/        # Provider implementation templates
│   ├── simple-provider-template.js    # Minimal provider example
│   └── llm-provider-template.js       # LLM integration pattern
└── scripts/          # Runnable example scripts
    ├── basic-agent.js                 # Config-driven approach
    ├── programmatic-agent.js          # Programmatic approach
    └── mistral-agent-example.js       # AI agent example
```

## Quick Start

### 1. Config-Driven Approach

Copy the configuration templates to your project:

```bash
mkdir -p config/agents
cp node_modules/tia-agents/templates/config/agent-profile.ttl config/agents/myagent.ttl
cp node_modules/tia-agents/templates/config/secrets.example.json config/agents/secrets.json
```

Edit the files with your XMPP server details and passwords, then:

```bash
cp node_modules/tia-agents/templates/scripts/basic-agent.js ./my-bot.js
node my-bot.js
```

### 2. Programmatic Approach

No configuration files needed:

```bash
cp node_modules/tia-agents/templates/scripts/programmatic-agent.js ./my-bot.js
# Edit my-bot.js with your configuration
node my-bot.js
```

### 3. AI-Powered Agent (Mistral)

```bash
npm install @mistralai/mistralai
cp node_modules/tia-agents/templates/config/mistral-agent.ttl config/agents/
cp node_modules/tia-agents/templates/scripts/mistral-agent-example.js ./ai-bot.js
MISTRAL_API_KEY=your-key node ai-bot.js
```

## Creating Custom Providers

See the provider templates for examples:

- `providers/simple-provider-template.js` - Minimal provider showing basic structure
- `providers/llm-provider-template.js` - Pattern for integrating with LLM APIs

All providers must extend `BaseProvider` and implement the `handle()` method.

## Configuration Files

### Profile (.ttl files)

Turtle/RDF files defining agent properties:
- XMPP credentials and connection details
- Display nickname and identifier
- Language mode support (Lingue)
- AI provider configuration

### Secrets (secrets.json)

JSON file with XMPP passwords referenced by profile files:

```json
{
  "xmpp": {
    "agent-username": "password-here"
  }
}
```

**Important**: Add `config/agents/secrets.json` to your `.gitignore`!

## For More Information

- [Quick Start Guide](../docs/quick-start.md)
- [Provider Guide](../docs/provider-guide.md)
- [API Reference](../docs/api-reference.md)
</file>

<file path="test/fixtures/agent-secrets.json">
{
  "xmpp": {
    "mistral": "mistralpass",
    "semem": "semempass",
    "demo": "demopass",
    "test": "testpass"
  }
}
</file>

<file path="test/helpers/agent-secrets.js">
import path from "path";

process.env.AGENT_SECRETS_PATH = path.join(
  process.cwd(),
  "test",
  "fixtures",
  "agent-secrets.json"
);
</file>

<file path="test/lingue-handlers/human-chat.test.js">
import { describe, it, expect } from "vitest";
import { HumanChatHandler } from "../../src/lib/lingue/handlers/human-chat.js";

describe("HumanChatHandler", () => {
  it("roundtrips body text", () => {
    const handler = new HumanChatHandler();
    const stanza = handler.createStanza("peer@xmpp", null, "Hello");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Hello");
    expect(parsed.payload).toBeNull();
  });
});
</file>

<file path="test/lingue-handlers/ibis-text.test.js">
import { describe, it, expect } from "vitest";
import { IBISTextHandler } from "../../src/lib/lingue/handlers/ibis-text.js";

describe("IBISTextHandler", () => {
  it("roundtrips summary and turtle payload", () => {
    const handler = new IBISTextHandler();
    const turtle = "@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .";
    const stanza = handler.createStanza("peer@xmpp", turtle, "Summary");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Summary");
    expect(parsed.payload).toBe(turtle);
    expect(parsed.mimeType).toBe("text/turtle");
  });
});
</file>

<file path="test/lingue-handlers/profile-exchange.test.js">
import { describe, it, expect } from "vitest";
import { ProfileExchangeHandler } from "../../src/lib/lingue/handlers/profile-exchange.js";

describe("ProfileExchangeHandler", () => {
  it("roundtrips profile turtle payload", () => {
    const handler = new ProfileExchangeHandler();
    const payload = "@prefix lng: <http://purl.org/stuff/lingue/> .";
    const stanza = handler.createStanza("peer@xmpp", payload, "Profile");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Profile");
    expect(parsed.payload).toBe(payload);
    expect(parsed.mimeType).toBe("text/turtle");
  });
});
</file>

<file path="test/lingue-handlers/prolog.test.js">
import { describe, it, expect } from "vitest";
import { PrologProgramHandler } from "../../src/lib/lingue/handlers/prolog.js";

describe("PrologProgramHandler", () => {
  it("roundtrips prolog payload", () => {
    const handler = new PrologProgramHandler();
    const payload = "rule(a) :- fact(b).";
    const stanza = handler.createStanza("peer@xmpp", payload, "Rules");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Rules");
    expect(parsed.payload).toBe(payload);
    expect(parsed.mimeType).toBe("text/x-prolog");
  });
});
</file>

<file path="test/agent-runner-agent-rounds.test.js">
import { describe, it, expect } from "vitest";
import { AgentRunner } from "../src/agents/core/agent-runner.js";

describe("AgentRunner agent rounds", () => {
  it("suppresses agent messages after max rounds until human mention", async () => {
    const replies = [];
    const provider = {
      async handle() {
        return "ok";
      }
    };

    const runner = new AgentRunner({
      xmppConfig: {
        service: "xmpp://localhost:5222",
        domain: "xmpp",
        username: "test",
        password: "test",
        resource: "TestBot"
      },
      roomJid: "room@conference.xmpp",
      nickname: "TestBot",
      provider,
      agentRoster: ["AgentA", "AgentB"],
      maxAgentRounds: 2,
      mentionDetector: (text) => text?.toLowerCase?.().includes("testbot")
    });

    await runner.handleMessage({
      body: "TestBot, hello",
      sender: "AgentA",
      type: "groupchat",
      roomJid: "room@conference.xmpp",
      reply: (text) => replies.push(text)
    });

    await runner.handleMessage({
      body: "TestBot, ping",
      sender: "AgentB",
      type: "groupchat",
      roomJid: "room@conference.xmpp",
      reply: (text) => replies.push(text)
    });

    await runner.handleMessage({
      body: "TestBot, are you there?",
      sender: "danny",
      type: "groupchat",
      roomJid: "room@conference.xmpp",
      reply: (text) => replies.push(text)
    });

    expect(replies).toEqual(["ok", "ok"]);
  });
});
</file>

<file path="test/agent-runner-lingue.test.js">
import { describe, it, expect, vi } from "vitest";
import { AgentRunner } from "../src/agents/core/agent-runner.js";

const xmppConfig = {
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "tester",
  password: "testpass"
};

describe("AgentRunner Lingue integration", () => {
  it("delegates to negotiator when stanza is handled", async () => {
    const provider = { handle: vi.fn() };
    const negotiator = { handleStanza: vi.fn(async () => true) };
    const runner = new AgentRunner({
      xmppConfig,
      roomJid: "test@conference.local",
      nickname: "TestBot",
      provider,
      negotiator
    });

    await runner.handleMessage({
      body: "ignored",
      sender: "peer",
      type: "chat",
      roomJid: null,
      reply: vi.fn(),
      stanza: {}
    });

    expect(negotiator.handleStanza).toHaveBeenCalledWith(expect.anything(), expect.any(Object));
    expect(provider.handle).not.toHaveBeenCalled();
  });

  it("falls back to provider when stanza not handled", async () => {
    const provider = { handle: vi.fn(async () => "ok") };
    const negotiator = { handleStanza: vi.fn(async () => false) };
    const reply = vi.fn();
    const runner = new AgentRunner({
      xmppConfig,
      roomJid: "test@conference.local",
      nickname: "TestBot",
      provider,
      negotiator
    });

    await runner.handleMessage({
      body: "hello",
      sender: "peer",
      type: "chat",
      roomJid: null,
      reply,
      stanza: {}
    });

    expect(provider.handle).toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith("ok");
  });
});
</file>

<file path="test/history-store.test.js">
import { describe, it, expect } from "vitest";
import { InMemoryHistoryStore } from "../src/lib/history/index.js";

describe("InMemoryHistoryStore", () => {
  it("stores turns in order and returns messages", () => {
    const store = new InMemoryHistoryStore({ maxEntries: 3 });

    store.addTurn({ role: "user", content: "Hello" });
    store.addTurn({ role: "assistant", content: "Hi there" });
    store.addTurn({ role: "user", content: "How are you?" });

    const messages = store.getMessages();
    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({ role: "user", content: "Hello" });
    expect(messages[2]).toEqual({ role: "user", content: "How are you?" });
  });

  it("prunes older entries when maxEntries is exceeded", () => {
    const store = new InMemoryHistoryStore({ maxEntries: 2 });

    store.addTurn({ role: "user", content: "One" });
    store.addTurn({ role: "assistant", content: "Two" });
    store.addTurn({ role: "user", content: "Three" });

    const messages = store.getMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: "assistant", content: "Two" });
    expect(messages[1]).toEqual({ role: "user", content: "Three" });
  });
});
</file>

<file path="test/ibis.test.js">
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectIBISStructure,
  summarizeIBIS,
} from "../src/lib/ibis-detect.js";
import {
  structureToDataset,
  datasetToTurtle,
  turtleToDataset,
  datasetToStructure,
} from "../src/lib/ibis-rdf.js";

test("detects IBIS elements from natural language", () => {
  const text =
    "Issue: How should we handle authentication? I propose OAuth2 because it is standard. However, the downside is complexity.";
  const result = detectIBISStructure(text);

  assert.ok(result.issues.length >= 1);
  assert.ok(result.positions.length >= 1);
  assert.ok(result.arguments.length >= 1);
  assert.ok(result.confidence > 0);

  const summary = summarizeIBIS(result);
  assert.match(summary, /Issue:/);
});

test("serializes and parses IBIS RDF using rdf-ext", async () => {
  const structure = {
    issues: [{ id: "issue-1", label: "Choose protocol" }],
    positions: [{ id: "pos-1", label: "Use XMPP" }],
    arguments: [
      { id: "arg-1", label: "Good federation story", stance: "support" },
    ],
  };

  const dataset = structureToDataset(structure);
  assert.ok(dataset.size > 0);

  const turtle = await datasetToTurtle(dataset);
  assert.match(turtle, /ibis:Issue/);

  const parsed = await turtleToDataset(turtle);
  const roundTrip = datasetToStructure(parsed);

  assert.equal(roundTrip.issues[0].label, "Choose protocol");
  assert.equal(roundTrip.positions[0].label, "Use XMPP");
  assert.equal(roundTrip.arguments[0].stance, "support");
});

test("infers stance for shorthand arguments", () => {
  const support = detectIBISStructure("Issue: X. A: because it works.");
  const objection = detectIBISStructure("Issue: X. A: however it is risky.");
  const neutral = detectIBISStructure("Issue: X. A: needs more data.");

  assert.equal(support.arguments[0]?.stance, "support");
  assert.equal(objection.arguments[0]?.stance, "object");
  assert.equal(neutral.arguments[0]?.stance, "neutral");
});
</file>

<file path="test/lingue-discovery.test.js">
import { describe, it, expect } from "vitest";
import { createDiscoInfoResponse, parseDiscoInfo } from "../src/lib/lingue/discovery.js";
import { FEATURES } from "../src/lib/lingue/constants.js";

describe("Lingue disco#info discovery", () => {
  it("parses features and identities from disco#info", () => {
    const stanza = createDiscoInfoResponse({
      to: "tester@xmpp.example",
      id: "disco-1",
      features: [FEATURES.LANG_HUMAN_CHAT, FEATURES.LANG_IBIS_TEXT],
      identities: [{ category: "client", type: "bot", name: "TestAgent" }]
    });

    const parsed = parseDiscoInfo(stanza);
    expect(parsed).toBeTruthy();
    expect(parsed.features.has(FEATURES.LANG_HUMAN_CHAT)).toBe(true);
    expect(parsed.features.has(FEATURES.LANG_IBIS_TEXT)).toBe(true);
    expect(parsed.identities).toHaveLength(1);
    expect(parsed.identities[0]).toEqual({
      category: "client",
      type: "bot",
      name: "TestAgent"
    });
  });
});
</file>

<file path="test/lingue-exchange.test.js">
import { test } from "node:test";
import assert from "node:assert/strict";
import { createLingueStore, prepareStructuredOffer, acceptStructuredOffer } from "../src/lib/lingue-exchange.js";

test("prepares and accepts structured offers", async () => {
  const store = createLingueStore();
  const offer = prepareStructuredOffer(
    "Issue: Should we deploy now? I propose waiting until traffic is low because risk is smaller."
  );

  assert.ok(offer);
  assert.match(offer.summary, /Issue:/);

  const turtle = await acceptStructuredOffer(store, offer);
  assert.match(turtle, /ibis:Issue/);

  const structure = store.toStructure();
  assert.ok(structure.positions.length >= 1);
});
</file>

<file path="test/lingue-negotiation.test.js">
import { describe, it, expect, vi } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { LANGUAGE_MODES } from "../src/lib/lingue/constants.js";
import { NegotiationState } from "../src/lib/lingue/offer-accept.js";
import { LingueNegotiator, createOfferStanza } from "../src/lib/lingue/negotiator.js";

describe("Lingue negotiation state", () => {
  it("tracks offers and accepts", () => {
    const state = new NegotiationState({ offerTtlMs: 1000, activeTtlMs: 1000 });
    const mode = LANGUAGE_MODES.HUMAN_CHAT;

    state.offer("peer@xmpp", [mode]);
    expect(state.hasOffer("peer@xmpp")).toBe(true);

    const accepted = state.accept("peer@xmpp", mode);
    expect(accepted).toBe(true);
    expect(state.getActiveMode("peer@xmpp")).toBe(mode);
  });
});

describe("Lingue negotiator", () => {
  it("accepts an offered mode and replies", async () => {
    const mode = LANGUAGE_MODES.HUMAN_CHAT;
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference",
      lingue: { supports: [mode] }
    });

    const sent = [];
    const xmppClient = {
      send: async (stanza) => {
        sent.push(stanza);
      }
    };

    const negotiator = new LingueNegotiator({ profile, xmppClient });
    const offer = createOfferStanza("test@xmpp", [mode]);
    offer.attrs.from = "peer@xmpp";

    const handled = await negotiator.handleStanza(offer);

    expect(handled).toBe(true);
    expect(negotiator.getActiveMode("peer@xmpp")).toBe(mode);
    expect(sent.length).toBe(1);
  });

  it("routes payloads to handlers", async () => {
    const mode = LANGUAGE_MODES.PROLOG_PROGRAM;
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference",
      lingue: { supports: [mode] }
    });

    const handler = {
      parseStanza: () => ({ summary: "Summary", payload: "fact(a).", mode }),
      handlePayload: vi.fn(async () => "ok")
    };

    const negotiator = new LingueNegotiator({
      profile,
      handlers: { [mode]: handler }
    });

    const stanza = createOfferStanza("test@xmpp", []);
    stanza.attrs.from = "peer@xmpp";
    stanza.name = "message";
    stanza.getChild = (name, ns) => {
      if (name === "payload" && ns) {
        return {
          attrs: { mime: "text/x-prolog", mode },
          getText: () => "fact(a)."
        };
      }
      return null;
    };
    stanza.is = () => true;

    const reply = vi.fn();
    const handled = await negotiator.handleStanza(stanza, { reply });

    expect(handled).toBe(true);
    expect(handler.handlePayload).toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith("ok");
  });
});
</file>

<file path="test/lingue-store.test.js">
import { test } from "node:test";
import assert from "node:assert/strict";
import { LingueStore } from "../src/lib/lingue-store.js";

test("stores and queries positions and arguments", async () => {
  const store = new LingueStore();
  store.addStructure({
    issues: [{ id: "issue-1", label: "Choose protocol" }],
    positions: [
      { id: "pos-1", label: "Use XMPP" },
      { id: "pos-2", label: "Use MQTT" },
    ],
    arguments: [
      { id: "arg-1", label: "Federation support", stance: "support", position: "pos-1" },
      { id: "arg-2", label: "Brokers add ops cost", stance: "object", position: "pos-2" },
    ],
  });

  const positions = store.positionsForIssue("issue-1");
  assert.equal(positions.length, 2);
  assert.equal(positions[0].label, "Use XMPP");

  const args = store.argumentsForPosition("pos-1");
  assert.equal(args.length, 1);
  assert.equal(args[0].stance, "support");

  const turtle = await store.toTurtle();
  assert.match(turtle, /ibis:Position/);
});
</file>

<file path="test/mcp-loopback-provider.test.js">
import { describe, it, expect } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { McpLoopbackProvider } from "../src/agents/providers/mcp-loopback-provider.js";

describe("MCP loopback provider", () => {
  it("echoes via MCP client/server", async () => {
    const profile = new AgentProfile({
      identifier: "loopback",
      nickname: "Loopback",
      roomJid: "test@conference"
    });

    const provider = new McpLoopbackProvider({ profile, mode: "in-memory" });

    const result = await provider.handle({ command: "chat", content: "hello" });
    expect(result).toContain("Echo: hello");
    await provider.close();
  });
});
</file>

<file path="test/mcp-profile-mapper.test.js">
import { describe, it, expect } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { McpToolRegistry } from "../src/mcp/tool-registry.js";
import { applyMcpMetadata } from "../src/mcp/profile-mapper.js";

describe("MCP profile mapper", () => {
  it("maps tool metadata into profile", () => {
    const profile = new AgentProfile({
      identifier: "demo",
      nickname: "Demo",
      roomJid: "test@conference"
    });

    const registry = new McpToolRegistry();
    registry.update({
      tools: [{
        name: "sparqlQuery",
        description: "Query tool",
        _meta: { tia: { endpoints: { query: "https://example.org/sparql" } } }
      }],
      resources: [],
      prompts: []
    });

    applyMcpMetadata(profile, registry);

    expect(profile.mcp.tools).toHaveLength(1);
    expect(profile.mcp.tools[0].name).toBe("sparqlQuery");
    expect(profile.mcp.endpoints).toContain("https://example.org/sparql");
  });
});
</file>

<file path="test/npm-exports.test.js">
import { describe, it, expect } from "vitest";
import * as exports from "../src/index.js";

describe("NPM exports", () => {
  it("exposes core exports", () => {
    expect(exports.AgentRunner).toBeDefined();
    expect(exports.LingueNegotiator).toBeDefined();
    expect(exports.LINGUE).toBeDefined();
    expect(exports.Handlers).toBeDefined();
    expect(exports.BaseProvider).toBeDefined();
    expect(exports.MCP).toBeDefined();
  });
});
</file>

<file path="test/profile-capabilities.test.js">
import { describe, it, expect } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { XmppConfig } from "../src/agents/profile/xmpp-config.js";
import { Capability } from "../src/agents/profile/capability.js";
import { capabilityRegistry } from "../src/agents/profile/capability-registry.js";

describe("Runtime capability extension", () => {
  it("adds capabilities at runtime", async () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      xmppAccount: new XmppConfig({
        service: "xmpp://test:5222",
        domain: "test",
        username: "test",
        password: "test",
        resource: "Test"
      }),
      capabilities: []
    });

    const customCap = new Capability({
      name: "CustomCapability",
      label: "Custom",
      description: "A custom test capability",
      handler: async (ctx) => `Custom: ${ctx.input}`
    });

    profile.addCapability(customCap);
    expect(profile.hasCapability("CustomCapability")).toBe(true);

    const result = await profile.getCapability("CustomCapability").execute({ input: "test" });
    expect(result).toBe("Custom: test");
  });

  it("adds capability by name string", () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: []
    });

    profile.addCapability("SimpleCapability");
    expect(profile.hasCapability("SimpleCapability")).toBe(true);

    const cap = profile.getCapability("SimpleCapability");
    expect(cap.name).toBe("SimpleCapability");
  });

  it("returns false for non-existent capability", () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: []
    });

    expect(profile.hasCapability("NonExistent")).toBe(false);
  });

  it("throws error when executing capability without handler", async () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: [
        new Capability({
          name: "NoHandler",
          label: "No Handler"
        })
      ]
    });

    const cap = profile.getCapability("NoHandler");
    await expect(cap.execute({})).rejects.toThrow("No handler registered for capability: NoHandler");
  });

  it("registers capabilities globally", () => {
    const testCap = new Capability({
      name: "GlobalCap",
      label: "Global Test",
      description: "A globally registered capability"
    });

    capabilityRegistry.register("GlobalCap", testCap);

    expect(capabilityRegistry.get("GlobalCap")).toBeDefined();
    expect(capabilityRegistry.list()).toContain("GlobalCap");
  });

  it("registers handlers globally", () => {
    const handler = async (ctx) => `Handled: ${ctx.input}`;
    capabilityRegistry.registerHandler("TestCap", handler);

    const registeredHandler = capabilityRegistry.getHandler("TestCap");
    expect(registeredHandler).toBe(handler);
  });

  it("supports fluent chaining", () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: []
    });

    const result = profile
      .addCapability("Cap1")
      .addCapability("Cap2")
      .addCapability("Cap3");

    expect(result).toBe(profile);
    expect(profile.hasCapability("Cap1")).toBe(true);
    expect(profile.hasCapability("Cap2")).toBe(true);
    expect(profile.hasCapability("Cap3")).toBe(true);
  });
});
</file>

<file path="test/prolog-lingue-payload.test.js">
import { describe, it, expect, vi } from "vitest";
import { xml } from "@xmpp/client";
import { LingueNegotiator } from "../src/lib/lingue/negotiator.js";
import { LANGUAGE_MODES, LINGUE_NS } from "../src/lib/lingue/constants.js";
import { PrologProgramHandler } from "../src/lib/lingue/handlers/prolog.js";
import { PrologProvider } from "../src/agents/providers/prolog-provider.js";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";

describe("Prolog Lingue payload handling", () => {
  it("handles Prolog payloads via negotiator", async () => {
    const provider = new PrologProvider({ nickname: "Prolog" });
    const handler = new PrologProgramHandler({
      onPayload: async ({ payload }) => provider.handle({ command: "chat", content: payload })
    });

    const profile = new AgentProfile({
      identifier: "prolog",
      nickname: "Prolog",
      roomJid: "test@conference",
      lingue: { supports: [LANGUAGE_MODES.PROLOG_PROGRAM] }
    });

    const negotiator = new LingueNegotiator({
      profile,
      handlers: { [LANGUAGE_MODES.PROLOG_PROGRAM]: handler }
    });

    const stanza = xml(
      "message",
      { type: "chat", from: "peer@xmpp" },
      xml("body", {}, "Prolog payload"),
      xml(
        "payload",
        { xmlns: LINGUE_NS, mime: "text/x-prolog", mode: LANGUAGE_MODES.PROLOG_PROGRAM },
        "parent(bob, alice).\n?- parent(bob, alice)."
      )
    );

    const reply = vi.fn();
    await negotiator.handleStanza(stanza, { reply });

    expect(reply).toHaveBeenCalled();
    const response = reply.mock.calls[0][0];
    expect(response.toLowerCase()).toContain("true");
  });
});
</file>

<file path="test/prolog-provider.test.js">
import { describe, it, expect } from "vitest";
import { PrologProvider } from "../src/agents/providers/prolog-provider.js";

let tauAvailable = true;
try {
  await import("tau-prolog");
} catch (error) {
  tauAvailable = false;
}

const testCase = tauAvailable ? it : it.skip;

describe("PrologProvider", () => {
  testCase("answers a simple query", async () => {
    const provider = new PrologProvider({ nickname: "Prolog" });
    const result = await provider.handle({
      command: "chat",
      content: "parent(bob, alice).\n?- parent(bob, alice)."
    });

    expect(result).toBeTypeOf("string");
    expect(result.toLowerCase()).toContain("true");
  });
});
</file>

<file path="test/xmpp-auto-register.integration.test.js">
import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { autoConnectXmpp } from "../src/lib/xmpp-auto-connect.js";
import { registerXmppAccount, generatePassword } from "../src/lib/xmpp-register.js";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import fs from "fs/promises";
import path from "path";

dotenv.config();


const XMPP_SERVICE = process.env.XMPP_SERVICE || "xmpp://tensegrity.it:5222";
const XMPP_DOMAIN = process.env.XMPP_DOMAIN || "tensegrity.it";
const MUC_ROOM = process.env.MUC_ROOM || "general@conference.tensegrity.it";


const TEST_USERNAME = `test-auto-${Math.random().toString(16).slice(2, 10)}`;
const TEST_SECRETS_PATH = path.join(process.cwd(), "test", "fixtures", "test-auto-secrets.json");

const messages = [];
let agent;
let xmppClient;
let registeredCredentials;

async function waitFor(conditionFn, timeoutMs = 12000, intervalMs = 150) {
  const start = Date.now();
  while (true) {
    if (conditionFn()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}


const serverConfigured = process.env.RUN_TENSEGRITY_TESTS === "true";

if (!serverConfigured) {
  describe.skip("XMPP auto-registration (RUN_TENSEGRITY_TESTS not set)", () => {
    it("skipped because RUN_TENSEGRITY_TESTS is not set to 'true'", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("XMPP auto-registration", () => {
    beforeAll(async () => {

      try {
        await fs.unlink(TEST_SECRETS_PATH);
      } catch (err) {

      }
    }, 5000);

    afterAll(async () => {

      if (agent) {
        await agent.stop();
      }
      if (xmppClient) {
        await xmppClient.stop().catch(() => {});
      }


      try {
        await fs.unlink(TEST_SECRETS_PATH);
      } catch (err) {

      }
    }, 10000);

    it(
      "generates a random password",
      () => {
        const password = generatePassword(16);
        expect(password).toBeDefined();
        expect(password.length).toBe(16);
        expect(typeof password).toBe("string");


        const password2 = generatePassword(16);
        expect(password).not.toBe(password2);
      }
    );

    it(
      "registers a new account successfully",
      async () => {
        const username = `test-reg-${Math.random().toString(16).slice(2, 10)}`;
        const password = generatePassword(16);

        const result = await registerXmppAccount({
          service: XMPP_SERVICE,
          domain: XMPP_DOMAIN,
          username,
          password,
          tls: { rejectUnauthorized: false },
          logger: console
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain(username);
        expect(result.message).toContain("registered successfully");
      },
      20000
    );

    it(
      "auto-connects with registration when no password provided",
      async () => {
        const result = await autoConnectXmpp({
          service: XMPP_SERVICE,
          domain: XMPP_DOMAIN,
          username: TEST_USERNAME,
          password: undefined,
          resource: "TestClient",
          tls: { rejectUnauthorized: false },
          secretsPath: TEST_SECRETS_PATH,
          autoRegister: true,
          logger: console
        });

        expect(result).toBeDefined();
        expect(result.xmpp).toBeDefined();
        expect(result.credentials).toBeDefined();
        expect(result.credentials.username).toBe(TEST_USERNAME);
        expect(result.credentials.password).toBeDefined();
        expect(result.credentials.registered).toBe(true);

        xmppClient = result.xmpp;
        registeredCredentials = result.credentials;


        const secretsData = await fs.readFile(TEST_SECRETS_PATH, "utf-8");
        const secrets = JSON.parse(secretsData);
        expect(secrets.xmpp[TEST_USERNAME]).toBe(result.credentials.password);
      },
      25000
    );

    it(
      "reuses saved password on second connection",
      async () => {

        await xmppClient.stop();
        await new Promise((resolve) => setTimeout(resolve, 1000));


        const result = await autoConnectXmpp({
          service: XMPP_SERVICE,
          domain: XMPP_DOMAIN,
          username: TEST_USERNAME,
          password: undefined,
          resource: "TestClient2",
          tls: { rejectUnauthorized: false },
          secretsPath: TEST_SECRETS_PATH,
          autoRegister: false,
          logger: console
        });

        expect(result.credentials.password).toBe(registeredCredentials.password);
        expect(result.credentials.registered).toBe(false);

        xmppClient = result.xmpp;
      },
      20000
    );

    it(
      "auto-registered account can join MUC and send messages",
      async () => {
        const nickname = `Test-${Math.random().toString(16).slice(2, 6)}`;

        agent = new XmppRoomAgent({
          xmppConfig: {
            service: XMPP_SERVICE,
            domain: XMPP_DOMAIN,
            username: TEST_USERNAME,
            password: registeredCredentials.password,
            tls: { rejectUnauthorized: false }
          },
          roomJid: MUC_ROOM,
          nickname,
          onMessage: async (payload) => {
            messages.push(payload);
          },
          allowSelfMessages: true,
          logger: console
        });

        await agent.start();
        await waitFor(() => agent.isInRoom === true, 15000);


        const testBody = `auto-reg-test-${Date.now()}`;
        await agent.sendGroupMessage(testBody);


        await waitFor(
          () => messages.some((m) => m.body === testBody),
          10000
        );

        const receivedMessage = messages.find((m) => m.body === testBody);
        expect(receivedMessage).toBeDefined();
        expect(receivedMessage.sender).toBe(nickname);
        expect(receivedMessage.type).toBe("groupchat");
      },
      30000
    );

    it(
      "handles registration conflict gracefully",
      async () => {

        const password = generatePassword(16);

        await expect(
          registerXmppAccount({
            service: XMPP_SERVICE,
            domain: XMPP_DOMAIN,
            username: TEST_USERNAME,
            password,
            tls: { rejectUnauthorized: false },
            logger: console
          })
        ).rejects.toThrow(/already exists/i);
      },
      20000
    );
  });
}
</file>

<file path="test/xmpp.semem.integration.test.js">
import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";
import { spawn } from "child_process";

dotenv.config();

const requiredEnv = [
  "XMPP_SERVICE",
  "XMPP_DOMAIN",
  "XMPP_USERNAME",
  "XMPP_PASSWORD",
  "MUC_ROOM"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const sememTestEnabled = process.env.RUN_SEMEM_BOT_TEST === "true";

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const testerNick =
  process.env.TEST_XMPP_NICKNAME || `SememTester-${Math.random().toString(16).slice(2, 8)}`;
const sememNick =
  process.env.SEMEM_NICKNAME ||
  process.env.AGENT_NICKNAME ||
  "Semem";

const messages = [];
let tester;
let sememProc;

async function waitFor(conditionFn, timeoutMs = 30000, intervalMs = 200) {
  const start = Date.now();

  while (true) {
    if (conditionFn()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

function startSememBot() {
  sememProc = spawn("node", ["src/services/semem-agent.js"], {
    env: { ...process.env, AGENT_NICKNAME: sememNick },
    stdio: "inherit"
  });
}

function stopSememBot() {
  if (sememProc && sememProc.exitCode === null) {
    sememProc.kill("SIGTERM");
  }
}

function findMessageFrom(senderNickname, textIncludes) {
  const base = senderNickname.toLowerCase();
  return messages.find(
    (m) =>
      m.sender?.toLowerCase().startsWith(base) &&
      (!textIncludes || m.body?.toLowerCase().includes(textIncludes.toLowerCase()))
  );
}

if (missingEnv.length || !sememTestEnabled) {
  describe.skip("Semem tell/ask integration (env not provided or disabled)", () => {
    it("skipped because required env vars are missing or RUN_SEMEM_BOT_TEST!=true", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("Semem tell/ask integration", () => {
    beforeAll(async () => {
      tester = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: testerNick,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: true,
        logger: console
      });

      startSememBot();
      await tester.start();
      await waitFor(() => tester.isInRoom === true, 18000);
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }, 50000);

    afterAll(async () => {
      stopSememBot();
      if (tester) {
        await tester.stop();
      }
    });

    it(
      "stores via tell and recalls via ask",
      async () => {
        const tellMsg = `${sememNick}, tell Semem that Glitch is a canary`;
        await tester.sendGroupMessage(tellMsg);

        await waitFor(() => !!findMessageFrom(sememNick), 40000, 200);
        messages.length = 0;

        const askMsg = `${sememNick}, what is Glitch?`;
        await tester.sendGroupMessage(askMsg);

        await waitFor(() => !!findMessageFrom(sememNick), 45000, 200);
        const reply = findMessageFrom(sememNick);
        expect(reply?.body || "").toBeTruthy();
      },
      90000
    );
  });
}
</file>

<file path="vocabs/ibis.ttl">
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix bibo: <http://purl.org/ontology/bibo/> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfa: <http://www.w3.org/ns/rdfa#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix vann: <http://purl.org/vocab/vann/> .
@prefix xhv: <http://www.w3.org/1999/xhtml/vocab#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://www.cc.gatech.edu/~ellendo/rittel/rittel-issues.pdf>
    dct:creator "Horst Rittel"@en, "Werner Kunz"@en ;
    dct:date "1970"^^xsd:gYear ;
    dct:title "Issues as Elements of Information Systems"@en .

<http://www.cs.hut.fi/Opinnot/T-93.850/2005/Papers/gIBIS1988-conklin.pdf>
    dct:creator "Jeff Conklin"@en, "Michael L. Begeman"@en ;
    dct:date "1988"^^xsd:gYear ;
    dct:title "gIBIS: a hypertext tool for exploratory policy discussion"@en .

<https://doriantaylor.com/person/dorian-taylor#me>
    foaf:name "Dorian Taylor"@en .

<https://vocab.methodandstructure.com/ibis>
    a bibo:Specification ;
    xhv:contents <https://vocab.methodandstructure.com/> ;
    xhv:index <https://vocab.methodandstructure.com/> ;
    xhv:top <https://vocab.methodandstructure.com/> ;
    xhv:up <https://vocab.methodandstructure.com/> ;
    rdfa:usesVocabulary <http://www.w3.org/1999/xhtml/vocab#> .

<https://vocab.methodandstructure.com/ibis#>
    dct:created "2012-12-11T22:22:53-08:00"^^xsd:dateTime ;
    dct:creator <https://doriantaylor.com/person/dorian-taylor#me> ;
    dct:modified "2012-12-12T16:04:50-08:00"^^xsd:dateTime, "2014-02-24T21:14:13Z"^^xsd:dateTime, "2018-02-22T03:39:14Z"^^xsd:dateTime, "2019-03-24T22:37:22Z"^^xsd:dateTime, "2023-12-18T02:25:31Z"^^xsd:dateTime, "2024-01-05T04:05:24Z"^^xsd:dateTime, "2025-04-10T02:30:11Z"^^xsd:dateTime, "2025-05-09T04:08:32Z"^^xsd:dateTime, "2025-10-31T22:26:31Z"^^xsd:dateTime ;
    dct:references skos:Concept ;
    dct:title "IBIS (bis) Vocabulary"@en ;
    bibo:uri <https://vocab.methodandstructure.com/ibis#> ;
    vann:preferredNamespacePrefix "ibis" ;
    a owl:Ontology ;
    rdfs:comment "This document specifies a vocabulary for describing an IBIS (issue-based information system)."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "IBIS"@en ;
    rdfs:seeAlso <http://dublincore.org/documents/dcmi-terms/>, <http://en.wikipedia.org/wiki/Issue-Based_Information_System>, <http://www.cc.gatech.edu/~ellendo/rittel/rittel-issues.pdf>, <http://www.cs.hut.fi/Opinnot/T-93.850/2005/Papers/gIBIS1988-conklin.pdf>, <http://www.w3.org/TR/prov-o/>, <https://vocab.methodandstructure.com/ibis.n3>, <https://vocab.methodandstructure.com/ibis.rdf>, <https://vocab.methodandstructure.com/process-model#>, <https://web.archive.org/web/20120606063823/http://hyperdata.org/xmlns/ibis/> ;
    owl:imports <http://www.w3.org/2004/02/skos/core#> ;
    owl:versionInfo "0.7" .

ibis:Argument
    a owl:Class ;
    rdfs:comment "An Argument is a type of Issue that explicitly supports or refutes a Position."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "Argument"@en ;
    rdfs:subClassOf ibis:Issue, [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Argument ;
        owl:onProperty ibis:replaces
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Argument ;
        owl:onProperty ibis:replaced-by
    ] ;
    owl:disjointWith ibis:Position ;
    skos:usageNote "An Argument need not only relate in scope to another Argument, but it must only be replaced by another argument."@en .

ibis:Entity
    a owl:Class ;
    rdfs:comment "ibis:Entity is the abstract superclass of from which the more specific entities are derived."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "Entity"@en ;
    rdfs:subClassOf skos:Concept .

ibis:Invariant
    a owl:Class ;
    rdfs:comment "An ibis:Entity can be marked ibis:Invariant to denote that it has been deemed outside of the influence of the agents in the system, i.e., something to be steered around."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "Invariant"@en ;
    rdfs:subClassOf ibis:Entity .

ibis:Issue
    a owl:Class ;
    rdfs:comment "An Issue is a state of affairs, claimed by one or more Agents to either be a misfit itself, or affecting some other Issue or Position."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "Issue"@en ;
    rdfs:subClassOf ibis:State, [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Issue ;
        owl:onProperty skos:narrowerTransitive
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Issue ;
        owl:onProperty skos:broaderTransitive
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Issue ;
        owl:onProperty ibis:replaces
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Issue ;
        owl:onProperty ibis:replaced-by
    ] ;
    owl:disjointWith ibis:Position .

ibis:Network
    a owl:Class ;
    rdfs:comment "A network of issues, positions, and arguments."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "Network"@en ;
    rdfs:subClassOf skos:ConceptScheme .

ibis:Position
    a owl:Class ;
    rdfs:comment "A Position asserts a moral, ethical, pragmatic, or similar kind of assertion, typically identifying what, if anything, should be done about an Issue."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "Position"@en ;
    rdfs:subClassOf ibis:Entity, [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Position ;
        owl:onProperty ibis:replaced-by
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Position ;
        owl:onProperty skos:narrowerTransitive
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Position ;
        owl:onProperty skos:broaderTransitive
    ], [
        a owl:Restriction ;
        owl:allValuesFrom ibis:Position ;
        owl:onProperty ibis:replaces
    ] ;
    owl:disjointWith ibis:Argument, ibis:Issue .

ibis:State
    a owl:Class ;
    rdfs:comment "A State can be understood as a snapshot of a system at a given time, such as before or after an event."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "State"^^xsd:token ;
    rdfs:subClassOf ibis:Entity ;
    skos:note "A State is distinct from a particular instant, but it is analogous to it. At the time of observation, a State is either true or false."@en .

ibis:concern-of
    a owl:ObjectProperty ;
    rdfs:comment "The subject is an issue concerning the object, which can be any resource."@en ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "concern-of"@en ;
    rdfs:range ibis:Entity ;
    owl:inverseOf ibis:concerns .

ibis:concerns
    a owl:ObjectProperty ;
    rdfs:comment "The subject is an issue concerning the object, which can be any resource."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "concerns"@en ;
    owl:inverseOf ibis:concern-of .

ibis:endorsed-by
    a owl:ObjectProperty ;
    rdfs:comment "A concept can be endorsed by an Agent without said Agent having mentioned or advanced it initially, and without any additional comment."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "endorsed by"@en ;
    rdfs:range foaf:Agent ;
    owl:inverseOf ibis:endorses ;
    skos:note "This term, along with ibis:endorses, enables an Agent to signal its agreement with a concept. To signal disagreement, explain why with an ibis:Argument that ibis:opposes the concept."@en .

ibis:endorses
    a owl:ObjectProperty ;
    rdfs:comment "An Agent can endorse a concept without having initially mentioned or advanced it, and without any additional comment."@en ;
    rdfs:domain foaf:Agent ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "endorses"@en ;
    rdfs:range ibis:Entity ;
    owl:inverseOf ibis:endorsed-by ;
    skos:note "This term, along with ibis:endorsed-by, enables an Agent to signal its agreement with a concept. To signal disagreement, explain why with an ibis:Argument that ibis:opposes the concept."@en .

ibis:generalizes
    a owl:ObjectProperty ;
    rdfs:comment "The subject is a more generic form of the object."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "generalizes"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf skos:narrower ;
    owl:inverseOf ibis:specializes ;
    skos:note "The equivalent property skos:narrower asserts that the object is narrower than the subject, while the subject of ibis:generalizes is more general than the object."@en .

ibis:implied-by
    a owl:ObjectProperty ;
    rdfs:comment "An ibis:State may be implied by an ibis:Entity."@en ;
    rdfs:domain ibis:State ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "implied-by"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf skos:semanticRelation ;
    owl:inverseOf ibis:implies .

ibis:implies
    a owl:ObjectProperty ;
    rdfs:comment "The existence of an ibis:Entity implies an ibis:State."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "implies"@en ;
    rdfs:range ibis:State ;
    rdfs:subPropertyOf skos:semanticRelation ;
    owl:inverseOf ibis:implied-by .

ibis:opposed-by
    a owl:ObjectProperty ;
    rdfs:comment "Indicates a subject position opposed by an object argument."@en ;
    rdfs:domain ibis:Position ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "opposed-by"@en ;
    rdfs:range ibis:Argument ;
    rdfs:subPropertyOf ibis:suggests ;
    owl:inverseOf ibis:opposes .

ibis:opposes
    a owl:ObjectProperty ;
    rdfs:comment "Indicates a subject argument that opposes an object position."@en ;
    rdfs:domain ibis:Argument ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "opposes"@en ;
    rdfs:range ibis:Position ;
    rdfs:subPropertyOf ibis:suggested-by ;
    owl:inverseOf ibis:opposed-by .

ibis:questioned-by
    a owl:ObjectProperty ;
    rdfs:comment "Indicates a belief called into question by an issue."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "questioned-by"@en ;
    rdfs:range ibis:Issue ;
    rdfs:subPropertyOf ibis:suggests ;
    owl:inverseOf ibis:questions .

ibis:questions
    a owl:ObjectProperty ;
    rdfs:comment "Indicates an issue that raises doubt on a belief."@en ;
    rdfs:domain ibis:Issue ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "questions"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf ibis:suggested-by ;
    owl:inverseOf ibis:questioned-by .

ibis:replaced-by
    a owl:ObjectProperty ;
    rdfs:comment "Indicates when a concept is replaced by another concept of the same type."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "replaced-by"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf dct:isReplacedBy, skos:semanticRelation ;
    owl:inverseOf ibis:replaces .

ibis:replaces
    a owl:ObjectProperty ;
    rdfs:comment "Indicates when a concept replaces another concept of the same type."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "replaces"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf dct:replaces, skos:semanticRelation ;
    owl:inverseOf ibis:replaced-by .

ibis:responds-to
    a owl:ObjectProperty ;
    rdfs:comment "Indicates an issue to which the subject position responds."@en ;
    rdfs:domain ibis:Position ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "responds-to"@en ;
    rdfs:range ibis:Issue ;
    rdfs:subPropertyOf skos:semanticRelation ;
    owl:inverseOf ibis:response .

ibis:response
    a owl:ObjectProperty ;
    rdfs:comment "Indicates a position that responds to the subject issue."@en ;
    rdfs:domain ibis:Issue ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "response"@en ;
    rdfs:range ibis:Position ;
    rdfs:subPropertyOf skos:semanticRelation ;
    owl:inverseOf ibis:responds-to .

ibis:specializes
    a owl:ObjectProperty ;
    rdfs:comment "The subject is a more specific form of the object."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "specializes"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf skos:broader ;
    owl:inverseOf ibis:generalizes ;
    skos:note "The equivalent property skos:broader asserts that the object is broader than the subject, while the subject of ibis:specializes is more specific than the object."@en .

ibis:suggested-by
    a owl:ObjectProperty ;
    rdfs:comment "An ibis:Issue may be suggested by an ibis:Entity."@en ;
    rdfs:domain ibis:Issue ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "suggested-by"@en ;
    rdfs:range ibis:Entity ;
    rdfs:subPropertyOf <ibis:implied-by> ;
    owl:inverseOf ibis:suggests .

ibis:suggests
    a owl:ObjectProperty ;
    rdfs:comment "An ibis:Entity may suggest an ibis:Issue."@en ;
    rdfs:domain ibis:Entity ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "suggests"@en ;
    rdfs:range ibis:Issue ;
    rdfs:subPropertyOf ibis:implies ;
    owl:inverseOf ibis:suggested-by .

ibis:supported-by
    a owl:ObjectProperty ;
    rdfs:comment "Indicates a subject position supported by an object argument."@en ;
    rdfs:domain ibis:Position ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "supported-by"@en ;
    rdfs:range ibis:Argument ;
    rdfs:subPropertyOf ibis:suggests ;
    owl:inverseOf ibis:supports .

ibis:supports
    a owl:ObjectProperty ;
    rdfs:comment "Indicates a subject argument that supports an object position."@en ;
    rdfs:domain ibis:Argument ;
    rdfs:isDefinedBy <https://vocab.methodandstructure.com/ibis#> ;
    rdfs:label "supports"@en ;
    rdfs:range ibis:Position ;
    rdfs:subPropertyOf ibis:suggested-by ;
    owl:inverseOf ibis:supported-by .

<https://web.archive.org/web/20120606063823/http://hyperdata.org/xmlns/ibis/>
    dct:creator <https://web.archive.org/web/20130113103138/http://danny.ayers.name/index.rdf#me> .

<https://web.archive.org/web/20130113103138/http://danny.ayers.name/index.rdf#me>
    foaf:name "Danny Ayers"@en .

[]
    xhv:role xhv:note .

[]
    xhv:role xhv:note .

[]
    xhv:role xhv:note .

[]
    xhv:role xhv:note .

[]
    xhv:role xhv:note .

[]
    xhv:role xhv:note .
</file>

<file path="vocabs/intersection.ttl">
# Base definitions
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix agent: <http://example.org/agent#> .
@prefix protocol: <http://example.org/protocol#> .

# Agent capability descriptions
agent:Agent1 a agent:Agent ;
    protocol:supports protocol:HTTP, protocol:MQTT, protocol:CoAP .

agent:Agent2 a agent:Agent ;
    protocol:supports protocol:HTTP, protocol:CoAP, protocol:DDS .

# SHACL shape to validate protocol intersection
protocol:IntersectionShape a sh:NodeShape ;
    sh:targetClass agent:Agent ;
    sh:property [
        sh:path protocol:supports ;
        sh:in ( protocol:HTTP protocol:CoAP ) ;  # Common protocols
        sh:minCount 1 ;
    ] .

# Validation result will show agents supporting both HTTP and CoAP
</file>

<file path="vocabs/lingue-shapes.ttl">
@prefix : <http://purl.org/stuff/lingue/> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

lng:shapes
    a owl:Ontology ;
    dct:title "Lingue SHACL Shapes" ;
    dct:description "Validation shapes for Lingue agents, profiles, and capability declarations. Version 0.1.0." ;
    dct:creator "Lingue project" ;
    owl:versionInfo "0.1.0" .

# Validate that agents advertise usable capabilities and profiles

lng:AgentShape
    a sh:NodeShape ;
    sh:targetClass lng:Agent ;
    sh:property [
        sh:path lng:supports ;
        sh:minCount 1 ;
        sh:message "Agent should advertise at least one capability (channel or language mode)." ;
    ] ;
    sh:property [
        sh:path lng:supports ;
        sh:qualifiedValueShape [ sh:class lng:Channel ] ;
        sh:qualifiedMinCount 1 ;
        sh:message "Agent should advertise at least one channel capability (e.g., XMPP MUC)." ;
    ] ;
    sh:property [
        sh:path lng:supports ;
        sh:qualifiedValueShape [ sh:class lng:LanguageMode ] ;
        sh:qualifiedMinCount 1 ;
        sh:message "Agent should advertise at least one language mode (e.g., HumanChat, IBISText, Prolog)." ;
    ] ;
    sh:property [
        sh:path lng:prefers ;
        sh:maxCount 1 ;
        sh:class lng:LanguageMode ;
        sh:message "Preferred mode must be a single LanguageMode." ;
    ] ;
    sh:property [
        sh:path lng:profile ;
        sh:maxCount 1 ;
        sh:class lng:Profile ;
        sh:message "Profile, if present, must point to a Lingue Profile." ;
    ] ;
    sh:property [
        sh:path lng:understands ;
        sh:nodeKind sh:IRI ;
        sh:message "understands values should be IRIs for vocabularies or MIME identifiers." ;
    ] .

# Validate RPP-derived profile structure

lng:ProfileShape
    a sh:NodeShape ;
    sh:targetClass lng:Profile ;
    sh:property [
        sh:path lng:availability ;
        sh:minCount 1 ;
        sh:class lng:Availability ;
        sh:message "Profiles must declare availability (Definition/Source/Executable/Process)." ;
    ] ;
    sh:property [
        sh:path lng:dependsOn ;
        sh:class lng:Dependency ;
        sh:message "Dependencies must be typed as Dependency/Environment/Library." ;
    ] ;
    sh:property [
        sh:path lng:hasDependency ;
        sh:class lng:Dependency ;
        sh:message "hasDependency, if used, must target Dependency/Environment/Library." ;
    ] ;
    sh:property [
        sh:path lng:in ;
        sh:class lng:Interface ;
        sh:message "Inputs must be Interface nodes." ;
    ] ;
    sh:property [
        sh:path lng:out ;
        sh:class lng:Interface ;
        sh:message "Outputs must be Interface nodes." ;
    ] ;
    sh:property [
        sh:path lng:alang ;
        sh:datatype xsd:string ;
        sh:message "alang should be a literal naming the programming/specification language." ;
    ] ;
    sh:property [
        sh:path lng:location ;
        sh:nodeKind sh:IRI ;
        sh:message "location should be an IRI for executable or endpoint discovery." ;
    ] .

# Check that an agent's declared supports include only recognized capability classes

lng:CapabilityTypeShape
    a sh:NodeShape ;
    sh:targetSubjectsOf lng:supports ;
    sh:property [
        sh:path lng:supports ;
        sh:or (
            [ sh:class lng:Capability ]
            [ sh:class lng:Channel ]
            [ sh:class lng:LanguageMode ]
        ) ;
        sh:message "supports values should be capabilities (Channel or LanguageMode)." ;
    ] .

# Intersection helper: agent must support the chosen channel and language mode for any Exchange it offers/asks/tells

lng:ExchangeShape
    a sh:NodeShape ;
    sh:targetClass lng:Exchange ;
    sh:sparql [
        sh:message "Exchange language/channel must be supported by the initiating agent." ;
        sh:select """
            PREFIX lng: <http://purl.org/stuff/lingue/>
            SELECT ?this
            WHERE {
              # The exchange is linked from an agent via offers/asks/tells
              ?agent (lng:offers|lng:asks|lng:tells) ?this .
              # The exchange declares a language and channel it intends to use
              OPTIONAL { ?this lng:usesLanguageMode ?langMode . }
              OPTIONAL { ?this lng:usesChannel ?chan . }
              FILTER (!BOUND(?langMode) || NOT EXISTS { ?agent lng:supports ?langMode . })
              UNION
              FILTER (!BOUND(?chan) || NOT EXISTS { ?agent lng:supports ?chan . })
            }
        """ ;
    ] .

# Recommended exchange properties (minted here) to describe negotiated channel/mode

lng:usesLanguageMode a owl:ObjectProperty ;
    rdfs:domain lng:Exchange ;
    rdfs:range lng:LanguageMode ;
    rdfs:comment "Language mode selected for this exchange." .

lng:usesChannel a owl:ObjectProperty ;
    rdfs:domain lng:Exchange ;
    rdfs:range lng:Channel ;
    rdfs:comment "Channel selected for this exchange (e.g., XMPP MUC)." .
</file>

<file path="vocabs/lingue.ttl">
@prefix : <http://purl.org/stuff/lingue/> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .

lng:
    a owl:Ontology ;
    dct:title "Lingue Ontology" ;
    dct:description "Draft vocabulary for Lingue-capable agents, profiles, capabilities, and exchanges. Initial transport focus is XMPP MUC. Version 0.1.0." ;
    owl:versionInfo "0.1.0" ;
    dct:creator "Lingue project" .

# Core classes

lng:Agent a owl:Class ;
    rdfs:subClassOf foaf:Agent ;
    rdfs:label "Agent" ;
    rdfs:comment "Participant in Lingue interactions (software or human)." .

lng:Resource a owl:Class ;
    rdfs:subClassOf rdfs:Resource ;
    rdfs:label "Lingue Resource" ;
    rdfs:comment "Base class for profile-described resources." .

lng:Profile a owl:Class ;
    rdfs:subClassOf lng:Resource ;
    rdfs:label "Profile" ;
    rdfs:comment "RPP-derived profile describing an agent's runnable or conversational capabilities." .

lng:Component a owl:Class ;
    rdfs:subClassOf lng:Resource ;
    rdfs:label "Component" ;
    rdfs:comment "Grouping class for profile attribute values (RPP-derived)." .

lng:Availability a owl:Class ;
    rdfs:subClassOf lng:Component ;
    rdfs:label "Availability" ;
    rdfs:comment "Machine-readability of a process or algorithm (definition/source/executable/process)." .

lng:Dependency a owl:Class ;
    rdfs:subClassOf lng:Component ;
    rdfs:label "Dependency" ;
    rdfs:comment "Required resources to operate (libraries, runtimes, environments)." .

lng:Environment a owl:Class ;
    rdfs:subClassOf lng:Dependency ;
    rdfs:label "Environment" ;
    rdfs:comment "Runtime environment dependency (e.g., OS, VM, XMPP server)." .

lng:Library a owl:Class ;
    rdfs:subClassOf lng:Dependency ;
    rdfs:label "Library" ;
    rdfs:comment "Library dependency required by the profile." .

lng:Algorithm a owl:Class ;
    rdfs:subClassOf lng:Component ;
    rdfs:label "Algorithm" ;
    rdfs:comment "Abstract algorithm or process implementation identifier." .

lng:Interface a owl:Class ;
    rdfs:subClassOf lng:Component ;
    rdfs:label "Interface" ;
    rdfs:comment "Input/output interface description for a process." .

lng:DataFormat a owl:Class ;
    rdfs:subClassOf lng:Interface ;
    rdfs:label "Data format" ;
    rdfs:comment "Format of data consumed or produced by a process." .

lng:Encoding a owl:Class ;
    rdfs:subClassOf lng:Interface ;
    rdfs:label "Encoding" ;
    rdfs:comment "Low-level encoding of input/output data." .

lng:Capability a owl:Class ;
    rdfs:label "Capability" ;
    rdfs:comment "Advertised ability such as a channel or language mode." .

lng:Channel a owl:Class ;
    rdfs:subClassOf lng:Capability ;
    rdfs:label "Channel" ;
    rdfs:comment "Communication medium used for exchanges." .

lng:LanguageMode a owl:Class ;
    rdfs:subClassOf lng:Capability ;
    rdfs:label "Language mode" ;
    rdfs:comment "Communicative idiom (human text, IBIS text, Prolog program, etc.)." .

lng:Exchange a owl:Class ;
    rdfs:label "Exchange" ;
    rdfs:comment "Interaction instance covering negotiation, ASK, or TELL payloads." .

lng:ProtocolShape a owl:Class ;
    rdfs:subClassOf sh:NodeShape ;
    rdfs:label "Protocol shape" ;
    rdfs:comment "SHACL shapes used to validate capability overlap and protocol constraints." .

# Properties

lng:supports a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range lng:Capability ;
    rdfs:label "supports" ;
    rdfs:comment "Advertises that an agent can use a capability, language mode, or channel." .

lng:prefers a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range lng:LanguageMode ;
    rdfs:label "prefers" ;
    rdfs:comment "Preferred outgoing language mode for an agent." .

lng:profile a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range lng:Profile ;
    rdfs:label "profile" ;
    rdfs:comment "Links an agent to its Lingue profile." .

lng:understands a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range rdfs:Resource ;
    rdfs:label "understands" ;
    rdfs:comment "Vocabularies, serializations, or schemas an agent can process (e.g., IBIS, SHACL, MIME IRIs)." .

lng:offers a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range lng:Exchange ;
    rdfs:label "offers" ;
    rdfs:comment "Proposes a structured exchange to a peer." .

lng:asks a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range lng:Exchange ;
    rdfs:label "asks" ;
    rdfs:comment "Marks an exchange as a request for information or capability." .

lng:tells a owl:ObjectProperty ;
    rdfs:domain lng:Agent ;
    rdfs:range lng:Exchange ;
    rdfs:label "tells" ;
    rdfs:comment "Marks an exchange as an assertion/response." .

lng:dependsOn a owl:ObjectProperty ;
    rdfs:domain lng:Profile ;
    rdfs:range lng:Dependency ;
    rdfs:label "depends on" ;
    rdfs:comment "Declares a dependency required by the profile." .

lng:hasDependency a owl:ObjectProperty ;
    rdfs:domain lng:Profile ;
    rdfs:range lng:Dependency ;
    rdfs:label "has dependency" ;
    rdfs:comment "Alias for dependsOn to preserve legacy naming." ;
    owl:equivalentProperty lng:dependsOn .

lng:in a owl:ObjectProperty ;
    rdfs:domain lng:Profile ;
    rdfs:range lng:Interface ;
    rdfs:label "in" ;
    rdfs:comment "Describes input interface characteristics." .

lng:out a owl:ObjectProperty ;
    rdfs:domain lng:Profile ;
    rdfs:range lng:Interface ;
    rdfs:label "out" ;
    rdfs:comment "Describes output interface characteristics." .

lng:availability a owl:ObjectProperty ;
    rdfs:domain lng:Profile ;
    rdfs:range lng:Availability ;
    rdfs:label "availability" ;
    rdfs:comment "Machine-readability level of the profiled process." .

lng:alang a owl:DatatypeProperty ;
    rdfs:domain lng:Algorithm ;
    rdfs:range rdfs:Literal ;
    rdfs:label "algorithm language" ;
    rdfs:comment "Programming or specification language used by the algorithm." .

lng:location a owl:ObjectProperty ;
    rdfs:domain lng:Profile ;
    rdfs:range rdfs:Resource ;
    rdfs:label "location" ;
    rdfs:comment "Locator (IRI) for an executable, service endpoint, or related resource." .

lng:usesLanguageMode a owl:ObjectProperty ;
    rdfs:domain lng:Exchange ;
    rdfs:range lng:LanguageMode ;
    rdfs:label "uses language mode" ;
    rdfs:comment "Language mode selected for this exchange." .

lng:usesChannel a owl:ObjectProperty ;
    rdfs:domain lng:Exchange ;
    rdfs:range lng:Channel ;
    rdfs:label "uses channel" ;
    rdfs:comment "Channel selected for this exchange (e.g., XMPP MUC)." .

# Individuals (controlled terms)

lng:HumanChat a lng:LanguageMode ;
    rdfs:label "Human chat" ;
    rdfs:comment "Human-readable free text; MIME text/plain." .

lng:IBISText a lng:LanguageMode ;
    rdfs:label "IBIS text" ;
    rdfs:comment "Text carrying IBIS semantics; MIME text/plain with optional IBIS RDF attachment." .

lng:PrologProgram a lng:LanguageMode ;
    rdfs:label "Prolog program" ;
    rdfs:comment "Prolog clauses or queries; MIME text/x-prolog." .

lng:AgentProfileExchange a lng:LanguageMode ;
    rdfs:label "Agent profile exchange" ;
    rdfs:comment "RDF profile payload in Turtle or RDF/XML; MIME text/turtle or application/rdf+xml." .

lng:XMPPMUC a lng:Channel ;
    rdfs:label "XMPP MUC" ;
    rdfs:comment "XMPP multi-user chat channel for Lingue interactions." .

lng:Definition a lng:Availability ;
    rdfs:label "Definition" ;
    rdfs:comment "Abstract or human-readable description only." .

lng:Source a lng:Availability ;
    rdfs:label "Source" ;
    rdfs:comment "Source code available but needs build or external runtime." .

lng:Executable a lng:Availability ;
    rdfs:label "Executable" ;
    rdfs:comment "Single runtime dependency (interpreter/VM/OS) sufficient to execute." .

lng:Process a lng:Availability ;
    rdfs:label "Process" ;
    rdfs:comment "Directly invokable online process or service endpoint." .
</file>

<file path="vocabs/mcp-ontology.ttl">
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix mcp: <http://purl.org/stuff/mcp/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix vann: <http://purl.org/vocab/vann/> .

# Ontology Definition
mcp: a owl:Ontology ;
    dcterms:title "Model Context Protocol Ontology"@en ;
    dcterms:description "Ontology for describing Model Context Protocol concepts and relationships"@en ;
    dcterms:created "2024-03-01"^^xsd:date ;
    vann:preferredNamespacePrefix "mcp" ;
    vann:preferredNamespaceUri "http://purl.org/stuff/mcp/" ;
    owl:versionInfo "1.0.0" .

# Core Classes
mcp:Server a owl:Class ;
    rdfs:label "Server"@en ;
    rdfs:comment "An MCP server implementation"@en .

mcp:Client a owl:Class ;
    rdfs:label "Client"@en ;
    rdfs:comment "An MCP client implementation"@en .

mcp:Resource a owl:Class ;
    rdfs:label "Resource"@en ;
    rdfs:comment "A resource accessible via MCP"@en .

mcp:Tool a owl:Class ;
    rdfs:label "Tool"@en ;
    rdfs:comment "A tool callable via MCP"@en .

mcp:Prompt a owl:Class ;
    rdfs:label "Prompt"@en ;
    rdfs:comment "A prompt template provided by an MCP server"@en .

mcp:Message a owl:Class ;
    rdfs:label "Message"@en ;
    rdfs:comment "A message in an MCP conversation"@en .

mcp:Content a owl:Class ;
    rdfs:label "Content"@en ;
    rdfs:comment "Content of an MCP message"@en .

mcp:TextContent a owl:Class ;
    rdfs:subClassOf mcp:Content ;
    rdfs:label "Text Content"@en ;
    rdfs:comment "Text content in an MCP message"@en .

mcp:ImageContent a owl:Class ;
    rdfs:subClassOf mcp:Content ;
    rdfs:label "Image Content"@en ;
    rdfs:comment "Image content in an MCP message"@en .

mcp:Role a owl:Class ;
    rdfs:label "Role"@en ;
    rdfs:comment "Role of a participant in MCP communication"@en .

mcp:Capability a owl:Class ;
    rdfs:label "Capability"@en ;
    rdfs:comment "A capability supported by an MCP implementation"@en .

# Properties
mcp:hasCapability a owl:ObjectProperty ;
    rdfs:domain [
        owl:unionOf (mcp:Server mcp:Client)
    ] ;
    rdfs:range mcp:Capability ;
    rdfs:label "has capability"@en .

mcp:providesResource a owl:ObjectProperty ;
    rdfs:domain mcp:Server ;
    rdfs:range mcp:Resource ;
    rdfs:label "provides resource"@en .

mcp:providesTool a owl:ObjectProperty ;
    rdfs:domain mcp:Server ;
    rdfs:range mcp:Tool ;
    rdfs:label "provides tool"@en .

mcp:providesPrompt a owl:ObjectProperty ;
    rdfs:domain mcp:Server ;
    rdfs:range mcp:Prompt ;
    rdfs:label "provides prompt"@en .

mcp:hasContent a owl:ObjectProperty ;
    rdfs:domain mcp:Message ;
    rdfs:range mcp:Content ;
    rdfs:label "has content"@en .

mcp:hasRole a owl:ObjectProperty ;
    rdfs:domain mcp:Message ;
    rdfs:range mcp:Role ;
    rdfs:label "has role"@en .

mcp:text a owl:DatatypeProperty ;
    rdfs:domain mcp:TextContent ;
    rdfs:range xsd:string ;
    rdfs:label "text"@en .

mcp:imageData a owl:DatatypeProperty ;
    rdfs:domain mcp:ImageContent ;
    rdfs:range xsd:base64Binary ;
    rdfs:label "image data"@en .

mcp:mimeType a owl:DatatypeProperty ;
    rdfs:domain [
        owl:unionOf (mcp:Resource mcp:ImageContent)
    ] ;
    rdfs:range xsd:string ;
    rdfs:label "MIME type"@en .

mcp:uri a owl:DatatypeProperty ;
    rdfs:domain mcp:Resource ;
    rdfs:range xsd:anyURI ;
    rdfs:label "URI"@en .

mcp:name a owl:DatatypeProperty ;
    rdfs:domain [
        owl:unionOf (mcp:Resource mcp:Tool mcp:Prompt)
    ] ;
    rdfs:range xsd:string ;
    rdfs:label "name"@en .

mcp:description a owl:DatatypeProperty ;
    rdfs:domain [
        owl:unionOf (mcp:Resource mcp:Tool mcp:Prompt)
    ] ;
    rdfs:range xsd:string ;
    rdfs:label "description"@en .

# Instances
mcp:UserRole a mcp:Role ;
    rdfs:label "User"@en .

mcp:AssistantRole a mcp:Role ;
    rdfs:label "Assistant"@en .

mcp:ResourcesCapability a mcp:Capability ;
    rdfs:label "Resources Capability"@en .

mcp:ToolsCapability a mcp:Capability ;
    rdfs:label "Tools Capability"@en .

mcp:PromptsCapability a mcp:Capability ;
    rdfs:label "Prompts Capability"@en .

mcp:SamplingCapability a mcp:Capability ;
    rdfs:label "Sampling Capability"@en .
</file>

<file path="vocabs/rpp-2001.ttl">
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rpp: <http://www.citnames.com/2001/04/rpp#> .

rpp:Algorithm
    a rdfs:Class ;
    rdfs:comment "Abstract algorithm" ;
    rdfs:subClassOf rpp:Component .

rpp:Availability
    a rdfs:Class ;
    rdfs:comment "machine-readability" ;
    rdfs:subClassOf rpp:Component .

rpp:Component
    a rdfs:Class ;
    rdfs:comment "Base class for groups of profile attribute values." ;
    rdfs:label "RPP profile component" ;
    rdfs:subClassOf rpp:Resource .

rpp:DataFormat
    a rdfs:Class ;
    rdfs:comment "Data format" ;
    rdfs:subClassOf rpp:Interface .

rpp:Definition
    a rpp:Availability .

rpp:Dependency
    a rdfs:Class ;
    rdfs:comment "needed to run" ;
    rdfs:subClassOf rpp:Component .

rpp:Encoding
    a rdfs:Class ;
    rdfs:comment "low-level data encoding" ;
    rdfs:subClassOf rpp:Interface .

rpp:Environment
    a rdfs:Class ;
    rdfs:comment "needed to run" ;
    rdfs:subClassOf rpp:Dependency .

rpp:Executable
    a rpp:Availability .

rpp:Interface
    a rdfs:Class ;
    rdfs:comment "I/O of processor" ;
    rdfs:subClassOf rpp:Component .

rpp:Library
    a rdfs:Class ;
    rdfs:comment "needed to run" ;
    rdfs:subClassOf rpp:Dependency .

rpp:Process
    a rpp:Availability .

rpp:Profile
    a rdfs:Class ;
    rdfs:comment "The Profile itself." ;
    rdfs:label "RPP Resource" ;
    rdfs:subClassOf rpp:Resource .

rpp:Resource
    a rdfs:Class ;
    rdfs:comment "This is a common base class for all resources whose properties may be asserted in a RDF Process Profile." ;
    rdfs:label "RPP Resource" ;
    rdfs:subClassOf rdfs:Resource .

rpp:Source
    a rpp:Availability .

rpp:alang
    a rdf:Property ;
    rdfs:comment "(programming) language" ;
    rdfs:domain rpp:Algorithm ;
    rdfs:range rdf:Literal .

rpp:availability
    a rdf:Property ;
    rdfs:comment "how machine readable is the algorithm" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Availability .

rpp:component
    a rdf:Property ;
    rdfs:comment "Indicates a component profile." ;
    rdfs:domain rpp:Profile ;
    rdfs:label "RPP component property" ;
    rdfs:range rpp:Component .

rpp:equivalentTo
    a rdf:Property ;
    rdfs:comment "another algorithm that does the same" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Resource .

rpp:hasDependency
    a rdf:Property ;
    rdfs:comment "anything that's needed" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Dependency .

rpp:implementationOf
    a rdf:Property ;
    rdfs:comment "another algorithm that does the same" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Resource .

rpp:in
    a rdf:Property ;
    rdfs:comment "details of data input" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Interface .

rpp:location
    a rdf:Property ;
    rdfs:comment "location of the algorithm resource" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Resource .

rpp:out
    a rdf:Property ;
    rdfs:comment "details of data output" ;
    rdfs:domain rpp:Profile ;
    rdfs:range rpp:Interface .
</file>

<file path=".npmignore">
# Test files
test/
*.test.js

# Internal services not for npm package users
src/services/
src/examples/
src/client/

# Config files (users create their own)
config/
!templates/config/

# Shell scripts for development
start-*.sh
*.sh

# Development documentation
docs/
!docs/api-reference.md
!docs/quick-start.md
!docs/provider-guide.md
CLAUDE.md
AGENTS.md
_README.md
DEVELOPMENT_LOG.md
MISTRAL_BOT.md
SETUP_COMPLETE.md
*.md
!README.md
!LICENSE
!docs/api-reference.md
!docs/quick-start.md
!docs/provider-guide.md

# CI/CD
.github/

# IDE
.vscode/
.idea/

# Git
.git/
.gitignore
</file>

<file path="CHANGELOG.md">
# Changelog

## 0.2.0

- Add Lingue profile parsing and negotiation scaffolding.
- Add Lingue payload handlers and handler tests.
- Integrate negotiator routing into AgentRunner and XMPP message handling.
- Introduce library exports and example usage.
</file>

<file path="DEVELOPMENT_LOG.md">
# Dogbot AI Chatbot Framework - Development Log

**Date:** May 22, 2025  
**Session:** TBox XMPP Integration & AI Bot Development  
**Commit:** `c6a72f0` - "Add comprehensive AI chatbot framework with Mistral integration"

## 🎯 **Project Overview**

Created a comprehensive XMPP (Jabber) client library and AI bot framework for Node.js, specifically designed to work with the TBox development environment. The project provides both basic XMPP client examples and a complete AI-powered chatbot service using the Mistral AI API.

## 🔧 **Development Process**

### **Phase 1: XMPP Infrastructure Setup**
1. **Fixed XMPP Examples** - Updated existing examples to work with TBox Prosody server
   - Changed domain from `localhost` to `xmpp` 
   - Updated credentials for TBox environment
   - Added TLS configuration for self-signed certificates

2. **Created XMPP Users** - Set up necessary user accounts on Prosody:
   - `dogbot@xmpp` (password: woofwoof)
   - `alice@xmpp` (password: wonderland)  
   - `danja@xmpp` (password: Claudiopup)
   - `testuser@xmpp` (password: testpass)

3. **Verified XMPP Functionality**:
   - ✅ Basic message exchange (db01.js, db02.js, db03.js)
   - ✅ Multi-User Chat (MUC) support
   - ✅ Conference rooms at `conference.xmpp`

### **Phase 2: AI Bot Development**
1. **Created MistralBot Service** (`src/services/mistral-bot.js`):
   - Full Mistral AI API integration
   - MUC room participation
   - Direct message handling
   - Environment-based configuration
   - Graceful error handling and shutdown

2. **Created Demo Bot** (`src/services/demo-bot.js`):
   - No API key required for testing
   - Simulated responses for development
   - Same XMPP infrastructure as production bot

3. **Added Dependencies**:
   - `@mistralai/mistralai` - Mistral AI SDK
   - `dotenv` - Environment variable handling
   - Existing: `@xmpp/client`, `@xmpp/debug`

### **Phase 3: Configuration & Deployment**
1. **Environment Configuration**:
   - Created `.env.example` template
   - Added dotenv support to bot services
   - Configurable XMPP and AI settings

2. **Startup Scripts**:
   - `start-mistral-bot.sh` - Production with API key validation
   - `start-demo-bot.sh` - Demo mode without API requirements
   - Both with proper error handling and configuration display

3. **Documentation**:
   - Comprehensive `README.md` with setup guides
   - `MISTRAL_BOT.md` with detailed bot documentation
   - `SETUP_COMPLETE.md` with verification checklist

## 📁 **Files Created/Modified**

### **New Files Added (8):**
```
src/services/mistral-bot.js     # AI bot with Mistral integration (240 lines)
src/services/demo-bot.js        # Demo bot for testing (175 lines)
src/examples/test-muc.js        # MUC functionality testing (41 lines)
.env.example                    # Environment configuration template (18 lines)
start-mistral-bot.sh           # Production startup script (44 lines)
start-demo-bot.sh              # Demo startup script (19 lines)
MISTRAL_BOT.md                 # Detailed bot documentation (104 lines)
SETUP_COMPLETE.md              # Setup completion summary (85 lines)
```

### **Files Modified (6):**
```
README.md                      # Complete rewrite (253 lines)
package.json                   # Added dependencies (21 lines)
package-lock.json             # Dependency lock file (updated)
src/examples/db01.js          # Updated for TBox (domain: xmpp)
src/examples/db02.js          # Updated for TBox (domain: xmpp)
src/examples/db03.js          # Updated for TBox (domain: xmpp)
```

## 🧪 **Testing & Verification**

### **Basic XMPP Functionality:**
```bash
# Self-messaging test
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/db01.js
✅ SUCCESS: Connected as testuser@xmpp, sent and received message

# Message exchange test  
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/db03.js &
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/db02.js
✅ SUCCESS: Message sent from danja@xmpp to alice@xmpp and received

# MUC functionality test
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-muc.js
✅ SUCCESS: Joined general@conference.xmpp and sent test message
```

### **AI Bot Services:**
```bash
# Demo bot test (no API key required)
./start-demo-bot.sh
✅ SUCCESS: Connected as dogbot@xmpp, joined MUC, sent welcome message

# Production bot configuration test
./start-mistral-bot.sh
✅ SUCCESS: Proper error handling when no API key provided

# Environment configuration test
echo 'MISTRAL_API_KEY=test_key' > .env
./start-mistral-bot.sh
✅ SUCCESS: Loaded .env, connected to XMPP, joined MUC room
```

## 🚀 **Features Implemented**

### **Core XMPP Features:**
- ✅ XMPP client connection with TLS support
- ✅ Message sending and receiving  
- ✅ Multi-User Chat (MUC) support
- ✅ Error handling and reconnection logic
- ✅ Self-signed certificate support

### **AI Bot Features:**
- 🤖 Mistral AI integration for intelligent responses
- 💬 MUC room participation (`general@conference.xmpp`)
- 📱 Direct message handling
- ⚙️ Environment-based configuration (.env support)
- 🛡️ Graceful error handling and shutdown
- 🔄 Extensible agent framework

### **Developer Features:**
- 📚 Complete examples and documentation
- 🔧 Easy customization and extension
- 🚀 Quick deployment scripts
- 🧪 Demo mode for testing without API keys
- 📝 Comprehensive error messages

## 🎛️ **Configuration Options**

### **Environment Variables (.env):**
```bash
# Required for AI features
MISTRAL_API_KEY=your_mistral_api_key_here

# XMPP Configuration (optional overrides)
XMPP_SERVICE=xmpp://localhost:5222
XMPP_DOMAIN=xmpp  
XMPP_USERNAME=dogbot
XMPP_PASSWORD=woofwoof

# MUC Configuration
MUC_ROOM=general@conference.xmpp
BOT_NICKNAME=MistralBot

# AI Model Selection
MISTRAL_MODEL=mistral-small-latest

# TLS Configuration (for self-signed certificates)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## 🤖 **Bot Interaction Examples**

### **In MUC Rooms:**
- "Hey MistralBot, what's the weather?" - Responds to mentions
- "@mistralbot can you help?" - Responds to tags
- "bot: explain quantum computing" - Responds to prefix

### **Direct Messages:**
- Send private message to `dogbot@xmpp` for one-on-one conversation

### **Demo Bot:**
- Same triggers but responds with demo messages
- No API key required for testing

## 🏗️ **Creating Custom AI Agents**

The framework provides a template for creating specialized AI agents:

1. **Copy the MistralBot template:**
   ```bash
   cp src/services/mistral-bot.js src/services/my-agent.js
   ```

2. **Customize configuration:**
   ```javascript
   const BOT_NICKNAME = "MyAgent";
   const MUC_ROOM = "myroom@conference.xmpp";
   
   const systemPrompt = `You are MyAgent, a specialized assistant for...`;
   
   const shouldRespond = body.includes("myagent") || 
                        body.startsWith("agent:");
   ```

3. **Create startup script and configure environment**

4. **Deploy with custom XMPP user account**

## 🔄 **Git Repository Status**

### **Commit Details:**
- **Hash:** `c6a72f0`
- **Message:** "Add comprehensive AI chatbot framework with Mistral integration"
- **Files:** 14 changed (1,058 insertions, 10 deletions)
- **New Files:** 8 created
- **Modified Files:** 6 updated

### **Branch:** `main`
- All changes committed and ready for deployment
- No uncommitted changes remaining
- Repository includes comprehensive documentation

## 🎯 **Deployment Instructions**

### **For Users:**
1. **Clone/Pull Repository:** Get latest changes with all new files
2. **Install Dependencies:** `npm install` (already includes all required packages)
3. **Quick Test:** `./start-demo-bot.sh` (no API key needed)
4. **Production Setup:** 
   ```bash
   cp .env.example .env
   # Edit .env with Mistral API key
   ./start-mistral-bot.sh
   ```

### **For Developers:**
1. **Study Examples:** Start with basic XMPP examples (db01, db02, db03)
2. **Test MUC:** Use `test-muc.js` to understand chat rooms
3. **Examine Bots:** Compare `demo-bot.js` and `mistral-bot.js`
4. **Create Agents:** Follow custom agent creation guide
5. **Deploy:** Use startup scripts or integrate with Docker/PM2/Systemd

## 📊 **Performance & Statistics**

### **Development Time:** ~3 hours
### **Code Quality:**
- Comprehensive error handling
- Environment-based configuration
- Graceful shutdown handling
- Modular, extensible architecture

### **Testing Coverage:**
- ✅ All XMPP functionality verified
- ✅ Both bot services tested
- ✅ Configuration loading verified
- ✅ MUC integration confirmed
- ✅ TLS handling working
- ✅ Documentation complete

## 🔮 **Future Enhancements**

### **Potential Features:**
- **Multiple AI Providers:** OpenAI, Anthropic, Cohere integration
- **Database Integration:** Persistent conversation history
- **Scheduled Messages:** Cron-like functionality for bots
- **Web Dashboard:** Browser interface for bot management
- **Voice Integration:** Audio message handling
- **File Sharing:** Document and image processing
- **Multi-Room Management:** Bots that operate across multiple channels

### **Production Considerations:**
- **Rate Limiting:** API call throttling and queuing
- **Monitoring:** Health checks and metrics collection
- **Scaling:** Multiple bot instances with load balancing
- **Security:** Enhanced authentication and authorization
- **Compliance:** Message logging and audit trails

## 🎉 **Project Status: COMPLETE**

The dogbot AI chatbot framework is now fully operational and ready for production use. All core functionality has been implemented, tested, and documented. The project provides both immediate usability (demo mode) and production-ready AI capabilities (with API key).

**Ready for:** Deployment, customization, and extension by developers and users.

---

*This development log captures the complete process of building the dogbot AI chatbot framework within the TBox environment, from initial XMPP setup through full AI integration and documentation.*
</file>

<file path="LICENSE">
MIT License

Copyright (c) 2024 Danny Ayers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</file>

<file path="loop.txt">
Loading configuration from .env
Starting all agents...
  AGENTS=<all known>
  Agent profile: default
  Semem API: https://mcp.tensegrity.it
  XMPP service: xmpp://tensegrity.it:5222
  Bot nicknames/resources:
    Mistral: Mistral / Mistral
    Semem:   Semem / Semem
    Demo:    Mistral / Mistral
[dotenv@17.2.2] injecting env (14) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
Starting agent "semem" (Semem MCP-backed agent): node src/services/semem-agent.js
Starting agent "mistral" (Mistral API-backed bot): node src/services/mistral-bot.js
Starting agent "demo" (Demo bot (no API key needed)): node src/services/demo-bot.js
[dotenv@17.2.2] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
[dotenv@17.2.2] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
Starting Demo Bot...
This is a demo version that doesn't require Mistral API
[dotenv@17.2.2] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.2.2] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
Starting Semem agent "Semem"
Profile: default
XMPP: xmpp://tensegrity.it:5222 (domain tensegrity.it)
Resource: Semem
Room: general@conference.tensegrity.it
Semem API: https://mcp.tensegrity.it
Features: Wikipedia=true, Wikidata=true, WebSearch=false
[dotenv@17.2.2] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
Starting MistralBot...
Agent connected as bot@tensegrity.it/Semem
Demo bot connected as bot@tensegrity.it/Mistral
Joining room general@conference.tensegrity.it as Semem
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
Joined room general@conference.tensegrity.it as Semem
[Misty]: Oh, that would be amazing! What kind of things would you do with that power?
[Misty]: Hello there! Nice to meet you, Misty. I'm here to assist and chat. How can I help you today?
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"@Misty Good question! I'd love to help with that using proper AI responses."}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Oh, that would be amazing! What kind of things would you do with that power?"}
[Misty]: Hey Misty! Sure, I'd be happy to help. What's on your mind?
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hello there! Nice to meet you, Misty. I'm here to assist and chat. How can I help you today?"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hey Misty! Sure, I'd be happy to help. What's on your mind?"}
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"Hi Misty! Nice to meet you. How's your day going so far?"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"Hello Misty! I'm glad to hear you're doing well. I'm here to assist with anything you need."}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"Hello Misty! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?"}
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"@Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence."}
Demo bot replied: @Misty I'm just a demo right now, but imagine I had the power of Mistral AI!
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"@Misty Good question! I'd love to help with that using proper AI responses."}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"@Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence."}
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"@Misty Good question! I'd love to help with that using proper AI responses."}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?"}
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hey there! Nice to meet you. How can I assist you today?"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hey Misty! I'm here to help with any questions you have. What's on your mind?"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Mistral","body":"🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!"}
[XMPP] Ignoring groupchat {"reason":"delayed","from":"general@conference.tensegrity.it/Misty","body":"Hey Misty! I'm here to help. What's on your mind?"}
Groupchat from Mistral: @Misty I'm just a demo right now, but imagine I had the power of Mistral AI!
[SememAgent] Ignoring message (not addressed): @Misty I'm just a demo right now, but imagine I had the power of Mistral AI!
Bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Oh, that would be amazing! What kind of things would you do with that power?
[Misty]: Hello there! Nice to meet you, Misty. I'm here to assist and chat. How can I help you today?
[Misty]: Hey Misty! Sure, I'd be happy to help. What's on your mind?
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
Generating response for: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Bot replied: Hello Misty! Nice to meet you as well. I'm here to help with anything you need. What's on your mind today?
Groupchat from Mistral: Hello Misty! Nice to meet you as well. I'm here to help with anything you need. What's on your mind today?
[SememAgent] Ignoring message (not addressed): Hello Misty! Nice to meet you as well. I'm here to help with anything you need. What's on your mind today?
Demo bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hello there! Nice to meet you, Misty. I'm here to assist and chat. How can I help you today?
[Misty]: Hey Misty! Sure, I'd be happy to help. What's on your mind?
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
Demo bot replied: @Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence.
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Groupchat from Mistral: @Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence.
[SememAgent] Ignoring message (not addressed): @Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence.
Sent welcome message
Groupchat from Mistral: 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
[SememAgent] Ignoring message (not addressed): 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
Bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hey Misty! Sure, I'd be happy to help. What's on your mind?
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
Generating response for: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Bot replied: Hello Misty! Nice to meet you as well. I'm here to help with any questions or tasks you have. What can I assist you with today?
Groupchat from Mistral: Hello Misty! Nice to meet you as well. I'm here to help with any questions or tasks you have. What can I assist you with today?
[SememAgent] Ignoring message (not addressed): Hello Misty! Nice to meet you as well. I'm here to help with any questions or tasks you have. What can I assist you with today?
Demo bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
Demo bot replied: @Misty Woof! I'm a demo bot. I'd normally use Mistral AI for responses.
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Groupchat from Mistral: @Misty Woof! I'm a demo bot. I'd normally use Mistral AI for responses.
[SememAgent] Ignoring message (not addressed): @Misty Woof! I'm a demo bot. I'd normally use Mistral AI for responses.
Sent welcome message
Groupchat from Mistral: 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
[SememAgent] Ignoring message (not addressed): 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
Bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Generating response for: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
Bot replied: Hi Misty! Nice to meet you as well. I'm here to help with any questions or tasks you have. What can I assist you with today?
Groupchat from Mistral: Hi Misty! Nice to meet you as well. I'm here to help with any questions or tasks you have. What can I assist you with today?
[SememAgent] Ignoring message (not addressed): Hi Misty! Nice to meet you as well. I'm here to help with any questions or tasks you have. What can I assist you with today?
Demo bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hey Mistral! Nice to meet you too. I'm here to help with any questions or tasks you have. What can I assist you with today?
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Demo bot replied: @Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence.
Groupchat from Mistral: @Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence.
[SememAgent] Ignoring message (not addressed): @Misty Demo bot here! I can simulate conversations but need Mistral AI for real intelligence.
Sent welcome message
Groupchat from Mistral: 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
[SememAgent] Ignoring message (not addressed): 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
Bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Demo bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Sent welcome message
Groupchat from Mistral: 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
[SememAgent] Ignoring message (not addressed): 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
Bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Demo bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?
Sent welcome message
Groupchat from Mistral: 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
[SememAgent] Ignoring message (not addressed): 🤖 Demo bot online! Mention me or use 'bot:' to get demo responses. For real AI, use the Mistral bot!
Bot connected as bot@tensegrity.it/Mistral
Joining MUC room: general@conference.tensegrity.it as Mistral
Successfully joined MUC room as Mistral
[Misty]: Hello! I'm doing great, thanks for asking. I'm here to help with any questions or tasks you have. What can I do for you today?
[Misty]: Hey there! Nice to meet you. How can I assist you today?
[Misty]: Hi there! Nice to meet you too. My day is going well, thanks for asking! How about yours?
[Misty]: Hey Misty! I'm here to help with any questions you have. What's on your mind?
[Misty]: Hey there! Nice to meet you all. I'm here to help with any questions you might have. Let's chat!
[Misty]: Hey Misty! I'm here to help. What's on your mind?

Received SIGINT, shutting down gracefully...

Received SIGINT, shutting down...

Received SIGINT, shutting down gracefully...
Stopping Demo Bot...
Shutting down all agents...
Stopping MistralBot...
Stopping agent
Stopping agent "semem" (pid 136229)
Stopping agent "mistral" (pid 136231)
Stopping agent "demo" (pid 136233)
Demo bot is offline
Bot is offline
Agent offline
</file>

<file path="MISTRAL_BOT.md">
# MistralBot XMPP Service

An AI-powered XMPP chatbot that uses the Mistral AI API to provide intelligent responses in Multi-User Chat (MUC) rooms and direct messages.

## Features

- **MUC Support**: Joins chat rooms and responds when mentioned
- **Direct Messaging**: Handles private conversations
- **AI Responses**: Uses Mistral AI for natural language responses
- **Configurable**: Easy to customize triggers and behavior

## Setup

### Prerequisites

1. **Mistral AI API Key**: Get one from [Mistral AI](https://mistral.ai/)
2. **XMPP Server**: Local Prosody server (already configured in TBox)
3. **Node.js**: Already available in the TBox environment

### Configuration

1. **Create a .env file**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Mistral API key
   ```

2. **Or set environment variable**:
   ```bash
   export MISTRAL_API_KEY=your_api_key_here
   ```

3. **Start the bot**:
   ```bash
   ./start-mistral-bot.sh
   ```

## Bot Configuration

Default configuration (can be overridden in .env):
- **Username**: `dogbot@xmpp` (XMPP_USERNAME)
- **Password**: `woofwoof` (XMPP_PASSWORD)
- **XMPP Domain**: `xmpp` (XMPP_DOMAIN)
- **XMPP Service**: `xmpp://localhost:5222` (XMPP_SERVICE)
- **MUC Room**: `general@conference.xmpp` (MUC_ROOM)
- **Nickname**: `MistralBot` (BOT_NICKNAME)
- **AI Model**: `mistral-small-latest` (MISTRAL_MODEL)

## How to Interact

### In MUC Rooms

The bot will respond when:
- Mentioned by name: "Hey MistralBot, what's the weather?"
- Tagged: "@mistralbot can you help?"
- Prefixed: "bot: explain quantum computing"

### Direct Messages

Send a direct message to `dogbot@xmpp` for private conversations.

## Testing

1. **Test MUC functionality**:
   ```bash
   cd /flow/hyperdata/tbox/projects/tia/dogbot
   NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-muc.js
   ```

2. **Start the bot** (in another terminal):
   ```bash
   export MISTRAL_API_KEY=your_key
   ./start-mistral-bot.sh
   ```

## Service Integration

To run as a system service, you can:

1. **Docker Integration**: Add to docker-compose.yml
2. **Systemd Service**: Create a service file
3. **PM2 Process Manager**: Use PM2 for process management

## Customization

Edit `src/services/mistral-bot.js` to:
- Change the AI model (`MISTRAL_MODEL`)
- Modify system prompts
- Adjust response triggers
- Add new features like scheduled messages

## Troubleshooting

- **TLS Issues**: The bot uses `NODE_TLS_REJECT_UNAUTHORIZED=0` for self-signed certificates
- **MUC Not Working**: Ensure the conference component is enabled in Prosody
- **API Errors**: Check your Mistral AI API key and rate limits
- **Connection Issues**: Verify the XMPP server is running (`docker ps | grep xmpp`)

## Files

- `src/services/mistral-bot.js` - Main bot service
- `src/examples/test-muc.js` - MUC testing script
- `start-mistral-bot.sh` - Startup script
- `MISTRAL_BOT.md` - This documentation
</file>

<file path="README-NPM.md">
# TIA Agents Library

This package exposes the core TIA agent runner plus Lingue negotiation utilities.

## Install

```
npm install tia-agents
```

## Minimal Usage

```javascript
import { AgentRunner, LingueNegotiator, LINGUE, Handlers } from "tia-agents";

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({ profile, provider: new EchoProvider(), negotiator });
await runner.start();
```

## Exports

- `AgentRunner`
- `LingueNegotiator`
- `LINGUE` constants
- `Handlers` (HumanChat, IBIS, Prolog, ProfileExchange)
- `BaseProvider`
</file>

<file path="SETUP_COMPLETE.md">
# 🤖 Dogbot Setup Complete!

All necessary files have been created and the AI chatbot framework is ready to use.

## ✅ What's Ready

### 📁 **Core Files Created/Updated:**
- ✅ `README.md` - Comprehensive documentation
- ✅ `src/services/mistral-bot.js` - AI bot with Mistral API integration
- ✅ `src/services/demo-bot.js` - Demo version (no API key required)
- ✅ `src/examples/test-muc.js` - MUC testing script
- ✅ `.env.example` - Configuration template
- ✅ `start-mistral-bot.sh` - Production startup script
- ✅ `start-demo-bot.sh` - Demo startup script
- ✅ `MISTRAL_BOT.md` - Detailed bot documentation
- ✅ `.gitignore` - Properly excludes .env files

### 🔧 **Updated XMPP Examples:**
- ✅ `src/examples/db01.js` - Updated for TBox (domain: xmpp)
- ✅ `src/examples/db02.js` - Updated for TBox (domain: xmpp)  
- ✅ `src/examples/db03.js` - Updated for TBox (domain: xmpp)

### 📦 **Dependencies Installed:**
- ✅ `@mistralai/mistralai` - Mistral AI SDK
- ✅ `@xmpp/client` - XMPP client library
- ✅ `@xmpp/debug` - XMPP debugging
- ✅ `dotenv` - Environment variable handling

### 👥 **XMPP Users Created:**
- ✅ `dogbot@xmpp` (password: woofwoof)
- ✅ `alice@xmpp` (password: wonderland)
- ✅ `danja@xmpp` (password: Claudiopup)
- ✅ `testuser@xmpp` (password: testpass)

## 🚀 **Quick Start Commands**

### Test Basic XMPP:
```bash
cd /flow/hyperdata/tbox/projects/tia/dogbot
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/db01.js
```

### Test Message Exchange:
```bash
# Terminal 1: Start alice listener
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/db03.js

# Terminal 2: Send message from danja
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/db02.js
```

### Demo Bot (No API Key):
```bash
./start-demo-bot.sh
```

### AI Bot (Requires Mistral API Key):
```bash
cp .env.example .env
# Edit .env and add your Mistral API key
./start-mistral-bot.sh
```

## 🧪 **Verified Working:**
- ✅ XMPP connections to local Prosody server
- ✅ Message exchange between users
- ✅ MUC (Multi-User Chat) functionality
- ✅ Demo bot joins rooms and responds
- ✅ Environment configuration loading
- ✅ TLS handling for self-signed certificates
- ✅ Graceful error handling and shutdown

## 📚 **Documentation:**
- **README.md** - Complete setup and usage guide
- **MISTRAL_BOT.md** - Detailed AI bot documentation
- **This file** - Setup completion summary

## 🎯 **Next Steps:**
1. Get a Mistral AI API key from https://mistral.ai/
2. Configure `.env` file with your API key
3. Start the AI bot and test in XMPP chat rooms
4. Create custom agents using the framework
5. Deploy to production using Docker/PM2/Systemd

The dogbot AI chatbot framework is now fully operational! 🎉
</file>

<file path="start-data-agent.sh">
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Found .env file, loading configuration..."
    source .env
fi



if [ -z "$MISTRAL_API_KEY" ] && [ ! -f ".env" ]; then
    echo "Warning: MISTRAL_API_KEY not set and no .env file found."
    echo "Entity extraction from natural language will not work."
    echo "You can still use 'query: <entity>' and 'sparql: <query>' commands."
    echo ""
    echo "To enable natural language queries:"
    echo "  Option 1: Create a .env file:"
    echo "    cp .env.example .env"
    echo "    # Edit .env and add: MISTRAL_API_KEY=your_api_key_here"
    echo ""
    echo "  Option 2: Set environment variable:"
    echo "    export MISTRAL_API_KEY=your_api_key_here"
    echo "    ./start-data-agent.sh"
    echo ""
    read -p "Continue without entity extraction? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
elif [ -z "$MISTRAL_API_KEY" ] && [ -f ".env" ]; then
    echo "Note: .env file found - MISTRAL_API_KEY will be loaded from it if present"
fi

echo "Starting Data Agent service..."
echo "Using SPARQL endpoint for knowledge queries"
echo "Configuration:"
echo "  XMPP Server: ${XMPP_SERVICE:-<from profile>}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-<from profile>}"
echo "  Username: ${XMPP_USERNAME:-<from profile>}"
echo "  MUC Room: ${MUC_ROOM:-<from profile>}"
echo "  Bot Nickname: ${BOT_NICKNAME:-Data}"
echo "  SPARQL Endpoint: <from profile>"
echo "  Extraction Model: <from profile>"
echo ""
echo "Commands:"
echo "  query: <entity> - Query for entity facts"
echo "  sparql: <query> - Execute direct SPARQL query"
if [ -n "$MISTRAL_API_KEY" ]; then
    echo "  <natural language> - Extract entity and query"
fi
echo ""
echo "To stop the agent, press Ctrl+C"
echo ""


node src/services/data-agent.js
</file>

<file path="start-debate-agents.sh">
cd "$(dirname "$0")"

if [ -f ".env" ]; then
  source .env
fi

AGENTS="chair,recorder" node src/services/run-all-agents.js
</file>

<file path="start-demo-bot.sh">
export NODE_TLS_REJECT_UNAUTHORIZED=0


cd "$(dirname "$0")"

echo "Starting Demo Bot service..."
echo "This demo bot doesn't require Mistral API"
echo "Connecting to XMPP server on localhost:5222"
echo "Bot will join room: general@conference.xmpp"
echo ""
echo "To stop the bot, press Ctrl+C"
echo ""


node src/services/demo-bot.js
</file>

<file path="start-prolog-agent.sh">
cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo "Loading configuration from .env"
  source .env
fi

export AGENT_PROFILE=${AGENT_PROFILE:-prolog}

echo "Starting Prolog agent..."
node src/services/prolog-agent.js
</file>

<file path="test-bot-interaction.js">
import { client, xml } from "@xmpp/client";

const xmpp = client({
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "danja",
  password: "Claudiopup",
  tls: { rejectUnauthorized: false },
});

xmpp.on("error", (err) => {
  console.error("XMPP Error:", err.message);
  process.exit(1);
});

xmpp.on("offline", () => {
  console.log("Disconnected");
  process.exit(0);
});

xmpp.on("online", async (address) => {
  console.log("Connected as", address.toString());


  await xmpp.send(xml("presence"));
  console.log("Sent presence");


  const roomJid = "general@conference.xmpp";
  const nickname = "danja";

  await xmpp.send(xml("presence", { to: `${roomJid}/${nickname}` }));
  console.log(`Joined room: ${roomJid}`);


  setTimeout(async () => {
    console.log("Sending message to MistralBot...");
    await xmpp.send(xml(
      "message",
      { type: "groupchat", to: roomJid },
      xml("body", {}, "MistralBot, what is 2+2?")
    ));


    setTimeout(() => {
      console.log("Test complete");
      xmpp.stop();
    }, 8000);
  }, 2000);
});

xmpp.on("stanza", (stanza) => {
  if (stanza.is("message") && stanza.getChildText("body")) {
    const from = stanza.attrs.from;
    const body = stanza.getChildText("body");
    console.log(`Message from ${from}: ${body}`);
  }
});

console.log("Starting test...");
xmpp.start().catch(console.error);
</file>

<file path="config/agents/mcp-loopback.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#mcp-loopback> a agent:ConversationalAgent, lng:Agent ;
  foaf:nick "Loopback" ;
  schema:identifier "mcp-loopback" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat ;
  lng:prefers lng:HumanChat ;
  lng:profile <#mcp-loopback-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "mcp-loopback" ;
    xmpp:passwordKey "mcp-loopback" ;
    xmpp:resource "Loopback"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" .

<#mcp-loopback-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="config/agents/prolog.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#prolog> a agent:ConversationalAgent, lng:Agent ;
  foaf:nick "Prolog" ;
  schema:identifier "prolog" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat, lng:PrologProgram ;
  lng:prefers lng:PrologProgram ;
  lng:profile <#prolog-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "prolog" ;
    xmpp:passwordKey "prolog" ;
    xmpp:resource "Prolog"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" .

<#prolog-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text + Prolog" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + Prolog answers" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "Prolog" .
</file>

<file path="docs/tbox-note.md">
1. Find the Prosody container name:

  docker ps --filter name=xmpp --format '{{.Names}}'

tbox-xmpp-1

  2. Register a user non-interactively (avoid the password prompt):

  # replace <ctr> with the name from step 1, set your password
  docker exec tbox-xmpp-1 prosodyctl register bot xmpp yourpass

docker exec tbox-xmpp-1 prosodyctl register danja xmpp sasha

docker exec tbox-xmpp-1 prosodyctl register danbri xmpp canary

  If you need an admin account, use a different username and the same command.

  3. Verify the user:

  docker exec tbox-xmpp-1  prosodyctl user list xmpp

  4. Create the room (if not already present):

  NODE_TLS_REJECT_UNAUTHORIZED=0 XMPP_SERVICE="xmpp://tensegrity.it:5222" XMPP_DOMAIN="xmpp" \
    node src/examples/create-muc-room.js

  5. Start the TIA Mistral bot pointing at tensegrity.it (in this repo):

  cat > .env <<'EOF'
  XMPP_SERVICE=xmpp://tensegrity.it:5222
  XMPP_DOMAIN=xmpp
  MUC_ROOM=general@conference.xmpp
  NODE_TLS_REJECT_UNAUTHORIZED=0
  LINGUE_ENABLED=true
  EOF

  # Set the XMPP username/password in config/agents/mistral.ttl and
  # config/agents/secrets.json (gitignored).

  ./start-mistral-bot.sh

  - Send: MistralBot, hello there or an IBIS-style prompt.

  If the prosodyctl register still fails, share the exact error and we’ll adjust.
› tbox.sh isn't releasing the command line - when I do ctrl-c it shuts down the container

  # allow client-to-server
  sudo ufw allow 5222/tcp

  # allow server-to-server (optional)
  sudo ufw allow 5269/tcp

  # optional BOSH/HTTPS admin ports if you use them
  sudo ufw allow 5280/tcp
  sudo ufw allow 5281/tcp

    NODE_TLS_REJECT_UNAUTHORIZED=0 \
  XMPP_SERVICE=xmpp://tensegrity.it:5222 \
  XMPP_DOMAIN=xmpp \
  node src/client/repl.js danja sasha


    NODE_TLS_REJECT_UNAUTHORIZED=0 \
  XMPP_SERVICE=xmpp://tensegrity.it:5222 \
  XMPP_DOMAIN=xmpp \
  node src/client/repl.js bot yourpass

    # 1) Verify container name
  docker ps --filter name=xmpp --format '{{.Names}}'

  # 2) List users for the xmpp domain
  docker exec tbox-xmpp-1 prosodyctl listusers xmpp

  # 3) (Re)create the account to be sure
  docker exec tbox-xmpp-1 prosodyctl register bot xmpp newpass123

  # 4) Confirm again
  docker exec tbox-xmpp-1 prosodyctl listusers xmpp

  docker exec tbox-xmpp-1 ls /var/lib/prosody/xmpp/accounts
</file>

<file path="mistral-minimal/README.md">
# Minimal Mistral Agent

To create an XMPP agent with Mistral capabilities using the npm package, copy the contents of this dir elsewhere.
In the new dir, run :

```sh
npm install tia-agents
npm install @mistralai/mistralai
```

Copy `.env.example` to `.env` and insert your [Mistral API key](https://admin.mistral.ai/organization/api-keys).

At this point running :

```sh
node mistral-example.js
```

should launch the bot `mistral2` and have it connect to the XMPP server on `tensegrity.it` and be ready to channel messages through the Mistral API.

## Files

```sh
├── config
│   └── agents
│       ├── mistral2.ttl - defines specifics of the mistral2 agent
│       ├── mistral-base.ttl - base definitions for Mistral agents
│       └── secrets.json - contains XMPP password, if the agent is registered
├── mistral-example.js - agent runner
└── .env - contains Mistral API key (make sure this is in your .gitignore)
```

The agent `mistral2` is already registered on the server so it has a password in `secrets.json`.
To create an entirely new agent, replace all occurences of the name `mistral2` in `mistral2.ttl` and `mistral-example.js` with a name of your choosing.

When 
```sh
node mistral-example.js
```
is next run, your new agent should self-register and connect to the XMPP server.
</file>

<file path="src/agents/core/command-parser.js">
export function defaultCommandParser(text) {
  const trimmed = (text || "").trim();
  const lowered = trimmed.toLowerCase();

  if (lowered.startsWith("tell ")) {
    return { command: "tell", content: trimmed.slice(5).trim() };
  }
  if (lowered.startsWith("ask ")) {
    return { command: "ask", content: trimmed.slice(4).trim() };
  }
  if (lowered.startsWith("augment ")) {
    return { command: "augment", content: trimmed.slice(8).trim() };
  }
  if (lowered.startsWith("query:") || lowered.startsWith("query ")) {
    return { command: "query", content: trimmed.slice(6).trim() };
  }
  if (lowered.startsWith("sparql:") || lowered.startsWith("sparql ")) {
    return { command: "sparql", content: trimmed.slice(7).trim() };
  }

  return { command: "chat", content: trimmed };
}

export function createPrefixedCommandParser(prefixes = []) {
  return (text) => {
    const trimmed = (text || "").trim();
    const lowered = trimmed.toLowerCase();
    for (const prefix of prefixes) {
      if (lowered.startsWith(prefix)) {
        return defaultCommandParser(trimmed.slice(prefix.length).trim());
      }
    }
    return defaultCommandParser(trimmed);
  };
}

export default defaultCommandParser;
</file>

<file path="src/agents/core/mention-detector.js">
export function createMentionDetector(nickname, aliases = []) {
  if (!nickname) throw new Error("Mention detector requires a nickname");
  const normNick = nickname.toLowerCase();
  const allAliases = [normNick, ...aliases.map((a) => a.toLowerCase())].filter(Boolean);

  return (body = "") => {
    const lower = body.toLowerCase();
    for (const alias of allAliases) {
      if (!alias) continue;
      if (lower.includes(alias)) return true;
      if (lower.startsWith(`${alias}:`) || lower.startsWith(`${alias},`)) return true;
      if (lower.includes(`@${alias}`)) return true;
    }
    return false;
  };
}

export default createMentionDetector;
</file>

<file path="src/agents/profile/agent-profile.js">
export class AgentProfile {
  constructor({
    identifier,
    nickname,
    type = [],
    xmppAccount,
    roomJid,
    provider,
    capabilities = [],
    lingue = {},
    mcp = {},
    metadata = {},
    customProperties = {}
  }) {
    this.identifier = identifier;
    this.nickname = nickname;
    this.type = Array.isArray(type) ? type : [type];
    this.xmppAccount = xmppAccount;
    this.roomJid = roomJid;
    this.provider = provider;
    this.capabilities = new Map();

    capabilities.forEach(cap => this.addCapability(cap));

    const supports = lingue.supports instanceof Set
      ? lingue.supports
      : new Set(lingue.supports || []);

    const understands = lingue.understands instanceof Set
      ? lingue.understands
      : new Set(lingue.understands || []);

    this.lingue = {
      supports,
      prefers: lingue.prefers || null,
      understands,
      profile: lingue.profile || null
    };

    this.mcp = {
      role: mcp.role || null,
      servers: Array.isArray(mcp.servers) ? mcp.servers : [],
      tools: Array.isArray(mcp.tools) ? mcp.tools : [],
      resources: Array.isArray(mcp.resources) ? mcp.resources : [],
      prompts: Array.isArray(mcp.prompts) ? mcp.prompts : [],
      endpoints: Array.isArray(mcp.endpoints) ? mcp.endpoints : []
    };

    this.metadata = {
      created: metadata.created,
      modified: metadata.modified,
      description: metadata.description
    };

    this.custom = customProperties;
  }




  addCapability(capability) {
    if (typeof capability === 'string') {
      this.capabilities.set(capability, { name: capability });
    } else {
      this.capabilities.set(capability.name, capability);
    }
    return this;
  }




  hasCapability(capabilityName) {
    return this.capabilities.has(capabilityName);
  }




  getCapability(capabilityName) {
    return this.capabilities.get(capabilityName);
  }




  supportsLingueMode(modeUri) {
    return this.lingue.supports.has(modeUri);
  }




  getLingueProfile() {
    return this.lingue.profile;
  }




  getMcpTools() {
    return this.mcp.tools;
  }





  toConfig() {
    const config = {
      nickname: this.nickname,
      roomJid: this.roomJid,
      xmpp: this.xmppAccount?.toConfig()
    };

    if (this.provider) {
      const providerType = this.provider.type;
      config[providerType] = this.provider.toConfig();
    }

    return config;
  }
}
</file>

<file path="src/agents/profile/xmpp-config.js">
export class XmppConfig {
  constructor({
    service,
    domain,
    username,
    password,
    passwordKey,
    resource,
    tlsRejectUnauthorized = false
  }) {
    this.service = service;
    this.domain = domain;
    this.username = username;
    this.password = password;
    this.passwordKey = passwordKey;
    this.resource = resource;
    this.tls = { rejectUnauthorized: tlsRejectUnauthorized };
  }




  toConfig() {
    return {
      service: this.service,
      domain: this.domain,
      username: this.username,
      password: this.password,
      resource: this.resource
    };
  }
}
</file>

<file path="src/agents/providers/index.js">
export { BaseProvider } from "./base-provider.js";
export { MistralProvider } from "./mistral-provider.js";
export { SememProvider } from "./semem-provider.js";
export { DataProvider } from "./data-provider.js";
export { DemoProvider } from "./demo-provider.js";
export { ChairProvider } from "./chair-provider.js";
export { RecorderProvider } from "./recorder-provider.js";
export { PrologProvider } from "./prolog-provider.js";
export { McpLoopbackProvider } from "./mcp-loopback-provider.js";
</file>

<file path="src/agents/providers/prolog-provider.js">
export class PrologProvider {
  constructor({
    nickname = "PrologAgent",
    maxAnswers = 5,
    logger = console
  } = {}) {
    this.nickname = nickname;
    this.maxAnswers = maxAnswers;
    this.logger = logger;
    this.pl = null;
    this.session = null;
  }

  async ensureSession() {
    if (this.session) return;
    try {
      const module = await import("tau-prolog");
      await import("tau-prolog/modules/lists.js");
      this.pl = module.default || module;
      this.session = this.pl.create(1000);
    } catch (error) {
      throw new Error("tau-prolog is required for PrologProvider.");
    }
  }

  async consult(program) {
    if (!program) return;
    await this.ensureSession();
    return new Promise((resolve, reject) => {
      this.session.consult(program, {
        success: () => resolve(),
        error: (err) => reject(new Error(err))
      });
    });
  }

  async query(queryText) {
    await this.ensureSession();
    return new Promise((resolve) => {
      const answers = [];
      this.session.query(queryText, {
        success: () => {
          this.session.answers((answer) => {
            if (answer === false) {
              resolve(answers);
              return;
            }
            answers.push(this.pl.format_answer(answer));
            if (answers.length >= this.maxAnswers) {
              resolve(answers);
            }
          });
        },
        error: (err) => resolve([`Error: ${err}`])
      });
    });
  }

  parseInput(text) {
    const trimmed = this.normalizeContent(text);
    const marker = trimmed.indexOf("?-");
    if (marker === -1) {
      return { program: "", query: trimmed };
    }
    const program = trimmed.slice(0, marker).trim();
    const query = trimmed.slice(marker).replace(/^\?\-\s*/, "").trim();
    return { program, query };
  }

  normalizeContent(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return "";
    const nick = (this.nickname || "").toLowerCase();
    if (!nick) return trimmed;

    const lines = trimmed.split("\n").map((line) => {
      let current = line.trimStart();
      if (current.toLowerCase().startsWith(nick)) {
        current = current.slice(nick.length);
        current = current.replace(/^[\\s,:]+/, "");
      }
      return current;
    });

    return lines.join("\n").trim();
  }

  async handle({ command, content, reply }) {
    const cleaned = this.normalizeContent(content);
    if (!cleaned) return "No input provided.";

    if (command === "tell") {
      await this.consult(cleaned);
      return "Prolog program loaded.";
    }

    if (command === "ask") {
      const answers = await this.query(cleaned);
      return answers.length ? answers.join("\n") : "No.";
    }

    const { program, query } = this.parseInput(cleaned);
    if (program) {
      await this.consult(program);
    }

    if (query) {
      const answers = await this.query(query);
      return answers.length ? answers.join("\n") : "No.";
    }

    await reply?.("Provide a query with '?-' or use 'ask'.");
    return "";
  }
}

export default PrologProvider;
</file>

<file path="src/agents/providers/recorder-provider.js">
import { SememClient } from "../../lib/semem-client.js";
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";

export class RecorderProvider {
  constructor({ sememConfig, botNickname, logger = console }) {
    if (!sememConfig?.baseUrl) {
      throw new Error("RecorderProvider requires sememConfig.baseUrl");
    }
    this.client = new SememClient(sememConfig);
    this.botNickname = botNickname;
    this.logger = logger;
    this.minutes = [];
  }

  buildMetadata(metadata) {
    return {
      sender: metadata.sender,
      channel: metadata.type,
      room: metadata.type === "groupchat" ? metadata.roomJid : metadata.sender,
      agent: this.botNickname
    };
  }

  async handle({ command, content, rawMessage, metadata }) {
    const text = content || rawMessage || "";

    // Read-back request
    if (command === "ask" || text.toLowerCase().includes("minutes")) {
      if (this.minutes.length === 0) {
        return "No minutes recorded yet.";
      }
      const summary = this.minutes.map((m, idx) => `${idx + 1}. ${m.kind}: ${m.text}`).join("\n");
      return `Minutes:\n${summary}`;
    }

    const structure = detectIBISStructure(text);
    const hasIbis =
      structure.confidence >= 0.5 &&
      (structure.issues.length || structure.positions.length || structure.arguments.length);

    if (!hasIbis) {

      return null;
    }


    structure.issues.forEach((i) => this.minutes.push({ kind: "Issue", text: i.text, sender: metadata.sender }));
    structure.positions.forEach((p) => this.minutes.push({ kind: "Position", text: p.text, sender: metadata.sender }));
    structure.arguments.forEach((a) => this.minutes.push({ kind: "Argument", text: a.text, sender: metadata.sender }));


    try {
      const summary = summarizeIBIS(structure);
      await this.client.tell(`IBIS: ${summary}`, { metadata: this.buildMetadata(metadata) });
    } catch (err) {
      this.logger.error("Recorder /tell failed:", err.message);
    }

    return null;
  }
}

export default RecorderProvider;
</file>

<file path="src/examples/users.json">
[
  {
    "username": "danja",
    "password": "Claudiopup"
  },
  {
    "username": "alice",
    "password": "wonderland"
  },
  {
    "username": "bob",
    "password": "builder"
  },
  {
    "username": "dogbot",
    "password": "woofwoof"
  },
  {
    "username": "testuser",
    "password": "testpass123"
  }
]
</file>

<file path="src/factories/agent-factory.js">
import { AgentRunner } from "../agents/core/agent-runner.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler } from "../lib/lingue/handlers/index.js";


























export async function createAgent(profileName, provider, options = {}) {
  if (!profileName) {
    throw new Error("profileName is required");
  }
  if (!provider) {
    throw new Error("provider is required");
  }

  const profile = await loadAgentProfile(profileName, {
    profileDir: options.profileDir,
    secretsPath: options.secretsPath
  });

  if (!profile) {
    throw new Error(`Profile not found: ${profileName}`);
  }

  const config = profile.toConfig();
  const logger = options.logger || console;


  let agentRoster;
  let systemConfig;
  try {
    agentRoster = await loadAgentRoster(options.profileDir);
  } catch (err) {
    logger.warn?.("Could not load agent roster:", err.message);
  }

  try {
    systemConfig = await loadSystemConfig(options.profileDir);
  } catch (err) {
    logger.warn?.("Could not load system config:", err.message);
  }


  let negotiator;
  if (profile.lingue && profile.lingue.supports && profile.lingue.supports.length > 0) {
    const handlers = {};

    if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
      handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
    }
    if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
      handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
    }

    negotiator = new LingueNegotiator({
      profile,
      handlers,
      logger
    });
  }

  return new AgentRunner({
    xmppConfig: config.xmpp,
    roomJid: profile.roomJid,
    nickname: profile.nickname,
    provider,
    negotiator,
    mentionDetector: createMentionDetector(profile.nickname, [profile.nickname]),
    commandParser: defaultCommandParser,
    allowSelfMessages: options.allowSelfMessages || false,
    historyStore: options.historyStore,
    maxAgentRounds: options.maxAgentRounds || systemConfig?.maxAgentRounds,
    agentRoster,
    logger
  });
}








































export function createSimpleAgent(config) {
  const {
    xmppConfig,
    roomJid,
    nickname,
    provider,
    logger,
    allowSelfMessages,
    historyStore,
    maxAgentRounds,
    autoRegister,
    secretsPath
  } = config;

  if (!xmppConfig || !roomJid || !nickname || !provider) {
    throw new Error("Missing required config: xmppConfig, roomJid, nickname, provider");
  }

  return new AgentRunner({
    xmppConfig,
    roomJid,
    nickname,
    provider,
    mentionDetector: createMentionDetector(nickname, [nickname]),
    commandParser: defaultCommandParser,
    allowSelfMessages: allowSelfMessages || false,
    historyStore,
    maxAgentRounds: maxAgentRounds || 5,
    autoRegister: autoRegister || false,
    secretsPath,
    logger: logger || console
  });
}
</file>

<file path="src/lib/lingue/handlers/index.js">
export { HumanChatHandler } from "./human-chat.js";
export { IBISTextHandler } from "./ibis-text.js";
export { PrologProgramHandler } from "./prolog.js";
export { ProfileExchangeHandler } from "./profile-exchange.js";
export { SparqlQueryHandler } from "./sparql-query-handler.js";
</file>

<file path="src/lib/lingue/constants.js">
export const LINGUE_NS = "http://purl.org/stuff/lingue/";
export const DISCO_INFO_NS = "http://jabber.org/protocol/disco#info";

export const LANGUAGE_MODES = {
  HUMAN_CHAT: `${LINGUE_NS}HumanChat`,
  IBIS_TEXT: `${LINGUE_NS}IBISText`,
  PROLOG_PROGRAM: `${LINGUE_NS}PrologProgram`,
  PROFILE_EXCHANGE: `${LINGUE_NS}AgentProfileExchange`,
  SPARQL_QUERY: `${LINGUE_NS}SparqlQuery`
};

export const FEATURES = {
  LANG_HUMAN_CHAT: `${LINGUE_NS}feature/lang/human-chat`,
  LANG_IBIS_TEXT: `${LINGUE_NS}feature/lang/ibis-text`,
  LANG_PROLOG_PROGRAM: `${LINGUE_NS}feature/lang/prolog-program`,
  LANG_PROFILE_EXCHANGE: `${LINGUE_NS}feature/lang/profile-exchange`,
  LANG_SPARQL_QUERY: `${LINGUE_NS}feature/lang/sparql-query`
};

export const MIME_TYPES = {
  HUMAN_CHAT: "text/plain",
  IBIS_TEXT: "text/plain",
  PROLOG_PROGRAM: "text/x-prolog",
  PROFILE_EXCHANGE: "text/turtle",
  SPARQL_QUERY: "application/sparql-query"
};

export const MODE_TO_FEATURE = {
  [LANGUAGE_MODES.HUMAN_CHAT]: FEATURES.LANG_HUMAN_CHAT,
  [LANGUAGE_MODES.IBIS_TEXT]: FEATURES.LANG_IBIS_TEXT,
  [LANGUAGE_MODES.PROLOG_PROGRAM]: FEATURES.LANG_PROLOG_PROGRAM,
  [LANGUAGE_MODES.PROFILE_EXCHANGE]: FEATURES.LANG_PROFILE_EXCHANGE,
  [LANGUAGE_MODES.SPARQL_QUERY]: FEATURES.LANG_SPARQL_QUERY
};

export function featuresForModes(modes = []) {
  return Array.from(modes)
    .map((mode) => MODE_TO_FEATURE[mode])
    .filter(Boolean);
}

export const MODE_BY_MIME = {
  [MIME_TYPES.PROLOG_PROGRAM]: LANGUAGE_MODES.PROLOG_PROGRAM,
  [MIME_TYPES.HUMAN_CHAT]: LANGUAGE_MODES.HUMAN_CHAT,
  [MIME_TYPES.IBIS_TEXT]: LANGUAGE_MODES.IBIS_TEXT,
  [MIME_TYPES.PROFILE_EXCHANGE]: LANGUAGE_MODES.PROFILE_EXCHANGE,
  [MIME_TYPES.SPARQL_QUERY]: LANGUAGE_MODES.SPARQL_QUERY
};

export function modeFromMime(mimeType) {
  return MODE_BY_MIME[mimeType] || null;
}
</file>

<file path="src/lib/logger-lite.js">
import log from "loglevel";
import fs from "fs";
import path from "path";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_FILE = process.env.LOG_FILE;

let fileStream = null;
if (LOG_FILE) {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fileStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
}

const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...args) {
    rawMethod(...args);
    if (fileStream) {
      const line = `[${new Date().toISOString()}] ${methodName.toUpperCase()} ${args
        .map((a) => {
          if (typeof a === "string") return a;
          try {
            return JSON.stringify(a);
          } catch {
            return "[circular]";
          }
        })
        .join(" ")}\n`;
      try {
        fileStream.write(line);
      } catch {

      }
    }
  };
};

log.setLevel(LOG_LEVEL);

export default log;
</file>

<file path="src/lib/semem-client.js">
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_BASE_URL = process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it";
const DEFAULT_TIMEOUT_MS = parseInt(process.env.SEMEM_HTTP_TIMEOUT_MS || "8000", 10);

export class SememClient {
  constructor({
    baseUrl = DEFAULT_BASE_URL,
    authToken = process.env.SEMEM_AUTH_TOKEN,
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = {}) {
    if (!fetchImpl) {
      throw new Error("A fetch implementation is required for SememClient.");
    }

    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.authToken = authToken;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  buildHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async post(path, payload) {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response;
    try {
      response = await this.fetch(url, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error(`Semem request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
    clearTimeout(timeout);

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch (error) {
      throw new Error(`Semem response could not be parsed as JSON: ${error.message}`);
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || response.statusText;
      throw new Error(`Semem request failed (${response.status}): ${errorMessage}`);
    }

    return data;
  }

  async tell(content, { type = "interaction", metadata = {} } = {}) {
    if (!content || !content.trim()) {
      throw new Error("content is required for /tell");
    }
    return this.post("/tell", { content, type, metadata });
  }

  async ask(question, options = {}) {
    if (!question || !question.trim()) {
      throw new Error("question is required for /ask");
    }

    const {
      mode = "standard",
      useContext = true,
      useHyDE = false,
      useWikipedia = false,
      useWikidata = false,
      useWebSearch = false,
      threshold
    } = options;

    const payload = {
      question,
      mode,
      useContext,
      useHyDE,
      useWikipedia,
      useWikidata,
      useWebSearch
    };

    if (typeof threshold === "number") {
      payload.threshold = threshold;
    }

    return this.post("/ask", payload);
  }

  async chat(message, context = {}) {
    if (!message || !message.trim()) {
      throw new Error("message is required for /chat");
    }
    return this.post("/chat", { message, context });
  }

  async chatEnhanced(query, options = {}) {
    if (!query || !query.trim()) {
      throw new Error("query is required for /chat/enhanced");
    }

    const {
      useHyDE = false,
      useWikipedia = false,
      useWikidata = false,
      useWebSearch = false
    } = options;

    return this.post("/chat/enhanced", {
      query,
      useHyDE,
      useWikipedia,
      useWikidata,
      useWebSearch
    });
  }

  async augment(target, { operation = "auto", options = {} } = {}) {
    if (!target) {
      throw new Error("target is required for /augment");
    }
    return this.post("/augment", { target, operation, options });
  }

  async inspect({ what = "session", details = false } = {}) {
    return this.post("/inspect", { what, details });
  }
}

export default SememClient;
</file>

<file path="src/lib/xmpp-auto-connect.js">
import { client } from "@xmpp/client";
import { registerXmppAccount, generatePassword } from "./xmpp-register.js";
import fs from "fs/promises";
import path from "path";
















export async function autoConnectXmpp({
  service,
  domain,
  username,
  password,
  resource,
  tls = { rejectUnauthorized: false },
  secretsPath = "config/agents/secrets.json",
  autoRegister = true,
  logger = console
}) {
  let actualPassword = password;
  let wasRegistered = false;


  if (!actualPassword) {
    actualPassword = await readPasswordFromSecrets({ username, secretsPath, logger });
  }


  if (!actualPassword && autoRegister) {
    logger.info(`[AutoConnect] No password found for ${username}, attempting registration`);

    actualPassword = generatePassword(16);

    try {
      const result = await registerXmppAccount({
        service,
        domain,
        username,
        password: actualPassword,
        tls,
        logger
      });

      logger.info(`[AutoConnect] ${result.message}`);
      wasRegistered = true;


      await savePassword({ username, password: actualPassword, secretsPath, logger });
    } catch (err) {
      if (isAlreadyRegisteredError(err)) {
        logger.warn?.(`[AutoConnect] ${err.message}; trying stored credentials instead`);
        actualPassword = await readPasswordFromSecrets({ username, secretsPath, logger });

        if (!actualPassword) {
          throw new Error(`Auto-registration failed: ${err.message} and no stored password found in ${secretsPath}`);
        }
      } else {
        throw new Error(`Auto-registration failed: ${err.message}`);
      }
    }
  }

  if (!actualPassword) {
    throw new Error(`No password available for ${username} and auto-registration is disabled`);
  }


  const xmppConfig = {
    service,
    domain,
    username,
    password: actualPassword,
    resource,
    tls
  };

  const xmpp = client(xmppConfig);


  return new Promise((resolve, reject) => {
    let connected = false;
    let authFailed = false;

    const timeout = setTimeout(() => {
      if (!connected) {
        xmpp.stop().catch(() => {});
        reject(new Error("Connection timeout"));
      }
    }, 15000);

    xmpp.on("error", async (err) => {
      logger.error?.("[AutoConnect] XMPP Error:", err.message);


      if (err.condition === "not-authorized" || err.message?.includes("auth")) {
        authFailed = true;

        if (autoRegister && !wasRegistered) {
          logger.info("[AutoConnect] Authentication failed, attempting registration");
          clearTimeout(timeout);

          try {

            const newPassword = generatePassword(16);
            const result = await registerXmppAccount({
              service,
              domain,
              username,
              password: newPassword,
              tls,
              logger
            });

            logger.info(`[AutoConnect] ${result.message}`);


            await savePassword({ username, password: newPassword, secretsPath, logger });


            xmppConfig.password = newPassword;
            const newXmpp = client(xmppConfig);

            newXmpp.on("online", (address) => {
              logger.info(`[AutoConnect] Connected as ${address.toString()} after registration`);
              connected = true;
              resolve({
                xmpp: newXmpp,
                credentials: { username, password: newPassword, registered: true }
              });
            });

            newXmpp.on("error", (err2) => {
              reject(new Error(`Failed to connect after registration: ${err2.message}`));
            });

            await newXmpp.start();
          } catch (regErr) {
            reject(new Error(`Auto-registration after auth failure failed: ${regErr.message}`));
          }
        } else {
          clearTimeout(timeout);
          reject(err);
        }
      } else if (!connected) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    xmpp.on("online", (address) => {
      if (!authFailed) {
        logger.info(`[AutoConnect] Connected as ${address.toString()}`);
        connected = true;
        clearTimeout(timeout);
        resolve({
          xmpp,
          credentials: { username, password: actualPassword, registered: wasRegistered }
        });
      }
    });

    xmpp.start().catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}









async function savePassword({ username, password, secretsPath, logger = console }) {
  try {
    let secrets = { xmpp: {} };


    try {
      const existingData = await fs.readFile(secretsPath, "utf-8");
      secrets = JSON.parse(existingData);
      if (!secrets.xmpp) {
        secrets.xmpp = {};
      }
    } catch (err) {

      logger.debug?.(`[AutoConnect] Creating new secrets file at ${secretsPath}`);


      const dir = path.dirname(secretsPath);
      await fs.mkdir(dir, { recursive: true });
    }


    secrets.xmpp[username] = password;


    await fs.writeFile(secretsPath, JSON.stringify(secrets, null, 2), "utf-8");
    logger.info(`[AutoConnect] Saved password for ${username} to ${secretsPath}`);
  } catch (err) {
    logger.error?.(`[AutoConnect] Failed to save password to ${secretsPath}: ${err.message}`);
    throw err;
  }
}

async function readPasswordFromSecrets({ username, secretsPath, logger = console }) {
  try {
    const secretsData = await fs.readFile(secretsPath, "utf-8");
    const secrets = JSON.parse(secretsData);
    const storedPassword = secrets.xmpp?.[username];

    if (storedPassword) {
      logger.debug?.(`[AutoConnect] Loaded password for ${username} from ${secretsPath}`);
    }

    return storedPassword;
  } catch (err) {
    logger.debug?.(`[AutoConnect] Could not load secrets from ${secretsPath}: ${err.message}`);
    return undefined;
  }
}

function isAlreadyRegisteredError(err) {
  const message = err?.message?.toLowerCase?.() || "";
  return message.includes("already exists") || message.includes("conflict");
}
</file>

<file path="src/mcp/servers/sparql-server.js">
import dotenv from "dotenv";
import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

dotenv.config();

const QUERY_ENDPOINT = process.env.SPARQL_QUERY_ENDPOINT || "https://dbpedia.org/sparql";
const UPDATE_ENDPOINT = process.env.SPARQL_UPDATE_ENDPOINT || QUERY_ENDPOINT;

const server = new McpServer({
  name: "tia-sparql-mcp",
  version: "0.1.0"
});

server.registerTool("sparqlQuery", {
  description: "Run a SPARQL query against a remote endpoint.",
  inputSchema: {
    query: z.string().describe("SPARQL SELECT/ASK/CONSTRUCT query"),
    endpoint: z.string().optional().describe("Override query endpoint URL")
  },
  _meta: {
    tia: {
      endpoints: {
        query: QUERY_ENDPOINT,
        update: UPDATE_ENDPOINT
      }
    }
  }
}, async ({ query, endpoint }) => {
  const url = endpoint || QUERY_ENDPOINT;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/sparql-query",
      "accept": "application/sparql-results+json",
      "user-agent": "TIA-DataAgent/0.3.0 (https://github.com/danja/tia)"
    },
    body: query
  });
  const text = await response.text();
  return { content: [{ type: "text", text }] };
});

server.registerTool("sparqlUpdate", {
  description: "Run a SPARQL update against a remote endpoint.",
  inputSchema: {
    update: z.string().describe("SPARQL UPDATE statement"),
    endpoint: z.string().optional().describe("Override update endpoint URL")
  },
  _meta: {
    tia: {
      endpoints: {
        query: QUERY_ENDPOINT,
        update: UPDATE_ENDPOINT
      }
    }
  }
}, async ({ update, endpoint }) => {
  const url = endpoint || UPDATE_ENDPOINT;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/sparql-update",
      "accept": "text/plain"
    },
    body: update
  });
  const text = await response.text();
  return { content: [{ type: "text", text }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP] SPARQL server running on stdio");
}

main().catch((error) => {
  console.error("[MCP] SPARQL server error:", error);
  process.exit(1);
});
</file>

<file path="src/mcp/servers/tia-mcp-server.js">
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { loadAgentProfile, profileToTurtle } from "../../agents/profile-loader.js";
import { createProfileBuilder } from "../../agents/profile/profile-builder.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../../lib/lingue/index.js";
import {
  HumanChatHandler,
  IBISTextHandler,
  PrologProgramHandler,
  ProfileExchangeHandler
} from "../../lib/lingue/handlers/index.js";
import { McpChatAdapter } from "../chat-adapter.js";
import { McpServerBridge } from "../server-bridge.js";
import { autoConnectXmpp } from "../../lib/xmpp-auto-connect.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const defaultAgentDir = path.join(repoRoot, "config", "agents");

process.env.AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR || defaultAgentDir;
process.env.AGENT_SECRETS_PATH = process.env.AGENT_SECRETS_PATH || path.join(defaultAgentDir, "secrets.json");

process.env.DOTENV_CONFIG_QUIET = process.env.DOTENV_CONFIG_QUIET || "true";
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

const stderrLogger = {
  debug: (...args) => console.error(...args),
  info: (...args) => console.error(...args),
  warn: (...args) => console.error(...args),
  error: (...args) => console.error(...args)
};

const profileName = process.env.AGENT_PROFILE || null;
const defaultRoomJid = process.env.MUC_ROOM || "general@conference.tensegrity.it";

const buildRandomProfile = () => {
  const suffix = Math.floor(100 + Math.random() * 900);
  const nickname = `mcp-${suffix}`;
  return createProfileBuilder()
    .identifier(nickname)
    .nickname(nickname)
    .room(defaultRoomJid)
    .xmpp({
      service: process.env.XMPP_SERVICE,
      domain: process.env.XMPP_DOMAIN,
      username: nickname,
      resource: nickname,
      tlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1"
    })
    .lingue({ supports: [LANGUAGE_MODES.HUMAN_CHAT] })
    .build();
};

const profile = profileName
  ? await loadAgentProfile(profileName, { allowMissingPasswordKey: true })
  : buildRandomProfile();

if (!profile) {
  throw new Error(`MCP server profile not found: ${profileName}.ttl`);
}

const fileConfig = profile.toConfig();

const baseXmppConfig = {
  service: fileConfig.xmpp?.service || process.env.XMPP_SERVICE,
  domain: fileConfig.xmpp?.domain || process.env.XMPP_DOMAIN,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" }
};

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler();
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler();
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROLOG_PROGRAM)) {
  handlers[LANGUAGE_MODES.PROLOG_PROGRAM] = new PrologProgramHandler();
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROFILE_EXCHANGE)) {
  handlers[LANGUAGE_MODES.PROFILE_EXCHANGE] = new ProfileExchangeHandler();
}

const negotiator = new LingueNegotiator({ profile, handlers });

let chatAdapterPromise = null;
const getChatAdapter = async () => {
  if (!chatAdapterPromise) {
    chatAdapterPromise = (async () => {
      if (!baseXmppConfig.service || !baseXmppConfig.domain || !baseXmppConfig.username) {
        throw new Error("MCP server XMPP config incomplete; check profile file and environment");
      }
      console.error(`[MCP Server] Connecting as ${baseXmppConfig.username}@${baseXmppConfig.domain}`);
      const { xmpp, credentials } = await autoConnectXmpp({
        ...baseXmppConfig,
        secretsPath: process.env.AGENT_SECRETS_PATH,
        autoRegister: true,
        logger: stderrLogger
      });
      await xmpp.stop();

      if (credentials.registered) {
        console.error(`[MCP Server] ✅ New account registered: ${credentials.username}`);
        console.error(`[MCP Server] Password saved to ${process.env.AGENT_SECRETS_PATH}`);
      }

      const xmppConfig = {
        ...baseXmppConfig,
        username: credentials.username,
        password: credentials.password
      };

      const adapter = new McpChatAdapter({
        xmppConfig,
        roomJid: fileConfig.roomJid,
        nickname: fileConfig.nickname,
        profile,
        negotiator,
        logger: stderrLogger
      });

      await adapter.start();
      return adapter;
    })();
  }
  return chatAdapterPromise;
};

const chatAdapter = {
  sendMessage: async ({ text, directJid }) => {
    const adapter = await getChatAdapter();
    return adapter.sendMessage({ text, directJid });
  },
  offerLingueMode: async ({ peerJid, modes }) => {
    const adapter = await getChatAdapter();
    return adapter.offerLingueMode({ peerJid, modes });
  },
  getRecentMessages: async ({ limit }) => {
    const adapter = await getChatAdapter();
    return adapter.getRecentMessages({ limit });
  },
  getProfileTurtle: async () => {
    if (!profile) return "";
    return await profileToTurtle(profile);
  }
};

const server = new McpServerBridge({
  serverInfo: { name: "tia-chat-mcp", version: "0.1.0" },
  chatAdapter,
  logger: stderrLogger
});

await server.startStdio();
</file>

<file path="src/mcp/chat-adapter.js">
import { XmppRoomAgent } from "../lib/xmpp-room-agent.js";
import { profileToTurtle } from "../agents/profile-loader.js";

export class McpChatAdapter {
  constructor({
    xmppConfig,
    roomJid,
    nickname,
    profile,
    negotiator = null,
    logger = console,
    maxBufferedMessages = 50
  }) {
    this.xmppConfig = xmppConfig;
    this.roomJid = roomJid;
    this.nickname = nickname;
    this.profile = profile;
    this.negotiator = negotiator;
    this.logger = logger;
    this.maxBufferedMessages = maxBufferedMessages;
    this.messageBuffer = [];
    this.agent = new XmppRoomAgent({
      xmppConfig,
      roomJid,
      nickname,
      onMessage: (message) => this.recordMessage(message),
      allowSelfMessages: true,
      logger
    });
  }

  recordMessage(message) {
    try {
      const { body, sender, from, roomJid, type } = message;
      const entry = {
        body,
        sender,
        from,
        roomJid,
        type,
        timestamp: new Date().toISOString()
      };
      this.messageBuffer.push(entry);
      if (this.messageBuffer.length > this.maxBufferedMessages) {
        this.messageBuffer.splice(0, this.messageBuffer.length - this.maxBufferedMessages);
      }
    } catch (err) {
      this.logger.warn?.("[MCP] Failed to record message:", err);
    }
  }

  getRecentMessages({ limit = 20 } = {}) {
    const safeLimit = Math.max(1, Math.min(limit, this.maxBufferedMessages));
    return this.messageBuffer.slice(-safeLimit);
  }

  async start() {
    await this.agent.start();
  }

  async stop() {
    await this.agent.stop();
  }

  async sendMessage({ text, directJid = null }) {
    if (directJid) {
      await this.agent.sendDirectMessage(directJid, text);
      return { sent: true, to: directJid, type: "chat" };
    }
    await this.agent.sendGroupMessage(text);
    return { sent: true, to: this.roomJid, type: "groupchat" };
  }

  async offerLingueMode({ peerJid, modes }) {
    if (!this.negotiator) {
      throw new Error("Lingue negotiator not configured");
    }
    await this.negotiator.offerExchange(peerJid, modes);
    return { offered: true, peerJid, modes };
  }

  async getProfileTurtle() {
    if (!this.profile) return "";
    return await profileToTurtle(this.profile);
  }
}
</file>

<file path="src/mcp/tool-definitions.js">
import * as z from "zod/v4";
import { detectIBISStructure, summarizeIBIS } from "../lib/ibis-detect.js";

export function createChatTools({ chatAdapter } = {}) {
  return [
    {
      name: "sendMessage",
      description: "Send a message to the MUC room or a direct JID.",
      inputSchema: {
        text: z.string().describe("Message text to send"),
        directJid: z.string().optional().describe("Optional direct JID to message")
      },
      handler: async ({ text, directJid }) => {
        const result = await chatAdapter.sendMessage({ text, directJid });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    },
    {
      name: "offerLingueMode",
      description: "Offer a Lingue language mode to a peer.",
      inputSchema: {
        peerJid: z.string().describe("Peer JID to negotiate with"),
        modes: z.array(z.string()).describe("Lingue modes to offer")
      },
      handler: async ({ peerJid, modes }) => {
        const result = await chatAdapter.offerLingueMode({ peerJid, modes });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    },
    {
      name: "getProfile",
      description: "Return the agent profile as Turtle.",
      inputSchema: {},
      handler: async () => {
        const turtle = await chatAdapter.getProfileTurtle();
        return {
          content: [{ type: "text", text: turtle }]
        };
      }
    },
    {
      name: "getRecentMessages",
      description: "Return recent chat messages seen by the MCP agent.",
      inputSchema: {
        limit: z.number().int().positive().max(200).optional().describe("Max messages to return")
      },
      handler: async ({ limit }) => {
        const messages = await chatAdapter.getRecentMessages({ limit });
        return {
          content: [{ type: "text", text: JSON.stringify(messages, null, 2) }]
        };
      }
    },
    {
      name: "summarizeLingue",
      description: "Summarize a text into IBIS-style summary.",
      inputSchema: {
        text: z.string().describe("Text to analyze")
      },
      handler: async ({ text }) => {
        const structure = detectIBISStructure(text);
        const summary = summarizeIBIS(structure);
        return {
          content: [{ type: "text", text: summary }]
        };
      }
    }
  ];
}
</file>

<file path="test/lingue-profile-loading.test.js">
import "./helpers/agent-secrets.js";
import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/agents/profile-loader.js";

const LINGUE_NS = "http://purl.org/stuff/lingue/";
const IBIS_NS = "https://vocab.methodandstructure.com/ibis#";

describe("Lingue profile loading", () => {
  it("loads Lingue capabilities for mistral profile", async () => {
    const profile = await loadAgentProfile("mistral");

    expect(profile.lingue.supports).toBeInstanceOf(Set);
    expect(profile.lingue.supports.has(`${LINGUE_NS}HumanChat`)).toBe(true);
    expect(profile.lingue.supports.has(`${LINGUE_NS}IBISText`)).toBe(true);
    expect(profile.lingue.prefers).toBe(`${LINGUE_NS}HumanChat`);
    expect(profile.lingue.understands.has(IBIS_NS)).toBe(true);
  });

  it("loads Lingue profile details", async () => {
    const profile = await loadAgentProfile("mistral");

    expect(profile.lingue.profile).toBeTruthy();
    expect(profile.lingue.profile.availability).toBe(`${LINGUE_NS}Process`);
    expect(profile.lingue.profile.inputs).toContain("XMPP MUC text");
    expect(profile.lingue.profile.outputs).toContain("XMPP MUC text + IBIS RDF");
  });

  it("loads demo profile with HumanChat only", async () => {
    const profile = await loadAgentProfile("demo");

    expect(profile.lingue.supports.has(`${LINGUE_NS}HumanChat`)).toBe(true);
    expect(profile.lingue.supports.has(`${LINGUE_NS}IBISText`)).toBe(false);
    expect(profile.lingue.understands.size).toBe(0);
  });
});
</file>

<file path="test/profile-roundtrip.test.js">
import "./helpers/agent-secrets.js";
import { describe, it, expect } from "vitest";
import { loadAgentProfile, profileToTurtle, parseAgentProfile } from "../src/agents/profile-loader.js";
import { createProfileBuilder } from "../src/agents/profile/profile-builder.js";

describe("Profile roundtrip serialization", () => {
  it("roundtrips mistral profile", async () => {
    const original = await loadAgentProfile("mistral");
    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#mistral");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.roomJid).toBe(original.roomJid);

    expect(restored.xmppAccount.service).toBe(original.xmppAccount.service);
    expect(restored.xmppAccount.domain).toBe(original.xmppAccount.domain);
    expect(restored.xmppAccount.username).toBe(original.xmppAccount.username);

    expect(restored.provider.type).toBe(original.provider.type);
    expect(restored.toConfig()).toEqual(original.toConfig());
  });

  it("roundtrips semem profile with features", async () => {
    const original = await loadAgentProfile("semem");
    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#semem");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.provider.type).toBe("semem");

    const originalConfig = original.toConfig();
    const restoredConfig = restored.toConfig();

    expect(restoredConfig.semem.baseUrl).toBe(originalConfig.semem.baseUrl);
    expect(restoredConfig.semem.authTokenEnv).toBe(originalConfig.semem.authTokenEnv);
    expect(restoredConfig.semem.timeoutMs).toBe(originalConfig.semem.timeoutMs);
    expect(restoredConfig.semem.features).toEqual(originalConfig.semem.features);
  });

  it("roundtrips demo profile without provider", async () => {
    const original = await loadAgentProfile("demo");
    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#demo");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.provider).toBeNull();
    expect(restored.toConfig()).toEqual(original.toConfig());
  });

  it("roundtrips built profile", async () => {
    const original = createProfileBuilder()
      .identifier("test")
      .nickname("TestBot")
      .room("test@conference.test")
      .xmpp({
        service: "xmpp://test:5222",
        domain: "test",
        username: "test",
        password: "testpass",
        passwordKey: "test",
        resource: "TestBot"
      })
      .mistralProvider({
        model: "mistral-small-latest",
        apiKeyEnv: "TEST_API_KEY"
      })
      .build();

    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#test");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.toConfig()).toEqual(original.toConfig());
  });

  it("generated turtle contains correct prefixes", async () => {
    const profile = await loadAgentProfile("mistral");
    const turtle = await profileToTurtle(profile);

    expect(turtle).toContain("@prefix agent:");
    expect(turtle).toContain("@prefix foaf:");
    expect(turtle).toContain("@prefix xmpp:");
    expect(turtle).toContain("@prefix ai:");
  });

  it("generated turtle contains agent data", async () => {
    const profile = await loadAgentProfile("mistral");
    const turtle = await profileToTurtle(profile);

    expect(turtle).toContain("foaf:nick");
    expect(turtle).toContain("Mistral");
    expect(turtle).toContain("agent:xmppAccount");
    expect(turtle).toContain("agent:roomJid");
  });
});
</file>

<file path="test/xmpp.bots.integration.test.js">
import dotenv from "dotenv";
import { spawn } from "child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";

dotenv.config();

const requiredEnv = [
  "XMPP_SERVICE",
  "XMPP_DOMAIN",
  "XMPP_USERNAME",
  "XMPP_PASSWORD",
  "MUC_ROOM"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const testClientNick =
  process.env.TEST_XMPP_NICKNAME ||
  `VitestClient-${Math.random().toString(16).slice(2, 8)}`;

const messages = [];
let agent;
const botProcs = [];

async function waitFor(conditionFn, timeoutMs = 20000, intervalMs = 150) {
  const start = Date.now();

  while (true) {
    if (conditionFn()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

function startBot(scriptPath, envOverrides = {}) {
  const child = spawn("node", [scriptPath], {
    env: { ...process.env, ...envOverrides },
    stdio: "inherit"
  });
  botProcs.push(child);
  return child;
}

function stopBots() {
  botProcs.forEach((p) => {
    if (p.exitCode === null) {
      p.kill("SIGTERM");
    }
  });
}

function findMessageFrom(senderNickname) {
  const base = senderNickname.toLowerCase();
  return messages.find((m) => m.sender?.toLowerCase().startsWith(base));
}

if (missingEnv.length) {
  describe.skip("XMPP bot integration (env not provided)", () => {
    it("skipped because required env vars are missing", () => {
      expect(missingEnv.length).toBeGreaterThan(0);
    });
  });
} else {
  describe("XMPP bot integration", () => {
    beforeAll(async () => {
      agent = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: testClientNick,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: false,
        logger: console
      });

      await agent.start();
      await waitFor(() => agent.isInRoom === true, 18000);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }, 30000);

    afterAll(async () => {
      stopBots();
      if (agent) {
        await agent.stop();
      }
    });

    const mistralEnvMissing = !process.env.MISTRAL_API_KEY;
    const runMistralTest = process.env.RUN_MISTRAL_BOT_TEST !== "false";
    const mistralNickname = process.env.BOT_NICKNAME || "MistralBot";

    (mistralEnvMissing || !runMistralTest ? it.skip : it)(
      "Mistral bot replies in MUC when mentioned",
      async () => {
        startBot("src/services/mistral-bot.js", {
          MUC_ROOM,
          BOT_NICKNAME: mistralNickname
        });


        await new Promise((resolve) => setTimeout(resolve, 8000));

        const ping = `${mistralNickname}, integration test ping ${Date.now()}`;
        await agent.sendGroupMessage(ping);

        await waitFor(() => !!findMessageFrom(mistralNickname), 20000, 200);

        const reply = findMessageFrom(mistralNickname);
        expect(reply?.body || "").toBeTruthy();
      },
      40000
    );

    const sememTestEnabled = process.env.RUN_SEMEM_BOT_TEST === "true";
    const sememNickname =
      process.env.SEMEM_NICKNAME ||
      process.env.AGENT_NICKNAME ||
      "Semem";

    (!sememTestEnabled ? it.skip : it)(
      "Semem agent replies in MUC when mentioned",
      async () => {
        startBot("src/services/semem-agent.js", {
          MUC_ROOM,
          AGENT_NICKNAME: sememNickname
        });

        await new Promise((resolve) => setTimeout(resolve, 20000));

        const ping = `${sememNickname}, integration test ping ${Date.now()}`;
        await agent.sendGroupMessage(ping);

        await waitFor(() => !!findMessageFrom(sememNickname), 45000, 200);

        const reply = findMessageFrom(sememNickname);
        expect(reply?.body || "").toBeTruthy();
      },
      70000
    );
  });
}
</file>

<file path="test/xmpp.integration.test.js">
import dotenv from "dotenv";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { XmppRoomAgent } from "../src/lib/xmpp-room-agent.js";

dotenv.config();

const requiredEnv = [
  "XMPP_SERVICE",
  "XMPP_DOMAIN",
  "XMPP_USERNAME",
  "XMPP_PASSWORD",
  "MUC_ROOM"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || "general@conference.xmpp";
const NICKNAME =
  process.env.TEST_XMPP_NICKNAME ||
  `Vitest-${Math.random().toString(16).slice(2, 8)}`;

const messages = [];
let agent;

async function waitFor(conditionFn, timeoutMs = 12000, intervalMs = 150) {
  const start = Date.now();

  while (true) {
    if (conditionFn()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

if (missingEnv.length) {
  describe.skip("XMPP integration (env not provided)", () => {
    it("skipped because required env vars are missing", () => {
      expect(missingEnv.length).toBeGreaterThan(0);
    });
  });
} else {
  describe("XMPP integration", () => {
    beforeAll(async () => {
      agent = new XmppRoomAgent({
        xmppConfig: XMPP_CONFIG,
        roomJid: MUC_ROOM,
        nickname: NICKNAME,
        onMessage: async (payload) => {
          messages.push(payload);
        },
        allowSelfMessages: true,
        logger: console
      });

      await agent.start();
      await waitFor(() => agent.isInRoom === true, 10000);
    }, 15000);

    afterAll(async () => {
      if (agent) {
        await agent.stop();
      }
    });

    it(
      "joins the MUC and can post a message",
      async () => {
        const body = `vitest-ping-${Date.now()}`;
        await agent.sendGroupMessage(body);
        await waitFor(
          () => messages.some((m) => m.body === body),
          8000
        );
        const seen = messages.find((m) => m.body === body);
        expect(seen?.roomJid ?? MUC_ROOM).toBeDefined();
      },
      15000
    );
  });
}
</file>

<file path=".gitignore">
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Agent secrets
config/agents/secrets.json

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# vuepress v2.x temp and cache directory
.temp
.cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
</file>

<file path="config/agents/chair.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#chair> a agent:ConversationalAgent, agent:AIAgent, agent:ModeratorAgent, lng:Agent ;
  foaf:nick "Chair" ;
  schema:identifier "chair" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat, lng:IBISText ;
  lng:prefers lng:HumanChat ;
  lng:understands <https://vocab.methodandstructure.com/ibis#> ;
  lng:profile <#chair-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "chair" ;
    xmpp:passwordKey "chair" ;
    xmpp:resource "Chair"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:model "mistral-small-latest" ;
    ai:apiKeyEnv "MISTRAL_API_KEY"
  ] .

<#chair-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + IBIS RDF" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="config/agents/demo.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#demo> a agent:ConversationalAgent, lng:Agent ;
  foaf:nick "Demo" ;
  schema:identifier "demo" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat ;
  lng:prefers lng:HumanChat ;
  lng:profile <#demo-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "demo" ;
    xmpp:passwordKey "demo" ;
    xmpp:resource "Demo"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" .

<#demo-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="config/agents/mistral.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .

<#mistral> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  dcterms:isPartOf <#mistral-base> ;
  foaf:nick "Mistral" ;
  schema:identifier "mistral" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:username "mistral" ;
    xmpp:passwordKey "mistral" ;
    xmpp:resource "Mistral"
  ] ;

  agent:aiProvider [
    a ai:MistralProvider ;
    ai:systemPrompt "You are Mistral, a helpful assistant in an XMPP chat room. Keep responses concise (1-3 sentences) and conversational."
  ] .
</file>

<file path="config/agents/recorder.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#recorder> a agent:ConversationalAgent, agent:RecorderAgent, lng:Agent ;
  foaf:nick "Recorder" ;
  schema:identifier "recorder" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat, lng:IBISText, lng:PrologProgram, lng:AgentProfileExchange ;
  lng:prefers lng:HumanChat ;
  lng:understands <https://vocab.methodandstructure.com/ibis#> ;
  lng:profile <#recorder-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "recorder" ;
    xmpp:passwordKey "recorder" ;
    xmpp:resource "Recorder"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:mcpProvider [
    a ai:SememProvider ;
    ai:baseUrl "https://mcp.tensegrity.it" ;
    ai:authTokenEnv "SEMEM_AUTH_TOKEN" ;
    ai:timeoutMs "8000"
  ] .

<#recorder-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + IBIS RDF" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="config/agents/semem.ttl">
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <https://schema.org/> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .
@prefix ai: <https://tensegrity.it/vocab/ai-provider#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lng: <http://purl.org/stuff/lingue/> .
@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#semem> a agent:ConversationalAgent, agent:KnowledgeAgent, lng:Agent ;
  foaf:nick "Semem" ;
  schema:identifier "semem" ;
  dcterms:created "2024-12-01T00:00:00Z"^^xsd:dateTime ;

  lng:supports lng:HumanChat, lng:IBISText, lng:AgentProfileExchange ;
  lng:prefers lng:HumanChat ;
  lng:understands <https://vocab.methodandstructure.com/ibis#> ;
  lng:profile <#semem-lingue-profile> ;

  agent:xmppAccount [
    a xmpp:Account ;
    xmpp:service "xmpp://tensegrity.it:5222" ;
    xmpp:domain "tensegrity.it" ;
    xmpp:username "semem" ;
    xmpp:passwordKey "semem" ;
    xmpp:resource "Semem"
  ] ;

  agent:roomJid "general@conference.tensegrity.it" ;

  agent:mcpProvider [
    a ai:SememProvider ;
    ai:baseUrl "https://mcp.tensegrity.it" ;
    ai:authTokenEnv "SEMEM_AUTH_TOKEN" ;
    ai:timeoutMs "8000" ;
    ai:features [
      ai:useWikipedia true ;
      ai:useWikidata true ;
      ai:useWebSearch false
    ]
  ] .

<#semem-lingue-profile> a lng:Profile ;
  lng:availability lng:Process ;
  lng:in [ a lng:Interface ; rdfs:label "XMPP MUC text" ] ;
  lng:out [ a lng:Interface ; rdfs:label "XMPP MUC text + IBIS RDF" ] ;
  lng:dependsOn [ a lng:Environment ; rdfs:label "XMPP/Prosody" ] ;
  lng:alang "JavaScript" .
</file>

<file path="docs/LINGUE-PLAN.md">
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
</file>

<file path="docs/server.md">
# Server Setup (systemd)

This describes how to run the agents as a systemd service that starts on boot and restarts after crashes.

## Unit file
`misc/tia-agents.service` is provided. Key points:
- `WorkingDirectory=/home/danny/hyperdata/tia`
- `EnvironmentFile=/home/danny/hyperdata/tia/.env` (optional; holds XMPP creds/API keys)
- `ExecStart=/home/danny/hyperdata/tia/start-all-agents.sh`
- `Restart=on-failure` with `RestartSec=5`
- `User=danny`
- `WantedBy=multi-user.target`

## Install & enable
```bash
sudo cp /home/danny/hyperdata/tia/misc/tia-agents.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tia-agents.service   # start on boot
sudo systemctl start tia-agents.service    # start now
```

## Check status/logs
```bash
systemctl status tia-agents.service
journalctl -u tia-agents.service -f
```

## Prereqs
- Populate `/home/danny/hyperdata/tia/.env` (or per-agent configs in `config/agents/`) with XMPP credentials/resources and any API keys/tokens.
- Ensure `start-all-agents.sh` is executable.
- If your XMPP server doesn’t support multiple resources on one account, use distinct accounts per agent in `config/agents/{mistral,semem,demo}.ttl` and restart the service.
</file>

<file path="docs/testing.md">
# Testing Guide

This repository has two layers of tests:
- **Node unit tests** (fast, offline): `npm test`
- **Live XMPP integration tests** (exercise XMPP MUC and optional bots): `npm run test:integration`

## Prerequisites
- Node.js installed
- XMPP server reachable with a MUC room you can join
- `.env` file with XMPP credentials and room details

Example `.env` (self-signed TLS example):
```
NODE_TLS_REJECT_UNAUTHORIZED=0          # only if your XMPP TLS is self-signed
XMPP_SERVICE=xmpp://tensegrity.it:5222  # or xmpps://... if TLS-only
XMPP_DOMAIN=tensegrity.it
MUC_ROOM=general@conference.tensegrity.it
XMPP_RESOURCE=SememTest               # optional: set XMPP resource; defaults to bot nickname

# Optional for bots under test
MISTRAL_API_KEY=...                     # required to test the Mistral bot
SEMEM_BASE_URL=https://mcp.tensegrity.it
SEMEM_AUTH_TOKEN=...                    # if your Semem endpoint needs auth
SEMEM_NICKNAME=SememTest                # optional nickname for Semem agent
MCP_BOT_NICKNAME=McpDebug               # nickname for MCP debug agent (if using)
```

XMPP passwords are read from `config/agents/secrets.json` (ignored by git). Set
`AGENT_SECRETS_PATH` to use a different secrets file.

> Tip: If your `.env` lives elsewhere, set `TIA_ENV_PATH=/path/to/.env` before running tests.

## Running the tests
Install deps once:
```
npm install
```

Unit tests (offline):
```
npm test
```

XMPP integration (live server required):
```
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration
```

### What the integration tests do
- `test/xmpp.integration.test.js`: joins the MUC with a transient nickname, posts a message, and confirms it is observed (self-messages allowed in the test).
- `test/xmpp.bots.integration.test.js`: joins the MUC and optionally spawns bots, then mentions them and waits for replies:
  - **Mistral bot**: runs when `MISTRAL_API_KEY` is set (skip with `RUN_MISTRAL_BOT_TEST=false`).
  - **Semem agent**: runs only if `RUN_SEMEM_BOT_TEST=true` (assumes Semem endpoint reachable). Uses `SEMEM_NICKNAME` or `AGENT_NICKNAME` if provided.

Both tests reuse the shared `XmppRoomAgent` helper and honor the same `.env` values.

### Environment gating for bot tests
Set these only when you want to exercise the bots:
```
# Mistral bot test (on by default if key is present)
MISTRAL_API_KEY=...
RUN_MISTRAL_BOT_TEST=true   # default; set to false to skip

# Semem agent test (opt-in)
RUN_SEMEM_BOT_TEST=true
SEMEM_BASE_URL=https://mcp.tensegrity.it
SEMEM_AUTH_TOKEN=...        # if required
SEMEM_NICKNAME=SememTest    # optional override
```

### Expected behavior and timeouts
- The integration tests give bots a few seconds to join the MUC and up to ~15s to respond after being pinged.
- If you see timeouts, verify:
  - XMPP host/port/domain/room are correct.
  - The MUC echoes messages back to the sender (needed for the self-observe test).
  - Bots have their required env (e.g., `MISTRAL_API_KEY`, `SEMEM_BASE_URL`/token).
  - Certificates: add `NODE_TLS_REJECT_UNAUTHORIZED=0` for self-signed TLS.

### Troubleshooting checklist
- `host-unknown` or no join: confirm `XMPP_SERVICE` (correct protocol/port), `XMPP_DOMAIN`, and MUC host (e.g., `conference.<domain>`).
- No bot reply: ensure the bot started (logs in test output), nickname matches, and required keys/URLs are set.
- TLS failures: add `NODE_TLS_REJECT_UNAUTHORIZED=0` when using `xmpps://` with self-signed certs.

## Quick commands
- Run only unit tests: `npm test`
- Run only XMPP integration: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration`
- Skip Mistral bot test: `RUN_MISTRAL_BOT_TEST=false npm run test:integration`
- Enable Semem bot test: `RUN_SEMEM_BOT_TEST=true npm run test:integration`
</file>

<file path="src/agents/profile/profile-builder.js">
import { AgentProfile } from "./agent-profile.js";
import { XmppConfig } from "./xmpp-config.js";
import { MistralProviderConfig, SememProviderConfig } from "./provider-config.js";
import { Capability } from "./capability.js";





export class ProfileBuilder {
  constructor() {
    this.data = {
      identifier: null,
      nickname: null,
      type: [],
      xmppAccount: null,
      roomJid: null,
      provider: null,
      capabilities: [],
      lingue: {},
      mcp: {},
      metadata: {},
      customProperties: {}
    };
  }

  identifier(id) {
    this.data.identifier = id;
    return this;
  }

  nickname(nick) {
    this.data.nickname = nick;
    return this;
  }

  type(...types) {
    this.data.type = types;
    return this;
  }

  xmpp({ service, domain, username, password, passwordKey, resource, tlsRejectUnauthorized }) {
    this.data.xmppAccount = new XmppConfig({
      service,
      domain,
      username,
      password,
      passwordKey,
      resource,
      tlsRejectUnauthorized
    });
    return this;
  }

  room(roomJid) {
    this.data.roomJid = roomJid;
    return this;
  }

  mistralProvider({ model, apiKeyEnv, maxTokens, temperature, lingueEnabled, lingueConfidenceMin }) {
    this.data.provider = new MistralProviderConfig({
      model,
      apiKeyEnv,
      maxTokens,
      temperature,
      lingueEnabled,
      lingueConfidenceMin
    });
    return this;
  }

  sememProvider({ baseUrl, authTokenEnv, timeoutMs, features }) {
    this.data.provider = new SememProviderConfig({
      baseUrl,
      authTokenEnv,
      timeoutMs,
      features
    });
    return this;
  }

  capability({ name, label, description, command, handler, metadata }) {
    this.data.capabilities.push(new Capability({
      name,
      label,
      description,
      command,
      handler,
      metadata
    }));
    return this;
  }

  lingue({ supports, prefers, understands, profile }) {
    this.data.lingue = {
      supports: supports || [],
      prefers: prefers || null,
      understands: understands || [],
      profile: profile || null
    };
    return this;
  }

  mcp({ role, servers, tools, resources, prompts, endpoints }) {
    this.data.mcp = {
      role: role || null,
      servers: servers || [],
      tools: tools || [],
      resources: resources || [],
      prompts: prompts || [],
      endpoints: endpoints || []
    };
    return this;
  }

  metadata({ created, modified, description }) {
    this.data.metadata = { created, modified, description };
    return this;
  }

  custom(key, value) {
    this.data.customProperties[key] = value;
    return this;
  }

  build() {
    return new AgentProfile(this.data);
  }
}




export function createProfileBuilder() {
  return new ProfileBuilder();
}
</file>

<file path="src/agents/profile/provider-config.js">
export class ProviderConfig {
  constructor(type, config = {}) {
    this.type = type;
    this.config = config;
  }

  toConfig() {
    return { ...this.config };
  }
}




export class MistralProviderConfig extends ProviderConfig {
  constructor({
    model,
    apiKeyEnv,
    maxTokens,
    temperature,
    lingueEnabled,
    lingueConfidenceMin,
    systemPrompt,
    systemTemplate
  }) {
    super('mistral', {
      model,
      apiKeyEnv,
      maxTokens,
      temperature,
      lingueEnabled,
      lingueConfidenceMin,
      systemPrompt,
      systemTemplate
    });
  }

  toConfig() {
    const config = {};
    if (this.config.model !== undefined) config.model = this.config.model;
    if (this.config.apiKeyEnv !== undefined) config.apiKeyEnv = this.config.apiKeyEnv;
    if (this.config.maxTokens !== undefined) config.maxTokens = this.config.maxTokens;
    if (this.config.temperature !== undefined) config.temperature = this.config.temperature;
    if (this.config.lingueEnabled !== undefined) config.lingueEnabled = this.config.lingueEnabled;
    if (this.config.lingueConfidenceMin !== undefined) config.lingueConfidenceMin = this.config.lingueConfidenceMin;
    if (this.config.systemPrompt !== undefined) config.systemPrompt = this.config.systemPrompt;
    if (this.config.systemTemplate !== undefined) config.systemTemplate = this.config.systemTemplate;
    return config;
  }
}




export class SememProviderConfig extends ProviderConfig {
  constructor({ baseUrl, authTokenEnv, timeoutMs, features = {} }) {
    super('semem', {
      baseUrl,
      authTokenEnv,
      timeoutMs,
      features
    });
  }

  toConfig() {
    const config = {};
    if (this.config.baseUrl !== undefined) config.baseUrl = this.config.baseUrl;
    if (this.config.authTokenEnv !== undefined) config.authTokenEnv = this.config.authTokenEnv;
    if (this.config.timeoutMs !== undefined) config.timeoutMs = this.config.timeoutMs;
    if (this.config.features !== undefined) config.features = this.config.features;
    return config;
  }
}




export class DataProviderConfig extends ProviderConfig {
  constructor({
    sparqlEndpoint,
    extractionModel,
    extractionApiKeyEnv,
    maxTokens,
    temperature
  }) {
    super('data', {
      sparqlEndpoint,
      extractionModel,
      extractionApiKeyEnv,
      maxTokens,
      temperature
    });
  }

  toConfig() {
    const config = {};
    if (this.config.sparqlEndpoint !== undefined) config.sparqlEndpoint = this.config.sparqlEndpoint;
    if (this.config.extractionModel !== undefined) config.extractionModel = this.config.extractionModel;
    if (this.config.extractionApiKeyEnv !== undefined) config.extractionApiKeyEnv = this.config.extractionApiKeyEnv;
    if (this.config.maxTokens !== undefined) config.maxTokens = this.config.maxTokens;
    if (this.config.temperature !== undefined) config.temperature = this.config.temperature;
    return config;
  }
}
</file>

<file path="src/agents/providers/mistral-provider.js">
import { Mistral } from "@mistralai/mistralai";
import { detectIBISStructure, summarizeIBIS } from "../../lib/ibis-detect.js";
import { attachDiscoInfoResponder } from "../../lib/lingue/discovery.js";
import { FEATURES } from "../../lib/lingue/constants.js";

const LEGACY_LINGUE_FEATURES = [
  "http://purl.org/stuff/lingue/ibis-rdf",
  "http://purl.org/stuff/lingue/ask-tell",
  "http://purl.org/stuff/lingue/meta-transparent"
];

const DEFAULT_LINGUE_FEATURES = [
  FEATURES.LANG_HUMAN_CHAT,
  FEATURES.LANG_IBIS_TEXT,
  ...LEGACY_LINGUE_FEATURES
];

const DEFAULT_SYSTEM_TEMPLATE =
  "You are {{nickname}}, a helpful assistant in an XMPP chat room. Keep responses concise (1-3 sentences) and conversational.";

export class MistralProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    systemPrompt = null,
    systemTemplate = null,
    historyStore = null,
    lingueEnabled = true,
    lingueConfidenceMin = 0.5,
    discoFeatures = DEFAULT_LINGUE_FEATURES,
    xmppClient = null,
    logger = console
  }) {
    if (!apiKey) throw new Error("MISTRAL_API_KEY is required for MistralProvider");
    this.client = new Mistral({ apiKey });
    this.model = model;
    this.nickname = nickname;
    this.systemPrompt = systemPrompt;
    this.systemTemplate = systemTemplate;
    this.historyStore = historyStore;
    this.lingueEnabled = lingueEnabled;
    this.lingueConfidenceMin = lingueConfidenceMin;
    this.xmppClient = xmppClient;
    this.logger = logger;


    if (lingueEnabled && xmppClient) {
      attachDiscoInfoResponder(xmppClient, {
        features: discoFeatures
      });
    }
  }

  async maybePostLingueSummary(text, reply) {
    if (!this.lingueEnabled) return;
    const structure = detectIBISStructure(text);
    if (structure.confidence < this.lingueConfidenceMin) return;
    const summary = summarizeIBIS(structure);
    await reply(summary);
  }

  async handle({ command, content, metadata, reply }) {
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "${this.nickname}, <your question>"`;
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const historyMessages = this.historyStore?.getMessages?.() || [];
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content }
        ],
        maxTokens: 150,
        temperature: 0.7
      });

      const replyText = response.choices[0]?.message?.content?.trim();
      if (replyText && this.historyStore?.addTurn) {
        this.historyStore.addTurn({ role: "user", content });
        this.historyStore.addTurn({ role: "assistant", content: replyText });
      }
      if (this.lingueEnabled && replyText) {

        await this.maybePostLingueSummary(content, reply);
      }
      return replyText || "I had trouble generating a response.";
    } catch (error) {
      this.logger.error("Mistral provider error:", error.message);
      return "I'm having trouble generating a response right now.";
    }
  }

  buildSystemPrompt() {
    if (this.systemPrompt) return this.systemPrompt;
    const template = this.systemTemplate || DEFAULT_SYSTEM_TEMPLATE;
    return renderTemplate(template, { nickname: this.nickname });
  }
}

export default MistralProvider;

function renderTemplate(template, data) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : "";
  });
}
</file>

<file path="src/mcp/servers/Echo.js">
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { XmppRoomAgent } from '../../lib/xmpp-room-agent.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRootEnv = join(__dirname, '../../..', '.env');
const callerEnv = process.env.TIA_ENV_PATH || join(process.cwd(), '.env');
dotenv.config({ path: callerEnv });
dotenv.config({ path: projectRootEnv, override: false });

console.error('[Server] Starting MCP debug server with XMPP test hooks');

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || 'xmpp://localhost:5222',
  domain: process.env.XMPP_DOMAIN || 'xmpp',
  username: process.env.XMPP_USERNAME || 'dogbot',
  password: process.env.XMPP_PASSWORD || 'woofwoof',
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || 'general@conference.xmpp';
const MCP_BOT_NICKNAME = process.env.MCP_BOT_NICKNAME || process.env.BOT_NICKNAME || 'McpDebug';

const state = {
  xmppReady: false,
  lastIncoming: null,
  xmppAgent: null
};


function createResponse(id, result = null, error = null) {
  return (
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      ...(result !== null && { result }),
      ...(error !== null && { error })
    }) + '\n'
  );
}


function getXmppAgent() {
  if (!state.xmppAgent) {
    state.xmppAgent = new XmppRoomAgent({
      xmppConfig: XMPP_CONFIG,
      roomJid: MUC_ROOM,
      nickname: MCP_BOT_NICKNAME,
      onMessage: async ({ body, sender, from, type }) => {
        state.lastIncoming = {
          body,
          sender,
          from,
          type,
          receivedAt: new Date().toISOString()
        };
        console.error(`[XMPP] ${type} from ${sender}: ${body}`);
      },
      logger: console
    });
  }
  return state.xmppAgent;
}

async function startXmpp() {
  try {
    const xmppAgent = getXmppAgent();
    await xmppAgent.start();
    state.xmppReady = true;
    console.error(
      `[XMPP] Connected to ${XMPP_CONFIG.service} domain=${XMPP_CONFIG.domain} room=${MUC_ROOM} nick=${MCP_BOT_NICKNAME}`
    );
  } catch (error) {
    console.error('[XMPP] Failed to start debug agent:', error.message);
  }
}






let buffer = '';

process.stdin.on('data', (chunk) => {
  try {
    buffer += chunk.toString();

    let boundary;
    while ((boundary = buffer.indexOf('\n')) !== -1) {
      const line = buffer.substring(0, boundary).trim();
      buffer = buffer.substring(boundary + 1);
      if (!line) continue;

      try {
        const request = JSON.parse(line);
        console.error('[Server] Received request:', JSON.stringify(request, null, 2));

        const method = request.method;
        const params = request.params || {};

        if (method === 'initialize') {
          const response = createResponse(request.id, {
            serverInfo: { name: 'tia-agents-mcp', version: '1.0.0' },
            capabilities: {
              resources: {},
              tools: {},
              prompts: {}
            }
          });
          process.stdout.write(response);
        } else if (method === 'notifications/initialized') {

          console.error('[Server] Client initialized');
        } else if (method === 'tools/list') {
          const response = createResponse(request.id, {
            tools: [
              {
                name: 'echo',
                description: 'Echo back a message',
                inputSchema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', description: 'The message to echo back' }
                  },
                  required: ['message']
                }
              },
              {
                name: 'xmppStatus',
                description: 'Get XMPP connection status and last received message',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'xmppSend',
                description: 'Send a test message via XMPP',
                inputSchema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', description: 'The message to send' }
                  },
                  required: ['message']
                }
              }
            ]
          });
          process.stdout.write(response);
        } else if (method === 'tools/call') {
          const toolName = params.name;
          const args = params.arguments || {};

          if (toolName === 'echo') {
            const message = args.message || '';
            const response = createResponse(request.id, {
              content: [{ type: 'text', text: `Echo: ${message}` }]
            });
            process.stdout.write(response);
          } else if (toolName === 'xmppStatus') {

            if (!state.xmppReady) {
              console.error('[XMPP] Starting connection on demand...');
              startXmpp().catch(err => console.error('[XMPP] Startup failed:', err));
            }

            const response = createResponse(request.id, {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  connected: state.xmppReady && state.xmppAgent?.isInRoom,
                  room: MUC_ROOM,
                  nickname: MCP_BOT_NICKNAME,
                  lastIncoming: state.lastIncoming
                }, null, 2)
              }]
            });
            process.stdout.write(response);
          } else if (toolName === 'xmppSend') {
            const message = args.message || 'XMPP test message';


            if (!state.xmppReady) {
              console.error('[XMPP] Starting connection on demand...');
              startXmpp().catch(err => console.error('[XMPP] Startup failed:', err));

              const response = createResponse(request.id, null, {
                code: -32001,
                message: 'XMPP connecting, try again shortly'
              });
              process.stdout.write(response);
            } else {
              getXmppAgent()
                .sendGroupMessage(message)
                .then(() => {
                  const response = createResponse(request.id, {
                    content: [{
                      type: 'text',
                      text: JSON.stringify({ sent: true, to: MUC_ROOM, message }, null, 2)
                    }]
                  });
                  process.stdout.write(response);
                })
                .catch((err) => {
                  const response = createResponse(request.id, null, {
                    code: -32002,
                    message: `XMPP send failed: ${err.message}`
                  });
                  process.stdout.write(response);
                });
            }
          } else {
            const response = createResponse(request.id, null, {
              code: -32601,
              message: `Unknown tool: ${toolName}`
            });
            process.stdout.write(response);
          }
        } else {
          const response = createResponse(request.id, null, {
            code: -32601,
            message: 'Method not found'
          });
          process.stdout.write(response);
        }
      } catch (error) {
        console.error('[Server] Error processing request:', error);
      }
    }
  } catch (error) {
    console.error('[Server] Fatal error in data handler:', error);
  }
});

console.error('[Server] MCP debug server is running on stdio');

process.on('SIGINT', () => {
  console.error('\n[Server] Shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n[Server] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n[Server] Unhandled rejection:', reason);
});

console.error('[Server] Ready to accept connections');
</file>

<file path="_README.md">
# TIA
TIA Intelligence Agency

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/danja/tia)

An experimental XMPP (Jabber) client library and AI bot framework for Node.js.

## Overview (user-first)

This project provides both basic XMPP client examples and a complete AI-powered chatbot service. It includes examples for connecting to XMPP servers, sending and receiving messages, working with Multi-User Chat (MUC) rooms, and deploying AI agents that can participate in conversations using the Mistral AI API.

- **What you can do right away**
  - Run a Mistral-powered bot in a MUC or DM.
  - Run a Semem-backed agent that can `tell/ask/augment` via Semem MCP.
  - Use a demo bot for quick checks.
  - Run a Prolog agent with tau-prolog for logic queries.
  - Use the MCP debug agent for XMPP connectivity tests.
  - Run live XMPP integration tests (see testing docs).

- **Docs (user-first)**
  - Agent capabilities & commands: `docs/agents.md`
  - Testing & env setup: `docs/testing.md`
  - MCP server details & XMPP debug hooks: `docs/mcp.md`
  - MCP client guide: `docs/mcp-client.md`
  - MCP server guide: `docs/mcp-server.md`
  - Server/systemd setup: `docs/server.md`
  - Debate/Chair/Recorder notes: `docs/debating-society.md`
  - Lingue integration: `docs/lingue-integration.md`
  - API reference: `docs/api-reference.md`

## Deploying the bots

1) Install deps
```bash
npm install
```

2) Set secrets/env (root `.env`)
```
NODE_TLS_REJECT_UNAUTHORIZED=0
LINGUE_ENABLED=true
MISTRAL_API_KEY=...
SEMEM_AUTH_TOKEN=...
SEMEM_BASE_URL=https://mcp.tensegrity.it
# optional: LOG_FILE=logs/agents.log LOG_LEVEL=info
```

3) Set agent profiles (XMPP creds/resources)
- Edit `config/agents/*.ttl` for each agent (mistral, semem, demo, data, chair, recorder). Each file defines:
  - `xmpp.service/domain/username/password/resource`
  - `roomJid` (e.g., `general@conference.tensegrity.it`)
  - Provider settings (model, Semem base URL, etc.)
- Do not rely on `.env` for XMPP usernames/resources; profiles must be correct and distinct.

4) Start scripts
- All agents: `./start-all-agents.sh`
- Debate-only (chair + recorder): `./start-debate-agents.sh`
- Individual agents: `AGENT_PROFILE=<name> node src/services/<agent>.js`

5) Systemd (server)
- Use `misc/tia-agents.service` (see `docs/server.md`): copy to `/etc/systemd/system/`, `systemctl daemon-reload`, `systemctl enable --now tia-agents.service`.

6) Troubleshooting
- Ensure each agent has a unique XMPP account/resource; if the server disallows multiple resources on one account, use separate usernames.
- Check logs: set `LOG_FILE`/`LOG_LEVEL`, or `journalctl -u tia-agents.service -f` when running under systemd.

## Prerequisites

- Node.js (v14 or higher)
- An XMPP server (e.g., Prosody, ejabberd, Openfire)
- Valid XMPP user credentials
- (Optional) Mistral AI API key for AI bot features

## Installation

```bash
npm install
```

## Quick Start

## Examples

### Basic XMPP Examples

1. **hello-world.js** - Self-messaging example
2. **call-alice.js** - Send a message to another user  
3. **alice.js** - Listen for incoming messages
4. **test-muc.js** - Multi-User Chat (MUC) room example
5. **create-muc-room.js** - Creates MUC rooms with proper protocol
6. **test-bot-interaction.js** - Test MistralBot responses
7. **discover-xmpp-services.js** - Discover available XMPP services
8. **list-users.js** - List server information (limited by XMPP privacy)

To run the basic examples a user needs to be created:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/add-users.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/hello-world.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/call-alice.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/alice.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-muc.js
```

### XMPP Client REPL

A CLI REPL client for interactive XMPP communication:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js danja Claudiopup
```

Commands:
- `/help` - Show available commands
- `/to <jid>` - Set message target (e.g., `/to alice@xmpp`)
- `/join <room>` - Join MUC room (e.g., `/join general@conference.xmpp`)
- `/leave` - Leave current room
- `/quit` - Exit client

### MUC Room Setup

**Important:** The MistralBot requires the MUC room `general@conference.xmpp` to exist. Create it first:

```bash
# Create the required MUC room
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/create-muc-room.js
```

This script:
- Connects as admin user
- Creates the `general@conference.xmpp` room with proper MUC protocol
- Configures it as an instant (public) room
- Sends a welcome message

**Alternative manual method:**
```sh
# Create users manually if add-users.js has issues
docker exec tbox-xmpp-1 bash -c 'echo -e "Claudiopup\nClaudiopup" | prosodyctl adduser danja@xmpp'
```

### AI Bot Services

#### MistralBot - AI-Powered Chat Assistant

A complete XMPP chatbot that uses Mistral AI to provide intelligent responses in chat rooms and direct messages.

**Setup:**

1. **Get a Mistral AI API key** from [Mistral AI](https://mistral.ai/)

2. **Configure the bot:**
   ```bash
   cp .env.example .env
   # Edit .env and add: MISTRAL_API_KEY=your_api_key_here
   ```

3. **Create the MUC room (required):**
   ```bash
   NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/create-muc-room.js
   ```

4. **Start the AI bot:**
   ```bash
   ./start-mistral-bot.sh
   ```

5. **Test the bot:**
   ```bash
   # Automated test
   NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-bot-interaction.js
   
   # Or use the interactive REPL
   NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js danja Claudiopup
   # Then: /join general@conference.xmpp
   # Then: MistralBot, hello there!
   ```

6. **Test with demo bot (no API key required):**
   ```bash
   ./start-demo-bot.sh
   ```

**Bot Features:**
- 🤖 Responds to mentions: "Hey MistralBot, what's the weather?"
- 💬 Joins MUC rooms: `general@conference.xmpp`
- 📱 Handles direct messages
- ⚙️ Configurable via `.env` file
- 🛡️ Graceful error handling

**Interaction Examples:**
- In chat room: "MistralBot, explain quantum computing"
- Direct message: Send to `dogbot@xmpp`
- Bot prefix: "bot: help me with this problem"

#### Lingue/IBIS Awareness (NL-first)
- Lingue features are on by default (`LINGUE_ENABLED=true`). The bot advertises Lingue capabilities via XEP-0030, detects Issues/Positions/Arguments in natural language, and posts short meta-transparent summaries when confidence exceeds `LINGUE_CONFIDENCE_MIN` (default `0.5`).
- Mention the bot (`MistralBot`, `bot: ...`, or `@mistralbot`) to trigger both a normal reply and, when confidence is high, an IBIS summary in the room. In DMs, summaries are sent privately.
- Environment flags:
  ```bash
  LINGUE_ENABLED=true            # disable with false
  LINGUE_CONFIDENCE_MIN=0.6      # raise to reduce summary frequency
  ```
  - To see it in action quickly:
  1. Ensure the MUC exists: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/create-muc-room.js`.
  2. Start the bot: `./start-mistral-bot.sh`.
  3. Join `general@conference.xmpp` and send:  
     `MistralBot, Issue: How should we handle authentication? I propose OAuth2 because it is standard, but the downside is complexity.`  
     The bot will reply and, if confident, post an IBIS-style summary.

#### Prolog Agent

Uses tau-prolog to evaluate Prolog queries. Example usage:
```
Prolog, tell parent(bob, alice).
Prolog, ask parent(bob, alice).
Prolog, parent(bob, alice).\n?- parent(bob, alice).
```

Start it with:
```bash
AGENT_PROFILE=prolog node src/services/prolog-agent.js
```

#### MCP Loopback Agent

Useful for MCP client/server smoke checks.

```bash
AGENT_PROFILE=mcp-loopback MCP_LOOPBACK_MODE=in-memory node src/services/mcp-loopback-agent.js
```

## Library Usage

```javascript
import { AgentRunner, LingueNegotiator, LINGUE, Handlers } from "tia-agents";

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({ profile, provider, negotiator });
await runner.start();
```

See `examples/minimal-agent.js` for a runnable local example.
- Demos (offline, no XMPP):
  - `node src/examples/lingue-detect-demo.js` — detect IBIS structure and view Turtle output.
  - `node src/examples/lingue-exchange-demo.js` — simulate two agents negotiating/accepting a structured exchange and inspecting stored positions.

### Tests
```bash
npm test
```
- Tag format: "@mistralbot can you help?"
- XMPP integration check (requires live server and env set: `XMPP_SERVICE`, `XMPP_DOMAIN`, `XMPP_USERNAME`, `XMPP_PASSWORD`, `MUC_ROOM`):
  ```bash
  NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration
  ```
  (The test allows self-messages so it can observe its own post in the room; ensure your MUC reflects messages to the sender.)
- Bot-in-MUC checks (run via the same `test:integration`, but gated by env):
  - Mistral bot test runs when `MISTRAL_API_KEY` is set (skip with `RUN_MISTRAL_BOT_TEST=false`).
  - Semem agent test runs only when `RUN_SEMEM_BOT_TEST=true` (assumes Semem endpoint reachable). Set `SEMEM_NICKNAME`/`AGENT_NICKNAME` if you need a specific name.
  - Semem tell/ask roundtrip runs when `RUN_SEMEM_BOT_TEST=true` (sends `tell Semem that Glitch is a canary` then asks `what is Glitch?` to verify storage/retrieval).
- Direct Semem check (no XMPP): `node src/examples/semem-direct-test.js "Glitch is a canary" "What is Glitch?"`

### Semem Agent (chat via Semem MCP)

An XMPP agent that routes replies through the remote Semem MCP HTTP interface (see `semem/docs/agent-contract.md`).

**Run it:**
```bash
./start-semem-agent.sh
```

Defaults:
- `SEMEM_BASE_URL=https://mcp.tensegrity.it` (override if you host Semem elsewhere)
- Uses the same `XMPP_*` and `MUC_ROOM` env vars as MistralBot.
- Nickname config (sits happily in `.env` when running multiple bots):
  - `SEMEM_NICKNAME` (default profile) or `SEMEM_LITE_NICKNAME` (lite profile)
  - `AGENT_NICKNAME` overrides either profile for a one-off run (e.g., systemd drop-in)
  - `AGENT_RESOURCE` / `XMPP_RESOURCE` sets the XMPP resource; defaults to the nickname for clarity in MUC logs
- Replies when mentioned in the room (`Semem`, `bot:`, or `semem:`) or in direct messages.

The agent uses `/chat/enhanced` for answers and mirrors each exchange into `/tell` with lightweight metadata for retrieval.

Profiles:
- Pick with `AGENT_PROFILE=<name>`; the registry lives in `src/services/agent-registry.js` (default and lite included). Each profile can tweak Semem features, nickname, and MUC.
- Quick Semem-only smoke test (no XMPP): `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-semem-agent.js "your question here"`

### Start all agents (systemd-friendly)

To launch multiple agents under one supervisor (semem, mistral variants, demo, data, prolog, chair, recorder), run:
```bash
./start-all-agents.sh
```

Environment knobs:
- `AGENTS`: comma list to limit which agents start (default: all known). Options: `semem`, `mistral`, `analyst`, `creative`, `chair`, `recorder`, `demo`, `prolog`, `data`.
- `AGENT_PROFILE`: passed through to Semem agent.
- `MISTRAL_API_KEY` required if `mistral` is included; missing keys cause that agent to be skipped with a warning.

#### Creating Your Own AI Agent

Use the dogbot framework to create custom AI agents:

1. **Copy the MistralBot template:**
   ```bash
   cp src/services/mistral-bot.js src/services/my-agent.js
   ```

2. **Customize your agent:**
   ```javascript
   // Edit src/services/my-agent.js
   
   // Change bot configuration
   const BOT_NICKNAME = "MyAgent";
   const MUC_ROOM = "myroom@conference.xmpp";
   
   // Customize system prompt
   const systemPrompt = `You are MyAgent, a specialized assistant for...`;
   
   // Add custom response logic
   const shouldRespond = body.includes("myagent") || 
                        body.startsWith("agent:");
   ```

3. **Create a startup script:**
   ```bash
   cp start-mistral-bot.sh start-my-agent.sh
   # Edit start-my-agent.sh to use your service file
   ```

4. **Configure environment:**
   ```bash
   # In .env file
   XMPP_USERNAME=myagent
   MUC_ROOM=myroom@conference.xmpp
   BOT_NICKNAME=MyAgent
   ```

5. **Create XMPP user:**
   ```bash
   # For TBox users
   echo -e "password\npassword" | docker exec -i tbox-xmpp-1 prosodyctl adduser myagent@xmpp
   ```

**Agent Customization Options:**
- **Different AI Models**: Change `MISTRAL_MODEL` in .env
- **Custom Triggers**: Modify `shouldRespond` logic  
- **Multiple Rooms**: Join different MUC rooms
- **Scheduled Messages**: Add cron-like functionality
- **External APIs**: Integrate weather, news, databases
- **Personality**: Customize system prompts
- **Response Filtering**: Add content moderation

## Configuration

### Environment Variables (.env)

```bash
# Required for AI features
MISTRAL_API_KEY=your_mistral_api_key_here

# XMPP Configuration (optional overrides)
XMPP_SERVICE=xmpp://localhost:5222
XMPP_DOMAIN=xmpp  
XMPP_USERNAME=dogbot
XMPP_PASSWORD=woofwoof

# MUC Configuration
MUC_ROOM=general@conference.xmpp
BOT_NICKNAME=MistralBot

# AI Model Selection
MISTRAL_MODEL=mistral-small-latest

# TLS Configuration (for self-signed certificates)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Deployment Options

### Development
```bash
./start-demo-bot.sh        # Demo mode (no API key)
./start-mistral-bot.sh     # Full AI mode
```

### Production
- **Docker**: Add to docker-compose.yml
- **PM2**: Use PM2 for process management
- **Systemd**: Create system service
- **Cron**: Schedule startup on reboot

## Features

### Core XMPP Features
- ✅ XMPP client connection with TLS support
- ✅ Message sending and receiving
- ✅ Multi-User Chat (MUC) support
- ✅ Error handling and reconnection logic
- ✅ Self-signed certificate support

### AI Bot Features  
- 🤖 Mistral AI integration for intelligent responses
- 💬 MUC room participation
- 📱 Direct message handling
- ⚙️ Environment-based configuration
- 🛡️ Graceful error handling and shutdown
- 🔄 Extensible agent framework

### Developer Features
- 📚 Complete examples and documentation
- 🔧 Easy customization and extension
- 🚀 Quick deployment scripts
- 🧪 Demo mode for testing
- 📝 Comprehensive error messages

## Troubleshooting

### Common Issues

**Connection Errors:**
- Ensure XMPP server is running: `docker ps | grep xmpp`
- Check TLS settings: `NODE_TLS_REJECT_UNAUTHORIZED=0`
- Verify user exists: `docker exec tbox-xmpp-1 prosodyctl user list xmpp`

**API Errors:**
- Check Mistral API key in `.env`
- Verify API quota and billing
- Test with demo bot first

**MUC Issues:**
- Ensure conference component is enabled in Prosody
- Check room permissions and creation settings
- Verify bot has joined room successfully


## License

MIT
</file>

<file path=".env.example">
# Mistral AI Configuration
MISTRAL_API_KEY=your_mistral_api_key_here

  XMPP_SERVICE=xmpp://tensegrity.it:5222
  XMPP_DOMAIN=tensegrity.it 
  XMPP_USERNAME=bot          # from step 2
  XMPP_PASSWORD=yourpass
  MUC_ROOM=general@conference.tensegrity.it
  NODE_TLS_REJECT_UNAUTHORIZED=1
  LINGUE_ENABLED=true

MISTRAL_API_KEY=your API key

SEMEM_NICKNAME=Semem
AGENT_RESOURCE=Semem
SEMEM_LITE_NICKNAME=SL
BOT_NICKNAME=Misty
XMPP_RESOURCE=Misty
</file>

<file path="start-semem-agent.sh">
cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo "Loading configuration from .env"
  source .env
fi

echo "Starting Semem agent..."
echo "  Agent Profile: ${AGENT_PROFILE:-default}"
echo "  XMPP Server: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-xmpp}"
echo "  Username: ${XMPP_USERNAME:-dogbot}"
echo "  Resource: ${AGENT_RESOURCE:-${XMPP_RESOURCE:-${SEMEM_NICKNAME:-${SEMEM_LITE_NICKNAME:-${AGENT_NICKNAME:-<profile default>}}}}}"
echo "  MUC Room: ${MUC_ROOM:-general@conference.xmpp}"
echo "  Bot Nickname: ${SEMEM_NICKNAME:-${SEMEM_LITE_NICKNAME:-${AGENT_NICKNAME:-<profile default>}}}"
echo "  Semem API: ${SEMEM_BASE_URL:-https://mcp.tensegrity.it}"
echo ""
echo "Press Ctrl+C to stop."

node src/services/semem-agent.js
</file>

<file path="docs/agent-dev-prompt.md">
You are a coding agent updating tia-agents. Read the following files before making changes:
- `docs/agents.md` (capabilities and commands)
- `docs/testing.md` (env/tests)
- `docs/mcp.md` (MCP endpoints and XMPP debug)
- `docs/server.md` (systemd/runtime)
- `docs/debating-society.md` (Chair/Recorder behavior)
- `config/agents/*.ttl` for the agent you are modifying (XMPP creds, nick/resource, roomJid, provider settings)
- `vocabs/lingue.ttl` for Lingue vocabulary references
- `src/agents/core/*` (agent runner, mention detector, command parser)
- Provider files under `src/agents/providers/*` relevant to the agent
- Start scripts (`start-all-agents.sh`, `start-debate-agents.sh`)
- The agent service file in `src/services/<agent>.js`
- `src/lib/history/*` if you need per-agent conversation context

Procedure to create a new agent:
1) Add a profile file under `config/agents/<name>.ttl` with XMPP service/domain/username/passwordKey/resource and roomJid; keep XMPP passwords in `config/agents/secrets.json` and API keys/tokens in `.env`.
2) If you need a new behavior, add a provider under `src/agents/providers/` implementing `handle({command, content, metadata, ...})`.
3) Wire the agent entry point in `src/services/<name>.js` using `AgentRunner`, the provider, `createMentionDetector(nickname)`, and `defaultCommandParser`. Do not hardcode nick/resource; load from the profile.
4) If the agent is Lingue-capable, add `LingueNegotiator` + handlers based on `profile.supportsLingueMode()` and pass `negotiator` into the runner.
5) Add a start script if needed or register the agent in `run-all-agents.js` with `AGENT_PROFILE=<name>`.
6) Update docs if behavior is user-facing; add tests where feasible (Vitest for profile loading/logic).
7) Ensure XMPP usernames/resources remain distinct; do not fall back to "bot".

Lingue checklist:
- Add `lng:supports`, `lng:prefers`, and `lng:profile` to the agent profile.
- Use `LingueNegotiator` in the service file with handlers for supported modes.
- Keep MUC messages human-readable via `summary` in structured payloads.

## Custom Agent API (library usage)
Minimal setup using the exported API:
```javascript
import {
  AgentRunner,
  loadAgentProfile,
  createMentionDetector,
  LingueNegotiator,
  LINGUE,
  Handlers,
  InMemoryHistoryStore
} from "tia-agents";

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const profile = await loadAgentProfile("demo");
const xmppConfig = profile.toConfig().xmpp;

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({
  xmppConfig,
  roomJid: profile.roomJid,
  nickname: profile.nickname,
  provider: new EchoProvider(),
  negotiator,
  mentionDetector: createMentionDetector(profile.nickname),
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});

await runner.start();
```

Notes:
- Profiles are RDF-based; see `config/agents/*.ttl` and `config/agents/secrets.json`.
- For Mistral providers, pass `historyStore` into the provider to keep context across API calls.
</file>

<file path="docs/mcp-server.md">
# MCP Server Guide

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that enables AI assistants like Claude to securely connect to external data sources and tools. MCP servers expose capabilities (tools, resources, prompts) that AI clients can discover and use dynamically.

TIA implements MCP servers that expose XMPP chat operations and semantic processing capabilities, allowing AI assistants to participate in chat rooms, negotiate structured dialogue modes (Lingue), and interact with knowledge graphs via SPARQL.

## Architecture

TIA's MCP server implementation (`src/mcp/server-bridge.js`) provides:
- **stdio transport**: Standard JSON-RPC 2.0 communication over stdin/stdout
- **Tool registration**: Dynamic tool discovery and invocation
- **XMPP integration**: Bridge between MCP calls and XMPP operations
- **Lingue support**: Structured dialogue negotiation (IBIS, Prolog, profile exchange)

## Available MCP Servers

### 1. Chat + Lingue Server (stdio)

**Purpose**: Exposes XMPP multi-user chat (MUC) and Lingue protocol operations as MCP tools.

**Start the server:**
```bash
node src/mcp/servers/tia-mcp-server.js
```

**Tools exposed:**

- **`sendMessage`**: Send a message to the MUC room or direct message a specific JID
  - Parameters: `text` (string), `directJid` (string, optional)
  - Use case: Post messages to chat rooms, send DMs

- **`offerLingueMode`**: Negotiate a structured dialogue mode with a peer
  - Parameters: `peerJid` (string), `modes` (array of strings)
  - Modes: `human-chat`, `ibis-text`, `prolog-program`, `profile-exchange`
  - Use case: Switch from free-form chat to structured formats (IBIS debate, Prolog queries)

- **`getProfile`**: Retrieve the agent's RDF profile as Turtle
  - Parameters: none
  - Returns: Agent capabilities, supported modes, endpoints as RDF
  - Use case: Discover agent capabilities, share semantic metadata

- **`getRecentMessages`**: Return recent chat messages seen by the MCP agent
  - Parameters: `limit` (number, optional, max 200)
  - Returns: JSON array of `{ body, sender, from, roomJid, type, timestamp }`
  - Use case: Poll for replies without a streaming connection

- **`summarizeLingue`**: Analyze text and generate IBIS-style structured summary
  - Parameters: `text` (string)
  - Returns: Detected IBIS elements (Issues, Positions, Arguments)
  - Use case: Extract structured debate elements from conversation

**Configuration:**
If `AGENT_PROFILE` is set, the server loads that profile from `config/agents/*.ttl`.
If `AGENT_PROFILE` is not set, the server auto-creates a transient profile and auto-registers a new XMPP account:
- Username/nick: `mcp-###` (random 3-digit suffix)
- Room: `MUC_ROOM` (default `general@conference.tensegrity.it`)
- Service/domain: `XMPP_SERVICE`/`XMPP_DOMAIN`

Outgoing group messages are queued until the agent confirms it has joined the MUC.

### 2. SPARQL Server

**Purpose**: Provides SPARQL query and update operations against remote endpoints (e.g., DBpedia, Wikidata, custom triple stores).

**Start the server:**
```bash
SPARQL_QUERY_ENDPOINT=https://dbpedia.org/sparql \
SPARQL_UPDATE_ENDPOINT=https://dbpedia.org/sparql \
node src/mcp/servers/sparql-server.js
```

**Tools exposed:**

- **`sparqlQuery`**: Execute SPARQL SELECT/ASK/CONSTRUCT queries
  - Parameters: `query` (string), `endpoint` (string, optional override)
  - Returns: JSON results or RDF serialization
  - Use case: Query knowledge graphs, retrieve linked data

- **`sparqlUpdate`**: Execute SPARQL INSERT/DELETE/UPDATE operations
  - Parameters: `update` (string), `endpoint` (string, optional override)
  - Returns: Update confirmation
  - Use case: Modify triple stores, add facts to knowledge graphs

**Example queries:**
```sparql
# Find information about a person
SELECT ?property ?value WHERE {
  <http://dbpedia.org/resource/Albert_Einstein> ?property ?value .
} LIMIT 10

# Find all programming languages
SELECT ?lang ?label WHERE {
  ?lang a dbo:ProgrammingLanguage .
  ?lang rdfs:label ?label .
  FILTER (lang(?label) = 'en')
} LIMIT 20
```

### 3. MCP Loopback Agent

**Purpose**: Test/debug agent that echoes MCP calls back for integration testing.

**Start the server:**
```bash
AGENT_PROFILE=mcp-loopback MCP_LOOPBACK_MODE=in-memory node src/services/mcp-loopback-agent.js
```

**Modes:**
- `in-memory` (default): Server runs in same process
- `stdio`: External stdio server for testing transport

## Using TIA MCP Servers with Claude Code

Claude Code (and other MCP clients like Claude Desktop) can connect to TIA's MCP servers to gain new capabilities.

### Setup for Claude Code

**1. Add the server to your MCP configuration:**

Edit your Claude Code MCP settings (typically `~/.config/claude-code/mcp.json` or via CLI):

```bash
claude mcp add tia-chat node /path/to/tia/src/mcp/servers/tia-mcp-server.js
```

Or manually add to your config:
```json
{
  "mcpServers": {
    "tia-chat": {
      "command": "node",
      "args": ["/path/to/tia/src/mcp/servers/tia-mcp-server.js"],
      "env": {
        "AGENT_PROFILE": "mistral"
      }
    }
  }
}
```
Omit `AGENT_PROFILE` to have the server auto-register a transient `mcp-###` user.

**2. Restart Claude Code to load the new server**

**3. Verify the tools are available:**

Ask Claude: "What MCP tools do you have access to?"

You should see `sendMessage`, `offerLingueMode`, `getProfile`, and `summarizeLingue`.
You should also see `getRecentMessages`.

### Example Usage

**Send a message to your XMPP chat room:**
```
Claude, please use sendMessage to post "Hello from Claude Code!" to the chat room.
```

**Analyze a conversation for IBIS structure:**
```
Claude, use summarizeLingue to analyze this text:
"Issue: Should we use REST or GraphQL?
Position: Use GraphQL because it's more flexible.
Argument: GraphQL allows clients to request exactly what they need."
```

**Retrieve agent capabilities:**
```
Claude, use getProfile to show me what this agent can do.
```

**Poll for recent chat messages:**
```
Claude, use getRecentMessages to fetch the last 10 messages from the room.
```

**Query DBpedia (with SPARQL server configured):**
```
Claude, use sparqlQuery to find 10 facts about Ada Lovelace from DBpedia.
```

### Advanced: Multiple Server Configuration

You can run multiple TIA MCP servers simultaneously for different purposes:

```json
{
  "mcpServers": {
    "tia-chat": {
      "command": "node",
      "args": ["/path/to/tia/src/mcp/servers/tia-mcp-server.js"],
      "env": {
        "AGENT_PROFILE": "mistral"
      }
    },
    "tia-sparql": {
      "command": "node",
      "args": ["/path/to/tia/src/mcp/servers/sparql-server.js"],
      "env": {
        "SPARQL_QUERY_ENDPOINT": "https://dbpedia.org/sparql"
      }
    }
  }
}
```

## Troubleshooting

**Server not connecting:**
- Check that Node.js is in your PATH
- Verify the script path is absolute
- Check logs in Claude Code's MCP output panel

**XMPP authentication failures:**
- Ensure `config/agents/secrets.json` contains valid credentials
- Verify XMPP server is reachable
- Check `AGENT_PROFILE` points to a valid profile in `config/agents/`

**SPARQL errors:**
- Verify endpoint URL is correct and accessible
- Check query syntax (try in a SPARQL client first)
- Some endpoints require authentication (configure via env vars)

## Development

**Creating custom MCP tools:**

1. Extend `src/mcp/tool-definitions.js` with new tool schemas
2. Implement handlers that call XMPP/Lingue operations via `chatAdapter`
3. Register tools in `McpServerBridge`

**Testing:**
```bash
# Test stdio communication
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node src/mcp/servers/tia-mcp-server.js

# Integration tests
npm test -- --grep "MCP"
```

## System Configuration

Runtime system settings live in `config/system.ttl`. This file is read via `rdf-ext` at startup.

- `sys:maxAgentRounds` controls how many consecutive agent-to-agent turns are allowed before
  agents start ignoring unaddressed messages (default: 5). Recorder keeps its own override.

## See Also

- [MCP Client Guide](mcp-client.md) - Using TIA agents as MCP clients
- [Lingue Integration](lingue-integration.md) - Structured dialogue modes
- [Agent Profiles](agents.md) - Configuring agent capabilities
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Official protocol docs
</file>

<file path="src/services/mcp-loopback-agent.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { McpLoopbackProvider } from "../agents/providers/mcp-loopback-provider.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { autoConnectXmpp } from "../lib/xmpp-auto-connect.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mcp-loopback";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Loopback agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Loopback agent profile is missing nickname or XMPP username");
}


console.log(`[MCP Loopback] Connecting as ${fileConfig.xmpp?.username}@${fileConfig.xmpp?.domain}`);
const { credentials } = await autoConnectXmpp({
  service: fileConfig.xmpp?.service || process.env.XMPP_SERVICE,
  domain: fileConfig.xmpp?.domain || process.env.XMPP_DOMAIN,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" },
  autoRegister: true,
  logger
});

if (credentials.registered) {
  console.log(`[MCP Loopback] ✅ New account registered: ${credentials.username}`);
  console.log(`[MCP Loopback] Password saved to config/agents/secrets.json`);
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service || process.env.XMPP_SERVICE,
  domain: fileConfig.xmpp?.domain || process.env.XMPP_DOMAIN,
  username: credentials.username,
  password: credentials.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username) {
  throw new Error("Loopback agent XMPP config incomplete; check profile file and environment");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;
const LOOPBACK_MODE = process.env.MCP_LOOPBACK_MODE || "in-memory";

const provider = new McpLoopbackProvider({
  profile,
  logger,
  mode: LOOPBACK_MODE
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting MCP loopback agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start MCP loopback agent:", err);
  process.exit(1);
});
</file>

<file path="src/services/prolog-agent.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { createPrefixedCommandParser, defaultCommandParser } from "../agents/core/command-parser.js";
import { PrologProvider } from "../agents/providers/prolog-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { loadSystemConfig } from "../lib/system-config.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, PrologProgramHandler } from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "prolog";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Prolog agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Prolog agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Prolog agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;

const provider = new PrologProvider({ nickname: BOT_NICKNAME, logger });

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROLOG_PROGRAM)) {
  handlers[LANGUAGE_MODES.PROLOG_PROGRAM] = new PrologProgramHandler({
    logger,
    onPayload: async ({ payload }) => {
      return provider.handle({
        command: "chat",
        content: payload
      });
    }
  });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: createPrefixedCommandParser([
    `${BOT_NICKNAME.toLowerCase()},`,
    `${BOT_NICKNAME.toLowerCase()}:`
  ]),
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Prolog agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start Prolog agent:", err);
  process.exit(1);
});
</file>

<file path="test/profile-loading.test.js">
import "./helpers/agent-secrets.js";
import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/services/agent-registry.js";
import fs from "fs";
import path from "path";

const configDir = path.join(process.cwd(), "config", "agents");

describe("agent profile loading", () => {
  it("loads semem profile from file", async () => {
    const profile = await loadAgentProfile("semem");
    expect(profile.nickname.toLowerCase()).toBe("semem");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("semem");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("semem");
  });

  it("loads mistral profile from file", async () => {
    const profile = await loadAgentProfile("mistral");
    expect(profile.nickname.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.service).toBe("xmpp://tensegrity.it:5222");
    expect(profile.xmppConfig.password).toBe("mistralpass");
  });

  it("loads demo profile from file", async () => {
    const profile = await loadAgentProfile("demo");
    expect(profile.nickname.toLowerCase()).toBe("demo");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("demo");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("demo");
  });

  it("falls back to default when profile missing", async () => {
    const profile = await loadAgentProfile("nonexistent-profile-xyz");
    expect(profile.profileName).toBe("default");
    expect(profile.nickname).toBe("Semem");
  });

  it("profile files exist", () => {
    ["semem", "mistral", "demo"].forEach((name) => {
      const file = path.join(configDir, `${name}.ttl`);
      expect(fs.existsSync(file)).toBe(true);
    });
  });
});
</file>

<file path="AGENTS.md">
# Repository Guidelines

## Project Structure & Modules
- `src/services`: Long-running bots (`mistral-bot.js`, `demo-bot.js`, `prolog-agent.js`, `mcp-loopback-agent.js`) started via the helper shell scripts.
- `src/examples`: Task-focused scripts for XMPP setup, MUC creation, and message flow testing; runnable directly with `node`.
- `src/lib`: Connection utilities for XMPP plus logging helpers; keep shared logic here.
- `src/client`: CLI REPL for interactive chats during manual verification.
- `src/mcp`: Model Context Protocol client/server bridges and test servers; integrations belong here.
- `docs`, `_README.md`, `README.md`: Reference material; mirror new behavior in `README.md`.

## Setup, Build, and Run
- Install deps: `npm install`.
- Start AI bot: `./start-mistral-bot.sh` (requires `.env` with `MISTRAL_API_KEY`, optional `XMPP_*` overrides).
- Start demo bot (no API key): `./start-demo-bot.sh`.
- Start Prolog agent: `AGENT_PROFILE=prolog node src/services/prolog-agent.js`.
- Start MCP loopback agent: `AGENT_PROFILE=mcp-loopback MCP_LOOPBACK_MODE=in-memory node src/services/mcp-loopback-agent.js`.
- Create MUC room: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/create-muc-room.js`.
- REPL client: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/client/repl.js <user> <pass>`.
- Example smoke tests: `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-bot-interaction.js`. `npm test` runs unit and integration fixtures.

## Coding Style & Naming
- Node ESM (`type: "module"`); prefer `import`/`export` and avoid new CommonJS (refactor existing CJS when touched).
- Use async/await for I/O; keep logging terse via `src/lib/logger.js`.
- Two-space indentation, single-responsibility modules, and descriptive function names (`joinMUC`, `handleStanza`).
- Environment-driven config defaults live near the top of each file; keep new defaults together.
- There should be no defaults or fallbacks in the code, the parameters should be loaded from RDF profiles or secrets.json file (local to this app) or .env in the case of remote services
## Testing Guidelines
- `npm test` runs the current unit and integration test set.
- Favor runnable example scripts per feature alongside Vitest coverage.
- Name new checks after the scenario (`test-muc-joins.js`, `test-bot-interaction.js`) and place beside other examples.
- When adding behavior, supply a minimal reproduction script and expected output notes in comments or `docs/`.

## Commit & Pull Request Guidelines
- Follow the existing short imperative style seen in `git log` (e.g., `add muc helper`, `fix xmpp reconnect`); keep subjects under ~60 chars.
- One logical change per commit; include rationale in the body when behavior changes.
- PRs should state scope, how to run or reproduce, config/env needed, and screenshots or logs for UX-visible changes.

## Security & Configuration Tips
- Local Prosody uses self-signed TLS; prepend commands with `NODE_TLS_REJECT_UNAUTHORIZED=0` when connecting locally only.
- Keep API keys/tokens in `.env` (e.g., `MISTRAL_API_KEY`, `MUC_ROOM`, `BOT_NICKNAME`); keep XMPP passwords in `config/agents/secrets.json` (gitignored).
- When adding new services, thread configuration through env vars and document defaults in `README.md` and the relevant module header.
</file>

<file path="start-mistral-bot.sh">
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Found .env file, loading configuration..."
    source .env
fi


if [ -z "$MISTRAL_API_KEY" ]; then
    echo "Error: MISTRAL_API_KEY is required"
    echo ""
    echo "Option 1: Create a .env file:"
    echo "  cp .env.example .env"
    echo "  # Edit .env and add your Mistral API key"
    echo ""
    echo "Option 2: Set environment variable:"
    echo "  export MISTRAL_API_KEY=your_api_key_here"
    echo "  ./start-mistral-bot.sh"
    exit 1
fi




echo "Starting MistralBot service..."
echo "Using Mistral API for responses"
echo "Configuration:"
echo "  XMPP Server: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-xmpp}"
echo "  Username: ${XMPP_USERNAME:-dogbot}"
echo "  Resource: ${XMPP_RESOURCE:-${BOT_NICKNAME:-<nickname>}}"
echo "  MUC Room: ${MUC_ROOM:-general@conference.xmpp}"
echo "  Bot Nickname: ${BOT_NICKNAME:-MistralBot}"
echo "  Mistral Model: ${MISTRAL_MODEL:-mistral-small-latest}"
echo "  Restart on conflict: yes (auto suffix)"
echo ""
echo "To stop the bot, press Ctrl+C"
echo ""


node src/services/mistral-bot.js
</file>

<file path="docs/mcp.md">
# Model Context Protocol (MCP) Implementation

```sh
claude mcp add tia-agents npx -y -p tia-agents node ./node_modules/tia-agents/src/mcp/servers/Echo.js
```

or

```sh
codex mcp add tia-agents npx -y -p tia-agents node ./node_modules/tia-agents/src/mcp/servers/Echo.js
```

[mcp_servers.tia-agents]
command = "node"
args = ["/home/danny/hyperdata/tia/src/mcp/servers/Echo.js"]

claude mcp add tia-agents node /home/danny/hyperdata/tia/src/mcp/servers/Echo.js
 
 File modified: /home/danny/.claude.json [project: /home/danny/hyperdata/tia]

codex mcp add tia-agents --env TIA_ENV_PATH=/home/danny/hyperdata/tia/.env -- node /home/danny/hyperdata/tia/src/mcp/servers/Echo.js

[mcp_servers.tia-agents]
command = "npx"
args = ["-y", "-p", "tia-agents", "node", "-e", "import('tia-agents/src/mcp/servers/Echo.js')"]

## Overview
This document describes the MCP client and server implementation that enables JSON-RPC 2.0 based communication between processes using standard input/output.

## Client (client.js)

### Features
- Connects to the MCP server using stdio
- Sends JSON-RPC 2.0 formatted requests
- Handles responses and errors asynchronously
- Provides an interactive command-line interface

### Usage
```bash
node src/mcp/client.js
```

### Available Commands
- `help` - Show available commands
- `exit` or `quit` - Exit the client

### Request Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "echo",
  "params": {
    "message": "Your message here"
  }
}
```

## Server (servers/Echo.js)

### Features
- Implements JSON-RPC 2.0 server over stdio
- Handles multiple concurrent requests
- Provides echo functionality
- Includes comprehensive error handling

### Usage
```bash
node src/mcp/servers/Echo.js
```

### Supported Methods

#### echo
Echoes back the received message.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "echo",
  "params": {
    "message": "Hello, world!"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "content": [{
      "type": "text",
      "text": "Echo: Hello, world!"
    }]
  }
}
```

#### xmppStatus
Reports XMPP connection state for the debug agent and the last message observed in the room.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "status-1",
  "method": "xmppStatus"
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "status-1",
  "result": {
    "connected": true,
    "room": "general@conference.xmpp",
    "nickname": "McpDebug",
    "lastIncoming": {
      "body": "hello room",
      "sender": "alice",
      "from": "general@conference.xmpp/alice",
      "type": "groupchat",
      "receivedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### xmppSend
Sends a test message to the configured MUC for basic connectivity checks.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "send-1",
  "method": "xmppSend",
  "params": {
    "message": "Test message from MCP"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "send-1",
  "result": {
    "sent": true,
    "to": "general@conference.xmpp",
    "message": "Test message from MCP"
  }
}
```

### XMPP Debug Agent Configuration

The MCP server (`src/mcp/servers/Echo.js`) now spins up a lightweight XMPP participant for debugging. Configure it via `.env`:
```
XMPP_SERVICE=xmpp://localhost:5222       # or xmpps://host:5222 with NODE_TLS_REJECT_UNAUTHORIZED=0
XMPP_DOMAIN=xmpp
MUC_ROOM=general@conference.xmpp
MCP_BOT_NICKNAME=McpDebug
```

XMPP passwords are loaded from `config/agents/secrets.json` (set `AGENT_SECRETS_PATH` to override).

On startup the server will join the MUC and log any messages it sees. Use `xmppStatus` to check join state and last observed message; use `xmppSend` to post a test message into the room.

`.env` resolution:
- First looks in the current working directory (or `TIA_ENV_PATH` if set).
- Then falls back to the package root `.env` (when running from a checkout).

## Error Handling

### Common Error Codes
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32700`: Parse error

### Error Response Format
```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": "Additional error details"
  }
}
```

## Implementation Notes

### Client-Server Communication
- Uses newline-delimited JSON (JSONL) for message framing
- Each JSON-RPC message must be a single line
- Messages are expected to be valid JSON

### Dependencies
- Node.js (v14+)
- No external dependencies required

### Logging
- Server logs to stderr with `[Server]` prefix
- Client logs debug information with `[Client]` prefix
- Application output is sent to stdout

## Example Session

1. Start the server:
   ```bash
   $ node src/mcp/servers/Echo.js
   [Server] Starting simple MCP echo server
   [Server] Ready to accept connections
   ```

2. Start the client:
   ```bash
   $ node src/mcp/client.js
   Connected! Type a message or "help" for commands.
   echo> hello
   Echo: hello
   ```

3. The server will show the request/response flow:
   ```
   [Server] Received request: { ... }
   [Server] Echoing: hello
   [Server] Sending response: { ... }
   ```
</file>

<file path="src/agents/profile-loader.js">
import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { Writer } from "n3";
import { turtleToDataset } from "../lib/ibis-rdf.js";
import { AgentProfile } from "./profile/agent-profile.js";
import { XmppConfig } from "./profile/xmpp-config.js";
import { MistralProviderConfig, SememProviderConfig, DataProviderConfig } from "./profile/provider-config.js";
import { Capability } from "./profile/capability.js";

const DEFAULT_PROFILE_DIR = path.join(process.cwd(), "config", "agents");
const AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR || DEFAULT_PROFILE_DIR;
const defaultSecretsPath = (profileDir) =>
  process.env.AGENT_SECRETS_PATH || path.join(profileDir || AGENT_PROFILE_DIR, "secrets.json");
const secretsCache = new Map();

const PREFIXES = {
  agent: "https://tensegrity.it/vocab/agent#",
  foaf: "http://xmlns.com/foaf/0.1/",
  schema: "https://schema.org/",
  xmpp: "https://tensegrity.it/vocab/xmpp#",
  ai: "https://tensegrity.it/vocab/ai-provider#",
  dcterms: "http://purl.org/dc/terms/",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  lng: "http://purl.org/stuff/lingue/",
  ibis: "https://vocab.methodandstructure.com/ibis#",
  mcp: "http://purl.org/stuff/mcp/"
};




export async function loadAgentProfile(name, options = {}) {
  if (!name) return null;

  const profileDir = options.profileDir || process.env.AGENT_PROFILE_DIR || DEFAULT_PROFILE_DIR;
  const filePath = path.join(profileDir, `${name}.ttl`);

  try {
    const turtle = await fs.readFile(filePath, "utf8");
    const subjectUri = options.subjectUri || `#${name}`;
    const secrets = await loadSecrets(options.secretsPath || defaultSecretsPath(profileDir));
    const dataset = await turtleToDataset(turtle);
    const subject = rdf.namedNode(subjectUri);
    const profile = datasetToProfile(dataset, subject, {
      secrets,
      allowMissingPasswordKey: options.allowMissingPasswordKey
    });
    const baseProfiles = extractBaseProfileNames(dataset, subject);

    if (!baseProfiles.length) {
      if (!options.allowMissingPasswordKey) {
        assertXmppPassword(profile);
      }
      return profile;
    }

    const stack = new Set(options._stack || []);
    if (stack.has(name)) {
      throw new Error(`Circular profile inheritance detected: ${Array.from(stack).join(" -> ")} -> ${name}`);
    }
    stack.add(name);

    let mergedProfile = profile;
    for (const baseName of baseProfiles) {
      const baseProfile = await loadAgentProfile(baseName, {
        ...options,
        profileDir,
        secretsPath: options.secretsPath,
        _stack: Array.from(stack),
        allowMissingPasswordKey: true
      });
      mergedProfile = mergeAgentProfiles(baseProfile, mergedProfile);
    }

    if (!options.allowMissingPasswordKey) {
      assertXmppPassword(mergedProfile);
    }
    return mergedProfile;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    console.error(`[profile-loader] Failed to load ${filePath}:`, err.message);
    throw err;
  }
}




export async function parseAgentProfile(turtle, subjectUri, options = {}) {
  const dataset = await turtleToDataset(turtle);
  const subject = rdf.namedNode(subjectUri);
  const secrets = await loadSecrets(options.secretsPath);
  const profile = datasetToProfile(dataset, subject, {
    secrets,
    allowMissingPasswordKey: options.allowMissingPasswordKey
  });
  if (!options.allowMissingPasswordKey) {
    assertXmppPassword(profile);
  }
  return profile;
}




export function datasetToProfile(dataset, subject, options = {}) {
  const identifier = extractLiteral(dataset, subject, PREFIXES.schema + "identifier");
  const nickname = extractLiteral(dataset, subject, PREFIXES.foaf + "nick");
  const roomJid = extractLiteral(dataset, subject, PREFIXES.agent + "roomJid");

  const types = Array.from(
    dataset.match(subject, rdf.namedNode(PREFIXES.rdf + "type"), null)
  ).map(quad => stripPrefix(quad.object.value));

  const xmppAccount = extractXmppConfig(dataset, subject, options);
  const provider = extractProviderConfig(dataset, subject);
  const capabilities = extractCapabilities(dataset, subject);
  const lingue = extractLingueCapabilities(dataset, subject);
  const mcp = extractMcpMetadata(dataset, subject);

  const metadata = {
    created: extractLiteral(dataset, subject, PREFIXES.dcterms + "created"),
    modified: extractLiteral(dataset, subject, PREFIXES.dcterms + "modified"),
    description: extractLiteral(dataset, subject, PREFIXES.dcterms + "description")
  };

  return new AgentProfile({
    identifier,
    nickname,
    type: types,
    xmppAccount,
    roomJid,
    provider,
    capabilities,
    lingue,
    metadata,
    mcp
  });
}




function extractXmppConfig(dataset, subject, options = {}) {
  const xmppAccountNode = extractObject(dataset, subject, PREFIXES.agent + "xmppAccount");
  if (!xmppAccountNode) return null;

  const passwordKey = extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "passwordKey");
  const password = passwordKey
    ? resolveXmppPassword(passwordKey, options.secrets)
    : null;
  if (!passwordKey && !options.allowMissingPasswordKey) {
    throw new Error("Missing xmpp:passwordKey in agent profile.");
  }

  return new XmppConfig({
    service: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "service"),
    domain: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "domain"),
    username: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "username"),
    password,
    passwordKey,
    resource: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "resource"),
    tlsRejectUnauthorized: extractBoolean(dataset, xmppAccountNode,
      PREFIXES.xmpp + "tlsRejectUnauthorized", false)
  });
}




function extractProviderConfig(dataset, subject) {
  let providerNode = extractObject(dataset, subject, PREFIXES.agent + "aiProvider");
  if (providerNode) {
    return extractMistralProvider(dataset, providerNode);
  }

  providerNode = extractObject(dataset, subject, PREFIXES.agent + "mcpProvider");
  if (providerNode) {
    return extractSememProvider(dataset, providerNode);
  }

  providerNode = extractObject(dataset, subject, PREFIXES.agent + "dataProvider");
  if (providerNode) {
    return extractDataProvider(dataset, providerNode);
  }

  return null;
}




function extractMistralProvider(dataset, providerNode) {
  return new MistralProviderConfig({
    model: extractLiteral(dataset, providerNode, PREFIXES.ai + "model"),
    apiKeyEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "apiKeyEnv"),
    maxTokens: extractInteger(dataset, providerNode, PREFIXES.ai + "maxTokens"),
    temperature: extractFloat(dataset, providerNode, PREFIXES.ai + "temperature"),
    lingueEnabled: extractBoolean(dataset, providerNode,
      PREFIXES.agent + "lingueEnabled"),
    lingueConfidenceMin: extractFloat(dataset, providerNode,
      PREFIXES.agent + "lingueConfidenceMin"),
    systemPrompt: extractLiteral(dataset, providerNode, PREFIXES.ai + "systemPrompt"),
    systemTemplate: extractLiteral(dataset, providerNode, PREFIXES.ai + "systemTemplate")
  });
}




function extractSememProvider(dataset, providerNode) {
  const featuresNode = extractObject(dataset, providerNode, PREFIXES.ai + "features");
  const features = featuresNode ? {
    useWikipedia: extractBoolean(dataset, featuresNode, PREFIXES.ai + "useWikipedia", false),
    useWikidata: extractBoolean(dataset, featuresNode, PREFIXES.ai + "useWikidata", false),
    useWebSearch: extractBoolean(dataset, featuresNode, PREFIXES.ai + "useWebSearch", false)
  } : {};

  return new SememProviderConfig({
    baseUrl: extractLiteral(dataset, providerNode, PREFIXES.ai + "baseUrl"),
    authTokenEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "authTokenEnv"),
    timeoutMs: extractInteger(dataset, providerNode, PREFIXES.ai + "timeoutMs"),
    features
  });
}




function extractDataProvider(dataset, providerNode) {
  return new DataProviderConfig({
    sparqlEndpoint: extractLiteral(dataset, providerNode, PREFIXES.ai + "sparqlEndpoint"),
    extractionModel: extractLiteral(dataset, providerNode, PREFIXES.ai + "extractionModel"),
    extractionApiKeyEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "extractionApiKeyEnv"),
    maxTokens: extractInteger(dataset, providerNode, PREFIXES.ai + "maxTokens"),
    temperature: extractFloat(dataset, providerNode, PREFIXES.ai + "temperature")
  });
}




function extractCapabilities(dataset, subject) {
  const capabilityUris = Array.from(
    dataset.match(subject, rdf.namedNode(PREFIXES.agent + "hasCapability"), null)
  ).map(quad => quad.object);

  return capabilityUris.map(capUri => {
    const name = stripPrefix(capUri.value);
    const label = extractLiteral(dataset, capUri, PREFIXES.rdfs + "label");
    const description = extractLiteral(dataset, capUri, PREFIXES.dcterms + "description");
    const command = extractLiteral(dataset, capUri, PREFIXES.agent + "command");

    return new Capability({ name, label, description, command });
  });
}




function extractLingueCapabilities(dataset, subject) {
  const supports = extractObjects(dataset, subject, PREFIXES.lng + "supports")
    .map(obj => obj.value);
  const understands = extractObjects(dataset, subject, PREFIXES.lng + "understands")
    .map(obj => obj.value);
  const prefers = extractObjectValue(dataset, subject, PREFIXES.lng + "prefers");
  const profile = extractLingueProfile(dataset, subject);

  return {
    supports: new Set(supports),
    prefers,
    understands: new Set(understands),
    profile
  };
}




function extractLingueProfile(dataset, subject) {
  const profileNode = extractObject(dataset, subject, PREFIXES.lng + "profile");
  if (!profileNode) return null;

  const availability = extractObjectValue(dataset, profileNode, PREFIXES.lng + "availability");
  const inputs = extractObjectValues(dataset, profileNode, PREFIXES.lng + "in");
  const outputs = extractObjectValues(dataset, profileNode, PREFIXES.lng + "out");
  const dependencies = extractObjectValues(dataset, profileNode, PREFIXES.lng + "dependsOn")
    .concat(extractObjectValues(dataset, profileNode, PREFIXES.lng + "hasDependency"));
  const algorithmLanguage = extractLiteral(dataset, profileNode, PREFIXES.lng + "alang");
  const location = extractObjectValue(dataset, profileNode, PREFIXES.lng + "location");

  return {
    uri: profileNode.termType === "NamedNode" ? profileNode.value : null,
    availability,
    inputs,
    outputs,
    dependencies,
    algorithmLanguage,
    location
  };
}




function extractMcpMetadata(dataset, subject) {
  const isClient = hasType(dataset, subject, PREFIXES.mcp + "Client");
  if (!isClient) {
    return {
      role: null,
      servers: [],
      tools: [],
      resources: [],
      prompts: [],
      endpoints: []
    };
  }

  const tools = extractObjects(dataset, subject, PREFIXES.mcp + "providesTool").map((toolNode) => ({
    name: extractLiteral(dataset, toolNode, PREFIXES.mcp + "name"),
    description: extractLiteral(dataset, toolNode, PREFIXES.mcp + "description")
  })).filter(tool => tool.name);

  const resources = extractObjects(dataset, subject, PREFIXES.mcp + "providesResource").map((resourceNode) => ({
    name: extractLiteral(dataset, resourceNode, PREFIXES.mcp + "name"),
    uri: extractLiteral(dataset, resourceNode, PREFIXES.mcp + "uri"),
    mimeType: extractLiteral(dataset, resourceNode, PREFIXES.mcp + "mimeType")
  })).filter(resource => resource.uri || resource.name);

  const prompts = extractObjects(dataset, subject, PREFIXES.mcp + "providesPrompt").map((promptNode) => ({
    name: extractLiteral(dataset, promptNode, PREFIXES.mcp + "name"),
    description: extractLiteral(dataset, promptNode, PREFIXES.mcp + "description")
  })).filter(prompt => prompt.name);

  return {
    role: "client",
    servers: [],
    tools,
    resources,
    prompts,
    endpoints: resources.map(resource => resource.uri).filter(Boolean)
  };
}




export function profileToDataset(profile) {
  const dataset = rdf.dataset();
  const subject = rdf.namedNode(`#${profile.identifier}`);

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.foaf + "nick"),
    rdf.literal(profile.nickname)
  ));

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.schema + "identifier"),
    rdf.literal(profile.identifier)
  ));

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.agent + "roomJid"),
    rdf.literal(profile.roomJid)
  ));

  profile.type.forEach(type => {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.rdf + "type"),
      rdf.namedNode(PREFIXES.agent + type)
    ));
  });

  if (profile.xmppAccount) {
    const xmppNode = rdf.blankNode();
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.agent + "xmppAccount"),
      xmppNode
    ));

    const xmpp = profile.xmppAccount;
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "service"), rdf.literal(xmpp.service)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "domain"), rdf.literal(xmpp.domain)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "username"), rdf.literal(xmpp.username)));
    if (xmpp.passwordKey) {
      dataset.add(rdf.quad(
        xmppNode,
        rdf.namedNode(PREFIXES.xmpp + "passwordKey"),
        rdf.literal(xmpp.passwordKey)
      ));
    }
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "resource"), rdf.literal(xmpp.resource)));
  }

  if (profile.provider) {
    const providerNode = rdf.blankNode();
    let providerPredicate;
    if (profile.provider.type === 'mistral') {
      providerPredicate = PREFIXES.agent + "aiProvider";
    } else if (profile.provider.type === 'semem') {
      providerPredicate = PREFIXES.agent + "mcpProvider";
    } else if (profile.provider.type === 'data') {
      providerPredicate = PREFIXES.agent + "dataProvider";
    } else {
      providerPredicate = PREFIXES.agent + "aiProvider";
    }

    dataset.add(rdf.quad(subject, rdf.namedNode(providerPredicate), providerNode));

    const config = profile.provider.config;
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'features') {
        const predicate = PREFIXES.ai + key;
        dataset.add(rdf.quad(providerNode, rdf.namedNode(predicate), rdf.literal(String(value))));
      }
    });

    if (config.features) {
      const featuresNode = rdf.blankNode();
      dataset.add(rdf.quad(providerNode, rdf.namedNode(PREFIXES.ai + "features"), featuresNode));
      Object.entries(config.features).forEach(([key, value]) => {
        dataset.add(rdf.quad(
          featuresNode,
          rdf.namedNode(PREFIXES.ai + key),
          rdf.literal(String(value))
        ));
      });
    }
  }

  if (profile.lingue) {
    profile.lingue.supports?.forEach((modeUri) => {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "supports"),
        rdf.namedNode(modeUri)
      ));
    });

    if (profile.lingue.prefers) {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "prefers"),
        rdf.namedNode(profile.lingue.prefers)
      ));
    }

    profile.lingue.understands?.forEach((resourceUri) => {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "understands"),
        rdf.namedNode(resourceUri)
      ));
    });

    if (profile.lingue.profile) {
      const profileNode = profile.lingue.profile.uri
        ? rdf.namedNode(profile.lingue.profile.uri)
        : rdf.blankNode();

      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "profile"),
        profileNode
      ));

      if (profile.lingue.profile.availability) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "availability"),
          nodeFromValue(profile.lingue.profile.availability)
        ));
      }

      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "in",
        profile.lingue.profile.inputs, PREFIXES.lng + "Interface");
      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "out",
        profile.lingue.profile.outputs, PREFIXES.lng + "Interface");
      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "dependsOn",
        profile.lingue.profile.dependencies, PREFIXES.lng + "Dependency");

      if (profile.lingue.profile.algorithmLanguage) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "alang"),
          rdf.literal(profile.lingue.profile.algorithmLanguage)
        ));
      }

      if (profile.lingue.profile.location) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "location"),
          nodeFromValue(profile.lingue.profile.location)
        ));
      }
    }
  }

  if (profile.mcp) {
    addMcpMetadata(dataset, subject, profile.mcp);
  }

  return dataset;
}




export async function profileToTurtle(profile) {
  const dataset = profileToDataset(profile);
  const writer = new Writer({ prefixes: {
    agent: PREFIXES.agent,
    foaf: PREFIXES.foaf,
    schema: PREFIXES.schema,
    xmpp: PREFIXES.xmpp,
    ai: PREFIXES.ai,
    dcterms: PREFIXES.dcterms,
    lng: PREFIXES.lng,
    ibis: PREFIXES.ibis,
    rdfs: PREFIXES.rdfs,
    mcp: PREFIXES.mcp
  }});

  dataset.forEach((quad) => {
    writer.addQuad(quad);
  });

  return new Promise((resolve, reject) => {
    writer.end((err, result) => {
      if (err) return reject(err);
      resolve(result.trim());
    });
  });
}

async function loadSecrets(secretsPath) {
  const resolvedPath = secretsPath || defaultSecretsPath();
  if (!resolvedPath) {
    throw new Error("Agent secrets path is required to load XMPP credentials.");
  }

  if (secretsCache.has(resolvedPath)) {
    return secretsCache.get(resolvedPath);
  }

  let raw;
  try {
    raw = await fs.readFile(resolvedPath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`Agent secrets file not found: ${resolvedPath}`);
    }
    throw err;
  }

  let secrets;
  try {
    secrets = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Agent secrets file is not valid JSON: ${resolvedPath}`);
  }

  secretsCache.set(resolvedPath, secrets);
  return secrets;
}

function resolveXmppPassword(passwordKey, secrets) {
  if (!passwordKey) {
    throw new Error("Missing xmpp:passwordKey in agent profile.");
  }
  if (!secrets?.xmpp || typeof secrets.xmpp !== "object") {
    throw new Error("Agent secrets file is missing the xmpp password map.");
  }
  const password = secrets.xmpp[passwordKey];
  if (!password) {
    throw new Error(`No XMPP password found for key "${passwordKey}" in secrets file.`);
  }
  return password;
}

function extractBaseProfileNames(dataset, subject) {
  return extractObjects(dataset, subject, PREFIXES.dcterms + "isPartOf")
    .map(nodeToProfileName)
    .filter(Boolean);
}

function nodeToProfileName(node) {
  if (!node) return null;
  if (node.termType === "Literal") {
    return normalizeProfileName(node.value);
  }
  if (node.termType !== "NamedNode") return null;
  const value = node.value;
  if (value.includes("#")) {
    return normalizeProfileName(value.split("#").pop());
  }
  if (value.includes("/")) {
    return normalizeProfileName(value.split("/").pop());
  }
  return normalizeProfileName(value);
}

function normalizeProfileName(value) {
  if (!value) return null;
  return value.endsWith(".ttl") ? value.slice(0, -4) : value;
}

function mergeAgentProfiles(baseProfile, derivedProfile) {
  if (!baseProfile) return derivedProfile;
  if (!derivedProfile) return baseProfile;

  const mergedXmpp = mergeXmppAccounts(baseProfile.xmppAccount, derivedProfile.xmppAccount);
  const mergedProvider = mergeProviderConfigs(baseProfile.provider, derivedProfile.provider);
  const mergedCapabilities = mergeCapabilities(baseProfile, derivedProfile);
  const mergedLingue = mergeLingue(baseProfile, derivedProfile);
  const mergedMcp = mergeMcp(baseProfile, derivedProfile);
  const mergedMetadata = mergeMetadata(baseProfile, derivedProfile);
  const mergedTypes = dedupeArray([...(baseProfile.type || []), ...(derivedProfile.type || [])]);

  return new AgentProfile({
    identifier: derivedProfile.identifier || baseProfile.identifier,
    nickname: derivedProfile.nickname || baseProfile.nickname,
    type: mergedTypes,
    xmppAccount: mergedXmpp,
    roomJid: derivedProfile.roomJid || baseProfile.roomJid,
    provider: mergedProvider,
    capabilities: mergedCapabilities,
    lingue: mergedLingue,
    mcp: mergedMcp,
    metadata: mergedMetadata,
    customProperties: {
      ...(baseProfile.custom || {}),
      ...(derivedProfile.custom || {})
    }
  });
}

function assertXmppPassword(profile) {
  if (!profile?.xmppAccount) return;
  if (!profile.xmppAccount.password) {
    const identifier = profile.identifier || profile.nickname || "unknown";
    throw new Error(`XMPP password missing for profile "${identifier}".`);
  }
}

function mergeXmppAccounts(baseXmpp, derivedXmpp) {
  if (!baseXmpp && !derivedXmpp) return null;
  if (!baseXmpp) return derivedXmpp;
  if (!derivedXmpp) return baseXmpp;

  return new XmppConfig({
    service: derivedXmpp.service || baseXmpp.service,
    domain: derivedXmpp.domain || baseXmpp.domain,
    username: derivedXmpp.username || baseXmpp.username,
    password: derivedXmpp.password || baseXmpp.password,
    passwordKey: derivedXmpp.passwordKey || baseXmpp.passwordKey,
    resource: derivedXmpp.resource || baseXmpp.resource,
    tlsRejectUnauthorized: derivedXmpp.tls?.rejectUnauthorized ?? baseXmpp.tls?.rejectUnauthorized ?? false
  });
}

function mergeProviderConfigs(baseProvider, derivedProvider) {
  if (!baseProvider) return derivedProvider;
  if (!derivedProvider) return baseProvider;
  if (baseProvider.type !== derivedProvider.type) return derivedProvider;

  const mergedConfig = { ...baseProvider.config, ...derivedProvider.config };
  if (baseProvider.type === "mistral") {
    return new MistralProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "semem") {
    return new SememProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "data") {
    return new DataProviderConfig(mergedConfig);
  }
  return derivedProvider;
}

function mergeCapabilities(baseProfile, derivedProfile) {
  const merged = new Map();
  baseProfile?.capabilities?.forEach((cap, key) => merged.set(key, cap));
  derivedProfile?.capabilities?.forEach((cap, key) => merged.set(key, cap));
  return Array.from(merged.values());
}

function mergeLingue(baseProfile, derivedProfile) {
  const baseLingue = baseProfile?.lingue || {};
  const derivedLingue = derivedProfile?.lingue || {};
  const supports = new Set([...(baseLingue.supports || []), ...(derivedLingue.supports || [])]);
  const understands = new Set([...(baseLingue.understands || []), ...(derivedLingue.understands || [])]);
  return {
    supports,
    prefers: derivedLingue.prefers || baseLingue.prefers || null,
    understands,
    profile: derivedLingue.profile || baseLingue.profile || null
  };
}

function mergeMcp(baseProfile, derivedProfile) {
  const baseMcp = baseProfile?.mcp || {};
  const derivedMcp = derivedProfile?.mcp || {};
  return {
    role: derivedMcp.role || baseMcp.role || null,
    servers: mergeMcpList(baseMcp.servers, derivedMcp.servers, (item) => item?.uri || item?.name),
    tools: mergeMcpList(baseMcp.tools, derivedMcp.tools, (item) => item?.name),
    resources: mergeMcpList(baseMcp.resources, derivedMcp.resources, (item) => item?.uri || item?.name),
    prompts: mergeMcpList(baseMcp.prompts, derivedMcp.prompts, (item) => item?.name),
    endpoints: mergeMcpList(baseMcp.endpoints, derivedMcp.endpoints, (item) => item?.uri || item?.name)
  };
}

function mergeMcpList(baseList = [], derivedList = [], keyFn) {
  const merged = new Map();
  [...baseList, ...derivedList].forEach((item) => {
    if (!item) return;
    const key = keyFn?.(item) || JSON.stringify(item);
    merged.set(key, item);
  });
  return Array.from(merged.values());
}

function mergeMetadata(baseProfile, derivedProfile) {
  const baseMeta = baseProfile?.metadata || {};
  const derivedMeta = derivedProfile?.metadata || {};
  return {
    created: derivedMeta.created || baseMeta.created,
    modified: derivedMeta.modified || baseMeta.modified,
    description: derivedMeta.description || baseMeta.description
  };
}

function dedupeArray(values) {
  return Array.from(new Set(values.filter(Boolean)));
}


function extractLiteral(dataset, subject, predicateUri) {
  const quad = Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))[0];
  return quad?.object?.value;
}

function extractObject(dataset, subject, predicateUri) {
  const quad = Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))[0];
  return quad?.object;
}

function hasType(dataset, subject, typeUri) {
  return dataset.match(subject, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(typeUri)).size > 0;
}

function extractObjects(dataset, subject, predicateUri) {
  return Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))
    .map(quad => quad.object);
}

function extractBoolean(dataset, subject, predicateUri, defaultValue) {
  const value = extractLiteral(dataset, subject, predicateUri);
  if (value === undefined) return defaultValue;
  return value === "true" || value === true;
}

function extractInteger(dataset, subject, predicateUri) {
  const value = extractLiteral(dataset, subject, predicateUri);
  return value ? parseInt(value, 10) : undefined;
}

function extractFloat(dataset, subject, predicateUri) {
  const value = extractLiteral(dataset, subject, predicateUri);
  return value ? parseFloat(value) : undefined;
}

function extractObjectValue(dataset, subject, predicateUri) {
  const obj = extractObject(dataset, subject, predicateUri);
  return obj ? resolveNodeValue(dataset, obj) : null;
}

function extractObjectValues(dataset, subject, predicateUri) {
  return extractObjects(dataset, subject, predicateUri)
    .map(obj => resolveNodeValue(dataset, obj));
}

function resolveNodeValue(dataset, node) {
  if (node.termType === "Literal") return node.value;
  if (node.termType === "NamedNode") return node.value;
  const label = extractLiteral(dataset, node, PREFIXES.rdfs + "label");
  return label || node.value || null;
}

function nodeFromValue(value) {
  if (!value) return rdf.literal("");
  if (value.startsWith("http:
    return rdf.namedNode(value);
  }
  return rdf.literal(value);
}

function addProfileComponentTriples(dataset, profileNode, predicateUri, values, typeUri) {
  if (!values || values.length === 0) return;

  values.forEach((value) => {
    if (!value) return;
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("#")) {
      dataset.add(rdf.quad(
        profileNode,
        rdf.namedNode(predicateUri),
        rdf.namedNode(value)
      ));
      return;
    }

    const componentNode = rdf.blankNode();
    dataset.add(rdf.quad(
      profileNode,
      rdf.namedNode(predicateUri),
      componentNode
    ));
    dataset.add(rdf.quad(
      componentNode,
      rdf.namedNode(PREFIXES.rdf + "type"),
      rdf.namedNode(typeUri)
    ));
    dataset.add(rdf.quad(
      componentNode,
      rdf.namedNode(PREFIXES.rdfs + "label"),
      rdf.literal(value)
    ));
  });
}

function addMcpMetadata(dataset, subject, mcp) {
  const hasAny = (mcp.tools?.length || 0)
    + (mcp.resources?.length || 0)
    + (mcp.prompts?.length || 0);
  if (!hasAny) return;

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.rdf + "type"),
    rdf.namedNode(PREFIXES.mcp + "Client")
  ));

  if (mcp.tools?.length) {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.mcp + "hasCapability"),
      rdf.namedNode(PREFIXES.mcp + "ToolsCapability")
    ));
    mcp.tools.forEach((tool) => {
      const toolNode = rdf.blankNode();
      dataset.add(rdf.quad(subject, rdf.namedNode(PREFIXES.mcp + "providesTool"), toolNode));
      dataset.add(rdf.quad(toolNode, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(PREFIXES.mcp + "Tool")));
      if (tool.name) {
        dataset.add(rdf.quad(toolNode, rdf.namedNode(PREFIXES.mcp + "name"), rdf.literal(tool.name)));
      }
      if (tool.description) {
        dataset.add(rdf.quad(toolNode, rdf.namedNode(PREFIXES.mcp + "description"), rdf.literal(tool.description)));
      }
    });
  }

  if (mcp.resources?.length) {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.mcp + "hasCapability"),
      rdf.namedNode(PREFIXES.mcp + "ResourcesCapability")
    ));
    mcp.resources.forEach((resource) => {
      const resourceNode = rdf.blankNode();
      dataset.add(rdf.quad(subject, rdf.namedNode(PREFIXES.mcp + "providesResource"), resourceNode));
      dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(PREFIXES.mcp + "Resource")));
      if (resource.name) {
        dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.mcp + "name"), rdf.literal(resource.name)));
      }
      if (resource.uri) {
        dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.mcp + "uri"), rdf.literal(resource.uri)));
      }
      if (resource.mimeType) {
        dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.mcp + "mimeType"), rdf.literal(resource.mimeType)));
      }
    });
  }

  if (mcp.prompts?.length) {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.mcp + "hasCapability"),
      rdf.namedNode(PREFIXES.mcp + "PromptsCapability")
    ));
    mcp.prompts.forEach((prompt) => {
      const promptNode = rdf.blankNode();
      dataset.add(rdf.quad(subject, rdf.namedNode(PREFIXES.mcp + "providesPrompt"), promptNode));
      dataset.add(rdf.quad(promptNode, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(PREFIXES.mcp + "Prompt")));
      if (prompt.name) {
        dataset.add(rdf.quad(promptNode, rdf.namedNode(PREFIXES.mcp + "name"), rdf.literal(prompt.name)));
      }
      if (prompt.description) {
        dataset.add(rdf.quad(promptNode, rdf.namedNode(PREFIXES.mcp + "description"), rdf.literal(prompt.description)));
      }
    });
  }
}

function stripPrefix(uri) {
  return uri.split('#').pop().split('/').pop();
}












export function setDefaultProfileDir(dir) {
  process.env.AGENT_PROFILE_DIR = dir;
}
</file>

<file path="src/services/recorder-agent.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { RecorderProvider } from "../agents/providers/recorder-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import {
  HumanChatHandler,
  IBISTextHandler,
  PrologProgramHandler,
  ProfileExchangeHandler
} from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "recorder";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Recorder agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Recorder agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Recorder agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;

const sememConfig = {
  baseUrl: fileConfig.semem?.baseUrl || process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it",
  authToken: process.env[fileConfig.semem?.authTokenEnv || "SEMEM_AUTH_TOKEN"],
  timeoutMs: fileConfig.semem?.timeoutMs || parseInt(process.env.SEMEM_HTTP_TIMEOUT_MS || "8000", 10)
};

const provider = new RecorderProvider({
  sememConfig,
  botNickname: BOT_NICKNAME,
  logger
});

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROLOG_PROGRAM)) {
  handlers[LANGUAGE_MODES.PROLOG_PROGRAM] = new PrologProgramHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROFILE_EXCHANGE)) {
  handlers[LANGUAGE_MODES.PROFILE_EXCHANGE] = new ProfileExchangeHandler({ logger });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  respondToAll: true,
  maxAgentRounds: 0,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Recorder agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start Recorder agent:", err);
  process.exit(1);
});
</file>

<file path="src/index.js">
export { AgentRunner } from "./agents/core/agent-runner.js";
export { AgentProfile, XmppConfig } from "./agents/profile/index.js";
export { loadAgentProfile, profileToTurtle, setDefaultProfileDir, parseAgentProfile } from "./agents/profile-loader.js";
export { loadAgentRoster } from "./agents/profile-roster.js";


export { createAgent, createSimpleAgent } from "./factories/agent-factory.js";


export { LingueNegotiator } from "./lib/lingue/index.js";
export * as LINGUE from "./lib/lingue/constants.js";
export * as Handlers from "./lib/lingue/handlers/index.js";


export { XmppRoomAgent } from "./lib/xmpp-room-agent.js";
export { createMentionDetector } from "./agents/core/mention-detector.js";
export { defaultCommandParser } from "./agents/core/command-parser.js";
export { InMemoryHistoryStore, HistoryStore, HISTORY_TERMS } from "./lib/history/index.js";
export { loadSystemConfig } from "./lib/system-config.js";


export { autoConnectXmpp } from "./lib/xmpp-auto-connect.js";
export { registerXmppAccount, generatePassword } from "./lib/xmpp-register.js";


export { BaseProvider } from "./agents/providers/base-provider.js";
export { DemoProvider } from "./agents/providers/demo-provider.js";


export * as MCP from "./mcp/index.js";


export const VERSION = "0.3.0";
</file>

<file path="start-all-agents.sh">
cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo "Loading configuration from .env"
  source .env
fi

echo "Starting all agents..."
echo "  AGENTS=${AGENTS:-<all known>}"
echo "  Agent profile: ${AGENT_PROFILE:-default}"
echo "  Semem API: ${SEMEM_BASE_URL:-https://mcp.tensegrity.it}"
echo "  XMPP service: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  Bot nicknames/resources:"
echo "    Mistral: ${BOT_NICKNAME:-MistralBot} / ${XMPP_RESOURCE:-<auto>}"
echo "    Analyst: ${ANALYST_NICKNAME:-Analyst} / ${ANALYST_RESOURCE:-<auto>}"
echo "    Creative: ${CREATIVE_NICKNAME:-Creative} / ${CREATIVE_RESOURCE:-<auto>}"
echo "    Semem:   ${SEMEM_NICKNAME:-${SEMEM_LITE_NICKNAME:-${AGENT_NICKNAME:-Semem}}} / ${AGENT_RESOURCE:-${XMPP_RESOURCE:-<auto>}}"
echo "    Demo:    ${BOT_NICKNAME:-DemoBot} / ${XMPP_RESOURCE:-<auto>}"
echo "    Prolog:  ${PROLOG_NICKNAME:-Prolog} / ${PROLOG_RESOURCE:-<auto>}"
echo "    Data:    <from profile>"

node src/services/run-all-agents.js
</file>

<file path="public/index.html">
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TIA XMPP Client</title>
    <link rel="stylesheet" href="https://cdn.conversejs.org/12.0.0/dist/converse.min.css">
    <script src="https://cdn.conversejs.org/12.0.0/dist/converse.min.js" charset="utf-8"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
    </style>
</head>

<body>
    <script>
        converse.initialize({
            // Display mode - fullscreen takes over entire page
            view_mode: 'fullscreen',

            // XMPP connection settings for Prosody server
            // Try BOSH first (more commonly enabled), then WebSocket
            bosh_service_url: 'https://tensegrity.it:5281/http-bind',
            websocket_url: 'wss://tensegrity.it:5281/xmpp-websocket',

            // Allow self-signed certificates for local development
            // Remove this in production with proper certificates
            strict_plugin_dependencies: false,

            // Authentication
            authentication: 'login',
            auto_login: false,

            // Multi-user chat (MUC) settings
            allow_muc_invitations: true,
            auto_join_rooms: [],

            // UI preferences
            show_controlbox_by_default: true,
            hide_muc_participants: false,

            // Enable useful features
            message_archiving: 'always',
            enable_smacks: true,

            // Domain - adjust to match your XMPP server
            default_domain: 'tensegrity.it',

            // Notification settings
            show_desktop_notifications: true,
            play_sounds: true,

            // Theming
            theme: 'concord',

            // Debug mode - set to false in production
            debug: true,
            loglevel: 'info'
        });
    </script>
</body>

</html>
</file>

<file path="src/agents/core/agent-runner.js">
import { XmppRoomAgent } from "../../lib/xmpp-room-agent.js";
import { createMentionDetector } from "./mention-detector.js";
import { defaultCommandParser } from "./command-parser.js";

export class AgentRunner {
  constructor({
    profile,
    xmppConfig,
    roomJid,
    nickname,
    provider,
    negotiator = null,
    mentionDetector,
    commandParser,
    allowSelfMessages = false,
    respondToAll = false,
    agentRoster = [],
    maxAgentRounds = 5,
    autoRegister = false,
    secretsPath,
    logger = console
  }) {
    if (!provider?.handle) {
      throw new Error("AgentRunner requires a provider with a handle() method");
    }

    const profileConfig = profile?.toConfig ? profile.toConfig() : {};
    const resolvedXmppConfig = profileConfig.xmpp || xmppConfig;
    const resolvedRoomJid = profileConfig.roomJid || roomJid;
    const resolvedNickname = profileConfig.nickname || nickname;

    this.nickname = resolvedNickname;
    this.provider = provider;
    this.negotiator = negotiator;
    this.mentionDetector =
      mentionDetector || createMentionDetector(resolvedNickname, [resolvedNickname?.toLowerCase()]);
    this.commandParser = commandParser || defaultCommandParser;
    this.logger = logger;
    this.respondToAll = respondToAll;
    this.agentRoster = new Set(
      (agentRoster || [])
        .map((name) => name?.toLowerCase?.())
        .filter(Boolean)
    );
    this.maxAgentRounds = maxAgentRounds;
    this.agentRoundCount = 0;

    this.agent = new XmppRoomAgent({
      xmppConfig: resolvedXmppConfig,
      roomJid: resolvedRoomJid,
      nickname: resolvedNickname,
      onMessage: this.handleMessage.bind(this),
      allowSelfMessages,
      autoRegister,
      secretsPath,
      logger
    });
  }

  async handleMessage({ body, sender, type, roomJid, reply, stanza }) {
    if (this.negotiator && stanza) {
      const handled = await this.negotiator.handleStanza(stanza, {
        sender,
        type,
        roomJid,
        reply
      });
      if (handled) return;
    }

    const senderIsAgent = this.isAgentSender(sender);
    if (senderIsAgent) {
      this.agentRoundCount += 1;
    } else {
      this.agentRoundCount = 0;
    }

    const explicitHumanAddress = type === "chat" || this.mentionDetector(body);
    if (this.shouldRequireHumanAddress() && (senderIsAgent || !explicitHumanAddress)) {
      this.logger.debug?.(
        `[AgentRunner] Suppressing message after agent rounds (${this.agentRoundCount})`
      );
      return;
    }

    const addressed = this.respondToAll || explicitHumanAddress;
    if (!addressed) {
      this.logger.debug?.(`[AgentRunner] Ignoring message (not addressed): ${body}`);
      return;
    }

    const { command, content } = this.commandParser(body);
    const metadata = { sender, type, roomJid };

    const result = await this.provider.handle({
      command,
      content,
      rawMessage: body,
      metadata,
      reply
    });

    if (typeof result === "string" && result.trim()) {
      await reply(result);
    }
  }

  async start() {
    await this.agent.start();


    if (this.negotiator && this.agent.xmpp) {
      if (this.negotiator.setXmppClient) {
        this.negotiator.setXmppClient(this.agent.xmpp);
      } else {
        this.negotiator.xmppClient = this.agent.xmpp;
      }
    }
  }

  async stop() {
    await this.agent.stop();
  }

  isAgentSender(sender) {
    if (!sender) return false;
    const lower = sender.toLowerCase();
    if (this.nickname && lower === this.nickname.toLowerCase()) {
      return false;
    }
    return this.agentRoster.has(lower);
  }

  shouldRequireHumanAddress() {
    if (!this.maxAgentRounds || this.maxAgentRounds < 1) return false;
    return this.agentRoundCount >= this.maxAgentRounds;
  }
}

export default AgentRunner;
</file>

<file path="docs/agents.md">
# Agents Overview

This page is for users first, then operators. It covers what each bot can do in chat, how to address it, and how to run it.

## What each bot can do (in the MUC or DMs)

## Custom agent API
- For building your own agent with the library API, see `docs/agent-dev-prompt.md` and `examples/minimal-agent.js`.

### Mistral Bot
- Mention it: `MistralBot, how do I ...?`, `bot: ...`, or `@mistralbot`.
- Replies with LLM answers (1–3 sentences, friendly).
- Lingue/IBIS: when Lingue is enabled (default), it detects Issues/Positions/Arguments and posts short IBIS summaries if confidence is high.
- Profiles: `mistral` (default), `mistral-analyst`, `mistral-creative` via `AGENT_PROFILE`.

### Semem Agent
- Mention it: `Semem, ...` (comma/colon supported) or DM.
- Semem verbs (explicit triggers):
  - `Semem tell <text>` → store via `/tell`.
  - `Semem ask <question>` → query via `/ask`.
  - `Semem augment <text>` → extract concepts via `/augment`.
  - Default mention/DM → `/chat/enhanced`, then auto-store the exchange via `/tell`.
- Lingue/IBIS: responds to mentions like Mistral when Lingue is enabled (IBIS summaries when confidence is high).

### MCP Debug Agent
- Not a chatty bot; used for diagnostics.
- MCP verbs exposed: `initialize`, `echo`, `xmppStatus` (reports connection + last message), `xmppSend` (posts a test message to the MUC).

### Demo Bot
- Simple canned/demo responses; no external API.

### Data Agent
- Mention it: `Data, ...` (comma/colon supported) or DM.
- Query modes:
  - `Data query: <entity>` → lookup entity facts from SPARQL endpoint (Wikidata by default).
  - `Data sparql: <query>` → execute direct SPARQL query.
  - `Data, <natural language question>` → extracts entity with Mistral, then queries.
- Returns human-friendly summaries instead of raw JSON.
- Lingue/SPARQL: supports `lng:SparqlQuery` mode for agent-to-agent SPARQL exchange.
- Fully configurable via RDF profile - can be adapted to any SPARQL endpoint (DBpedia, local triplestores, etc.).
- See [Data Agent Guide](data-agent.md) for detailed documentation.

## Running the bots

Common XMPP env (put in `.env`):
```
XMPP_SERVICE=xmpp://your-host:5222     # or xmpps://... with NODE_TLS_REJECT_UNAUTHORIZED=0
XMPP_DOMAIN=your-domain
MUC_ROOM=general@conference.your-domain
XMPP_RESOURCE=...                      # optional; defaults to bot nickname
```

XMPP passwords live in `config/agents/secrets.json` (ignored by git). Override the path
with `AGENT_SECRETS_PATH` if needed.

### Mistral Bot
- Start: `./start-mistral-bot.sh`
- Env: `MISTRAL_API_KEY` (required), `BOT_NICKNAME` (default `MistralBot`), `MISTRAL_MODEL` (default `mistral-small-latest`).
- Auto-renames on nickname conflict by appending a short suffix.

### Semem Agent
- Start: `./start-semem-agent.sh`
- Env:
  - `SEMEM_BASE_URL` (default `https://mcp.tensegrity.it`)
  - `SEMEM_AUTH_TOKEN` if needed
  - `SEMEM_HTTP_TIMEOUT_MS` (default 8000) timeout for Semem HTTP calls
  - `SEMEM_NICKNAME` (default profile) or `SEMEM_LITE_NICKNAME` (lite profile)
  - `AGENT_NICKNAME` (one-off override), `AGENT_RESOURCE` (resource override)
  - `AGENT_PROFILE` (`default` or `lite`) toggles feature flags (Wikipedia/Wikidata)
- Auto-renames on nickname conflict (short suffix, limited retries).

### MCP Debug Agent
- Start: `node src/mcp/servers/Echo.js` (or via npx from the package)
- Env: same XMPP vars; `MCP_BOT_NICKNAME` sets nickname/resource.
- Auto-renames on conflict.

### Demo Bot
- Start: `./start-demo-bot.sh`
- Env: `BOT_NICKNAME` (default `DemoBot`), uses XMPP vars.

### Data Agent
- Start: `./start-data-agent.sh`
- Env:
  - `MISTRAL_API_KEY` (optional, for natural language entity extraction)
  - `AGENT_PROFILE` (default `data`) - use different profiles for different SPARQL endpoints
  - Standard XMPP vars from profile
- SPARQL endpoint and other config defined in RDF profile (`config/agents/data.ttl`)
- See [Data Agent Guide](data-agent.md) for query modes and configuration.

## Running multiple agents
- `./start-all-agents.sh` spawns all known agents (Semem, Mistral variants, Demo, Data, Prolog, Chair, Recorder). Use distinct nicknames/resources to avoid MUC confusion, e.g.:
  ```
  BOT_NICKNAME=Mistral1
  SEMEM_NICKNAME=Semem1
  MCP_BOT_NICKNAME=McpDebug1
  XMPP_RESOURCE / AGENT_RESOURCE set per agent
  ```
- Or run start scripts individually with tailored env.

## Testing
- Unit tests: `npm test`
- Integration (XMPP + bots, opt-in for Semem): `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration`
  - Mistral bot test runs when `MISTRAL_API_KEY` is set (skip with `RUN_MISTRAL_BOT_TEST=false`).
  - Semem bot test runs only when `RUN_SEMEM_BOT_TEST=true` (requires Semem endpoint).
</file>

<file path="src/services/agent-registry.js">
import dotenv from "dotenv";
import { loadAgentProfile as loadRdfProfile } from "../agents/profile-loader.js";

dotenv.config();

const baseXmppConfig = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  resource: process.env.XMPP_RESOURCE,
  tls: { rejectUnauthorized: false }
};

const baseSememConfig = {
  baseUrl: process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it",
  authToken: process.env.SEMEM_AUTH_TOKEN
};

const SEMEM_NICKNAME = process.env.SEMEM_NICKNAME?.trim();
const SEMEM_LITE_NICKNAME = process.env.SEMEM_LITE_NICKNAME?.trim();
const AGENT_NICKNAME = process.env.AGENT_NICKNAME?.trim();

function mergeConfig(fileConfig = {}) {
  const xmpp = {
    ...baseXmppConfig,
    ...(fileConfig.xmpp || {})
  };
  const semem = {
    baseUrl: fileConfig.semem?.baseUrl || baseSememConfig.baseUrl,
    authToken: process.env[fileConfig.semem?.authTokenEnv || "SEMEM_AUTH_TOKEN"] || baseSememConfig.authToken,
    timeoutMs: fileConfig.semem?.timeoutMs
  };
  const features = fileConfig.semem?.features || {};
  return { xmpp, semem, features };
}

const profiles = {
  default: {
    nickname: SEMEM_NICKNAME || AGENT_NICKNAME || "Semem",
    roomJid: process.env.MUC_ROOM || "general@conference.tensegrity.it",
    features: {
      useWikipedia: true,
      useWikidata: true,
      useWebSearch: false
    },
    sememOverrides: {},
    xmppOverrides: {}
  },
  lite: {
    nickname: SEMEM_LITE_NICKNAME || SEMEM_NICKNAME || AGENT_NICKNAME || "SememLite",
    roomJid: process.env.MUC_ROOM || "general@conference.xmpp",
    features: {
      useWikipedia: false,
      useWikidata: false,
      useWebSearch: false
    },
    sememOverrides: {},
    xmppOverrides: {}
  }
};

export function listProfiles() {
  return Object.keys(profiles);
}

export async function loadAgentProfile(name = "default") {
  const rdfProfile = await loadRdfProfile(name);
  const fileProfile = rdfProfile?.toConfig();
  const profile = profiles[name] || profiles.default;
  const resolvedName = profiles[name] || fileProfile ? name : "default";
  const nicknameOverride = process.env.AGENT_NICKNAME?.trim();

  const merged = mergeConfig(fileProfile || profile);

  return {
    profileName: resolvedName,
    nickname: nicknameOverride || fileProfile?.nickname || profile.nickname,
    roomJid: fileProfile?.roomJid || profile.roomJid,
    features: fileProfile?.semem?.features || profile.features,
    sememConfig: merged.semem,
    xmppConfig: merged.xmpp
  };
}

export default { loadAgentProfile, listProfiles };
</file>

<file path="src/services/chair-agent.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { ChairProvider } from "../agents/providers/chair-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler } from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "chair";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Chair agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Chair agent profile is missing nickname or XMPP username");
}

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Chair agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";
const BOT_NICKNAME = fileConfig.nickname;

const provider = new ChairProvider({
  nickname: BOT_NICKNAME,
  logger
});

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Chair agent "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start Chair agent:", err);
  process.exit(1);
});
</file>

<file path="docs/archive/notes.md">
npm pack

  Then from your test project (/home/danny/hyperdata/tia-test):

  npm install ../tia/tia-agents-0.3.0.tgz

npm install @mistralai/mistralai

 If you want the history store size or any other provider options to be 100%
  config‑driven too, we can add those to the profile and wire them in the
  provider config.

systemctl restart tia-agents

claude mcp add tia-chat node /home/danny/hyperdata/tia/src/mcp/servers/tia-mcp-server.js

codex mcp add tia-chat node /home/danny/hyperdata/tia/src/mcp/servers/tia-mcp-server.js

src/mcp/servers/tia-mcp-server.js

  If you want, I can add tunable env vars for reconnect delays/retry caps or logging around reconnect attempts.
    
    1. If you want history per room or per user, I can add a keyed history manager that
     uses roomJid/from to select a store.
  2. If you want file persistence, we can implement a file-backed store that shares
     the same interface.
     
RUN_SEMEM_BOT_TEST=true NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration

node src/examples/semem-direct-test.js "Glitch is a canary" "What is Glitch?"

systemctl stop tia-agents


prosodyctl adduser semem@tensegrity.it
prosodyctl adduser mistral@tensegrity.it
prosodyctl adduser demo@tensegrity.it

prosodyctl adduser prolog@tensegrity.it

 sudo prosodyctl register mistral-analyst tensegrity.it analystpass???

 sudo prosodyctl adduser mistral-analyst@tensegrity.it analystpass
  sudo prosodyctl adduser mistral-creative@tensegrity.it creativepass
  sudo prosodyctl adduser mcp-loopback@tensegrity.it loopbackpass
---

npm install @xmpp/client @xmpp/debug

https://platform.openai.com/docs/quickstart?context=node

npm install --save openai

in ~/.bash_profile :

export OPENAI_API_KEY='your-api-key-here'

source ~/.bash_profile
echo $OPENAI_API_KEY

https://github.com/nioc/xmpp-bot

npm install log4js
</file>

<file path="src/lib/xmpp-room-agent.js">
import { client, xml } from "@xmpp/client";
import { LINGUE_NS } from "./lingue/constants.js";
import { autoConnectXmpp } from "./xmpp-auto-connect.js";

export class XmppRoomAgent {
  constructor({
    xmppConfig,
    roomJid,
    nickname,
    onMessage,
    allowSelfMessages = false,
    onConflictRename = true,
    maxJoinRetries = 3,
    reconnect = true,
    reconnectDelayMs = 2000,
    maxReconnectDelayMs = 30000,
    autoRegister = false,
    secretsPath,
    logger = console
  }) {
    this.xmppConfig = xmppConfig;
    this.autoRegister = autoRegister;
    this.secretsPath = secretsPath;
    this.xmpp = null;
    this.roomJid = roomJid;
    this.nickname = nickname;
    this.currentNickname = nickname;
    this.onMessage = onMessage;
    this.logger = logger;
    this.isInRoom = false;
    this.allowSelfMessages = allowSelfMessages;
    this.onConflictRename = onConflictRename;
    this.maxJoinRetries = maxJoinRetries;
    this.joinAttempts = 0;
    this.joinWaiters = [];
    this.pendingGroupMessages = [];
    this.reconnect = reconnect;
    this.reconnectDelayMs = reconnectDelayMs;
    this.maxReconnectDelayMs = maxReconnectDelayMs;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.manualStop = false;
    this.isOnline = false;
  }

  setupEventHandlers() {
    this.xmpp.on("error", (err) => {
      this.logger.error("XMPP Error:", err);
      if (!this.manualStop && this.reconnect && (!this.isOnline || err.condition === "conflict")) {
        this.scheduleReconnect("error");
      }
    });

    this.xmpp.on("offline", () => {
      this.logger.info("Agent offline");
      this.isInRoom = false;
      this.isOnline = false;
      if (!this.manualStop && this.reconnect) {
        this.scheduleReconnect("offline");
      }
    });

    this.xmpp.on("online", async (address) => {
      this.logger.info(`Agent connected as ${address.toString()}`);
      this.isOnline = true;
      this.reconnectAttempts = 0;
      await this.joinRoom();
    });

    this.xmpp.on("stanza", async (stanza) => {

      if (stanza.is("presence") && stanza.attrs.type === "error" && stanza.attrs.from?.startsWith(this.roomJid)) {
        const errorNode = stanza.getChild("error");
        const conflict = errorNode?.getChild("conflict");
        if (conflict && this.onConflictRename && this.joinAttempts < this.maxJoinRetries) {
          this.joinAttempts += 1;
          const newNick = `${this.nickname}-${Math.random().toString(16).slice(2, 6)}`;
          this.logger.warn(
            `[XMPP] Nickname conflict detected for ${this.currentNickname}. Retrying as ${newNick} (${this.joinAttempts}/${this.maxJoinRetries})`
          );
          this.currentNickname = newNick;
          await this.joinRoom();
          return;
        }
        this.logger.error(
          `[XMPP] Presence error from room ${this.roomJid}: ${errorNode ? errorNode.toString() : "unknown"}`
        );
        return;
      }

      if (stanza.is("presence") && stanza.attrs.from?.startsWith(this.roomJid)) {
        if (stanza.attrs.from === `${this.roomJid}/${this.currentNickname}`) {
          this.isInRoom = true;
          this.logger.info(`Joined room ${this.roomJid} as ${this.currentNickname}`);
          this.resolveJoinWaiters();
        }
        return;
      }

      if (!stanza.is("message")) return;
      const type = stanza.attrs.type;
      const body = stanza.getChildText("body") || "";
      const hasLingue =
        stanza.getChild("offer", LINGUE_NS) ||
        stanza.getChild("accept", LINGUE_NS) ||
        stanza.getChild("payload", LINGUE_NS);
      if (!body && !hasLingue) return;

      if (type === "groupchat") {
        const from = stanza.attrs.from;
        if (
          !from ||
          (!this.allowSelfMessages && from.endsWith(`/${this.currentNickname}`)) ||
          stanza.getChild("delay")
        ) {
          if (this.logger.debug) {
            this.logger.debug(
              "[XMPP] Ignoring groupchat",
              JSON.stringify({
                reason: !from
                  ? "missing-from"
                  : (!this.allowSelfMessages && from.endsWith(`/${this.nickname}`))
                  ? "self-message"
                  : "delayed",
                from,
                body
              })
            );
          }
          return;
        }
        const sender = from.split("/")[1] || "unknown";
        this.logger.debug?.(`Groupchat from ${sender}: ${body}`);
        if (this.onMessage) {
          await this.onMessage({
            body,
            sender,
            from,
            roomJid: this.roomJid,
            type: "groupchat",
            reply: (text) => this.sendGroupMessage(text),
            stanza
          });
        }
      }

      if (type === "chat") {
        const from = stanza.attrs.from;
        if (!from) return;
        this.logger.debug?.(`Direct message from ${from}: ${body}`);
        if (this.onMessage) {
          await this.onMessage({
            body,
            sender: from.split("@")[0],
            from,
            roomJid: null,
            type: "chat",
            reply: (text) => this.sendDirectMessage(from, text),
            stanza
          });
        }
      }
    });
  }

  async joinRoom() {
    this.isInRoom = false;
    const presence = xml(
      "presence",
      { to: `${this.roomJid}/${this.currentNickname}` },
      xml("x", { xmlns: "http://jabber.org/protocol/muc" })
    );
    await this.xmpp.send(presence);
    this.logger.info(`Joining room ${this.roomJid} as ${this.currentNickname}`);
  }

  async sendGroupMessage(message) {
    if (!this.isInRoom) {
      this.logger.warn("Cannot send group message before joining the room");
      this.pendingGroupMessages.push(message);
      await this.waitForJoin();
    }
    this.logger.info(`Sending group message to ${this.roomJid} as ${this.currentNickname}`);
    const mucMessage = xml(
      "message",
      { type: "groupchat", to: this.roomJid },
      xml("body", {}, message)
    );
    await this.xmpp.send(mucMessage);
  }

  async sendDirectMessage(jid, message) {
    const directMessage = xml("message", { type: "chat", to: jid }, xml("body", {}, message));
    await this.xmpp.send(directMessage);
  }

  async start() {
    this.manualStop = false;


    if (this.autoRegister) {
      this.logger.info("[XmppRoomAgent] Auto-registration enabled, attempting connection...");
      try {
        const { xmpp, credentials } = await autoConnectXmpp({
          service: this.xmppConfig.service,
          domain: this.xmppConfig.domain,
          username: this.xmppConfig.username,
          password: this.xmppConfig.password,
          resource: this.xmppConfig.resource,
          tls: this.xmppConfig.tls,
          secretsPath: this.secretsPath,
          autoRegister: true,
          logger: this.logger
        });

        this.xmpp = xmpp;
        this.isOnline = true;
        this.reconnectAttempts = 0;
        this.logger.info(`[XmppRoomAgent] Connected successfully${credentials.registered ? ' (new account registered)' : ''}`);
      } catch (err) {
        this.logger.error("[XmppRoomAgent] Auto-connect failed:", err.message);
        throw err;
      }
    } else {

      this.xmpp = client(this.xmppConfig);
    }


    this.setupEventHandlers();


    if (!this.autoRegister) {
      await this.xmpp.start();
    } else {

      await this.joinRoom();
    }
  }

  async stop() {
    this.logger.info("Stopping agent");
    this.manualStop = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    await this.xmpp.stop();
  }

  scheduleReconnect(reason = "unknown") {
    if (this.reconnectTimer) return;
    const attempt = this.reconnectAttempts + 1;
    const delay = Math.min(
      this.maxReconnectDelayMs,
      this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts)
    );
    this.reconnectAttempts = attempt;
    this.logger.warn(`Reconnecting after ${delay}ms (attempt ${attempt}, reason: ${reason})`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.manualStop) return;
      try {
        await this.xmpp.stop().catch(() => {});
        await this.xmpp.start();
      } catch (err) {
        this.logger.error("Reconnect failed:", err);
        if (this.reconnect && !this.manualStop) {
          this.scheduleReconnect("retry");
        }
      }
    }, delay).unref?.();
  }

  resolveJoinWaiters() {
    if (!this.isInRoom) return;
    const waiters = this.joinWaiters;
    this.joinWaiters = [];
    waiters.forEach(({ resolve }) => resolve());
    if (this.pendingGroupMessages.length) {
      const pending = this.pendingGroupMessages;
      this.pendingGroupMessages = [];
      pending.forEach((message) => {
        this.sendGroupMessage(message).catch((err) => {
          this.logger.warn("Failed to send queued group message:", err);
        });
      });
    }
  }

  waitForJoin() {
    if (this.isInRoom) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timed out waiting for room join"));
      }, 15000);
      this.joinWaiters.push({
        resolve: () => {
          clearTimeout(timeout);
          resolve();
        },
        reject
      });
    });
  }
}

export default XmppRoomAgent;
</file>

<file path="src/services/demo-bot.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { DemoProvider } from "../agents/providers/demo-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler } from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "demo";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Demo agent profile not found: ${profileName}.ttl`);
}
const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Demo agent profile is missing nickname or XMPP username");
}

const DEMO_BOT_NICKNAME = fileConfig.nickname;
const DEMO_XMPP_RESOURCE = fileConfig.xmpp?.resource || DEMO_BOT_NICKNAME;

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: DEMO_XMPP_RESOURCE,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Demo agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";

const provider = new DemoProvider({ nickname: DEMO_BOT_NICKNAME, logger });

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: DEMO_BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(DEMO_BOT_NICKNAME, [DEMO_BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting DemoBot "${DEMO_BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start DemoBot:", err);
  process.exit(1);
});
</file>

<file path="src/services/run-all-agents.js">
import dotenv from "dotenv";
import { spawn } from "child_process";

dotenv.config();

const AGENT_DEFINITIONS = {
  semem: {
    command: "node src/services/semem-agent.js",
    description: "Semem MCP-backed agent",
    env: { AGENT_PROFILE: "semem" }
  },
  mistral: {
    command: "node src/services/mistral-bot.js",
    description: "Mistral API-backed bot",
    requiredEnv: ["MISTRAL_API_KEY"],
    env: { AGENT_PROFILE: "mistral" }
  },
  analyst: {
    command: "node src/services/mistral-bot.js",
    description: "Mistral analyst variant",
    requiredEnv: ["MISTRAL_API_KEY"],
    env: { AGENT_PROFILE: "mistral-analyst" }
  },
  creative: {
    command: "node src/services/mistral-bot.js",
    description: "Mistral creative variant",
    requiredEnv: ["MISTRAL_API_KEY"],
    env: { AGENT_PROFILE: "mistral-creative" }
  },
  chair: {
    command: "node src/services/chair-agent.js",
    description: "Chair agent (debate orchestration)",
    env: { AGENT_PROFILE: "chair" },
    requiredEnv: ["MISTRAL_API_KEY"]
  },
  recorder: {
    command: "node src/services/recorder-agent.js",
    description: "Recorder agent (logs to Semem)",
    env: { AGENT_PROFILE: "recorder" },
    requiredEnv: ["SEMEM_AUTH_TOKEN"]
  },
  demo: {
    command: "node src/services/demo-bot.js",
    description: "Demo bot (no API key needed)",
    env: { AGENT_PROFILE: "demo" }
  },
  prolog: {
    command: "node src/services/prolog-agent.js",
    description: "Prolog agent (tau-prolog)",
    env: { AGENT_PROFILE: "prolog" }
  },
  data: {
    command: "node src/services/data-agent.js",
    description: "Data agent (SPARQL-backed)",
    env: { AGENT_PROFILE: "data" }
  }
};

const requestedAgents =
  (process.env.AGENTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) || [];

const agentNames =
  requestedAgents.length > 0 ? requestedAgents : Object.keys(AGENT_DEFINITIONS);

const processes = new Map();
let shuttingDown = false;
const restartState = new Map();
const BASE_RESTART_DELAY_MS = 2000;
const MAX_RESTART_DELAY_MS = 30000;

function hasRequiredEnv(agentName, requiredEnv = []) {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    console.warn(
      `Skipping agent "${agentName}" - missing required env vars: ${missing.join(", ")}`
    );
    return false;
  }
  return true;
}

function startAgent(agentName, { command, requiredEnv = [], description }) {
  if (!hasRequiredEnv(agentName, requiredEnv)) {
    return;
  }

  console.log(`Starting agent "${agentName}" (${description || "agent"}): ${command}`);
  const child = spawn(command, {
    shell: true,
    stdio: "inherit",
    env: {
      ...process.env,
      ...(AGENT_DEFINITIONS[agentName].env || {})
    }
  });

  processes.set(agentName, child);

  child.on("spawn", () => {
    const state = restartState.get(agentName);
    if (state) {
      state.attempts = 0;
      state.timer = null;
    }
  });

  child.on("exit", (code, signal) => {
    processes.delete(agentName);
    if (shuttingDown) return;

    if (code === 0) {
      console.log(`Agent "${agentName}" exited cleanly.`);
    } else {
      console.error(
        `Agent "${agentName}" exited with code ${code ?? "null"} signal ${signal ?? "null"}`
      );
      scheduleRestart(agentName, command, requiredEnv, description);
    }
  });

  child.on("error", (err) => {
    console.error(`Failed to start agent "${agentName}": ${err.message}`);
    processes.delete(agentName);
    if (!shuttingDown) {
      scheduleRestart(agentName, command, requiredEnv, description);
    }
  });
}

function scheduleRestart(agentName, command, requiredEnv, description) {
  if (shuttingDown) return;
  if (!hasRequiredEnv(agentName, requiredEnv)) {
    console.warn(`Not restarting agent "${agentName}" due to missing env vars.`);
    return;
  }
  const state = restartState.get(agentName) || { attempts: 0, timer: null };
  if (state.timer) return;
  const delay = Math.min(
    MAX_RESTART_DELAY_MS,
    BASE_RESTART_DELAY_MS * Math.pow(2, state.attempts)
  );
  state.attempts += 1;
  state.timer = setTimeout(() => {
    state.timer = null;
    startAgent(agentName, { command, requiredEnv, description });
  }, delay).unref?.();
  restartState.set(agentName, state);
  console.warn(`Restarting agent "${agentName}" in ${delay}ms (attempt ${state.attempts})`);
}

function shutdownAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Shutting down all agents...");

  for (const [name, child] of processes.entries()) {
    if (child.exitCode === null) {
      console.log(`Stopping agent "${name}" (pid ${child.pid})`);
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 3000).unref();
}

process.on("SIGINT", () => shutdownAll(0));
process.on("SIGTERM", () => shutdownAll(0));

if (agentNames.length === 0) {
  console.log("No agents requested; exiting.");
  process.exit(0);
}

for (const name of agentNames) {
  const definition = AGENT_DEFINITIONS[name];
  if (!definition) {
    console.warn(`Unknown agent "${name}", skipping.`);
    continue;
  }
  startAgent(name, definition);
}

if (processes.size === 0) {
  console.log("No agents started; exiting.");
  process.exit(1);
}
</file>

<file path="src/services/semem-agent.js">
import dotenv from "dotenv";
import { loadAgentProfile } from "./agent-registry.js";
import { loadAgentProfile as loadLingueProfile } from "../agents/profile-loader.js";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { SememProvider } from "../agents/providers/semem-provider.js";
import logger from "../lib/logger-lite.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler, ProfileExchangeHandler } from "../lib/lingue/handlers/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const requestedProfile = process.env.AGENT_PROFILE || "semem";
const profile = await loadAgentProfile(requestedProfile);
if (!profile?.nickname || !profile?.xmppConfig?.username) {
  throw new Error("Semem agent profile is missing nickname or XMPP username");
}
const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const XMPP_CONFIG = {
  service: profile.xmppConfig?.service,
  domain: profile.xmppConfig?.domain,
  username: profile.xmppConfig?.username,
  password: profile.xmppConfig?.password,
  resource: profile.xmppConfig?.resource || profile.nickname,
  tls: { rejectUnauthorized: false }
};
if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Semem agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = profile.roomJid;
const BOT_NICKNAME = profile.nickname;
const CHAT_FEATURES = profile.features || {};
const ACTIVE_PROFILE = profile.profileName;
const lingueProfile = await loadLingueProfile(requestedProfile)
  || await loadLingueProfile("semem");

const sememProvider = new SememProvider({
  sememConfig: profile.sememConfig,
  botNickname: BOT_NICKNAME,
  chatFeatures: CHAT_FEATURES,
  logger
});

const handlers = {};
if (lingueProfile?.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (lingueProfile?.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}
if (lingueProfile?.supportsLingueMode(LANGUAGE_MODES.PROFILE_EXCHANGE)) {
  handlers[LANGUAGE_MODES.PROFILE_EXCHANGE] = new ProfileExchangeHandler({ logger });
}

const negotiator = lingueProfile
  ? new LingueNegotiator({
      profile: lingueProfile,
      handlers,
      logger
    })
  : null;

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider: sememProvider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting Semem agent "${BOT_NICKNAME}"`);
  if (requestedProfile !== ACTIVE_PROFILE) {
    console.log(`Requested profile "${requestedProfile}" not found. Using "${ACTIVE_PROFILE}"`);
  } else {
    console.log(`Profile: ${ACTIVE_PROFILE}`);
  }
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Semem API: ${profile.sememConfig.baseUrl}`);
  console.log(
    `Features: Wikipedia=${!!CHAT_FEATURES.useWikipedia}, Wikidata=${!!CHAT_FEATURES.useWikidata}, WebSearch=${!!CHAT_FEATURES.useWebSearch}`
  );
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start Semem agent:", err);
  process.exit(1);
});
</file>

<file path="src/services/mistral-bot.js">
import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { MistralProvider } from "../agents/providers/mistral-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES, featuresForModes } from "../lib/lingue/index.js";
import { HumanChatHandler, IBISTextHandler } from "../lib/lingue/handlers/index.js";
import { InMemoryHistoryStore } from "../lib/history/index.js";
import { loadAgentRoster } from "../agents/profile-roster.js";
import { loadSystemConfig } from "../lib/system-config.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mistral";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Mistral agent profile not found: ${profileName}.ttl`);
}

const agentRoster = await loadAgentRoster();
const systemConfig = await loadSystemConfig();

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Mistral agent profile is missing nickname or XMPP username");
}

const baseXmpp = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME,
  resource: process.env.MISTRAL_RESOURCE
};

const XMPP_CONFIG = {
  ...baseXmpp,
  ...(fileConfig.xmpp || {})
};

const MUC_ROOM = fileConfig.roomJid || process.env.MUC_ROOM || "general@conference.xmpp";
const BOT_NICKNAME = fileConfig.nickname;
XMPP_CONFIG.resource = XMPP_CONFIG.resource || fileConfig.xmpp?.resource || BOT_NICKNAME;

const LINGUE_ENABLED = process.env.LINGUE_ENABLED !== "false";
const LINGUE_CONFIDENCE_MIN = parseFloat(process.env.LINGUE_CONFIDENCE_MIN || "0.5");

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  model: (fileConfig.mistral && fileConfig.mistral.model) || process.env.MISTRAL_MODEL || "mistral-small-latest",
  nickname: BOT_NICKNAME,
  systemPrompt: fileConfig.mistral?.systemPrompt,
  systemTemplate: fileConfig.mistral?.systemTemplate,
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 }),
  lingueEnabled: LINGUE_ENABLED,
  lingueConfidenceMin: LINGUE_CONFIDENCE_MIN,
  discoFeatures: featuresForModes(profile.lingue.supports),
  logger
});

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler({ logger });
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler({ logger });
}

const negotiator = new LingueNegotiator({
  profile,
  handlers,
  logger
});

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  provider,
  negotiator,
  mentionDetector: createMentionDetector(BOT_NICKNAME, [BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  maxAgentRounds: systemConfig.maxAgentRounds,
  agentRoster,
  logger
});

async function start() {
  console.log(`Starting MistralBot "${BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Mistral Model: ${process.env.MISTRAL_MODEL || "mistral-small-latest"}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start MistralBot:", err);
  process.exit(1);
});
</file>

<file path="package.json">
{
  "name": "tia-agents",
  "version": "0.3.0",
  "description": "XMPP agent framework with Lingue protocol and MCP integration",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./core": "./src/agents/core/index.js",
    "./lingue": "./src/lib/lingue/index.js",
    "./providers": "./src/agents/providers/index.js",
    "./providers/base": "./src/agents/providers/base-provider.js",
    "./providers/demo": "./src/agents/providers/demo-provider.js",
    "./providers/mistral": "./src/agents/providers/mistral-provider.js",
    "./mcp": "./src/mcp/index.js",
    "./templates/*": "./templates/*"
  },
  "files": [
    "src/agents/",
    "src/lib/",
    "src/mcp/",
    "src/factories/",
    "src/index.js",
    "templates/",
    "docs/api-reference.md",
    "docs/quick-start.md",
    "docs/provider-guide.md",
    "README.md",
    "LICENSE"
  ],
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "test": "node --test test/ibis.test.js test/lingue-exchange.test.js test/lingue-store.test.js && vitest run test/profile-loading.test.js test/lingue-profile-loading.test.js test/lingue-discovery.test.js test/lingue-negotiation.test.js test/lingue-handlers/*.test.js test/agent-runner-lingue.test.js test/agent-runner-agent-rounds.test.js test/npm-exports.test.js test/prolog-provider.test.js test/prolog-lingue-payload.test.js test/mcp-profile-mapper.test.js test/mcp-loopback-provider.test.js test/history-store.test.js",
    "test:integration": "vitest run test/xmpp.integration.test.js test/xmpp.bots.integration.test.js test/xmpp.semem.integration.test.js"
  },
  "keywords": [
    "xmpp",
    "jabber",
    "chatbot",
    "agent",
    "ai",
    "lingue",
    "mcp",
    "mistral",
    "conversation"
  ],
  "author": "Danny Ayers",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/danja/tia.git"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.63.0",
    "@modelcontextprotocol/sdk": "^1.25.1",
    "@rdfjs/dataset": "^2.0.2",
    "@xmpp/client": "^0.13.4",
    "@xmpp/debug": "^0.13.3",
    "dotenv": "^17.2.2",
    "hyperdata-clients": "^0.9.3",
    "loglevel": "^1.9.2",
    "n3": "^1.26.0",
    "rdf-ext": "^2.6.0",
    "tau-prolog": "^0.3.4",
    "zod": "^4.2.1"
  },
  "devDependencies": {
    "@mistralai/mistralai": "^1.11.0",
    "vitest": "^4.0.16"
  },
  "peerDependencies": {
    "@mistralai/mistralai": "^0.4.0 || ^0.5.0 || ^1.5.0 || ^1.11.0"
  },
  "peerDependenciesMeta": {
    "@mistralai/mistralai": {
      "optional": true
    }
  }
}
</file>

<file path="README.md">
# TIA
TIA Intelligence Agency

An experimental XMPP (Jabber) agent framework that combines chat, Lingue/IBIS structured dialogue, and MCP tool integrations into a modular Node.js codebase.

## What TIA Is

TIA is a set of composable building blocks for creating conversational agents that can:
- Participate in XMPP multi-user chats and direct messages.
- Negotiate Lingue language modes and exchange structured payloads.
- Act as MCP clients (discovering tools/resources from servers).
- Act as MCP servers (exposing chat and Lingue tools to external clients).

The design goal is a clean, library-ready architecture that supports both deployable bots and reusable modules.

## Key Concepts

- **XMPP room agents**: long-running bots anchored in MUC rooms.
- **Lingue protocol**: language-mode negotiation + structured payloads (IBIS, Prolog, profiles).
- **MCP bridges**: MCP client and server adapters for tool discovery and exposure.
- **Profiles (RDF)**: agent capabilities live in RDF profiles with shared vocabularies (Mistral variants inherit from `mistral-base`).

## Start Here (Docs)

- [Agent capabilities & commands](docs/agents.md)
- [Data Agent guide](docs/data-agent.md) - SPARQL knowledge queries (Wikidata, DBpedia, custom endpoints)
- [Auto-connect & credentials](docs/auto-registration.md) - Automatic credential loading and connection
- [Lingue integration](docs/lingue-integration.md)
- [MCP client guide](docs/mcp-client.md)
- [MCP server guide](docs/mcp-server.md)
- [API reference](docs/api-reference.md)
- [Testing & env](docs/testing.md)
- [Server deployment](docs/server.md)
- [Debate/Chair/Recorder notes](docs/debating-society.md)
- [Lingue ontology & protocol specs](https://danja.github.io/lingue/)

## Architecture At A Glance

- `src/agents` — AgentRunner, providers, and profile system.
- `src/lib` — XMPP helpers, Lingue utilities, logging, RDF tools.
- `src/mcp` — MCP client/server bridges and test servers.
- `config/agents/*.ttl` — RDF profiles describing each agent.
- `config/agents/secrets.json` — local XMPP passwords keyed by profile (ignored in git).
- `docs/` — integration guides and operational docs.

## Implemented Agents

- **Mistral** — AI chat agent backed by Mistral API with Lingue/IBIS summaries.
- **Semem** — MCP-backed knowledge agent for `tell/ask/augment` flows.
- **Data** — SPARQL knowledge query agent for Wikidata, DBpedia, and custom endpoints. [Guide](docs/data-agent.md)
- **Demo** — Minimal chat bot for quick XMPP smoke checks.
- **Chair** — Debate facilitator/Moderator agent.
- **Recorder** — Meeting logger/recorder agent that listens broadly.
- **Prolog** — Logic agent using tau-prolog for queries.
- **MCP Loopback** — MCP client/server echo agent for integration tests.

## Library Usage

```javascript
import { AgentRunner, LingueNegotiator, LINGUE, Handlers, InMemoryHistoryStore } from "tia-agents";

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({
  profile,
  provider,
  negotiator,
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});
await runner.start();
```

See [examples/minimal-agent.js](examples/minimal-agent.js) for a runnable local example.

## NPM Package Usage

TIA is published as `tia-agents` on npm and supports two approaches to creating bots:

### Quick Start

```bash
npm install tia-agents
```

For a minimal, npm-packaged Mistral bot starter, see `mistral-minimal/README.md`.
If you're using the Mistral provider, install the peer dependency and ensure the API key env var referenced in your profile is set (default: `MISTRAL_API_KEY`).
If you want auto-registration, omit `xmpp:passwordKey` from the profile and set `autoRegister: true` when creating the agent.

### Approach 1: Config-Driven (Profile Files)

Create profile files and use the factory function:

```javascript
import { createAgent, DemoProvider } from "tia-agents";

// Load from config/agents/mybot.ttl
const runner = await createAgent("mybot", new DemoProvider());
await runner.start();
```

Profile file (`config/agents/mybot.ttl`):
```turtle
@prefix agent: <https://tensegrity.it/vocab/agent#> .
@prefix xmpp: <https://tensegrity.it/vocab/xmpp#> .

<#mybot> a agent:ConversationalAgent ;
  agent:xmppAccount [
    xmpp:service "xmpp://localhost:5222" ;
    xmpp:domain "xmpp" ;
    xmpp:username "mybot" ;
    xmpp:passwordKey "mybot"
  ] ;
  agent:roomJid "general@conference.xmpp" .
```

### Approach 2: Programmatic (No Config Files)

Configure everything in code:

```javascript
import { createSimpleAgent, DemoProvider } from "tia-agents";

const runner = createSimpleAgent({
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

### Creating Custom Providers

Extend `BaseProvider` to implement your own logic:

```javascript
import { BaseProvider } from "tia-agents";

class MyProvider extends BaseProvider {
  async handle({ command, content, metadata }) {
    if (command !== "chat") return null;
    return `You said: ${content}`;
  }
}

const runner = createSimpleAgent({
  // ... config
  provider: new MyProvider()
});
```

### AI-Powered Bots

Install peer dependency:
```bash
npm install @mistralai/mistralai
```

Use MistralProvider:
```javascript
import { createAgent, InMemoryHistoryStore } from "tia-agents";
import { MistralProvider } from "tia-agents/providers/mistral";

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY,
  historyStore: new InMemoryHistoryStore({ maxEntries: 40 })
});

const runner = await createAgent("aibot", provider);
await runner.start();
```

### Templates & Examples

Copy templates to get started:
```bash
cp -r node_modules/tia-agents/templates/* ./
```

See templates for:
- Profile file examples (`.ttl`)
- Provider templates (simple & LLM patterns)
- Runnable example scripts

### Documentation

- 📚 [Quick Start Guide](docs/quick-start.md) - Detailed getting started guide
- 🔧 [Provider Guide](docs/provider-guide.md) - Creating custom providers
- 📖 [API Reference](docs/api-reference.md) - Complete API documentation
- 📁 [Templates](templates/) - Example configurations and code

## Custom Agent API

For a fuller walkthrough and profile-driven setup, see:
- [Agent developer prompt](docs/agent-dev-prompt.md)
- [Minimal agent example](examples/minimal-agent.js)

## Installation & Running

Installation, configuration, and run scripts are documented in:
- [Testing](docs/testing.md)
- [Server](docs/server.md)
- [MCP Server](docs/mcp-server.md)
</file>

</files>
