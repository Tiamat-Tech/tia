/**
 * Represents an agent capability (runtime extensible)
 */
export class Capability {
  constructor({
    name,
    label,
    description,
    command = null,
    aliases = [],
    handler = null,
    metadata = {}
  }) {
    this.name = name;
    this.label = label;
    this.description = description;
    this.command = command;
    this.aliases = Array.isArray(aliases) ? aliases : [];
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

  /**
   * Check if text matches this capability's command triggers
   * @param {string} text - The text to check
   * @returns {boolean} True if text starts with command or any alias (as complete word)
   */
  matches(text) {
    if (!text) return false;
    const lower = text.toLowerCase().trim();

    // Check primary command (must be followed by whitespace or be complete string)
    if (this.command) {
      const cmdLower = this.command.toLowerCase();
      if (lower === cmdLower || lower.startsWith(cmdLower + " ")) {
        return true;
      }
    }

    // Check aliases (must be followed by whitespace or be complete string)
    return this.aliases.some(alias => {
      if (!alias) return false;
      const aliasLower = alias.toLowerCase();
      return lower === aliasLower || lower.startsWith(aliasLower + " ");
    });
  }

  /**
   * Extract content after the trigger command
   * @param {string} text - The original text
   * @returns {string} Text with trigger removed and trimmed
   */
  extractContent(text) {
    if (!text) return '';
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // Try primary command first
    if (this.command && lower.startsWith(this.command.toLowerCase())) {
      return trimmed.slice(this.command.length).trim();
    }

    // Try each alias
    for (const alias of this.aliases) {
      if (alias && lower.startsWith(alias.toLowerCase())) {
        return trimmed.slice(alias.length).trim();
      }
    }

    // No match found, return original text
    return trimmed;
  }
}
