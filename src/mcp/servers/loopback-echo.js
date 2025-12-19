import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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

async function main() {
  process.stdin.resume();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  server.server.onerror = (error) => {
    console.error("[MCP] Loopback server error:", error);
  };
  server.server.onclose = () => {
    console.error("[MCP] Loopback server closed");
  };
  console.error("[MCP] Loopback echo server running on stdio");
  setInterval(() => {}, 1000);
}

main().catch((error) => {
  console.error("[MCP] Loopback echo server error:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("[MCP] Loopback uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[MCP] Loopback unhandled rejection:", reason);
});
