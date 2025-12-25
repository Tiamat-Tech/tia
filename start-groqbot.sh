#!/bin/bash
# Start the Groq Bot service

# Navigate to the project directory first
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Found .env file, loading configuration..."
    source .env
fi

# Check if GROQ_API_KEY is set (either from .env or environment)
if [ -z "$GROQ_API_KEY" ]; then
    echo "Error: GROQ_API_KEY is required"
    echo ""
    echo "Option 1: Create a .env file:"
    echo "  cp .env.example .env"
    echo "  # Edit .env and add your Groq API key"
    echo ""
    echo "Option 2: Set environment variable:"
    echo "  export GROQ_API_KEY=your_api_key_here"
    echo "  ./start-groq-bot.sh"
    exit 1
fi

# Set TLS environment variable (can be overridden in .env)
# export NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED:-0}

echo "Starting GroqBot service..."
echo "Using Groq API for responses"
echo "Configuration:"
echo "  XMPP Server: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-xmpp}"
echo "  Username: ${XMPP_USERNAME:-groqbot}"
echo "  Resource: ${XMPP_RESOURCE:-${BOT_NICKNAME:-<nickname>}}"
echo "  MUC Room: ${MUC_ROOM:-general@conference.xmpp}"
echo "  Bot Nickname: ${BOT_NICKNAME:-GroqBot}"
echo "  Groq Model: ${GROQ_MODEL:-llama-3.3-70b-versatile}"
echo "  Restart on conflict: yes (auto suffix)"
echo ""
echo "To stop the bot, press Ctrl+C"
echo ""

# Start the bot
node src/services/groq-bot.js
