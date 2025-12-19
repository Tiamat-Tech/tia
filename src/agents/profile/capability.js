/**
 * Represents an agent capability (runtime extensible)
 */
export class Capability {
  constructor({
    name,
    label,
    description,
    command = null,
    handler = null,
    metadata = {}
  }) {
    this.name = name;
    this.label = label;
    this.description = description;
    this.command = command;
    this.handler = handler;
    this.metadata = metadata;
  }

  /**
   * Execute capability with injected handler
   */
  async execute(context) {
    if (!this.handler) {
      throw new Error(`No handler registered for capability: ${this.name}`);
    }
    return this.handler(context);
  }
}
