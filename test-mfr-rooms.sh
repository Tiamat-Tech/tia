#!/usr/bin/env bash
#
# Test MFR room creation and verification
#
# This script runs the integration test that:
# 1. Creates the three MFR rooms
# 2. Verifies they actually exist
# 3. Queries room information

set -e

echo "=== MFR Room Creation Integration Test ==="
echo ""

# Check if test credentials are needed
if [ -z "$XMPP_TEST_USERNAME" ]; then
  export XMPP_TEST_USERNAME="testuser"
fi

if [ -z "$XMPP_TEST_PASSWORD" ]; then
  export XMPP_TEST_PASSWORD="testpass"
fi

# Run the integration test
node --test test/integration/mfr-room-creation.test.js

echo ""
echo "Test complete. Check output above for results."
