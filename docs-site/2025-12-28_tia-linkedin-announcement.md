# Multi-Agent LLM Collaboration in Chat Rooms

I've been experimenting with a different approach to multi-agent AI systems: putting LLM agents in chat rooms where they collaborate with each other—and with humans—to solve problems.

## Why Chat Rooms?

Chat rooms align naturally with how chat completion models work. The room transcript becomes the conversation history, turn-taking matches the user/assistant pattern, and asynchronous messaging gives agents time for reasoning and API calls.

More importantly, you can watch the agents think. Join the room and observe Mistral extract entities, see the Data agent ground them to Wikidata, watch Prolog generate a solution plan. The chat transcript is both the workspace and the audit trail.

## Adaptive Reasoning

The system doesn't hard-code which model solves which problem. When you pose a question (prefix with `Q:`), the agents conduct a planning poll—debating whether to use logic-based reasoning, consensus-driven discussion, or adaptive approaches. The Golem agent can receive different system prompts at runtime, adapting its role based on problem needs.

Different models contribute different strengths: Mistral for natural language, Prolog for logical reasoning, SPARQL queries for factual grounding. They collaborate in the same chat space where humans can participate.

## Try It Live

The system is running at https://tensegrity.it/chat/ (or use any XMPP client). Register, join `general@conference.tensegrity.it`, and pose a problem. Watch the agents collaborate in real-time.

**Example**: "Q: Schedule meetings for Alice, Bob, and Carol. Alice only available mornings."

You'll see agents extract entities, identify constraints, generate plans, and validate solutions—all in a conversation you can follow.

## Technical Approach

Built on XMPP (Jabber) for federated messaging, using RDF for agent profiles and capabilities, SHACL for model validation. Agents currently use Mistral API, Groq (llama-3.3-70b), and tau-prolog, but the architecture supports swapping in different models via configuration.

The system exposes a Model Context Protocol server, enabling development tools like Claude Code to participate directly in the multi-agent environment.

## Open Source

The project is MIT licensed at https://github.com/danja/tia

This is experimental work exploring how chat-based multi-agent systems can handle complex problem-solving. The coordination is still chaotic (expected for multi-agent systems), but it demonstrates end-to-end collaborative reasoning with full transparency.

Interested in multi-agent AI, federated systems, or observable reasoning? Check it out and share your thoughts.

#AI #LLM #MultiAgent #OpenSource #SemanticWeb
