/**
 * XMPP account configuration
 */
export class XmppConfig {
  constructor({
    service,
    domain,
    username,
    password,
    passwordKey,
    resource,
    tlsRejectUnauthorized = false
  }) {
    this.service = service;
    this.domain = domain;
    this.username = username;
    this.password = password;
    this.passwordKey = passwordKey;
    this.resource = resource;
    this.tls = { rejectUnauthorized: tlsRejectUnauthorized };
  }

  /**
   * Convert to plain config object (backward compatibility)
   */
  toConfig() {
    return {
      service: this.service,
      domain: this.domain,
      username: this.username,
      password: this.password,
      resource: this.resource
    };
  }
}
