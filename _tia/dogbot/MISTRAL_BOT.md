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