// MCP-compatible server with XMPP test hooks
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { XmppRoomAgent } from '../../lib/xmpp-room-agent.js';

// Load .env from the caller's cwd (or TIA_ENV_PATH), then fallback to the package root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRootEnv = join(__dirname, '../../..', '.env'); // repo root relative to this file
const callerEnv = process.env.TIA_ENV_PATH || join(process.cwd(), '.env');
dotenv.config({ path: callerEnv });
dotenv.config({ path: projectRootEnv, override: false });

console.error('[Server] Starting MCP debug server with XMPP test hooks');

const XMPP_CONFIG = {
  service: process.env.XMPP_SERVICE || 'xmpp://localhost:5222',
  domain: process.env.XMPP_DOMAIN || 'xmpp',
  username: process.env.XMPP_USERNAME || 'dogbot',
  password: process.env.XMPP_PASSWORD || 'woofwoof',
  tls: { rejectUnauthorized: false }
};

const MUC_ROOM = process.env.MUC_ROOM || 'general@conference.xmpp';
const MCP_BOT_NICKNAME = process.env.MCP_BOT_NICKNAME || process.env.BOT_NICKNAME || 'McpDebug';

const state = {
  xmppReady: false,
  lastIncoming: null,
  xmppAgent: null  // Lazy-initialized
};

// Simple JSON-RPC 2.0 response helper
function createResponse(id, result = null, error = null) {
  return (
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      ...(result !== null && { result }),
      ...(error !== null && { error })
    }) + '\n'
  );
}

// Lazy initialization of XMPP agent
function getXmppAgent() {
  if (!state.xmppAgent) {
    state.xmppAgent = new XmppRoomAgent({
      xmppConfig: XMPP_CONFIG,
      roomJid: MUC_ROOM,
      nickname: MCP_BOT_NICKNAME,
      onMessage: async ({ body, sender, from, type }) => {
        state.lastIncoming = {
          body,
          sender,
          from,
          type,
          receivedAt: new Date().toISOString()
        };
        console.error(`[XMPP] ${type} from ${sender}: ${body}`);
      },
      logger: console
    });
  }
  return state.xmppAgent;
}

async function startXmpp() {
  try {
    const xmppAgent = getXmppAgent();
    await xmppAgent.start();
    state.xmppReady = true;
    console.error(
      `[XMPP] Connected to ${XMPP_CONFIG.service} domain=${XMPP_CONFIG.domain} room=${MUC_ROOM} nick=${MCP_BOT_NICKNAME}`
    );
  } catch (error) {
    console.error('[XMPP] Failed to start debug agent:', error.message);
  }
}

// Don't auto-connect to XMPP on startup to avoid blocking MCP initialization
// XMPP will connect on first xmppStatus or xmppSend call
// startXmpp();

// Buffer to accumulate incoming data
let buffer = '';

process.stdin.on('data', (chunk) => {
  try {
    buffer += chunk.toString();

    let boundary;
    while ((boundary = buffer.indexOf('\n')) !== -1) {
      const line = buffer.substring(0, boundary).trim();
      buffer = buffer.substring(boundary + 1);
      if (!line) continue;

      try {
        const request = JSON.parse(line);
        console.error('[Server] Received request:', JSON.stringify(request, null, 2));

        const method = request.method;
        const params = request.params || {};

        if (method === 'initialize') {
          const response = createResponse(request.id, {
            serverInfo: { name: 'tia-agents-mcp', version: '1.0.0' },
            capabilities: {
              resources: {},
              tools: {},
              prompts: {}
            }
          });
          process.stdout.write(response);
        } else if (method === 'notifications/initialized') {
          // No response needed for notifications
          console.error('[Server] Client initialized');
        } else if (method === 'tools/list') {
          const response = createResponse(request.id, {
            tools: [
              {
                name: 'echo',
                description: 'Echo back a message',
                inputSchema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', description: 'The message to echo back' }
                  },
                  required: ['message']
                }
              },
              {
                name: 'xmppStatus',
                description: 'Get XMPP connection status and last received message',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'xmppSend',
                description: 'Send a test message via XMPP',
                inputSchema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', description: 'The message to send' }
                  },
                  required: ['message']
                }
              }
            ]
          });
          process.stdout.write(response);
        } else if (method === 'tools/call') {
          const toolName = params.name;
          const args = params.arguments || {};

          if (toolName === 'echo') {
            const message = args.message || '';
            const response = createResponse(request.id, {
              content: [{ type: 'text', text: `Echo: ${message}` }]
            });
            process.stdout.write(response);
          } else if (toolName === 'xmppStatus') {
            // Lazy-start XMPP on first status check
            if (!state.xmppReady) {
              console.error('[XMPP] Starting connection on demand...');
              startXmpp().catch(err => console.error('[XMPP] Startup failed:', err));
            }

            const response = createResponse(request.id, {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  connected: state.xmppReady && state.xmppAgent?.isInRoom,
                  room: MUC_ROOM,
                  nickname: MCP_BOT_NICKNAME,
                  lastIncoming: state.lastIncoming
                }, null, 2)
              }]
            });
            process.stdout.write(response);
          } else if (toolName === 'xmppSend') {
            const message = args.message || 'XMPP test message';

            // Lazy-start XMPP on first use
            if (!state.xmppReady) {
              console.error('[XMPP] Starting connection on demand...');
              startXmpp().catch(err => console.error('[XMPP] Startup failed:', err));

              const response = createResponse(request.id, null, {
                code: -32001,
                message: 'XMPP connecting, try again shortly'
              });
              process.stdout.write(response);
            } else {
              getXmppAgent()
                .sendGroupMessage(message)
                .then(() => {
                  const response = createResponse(request.id, {
                    content: [{
                      type: 'text',
                      text: JSON.stringify({ sent: true, to: MUC_ROOM, message }, null, 2)
                    }]
                  });
                  process.stdout.write(response);
                })
                .catch((err) => {
                  const response = createResponse(request.id, null, {
                    code: -32002,
                    message: `XMPP send failed: ${err.message}`
                  });
                  process.stdout.write(response);
                });
            }
          } else {
            const response = createResponse(request.id, null, {
              code: -32601,
              message: `Unknown tool: ${toolName}`
            });
            process.stdout.write(response);
          }
        } else {
          const response = createResponse(request.id, null, {
            code: -32601,
            message: 'Method not found'
          });
          process.stdout.write(response);
        }
      } catch (error) {
        console.error('[Server] Error processing request:', error);
      }
    }
  } catch (error) {
    console.error('[Server] Fatal error in data handler:', error);
  }
});

console.error('[Server] MCP debug server is running on stdio');

process.on('SIGINT', () => {
  console.error('\n[Server] Shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n[Server] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n[Server] Unhandled rejection:', reason);
});

console.error('[Server] Ready to accept connections');
