import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class PrologProgramHandler extends LanguageModeHandler {
  constructor({ logger, onPayload } = {}) {
    super({
      mode: LANGUAGE_MODES.PROLOG_PROGRAM,
      mimeType: MIME_TYPES.PROLOG_PROGRAM,
      logger
    });
    this.onPayload = onPayload || null;
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

  async handlePayload({ payload, summary, from, stanza, reply, metadata }) {
    if (!this.onPayload) return null;
    return this.onPayload({ payload, summary, from, stanza, reply, metadata });
  }
}
