import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createChatTools } from "./tool-definitions.js";
import { MCP_HTTP_OPENAPI } from "./http-schema.js";
import { createServer } from "http";
import { randomUUID } from "crypto";

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

  async startHttp({
    port = Number(process.env.MCP_HTTP_PORT) || 7000,
    host = process.env.MCP_HTTP_HOST || "0.0.0.0",
    path = "/mcp",
    enableSchema = true
  } = {}) {
    this.registerTools();
    this.httpTransports = new Map();

    const normalizePath = (value) => (value.endsWith("/") ? value.slice(0, -1) : value);
    const basePath = normalizePath(path);
    const basePathWithSlash = `${basePath}/`;
    const schemaPath = `${basePath}/schema`;
    const schemaPathWithSlash = `${schemaPath}/`;

    const server = createServer(async (req, res) => {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      if (
        enableSchema &&
        req.method === "GET" &&
        (url.pathname === schemaPath || url.pathname === schemaPathWithSlash)
      ) {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(MCP_HTTP_OPENAPI, null, 2));
        return;
      }

      if (url.pathname !== basePath && url.pathname !== basePathWithSlash) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("Not Found");
        return;
      }

      const method = req.method?.toUpperCase() || "GET";
      const sessionId = req.headers["mcp-session-id"];
      const existingTransport = sessionId ? this.httpTransports.get(sessionId) : null;

      try {
        if (method === "POST") {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBody = Buffer.concat(chunks).toString("utf8").trim();
          let parsedBody = null;
          if (rawBody) {
            try {
              parsedBody = JSON.parse(rawBody);
            } catch (error) {
              res.writeHead(400, { "content-type": "application/json" });
              res.end(JSON.stringify({
                jsonrpc: "2.0",
                error: { code: -32700, message: "Parse error: invalid JSON" },
                id: null
              }));
              return;
            }
          }

          if (existingTransport) {
            await existingTransport.handleRequest(req, res, parsedBody);
            return;
          }

          if (!sessionId && isInitializeRequest(parsedBody)) {
            const transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (newSessionId) => {
                this.httpTransports.set(newSessionId, transport);
                this.logger.info?.(`[MCP] HTTP session initialized: ${newSessionId}`);
              }
            });

            transport.onclose = () => {
              const id = transport.sessionId;
              if (id && this.httpTransports.has(id)) {
                this.httpTransports.delete(id);
                this.logger.info?.(`[MCP] HTTP session closed: ${id}`);
              }
            };

            await this.server.connect(transport);
            await transport.handleRequest(req, res, parsedBody);
            return;
          }

          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Bad Request: No valid session ID provided" },
            id: parsedBody?.id ?? null
          }));
          return;
        }

        if (method === "GET" || method === "DELETE") {
          if (!existingTransport) {
            res.writeHead(400, { "content-type": "text/plain" });
            res.end("Invalid or missing session ID");
            return;
          }
          await existingTransport.handleRequest(req, res);
          return;
        }

        res.writeHead(405, { "content-type": "text/plain" });
        res.end("Method Not Allowed");
      } catch (error) {
        this.logger.error?.("[MCP] HTTP request error:", error?.message || error);
        if (!res.headersSent) {
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null
          }));
        }
      }
    });

    await new Promise((resolve, reject) => {
      server.listen(port, host, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    this.httpServer = server;
    this.logger.info?.(`[MCP] Server started on HTTP ${host}:${port}${basePath}`);
  }
}
