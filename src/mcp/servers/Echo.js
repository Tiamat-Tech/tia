// Simple MCP-compatible echo server
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

console.error('[Server] Starting simple MCP echo server');

// Simple JSON-RPC 2.0 response helper
function createResponse(id, result = null, error = null) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id,
    ...(result !== null && { result }),
    ...(error !== null && { error })
  }) + '\n';
}

// Buffer to accumulate incoming data
let buffer = '';

process.stdin.on('data', (chunk) => {
  try {
    // Add chunk to buffer
    buffer += chunk.toString();
    
    // Process complete JSON objects in the buffer
    let boundary;
    while ((boundary = buffer.indexOf('\n')) !== -1) {
      const line = buffer.substring(0, boundary).trim();
      buffer = buffer.substring(boundary + 1);
      
      if (!line) continue;
      
      try {
        const request = JSON.parse(line);
        console.error('[Server] Received request:', JSON.stringify(request, null, 2));
        
        // Handle echo method
        if (request.method === 'echo' || request.method === 'callTool') {
          const params = request.params || request.arguments || {};
          const message = params.message || '';
          
          console.error(`[Server] Echoing: ${message}`);
          
          // Send response
          const response = createResponse(request.id, {
            content: [{
              type: 'text',
              text: `Echo: ${message}`
            }]
          });
          
          console.error('[Server] Sending response:', response.trim());
          process.stdout.write(response);
          process.stdout.emit('drain'); // Ensure the data is flushed
        } else {
          // Method not found
          const response = createResponse(request.id, null, {
            code: -32601,
            message: 'Method not found'
          });
          console.error('[Server] Sending error:', response.trim());
          process.stdout.write(response);
          process.stdout.emit('drain');
        }
      } catch (error) {
        console.error('[Server] Error processing request:', error);
        // We don't have request.id here, so we can't send a proper error response
        console.error('[Server] Could not send error response - no request ID available');
      }
    }
  } catch (error) {
    console.error('[Server] Fatal error in data handler:', error);
  }
});

// Handle server startup
console.error('[Server] Echo server is running on stdio');

// Handle process termination
process.on('SIGINT', () => {
  console.error('\n[Server] Shutting down...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n[Server] Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('\n[Server] Unhandled rejection:', reason);
});

console.error('[Server] Ready to accept connections');