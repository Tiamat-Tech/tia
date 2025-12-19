/**
 * Global registry for runtime capability extension
 */
export class CapabilityRegistry {
  constructor() {
    this.capabilities = new Map();
    this.handlers = new Map();
  }

  /**
   * Register a new capability type (DI extension)
   */
  register(name, capability) {
    this.capabilities.set(name, capability);
    return this;
  }

  /**
   * Register a handler for a capability (DI)
   */
  registerHandler(capabilityName, handler) {
    this.handlers.set(capabilityName, handler);
    return this;
  }

  /**
   * Get capability by name
   */
  get(name) {
    return this.capabilities.get(name);
  }

  /**
   * Get handler for capability
   */
  getHandler(name) {
    return this.handlers.get(name);
  }

  /**
   * List all registered capabilities
   */
  list() {
    return Array.from(this.capabilities.keys());
  }
}

// Singleton instance
export const capabilityRegistry = new CapabilityRegistry();
