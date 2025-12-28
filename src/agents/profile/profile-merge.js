import { AgentProfile } from "./agent-profile.js";
import { XmppConfig } from "./xmpp-config.js";
import { MistralProviderConfig, GroqProviderConfig, SememProviderConfig, DataProviderConfig } from "./provider-config.js";

export function mergeAgentProfiles(baseProfile, derivedProfile) {
  if (!baseProfile) return derivedProfile;
  if (!derivedProfile) return baseProfile;

  const mergedXmpp = mergeXmppAccounts(baseProfile.xmppAccount, derivedProfile.xmppAccount);
  const mergedProvider = mergeProviderConfigs(baseProfile.provider, derivedProfile.provider);
  const mergedCapabilities = mergeCapabilities(baseProfile, derivedProfile);
  const mergedLingue = mergeLingue(baseProfile, derivedProfile);
  const mergedMcp = mergeMcp(baseProfile, derivedProfile);
  const mergedMetadata = mergeMetadata(baseProfile, derivedProfile);
  const mergedTypes = dedupeArray([...(baseProfile.type || []), ...(derivedProfile.type || [])]);

  return new AgentProfile({
    identifier: derivedProfile.identifier || baseProfile.identifier,
    nickname: derivedProfile.nickname || baseProfile.nickname,
    type: mergedTypes,
    xmppAccount: mergedXmpp,
    roomJid: derivedProfile.roomJid || baseProfile.roomJid,
    provider: mergedProvider,
    capabilities: mergedCapabilities,
    lingue: mergedLingue,
    mcp: mergedMcp,
    metadata: mergedMetadata,
    customProperties: {
      ...(baseProfile.custom || {}),
      ...(derivedProfile.custom || {})
    }
  });
}

function mergeXmppAccounts(baseXmpp, derivedXmpp) {
  if (!baseXmpp && !derivedXmpp) return null;
  if (!baseXmpp) return derivedXmpp;
  if (!derivedXmpp) return baseXmpp;

  return new XmppConfig({
    service: derivedXmpp.service || baseXmpp.service,
    domain: derivedXmpp.domain || baseXmpp.domain,
    username: derivedXmpp.username || baseXmpp.username,
    password: derivedXmpp.password || baseXmpp.password,
    passwordKey: derivedXmpp.passwordKey || baseXmpp.passwordKey,
    resource: derivedXmpp.resource || baseXmpp.resource,
    tlsRejectUnauthorized: derivedXmpp.tls?.rejectUnauthorized ?? baseXmpp.tls?.rejectUnauthorized ?? false
  });
}

function mergeProviderConfigs(baseProvider, derivedProvider) {
  if (!baseProvider) return derivedProvider;
  if (!derivedProvider) return baseProvider;
  if (baseProvider.type !== derivedProvider.type) return derivedProvider;

  const mergedConfig = { ...baseProvider.config, ...derivedProvider.config };
  if (baseProvider.type === "mistral") {
    return new MistralProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "groq") {
    return new GroqProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "semem") {
    return new SememProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "data") {
    return new DataProviderConfig(mergedConfig);
  }
  return derivedProvider;
}

function mergeCapabilities(baseProfile, derivedProfile) {
  const merged = new Map();
  baseProfile?.capabilities?.forEach((cap, key) => merged.set(key, cap));
  derivedProfile?.capabilities?.forEach((cap, key) => merged.set(key, cap));
  return Array.from(merged.values());
}

function mergeLingue(baseProfile, derivedProfile) {
  const baseLingue = baseProfile?.lingue || {};
  const derivedLingue = derivedProfile?.lingue || {};
  const supports = new Set([...(baseLingue.supports || []), ...(derivedLingue.supports || [])]);
  const understands = new Set([...(baseLingue.understands || []), ...(derivedLingue.understands || [])]);
  return {
    supports,
    prefers: derivedLingue.prefers || baseLingue.prefers || null,
    understands,
    profile: derivedLingue.profile || baseLingue.profile || null
  };
}

function mergeMcp(baseProfile, derivedProfile) {
  const baseMcp = baseProfile?.mcp || {};
  const derivedMcp = derivedProfile?.mcp || {};
  return {
    role: derivedMcp.role || baseMcp.role || null,
    servers: mergeMcpList(baseMcp.servers, derivedMcp.servers, (item) => item?.uri || item?.name),
    tools: mergeMcpList(baseMcp.tools, derivedMcp.tools, (item) => item?.name),
    resources: mergeMcpList(baseMcp.resources, derivedMcp.resources, (item) => item?.uri || item?.name),
    prompts: mergeMcpList(baseMcp.prompts, derivedMcp.prompts, (item) => item?.name),
    endpoints: mergeMcpList(baseMcp.endpoints, derivedMcp.endpoints, (item) => item?.uri || item?.name)
  };
}

function mergeMcpList(baseList = [], derivedList = [], keyFn) {
  const merged = new Map();
  [...baseList, ...derivedList].forEach((item) => {
    if (!item) return;
    const key = keyFn?.(item) || JSON.stringify(item);
    merged.set(key, item);
  });
  return Array.from(merged.values());
}

function mergeMetadata(baseProfile, derivedProfile) {
  const baseMeta = baseProfile?.metadata || {};
  const derivedMeta = derivedProfile?.metadata || {};
  return {
    created: derivedMeta.created || baseMeta.created,
    modified: derivedMeta.modified || baseMeta.modified,
    description: derivedMeta.description || baseMeta.description
  };
}

function dedupeArray(values) {
  return Array.from(new Set(values.filter(Boolean)));
}
