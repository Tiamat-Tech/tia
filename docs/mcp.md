# Model Context Protocol (MCP) Implementation

```sh
claude mcp add tia-agents npx -y -p tia-agents node ./node_modules/tia-agents/src/mcp/servers/Echo.js
```

or

```sh
codex mcp add tia-agents npx -y -p tia-agents node ./node_modules/tia-agents/src/mcp/servers/Echo.js
```

[mcp_servers.tia-agents]
command = "node"
args = ["/home/danny/hyperdata/tia/src/mcp/servers/Echo.js"]

claude mcp add tia-agents node /home/danny/hyperdata/tia/src/mcp/servers/Echo.js
 
 File modified: /home/danny/.claude.json [project: /home/danny/hyperdata/tia]

codex mcp add tia-agents --env TIA_ENV_PATH=/home/danny/hyperdata/tia/.env -- node /home/danny/hyperdata/tia/src/mcp/servers/Echo.js

[mcp_servers.tia-agents]
command = "npx"
args = ["-y", "-p", "tia-agents", "node", "-e", "import('tia-agents/src/mcp/servers/Echo.js')"]

## Overview
This document describes the MCP client and server implementation that enables JSON-RPC 2.0 based communication between processes using standard input/output.

## Client (client.js)

### Features
- Connects to the MCP server using stdio
- Sends JSON-RPC 2.0 formatted requests
- Handles responses and errors asynchronously
- Provides an interactive command-line interface

### Usage
```bash
node src/mcp/client.js
```

### Available Commands
- `help` - Show available commands
- `exit` or `quit` - Exit the client

### Request Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "echo",
  "params": {
    "message": "Your message here"
  }
}
```

## Server (servers/Echo.js)

### Features
- Implements JSON-RPC 2.0 server over stdio
- Handles multiple concurrent requests
- Provides echo functionality
- Includes comprehensive error handling

### Usage
```bash
node src/mcp/servers/Echo.js
```

### Supported Methods

#### echo
Echoes back the received message.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "echo",
  "params": {
    "message": "Hello, world!"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "content": [{
      "type": "text",
      "text": "Echo: Hello, world!"
    }]
  }
}
```

#### xmppStatus
Reports XMPP connection state for the debug agent and the last message observed in the room.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "status-1",
  "method": "xmppStatus"
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "status-1",
  "result": {
    "connected": true,
    "room": "general@conference.xmpp",
    "nickname": "McpDebug",
    "lastIncoming": {
      "body": "hello room",
      "sender": "alice",
      "from": "general@conference.xmpp/alice",
      "type": "groupchat",
      "receivedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### xmppSend
Sends a test message to the configured MUC for basic connectivity checks.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": "send-1",
  "method": "xmppSend",
  "params": {
    "message": "Test message from MCP"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": "send-1",
  "result": {
    "sent": true,
    "to": "general@conference.xmpp",
    "message": "Test message from MCP"
  }
}
```

### XMPP Debug Agent Configuration

The MCP server (`src/mcp/servers/Echo.js`) now spins up a lightweight XMPP participant for debugging. Configure it via `.env`:
```
XMPP_SERVICE=xmpp://localhost:5222       # or xmpps://host:5222 with NODE_TLS_REJECT_UNAUTHORIZED=0
XMPP_DOMAIN=xmpp
XMPP_USERNAME=dogbot
XMPP_PASSWORD=woofwoof
MUC_ROOM=general@conference.xmpp
MCP_BOT_NICKNAME=McpDebug
```

On startup the server will join the MUC and log any messages it sees. Use `xmppStatus` to check join state and last observed message; use `xmppSend` to post a test message into the room.

`.env` resolution:
- First looks in the current working directory (or `TIA_ENV_PATH` if set).
- Then falls back to the package root `.env` (when running from a checkout).

## Error Handling

### Common Error Codes
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32700`: Parse error

### Error Response Format
```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": "Additional error details"
  }
}
```

## Implementation Notes

### Client-Server Communication
- Uses newline-delimited JSON (JSONL) for message framing
- Each JSON-RPC message must be a single line
- Messages are expected to be valid JSON

### Dependencies
- Node.js (v14+)
- No external dependencies required

### Logging
- Server logs to stderr with `[Server]` prefix
- Client logs debug information with `[Client]` prefix
- Application output is sent to stdout

## Example Session

1. Start the server:
   ```bash
   $ node src/mcp/servers/Echo.js
   [Server] Starting simple MCP echo server
   [Server] Ready to accept connections
   ```

2. Start the client:
   ```bash
   $ node src/mcp/client.js
   Connected! Type a message or "help" for commands.
   echo> hello
   Echo: hello
   ```

3. The server will show the request/response flow:
   ```
   [Server] Received request: { ... }
   [Server] Echoing: hello
   [Server] Sending response: { ... }
   ```
