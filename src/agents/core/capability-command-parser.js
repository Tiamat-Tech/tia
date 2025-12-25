/**
 * Command parser that uses profile capabilities with fallback to legacy parsers
 * Provides backward compatibility during transition from hardcoded to profile-based commands
 */

/**
 * Create a command parser that uses capabilities from agent profile
 * @param {Array<Capability>} capabilities - Capabilities from agent profile
 * @param {Function} fallbackParser - Legacy parser to use when no capability matches
 * @returns {Function} Parser function that returns {command, content, capability}
 */
export function createCapabilityCommandParser(capabilities = [], fallbackParser = null) {
  return (text) => {
    const trimmed = (text || "").trim();

    // Try each capability in order (handle null/undefined capabilities gracefully)
    const caps = capabilities || [];
    for (const capability of caps) {
      if (capability && capability.matches(trimmed)) {
        return {
          command: capability.command || capability.name,
          content: capability.extractContent(trimmed),
          capability: capability  // Include for metadata/debugging
        };
      }
    }

    // Fall back to legacy parser (backward compatibility)
    if (fallbackParser) {
      return fallbackParser(trimmed);
    }

    // Default fallback: treat as chat
    return { command: "chat", content: trimmed };
  };
}
