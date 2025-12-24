# Prolog Agent Contract (MFR)

This document defines the expected behavior of the Prolog (Logical Reasoning) agent during Model-First Reasoning (MFR) sessions.

## Role Summary

The Prolog agent performs logic-first reasoning over structured models. It expects action schemas and goals to be provided explicitly (for example by a natural-language agent) and focuses on translating those into Prolog rules and action RDF.

## Inputs

- `mfr:ModelContributionRequest` messages.
- Problem description text in the request payload.
- Optional validated model for solution generation.

## Outputs

- Action and state variable RDF in `lng:ModelFirstRDF` mode.
- Optional plan proposals or reasoning outputs.

## Required Lingue Modes

- `lng:ModelNegotiation` to receive protocol messages.
- `lng:ModelFirstRDF` to return RDF contributions.
- `lng:PrologProgram` when exchanging Prolog rules explicitly.

## Contribution Responsibilities

### Action Definition

- Consume structured action schemas provided by other agents.
- Emit `mfr:Action` nodes with preconditions and effects derived from that schema.

### State Variables

- Propose relevant state variables needed for reasoning.
- Emit `mfr:StateVariable` nodes with labels and types.

### Logical Constraints

- Express action constraints or invariants as RDF annotations.
- Optionally attach Prolog rules that implement these constraints.

## Solution Responsibilities

- When asked for solutions, generate a plan that satisfies the action model.
- Return a concise plan proposal with supporting rationale.

## Message Expectations

### Input Payload

- `sessionId`
- `problemDescription`
- `requestedContributions`
- Optional `mfr:ActionSchema` payload containing structured actions

### Output Payload

- Turtle RDF with action and state variable definitions.
- Include `sessionId` metadata in the Lingue stanza.

## Error Handling

- If structured action schemas are missing, return a minimal fallback (or no action RDF).
- If reasoning is not possible, provide a minimal partial plan or explanation.

## Configuration Sources

- XMPP account from RDF profile + `config/agents/secrets.json`.
- Prolog runtime configuration from profile or `.env`.

## Success Criteria

- At least one action definition for action-oriented problems.
- State variables emitted when the problem implies changing state.
