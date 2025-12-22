#!/bin/bash
# Start the Data Agent service

# Navigate to the project directory first
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "Found .env file, loading configuration..."
    source .env
fi

# Check if MISTRAL_API_KEY is set (for entity extraction)
# Note: If using .env file, the key will be loaded by Node.js via dotenv
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

# Start the agent
node src/services/data-agent.js
