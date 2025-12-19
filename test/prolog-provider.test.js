import { describe, it, expect } from "vitest";
import { PrologProvider } from "../src/agents/providers/prolog-provider.js";

let tauAvailable = true;
try {
  await import("tau-prolog");
} catch (error) {
  tauAvailable = false;
}

const testCase = tauAvailable ? it : it.skip;

describe("PrologProvider", () => {
  testCase("answers a simple query", async () => {
    const provider = new PrologProvider({ nickname: "Prolog" });
    const result = await provider.handle({
      command: "chat",
      content: "parent(bob, alice).\n?- parent(bob, alice)."
    });

    expect(result).toBeTypeOf("string");
    expect(result.toLowerCase()).toContain("true");
  });
});
