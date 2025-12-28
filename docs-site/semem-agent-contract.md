# Semem Agent Contract

Status: maintained; review after major changes.

This document defines the expected behavior of the Semem agent for MCP-backed `tell/ask/augment` workflows.

## Role Summary

The Semem agent stores and retrieves knowledge using an MCP-backed semantic memory service.

## Inputs

- Direct or MUC messages addressed to the Semem agent.
- Commands prefixed with:
  - `Semem tell <text>`
  - `Semem ask <question>`
  - `Semem augment <text>`

## Outputs

- Confirmation of stored facts for `tell`.
- Natural language responses for `ask`.
- Extracted concepts/augmentations for `augment`.

## Required Lingue Modes

- `lng:HumanChat` for command parsing and responses.
- `lng:IBISText` for optional structured summaries when enabled.

## Command Responsibilities

### tell

- Store the provided text via the Semem service.
- Return a short acknowledgment.

### ask

- Query the Semem service for relevant memory.
- Return a concise answer or a fallback if nothing is found.

### augment

- Extract entities and concepts from text via Semem.
- Return a short list or sentence summary of extracted items.

## Error Handling

- If the Semem service is unavailable, return a clear error message.
- If auth fails, report missing/invalid token.

## Configuration Sources

- XMPP account from RDF profile + `config/agents/secrets.json`.
- Semem service endpoint and auth token from `.env` or profile configuration.

## Success Criteria

- Commands execute without crashing and provide clear feedback.
- Semem calls are bounded by timeouts and fail gracefully.
