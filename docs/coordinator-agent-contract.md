# Coordinator Agent Contract (MFR)

Status: maintained; review after major changes.

This document defines the expected behavior of the Coordinator agent during Model-First Reasoning (MFR) sessions.

## Role Summary

The Coordinator orchestrates the MFR protocol, manages session state, validates the merged model, requests solutions, and returns the final synthesized response.

## Inputs

- User request in the primary room (MUC).
- MFR model contributions (RDF/Turtle) from other agents.
- Optional conflict resolution or validation feedback from agents.

## Outputs

- MFR protocol messages:
  - `mfr:ModelContributionRequest`
  - `mfr:ModelValidationResult`
  - `mfr:SolutionRequest`
  - `mfr:SessionComplete`
- Human-readable status updates in the primary room.
- Final solution summary and explanation to the user.

## Required Lingue Modes

- `lng:ModelNegotiation` for protocol messages.
- `lng:ModelFirstRDF` for RDF contributions.
- `lng:HumanChat` for user-visible updates.

## Phase Responsibilities

### 1. Problem Interpretation

- Accept `mfr-start <problem>` commands in the primary room.
- Accept `debate <problem>` (or `Q:` shorthand) to start a tool-selection debate via Chair.
- Create a session ID and initialize session state.
- If debate is enabled, wait for consensus or timeout before requesting contributions.
- Broadcast `mfr:ModelContributionRequest` with the session ID and problem text.

### 2. Model Construction

- Collect RDF contributions from agents.
- Track contributions by agent and session.
- Trigger merge when the contribution window ends or sufficient data arrives.

### 3. Model Merge & Validation

- Merge RDF graphs into a single model.
- Validate the model using SHACL shapes.
- If validation fails, enter conflict negotiation and request fixes.

### 4. Constrained Reasoning

- Broadcast `mfr:SolutionRequest` with the validated model.
- Collect solution proposals from agents.
- Perform solution ranking or synthesis when multiple proposals exist.

### 5. Completion

- Emit `mfr:SessionComplete` with the final solution payload.
- Provide a concise human-readable summary in the primary room.

## Message Expectations

### Contribution Request

Payload:
- `sessionId`
- `problemDescription`
- `requestedAgents` (optional list when debate selects tools)
- `requestedContributions` (entity, constraint, action, goal)

### Contribution Response

- `lng:ModelFirstRDF` payload in Turtle.
- Include `sessionId` metadata.

### Solution Request

- `sessionId`
- `model` (Turtle)

### Session Complete

- `sessionId`
- `solutions` (array or single synthesized solution)

## Error Handling

- If a session stalls, emit a timeout status in the primary room.
- If validation fails, include a clear SHACL summary and next steps.
- If no solutions arrive, report a reasoned failure status.

## Configuration Sources

- XMPP account and rooms from RDF profile + `config/agents/secrets.json`.
- SHACL shapes path from RDF profile.
- Timeout values from RDF profile.

## Success Criteria

- All contribution requests are sent to the primary room and relevant MFR rooms.
- Validated model is produced or a validation report is returned.
- Final response includes both the structured result and a human-readable explanation.
