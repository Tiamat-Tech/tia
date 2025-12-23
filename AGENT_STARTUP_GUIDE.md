# TIA Agent Startup Guide

## Unified Startup Script

The `start-all.sh` script provides a unified, robust way to start all TIA agents or specific subsets.

### Features

- **Smart `.env` loading** - Automatically loads environment variables from `.env` file
- **API key validation** - Detects missing or placeholder API keys and provides helpful guidance
- **Preset agent groups** - Quick shortcuts for common configurations
- **Graceful failure** - Skips agents with missing credentials instead of crashing
- **Auto-restart** - Automatically restarts crashed agents with exponential backoff
- **Clean shutdown** - Handles SIGTERM/SIGINT for graceful shutdown

### Replacement for Old Scripts

This unified script **replaces**:
- `start-all-agents.sh` - Basic agent startup
- `start-mfr-system.sh` - MFR-specific startup

Both old scripts are now superseded by `start-all.sh` with preset modes.

## Quick Start

### Prerequisites

1. **Environment Configuration** (`.env` file):
```bash
# Copy from example
cp .env.example .env

# Edit and set your actual API keys
MISTRAL_API_KEY=your_actual_mistral_api_key_here
# SEMEM_AUTH_TOKEN=your-token  # Optional
```

2. **XMPP Credentials** (`config/agents/secrets.json`):
```json
{
  "coordinator": { "password": "your_password" },
  "mistral": { "password": "your_password" },
  "data": { "password": "your_password" },
  "prolog": { "password": "your_password" }
}
```

3. **For MFR System** - Prosody MUC rooms:
See [MFR Room Setup](MFR_ROOM_SETUP.md) for Prosody configuration and room creation.

## Usage Examples

### Start All Available Agents

```bash
./start-all.sh
```

This starts all agents for which credentials are available. Agents requiring missing API keys are automatically skipped.

### Start MFR System

```bash
./start-all.sh mfr
```

Starts the Model-First Reasoning system (full suite):
- `coordinator` - MFR orchestrator
- `mistral` - Natural language understanding
- `analyst` - Analytical AI participant
- `creative` - Creative AI participant
- `chair` - Debate facilitator
- `recorder` - Meeting recorder
- `semem` - Semantic reasoning (if configured)
- `data` - Knowledge grounding (Wikidata/SPARQL)
- `prolog` - Logical reasoning
- `demo` - Simple demo bot

**Requirements:**
- `MISTRAL_API_KEY` in `.env`
- MFR MUC rooms configured (see [MFR Room Setup](MFR_ROOM_SETUP.md))

### Start Debate System

```bash
./start-all.sh debate
```

Starts the debate/discussion system:
- `chair` - Debate facilitator
- `recorder` - Meeting recorder
- `mistral` - Base AI participant
- `analyst` - Analytical AI participant
- `creative` - Creative AI participant

**Requirements:**
- `MISTRAL_API_KEY` for AI agents
- `SEMEM_AUTH_TOKEN` for recorder (optional)

### Start Basic Agents

```bash
./start-all.sh basic
```

Starts a minimal set of core agents:
- `mistral` - AI chat agent
- `data` - Knowledge query agent
- `prolog` - Logic agent
- `demo` - Simple demo bot

### Custom Agent Selection

Start only specific agents:

```bash
AGENTS=mistral,data ./start-all.sh
```

Or export for multiple commands:

```bash
export AGENTS=coordinator,mistral,data,prolog
./start-all.sh
```

### Get Help

```bash
./start-all.sh help
```

Shows all available presets and agents.

## Understanding the Output

### Successful Start

```
=== TIA Multi-Agent System ===

📄 Loading environment from .env file

Starting MFR (Model-First Reasoning) system

✅ Environment checks passed

Agent subset: coordinator,mistral,data,prolog,semem

Configuration:
  XMPP service: xmpp://tensegrity.it:5222
  XMPP domain:  tensegrity.it
  Semem API:    https://mcp.tensegrity.it

Starting agents...

Starting agent "coordinator" (MFR Coordinator): node src/services/coordinator-agent.js
Starting agent "mistral" (Mistral API-backed bot): node src/services/mistral-bot.js
Starting agent "data" (Data agent): node src/services/data-agent.js
Starting agent "prolog" (Prolog agent): node src/services/prolog-agent.js
Starting agent "semem" (Semem MCP-backed agent): node src/services/semem-agent.js
```

### Missing API Keys

```
⚠️  Warning: MISTRAL_API_KEY not set or is placeholder
   Mistral-based agents will be skipped
   Set MISTRAL_API_KEY in .env file to enable:
   - mistral, analyst, creative, chair agents
   Get your API key from: https://console.mistral.ai/

⚠️  Warning: SEMEM_AUTH_TOKEN not set or is placeholder
   Semem and Recorder agents will be skipped
   (This is optional - system will work without them)
```

The script continues and starts agents that don't require the missing keys.

### Missing Secrets File

```
❌ Error: config/agents/secrets.json not found
   Create this file with XMPP credentials for all agents

   Example structure:
   {
     "mistral": { "password": "your_password" },
     "data": { "password": "your_password" },
     "prolog": { "password": "your_password" }
   }
```

The script exits. Create the secrets file and try again.

## Monitoring Running Agents

### Check Process Status

```bash
# List running agent processes
ps aux | grep "node src/services"

# Or use pgrep
pgrep -fa "node src/services"
```

### View Logs

Agent output is shown in the terminal. For production, redirect to log files:

```bash
./start-all.sh mfr > logs/mfr-system.log 2>&1 &
```

