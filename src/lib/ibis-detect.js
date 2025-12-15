const ISSUE_PREFIXES = ["issue", "how", "what", "why", "should", "where"];
const POSITION_PREFIXES = ["i propose", "we should", "let's", "consider", "option", "i think"];
const SUPPORT_PREFIXES = ["because", "since", "due to", "the benefit", "supports", "advantage", "pro"];
const OBJECTION_PREFIXES = ["however", "but", "concern", "downside", "risk", "against", "cons"];

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export function detectIBISStructure(text) {
  const normalized = text.toLowerCase();
  const tokens = normalized.split(/\s+/);

  const issues = detectIssues(normalized, tokens);
  const positions = detectPositions(normalized);
  const { supporting, objecting } = detectArguments(normalized);

  const argumentCount = supporting.length + objecting.length;
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
    ],
    confidence,
    source: text,
  };
}

function detectIssues(normalized, tokens) {
  const issues = [];
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

  sentences.forEach((sentence) => {
    if (SUPPORT_PREFIXES.some((prefix) => sentence.includes(prefix))) {
      supporting.push(sentence);
      return;
    }
    if (OBJECTION_PREFIXES.some((prefix) => sentence.includes(prefix))) {
      objecting.push(sentence);
    }
  });

  return { supporting, objecting };
}

function splitSentences(text) {
  return text
    .split(/[.!?]/g)
    .map((s) => s.trim())
    .filter(Boolean);
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
          `- ${a.stance === "object" ? "Objection" : "Support"}: ${a.label}`
      )
      .join("\n") || "- No arguments detected";

  return `IBIS summary\nIssue: ${issueText}\n${positions}\n${args}`;
}
