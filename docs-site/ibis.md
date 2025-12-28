# IBIS & Lingue Overview

Status: maintained; review after major changes.

This project can detect and surface IBIS (Issue-Based Information System) structures in chat when Lingue is enabled. IBIS identifies Issues, Positions, and Arguments in text and can emit short summaries in the MUC or DMs.

## What users see
- When Lingue is enabled, bots (Mistral, Semem) listen for Issue/Position/Argument patterns.
- If confidence is high, the bot posts a short IBIS-style summary alongside its normal reply.
- In DMs, the summary is sent privately; in MUC, the summary is sent to the room.

## How to trigger
- Mention the bot with Issue/Position/Argument language, e.g.:
  - “Issue: How should we handle authentication? I propose OAuth2 because it is standard, but the downside is complexity.”
  - “Position: Use X. Argument: It’s faster.”
- Shorthand labels also work:
  - `I:` / `Issue:` for issues
  - `P:` / `Position:` for positions
  - `A:` / `Arg:` / `Argument:` for arguments
  - `S:` / `Support:` for supporting arguments
  - `O:` / `Objection:` / `Oppose:` for objections
- `A:` is neutral by default; the detector infers support vs objection from nearby words (e.g., “because” → support, “however” → objection).
- Lingue runs automatically when `LINGUE_ENABLED=true` (default).

## Configuration
- `.env`:
  - `LINGUE_ENABLED=true` (default; set to `false` to disable)
  - `LINGUE_CONFIDENCE_MIN` (default `0.5`; raise to reduce summary frequency)
- Bots use these envs:
  - Mistral bot: `src/services/mistral-bot.js`
  - Semem agent: `src/services/semem-agent.js`

## Under the hood
- Detection functions live in `src/lib/ibis-detect.js`.
- Summaries are generated via `summarizeIBIS` and posted when confidence ≥ `LINGUE_CONFIDENCE_MIN`.
- IBIS structures can be converted to RDF/Turtle via `src/lib/ibis-rdf.js`, though chat bots only emit the text summary.

## Testing IBIS
- Unit test: `test/ibis.test.js` (runs with `npm test`).
- Quick demo: try the sample text above with Mistral or Semem in a MUC (with Lingue enabled) and watch for the IBIS summary message.
