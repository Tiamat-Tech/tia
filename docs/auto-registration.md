# XMPP Auto-Connect & Registration

Status: maintained; review after major changes.

TIA provides automatic credential loading and connection management for agents. When an agent attempts to connect, it automatically loads credentials from `config/agents/secrets.json`, making deployment and configuration simpler.

## Features

- **Automatic credential loading**: Agents load passwords from `secrets.json` automatically
- **Simplified deployment**: No need to pass passwords via environment variables
- **Credential persistence**: Credentials are centrally managed in `config/agents/secrets.json`
- **Clear error messages**: Helpful feedback when credentials are missing or invalid

## Recommended Setup

For production use, we recommend creating accounts via `prosodyctl` on the server:

```bash
# On the Prosody server
prosodyctl register myagent tensegrity.it mypassword123
```

Then add the credentials to `config/agents/secrets.json`:
```json
{
  "xmpp": {
    "myagent": "mypassword123"
  }
}
```

## Server Setup

### Creating Accounts via Prosodyctl

The recommended way to create accounts is via `prosodyctl` on the server:

```bash
# SSH to your Prosody server
ssh user@tensegrity.it

# Register an account
prosodyctl register username tensegrity.it password123

# Verify the account
prosodyctl listusers tensegrity.it
```

### Optional: Enabling Self-Registration in Prosody

If you want to enable in-band registration (XEP-0077) for programmatic account creation:

Edit `/etc/prosody/prosody.cfg.lua`:

```lua
modules_enabled = {
    -- ... other modules ...
    "register"; -- Allow users to register accounts
}

-- Allow open registration
allow_registration = true

-- Optional: Rate limiting to prevent abuse
registration_throttle_max = 5
registration_throttle_period = 3600  -- 1 hour
```

Comment out invite-only registration:
```lua
-- "invites_register"; -- Comment this out for open registration
```

Restart Prosody:
```bash
sudo prosodyctl restart
```

## Usage

### Basic Usage (Recommended)

Create the account on the server first, then add credentials to `secrets.json`:

```javascript
import { autoConnectXmpp } from "tia-agents/lib/xmpp-auto-connect.js";

// Credentials will be loaded from config/agents/secrets.json
const { xmpp, credentials } = await autoConnectXmpp({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  autoRegister: false // Don't attempt registration
});

console.log(`Connected as ${credentials.username}`);
```

### Programmatic Registration (Client-Side)

Client-side registration via XEP-0077 in-band registration is now fully supported:

```javascript
import { registerXmppAccount, generatePassword } from "tia-agents/lib/xmpp-register.js";

const password = generatePassword(16);

const result = await registerXmppAccount({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  password,
  tls: { rejectUnauthorized: false }
});

console.log(result.message); // "Account myagent@tensegrity.it registered successfully"

// Credentials will be automatically saved if using autoConnectXmpp
```

### Auto-Registration (Fully Automatic)

The easiest approach - automatically registers if no credentials exist:

```javascript
import { autoConnectXmpp } from "tia-agents/lib/xmpp-auto-connect.js";

// If no password in secrets.json, automatically registers a new account
const { xmpp, credentials } = await autoConnectXmpp({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  autoRegister: true // Enable auto-registration
});

if (credentials.registered) {
  console.log(`New account created: ${credentials.username}`);
  console.log(`Password: ${credentials.password}`);
  console.log("Credentials saved to config/agents/secrets.json");
}
```

### With XmppRoomAgent

```javascript
import { autoConnectXmpp } from "tia-agents/lib/xmpp-auto-connect.js";
import { XmppRoomAgent } from "tia-agents/lib/xmpp-room-agent.js";

// First, auto-connect (registers if needed)
const { credentials } = await autoConnectXmpp({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  autoRegister: true
});

// Then create agent with credentials
const agent = new XmppRoomAgent({
  xmppConfig: {
    service: "xmpp://tensegrity.it:5222",
    domain: "tensegrity.it",
    username: credentials.username,
    password: credentials.password,
    tls: { rejectUnauthorized: false }
  },
  roomJid: "general@conference.tensegrity.it",
  nickname: "MyAgent",
  onMessage: async (payload) => {
    console.log(`Message from ${payload.sender}: ${payload.body}`);
  }
});

await agent.start();
```

