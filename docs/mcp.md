# Model Context Protocol (MCP) Implementation

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
