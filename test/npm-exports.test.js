import { describe, it, expect } from "vitest";
import * as exports from "../src/index.js";

describe("NPM exports", () => {
  it("exposes core exports", () => {
    expect(exports.AgentRunner).toBeDefined();
    expect(exports.LingueNegotiator).toBeDefined();
    expect(exports.LINGUE).toBeDefined();
    expect(exports.Handlers).toBeDefined();
    expect(exports.BaseProvider).toBeDefined();
    expect(exports.MCP).toBeDefined();
  });
});
