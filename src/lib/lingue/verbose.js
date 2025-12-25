import { xml } from "@xmpp/client";

export function hasVerboseFlag(text) {
  return /(^|\s)-v(\s|$|[.,!?])/i.test(text || "");
}

export function isVerbosePayload(payload) {
  if (!payload) return false;
  if (payload.verbose === true) return true;
  if (hasVerboseFlag(payload.problemDescription)) return true;
  if (hasVerboseFlag(payload.message)) return true;
  return false;
}

export function formatLingueLine({ direction, mode, mimeType, detail }) {
  const modeLabel = mode?.split("/").pop() || mode || "unknown";
  return `Lingue ${direction} ${modeLabel} (${mimeType})${detail ? ` — ${detail}` : ""}`;
}

export async function reportLingueMode({
  logger,
  xmppClient,
  roomJid,
  payload,
  direction,
  mode,
  mimeType,
  detail
}) {
  if (!isVerbosePayload(payload)) return;
  const line = formatLingueLine({ direction, mode, mimeType, detail });
  logger.info?.(line);
  if (!xmppClient || !roomJid) return;
  await xmppClient.send(
    xml(
      "message",
      { to: roomJid, type: "groupchat" },
      xml("body", {}, line)
    )
  );
}
