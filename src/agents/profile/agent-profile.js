/**
 * Represents an agent profile loaded from RDF Turtle.
 * Designed for runtime extensibility via dependency injection.
 */
export class AgentProfile {
  constructor({
    identifier,
    nickname,
    type = [],
    xmppAccount,
    roomJid,
    provider,
    capabilities = [],
    metadata = {},
    customProperties = {}
  }) {
    this.identifier = identifier;
    this.nickname = nickname;
    this.type = Array.isArray(type) ? type : [type];
    this.xmppAccount = xmppAccount;
    this.roomJid = roomJid;
    this.provider = provider;
    this.capabilities = new Map();

    capabilities.forEach(cap => this.addCapability(cap));

    this.metadata = {
      created: metadata.created,
      modified: metadata.modified,
      description: metadata.description
    };

    this.custom = customProperties;
  }

  /**
   * Add a capability at runtime (DI extension point)
   */
  addCapability(capability) {
    if (typeof capability === 'string') {
      this.capabilities.set(capability, { name: capability });
    } else {
      this.capabilities.set(capability.name, capability);
    }
    return this;
  }

  /**
   * Check if profile has a capability
   */
  hasCapability(capabilityName) {
    return this.capabilities.has(capabilityName);
  }

  /**
   * Get capability details
   */
  getCapability(capabilityName) {
    return this.capabilities.get(capabilityName);
  }

  /**
   * Convert to plain config object (backward compatibility)
   * Must match exact structure expected by existing service files
   */
  toConfig() {
    const config = {
      nickname: this.nickname,
      roomJid: this.roomJid,
      xmpp: this.xmppAccount?.toConfig()
    };

    if (this.provider) {
      const providerType = this.provider.type;
      config[providerType] = this.provider.toConfig();
    }

    return config;
  }
}
