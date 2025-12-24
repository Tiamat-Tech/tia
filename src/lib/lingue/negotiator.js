import { xml } from "@xmpp/client";
import { LINGUE_NS, modeFromMime } from "./constants.js";
import { NegotiationState } from "./offer-accept.js";

const OFFER_ELEMENT = "offer";
const ACCEPT_ELEMENT = "accept";

export class LingueNegotiator {
  constructor({
    profile,
    xmppClient = null,
    handlers = {},
    logger = console,
    state = new NegotiationState()
  } = {}) {
    this.profile = profile;
    this.xmppClient = xmppClient;
    this.handlers = handlers;
    this.logger = logger;
    this.state = state;
  }

  setXmppClient(xmppClient) {
    this.xmppClient = xmppClient;
  }

  getActiveMode(peerJid) {
    return this.state.getActiveMode(peerJid);
  }

  async offerExchange(peerJid, modes = []) {
    this.state.offer(peerJid, modes);

    if (!this.xmppClient) return;
    const stanza = createOfferStanza(peerJid, modes);
    await this.xmppClient.send(stanza);
  }

  async acceptMode(peerJid, mode) {
    this.state.setActiveMode(peerJid, mode);

    if (!this.xmppClient) return;
    const stanza = createAcceptStanza(peerJid, mode);
    await this.xmppClient.send(stanza);
  }

  async send(peerJid, { mode, payload, summary } = {}) {
    const handler = this.handlers?.[mode];
    if (!handler) {
      throw new Error(`No handler registered for Lingue mode: ${mode}`);
    }

    const stanza = handler.createStanza(peerJid, payload, summary);
    if (!this.xmppClient) return;

    await this.xmppClient.send(stanza);
  }

  async handleStanza(stanza, context = {}) {
    if (!stanza?.is?.("message")) return false;

    const offer = stanza.getChild(OFFER_ELEMENT, LINGUE_NS);
    if (offer) {
      const modes = offer.getChildren("mode").map((mode) => mode.getText());
      const accepted = this.selectSupportedMode(modes);

      if (accepted) {
        this.state.setActiveMode(stanza.attrs.from, accepted);
        if (this.xmppClient) {
          const reply = createAcceptStanza(stanza.attrs.from, accepted);
          await this.xmppClient.send(reply);
        }
      }
      return true;
    }

    const accept = stanza.getChild(ACCEPT_ELEMENT, LINGUE_NS);
    if (accept) {
      const modeNode = accept.getChild("mode");
      const mode = accept.attrs.mode || modeNode?.getText();
      if (mode) {
        this.state.setActiveMode(stanza.attrs.from, mode);
      }
      return true;
    }

    const payloadNode = stanza.getChild("payload", LINGUE_NS);
    if (payloadNode) {
      const mode = payloadNode.attrs.mode || modeFromMime(payloadNode.attrs.mime);
      const handler = mode ? this.handlers?.[mode] : null;
      if (handler) {
        const parsed = handler.parseStanza(stanza);
        if (handler.handlePayload) {
          const response = await handler.handlePayload({
            ...parsed,
            from: stanza.attrs.from,
            stanza,
            ...context
          });
          if (response && context.reply) {
            await context.reply(response);
          }
        }
        return true;
      }
    }

    return false;
  }

  selectSupportedMode(modes = []) {
    const supported = this.profile?.lingue?.supports || new Set();
    for (const mode of modes) {
      if (supported.has(mode) || this.handlers?.[mode]) {
        return mode;
      }
    }
    return null;
  }
}

export function createOfferStanza(to, modes = []) {
  return xml(
    "message",
    { to, type: "groupchat" },
    xml(
      OFFER_ELEMENT,
      { xmlns: LINGUE_NS },
      ...modes.map((mode) => xml("mode", {}, mode))
    )
  );
}

export function createAcceptStanza(to, mode) {
  return xml(
    "message",
    { to, type: "groupchat" },
    xml(ACCEPT_ELEMENT, { xmlns: LINGUE_NS, mode })
  );
}
