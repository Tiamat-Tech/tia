export function isProcessStatusMessage(message) {
  const text = String(message || "").toLowerCase();
  if (!text) return false;
  return text.includes("planning poll started") ||
    text.includes("planning poll complete") ||
    text.includes("consensus session started") ||
    text.includes("consensus session complete") ||
    text.includes("debate session started") ||
    text.includes("debate started") ||
    text.includes("mfr session started") ||
    text.includes("mfr session complete") ||
    text.includes("session complete") ||
    text.includes("solutions received");
}

export function isVerboseRequest(text) {
  return /(^|\s)-v(\s|$|[.,!?])/i.test(text || "");
}

export function isQuietRequest(text) {
  return /(^|\s)-q(\s|$|[.,!?])/i.test(text || "");
}

export function deriveSyllogismAnswer(text) {
  const question = String(text || "").replace(/^\s*Q:\s*/i, "").trim();
  const normalized = question.replace(/\s+/g, " ");
  const match = normalized.match(
    /if all (.+?) are (.+?) and no (.+?) are (.+?), can any (.+?) be (.+?)\??$/i
  );
  if (!match) return null;

  const subject1 = match[1];
  const middle1 = match[2];
  const middle2 = match[3];
  const predicate1 = match[4];
  const subject2 = match[5];
  const predicate2 = match[6];

  if (!termsMatch(subject1, subject2)) return null;
  if (!termsMatch(middle1, middle2)) return null;
  if (!termsMatch(predicate1, predicate2)) return null;

  const subject = cleanTerm(subject1);
  const middle = cleanTerm(middle1);
  const predicate = cleanTerm(predicate1);
  return `No. If all ${subject} are ${middle} and no ${middle} are ${predicate}, then no ${subject} are ${predicate}.`;
}

export function parseConsensusEntries(message) {
  const text = String(message || "").trim();
  if (!text) return [];
  const entries = [];
  const lines = text.split(/\r?\n/);
  const linePattern = /^(?:[-*•>]\s*)?(?:\*{1,2})?(position|support|objection)(?:\*{1,2})?\s*[:\-–—]\s*(.+)$/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(linePattern);
    if (!match) continue;
    entries.push({
      type: match[1].toLowerCase(),
      text: match[2].trim()
    });
  }

  if (entries.length > 0) return entries;

  const inlinePattern = /(position|support|objection)\s*[:\-–—]\s*([^\n]+)/ig;
  let match = null;
  while ((match = inlinePattern.exec(text)) !== null) {
    entries.push({
      type: match[1].toLowerCase(),
      text: match[2].trim()
    });
  }
  return entries;
}

export function shouldTreatAsConsensusEntry(sender, text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (["chair", "coordinator"].includes(String(sender || "").toLowerCase())) {
    return false;
  }
  if (lower === "noted." || lower === "noted") return false;
  if (lower.startsWith("session:") || lower.startsWith("consensus started")) return false;
  if (lower.startsWith("consensus session complete")) return false;
  if (lower.startsWith("issue:") || lower.startsWith("question:")) return false;
  return true;
}

export function shouldIgnoreConsensusEntry(entry) {
  const sender = String(entry?.sender || "").toLowerCase();
  const text = String(entry?.text || "").trim();
  if (!text) return true;
  if (["chair", "coordinator", "demo"].includes(sender)) return true;
  if (sender === "data" && /^\\d+\\.\\s+\\w+:/i.test(text)) return true;
  const lower = text.toLowerCase();
  if (lower.includes("unavailable right now")) return true;
  if (lower.includes("demo bot")) return true;
  if (lower.startsWith("@coordinator")) return true;
  if (/^hello there|^hi there|nice to meet you/i.test(text)) return true;
  return false;
}

export function synthesizeConsensus(debateData) {
  const positions = debateData.positions || [];
  const positionCounts = new Map();
  const seenSenders = new Set();
  const support = [];
  const objections = [];

  positions.forEach((entry) => {
    if (!entry?.text) return;
    if (shouldIgnoreConsensusEntry(entry)) return;
    const senderKey = String(entry.sender || "").toLowerCase();
    if (entry.type === "position" && senderKey) {
      if (seenSenders.has(senderKey)) return;
      seenSenders.add(senderKey);
    }
    if (entry.type === "position") {
      const key = entry.text.toLowerCase();
      positionCounts.set(key, {
        count: (positionCounts.get(key)?.count || 0) + 1,
        text: entry.text
      });
    } else if (entry.type === "support") {
      if (support.length < 3) support.push(entry.text);
    } else if (entry.type === "objection") {
      if (objections.length < 3) objections.push(entry.text);
    }
  });

  let answer = null;
  if (positionCounts.size > 0) {
    const sorted = Array.from(positionCounts.values()).sort((a, b) => b.count - a.count);
    answer = sorted[0]?.text || null;
  }

  return { answer, support, objections };
}

export function parsePlanningRoute(message) {
  const text = String(message || "").trim();
  if (!text) return null;
  const match = text.match(/route\\s*[:=]\\s*([a-z-]+)/i);
  const candidate = match ? match[1].toLowerCase() : null;
  if (candidate && isPlanningRoute(candidate)) {
    return candidate;
  }
  const lowered = text.toLowerCase();
  const keyword = ["logic", "consensus", "golem-logic"].find((route) =>
    new RegExp(`\\b${route}\\b`).test(lowered)
  );
  return isPlanningRoute(keyword) ? keyword : null;
}

export function isPlanningRoute(route) {
  return ["logic", "consensus", "golem-logic"].includes(route);
}

export function tallyPlanningVotes(votes) {
  const counts = new Map();
  for (const route of votes.values()) {
    counts.set(route, (counts.get(route) || 0) + 1);
  }
  const sorted = Array.from(counts.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count);
  return {
    total: votes.size,
    sorted
  };
}

function termsMatch(a, b) {
  return normalizeTerm(a) === normalizeTerm(b);
}

function normalizeTerm(value) {
  const cleaned = cleanTerm(value).toLowerCase();
  const noArticles = cleaned.replace(/\b(a|an|the)\b/g, "").trim();
  if (noArticles.endsWith("s") && !noArticles.endsWith("ss")) {
    return noArticles.slice(0, -1);
  }
  return noArticles;
}

function cleanTerm(value) {
  return String(value || "")
    .trim()
    .replace(/[?.,!]+$/g, "")
    .replace(/\s+/g, " ");
}
