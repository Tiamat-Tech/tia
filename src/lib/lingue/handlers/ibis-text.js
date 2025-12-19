import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class IBISTextHandler extends LanguageModeHandler {
  constructor({ logger } = {}) {
    super({
      mode: LANGUAGE_MODES.IBIS_TEXT,
      mimeType: MIME_TYPES.IBIS_TEXT,
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
      xml("payload", { xmlns: LINGUE_NS, mime: "text/turtle", mode: this.mode }, payloadText)
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    const payloadText = payloadNode?.getText?.() || "";
    const mimeType = payloadNode?.attrs?.mime || "text/turtle";

    return {
      summary: body,
      payload: payloadText,
      mimeType,
      mode: this.mode
    };
  }
}
