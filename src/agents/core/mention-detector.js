export function createMentionDetector(nickname, aliases = []) {
  const normNick = (nickname || "").toLowerCase();
  const allAliases = [normNick, ...aliases.map((a) => a.toLowerCase())].filter(Boolean);

  return (body = "") => {
    const lower = body.toLowerCase();
    if (lower.startsWith("bot:")) return true;
    for (const alias of allAliases) {
      if (!alias) continue;
      if (lower.includes(alias)) return true;
      if (lower.startsWith(`${alias}:`) || lower.startsWith(`${alias},`)) return true;
      if (lower.includes(`@${alias}`)) return true;
    }
    return false;
  };
}

export default createMentionDetector;
