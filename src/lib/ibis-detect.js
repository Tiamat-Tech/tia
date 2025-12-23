const ISSUE_PREFIXES = ["issue", "how", "what", "why", "should", "where"];
const ISSUE_MARKERS = [/^issue\s*:/, /^i\s*:/];
const POSITION_PREFIXES = ["i propose", "we should", "let's", "consider", "option", "i think"];
const POSITION_MARKERS = [/^position\s*:/, /^p\s*:/];
const SUPPORT_PREFIXES = ["because", "since", "due to", "the benefit", "supports", "advantage", "pro"];
const SUPPORT_MARKERS = [/^support\s*:/, /^s\s*:/];
const OBJECTION_PREFIXES = ["however", "but", "concern", "downside", "risk", "against", "cons"];
const OBJECTION_MARKERS = [/^objection\s*:/, /^oppose\s*:/, /^o\s*:/];
const ARGUMENT_MARKERS = [/^argument\s*:/, /^arg\s*:/, /^a\s*:/];

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export function detectIBISStructure(text) {
  const normalized = text.toLowerCase();
  const tokens = normalized.split(/\s+/);

  const issues = detectIssues(normalized, tokens);
  const positions = detectPositions(normalized);
  const { supporting, objecting, neutral } = detectArguments(normalized);

  const argumentCount = supporting.length + objecting.length + neutral.length;
  const signal = issues.length + positions.length + argumentCount * 0.5;
  const confidence = clamp(signal / 4, 0, 1);

  return {
    issues,
    positions,
    arguments: [
      ...supporting.map((label, idx) => ({
        id: `arg-support-${idx + 1}`,
        label,
        stance: "support",
      })),
      ...objecting.map((label, idx) => ({
        id: `arg-object-${idx + 1}`,
        label,
        stance: "object",
      })),
      ...neutral.map((label, idx) => ({
        id: `arg-neutral-${idx + 1}`,
        label,
        stance: "neutral",
      })),
    ],
    confidence,
    source: text,
  };
}

function detectIssues(normalized, tokens) {
  const issues = [];
  const labeledIssue = ISSUE_MARKERS.find((marker) => marker.test(normalized));
  if (labeledIssue) {
    issues.push({
      id: "issue-1",
      label: normalized.replace(labeledIssue, "").trim() || "Unlabeled issue",
    });
    return issues;
  }
  if (normalized.includes("?")) {
    issues.push({
      id: "issue-1",
      label: normalized.replace(/\?+/g, "").trim() || "Unlabeled issue",
    });
  } else {
    const startsWithIssueLanguage = ISSUE_PREFIXES.some((prefix) =>
      normalized.startsWith(prefix)
    );
    if (startsWithIssueLanguage) {
      issues.push({
        id: "issue-1",
        label: normalized,
      });
    }
  }

  // If the text mentions multiple question words, add a generic issue.
  const questionWords = tokens.filter((word) =>
    ["what", "why", "how", "should"].includes(word)
  );
  if (questionWords.length > 1 && issues.length === 0) {
    issues.push({
      id: "issue-1",
      label: normalized,
    });
  }

  return issues;
}

function detectPositions(normalized) {
  const sentences = splitSentences(normalized);
  const positions = [];
  sentences.forEach((sentence, idx) => {
    const labeledPosition = POSITION_MARKERS.find((marker) => marker.test(sentence));
    if (labeledPosition) {
      positions.push({
        id: `pos-${idx + 1}`,
        label: sentence.replace(labeledPosition, "").trim() || "Unlabeled position",
      });
      return;
    }
    const hasPrefix = POSITION_PREFIXES.some((prefix) => sentence.startsWith(prefix));
    if (hasPrefix) {
      positions.push({
        id: `pos-${idx + 1}`,
        label: sentence,
      });
    }
  });
  return positions;
}

function detectArguments(normalized) {
  const sentences = splitSentences(normalized);
  const supporting = [];
  const objecting = [];
  const neutral = [];

  sentences.forEach((sentence) => {
    const labeledSupport = SUPPORT_MARKERS.find((marker) => marker.test(sentence));
    if (labeledSupport) {
      supporting.push(sentence.replace(labeledSupport, "").trim() || "Unlabeled support");
      return;
    }
    const labeledObjection = OBJECTION_MARKERS.find((marker) => marker.test(sentence));
    if (labeledObjection) {
      objecting.push(sentence.replace(labeledObjection, "").trim() || "Unlabeled objection");
      return;
    }
    const labeledArgument = ARGUMENT_MARKERS.find((marker) => marker.test(sentence));
    if (labeledArgument) {
      const label = sentence.replace(labeledArgument, "").trim() || "Unlabeled argument";
      const stance = inferArgumentStance(label);
      if (stance === "object") {
        objecting.push(label);
      } else if (stance === "support") {
        supporting.push(label);
      } else {
        neutral.push(label);
      }
      return;
    }
    if (SUPPORT_PREFIXES.some((prefix) => sentence.includes(prefix))) {
      supporting.push(sentence);
      return;
    }
    if (OBJECTION_PREFIXES.some((prefix) => sentence.includes(prefix))) {
      objecting.push(sentence);
    }
  });

  return { supporting, objecting, neutral };
}

function splitSentences(text) {
  return text
    .split(/[.!?]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferArgumentStance(text) {
  const normalized = text.toLowerCase();
  const hasSupport = SUPPORT_PREFIXES.some((prefix) => normalized.includes(prefix));
  const hasObjection = OBJECTION_PREFIXES.some((prefix) => normalized.includes(prefix));
  if (hasSupport && !hasObjection) return "support";
  if (hasObjection && !hasSupport) return "object";
  return "neutral";
}

export function summarizeIBIS(structure) {
  const issueText =
    structure.issues?.[0]?.label || structure.source || "Unspecified issue";
  const positions =
    structure.positions?.map((p) => `- Position: ${p.label}`).join("\n") ||
    "- No explicit positions detected";
  const args =
    structure.arguments
      ?.map(
        (a) =>
          `- ${
            a.stance === "object"
              ? "Objection"
              : a.stance === "support"
                ? "Support"
                : "Argument"
          }: ${a.label}`
      )
      .join("\n") || "- No arguments detected";

  return `IBIS summary\nIssue: ${issueText}\n${positions}\n${args}`;
}
