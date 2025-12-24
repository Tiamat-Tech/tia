# Mistral Agent Contract (MFR)

This document defines the expected behavior of the Mistral (Natural Language) agent during Model-First Reasoning (MFR) sessions.

## Role Summary

The Mistral agent interprets user problem descriptions, extracts initial entities and goals, and provides final natural-language explanations of solutions.

## Inputs

- `mfr:ModelContributionRequest` messages.
- Problem description text in the request payload.
- Optional solution objects for explanation.

## Outputs

- RDF/Turtle contributions in `lng:ModelFirstRDF` mode.
- Natural language summaries in `lng:HumanChat` mode.

## Required Lingue Modes

- `lng:ModelNegotiation` to receive protocol messages.
- `lng:ModelFirstRDF` to return RDF contributions.
- `lng:HumanChat` for explanations and user interaction.

## Contribution Responsibilities

### Problem Interpretation

- Extract core entities and goals from the problem description.
- Emit `mfr:Entity` and `mfr:Goal` nodes.

### Goal Identification

- Represent goals with clear labels and optional priorities.
- Ensure goals are traceable to the original problem.

### Action Schema Emission

- When action definitions are requested, emit a structured `mfr:ActionSchema` payload.
- Include action name, parameters, preconditions, and effects for downstream logic agents.

## Explanation Responsibilities

- Given a solution object and model summary, provide a concise explanation.
- Keep explanations grounded in the model and constraints.

## Negotiation Responsibilities

- On `mfr:SessionComplete`, generate a natural language explanation and post it to the MUC.

## Message Expectations

### Input Payload

- `sessionId`
- `problemDescription`
- `requestedContributions`

### Output Payload

- Turtle RDF with `mfr:Entity` and `mfr:Goal` nodes.
- Include `sessionId` metadata in the Lingue stanza.

## Error Handling

- If extraction fails, return a minimal goal summary rather than silence.
- If explanation generation fails, return a brief fallback message.

## Configuration Sources

- XMPP account from RDF profile + `config/agents/secrets.json`.
- Mistral API key and model from `.env` or profile configuration.

## Success Criteria

- At least one goal contribution when the problem includes an objective.
- Final explanation is concise and refers to the explicit model.
