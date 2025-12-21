#!/usr/bin/env node
/**
 * Programmatic Agent Example - No Config Files Needed
 *
 * This example shows how to create a bot programmatically without profile files.
 * All configuration is provided directly in code.
 *
 * Setup:
 * 1. Update the configuration below with your XMPP server details
 * 2. Run this script: node programmatic-agent.js
 */

import { createSimpleAgent, DemoProvider } from "tia-agents";

async function main() {
  try {
    // Create agent with direct configuration (no profile file needed)
    const runner = createSimpleAgent({
      xmppConfig: {
        service: "xmpp://localhost:5222",
        domain: "xmpp",
        username: "mybot",
        password: "your-password-here",  // Or use process.env.BOT_PASSWORD
        resource: "MyBot"  // Optional
      },
      roomJid: "general@conference.xmpp",
      nickname: "MyBot",
      provider: new DemoProvider({
        nickname: "MyBot"
      }),
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
