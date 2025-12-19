import {
  AgentRunner,
  loadAgentProfile,
  LingueNegotiator,
  LINGUE,
  Handlers
} from "../src/index.js";

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const profile = await loadAgentProfile("demo");
if (!profile) {
  throw new Error("Missing demo profile.");
}

const xmppConfig = profile.toConfig().xmpp;
if (!xmppConfig?.username) {
  throw new Error("Demo profile missing XMPP config.");
}

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({
  xmppConfig,
  roomJid: profile.roomJid,
  nickname: profile.nickname,
  provider: new EchoProvider(),
  negotiator
});

await runner.start();
