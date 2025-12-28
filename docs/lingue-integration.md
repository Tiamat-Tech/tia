# Lingue Integration Guide

Status: maintained; review after major changes.

Lingue is a lightweight protocol layer for negotiating language modes and
exchanging structured payloads (RDF, JSON, Prolog) over XMPP. In TIA it powers
structured agent-to-agent coordination while keeping human-readable summaries
in the room.

This guide describes how to advertise Lingue capabilities, negotiate modes, and exchange structured payloads.

## Capability Advertisement

Agents should advertise Lingue support via XEP-0030 disco#info. Features are defined in `src/lib/lingue/constants.js`.

Example features:
- `http://purl.org/stuff/lingue/feature/lang/human-chat`
- `http://purl.org/stuff/lingue/feature/lang/ibis-text`
- `http://purl.org/stuff/lingue/feature/lang/prolog-program`
- `http://purl.org/stuff/lingue/feature/lang/profile-exchange`
- `http://purl.org/stuff/lingue/feature/lang/sparql-query`
- `http://purl.org/stuff/lingue/feature/lang/model-first-rdf`
- `http://purl.org/stuff/lingue/feature/lang/model-negotiation`
- `http://purl.org/stuff/lingue/feature/lang/shacl-validation`

## Profile Declarations

Add Lingue properties to each agent in `config/agents/*.ttl`:

```turtle
@prefix lng: <http://purl.org/stuff/lingue/> .

<#agent> a lng:Agent ;
  lng:supports lng:HumanChat, lng:IBISText ;
  lng:prefers lng:HumanChat ;
  lng:profile <#agent-lingue-profile> .
```

## Negotiation Flow

1. Sender offers one or more modes.
2. Receiver selects a supported mode.
3. Both sides store the active mode for the peer.

The `LingueNegotiator` handles offer/accept stanzas and routes structured messages via handlers.

## Handlers

Handlers implement mode-specific payloads:
- `HumanChatHandler` - text/plain
- `IBISTextHandler` - text/plain + text/turtle payload
- `PrologProgramHandler` - text/x-prolog payload
- `ProfileExchangeHandler` - text/turtle payload
- `SparqlQueryHandler` - application/sparql-query payload
- `ModelFirstRdfHandler` - text/turtle payload (MFR contributions)
- `ModelNegotiationHandler` - application/json payload (MFR negotiation)
- `ShaclValidationHandler` - application/json payload (MFR validation)

Register handlers based on `profile.supportsLingueMode()` and pass them into `LingueNegotiator`.

## ASK/TELL Semantics

Use IBIS RDF for ASK/TELL:
- `ASK` maps to `ibis:Issue` or `ibis:Question`
- `TELL` maps to `ibis:Position` or `ibis:Argument`

Keep MUC messages human-readable with a short `summary` plus payload attachments.

## Prolog Agent Notes

The Prolog agent uses tau-prolog and supports:
- `tell <clauses>` to load clauses into the session.
- `ask <query>` to run a query.
- Inline program + query using `?-` (program above, query below).

The Lingue `PrologProgram` handler can carry program text in structured payloads.

## MFR Session Runner Notes

`src/examples/run-mfr-session.js` does not use Lingue negotiation. It joins the
coordinator MUC and sends a plain text `mfr-start <problem>` command. The
coordinator replies with plain text summaries, while agent-to-agent MFR
messages can use Lingue modes when profiles enable them.

## MFR Lingue Modes In Use

The following profiles currently enable MFR Lingue modes (as defined in
`config/agents/*.ttl`), so their services register the matching handlers at
startup:

- `config/agents/coordinator.ttl` - ModelFirstRDF, ModelNegotiation, ShaclValidation
- `config/agents/mfr-semantic.ttl` - ModelFirstRDF, ModelNegotiation
- `config/agents/mistral.ttl` - ModelFirstRDF, ModelNegotiation
- `config/agents/prolog.ttl` - ModelFirstRDF, ModelNegotiation
- `config/agents/data.ttl` - ModelFirstRDF, ModelNegotiation
- `config/agents/semem.ttl` - ModelFirstRDF, ModelNegotiation, ShaclValidation
