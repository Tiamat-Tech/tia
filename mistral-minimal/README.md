# Minimal Mistral Agent

To create an XMPP agent with Mistral capabilities using the npm package, copy the contents of this dir elsewhere.
In the new dir, run :

```sh
npm install tia-agents
npm install @mistralai/mistralai
```

Copy `.env.example` to `.env` and insert your [Mistral API key](https://admin.mistral.ai/organization/api-keys).

At this point running :

```sh
node mistral-example.js
```

should launch the bot `mistral2` and have it connect to the XMPP server on `tensegrity.it` and be ready to channel messages through the Mistral API.

## Files

```sh
├── config
│   └── agents
│       ├── mistral2.ttl - defines specifics of the mistral2 agent
│       ├── mistral-base.ttl - base definitions for Mistral agents
│       └── secrets.json - contains XMPP password, if the agent is registered
├── mistral-example.js - agent runner
└── .env - contains Mistral API key (make sure this is in your .gitignore)
```

The agent `mistral2` is already registered on the server so it has a password in `secrets.json`.
To create an entirely new agent, replace all occurences of the name `mistral2` in `mistral2.ttl` and `mistral-example.js` with a name of your choosing.

When 
```sh
node mistral-example.js
```
is next run, your new agent should self-register and connect to the XMPP server.

