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
echo "  Bot nicknames/resources:"
echo "    Mistral: ${BOT_NICKNAME:-MistralBot} / ${XMPP_RESOURCE:-<auto>}"
echo "    Analyst: ${ANALYST_NICKNAME:-Analyst} / ${ANALYST_RESOURCE:-<auto>}"
echo "    Creative: ${CREATIVE_NICKNAME:-Creative} / ${CREATIVE_RESOURCE:-<auto>}"
echo "    Semem:   ${SEMEM_NICKNAME:-${SEMEM_LITE_NICKNAME:-${AGENT_NICKNAME:-Semem}}} / ${AGENT_RESOURCE:-${XMPP_RESOURCE:-<auto>}}"
echo "    Demo:    ${BOT_NICKNAME:-DemoBot} / ${XMPP_RESOURCE:-<auto>}"
echo "    Prolog:  ${PROLOG_NICKNAME:-Prolog} / ${PROLOG_RESOURCE:-<auto>}"
echo "    Data:    <from profile>"

node src/services/run-all-agents.js
