#!/bin/bash
# Start only the debate-specific agents: chair and recorder
cd "$(dirname "$0")"

if [ -f ".env" ]; then
  source .env
fi

AGENTS="chair,recorder" node src/services/run-all-agents.js
