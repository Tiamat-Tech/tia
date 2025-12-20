import "./helpers/agent-secrets.js";
import { describe, it, expect } from "vitest";
import { loadAgentProfile } from "../src/services/agent-registry.js";
import fs from "fs";
import path from "path";

const configDir = path.join(process.cwd(), "config", "agents");

describe("agent profile loading", () => {
  it("loads semem profile from file", async () => {
    const profile = await loadAgentProfile("semem");
    expect(profile.nickname.toLowerCase()).toBe("semem");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("semem");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("semem");
  });

  it("loads mistral profile from file", async () => {
    const profile = await loadAgentProfile("mistral");
    expect(profile.nickname.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("mistral");
    expect(profile.xmppConfig.service).toBe("xmpp://tensegrity.it:5222");
    expect(profile.xmppConfig.password).toBe("mistralpass");
  });

  it("loads demo profile from file", async () => {
    const profile = await loadAgentProfile("demo");
    expect(profile.nickname.toLowerCase()).toBe("demo");
    expect(profile.xmppConfig.resource.toLowerCase()).toBe("demo");
    expect(profile.xmppConfig.username.toLowerCase()).toBe("demo");
  });

  it("falls back to default when profile missing", async () => {
    const profile = await loadAgentProfile("nonexistent-profile-xyz");
    expect(profile.profileName).toBe("default");
    expect(profile.nickname).toBe("Semem");
  });

  it("profile files exist", () => {
    ["semem", "mistral", "demo"].forEach((name) => {
      const file = path.join(configDir, `${name}.ttl`);
      expect(fs.existsSync(file)).toBe(true);
    });
  });
});
