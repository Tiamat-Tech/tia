import { describe, it, expect, vi } from "vitest";
import { AgentRunner } from "../src/agents/core/agent-runner.js";

const xmppConfig = {
  service: "xmpp://localhost:5222",
  domain: "xmpp",
  username: "tester",
  password: "testpass"
};

describe("AgentRunner Lingue integration", () => {
  it("delegates to negotiator when stanza is handled", async () => {
    const provider = { handle: vi.fn() };
    const negotiator = { handleStanza: vi.fn(async () => true) };
    const runner = new AgentRunner({
      xmppConfig,
      roomJid: "test@conference.local",
      nickname: "TestBot",
      provider,
      negotiator
    });

    await runner.handleMessage({
      body: "ignored",
      sender: "peer",
      type: "chat",
      roomJid: null,
      reply: vi.fn(),
      stanza: {}
    });

    expect(negotiator.handleStanza).toHaveBeenCalledWith(expect.anything(), expect.any(Object));
    expect(provider.handle).not.toHaveBeenCalled();
  });

  it("falls back to provider when stanza not handled", async () => {
    const provider = { handle: vi.fn(async () => "ok") };
    const negotiator = { handleStanza: vi.fn(async () => false) };
    const reply = vi.fn();
    const runner = new AgentRunner({
      xmppConfig,
      roomJid: "test@conference.local",
      nickname: "TestBot",
      provider,
      negotiator
    });

    await runner.handleMessage({
      body: "hello",
      sender: "peer",
      type: "chat",
      roomJid: null,
      reply,
      stanza: {}
    });

    expect(provider.handle).toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith("ok");
  });
});
