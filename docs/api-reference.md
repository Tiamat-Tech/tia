# API Reference (Draft)

## Core

### `AgentRunner`
```javascript
new AgentRunner({
  profile,
  xmppConfig,
  roomJid,
  nickname,
  provider,
  negotiator,
  mentionDetector,
  commandParser,
  allowSelfMessages,
  respondToAll,
  logger
})
```

### `AgentProfile`
```javascript
new AgentProfile({ identifier, nickname, type, xmppAccount, roomJid, provider, capabilities, lingue, metadata })
```

### `loadAgentProfile`
```javascript
const profile = await loadAgentProfile("mistral");
```

## Lingue

### `LingueNegotiator`
```javascript
new LingueNegotiator({ profile, xmppClient, handlers, logger })
```

### `LanguageModeHandler`
```javascript
class LanguageModeHandler { createStanza(); parseStanza(); }
```

### Constants
```javascript
import { LANGUAGE_MODES, FEATURES, MIME_TYPES } from "./lib/lingue/constants.js";
```

## Providers

### `BaseProvider`
```javascript
class BaseProvider { async handle({ command, content, metadata, reply }) {} }
```
