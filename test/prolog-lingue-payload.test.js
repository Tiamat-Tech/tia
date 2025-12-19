import { describe, it, expect, vi } from "vitest";
import { xml } from "@xmpp/client";
import { LingueNegotiator } from "../src/lib/lingue/negotiator.js";
import { LANGUAGE_MODES, LINGUE_NS } from "../src/lib/lingue/constants.js";
import { PrologProgramHandler } from "../src/lib/lingue/handlers/prolog.js";
import { PrologProvider } from "../src/agents/providers/prolog-provider.js";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";

describe("Prolog Lingue payload handling", () => {
  it("handles Prolog payloads via negotiator", async () => {
    const provider = new PrologProvider({ nickname: "Prolog" });
    const handler = new PrologProgramHandler({
      onPayload: async ({ payload }) => provider.handle({ command: "chat", content: payload })
    });

    const profile = new AgentProfile({
      identifier: "prolog",
      nickname: "Prolog",
      roomJid: "test@conference",
      lingue: { supports: [LANGUAGE_MODES.PROLOG_PROGRAM] }
    });

    const negotiator = new LingueNegotiator({
      profile,
      handlers: { [LANGUAGE_MODES.PROLOG_PROGRAM]: handler }
    });

    const stanza = xml(
      "message",
      { type: "chat", from: "peer@xmpp" },
      xml("body", {}, "Prolog payload"),
      xml(
        "payload",
        { xmlns: LINGUE_NS, mime: "text/x-prolog", mode: LANGUAGE_MODES.PROLOG_PROGRAM },
        "parent(bob, alice).\n?- parent(bob, alice)."
      )
    );

    const reply = vi.fn();
    await negotiator.handleStanza(stanza, { reply });

    expect(reply).toHaveBeenCalled();
    const response = reply.mock.calls[0][0];
    expect(response.toLowerCase()).toContain("true");
  });
});
