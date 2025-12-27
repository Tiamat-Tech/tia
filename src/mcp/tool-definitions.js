import * as z from "zod/v4";
import { detectIBISStructure, summarizeIBIS } from "../lib/ibis-detect.js";

export function createChatTools({ chatAdapter } = {}) {
  return [
    {
      name: "sendMessage",
      description: "Send a message to the MUC room or a direct JID.",
      inputSchema: {
        text: z.string().describe("Message text to send"),
        directJid: z.string().optional().describe("Optional direct JID to message"),
        roomJid: z.string().optional().describe("Optional room JID to message")
      },
      handler: async ({ text, directJid, roomJid }) => {
        const result = await chatAdapter.sendMessage({ text, directJid, roomJid });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    },
    {
      name: "offerLingueMode",
      description: "Offer a Lingue language mode to a peer.",
      inputSchema: {
        peerJid: z.string().describe("Peer JID to negotiate with"),
        modes: z.array(z.string()).describe("Lingue modes to offer")
      },
      handler: async ({ peerJid, modes }) => {
        const result = await chatAdapter.offerLingueMode({ peerJid, modes });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }
    },
    {
      name: "getProfile",
      description: "Return the agent profile as Turtle.",
      inputSchema: {},
      handler: async () => {
        const turtle = await chatAdapter.getProfileTurtle();
        return {
          content: [{ type: "text", text: turtle }]
        };
      }
    },
    {
      name: "getRecentMessages",
      description: "Return recent chat messages seen by the MCP agent.",
      inputSchema: {
        limit: z.number().int().positive().max(200).optional().describe("Max messages to return"),
        roomJid: z.string().optional().describe("Optional room JID to filter")
      },
      handler: async ({ limit, roomJid }) => {
        const messages = await chatAdapter.getRecentMessages({ limit, roomJid });
        return {
          content: [{ type: "text", text: JSON.stringify(messages, null, 2) }]
        };
      }
    },
    {
      name: "summarizeLingue",
      description: "Summarize a text into IBIS-style summary.",
      inputSchema: {
        text: z.string().describe("Text to analyze")
      },
      handler: async ({ text }) => {
        const structure = detectIBISStructure(text);
        const summary = summarizeIBIS(structure);
        return {
          content: [{ type: "text", text: summary }]
        };
      }
    }
  ];
}
