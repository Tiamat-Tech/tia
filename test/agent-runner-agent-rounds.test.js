import { describe, it, expect } from "vitest";
import { AgentRunner } from "../src/agents/core/agent-runner.js";

describe("AgentRunner agent rounds", () => {
  it("suppresses unaddressed agent messages but allows explicit mentions", async () => {
    const replies = [];
    const provider = {
      async handle() {
        return "ok";
      }
    };

    const runner = new AgentRunner({
      xmppConfig: {
        service: "xmpp://localhost:5222",
        domain: "xmpp",
        username: "test",
        password: "test",
        resource: "TestBot"
      },
      roomJid: "room@conference.xmpp",
      nickname: "TestBot",
      provider,
      agentRoster: ["AgentA", "AgentB"],
      maxAgentRounds: 2,
      mentionDetector: (text) => text?.toLowerCase?.().includes("testbot")
    });

    await runner.handleMessage({
      body: "TestBot, hello",
      sender: "AgentA",
      type: "groupchat",
      roomJid: "room@conference.xmpp",
      reply: (text) => replies.push(text)
    });

    await runner.handleMessage({
      body: "TestBot, ping",
      sender: "AgentB",
      type: "groupchat",
      roomJid: "room@conference.xmpp",
      reply: (text) => replies.push(text)
    });

    await runner.handleMessage({
      body: "TestBot, are you there?",
      sender: "danny",
      type: "groupchat",
      roomJid: "room@conference.xmpp",
      reply: (text) => replies.push(text)
    });

    expect(replies).toEqual(["ok", "ok", "ok"]);
  });
});
