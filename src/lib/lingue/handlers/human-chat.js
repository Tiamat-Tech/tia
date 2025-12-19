import { xml } from "@xmpp/client";
import { LINGUE_NS, LANGUAGE_MODES, MIME_TYPES } from "../constants.js";
import { LanguageModeHandler } from "../payload-handlers.js";

export class HumanChatHandler extends LanguageModeHandler {
  constructor({ logger } = {}) {
    super({
      mode: LANGUAGE_MODES.HUMAN_CHAT,
      mimeType: MIME_TYPES.HUMAN_CHAT,
      logger
    });
  }

  createStanza(to, payload, summary, options = {}) {
    const body = summary || payload || "";
    return xml(
      "message",
      { to, type: options.type || "chat" },
      xml("body", {}, body),
      xml("payload", { xmlns: LINGUE_NS, mime: this.mimeType, mode: this.mode }, "")
    );
  }

  parseStanza(stanza) {
    const body = stanza.getChildText("body") || "";
    return {
      summary: body,
      payload: null,
      mimeType: this.mimeType,
      mode: this.mode
    };
  }
}