### Manual Registration

If you want to register an account manually:

```javascript
import { registerXmppAccount, generatePassword } from "tia-agents/lib/xmpp-register.js";

const password = generatePassword(16); // Generate secure random password

const result = await registerXmppAccount({
  service: "xmpp://tensegrity.it:5222",
  domain: "tensegrity.it",
  username: "myagent",
  password,
  tls: { rejectUnauthorized: false }
});

console.log(result.message); // "Account myagent@tensegrity.it registered successfully"
```

## Configuration Options

### `autoConnectXmpp(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `service` | string | required | XMPP service URL (e.g., `xmpp://host:5222`) |
| `domain` | string | required | XMPP domain |
| `username` | string | required | Username to register/login |
| `password` | string | optional | Password (if omitted, triggers registration) |
| `resource` | string | optional | XMPP resource identifier |
| `tls` | object | `{rejectUnauthorized: false}` | TLS configuration |
| `secretsPath` | string | `config/agents/secrets.json` | Path to secrets file |
| `autoRegister` | boolean | `true` | Enable auto-registration |
| `logger` | object | `console` | Logger instance |

### `registerXmppAccount(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `service` | string | required | XMPP service URL |
| `domain` | string | required | XMPP domain |
| `username` | string | required | Desired username |
| `password` | string | required | Desired password |
| `tls` | object | `{rejectUnauthorized: false}` | TLS configuration |
| `logger` | object | `console` | Logger instance |

## Credential Storage

Registered credentials are automatically saved to `config/agents/secrets.json`:

```json
{
  "xmpp": {
    "myagent": "generated-password-here",
    "anotheragent": "another-password"
  }
}
```

This file is `.gitignore`d to prevent credentials from being committed.

## Integration Testing

Run integration tests against tensegrity.it:

```bash
RUN_TENSEGRITY_TESTS=true npm test -- xmpp-auto-register
```

The test suite will:
1. Generate a unique test username
2. Register the account automatically
3. Verify credentials are saved
4. Test reconnection using saved credentials
5. Verify the account can join MUC rooms and send messages
6. Test registration conflict handling
7. Clean up test artifacts

## Error Handling

Common errors and solutions:

### Registration Not Allowed

```
Error: Registration not allowed on this server
```

**Solution**: Enable the `register` module in Prosody and set `allow_registration = true`

### Username Already Exists

```
Error: Username myagent already exists
```

**Solution**: Choose a different username or use the existing credentials

### Server Does Not Support Registration

```
Error: Server does not support registration
```

**Solution**: The XMPP server doesn't implement XEP-0077. Register accounts manually via `prosodyctl`:

```bash
prosodyctl register myagent tensegrity.it mypassword
```

## Security Considerations

1. **Password Strength**: Auto-generated passwords are 16 characters, alphanumeric
2. **Secrets File**: `config/agents/secrets.json` must be protected with appropriate file permissions
3. **Rate Limiting**: Configure `registration_throttle_max` in Prosody to prevent abuse
4. **Production Use**: Consider using manual registration or external authentication for production deployments

## MCP Agent Example

The MCP agent can use auto-registration for easier deployment:

```bash
# No password needed - will auto-register
XMPP_SERVICE=xmpp://tensegrity.it:5222 \
XMPP_DOMAIN=tensegrity.it \
AGENT_PROFILE=mcp-loopback \
node src/services/mcp-loopback-agent.js
```

The agent will:
1. Check for existing credentials in `config/agents/secrets.json`
2. If not found, register a new account
3. Save credentials for future use
4. Connect and join the configured MUC room

## API Reference

### generatePassword(length)

Generates a cryptographically secure random password.

**Parameters:**
- `length` (number, default: 16): Password length

**Returns:** string - Random password

**Example:**
```javascript
import { generatePassword } from "tia-agents/lib/xmpp-register.js";

const password = generatePassword(20);
console.log(password); // "a3B9xP2mQ7nK5fL8wR4t"
```

## See Also

- [Agent Configuration](agents.md) - Configuring agent profiles
- [Testing](testing.md) - Running integration tests
- [XEP-0077: In-Band Registration](https://xmpp.org/extensions/xep-0077.html) - XMPP specification
