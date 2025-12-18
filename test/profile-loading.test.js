import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/services/agent-registry.js";
import fs from "fs";
import path from "path";

const configDir = path.join(process.cwd(), "config", "agents");

describe("agent profile loading", () => {
  it("loads semem profile from file", () => {
    const profile = loadAgentProfile("semem");
    expect(profile.nickname).toBe("Semem");
    expect(profile.xmppConfig.resource).toBe("Semem");
    expect(profile.xmppConfig.username).toBe("Semem");
  });

  it("loads mistral profile from file", () => {
    const profile = loadAgentProfile("mistral");
    expect(profile.nickname).toBe("Mistral");
    expect(profile.xmppConfig.resource).toBe("Mistral");
    expect(profile.xmppConfig.username).toBe("Mistral");
  });

  it("loads demo profile from file", () => {
    const profile = loadAgentProfile("demo");
    expect(profile.nickname).toBe("Demo");
    expect(profile.xmppConfig.resource).toBe("Demo");
    expect(profile.xmppConfig.username).toBe("Demo");
  });

  it("falls back to default when profile missing", () => {
    const profile = loadAgentProfile("nonexistent-profile-xyz");
    expect(profile.profileName).toBe("default");
    expect(profile.nickname).toBe("Semem");
  });

  it("profile files exist", () => {
    ["semem", "mistral", "demo"].forEach((name) => {
      const file = path.join(configDir, `${name}.json`);
      expect(fs.existsSync(file)).toBe(true);
    });
  });
});
