#!/usr/bin/env node
/**
 * Basic Agent Example - Config-Driven Approach
 *
 * This example shows how to create a bot using a profile file (.ttl) and a provider.
 *
 * Setup:
 * 1. Copy templates/config/agent-profile.ttl to your project's config/agents/ directory
 * 2. Copy templates/config/secrets.example.json to config/agents/secrets.json and fill in passwords
 * 3. Update the profile file with your XMPP server details
 * 4. Run this script: node basic-agent.js
 */

import { createAgent, DemoProvider } from "tia-agents";

async function main() {
  try {
    // Create agent from profile file
    // This will load config/agents/myagent.ttl by default
    const runner = await createAgent("myagent", new DemoProvider({
      nickname: "MyAgent"
    }), {
      profileDir: "./config/agents",  // Optional: defaults to ./config/agents
      logger: console
    });

    console.log("Starting agent...");
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
