import { describe, it, expect } from "vitest";
import { PrologProgramHandler } from "../../src/lib/lingue/handlers/prolog.js";

describe("PrologProgramHandler", () => {
  it("roundtrips prolog payload", () => {
    const handler = new PrologProgramHandler();
    const payload = "rule(a) :- fact(b).";
    const stanza = handler.createStanza("peer@xmpp", payload, "Rules");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Rules");
    expect(parsed.payload).toBe(payload);
    expect(parsed.mimeType).toBe("text/x-prolog");
  });
});
