import dotenv from "dotenv";
import { AgentRunner } from "../agents/core/agent-runner.js";
import { createMentionDetector } from "../agents/core/mention-detector.js";
import { defaultCommandParser } from "../agents/core/command-parser.js";
import { DemoProvider } from "../agents/providers/demo-provider.js";
import logger from "../lib/logger-lite.js";
import { loadAgentProfile } from "../agents/profile-loader.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "demo";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`Demo agent profile not found: ${profileName}.ttl`);
}

const fileConfig = profile.toConfig();
if (!fileConfig?.nickname || !fileConfig?.xmpp?.username) {
  throw new Error("Demo agent profile is missing nickname or XMPP username");
}

const DEMO_BOT_NICKNAME = fileConfig.nickname;
const DEMO_XMPP_RESOURCE = fileConfig.xmpp?.resource || DEMO_BOT_NICKNAME;

const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: DEMO_XMPP_RESOURCE,
  tls: { rejectUnauthorized: false }
};

if (!XMPP_CONFIG.service || !XMPP_CONFIG.domain || !XMPP_CONFIG.username || !XMPP_CONFIG.password) {
  throw new Error("Demo agent XMPP config incomplete; check profile file");
}

const MUC_ROOM = fileConfig.roomJid || "general@conference.tensegrity.it";

const provider = new DemoProvider({ nickname: DEMO_BOT_NICKNAME, logger });

const runner = new AgentRunner({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: DEMO_BOT_NICKNAME,
  provider,
  mentionDetector: createMentionDetector(DEMO_BOT_NICKNAME, [DEMO_BOT_NICKNAME]),
  commandParser: defaultCommandParser,
  allowSelfMessages: false,
  logger
});

async function start() {
  console.log(`Starting DemoBot "${DEMO_BOT_NICKNAME}"`);
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  await runner.start();
}

async function stop() {
  await runner.stop();
}

process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down...");
  await stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  await stop();
  process.exit(0);
});

start().catch((err) => {
  console.error("Failed to start DemoBot:", err);
  process.exit(1);
});
