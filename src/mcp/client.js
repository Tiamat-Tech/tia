import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from 'readline';
import { stdin as input, stdout as output } from 'process';

class EchoClient {
  constructor() {
    this.rl = readline.createInterface({
      input,
      output,
      prompt: 'echo> ',
      terminal: true
    });
    
    // No need for MCP client in this simplified version
    this.client = {};
  }

  async start() {
    try {
      // Use dynamic import for the child_process module
      const { spawn } = await import('node:child_process');
      
      // Start the server as a child process
      this.serverProcess = spawn('node', ['src/mcp/servers/Echo.js']);
      
      // Handle server output
      this.serverProcess.stdout.on('data', (data) => {
        // Only log server output that's not JSON (to avoid double-printing responses)
        try {
          JSON.parse(data.toString());
        } catch {
          process.stdout.write(data);
        }
      });
      
      this.serverProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      // Handle server process exit
      this.serverProcess.on('close', (code) => {
        console.error(`\n[Server] Process exited with code ${code}`);
        process.exit(code);
      });
      
      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Connected! Type a message or "help" for commands.\n');
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Start the prompt
      this.promptUser();
      
    } catch (error) {
      console.error('\nConnection error:', error.message);
      this.cleanup();
      process.exit(1);
    }
  }

  setupEventHandlers() {
    // Handle Ctrl+C
    this.rl.on('SIGINT', () => this.shutdown());
    
    // Handle process termination
    process.on('exit', () => this.cleanup());
  }

  promptUser() {
    this.rl.question('', async (input) => {
      const command = input.trim();
      const lowerCommand = command.toLowerCase();

      if (lowerCommand === 'exit' || lowerCommand === 'quit') {
        return this.shutdown();
      }

      if (lowerCommand === 'help') {
        this.showHelp();
        return this.promptUser();
      }

      if (command) {
        await this.handleCommand(command);
      }
      
      this.promptUser();
    });
  }

  async handleCommand(command) {
    try {
      console.error('\n[Client] Sending command:', command);
      
      // Create a simple JSON-RPC request
      const request = {
        jsonrpc: '2.0',
        id: Date.now().toString(),
        method: 'echo',
        params: { message: command }
      };
      
      // Convert request to string and add newline delimiter
      const requestStr = JSON.stringify(request) + '\n';
      
      // Send the request to the server
      return new Promise((resolve, reject) => {
        // Create a one-time response handler
        const onData = (data) => {
          try {
            const responseStr = data.toString().trim();
            if (!responseStr) return; // Skip empty lines
            
            console.error('[Client] Received data:', responseStr);
            
            const response = JSON.parse(responseStr);
            
            // Check if this is the response to our request
            if (response.id === request.id) {
              clearTimeout(timeoutId);
              this.serverProcess.stdout.off('data', onData);
              
              if (response.error) {
                reject(new Error(`Server error: ${response.error.message || 'Unknown error'}`));
              } else {
                // Process the successful response
                const result = response.result;
                console.error('[Client] Received response:', JSON.stringify(result, null, 2));
                
                // Handle different response formats
                if (typeof result === 'string') {
                  console.log(`\n${result}\n`);
                } 
                else if (result?.content?.[0]?.text) {
                  console.log(`\n${result.content[0].text}\n`);
                } else {
                  console.log('\nReceived response:', JSON.stringify(result, null, 2), '\n');
                }
                
                resolve(result);
              }
            }
          } catch (error) {
            console.error('[Client] Error parsing response:', error);
            // Don't reject here as we might still get a valid response
          }
        };
        
        // Set a timeout for the response
        const timeoutId = setTimeout(() => {
          this.serverProcess.stdout.off('data', onData);
          reject(new Error('Request timed out - no response from server'));
        }, 3000);
        
        // Listen for response
        this.serverProcess.stdout.on('data', onData);
        
        // Send the request
        console.error('[Client] Sending request:', requestStr.trim());
        this.serverProcess.stdin.write(requestStr);
      });
    } catch (error) {
      console.error('\nError:', error.message, '\n');
    }
  }

  async listAvailableTools() {
    try {
      if (this.client.listTools) {
        const tools = await this.client.listTools();
        console.error('[Client] Available tools:', tools);
      } else if (this.client.tools) {
        console.error('[Client] Available tools:', Object.keys(this.client.tools));
      } else {
        console.error('[Client] Could not list available tools');
      }
    } catch (error) {
      console.error('[Client] Error listing tools:', error.message);
    }
  }

  showHelp() {
    console.log('\nAvailable commands:');
    console.log('  <message>  - Echo a message');
    console.log('  help       - Show this help');
    console.log('  exit/quit  - Exit the client\n');
  }

  shutdown() {
    console.log('\nGoodbye!');
    this.cleanup();
    process.exit(0);
  }

  cleanup() {
    if (this.rl) {
      this.rl.close();
    }
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\nUncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('\nUnhandled rejection:', reason);
  process.exit(1);
});

// Start the client
const client = new EchoClient();
client.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
