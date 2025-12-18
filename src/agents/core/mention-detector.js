export function createMentionDetector(nickname, aliases = []) {
  if (!nickname) throw new Error("Mention detector requires a nickname");
  const normNick = nickname.toLowerCase();
  const allAliases = [normNick, ...aliases.map((a) => a.toLowerCase())].filter(Boolean);

  return (body = "") => {
    const lower = body.toLowerCase();
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