Or use the systemd service (see [Server Deployment](docs/server.md)).

### Monitor Specific Agent

When running in foreground, all agent output is mixed. To monitor specific agents, start them individually:

```bash
AGENTS=mistral AGENT_PROFILE=mistral node src/services/mistral-bot.js
```

## Stopping Agents

### Graceful Shutdown

Press `Ctrl+C` in the terminal where agents are running. The script will:
1. Send SIGTERM to all agent processes
2. Wait up to 3 seconds for clean shutdown
3. Exit

### Force Stop All Agents

If agents don't respond to Ctrl+C:

```bash
pkill -f "node src/services"
```

Or more forcefully:

```bash
pkill -9 -f "node src/services"
```

### Stop Specific Agent

```bash
pkill -f "coordinator-agent.js"
pkill -f "mistral-bot.js"
```

## Auto-Restart Behavior

The agent runner (`run-all-agents.js`) automatically restarts crashed agents with exponential backoff:

- First restart: 2 seconds
- Second restart: 4 seconds
- Third restart: 8 seconds
- Max delay: 30 seconds

**When auto-restart is disabled:**
- Agent exits cleanly (exit code 0)
- Missing required environment variables
- System is shutting down

## Troubleshooting

### "Skipping agent - missing required env vars"

**Problem:** Agent requires API key that's not set.

**Solution:**
1. Check `.env` file exists
2. Verify API key is set (not placeholder)
3. Run from project root directory

### "config/agents/secrets.json not found"

**Problem:** XMPP credentials file doesn't exist.

**Solution:**
```bash
# Create secrets file
cat > config/agents/secrets.json << 'EOF'
{
  "coordinator": { "password": "your_password" },
  "mistral": { "password": "your_password" },
  "data": { "password": "your_password" },
  "prolog": { "password": "your_password" },
  "semem": { "password": "your_password" }
}
EOF

# Secure it
chmod 600 config/agents/secrets.json
```

### Agents Keep Restarting

**Problem:** Agent crashes immediately after starting.

**Symptoms:**
```
Starting agent "mistral" ...
Agent "mistral" exited with code 1
Restarting agent "mistral" in 2000ms (attempt 1)
```

**Common Causes:**
1. Invalid XMPP credentials
2. XMPP server not reachable
3. Missing dependencies
4. Invalid API key

**Debug:**
```bash
# Run agent directly to see full error
AGENT_PROFILE=mistral node src/services/mistral-bot.js
```

### MFR System Not Working

**Problem:** MFR agents start but system doesn't respond.

**Checklist:**
1. All 3 MFR rooms exist and are joinable:
   ```bash
   node src/examples/diagnose-mfr-rooms.js
   ```

2. Coordinator agent is running:
   ```bash
   pgrep -fa coordinator-agent
   ```

3. Check Prosody configuration (see [MFR Room Setup](MFR_ROOM_SETUP.md))

### "Unknown agent" Warning

**Problem:** Requested agent not defined in `run-all-agents.js`.

**Example:**
```
Unknown agent "myagent", skipping.
```

**Solution:** Check spelling or add agent definition to `src/services/run-all-agents.js`.

## Migration from Old Scripts

### If You Were Using `start-all-agents.sh`

**Old:**
```bash
./start-all-agents.sh
```

**New:**
```bash
./start-all.sh
```

Environment loading is now automatic - no need to manually source `.env`.

### If You Were Using `start-mfr-system.sh`

**Old:**
```bash
./start-mfr-system.sh
```

**New:**
```bash
./start-all.sh mfr
```

Same functionality, but now uses the robust agent runner with auto-restart.

### If You Were Using Custom `AGENTS` Variable

**Old:**
```bash
AGENTS="chair,recorder" ./start-all-agents.sh
```

**New:**
```bash
AGENTS=chair,recorder ./start-all.sh
```

Same usage, works identically.

## Advanced Usage

### Running in Background

```bash
# Start in background
./start-all.sh mfr &

# Or with nohup
nohup ./start-all.sh mfr > logs/mfr.log 2>&1 &

# Save PID for later
echo $! > /tmp/tia-agents.pid
```

### Systemd Service

For production deployment, use systemd:

```bash
sudo systemctl start tia-agents
sudo systemctl enable tia-agents  # Start on boot
```

See [Server Deployment](docs/server.md) for systemd configuration.

### Development Mode

Start subset for development:

```bash
# Just mistral and data for testing
AGENTS=mistral,data ./start-all.sh
```

## Available Agents

| Agent | Description | Required Env Vars |
|-------|-------------|-------------------|
| `coordinator` | MFR orchestrator | None |
| `mistral` | Mistral AI base agent | `MISTRAL_API_KEY` |
| `analyst` | Mistral analyst variant | `MISTRAL_API_KEY` |
| `creative` | Mistral creative variant | `MISTRAL_API_KEY` |
| `chair` | Debate facilitator | `MISTRAL_API_KEY` |
| `semem` | Semem MCP agent | None (optional token) |
| `recorder` | Meeting recorder | `SEMEM_AUTH_TOKEN` |
| `data` | SPARQL knowledge agent | None |
| `prolog` | Logic reasoning agent | None |
| `demo` | Simple demo bot | None |

## See Also

- [MFR Room Setup](MFR_ROOM_SETUP.md) - Configure Prosody for MFR system
- [Server Deployment](docs/server.md) - Production deployment with systemd
- [Testing Guide](docs/testing.md) - Testing agents
- [API Reference](docs/api-reference.md) - Agent API documentation
