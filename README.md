# TIA Intelligence Agency

A comprehensive XMPP (Jabber) client library and AI bot framework for Node.js.

## Overview

This project provides both basic XMPP client examples and a complete AI-powered chatbot service. It includes examples for connecting to XMPP servers, sending and receiving messages, working with Multi-User Chat (MUC) rooms, and deploying AI agents that can participate in conversations using the Mistral AI API.

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

### For TBox Users

If you're using the TBox environment, the XMPP server (Prosody) is already configured and running on `localhost:5222` with domain `xmpp`. Users are pre-created including `dogbot@xmpp`.

 Connecting with a client app, eg. 
 * Server: localhost (or your server's IP if connecting remotely)
 * Port: 5222
 * Domain: xmpp
 * Username: danja
 * Password: Claudiopup
 * JID: danja@xmpp

  Security Settings:
  - Enable TLS/SSL
  - Accept self-signed certificates (since it's a local development server)

  Popular XMPP clients:
  - Gajim (Desktop - Linux/Windows/Mac)
  - Conversations (Android)
  - ChatSecure (iOS)
  - Pidgin (Desktop - cross-platform)

  The server is running on port 5222 (standard XMPP) with TLS enabled but using self-signed certificates.

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
# For TBox environment (self-signed certificates)
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
- Replies when mentioned in the room (`Semem`, `bot:`, or `semem:`) or in direct messages.

The agent uses `/chat/enhanced` for answers and mirrors each exchange into `/tell` with lightweight metadata for retrieval.

Profiles:
- Pick with `AGENT_PROFILE=<name>`; the registry lives in `src/services/agent-registry.js` (default and lite included). Each profile can tweak Semem features, nickname, and MUC.
- Quick Semem-only smoke test (no XMPP): `NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-semem-agent.js "your question here"`

### Start all agents (systemd-friendly)

To launch multiple agents under one supervisor (semem, mistral, demo), run:
```bash
./start-all-agents.sh
```

Environment knobs:
- `AGENTS`: comma list to limit which agents start (default: all known). Options: `semem`, `mistral`, `demo`.
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

## TBox Integration

This project is designed to work seamlessly with the TBox development environment:

- **XMPP Server**: Prosody running on `localhost:5222`
- **Pre-configured Users**: `dogbot@xmpp`, `alice@xmpp`, `danja@xmpp`
- **MUC Support**: Conference rooms at `conference.xmpp`
- **Self-signed Certs**: TLS configured for local development

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

## Files Structure

```
tia/
├── src/
│   ├── examples/              # XMPP examples and utilities
│   │   ├── hello-world.js     # Self-messaging example
│   │   ├── call-alice.js      # Send message to another user
│   │   ├── alice.js           # Listen for incoming messages
│   │   ├── test-muc.js        # MUC room testing
│   │   ├── add-users.js       # Create XMPP users from JSON
│   │   ├── list-users.js      # Server information (limited)
│   │   ├── create-muc-room.js # Create MUC rooms with proper protocol
│   │   ├── test-bot-interaction.js # Test MistralBot responses
│   │   ├── discover-xmpp-services.js # Discover XMPP services
│   │   ├── users.json         # User definitions for add-users.js
│   │   ├── db01.js            # Legacy example (self-messaging)
│   │   ├── db02.js            # Legacy example (send message)
│   │   └── db03.js            # Legacy example (receive messages)
│   ├── client/                # Interactive XMPP clients
│   │   └── repl.js            # CLI REPL client
│   └── services/              # AI bot services
│       ├── mistral-bot.js     # Full AI bot with Mistral API
│       └── demo-bot.js        # Demo version (no API key needed)
├── .env.example               # Configuration template
├── start-mistral-bot.sh       # AI bot launcher
├── start-demo-bot.sh          # Demo bot launcher
├── MISTRAL_BOT.md             # Detailed bot documentation
└── README.md                  # This file
```

## License

MIT
