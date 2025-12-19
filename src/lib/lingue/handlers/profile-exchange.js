import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class ProfileExchangeHandler extends LanguageModeHandler {
  constructor({ logger } = {}) {
    super({
      mode: LANGUAGE_MODES.PROFILE_EXCHANGE,
      mimeType: MIME_TYPES.PROFILE_EXCHANGE,
      logger
    });
  }

  createStanza(to, payload, summary, options = {}) {
    const body = summary || "";
    const payloadText = payload || "";
    return xml(
      "message",
      { to, type: options.type || "chat" },
      xml("body", {}, body),
      xml("payload", { xmlns: LINGUE_NS, mime: this.mimeType, mode: this.mode }, payloadText)
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "";
    const mimeType = payloadNode?.attrs?.mime || this.mimeType;

    return {
      summary: body,
      payload: payloadText,
      mimeType,
      mode: this.mode
    };
  }
}
