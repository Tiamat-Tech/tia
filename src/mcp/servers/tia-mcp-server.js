import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { loadAgentProfile, profileToTurtle } from "../../agents/profile-loader.js";
import { createProfileBuilder } from "../../agents/profile/profile-builder.js";
import { LingueNegotiator, LANGUAGE_MODES } from "../../lib/lingue/index.js";
import {
  HumanChatHandler,
  IBISTextHandler,
  PrologProgramHandler,
  ProfileExchangeHandler
} from "../../lib/lingue/handlers/index.js";
import { McpChatAdapter } from "../chat-adapter.js";
import { McpServerBridge } from "../server-bridge.js";
import { autoConnectXmpp } from "../../lib/xmpp-auto-connect.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const defaultAgentDir = path.join(repoRoot, "config", "agents");

process.env.AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR || defaultAgentDir;
process.env.AGENT_SECRETS_PATH = process.env.AGENT_SECRETS_PATH || path.join(defaultAgentDir, "secrets.json");

process.env.DOTENV_CONFIG_QUIET = process.env.DOTENV_CONFIG_QUIET || "true";
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

const stderrLogger = {
  debug: (...args) => console.error(...args),
  info: (...args) => console.error(...args),
  warn: (...args) => console.error(...args),
  error: (...args) => console.error(...args)
};

const profileName = process.env.AGENT_PROFILE || null;
const defaultRoomJid = process.env.MUC_ROOM || "general@conference.tensegrity.it";
const defaultLogRoomJid = process.env.LOG_ROOM_JID || "log@conference.tensegrity.it";

const buildRandomProfile = () => {
  const suffix = Math.floor(100 + Math.random() * 900);
  const nickname = `mcp-${suffix}`;
  return createProfileBuilder()
    .identifier(nickname)
    .nickname(nickname)
    .room(defaultRoomJid)
    .xmpp({
      service: process.env.XMPP_SERVICE,
      domain: process.env.XMPP_DOMAIN,
      username: nickname,
      resource: nickname,
      tlsRejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1"
    })
    .lingue({ supports: [LANGUAGE_MODES.HUMAN_CHAT] })
    .build();
};

const profile = profileName
  ? await loadAgentProfile(profileName, { allowMissingPasswordKey: true })
  : buildRandomProfile();

if (!profile) {
  throw new Error(`MCP server profile not found: ${profileName}.ttl`);
}

const fileConfig = profile.toConfig();

const baseXmppConfig = {
  service: fileConfig.xmpp?.service || process.env.XMPP_SERVICE,
  domain: fileConfig.xmpp?.domain || process.env.XMPP_DOMAIN,
  username: fileConfig.xmpp?.username,
  password: fileConfig.xmpp?.password,
  resource: fileConfig.xmpp?.resource || fileConfig.nickname,
  tls: { rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1" }
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

let chatAdapterPromise = null;
const getChatAdapter = async () => {
  if (!chatAdapterPromise) {
    chatAdapterPromise = (async () => {
      if (!baseXmppConfig.service || !baseXmppConfig.domain || !baseXmppConfig.username) {
        throw new Error("MCP server XMPP config incomplete; check profile file and environment");
      }
      console.error(`[MCP Server] Connecting as ${baseXmppConfig.username}@${baseXmppConfig.domain}`);
      const { xmpp, credentials } = await autoConnectXmpp({
        ...baseXmppConfig,
        secretsPath: process.env.AGENT_SECRETS_PATH,
        autoRegister: true,
        logger: stderrLogger
      });
      await xmpp.stop();

      if (credentials.registered) {
        console.error(`[MCP Server] ✅ New account registered: ${credentials.username}`);
        console.error(`[MCP Server] Password saved to ${process.env.AGENT_SECRETS_PATH}`);
      }

      const xmppConfig = {
        ...baseXmppConfig,
        username: credentials.username,
        password: credentials.password
      };

      const adapter = new McpChatAdapter({
        xmppConfig,
        roomJid: fileConfig.roomJid,
        nickname: fileConfig.nickname,
        profile,
        negotiator,
        logger: stderrLogger,
        extraRooms: [defaultLogRoomJid]
      });

      await adapter.start();
      return adapter;
    })();
  }
  return chatAdapterPromise;
};

const chatAdapter = {
  sendMessage: async ({ text, directJid, roomJid }) => {
    const adapter = await getChatAdapter();
    return adapter.sendMessage({ text, directJid, roomJid });
  },
  offerLingueMode: async ({ peerJid, modes }) => {
    const adapter = await getChatAdapter();
    return adapter.offerLingueMode({ peerJid, modes });
  },
  getRecentMessages: async ({ limit, roomJid }) => {
    const adapter = await getChatAdapter();
    return adapter.getRecentMessages({ limit, roomJid });
  },
  getProfileTurtle: async () => {
    if (!profile) return "";
    return await profileToTurtle(profile);
  }
};

const server = new McpServerBridge({
  serverInfo: { name: "tia-chat-mcp", version: "0.1.0" },
  chatAdapter,
  logger: stderrLogger
});

await server.startStdio();
const httpEnabled = ["1", "true", "yes"].includes(String(process.env.MCP_HTTP_ENABLED || "").toLowerCase());
const httpPort = process.env.MCP_HTTP_PORT ? Number(process.env.MCP_HTTP_PORT) : null;
if (httpEnabled || httpPort) {
  await server.startHttp({
    port: httpPort || 7000,
    host: process.env.MCP_HTTP_HOST || "0.0.0.0",
    path: process.env.MCP_HTTP_PATH || "/mcp"
  });
}
