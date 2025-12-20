import { describe, it, expect } from "vitest";
import { InMemoryHistoryStore } from "../src/lib/history/index.js";

describe("InMemoryHistoryStore", () => {
  it("stores turns in order and returns messages", () => {
    const store = new InMemoryHistoryStore({ maxEntries: 3 });

    store.addTurn({ role: "user", content: "Hello" });
    store.addTurn({ role: "assistant", content: "Hi there" });
    store.addTurn({ role: "user", content: "How are you?" });

    const messages = store.getMessages();
    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({ role: "user", content: "Hello" });
    expect(messages[2]).toEqual({ role: "user", content: "How are you?" });
  });

  it("prunes older entries when maxEntries is exceeded", () => {
    const store = new InMemoryHistoryStore({ maxEntries: 2 });

    store.addTurn({ role: "user", content: "One" });
    store.addTurn({ role: "assistant", content: "Two" });
    store.addTurn({ role: "user", content: "Three" });

    const messages = store.getMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: "assistant", content: "Two" });
    expect(messages[1]).toEqual({ role: "user", content: "Three" });
  });
});
