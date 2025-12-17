import dotenv from "dotenv";
import { SememClient } from "../lib/semem-client.js";
import { XmppRoomAgent } from "../lib/xmpp-room-agent.js";
import { loadAgentProfile } from "./agent-registry.js";

dotenv.config();

const requestedProfile = process.env.AGENT_PROFILE || "default";
const profile = loadAgentProfile(requestedProfile);

const XMPP_CONFIG = profile.xmppConfig;
const MUC_ROOM = profile.roomJid;
const BOT_NICKNAME = profile.nickname;
const CHAT_FEATURES = profile.features || {};
const ACTIVE_PROFILE = profile.profileName;
XMPP_CONFIG.resource = process.env.AGENT_RESOURCE || XMPP_CONFIG.resource || BOT_NICKNAME;

const sememClient = new SememClient({
  baseUrl: profile.sememConfig.baseUrl,
  authToken: profile.sememConfig.authToken
});

const agent = new XmppRoomAgent({
  xmppConfig: XMPP_CONFIG,
  roomJid: MUC_ROOM,
  nickname: BOT_NICKNAME,
  onMessage: handleIncomingMessage,
  logger: console
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isMentioned(body) {
  const normalized = body.toLowerCase();
  return (
    normalized.includes(BOT_NICKNAME.toLowerCase()) ||
    normalized.startsWith("bot:") ||
    normalized.startsWith("semem:")
  );
}

function stripPrefix(text) {
  const nicknamePattern = new RegExp(`^${escapeRegex(BOT_NICKNAME)}\\s*[:,-]\\s*`, "i");
  return text
    .replace(nicknamePattern, "")
    .replace(/^bot:\s*/i, "")
    .replace(/^semem:\s*/i, "")
    .trim();
}

function parseCommand(query) {
  const lowered = query.toLowerCase();
  if (lowered.startsWith("tell ")) return { command: "tell", content: query.slice(5).trim() };
  if (lowered.startsWith("ask ")) return { command: "ask", content: query.slice(4).trim() };
  if (lowered.startsWith("augment ")) return { command: "augment", content: query.slice(8).trim() };
  return { command: "chat", content: query };
}

async function handleIncomingMessage({ body, sender, type, reply }) {
  const trimmed = body.trim();
  const addressed = type === "chat" || isMentioned(trimmed);
  if (!addressed) {
    console.log(`[SememAgent] Ignoring message (not addressed): ${body}`);
    return;
  }

  const query = stripPrefix(trimmed) || trimmed;
  const { command, content } = parseCommand(query);

  try {
    if (command === "tell") {
      if (!content) {
        await reply("Nothing to store. Usage: Semem tell <text>");
        return;
      }
      await sememClient.tell(content, {
        metadata: {
          sender,
          channel: type,
          room: type === "groupchat" ? MUC_ROOM : sender,
          agent: BOT_NICKNAME
        }
      });
      await reply("Stored in Semem via /tell.");
      return;
    }

    if (command === "ask") {
      if (!content) {
        await reply("Nothing to ask. Usage: Semem ask <question>");
        return;
      }
      const result = await sememClient.ask(content, { useContext: true });
      const answer = result?.content || result?.answer || "No answer returned.";
      await reply(answer);
      return;
    }

    if (command === "augment") {
      if (!content) {
        await reply("Nothing to augment. Usage: Semem augment <text>");
        return;
      }
      const result = await sememClient.augment(content);
      await reply(
        result?.success
          ? "Augment completed and stored."
          : "Augment did not report success."
      );
      return;
    }

    // Default: chat
    const response = await sememClient.chatEnhanced(content, CHAT_FEATURES);

    const replyText =
      response?.content ||
      response?.answer ||
      "I could not get a response from Semem just now.";

    await reply(replyText);

    await sememClient
      .tell(`Query: ${content}\nAnswer: ${replyText}`, {
        metadata: {
          sender,
          channel: type,
          room: type === "groupchat" ? MUC_ROOM : sender,
          agent: BOT_NICKNAME
        }
      })
      .catch((err) => console.error("Semem /tell failed:", err.message));
  } catch (error) {
    console.error("Semem chat failed:", error.message);
    await reply("Semem is unavailable right now. Please try again shortly.");
  }
}

async function start() {
  console.log(`Starting Semem agent "${BOT_NICKNAME}"`);
  if (requestedProfile !== ACTIVE_PROFILE) {
    console.log(`Requested profile "${requestedProfile}" not found. Using "${ACTIVE_PROFILE}"`);
  } else {
    console.log(`Profile: ${ACTIVE_PROFILE}`);
  }
  console.log(`XMPP: ${XMPP_CONFIG.service} (domain ${XMPP_CONFIG.domain})`);
  console.log(`Resource: ${XMPP_CONFIG.resource}`);
  console.log(`Room: ${MUC_ROOM}`);
  console.log(`Semem API: ${profile.sememConfig.baseUrl}`);
  console.log(
    `Features: Wikipedia=${!!CHAT_FEATURES.useWikipedia}, Wikidata=${!!CHAT_FEATURES.useWikidata}, WebSearch=${!!CHAT_FEATURES.useWebSearch}`
  );
  await agent.start();
}

async function stop() {
  await agent.stop();
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
  console.error("Failed to start Semem agent:", err);
  process.exit(1);
});
