import "./helpers/agent-secrets.js";
import { describe, it, expect } from "vitest";
import { loadAgentProfile, profileToTurtle, parseAgentProfile } from "../src/agents/profile-loader.js";
import { createProfileBuilder } from "../src/agents/profile/profile-builder.js";

describe("Profile roundtrip serialization", () => {
  it("roundtrips mistral profile", async () => {
    const original = await loadAgentProfile("mistral");
    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#mistral");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.roomJid).toBe(original.roomJid);

    expect(restored.xmppAccount.service).toBe(original.xmppAccount.service);
    expect(restored.xmppAccount.domain).toBe(original.xmppAccount.domain);
    expect(restored.xmppAccount.username).toBe(original.xmppAccount.username);

    expect(restored.provider.type).toBe(original.provider.type);
    expect(restored.toConfig()).toEqual(original.toConfig());
  });

  it("roundtrips semem profile with features", async () => {
    const original = await loadAgentProfile("semem");
    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#semem");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.provider.type).toBe("semem");

    const originalConfig = original.toConfig();
    const restoredConfig = restored.toConfig();

    expect(restoredConfig.semem.baseUrl).toBe(originalConfig.semem.baseUrl);
    expect(restoredConfig.semem.authTokenEnv).toBe(originalConfig.semem.authTokenEnv);
    expect(restoredConfig.semem.timeoutMs).toBe(originalConfig.semem.timeoutMs);
    expect(restoredConfig.semem.features).toEqual(originalConfig.semem.features);
  });

  it("roundtrips demo profile without provider", async () => {
    const original = await loadAgentProfile("demo");
    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#demo");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.provider).toBeNull();
    expect(restored.toConfig()).toEqual(original.toConfig());
  });

  it("roundtrips built profile", async () => {
    const original = createProfileBuilder()
      .identifier("test")
      .nickname("TestBot")
      .room("test@conference.test")
      .xmpp({
        service: "xmpp://test:5222",
        domain: "test",
        username: "test",
        password: "testpass",
        passwordKey: "test",
        resource: "TestBot"
      })
      .mistralProvider({
        model: "mistral-small-latest",
        apiKeyEnv: "TEST_API_KEY"
      })
      .build();

    const turtle = await profileToTurtle(original);
    const restored = await parseAgentProfile(turtle, "#test");

    expect(restored.nickname).toBe(original.nickname);
    expect(restored.identifier).toBe(original.identifier);
    expect(restored.toConfig()).toEqual(original.toConfig());
  });

  it("generated turtle contains correct prefixes", async () => {
    const profile = await loadAgentProfile("mistral");
    const turtle = await profileToTurtle(profile);

    expect(turtle).toContain("@prefix agent:");
    expect(turtle).toContain("@prefix foaf:");
    expect(turtle).toContain("@prefix xmpp:");
    expect(turtle).toContain("@prefix ai:");
  });

  it("generated turtle contains agent data", async () => {
    const profile = await loadAgentProfile("mistral");
    const turtle = await profileToTurtle(profile);

    expect(turtle).toContain("foaf:nick");
    expect(turtle).toContain("Mistral");
    expect(turtle).toContain("agent:xmppAccount");
    expect(turtle).toContain("agent:roomJid");
  });
});
