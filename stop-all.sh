#!/usr/bin/env bash
#
# Stop all TIA agents
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Stopping TIA Multi-Agent System ===${NC}"
echo ""

# Find all node processes running TIA services
PIDS=$(pgrep -f "node src/services/" || true)

if [ -z "$PIDS" ]; then
  echo -e "${GREEN}✅ No TIA agent processes found running${NC}"
  exit 0
fi

echo -e "${YELLOW}Found running agent processes:${NC}"
# Convert newline-separated PIDs to comma-separated for ps
PIDS_COMMA=$(echo "$PIDS" | tr '\n' ',' | sed 's/,$//')
ps -p "$PIDS_COMMA" -o pid,cmd 2>/dev/null | grep "node src/services" || echo "$PIDS"
echo ""

# Send SIGTERM to allow graceful shutdown
echo -e "${BLUE}Sending SIGTERM for graceful shutdown...${NC}"
kill -TERM $PIDS 2>/dev/null || true

# Wait up to 5 seconds for processes to exit
echo -e "${BLUE}Waiting for processes to exit...${NC}"
for i in {1..5}; do
  sleep 1
  REMAINING=$(pgrep -f "node src/services/" || true)
  if [ -z "$REMAINING" ]; then
    echo -e "${GREEN}✅ All agents stopped gracefully${NC}"
    exit 0
  fi
  echo -n "."
done
echo ""

# If processes still running, force kill
REMAINING=$(pgrep -f "node src/services/" || true)
if [ -n "$REMAINING" ]; then
  echo -e "${YELLOW}⚠️  Some processes didn't exit gracefully, forcing...${NC}"
  kill -9 $REMAINING 2>/dev/null || true
  sleep 1

  # Final check
  STILL_RUNNING=$(pgrep -f "node src/services/" || true)
  if [ -z "$STILL_RUNNING" ]; then
    echo -e "${GREEN}✅ All agents stopped (forced)${NC}"
  else
    echo -e "${RED}❌ Some processes could not be stopped:${NC}"
    STILL_COMMA=$(echo "$STILL_RUNNING" | tr '\n' ',' | sed 's/,$//')
    ps -p "$STILL_COMMA" -o pid,cmd 2>/dev/null || echo "$STILL_RUNNING"
    exit 1
  fi
else
  echo -e "${GREEN}✅ All agents stopped${NC}"
fi
