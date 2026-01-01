export const MCP_HTTP_OPENAPI = {
  openapi: "3.0.3",
  info: {
    title: "TIA MCP HTTP",
    version: "0.1.0",
    description: "Streamable HTTP endpoint for MCP JSON-RPC requests."
  },
  paths: {
    "/mcp": {
      post: {
        summary: "Send MCP JSON-RPC request",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/McpRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "MCP JSON-RPC response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/McpResponse" }
              }
            }
          }
        }
      },
      get: {
        summary: "Open MCP SSE stream",
        parameters: [
          {
            name: "Mcp-Session-Id",
            in: "header",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "Last-Event-Id",
            in: "header",
            required: false,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Server-sent event stream",
            content: {
              "text/event-stream": {
                schema: { type: "string" }
              }
            }
          }
        }
      },
      delete: {
        summary: "Terminate MCP session",
        parameters: [
          {
            name: "Mcp-Session-Id",
            in: "header",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Session terminated"
          }
        }
      }
    },
    "/mcp/schema": {
      get: {
        summary: "Fetch OpenAPI schema",
        responses: {
          "200": {
            description: "OpenAPI schema",
            content: {
              "application/json": {
                schema: { type: "object" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      McpRequest: {
        type: "object",
        properties: {
          jsonrpc: { type: "string", example: "2.0" },
          id: {
            oneOf: [{ type: "string" }, { type: "number" }, { type: "null" }]
          },
          method: { type: "string" },
          params: { type: "object", additionalProperties: true }
        },
        required: ["jsonrpc", "method"]
      },
      McpResponse: {
        type: "object",
        properties: {
          jsonrpc: { type: "string", example: "2.0" },
          id: {
            oneOf: [{ type: "string" }, { type: "number" }, { type: "null" }]
          },
          result: { type: "object", additionalProperties: true },
          error: {
            type: "object",
            properties: {
              code: { type: "integer" },
              message: { type: "string" },
              data: { type: "object", additionalProperties: true }
            }
          }
        },
        required: ["jsonrpc"]
      }
    }
  }
};
