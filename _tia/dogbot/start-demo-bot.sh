#!/bin/bash
# Start the Demo Bot service (no API key required)

# Set TLS environment variable
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Starting Demo Bot service..."
echo "This demo bot doesn't require Mistral API"
echo "Connecting to XMPP server on localhost:5222"
echo "Bot will join room: general@conference.xmpp"
echo ""
echo "To stop the bot, press Ctrl+C"
echo ""

# Start the demo bot
node src/services/demo-bot.js