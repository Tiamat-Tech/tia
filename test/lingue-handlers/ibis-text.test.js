import { describe, it, expect } from "vitest";
import { IBISTextHandler } from "../../src/lib/lingue/handlers/ibis-text.js";

describe("IBISTextHandler", () => {
  it("roundtrips summary and turtle payload", () => {
    const handler = new IBISTextHandler();
    const turtle = "@prefix ibis: <https://vocab.methodandstructure.com/ibis#> .";
    const stanza = handler.createStanza("peer@xmpp", turtle, "Summary");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Summary");
    expect(parsed.payload).toBe(turtle);
    expect(parsed.mimeType).toBe("text/turtle");
  });
});
