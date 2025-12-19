import { describe, it, expect } from "vitest";
import { AgentProfile } from "../src/agents/profile/agent-profile.js";
import { XmppConfig } from "../src/agents/profile/xmpp-config.js";
import { Capability } from "../src/agents/profile/capability.js";
import { capabilityRegistry } from "../src/agents/profile/capability-registry.js";

describe("Runtime capability extension", () => {
  it("adds capabilities at runtime", async () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      xmppAccount: new XmppConfig({
        service: "xmpp://test:5222",
        domain: "test",
        username: "test",
        password: "test",
        resource: "Test"
      }),
      capabilities: []
    });

    const customCap = new Capability({
      name: "CustomCapability",
      label: "Custom",
      description: "A custom test capability",
      handler: async (ctx) => `Custom: ${ctx.input}`
    });

    profile.addCapability(customCap);
    expect(profile.hasCapability("CustomCapability")).toBe(true);

    const result = await profile.getCapability("CustomCapability").execute({ input: "test" });
    expect(result).toBe("Custom: test");
  });

  it("adds capability by name string", () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: []
    });

    profile.addCapability("SimpleCapability");
    expect(profile.hasCapability("SimpleCapability")).toBe(true);

    const cap = profile.getCapability("SimpleCapability");
    expect(cap.name).toBe("SimpleCapability");
  });

  it("returns false for non-existent capability", () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: []
    });

    expect(profile.hasCapability("NonExistent")).toBe(false);
  });

  it("throws error when executing capability without handler", async () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: [
        new Capability({
          name: "NoHandler",
          label: "No Handler"
        })
      ]
    });

    const cap = profile.getCapability("NoHandler");
    await expect(cap.execute({})).rejects.toThrow("No handler registered for capability: NoHandler");
  });

  it("registers capabilities globally", () => {
    const testCap = new Capability({
      name: "GlobalCap",
      label: "Global Test",
      description: "A globally registered capability"
    });

    capabilityRegistry.register("GlobalCap", testCap);

    expect(capabilityRegistry.get("GlobalCap")).toBeDefined();
    expect(capabilityRegistry.list()).toContain("GlobalCap");
  });

  it("registers handlers globally", () => {
    const handler = async (ctx) => `Handled: ${ctx.input}`;
    capabilityRegistry.registerHandler("TestCap", handler);

    const registeredHandler = capabilityRegistry.getHandler("TestCap");
    expect(registeredHandler).toBe(handler);
  });

  it("supports fluent chaining", () => {
    const profile = new AgentProfile({
      identifier: "test",
      nickname: "TestAgent",
      roomJid: "test@conference.test",
      capabilities: []
    });

    const result = profile
      .addCapability("Cap1")
      .addCapability("Cap2")
      .addCapability("Cap3");

    expect(result).toBe(profile);
    expect(profile.hasCapability("Cap1")).toBe(true);
    expect(profile.hasCapability("Cap2")).toBe(true);
    expect(profile.hasCapability("Cap3")).toBe(true);
  });
});
