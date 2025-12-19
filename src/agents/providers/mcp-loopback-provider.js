import { McpClientBridge } from "../../mcp/client-bridge.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import * as z from "zod/v4";
import { fileURLToPath } from "url";
const LOOPBACK_SERVER_PATH = fileURLToPath(
  new URL("../../mcp/servers/loopback-echo.js", import.meta.url)
);

export class McpLoopbackProvider {
  constructor({
    profile,
    mode = "in-memory",
    serverParams = {
      command: "node",
      args: [LOOPBACK_SERVER_PATH],
      env: process.env,
      cwd: process.cwd()
    },
    logger = console
  } = {}) {
    if (!profile) {
      throw new Error("McpLoopbackProvider requires an AgentProfile");
    }
    this.profile = profile;
    this.mode = mode;
    this.logger = logger;
    this.serverParams = serverParams;
    this.bridge = null;
    this.serverReady = null;
    this.server = null;
    this.connected = false;
  }

  async ensureConnected() {
    if (this.connected) return;
    if (!this.bridge) {
      if (this.mode === "in-memory") {
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        this.server = createLoopbackServer();
        this.serverReady = this.server.connect(serverTransport);
        this.bridge = new McpClientBridge({
          profile: this.profile,
          transport: clientTransport,
          logger: this.logger
        });
      } else {
        this.bridge = new McpClientBridge({
          profile: this.profile,
          serverParams: this.serverParams,
          logger: this.logger
        });
      }
    }
    if (this.serverReady) {
      await this.serverReady;
    }
    await this.bridge.connect();
    this.connected = true;
  }

  async handle({ command, content }) {
    if (command !== "chat") {
      return "MCP loopback only supports chat.";
    }
    await this.ensureConnected();
    const result = await this.bridge.callTool("echo", { message: content });
    const text = result?.content?.find((item) => item.type === "text")?.text;
    return text || "No response from MCP loopback.";
  }

  async close() {
    if (this.bridge) {
      await this.bridge.close();
    }
    if (this.server) {
      await this.server.close();
    }
    this.connected = false;
  }
}

export default McpLoopbackProvider;

function createLoopbackServer() {
  const server = new McpServer({
    name: "tia-loopback-echo",
    version: "0.1.0"
  });

  server.registerTool("echo", {
    description: "Echo a message back to the caller.",
    inputSchema: {
      message: z.string().describe("Message to echo")
    }
  }, async ({ message }) => {
    return {
      content: [{ type: "text", text: `Echo: ${message}` }]
    };
  });

  return server;
}
