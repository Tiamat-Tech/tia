# Provider Guide

Status: maintained; review after major changes.

This guide explains how to create custom providers for tia-agents. Providers handle incoming messages and generate responses.

## Table of Contents

- [Provider Basics](#provider-basics)
- [BaseProvider Interface](#baseprovider-interface)
- [Simple Provider Example](#simple-provider-example)
- [LLM Integration Pattern](#llm-integration-pattern)
- [History Management](#history-management)
- [Error Handling](#error-handling)
- [Testing Providers](#testing-providers)
- [Advanced Topics](#advanced-topics)

---

## Provider Basics

A **provider** is a class that implements the message handling logic for your bot. It receives messages, processes them, and returns responses.

### Key Concepts

- Providers extend `BaseProvider` from tia-agents
- The `handle()` method is called for each message
- Providers are stateful - maintain conversation history, API clients, etc.
- Providers are framework-agnostic - use any API or logic you want

---

## BaseProvider Interface

All providers must extend `BaseProvider` and implement the `handle()` method:

```javascript
import { BaseProvider } from "tia-agents";

class MyProvider extends BaseProvider {
  async handle({ command, content, metadata, reply, rawMessage }) {
    // Your logic here
    return "response string";
  }
}
```

### handle() Parameters

The `handle()` method receives an object with:

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | string | Command type: "chat", "ask", "tell", "augment", etc. |
| `content` | string | Message content (without command prefix) |
| `metadata` | object | `{ sender, type, roomJid }` - message metadata |
| `reply` | async function | For multi-part responses: `await reply(text)` |
| `rawMessage` | string | Original full message (before parsing) |

### handle() Return Value

- **String**: The response to send back
- **Null/Falsy**: Silent operation (no response sent)

---

## Simple Provider Example

Let's build a simple echo provider:

```javascript
import { BaseProvider } from "tia-agents";

export class EchoProvider extends BaseProvider {
  constructor({ nickname = "EchoBot", logger = console } = {}) {
    super();
    this.nickname = nickname;
    this.logger = logger;
  }

  async handle({ command, content, metadata }) {
    this.logger.info(`Received: ${command} - ${content}`);

    // Only respond to chat commands
    if (command !== "chat") {
      return `${this.nickname} only supports chat; try "${this.nickname.toLowerCase()}: <message>"`;
    }

    const sender = metadata.sender || "someone";
    return `@${sender} You said: ${content}`;
  }
}
```

### Usage

```javascript
import { createSimpleAgent } from "tia-agents";
import { EchoProvider } from "./echo-provider.js";

const runner = createSimpleAgent({
  xmppConfig: { /* ... */ },
  roomJid: "general@conference.xmpp",
  nickname: "EchoBot",
  provider: new EchoProvider({ nickname: "EchoBot" })
});

await runner.start();
```

---

## LLM Integration Pattern

Integrating with language model APIs follows this pattern:

```javascript
import { BaseProvider } from "tia-agents";
import { Mistral } from "@mistralai/mistralai";

export class MistralProvider extends BaseProvider {
  constructor({
    apiKey,
    model = "mistral-small-latest",
    nickname = "MistralBot",
    systemPrompt = null,
    historyStore = null,
    logger = console
  }) {
    super();

    if (!apiKey) {
      throw new Error("API key is required");
    }

    this.client = new Mistral({ apiKey });
    this.model = model;
    this.nickname = nickname;
    this.systemPrompt = systemPrompt || `You are ${nickname}, a helpful assistant.`;
    this.historyStore = historyStore;
    this.logger = logger;
  }

  async handle({ command, content, metadata }) {
    if (command !== "chat") {
      return `${this.nickname} only supports chat`;
    }

    try {
      // Build message array
      const messages = [
        { role: "system", content: this.systemPrompt }
      ];

      // Add history
      if (this.historyStore) {
        const history = await this.historyStore.getHistory();
        messages.push(...history.map(entry => ({
          role: entry.role === "bot" ? "assistant" : "user",
          content: entry.content
        })));
      }

      // Add current message
      messages.push({ role: "user", content });

      // Call API
      const response = await this.client.chat.complete({
        model: this.model,
        messages
      });

      const aiResponse = response.choices[0].message.content;

      // Store in history
      if (this.historyStore) {
        await this.historyStore.addEntry({
          role: "user",
          content,
          sender: metadata.sender
        });
        await this.historyStore.addEntry({
          role: "bot",
          content: aiResponse
        });
      }

      return aiResponse;

    } catch (error) {
      this.logger.error("LLM error:", error);
      return "Sorry, I encountered an error processing your message.";
    }
  }
}
```

### Key Patterns

1. **API Client Initialization**: Create client in constructor
2. **System Prompts**: Define bot personality/instructions
3. **History Management**: Use historyStore to maintain context
4. **Error Handling**: Catch API errors, return friendly messages
5. **Logging**: Use logger for debugging

---

## History Management

Use `InMemoryHistoryStore` for conversation context:

```javascript
import { InMemoryHistoryStore } from "tia-agents";

const historyStore = new InMemoryHistoryStore({
  maxEntries: 40  // Keep last 40 messages
});

// In your provider
await this.historyStore.addEntry({
  role: "user",  // or "bot"
  content: "message text",
  sender: "username"
});

const history = await this.historyStore.getHistory();
// Returns: [{ role, content, sender, timestamp }, ...]
```

### Custom History Store

Implement your own for persistence:

```javascript
import { HistoryStore } from "tia-agents";

export class DatabaseHistoryStore extends HistoryStore {
  async addEntry(entry) {
    // Store in database
  }

  async getHistory() {
    // Retrieve from database
    return entries;
  }

  async clear() {
    // Clear database entries
  }
}
```

---

## Error Handling

Always handle errors gracefully:

```javascript
async handle({ command, content, metadata }) {
  try {
    // Your logic
    const result = await someAsyncOperation(content);
    return result;

  } catch (error) {
    // Log the error
    this.logger.error("Error processing message:", error);

    // Return user-friendly message
    if (error.code === "API_LIMIT") {
      return "Sorry, I've reached my API limit. Try again later.";
    }

    return "Sorry, I encountered an error. Please try again.";
  }
}
```

### Best Practices

- ✅ Log errors with context (use `this.logger.error()`)
- ✅ Return user-friendly error messages
- ✅ Don't expose internal details or stack traces to users
- ✅ Handle specific error cases (rate limits, timeouts, etc.)
- ❌ Don't let errors crash the bot

---

## Multi-Part Responses

Use `reply()` for streaming or multi-part responses:

```javascript
async handle({ command, content, metadata, reply }) {
  if (command !== "chat") {
    return "I only support chat";
  }

  // Send first part
  await reply("Let me think about that...");

  // Do processing
  const result = await heavyComputation(content);

  // Send final response
  await reply(`Here's my answer: ${result}`);

  // Return value is optional when using reply()
  return null;
}
```

---

## Testing Providers

### Unit Testing

```javascript
import { describe, it, expect } from "vitest";
import { EchoProvider } from "./echo-provider.js";

describe("EchoProvider", () => {
  it("echoes message back to sender", async () => {
    const provider = new EchoProvider({ nickname: "TestBot" });

    const result = await provider.handle({
      command: "chat",
      content: "hello world",
      metadata: { sender: "alice" }
    });

    expect(result).toBe("@alice You said: hello world");
  });

  it("rejects non-chat commands", async () => {
    const provider = new EchoProvider({ nickname: "TestBot" });

    const result = await provider.handle({
      command: "ask",
      content: "question",
      metadata: { sender: "bob" }
    });

    expect(result).toContain("only supports chat");
  });
});
```

### Integration Testing

Test with a real bot runner (see `test/` directory for examples).

---

## Advanced Topics

### Command Routing

Handle multiple command types:

```javascript
async handle({ command, content, metadata }) {
  switch (command) {
    case "chat":
      return await this.handleChat(content, metadata);

    case "ask":
      return await this.handleQuestion(content, metadata);

    case "tell":
      return await this.handleKnowledge(content, metadata);

    default:
      return `Unknown command: ${command}`;
  }
}
```

### State Management

Maintain per-user state:

```javascript
constructor({ nickname, logger } = {}) {
  super();
  this.nickname = nickname;
  this.logger = logger;
  this.userStates = new Map();  // user -> state
}

async handle({ command, content, metadata }) {
  const sender = metadata.sender;

  if (!this.userStates.has(sender)) {
    this.userStates.set(sender, { count: 0 });
  }

  const userState = this.userStates.get(sender);
  userState.count++;

  return `Hello ${sender}, this is message #${userState.count} from you`;
}
```

### Lingue Protocol Support

For advanced language mode negotiation, providers can expose disco features:

```javascript
import { attachDiscoInfoResponder, FEATURES } from "tia-agents/lingue";

constructor({ xmppClient, ...options }) {
  super();
  // ... initialization

  if (xmppClient) {
    attachDiscoInfoResponder(xmppClient, {
      features: [
        FEATURES.LANG_HUMAN_CHAT,
        FEATURES.LANG_IBIS_TEXT
      ]
    });
  }
}
```

See the [API Reference](./api-reference.md#lingue) for details.

---

## Provider Examples

The package includes several providers for reference:

| Provider | Location | Purpose |
|----------|----------|---------|
| DemoProvider | `tia-agents/providers/demo` | Simple mock responses |
| BaseProvider | `tia-agents/providers/base` | Abstract base class |
| MistralProvider | `src/agents/providers/mistral-provider.js` | Mistral AI integration |

Check `templates/providers/` for additional templates.

---

## Next Steps

- Review [API Reference](./api-reference.md) for complete API details
- Explore `src/agents/providers/` for real-world examples
- Join the discussion on [GitHub Issues](https://github.com/danja/tia/issues)

## Summary

Creating a custom provider:

1. Extend `BaseProvider`
2. Implement `async handle({ command, content, metadata, reply })`
3. Return a string response or null
4. Handle errors gracefully
5. Use historyStore for conversation context
6. Test thoroughly

That's it! You now have the knowledge to create sophisticated bot providers.
