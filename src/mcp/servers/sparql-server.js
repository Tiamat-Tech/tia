import dotenv from "dotenv";
import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

dotenv.config();

const QUERY_ENDPOINT = process.env.SPARQL_QUERY_ENDPOINT || "https://dbpedia.org/sparql";
const UPDATE_ENDPOINT = process.env.SPARQL_UPDATE_ENDPOINT || QUERY_ENDPOINT;

const server = new McpServer({
  name: "tia-sparql-mcp",
  version: "0.1.0"
});

server.registerTool("sparqlQuery", {
  description: "Run a SPARQL query against a remote endpoint.",
  inputSchema: {
    query: z.string().describe("SPARQL SELECT/ASK/CONSTRUCT query"),
    endpoint: z.string().optional().describe("Override query endpoint URL")
  },
  _meta: {
    tia: {
      endpoints: {
        query: QUERY_ENDPOINT,
        update: UPDATE_ENDPOINT
      }
    }
  }
}, async ({ query, endpoint }) => {
  const url = endpoint || QUERY_ENDPOINT;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/sparql-query",
      "accept": "application/sparql-results+json",
      "user-agent": "TIA-DataAgent/0.3.0 (https://github.com/danja/tia)"
    },
    body: query
  });
  const text = await response.text();
  return { content: [{ type: "text", text }] };
});

server.registerTool("sparqlUpdate", {
  description: "Run a SPARQL update against a remote endpoint.",
  inputSchema: {
    update: z.string().describe("SPARQL UPDATE statement"),
    endpoint: z.string().optional().describe("Override update endpoint URL")
  },
  _meta: {
    tia: {
      endpoints: {
        query: QUERY_ENDPOINT,
        update: UPDATE_ENDPOINT
      }
    }
  }
}, async ({ update, endpoint }) => {
  const url = endpoint || UPDATE_ENDPOINT;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/sparql-update",
      "accept": "text/plain"
    },
    body: update
  });
  const text = await response.text();
  return { content: [{ type: "text", text }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP] SPARQL server running on stdio");
}

main().catch((error) => {
  console.error("[MCP] SPARQL server error:", error);
  process.exit(1);
});
