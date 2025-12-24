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
