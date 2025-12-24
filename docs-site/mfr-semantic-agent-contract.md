# MFR Semantic Agent Contract

This document defines the expected behavior of the MFR Semantic agent, the constraint-focused role used during Model-First Reasoning sessions.

## Role Summary

The MFR Semantic agent extracts constraints and domain rules from the problem description and contributes them as RDF to the shared model.

## Inputs

- `mfr:ModelContributionRequest` messages.
- Problem description text in the request payload.

## Outputs

- RDF/Turtle contributions in `lng:ModelFirstRDF` mode:
  - `mfr:Constraint` nodes
  - Optional `mfr:DomainRule` nodes

## Required Lingue Modes

- `lng:ModelNegotiation` to receive protocol messages.
- `lng:ModelFirstRDF` to return RDF contributions.

## Contribution Responsibilities

### Constraint Identification

- Extract explicit constraints and requirements.
- Emit `mfr:Constraint` nodes with descriptions and severity hints.

### Domain Rules

- Extract policy, regulatory, or invariants when present.
- Emit `mfr:DomainRule` nodes with concise descriptions.

## Message Expectations

### Input Payload

- `sessionId`
- `problemDescription`
- `requestedContributions`

### Output Payload

- Turtle RDF with `mfr:contributedBy`.
- Include `sessionId` metadata in the Lingue stanza.

## Error Handling

- If extraction fails, return an empty payload rather than malformed RDF.
- If API calls fail, continue with heuristic extraction.

## Configuration Sources

- XMPP account from RDF profile + `config/agents/secrets.json`.
- Mistral API key and model from RDF profile and `.env` when configured.

## Success Criteria

- At least one constraint contribution for problems containing explicit rules.
- RDF payload is valid Turtle and scoped to the session ID.
