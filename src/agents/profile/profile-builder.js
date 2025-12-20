import { AgentProfile } from "./agent-profile.js";
import { XmppConfig } from "./xmpp-config.js";
import { MistralProviderConfig, SememProviderConfig } from "./provider-config.js";
import { Capability } from "./capability.js";

/**
 * Fluent builder for creating AgentProfile instances
 * Useful for testing and dynamic profile creation
 */
export class ProfileBuilder {
  constructor() {
    this.data = {
      identifier: null,
      nickname: null,
      type: [],
      xmppAccount: null,
      roomJid: null,
      provider: null,
      capabilities: [],
      lingue: {},
      mcp: {},
      metadata: {},
      customProperties: {}
    };
  }

  identifier(id) {
    this.data.identifier = id;
    return this;
  }

  nickname(nick) {
    this.data.nickname = nick;
    return this;
  }

  type(...types) {
    this.data.type = types;
    return this;
  }

  xmpp({ service, domain, username, password, passwordKey, resource, tlsRejectUnauthorized }) {
    this.data.xmppAccount = new XmppConfig({
      service,
      domain,
      username,
      password,
      passwordKey,
      resource,
      tlsRejectUnauthorized
    });
    return this;
  }

  room(roomJid) {
    this.data.roomJid = roomJid;
    return this;
  }

  mistralProvider({ model, apiKeyEnv, maxTokens, temperature, lingueEnabled, lingueConfidenceMin }) {
    this.data.provider = new MistralProviderConfig({
      model,
      apiKeyEnv,
      maxTokens,
      temperature,
      lingueEnabled,
      lingueConfidenceMin
    });
    return this;
  }

  sememProvider({ baseUrl, authTokenEnv, timeoutMs, features }) {
    this.data.provider = new SememProviderConfig({
      baseUrl,
      authTokenEnv,
      timeoutMs,
      features
    });
    return this;
  }

  capability({ name, label, description, command, handler, metadata }) {
    this.data.capabilities.push(new Capability({
      name,
      label,
      description,
      command,
      handler,
      metadata
    }));
    return this;
  }

  lingue({ supports, prefers, understands, profile }) {
    this.data.lingue = {
      supports: supports || [],
      prefers: prefers || null,
      understands: understands || [],
      profile: profile || null
    };
    return this;
  }

  mcp({ role, servers, tools, resources, prompts, endpoints }) {
    this.data.mcp = {
      role: role || null,
      servers: servers || [],
      tools: tools || [],
      resources: resources || [],
      prompts: prompts || [],
      endpoints: endpoints || []
    };
    return this;
  }

  metadata({ created, modified, description }) {
    this.data.metadata = { created, modified, description };
    return this;
  }

  custom(key, value) {
    this.data.customProperties[key] = value;
    return this;
  }

  build() {
    return new AgentProfile(this.data);
  }
}

/**
 * Factory function for creating a new builder
 */
export function createProfileBuilder() {
  return new ProfileBuilder();
}
