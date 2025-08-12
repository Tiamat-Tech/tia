#!/bin/bash
# Start the Mistral Bot service

# Navigate to the project directory first
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Found .env file, loading configuration..."
    source .env
fi

# Check if MISTRAL_API_KEY is set (either from .env or environment)
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

# Set TLS environment variable (can be overridden in .env)
export NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED:-0}

echo "Starting MistralBot service..."
echo "Using Mistral API for responses"
echo "Configuration:"
echo "  XMPP Server: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-xmpp}"
echo "  Username: ${XMPP_USERNAME:-dogbot}"
echo "  MUC Room: ${MUC_ROOM:-general@conference.xmpp}"
echo "  Bot Nickname: ${BOT_NICKNAME:-MistralBot}"
echo "  Mistral Model: ${MISTRAL_MODEL:-mistral-small-latest}"
echo ""
echo "To stop the bot, press Ctrl+C"
echo ""

# Start the bot
node src/services/mistral-bot.js