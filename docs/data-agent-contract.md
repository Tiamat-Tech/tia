# Data Agent Contract (MFR)

Status: maintained; review after major changes.

This document defines the expected behavior of the Data (Knowledge Query) agent during Model-First Reasoning (MFR) sessions.

## Role Summary

The Data agent grounds entities in external knowledge bases, contributes entity and relationship RDF, and enriches the model with factual links.

## Inputs

- `mfr:ModelContributionRequest` messages.
- Problem description text in the request payload.

## Outputs

- RDF/Turtle contributions in `lng:ModelFirstRDF` mode.
- Grounded entities and relationships:
  - `mfr:Entity`
  - `mfr:Relationship`
  - Optional `owl:sameAs`, `rdfs:label`, `rdfs:comment`

## Required Lingue Modes

- `lng:ModelNegotiation` to receive protocol messages.
- `lng:ModelFirstRDF` to return RDF contributions.

## Contribution Responsibilities

### Entity Discovery

- Extract named entities from the problem description.
- Emit `mfr:Entity` nodes with labels and `mfr:contributedBy`.

### Entity Grounding

- For each entity, attempt grounding to a public knowledge base (e.g., Wikidata).
- Emit `owl:sameAs` links and, when available, type hints.

### Relationship Discovery

- For grounded entities, query for a small set of relevant relationships.
- Emit `mfr:Relationship` nodes with subject/predicate/object hints.

## Message Expectations

### Input Payload

- `sessionId`
- `problemDescription`
- `requestedContributions`

### Output Payload

- Turtle RDF with `@prefix mfr:` and relevant ontology prefixes.
- Include `sessionId` metadata in the Lingue stanza.

## Error Handling

- If grounding fails, emit ungrounded entities with `mfr:groundingStatus "ungrounded"`.
- If the external endpoint is unavailable, return a partial contribution (entities only).

## Configuration Sources

- XMPP account from RDF profile + `config/agents/secrets.json`.
- SPARQL endpoint and extraction model from RDF profile.
- External API keys from `.env` (referenced by profile fields).

## Success Criteria

- At least one entity contribution for a non-empty problem description.
- Grounding links for common entities when the knowledge endpoint is reachable.
- RDF payload is valid Turtle and includes `mfr:contributedBy`.
