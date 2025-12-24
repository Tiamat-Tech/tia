#!/usr/bin/env bash
#
# Restart all TIA agents
#
# Usage:
#   ./restart-all.sh              # Restart with default MFR system
#   ./restart-all.sh mfr          # Restart MFR system
#   ./restart-all.sh debate       # Restart debate system
#   AGENTS=mistral,data ./restart-all.sh  # Restart specific agents
#

# Change to script directory
cd "$(dirname "$0")"

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Restarting TIA Multi-Agent System ===${NC}"
echo ""

# Stop existing agents
./stop-all.sh

# Brief pause to ensure clean shutdown
sleep 1

echo ""
echo -e "${BLUE}=== Starting agents ===${NC}"
echo ""

# Ensure logging defaults
: "${LOG_FILE:=logs/agents.log}"
: "${LOG_LEVEL:=info}"
export LOG_FILE
export LOG_LEVEL

# Start with same arguments passed to this script
./start-all.sh "$@"
