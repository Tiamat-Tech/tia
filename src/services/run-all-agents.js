import dotenv from "dotenv";
import { spawn } from "child_process";

dotenv.config();

const AGENT_DEFINITIONS = {
  semem: {
    command: "node src/services/semem-agent.js",
    description: "Semem MCP-backed agent"
  },
  mistral: {
    command: "node src/services/mistral-bot.js",
    description: "Mistral API-backed bot",
    requiredEnv: ["MISTRAL_API_KEY"]
  },
  demo: {
    command: "node src/services/demo-bot.js",
    description: "Demo bot (no API key needed)"
  }
};

const requestedAgents =
  (process.env.AGENTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) || [];

const agentNames =
  requestedAgents.length > 0 ? requestedAgents : Object.keys(AGENT_DEFINITIONS);

const processes = new Map();
let shuttingDown = false;

function hasRequiredEnv(agentName, requiredEnv = []) {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    console.warn(
      `Skipping agent "${agentName}" - missing required env vars: ${missing.join(", ")}`
    );
    return false;
  }
  return true;
}

function startAgent(agentName, { command, requiredEnv = [], description }) {
  if (!hasRequiredEnv(agentName, requiredEnv)) {
    return;
  }

  console.log(`Starting agent "${agentName}" (${description || "agent"}): ${command}`);
  const child = spawn(command, {
    shell: true,
    stdio: "inherit",
    env: process.env
  });

  processes.set(agentName, child);

  child.on("exit", (code, signal) => {
    processes.delete(agentName);
    if (shuttingDown) return;

    if (code === 0) {
      console.log(`Agent "${agentName}" exited cleanly.`);
    } else {
      console.error(
        `Agent "${agentName}" exited with code ${code ?? "null"} signal ${signal ?? "null"}`
      );
      shutdownAll(1);
    }
  });

  child.on("error", (err) => {
    console.error(`Failed to start agent "${agentName}": ${err.message}`);
    processes.delete(agentName);
    if (!shuttingDown) {
      shutdownAll(1);
    }
  });
}

function shutdownAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Shutting down all agents...");

  for (const [name, child] of processes.entries()) {
    if (child.exitCode === null) {
      console.log(`Stopping agent "${name}" (pid ${child.pid})`);
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 3000).unref();
}

process.on("SIGINT", () => shutdownAll(0));
process.on("SIGTERM", () => shutdownAll(0));

if (agentNames.length === 0) {
  console.log("No agents requested; exiting.");
  process.exit(0);
}

for (const name of agentNames) {
  const definition = AGENT_DEFINITIONS[name];
  if (!definition) {
    console.warn(`Unknown agent "${name}", skipping.`);
    continue;
  }
  startAgent(name, definition);
}

if (processes.size === 0) {
  console.log("No agents started; exiting.");
  process.exit(1);
}
