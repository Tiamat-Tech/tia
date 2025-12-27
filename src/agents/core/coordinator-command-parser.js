/**
 * Command parser specifically for the Coordinator agent
 * Recognizes MFR protocol commands
 */

export function coordinatorCommandParser(text) {
  const trimmed = (text || "").trim();
  const lowered = trimmed.toLowerCase();

  // MFR commands
  if (lowered.startsWith("mfr-start ") || lowered.startsWith("start ")) {
    const prefix = lowered.startsWith("mfr-start ") ? "mfr-start " : "start ";
    return {
      command: "mfr-start",
      content: trimmed.slice(prefix.length).trim()
    };
  }

  if (lowered.startsWith("mfr-debate ") || lowered.startsWith("debate ")) {
    const prefix = lowered.startsWith("mfr-debate ") ? "mfr-debate " : "debate ";
    return {
      command: "mfr-debate",
      content: trimmed.slice(prefix.length).trim()
    };
  }

  if (lowered.startsWith("q:") || lowered.startsWith("question:") || lowered.startsWith("issue:")) {
    const content = trimmed.replace(/^(q|question|issue)\s*:/i, "").trim();
    if (content) {
      return {
        command: "mfr-consensus",
        content
      };
    }
  }

  if (lowered.startsWith("mfr-contribute ") || lowered.startsWith("contribute ")) {
    const prefix = lowered.startsWith("mfr-contribute ") ? "mfr-contribute " : "contribute ";
    return {
      command: "mfr-contribute",
      content: trimmed.slice(prefix.length).trim()
    };
  }

  if (lowered.startsWith("mfr-validate ") || lowered.startsWith("validate ")) {
    const prefix = lowered.startsWith("mfr-validate ") ? "mfr-validate " : "validate ";
    return {
      command: "mfr-validate",
      content: trimmed.slice(prefix.length).trim()
    };
  }

  if (lowered.startsWith("mfr-solve ") || lowered.startsWith("solve ")) {
    const prefix = lowered.startsWith("mfr-solve ") ? "mfr-solve " : "solve ";
    return {
      command: "mfr-solve",
      content: trimmed.slice(prefix.length).trim()
    };
  }

  if (lowered.startsWith("mfr-status ") || lowered.startsWith("status ")) {
    const prefix = lowered.startsWith("mfr-status ") ? "mfr-status " : "status ";
    return {
      command: "mfr-status",
      content: trimmed.slice(prefix.length).trim()
    };
  }

  if (lowered === "mfr-list" || lowered === "list") {
    return {
      command: "mfr-list",
      content: ""
    };
  }

  if (lowered === "help" || lowered === "mfr-help") {
    return {
      command: "help",
      content: ""
    };
  }

  // Fall back to chat for unrecognized messages
  return { command: "chat", content: trimmed };
}

export default coordinatorCommandParser;
