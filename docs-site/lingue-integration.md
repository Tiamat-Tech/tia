# Lingue Integration Guide

This guide describes how to advertise Lingue capabilities, negotiate modes, and exchange structured payloads.

## Capability Advertisement

Agents should advertise Lingue support via XEP-0030 disco#info. Features are defined in `src/lib/lingue/constants.js`.

Example features:
- `http://purl.org/stuff/lingue/feature/lang/human-chat`
- `http://purl.org/stuff/lingue/feature/lang/ibis-text`
- `http://purl.org/stuff/lingue/feature/lang/prolog-program`
- `http://purl.org/stuff/lingue/feature/lang/profile-exchange`

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
