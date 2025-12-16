#!/bin/bash
# Start all configured agents (suitable for systemd ExecStart)

cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo "Loading configuration from .env"
  source .env
fi

echo "Starting all agents..."
echo "  AGENTS=${AGENTS:-<all known>}"
echo "  Agent profile: ${AGENT_PROFILE:-default}"
echo "  Semem API: ${SEMEM_BASE_URL:-https://mcp.tensegrity.it}"
echo "  XMPP service: ${XMPP_SERVICE:-xmpp://localhost:5222}"

node src/services/run-all-agents.js
