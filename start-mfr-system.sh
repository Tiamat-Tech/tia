#!/usr/bin/env bash
#
# Start all agents required for MFR (Model-First Reasoning) system
#
# This script starts:
# - Coordinator (MFR orchestrator)
# - Mistral (Natural Language Agent)
# - Data (Knowledge Query Agent)
# - Prolog (Logical Reasoning Agent)
# - Semem (Semantic Reasoning Agent)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting MFR Multi-Agent System ===${NC}"
echo ""

# Check if required environment variables are set
if [ -z "$MISTRAL_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Warning: MISTRAL_API_KEY not set${NC}"
  echo "   Mistral agent may not function properly"
fi

if [ -z "$SEMEM_AUTH_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  Warning: SEMEM_AUTH_TOKEN not set${NC}"
  echo "   Semem agent may not function properly"
fi

# Check for secrets file
if [ ! -f "config/agents/secrets.json" ]; then
  echo -e "${RED}❌ Error: config/agents/secrets.json not found${NC}"
  echo "   Create this file with XMPP credentials for all agents"
  exit 1
fi

echo -e "${GREEN}✅ Environment checks passed${NC}"
echo ""

# Create log directory
mkdir -p logs

# Function to start an agent in the background
start_agent() {
  local agent_name=$1
  local command=$2
  local log_file="logs/${agent_name}.log"

  echo -e "${BLUE}▶  Starting ${agent_name}...${NC}"

  # Start agent and redirect output to log file
  eval "$command > $log_file 2>&1 &"
  local pid=$!

  echo "   PID: $pid"
  echo "   Log: $log_file"
  echo ""

  # Give agent time to start
  sleep 2
}

# Start agents one by one
echo -e "${GREEN}Starting agents...${NC}"
echo ""

# 1. Coordinator (must start first)
start_agent "coordinator" "AGENT_PROFILE=coordinator node src/services/coordinator-agent.js"

# 2. Data Agent (knowledge grounding)
start_agent "data" "AGENT_PROFILE=data node src/services/data-agent.js"

# 3. Prolog Agent (logical reasoning)
start_agent "prolog" "AGENT_PROFILE=prolog node src/services/prolog-agent.js"

# 4. Mistral Agent (natural language)
start_agent "mistral" "AGENT_PROFILE=mistral node src/services/mistral-bot.js"

# 5. Semem Agent (semantic reasoning) - optional if not configured
if [ -n "$SEMEM_AUTH_TOKEN" ]; then
  start_agent "semem" "AGENT_PROFILE=semem node src/services/semem-agent.js"
else
  echo -e "${YELLOW}⚠️  Skipping Semem agent (SEMEM_AUTH_TOKEN not set)${NC}"
  echo ""
fi

echo -e "${GREEN}✅ All agents started${NC}"
echo ""
echo "To monitor agent logs:"
echo "  tail -f logs/coordinator.log"
echo "  tail -f logs/mistral.log"
echo "  tail -f logs/data.log"
echo "  tail -f logs/prolog.log"
echo "  tail -f logs/semem.log"
echo ""
echo "To stop all agents:"
echo "  pkill -f 'node src/services'"
echo ""
echo -e "${BLUE}The MFR system is now running and ready for sessions.${NC}"
echo ""
echo "Test the system with:"
echo "  node src/examples/test-mfr-session.js"
echo ""
