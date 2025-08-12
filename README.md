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

## Examples

### Basic XMPP Examples

1. **hello-world.js** - Self-messaging example
2. **call-alice.js** - Send a message to another user  
3. **alice.js** - Listen for incoming messages
4. **test-muc.js** - Multi-User Chat (MUC) room example

To run the basic examples a user needs to be created

```bash
# For TBox environment (self-signed certificates)
 NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/add-user.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/hello-world.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/call-alice.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/alice.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node src/examples/test-muc.js
```

The `add-user.js` script hasn't been fully tested, an alternative is :

```sh
 docker exec tbox-xmpp-1 bash -c 'echo -e "Claudiopup\nClaudiopup" | prosodyctl adduser            │
│   danja@xmpp'                                                                                       │
│   Create user danja@xmpp in Prosody without TTY 
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

3. **Start the AI bot:**
   ```bash
   ./start-mistral-bot.sh
   ```

4. **Test with demo bot (no API key required):**
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
- Tag format: "@mistralbot can you help?"

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
dogbot/
├── src/
│   ├── examples/           # Basic XMPP examples
│   │   ├── db01.js        # Self-messaging
│   │   ├── db02.js        # Send message
│   │   ├── db03.js        # Receive messages
│   │   └── test-muc.js    # MUC testing
│   └── services/          # AI bot services
│       ├── mistral-bot.js # Full AI bot
│       └── demo-bot.js    # Demo version
├── .env.example           # Configuration template
├── start-mistral-bot.sh   # AI bot launcher
├── start-demo-bot.sh      # Demo bot launcher
├── MISTRAL_BOT.md         # Detailed bot documentation
└── README.md              # This file
```

## License

MIT