import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createChatTools } from "./tool-definitions.js";

export class McpServerBridge {
  constructor({
    serverInfo = { name: "tia-mcp-server", version: "0.1.0" },
    chatAdapter = null,
    tools = null,
    logger = console
  } = {}) {
    this.server = new McpServer(serverInfo);
    this.chatAdapter = chatAdapter;
    this.logger = logger;
    this.tools = tools;
  }

  registerTools() {
    const tools = this.tools || createChatTools({ chatAdapter: this.chatAdapter });
    tools.forEach((tool) => {
      this.server.registerTool(tool.name, {
        description: tool.description,
        inputSchema: tool.inputSchema
      }, tool.handler);
    });
  }

  async startStdio() {
    this.registerTools();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info?.("[MCP] Server started on stdio");
  }
}
