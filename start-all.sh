#!/usr/bin/env bash
#
# Unified agent startup script
#
# Start all agents or a specific subset:
#   ./start-all.sh              # Start all available agents
#   ./start-all.sh mfr          # Start MFR system agents only
#   ./start-all.sh debate       # Start debate system agents only
#
# Or specify custom agent list:
#   AGENTS=mistral,data,prolog ./start-all.sh

set -e

# Change to script directory
cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Preset agent groups
ALL_AGENTS="coordinator,mistral,analyst,creative,chair,recorder,semem,mfr-semantic,data,prolog,executor,demo"
MFR_AGENTS="coordinator,mistral,analyst,creative,chair,recorder,mfr-semantic,data,prolog,executor,demo"
DEBATE_AGENTS="chair,recorder,mistral,analyst,creative"
BASIC_AGENTS="mistral,data,prolog,demo"

echo -e "${BLUE}=== TIA Multi-Agent System ===${NC}"
echo ""

# Load .env file if it exists
if [ -f ".env" ]; then
  echo -e "${GREEN}📄 Loading environment from .env file${NC}"
  set -a  # automatically export all variables
  source .env
  set +a
  echo ""
fi

# Enable logging defaults if not already set
: "${LOG_FILE:=logs/agents.log}"
: "${LOG_LEVEL:=info}"
export LOG_FILE
export LOG_LEVEL

# Determine which agents to start
if [ -n "$1" ]; then
  case "$1" in
    mfr)
      echo -e "${CYAN}Starting MFR (Model-First Reasoning) system${NC}"
      export AGENTS="$MFR_AGENTS"
      ;;
    debate)
      echo -e "${CYAN}Starting Debate system${NC}"
      export AGENTS="$DEBATE_AGENTS"
      ;;
    basic)
      echo -e "${CYAN}Starting basic agents${NC}"
      export AGENTS="$BASIC_AGENTS"
      ;;
    help|--help|-h)
      echo "Usage: $0 [preset|help]"
      echo ""
      echo "Presets:"
      echo "  mfr      - MFR system (full suite): $MFR_AGENTS"
      echo "  debate   - Debate system: $DEBATE_AGENTS"
      echo "  basic    - Basic agents: $BASIC_AGENTS"
      echo "  (none)   - All available agents"
      echo ""
      echo "Custom agent list:"
      echo "  AGENTS=mistral,data,prolog $0"
      echo ""
      echo "Available agents:"
      echo "  coordinator - MFR orchestrator"
      echo "  mistral     - Mistral AI agent (requires MISTRAL_API_KEY)"
      echo "  analyst     - Mistral analyst variant (requires MISTRAL_API_KEY)"
      echo "  creative    - Mistral creative variant (requires MISTRAL_API_KEY)"
      echo "  semem       - Semem MCP agent (optional)"
      echo "  mfr-semantic - MFR semantic constraint agent"
      echo "  data        - SPARQL knowledge query agent"
      echo "  prolog      - Tau-Prolog logic agent"
      echo "  executor    - Plan execution agent (requires MISTRAL_API_KEY)"
      echo "  chair       - Debate facilitator (requires MISTRAL_API_KEY)"
      echo "  recorder    - Meeting recorder (requires SEMEM_AUTH_TOKEN)"
      echo "  demo        - Simple demo bot"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown preset: $1${NC}"
      echo "Run '$0 help' for usage information"
      exit 1
      ;;
  esac
  echo ""
elif [ -z "$AGENTS" ]; then
  echo -e "${CYAN}Starting default MFR (Model-First Reasoning) system${NC}"
  export AGENTS="$MFR_AGENTS"
  echo ""
fi

# Check API keys and provide helpful feedback
WARNINGS=0

if [ -z "$MISTRAL_API_KEY" ] || [ "$MISTRAL_API_KEY" = "your_mistral_api_key_here" ] || [ "$MISTRAL_API_KEY" = "your API key" ]; then
  echo -e "${YELLOW}⚠️  Warning: MISTRAL_API_KEY not set or is placeholder${NC}"
  echo "   Mistral-based agents will be skipped"
  echo "   Set MISTRAL_API_KEY in .env file to enable:"
  echo "   - mistral, analyst, creative, chair agents"
  echo "   - executor agent"
  echo "   Get your API key from: https://console.mistral.ai/"
  echo ""
  WARNINGS=$((WARNINGS + 1))
fi

if [ -z "$SEMEM_AUTH_TOKEN" ] || [ "$SEMEM_AUTH_TOKEN" = "your-api-key" ]; then
  # Only warn if semem is explicitly requested
  if [[ "$AGENTS" == *"semem"* ]] || [[ "$AGENTS" == *"recorder"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: SEMEM_AUTH_TOKEN not set or is placeholder${NC}"
    echo "   Semem and Recorder agents will be skipped"
    echo "   (This is optional - system will work without them)"
    echo ""
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# Check for secrets file
if [ ! -f "config/agents/secrets.json" ]; then
  echo -e "${RED}❌ Error: config/agents/secrets.json not found${NC}"
  echo "   Create this file with XMPP credentials for all agents"
  echo ""
  echo "   Example structure:"
  echo "   {"
  echo "     \"mistral\": { \"password\": \"your_password\" },"
  echo "     \"data\": { \"password\": \"your_password\" },"
  echo "     \"prolog\": { \"password\": \"your_password\" }"
  echo "   }"
  echo ""
  exit 1
fi

if [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ Environment checks passed${NC}"
  echo ""
fi

# Show what will be started
if [ -n "$AGENTS" ]; then
  echo -e "${BLUE}Agent subset:${NC} $AGENTS"
else
  echo -e "${BLUE}Starting:${NC} All available agents"
fi

echo ""
echo -e "${CYAN}Configuration:${NC}"
echo "  XMPP service: ${XMPP_SERVICE:-<from profiles>}"
echo "  XMPP domain:  ${XMPP_DOMAIN:-<from profiles>}"
echo "  Semem API:    ${SEMEM_BASE_URL:-https://mcp.tensegrity.it}"
echo ""

# Start the agent runner
echo -e "${GREEN}Starting agents...${NC}"
echo ""

node src/services/run-all-agents.js
