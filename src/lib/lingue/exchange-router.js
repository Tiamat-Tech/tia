export function routeExchange({ mode, handlers, stanza, payload, summary }) {
  const handler = handlers?.[mode];
  if (!handler) return false;

  if (stanza && typeof handler.parseStanza === "function") {
    return handler.parseStanza(stanza);
  }

  if (typeof handler.handlePayload === "function") {
    return handler.handlePayload({ payload, summary, stanza });
  }

  return false;
}
