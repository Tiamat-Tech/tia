import { describe, it, expect } from "vitest";
import { createDiscoInfoResponse, parseDiscoInfo } from "../src/lib/lingue/discovery.js";
import { FEATURES } from "../src/lib/lingue/constants.js";

describe("Lingue disco#info discovery", () => {
  it("parses features and identities from disco#info", () => {
    const stanza = createDiscoInfoResponse({
      to: "tester@xmpp.example",
      id: "disco-1",
      features: [FEATURES.LANG_HUMAN_CHAT, FEATURES.LANG_IBIS_TEXT],
      identities: [{ category: "client", type: "bot", name: "TestAgent" }]
    });

    const parsed = parseDiscoInfo(stanza);
    expect(parsed).toBeTruthy();
    expect(parsed.features.has(FEATURES.LANG_HUMAN_CHAT)).toBe(true);
    expect(parsed.features.has(FEATURES.LANG_IBIS_TEXT)).toBe(true);
    expect(parsed.identities).toHaveLength(1);
    expect(parsed.identities[0]).toEqual({
      category: "client",
      type: "bot",
      name: "TestAgent"
    });
  });
});
