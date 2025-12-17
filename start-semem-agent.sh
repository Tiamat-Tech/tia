#!/bin/bash
# Start the Semem-backed XMPP agent

cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo "Loading configuration from .env"
  source .env
fi

echo "Starting Semem agent..."
echo "  Agent Profile: ${AGENT_PROFILE:-default}"
echo "  XMPP Server: ${XMPP_SERVICE:-xmpp://localhost:5222}"
echo "  XMPP Domain: ${XMPP_DOMAIN:-xmpp}"
echo "  Username: ${XMPP_USERNAME:-dogbot}"
echo "  Resource: ${AGENT_RESOURCE:-${XMPP_RESOURCE:-${SEMEM_NICKNAME:-${SEMEM_LITE_NICKNAME:-${AGENT_NICKNAME:-<profile default>}}}}}"
echo "  MUC Room: ${MUC_ROOM:-general@conference.xmpp}"
echo "  Bot Nickname: ${SEMEM_NICKNAME:-${SEMEM_LITE_NICKNAME:-${AGENT_NICKNAME:-<profile default>}}}"
echo "  Semem API: ${SEMEM_BASE_URL:-https://mcp.tensegrity.it}"
echo ""
echo "Press Ctrl+C to stop."

node src/services/semem-agent.js
