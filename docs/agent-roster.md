# Agent Roster

Status: maintained; review after major changes.

This roster lists the agent profiles shipped in `config/agents/*.ttl`, with short notes
on what each agent is responsible for during normal runs.

## Core Orchestration

- **Coordinator** (`coordinator`) - Orchestrates planning polls, debate/consensus workflows,
  and MFR sessions; assembles final solutions and emits trace metadata.
- **Chair** (`chair`) - Moderates debates, polls for Positions/Support/Objection, and
  keeps the discussion structured.
- **Recorder** (`recorder`) - Captures meeting minutes and verbose traces (log room focus).

## Reasoning & Knowledge

- **Mistral** (`mistral`) - General-purpose LLM agent for extraction, summarization, and IBIS.
- **Mistral Analyst** (`mistral-analyst`) - Analytical variant for deeper breakdowns.
- **Mistral Creative** (`mistral-creative`) - Creative variant for ideation prompts.
- **GroqBot** (`groqbot`) - LLM agent backed by Groq APIs.
- **Prolog** (`prolog`) - Logical reasoning and Prolog program execution.
- **Executor** (`executor`) - Translates plans into executable Prolog programs.
- **MFR Semantic** (`mfr-semantic`) - Extracts constraints and domain rules for MFR.
- **Data** (`data`) - SPARQL grounding and knowledge lookup (Wikidata/DBpedia/custom).
- **Semem** (`semem`) - Knowledge store integration (`tell/ask/augment`) via MCP endpoints.

## Adaptive & Experimental

- **Golem** (`golem`) - Adaptive role agent; can be assigned specialized roles at runtime
  (e.g., logic-focused reasoning during planning).

## Utilities & Testing

- **Demo** (`demo`) - Minimal bot for smoke tests and connectivity checks.
- **MCP Loopback** (`mcp-loopback`) - MCP echo agent for integration testing.
- **MCP Test** (`mcp-test`) - MCP profile for diagnostics or local testing.
- **Mistral Base** (`mistral-base`) - Base profile used by other Mistral variants (not a runtime agent).
