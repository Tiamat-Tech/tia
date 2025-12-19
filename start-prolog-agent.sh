#!/bin/bash

cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo "Loading configuration from .env"
  source .env
fi

export AGENT_PROFILE=${AGENT_PROFILE:-prolog}

echo "Starting Prolog agent..."
node src/services/prolog-agent.js
