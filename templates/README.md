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
