import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/services/agent-registry.js";
import fs from "fs";
import path from "path";

const configDir = path.join(process.cwd(), "config", "agents");

describe("agent profile loading", () => {
  it("loads semem profile from file", () => {
    const profile = loadAgentProfile("semem");
    expect(profile.nickname.toLowerCase()).toBe("semem");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("semem");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("semem");
  });

  it("loads mistral profile from file", () => {
    const profile = loadAgentProfile("mistral");
    expect(profile.nickname.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("mistral");
  });

  it("loads demo profile from file", () => {
    const profile = loadAgentProfile("demo");
    expect(profile.nickname.toLowerCase()).toBe("demo");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("demo");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("demo");
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
