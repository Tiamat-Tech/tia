import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { McpToolRegistry } from "./tool-registry.js";
import { applyMcpMetadata } from "./profile-mapper.js";

export class McpClientBridge {
  constructor({
    profile,
    clientInfo = { name: "tia-mcp-client", version: "0.1.0" },
    client = null,
    transport = null,
    serverParams = null,
    serverUrl = null,
    registry = null,
    logger = console
  } = {}) {
    this.profile = profile;
    this.client = client || new Client(clientInfo);
    this.transport = transport;
    this.serverParams = serverParams;
    this.serverUrl = serverUrl;
    this.registry = registry || new McpToolRegistry({ logger });
    this.logger = logger;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    if (!this.transport) {
      this.transport = this.createTransport();
    }
    await this.client.connect(this.transport);
    this.connected = true;
  }

  async close() {
    if (!this.connected) return;
    await this.client.close();
    this.connected = false;
  }

  async listTools() {
    await this.ensureConnected();
    const result = await this.client.listTools();
    return result.tools || [];
  }

  async listResources() {
    await this.ensureConnected();
    const result = await this.client.listResources();
    return result.resources || [];
  }

  async listPrompts() {
    await this.ensureConnected();
    const result = await this.client.listPrompts();
    return result.prompts || [];
  }

  async callTool(name, args = {}) {
    await this.ensureConnected();
    return await this.client.callTool({ name, arguments: args });
  }

  async populateProfile() {
    await this.ensureConnected();
    const tools = await this.listTools();
    const resources = await this.listResources();
    const prompts = await this.listPrompts();

    this.registry.update({
      tools,
      resources,
      prompts,
      serverInfo: this.client.serverInfo || null
    });

    return applyMcpMetadata(this.profile, this.registry);
  }

  createTransport() {
    if (this.serverParams) {
      return new StdioClientTransport(this.serverParams);
    }
    if (this.serverUrl) {
      return new StreamableHTTPClientTransport(new URL(this.serverUrl));
    }
    throw new Error("McpClientBridge requires serverParams or serverUrl");
  }

  async ensureConnected() {
    if (!this.connected) {
      await this.connect();
    }
  }
}
