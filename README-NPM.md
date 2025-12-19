# TIA Agents Library

This package exposes the core TIA agent runner plus Lingue negotiation utilities.

## Install

```
npm install tia-agents
```

## Minimal Usage

```javascript
import { AgentRunner, LingueNegotiator, LINGUE, Handlers } from "tia-agents";

class EchoProvider {
  async handle({ content, reply }) {
    await reply(`Echo: ${content}`);
  }
}

const negotiator = new LingueNegotiator({
  profile,
  handlers: {
    [LINGUE.LANGUAGE_MODES.HUMAN_CHAT]: new Handlers.HumanChatHandler()
  }
});

const runner = new AgentRunner({ profile, provider: new EchoProvider(), negotiator });
await runner.start();
```

## Exports

- `AgentRunner`
- `LingueNegotiator`
- `LINGUE` constants
- `Handlers` (HumanChat, IBIS, Prolog, ProfileExchange)
- `BaseProvider`
