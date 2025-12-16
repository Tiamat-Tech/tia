import dotenv from "dotenv";

dotenv.config();

const baseXmppConfig = {
  service: process.env.XMPP_SERVICE || "xmpp://localhost:5222",
  domain: process.env.XMPP_DOMAIN || "xmpp",
  username: process.env.XMPP_USERNAME || "dogbot",
  password: process.env.XMPP_PASSWORD || "woofwoof",
  tls: { rejectUnauthorized: false }
};

const baseSememConfig = {
  baseUrl: process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it",
  authToken: process.env.SEMEM_AUTH_TOKEN
};

const profiles = {
  default: {
    nickname: process.env.BOT_NICKNAME || "Semem",
    roomJid: process.env.MUC_ROOM || "general@conference.xmpp",
    features: {
      useWikipedia: true,
      useWikidata: true,
      useWebSearch: false
    },
    sememOverrides: {},
    xmppOverrides: {}
  },
  lite: {
    nickname: process.env.BOT_NICKNAME || "SememLite",
    roomJid: process.env.MUC_ROOM || "general@conference.xmpp",
    features: {
      useWikipedia: false,
      useWikidata: false,
      useWebSearch: false
    },
    sememOverrides: {},
    xmppOverrides: {}
  }
};

export function listProfiles() {
  return Object.keys(profiles);
}

export function loadAgentProfile(name = "default") {
  const profile = profiles[name] || profiles.default;
  const resolvedName = profiles[name] ? name : "default";

  return {
    profileName: resolvedName,
    nickname: profile.nickname,
    roomJid: profile.roomJid,
    features: profile.features,
    sememConfig: { ...baseSememConfig, ...profile.sememOverrides },
    xmppConfig: { ...baseXmppConfig, ...profile.xmppOverrides }
  };
}

export default { loadAgentProfile, listProfiles };
