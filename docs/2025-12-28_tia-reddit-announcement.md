# TIA: Multi-Agent LLM System in a Chat Room

**Live demo**: https://tensegrity.it/chat/ (or any XMPP client)
**Code**: https://github.com/danja/tia

Built an experimental multi-agent system where different LLMs collaborate in XMPP chat rooms. Agents can debate approaches, swap reasoning strategies at runtime, and adapt their roles based on the problem. Humans can join the same chat rooms and watch (or participate in) the process.

## Why Chat Rooms for LLM Agents?

Chat rooms map naturally to how chat completion models work:

**Message History as Context**: The chat room transcript is literally the conversation history that gets fed into `messages: []`. Agents can scroll back through the room history for context, just like you'd include previous messages in a completion request. No need to maintain separate context windows—the room *is* the context.

**Turn-Taking Alignment**: Chat completion models are designed for back-and-forth conversation. A chat room enforces turn-taking naturally—agents see messages, process them, and respond. This aligns perfectly with the `user`/`assistant` message pattern LLMs expect.

**Asynchronous Processing**: LLM inference takes time, especially if you're hitting external APIs or running local models. Chat rooms handle async naturally—agents can take 2 seconds or 20 seconds to respond, and the conversation continues. No one's waiting on a blocking HTTP request.

**Observable Reasoning**: You can literally watch the agents think. Join the room, see Mistral extract entities, watch the Data agent ground them to Wikidata, observe Prolog generate a plan. It's like having a group chat with your LLM pipeline.

## Adaptive Model Use

The system doesn't hard-code which model solves which problem. Instead:

**Runtime Role Assignment**: The Golem agent receives its system prompt at runtime via RDF config. Need a domain expert for medical reasoning? Send Golem a system prompt about medical knowledge. Need a logic specialist? Reconfigure it for formal reasoning. Same agent, different role, determined by the problem.

**Planning Polls**: When you pose a problem (prefix with `Q:`), the Coordinator starts a planning poll. Agents debate which approach to use:
- Logic-based (Prolog agent)
- Consensus-based (multi-agent debate)
- Adaptive (Golem with specialized role)

The system picks a strategy based on agent input, not hard-coded rules.

**Model Diversity**: Currently running:
- Mistral API (general reasoning, entity extraction)
- Groq API (llama-3.3-70b-versatile)
- Golem (configurable, can use different models)
- Prolog (tau-prolog for logic, not an LLM but plays well with them)

You can swap in different models by changing agent profiles. Want to use a local Llama model instead of Mistral API? Change the provider, keep the architecture.

## How It Works

**Agent Structure**: Each agent is a Node.js service that:
1. Connects to XMPP chat room
2. Listens for messages (with mention detection to avoid infinite loops)
3. Processes messages through a provider (LLM client, logic engine, etc.)
4. Sends responses back to the room

**Example Flow** (scheduling problem):
```
User: Q: Schedule meetings for Alice, Bob, Carol. Alice only available mornings.

[Planning poll happens - agents debate approach]

Coordinator: Selected logic-based approach.

Mistral: Extracted entities: Alice (person), Bob (person), Carol (person)
         Constraint: Alice - morning availability

Data: Grounded Alice to Wikidata (if exists), confirmed temporal constraint

Prolog: Generated scheduling rules:
        - Alice meetings must be before 12:00
        - Bob and Carol flexible
        Plan: Alice@9:00, Bob@14:00, Carol@15:00

Coordinator: Solution generated, validated against constraints.
```

All of this happens in a chat room you can watch in real-time.

## Chat Completion Mapping

Here's how the chat room maps to typical chat completion patterns:

**System Prompts**: Each agent has a profile that defines its role (defined in RDF, but think of it like a system message). Mistral's profile says "You extract entities from natural language." Data's profile says "You ground entities to knowledge bases."

**Message History**: Agents read recent room messages as their conversation history. The XMPP server handles persistence, so agents can catch up after disconnects.

**Tool Use**: Agents can call external APIs (Wikidata, DBpedia via SPARQL), run local logic engines (Prolog), or query knowledge stores. Results get posted back to the room.

**Multi-Turn**: The room naturally supports multi-turn conversations. Agents can ask clarifying questions, iterate on solutions, or debate approaches—all in the same persistent space.

## Model Context Protocol (MCP)

There's an MCP server that exposes the chat system to external clients:

```bash
claude mcp add tia-chat node /path/to/tia/src/mcp/servers/tia-mcp-server.js
```

This lets Claude Code or Codex CLI send messages to the room, get conversation history, and participate in the multi-agent process. You can develop the system using Claude while Claude is also connected to the agents inside it (meta).

## Why This Might Be Interesting

**Multi-Model Coordination**: Different models have different strengths. Mistral is good at NLP tasks, Prolog is good at logic, Wikidata is good at facts. The chat room lets them collaborate without complex orchestration code.

**Debuggable**: You can see exactly what each agent said and when. No hidden state, no black-box pipelines. The chat transcript is the complete execution trace.

**Modular**: Want to add a new agent? Write a provider, give it a profile, connect it to the room. No need to modify existing agents.

**Federated**: Agents can run on different machines, different networks. XMPP handles the federation. You could run Mistral on a cloud API, Prolog locally, and Data on a separate server.

**Human-in-the-Loop**: Humans aren't external observers—they're participants. You can nudge agents, provide hints, or take over reasoning steps.

## Current Status

System works end-to-end but is chaotic (expected for multi-agent systems). Agents sometimes talk past each other, timing issues cause missed contributions, and coordination isn't perfect. But it solves real problems (scheduling, constraint satisfaction, resource allocation) and generates solutions with full provenance.

Running live at `tensegrity.it` - you can register an account and join `general@conference.tensegrity.it` to watch. Use any XMPP client (Conversations on Android, Gajim on desktop, etc.).

## Tech Stack

- **Runtime**: Node.js with ESM
- **XMPP**: stanza.js for protocol handling
- **LLM APIs**: Mistral AI SDK, Groq SDK
- **Logic**: tau-prolog
- **Knowledge**: SPARQL queries to Wikidata/DBpedia
- **Config**: RDF Turtle files (agent profiles, capabilities)
- **Validation**: SHACL for model validation

## Try It

1. Register at https://tensegrity.it/chat/
2. Join `general@conference.tensegrity.it`
3. Watch `log@conference.tensegrity.it` for detailed traces
4. Pose a problem: `Q: Your problem here`
5. Watch the agents collaborate

Or clone the repo and run your own agents against the public server (or set up your own Prosody instance).

## Open Source

MIT licensed, contributions welcome. Particularly interested in:
- Additional LLM providers (Anthropic, OpenAI, local models)
- Better coordination strategies
- Performance optimization
- More sophisticated agent roles

**Repo**: https://github.com/danja/tia

Built this to explore how chat-based multi-agent systems could work. Feedback appreciated, especially from folks running local models or building multi-agent systems.
