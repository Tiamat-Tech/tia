#!/bin/bash
# Start the Golem agent service

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
    echo "  ./start-golem.sh"
    exit 1
fi

echo "Starting Golem agent service..."
echo "Using Mistral API for responses"
echo "Configuration:"
echo "  XMPP Server: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-xmpp}"
echo "  Username: ${XMPP_USERNAME:-golem}"
echo "  Resource: ${XMPP_RESOURCE:-${BOT_NICKNAME:-Golem}}"
echo "  MUC Room: ${MUC_ROOM:-general@conference.xmpp}"
echo "  Bot Nickname: ${BOT_NICKNAME:-Golem}"
echo "  Mistral Model: ${MISTRAL_MODEL:-mistral-small-latest}"
echo ""
echo "Special Commands:"
echo "  Golem, prompt <text>  - Change system prompt to <text>"
echo "  Golem, reset prompt   - Reset to original prompt"
echo "  Golem, show prompt    - Show current system prompt"
echo ""
echo "To stop the bot, press Ctrl+C"
echo ""

# Start the bot
node src/services/golem-agent.js
