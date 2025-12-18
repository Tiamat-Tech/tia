export function defaultCommandParser(text) {
  const trimmed = (text || "").trim();
  const lowered = trimmed.toLowerCase();

  if (lowered.startsWith("tell ")) {
    return { command: "tell", content: trimmed.slice(5).trim() };
  }
  if (lowered.startsWith("ask ")) {
    return { command: "ask", content: trimmed.slice(4).trim() };
  }
  if (lowered.startsWith("augment ")) {
    return { command: "augment", content: trimmed.slice(8).trim() };
  }

  return { command: "chat", content: trimmed };
}

export function createPrefixedCommandParser(prefixes = []) {
  return (text) => {
    const trimmed = (text || "").trim();
    const lowered = trimmed.toLowerCase();
    for (const prefix of prefixes) {
      if (lowered.startsWith(prefix)) {
        return defaultCommandParser(trimmed.slice(prefix.length).trim());
      }
    }
    return defaultCommandParser(trimmed);
  };
}

export default defaultCommandParser;
