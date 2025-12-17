// MCP-compatible server with XMPP test hooks
import dotenv from 'dotenv';
import { XmppRoomAgent } from '../../lib/xmpp-room-agent.js';

dotenv.config();

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
  lastIncoming: null
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

// Initialize XMPP agent for debug traffic
const xmppAgent = new XmppRoomAgent({
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

async function startXmpp() {
  try {
    await xmppAgent.start();
    state.xmppReady = true;
    console.error(
      `[XMPP] Connected to ${XMPP_CONFIG.service} domain=${XMPP_CONFIG.domain} room=${MUC_ROOM} nick=${MCP_BOT_NICKNAME}`
    );
  } catch (error) {
    console.error('[XMPP] Failed to start debug agent:', error.message);
  }
}

startXmpp();

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
        const params = request.params || request.arguments || {};

        if (method === 'echo' || method === 'callTool') {
          const message = params.message || '';
          const response = createResponse(request.id, {
            content: [{ type: 'text', text: `Echo: ${message}` }]
          });
          process.stdout.write(response);
          process.stdout.emit('drain');
        } else if (method === 'xmppSend') {
          const message = params.message || 'XMPP test message';
          const target = params.to || MUC_ROOM;

          if (!state.xmppReady) {
            const response = createResponse(request.id, null, {
              code: -32001,
              message: 'XMPP not connected'
            });
            process.stdout.write(response);
            process.stdout.emit('drain');
            continue;
          }

          xmppAgent
            .sendGroupMessage(message)
            .then(() => {
              const response = createResponse(request.id, {
                sent: true,
                to: target,
                message
              });
              process.stdout.write(response);
              process.stdout.emit('drain');
            })
            .catch((err) => {
              const response = createResponse(request.id, null, {
                code: -32002,
                message: `XMPP send failed: ${err.message}`
              });
              process.stdout.write(response);
              process.stdout.emit('drain');
            });
        } else if (method === 'xmppStatus') {
          const response = createResponse(request.id, {
            connected: state.xmppReady && xmppAgent.isInRoom,
            room: MUC_ROOM,
            nickname: MCP_BOT_NICKNAME,
            lastIncoming: state.lastIncoming
          });
          process.stdout.write(response);
          process.stdout.emit('drain');
        } else {
          const response = createResponse(request.id, null, {
            code: -32601,
            message: 'Method not found'
          });
          process.stdout.write(response);
          process.stdout.emit('drain');
        }
      } catch (error) {
        console.error('[Server] Error processing request:', error);
        console.error('[Server] Could not send error response - no request ID available');
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
