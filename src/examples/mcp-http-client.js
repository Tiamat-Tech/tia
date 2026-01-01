import { McpClientBridge } from "../mcp/client-bridge.js";

const serverUrl = process.env.MCP_HTTP_URL || "http://localhost:7000/mcp";
const roomJid = process.env.MUC_ROOM || "general@conference.tensegrity.it";

const bridge = new McpClientBridge({
  serverUrl,
  clientInfo: { name: "tia-mcp-http-client", version: "0.1.0" }
});

try {
  await bridge.connect();
  const tools = await bridge.listTools();
  console.log("Tools:", tools.map((tool) => tool.name));

  if (tools.find((tool) => tool.name === "getRecentMessages")) {
    const response = await bridge.callTool("getRecentMessages", {
      limit: 5,
      roomJid
    });
    console.log("Recent messages:", response?.content || response);
  } else {
    console.log("getRecentMessages tool not available on this server.");
  }
} catch (error) {
  console.error("MCP HTTP client error:", error.message);
} finally {
  await bridge.close();
}
