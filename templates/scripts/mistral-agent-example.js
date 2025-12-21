#!/usr/bin/env node
/**
 * Mistral AI Agent Example
 *
 * This example shows how to create an AI-powered bot using the Mistral API.
 *
 * Prerequisites:
 * 1. Install peer dependency: npm install @mistralai/mistralai
 * 2. Set MISTRAL_API_KEY environment variable or add to .env file
 * 3. Copy templates/config/mistral-agent.ttl to config/agents/
 * 4. Copy templates/config/secrets.example.json to config/agents/secrets.json
 * 5. Update the files with your configuration
 *
 * Run: MISTRAL_API_KEY=your-key node mistral-agent-example.js
 */

import { createAgent, InMemoryHistoryStore } from "tia-agents";
// Import MistralProvider from the package's provider subpath
import { MistralProvider } from "tia-agents/providers/mistral";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  if (!process.env.MISTRAL_API_KEY) {
    console.error("Error: MISTRAL_API_KEY environment variable is required");
    console.error("Set it with: export MISTRAL_API_KEY=your-api-key");
    process.exit(1);
  }

  try {
    // Create MistralProvider with history tracking
    const provider = new MistralProvider({
      apiKey: process.env.MISTRAL_API_KEY,
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      nickname: "MistralAgent",
      historyStore: new InMemoryHistoryStore({ maxEntries: 40 }),
      logger: console
    });

    // Create agent from profile file
    const runner = await createAgent("mistral-agent", provider, {
      profileDir: "./config/agents",
      logger: console
    });

    console.log("Starting Mistral AI agent...");
    console.log(`Model: ${process.env.MISTRAL_MODEL || "mistral-small-latest"}`);
    await runner.start();
    console.log("Agent started! Press Ctrl+C to stop.");

  } catch (error) {
    console.error("Failed to start agent:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down...");
  process.exit(0);
});

main();
