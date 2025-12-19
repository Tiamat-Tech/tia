import { describe, it, expect } from "vitest";
import { ProfileExchangeHandler } from "../../src/lib/lingue/handlers/profile-exchange.js";

describe("ProfileExchangeHandler", () => {
  it("roundtrips profile turtle payload", () => {
    const handler = new ProfileExchangeHandler();
    const payload = "@prefix lng: <http://purl.org/stuff/lingue/> .";
    const stanza = handler.createStanza("peer@xmpp", payload, "Profile");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Profile");
    expect(parsed.payload).toBe(payload);
    expect(parsed.mimeType).toBe("text/turtle");
  });
});
