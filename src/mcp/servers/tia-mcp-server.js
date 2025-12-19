import dotenv from "dotenv";
import { loadAgentProfile } from "../../agents/profile-loader.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../../lib/lingue/index.js";
import {
  HumanChatHandler,
  IBISTextHandler,
  PrologProgramHandler,
  ProfileExchangeHandler
} from "../../lib/lingue/handlers/index.js";
import { McpChatAdapter } from "../chat-adapter.js";
import { McpServerBridge } from "../server-bridge.js";

dotenv.config();

const profileName = process.env.AGENT_PROFILE || "mistral";
const profile = await loadAgentProfile(profileName);
if (!profile) {
  throw new Error(`MCP server profile not found: ${profileName}.ttl`);
}

const fileConfig = profile.toConfig();
const XMPP_CONFIG = {
  service: fileConfig.xmpp?.service,
  domain: fileConfig.xmpp?.domain,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: false }
};

const handlers = {};
if (profile.supportsLingueMode(LANGUAGE_MODES.HUMAN_CHAT)) {
  handlers[LANGUAGE_MODES.HUMAN_CHAT] = new HumanChatHandler();
}
if (profile.supportsLingueMode(LANGUAGE_MODES.IBIS_TEXT)) {
  handlers[LANGUAGE_MODES.IBIS_TEXT] = new IBISTextHandler();
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROLOG_PROGRAM)) {
  handlers[LANGUAGE_MODES.PROLOG_PROGRAM] = new PrologProgramHandler();
}
if (profile.supportsLingueMode(LANGUAGE_MODES.PROFILE_EXCHANGE)) {
  handlers[LANGUAGE_MODES.PROFILE_EXCHANGE] = new ProfileExchangeHandler();
}

const negotiator = new LingueNegotiator({ profile, handlers });
const chatAdapter = new McpChatAdapter({
  xmppConfig: XMPP_CONFIG,
  roomJid: fileConfig.roomJid,
  nickname: fileConfig.nickname,
  profile,
  negotiator
});

await chatAdapter.start();

const server = new McpServerBridge({
  serverInfo: { name: "tia-chat-mcp", version: "0.1.0" },
  chatAdapter
});

await server.startStdio();
