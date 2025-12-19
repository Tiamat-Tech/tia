import { describe, it, expect, vi } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { LANGUAGE_MODES } from "../src/lib/lingue/constants.js";
import { NegotiationState } from "../src/lib/lingue/offer-accept.js";
import { LingueNegotiator, createOfferStanza } from "../src/lib/lingue/negotiator.js";

describe("Lingue negotiation state", () => {
  it("tracks offers and accepts", () => {
    const state = new NegotiationState({ offerTtlMs: 1000, activeTtlMs: 1000 });
    const mode = LANGUAGE_MODES.HUMAN_CHAT;

    state.offer("peer@xmpp", [mode]);
    expect(state.hasOffer("peer@xmpp")).toBe(true);

    const accepted = state.accept("peer@xmpp", mode);
    expect(accepted).toBe(true);
    expect(state.getActiveMode("peer@xmpp")).toBe(mode);
  });
});

describe("Lingue negotiator", () => {
  it("accepts an offered mode and replies", async () => {
    const mode = LANGUAGE_MODES.HUMAN_CHAT;
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference",
      lingue: { supports: [mode] }
    });

    const sent = [];
    const xmppClient = {
      send: async (stanza) => {
        sent.push(stanza);
      }
    };

    const negotiator = new LingueNegotiator({ profile, xmppClient });
    const offer = createOfferStanza("test@xmpp", [mode]);
    offer.attrs.from = "peer@xmpp";

    const handled = await negotiator.handleStanza(offer);

    expect(handled).toBe(true);
    expect(negotiator.getActiveMode("peer@xmpp")).toBe(mode);
    expect(sent.length).toBe(1);
  });

  it("routes payloads to handlers", async () => {
    const mode = LANGUAGE_MODES.PROLOG_PROGRAM;
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference",
      lingue: { supports: [mode] }
    });

    const handler = {
      parseStanza: () => ({ summary: "Summary", payload: "fact(a).", mode }),
      handlePayload: vi.fn(async () => "ok")
    };

    const negotiator = new LingueNegotiator({
      profile,
      handlers: { [mode]: handler }
    });

    const stanza = createOfferStanza("test@xmpp", []);
    stanza.attrs.from = "peer@xmpp";
    stanza.name = "message";
    stanza.getChild = (name, ns) => {
      if (name === "payload" && ns) {
        return {
          attrs: { mime: "text/x-prolog", mode },
          getText: () => "fact(a)."
        };
      }
      return null;
    };
    stanza.is = () => true;

    const reply = vi.fn();
    const handled = await negotiator.handleStanza(stanza, { reply });

    expect(handled).toBe(true);
    expect(handler.handlePayload).toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith("ok");
  });
});
