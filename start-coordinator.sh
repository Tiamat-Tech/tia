#!/bin/bash
# Start the MFR Coordinator agent

# Allow self-signed certificates for local Prosody
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Optional: Set agent profile (defaults to "coordinator")
# export AGENT_PROFILE=coordinator

echo "Starting MFR Coordinator agent..."
node src/services/coordinator-agent.js
