import { describe, it, expect } from "vitest";
import { HumanChatHandler } from "../../src/lib/lingue/handlers/human-chat.js";

describe("HumanChatHandler", () => {
  it("roundtrips body text", () => {
    const handler = new HumanChatHandler();
    const stanza = handler.createStanza("peer@xmpp", null, "Hello");
    const parsed = handler.parseStanza(stanza);

    expect(parsed.summary).toBe("Hello");
    expect(parsed.payload).toBeNull();
  });
});
