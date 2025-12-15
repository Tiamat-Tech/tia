# Lingue/IBIS Agent Plan

## Goals
- Keep natural language as the default chat surface while enabling optional structured IBIS exchange between capable agents.
- Add minimal Lingue capability advertisement, IBIS pattern detection, and meta-transparent summaries to existing XMPP bots.
- Provide a clear path to exchange RDF (Turtle) over XMPP DMs with opt-in negotiation.

## Agent Roles to Prototype
- **Meta-Transparent Summarizer**: observes MUC, detects Issue/Position/Argument patterns, posts concise summaries, offers structured details on request.
- **Structured Broker**: negotiates IBIS RDF exchange with Lingue-capable peers via DM, sends/receives Turtle payloads, mirrors summaries to the room.
- **Knowledge Keeper**: maintains an N3 store of received IBIS graphs, answers simple `ASK` queries, optionally persists important deliberations.
- **Facilitator**: nudges discussion by proposing next questions/positions when conversation stalls, based on detected IBIS gaps.

## Work Plan
1. **Capability Advertisement**
   - Extend `src/services/mistral-bot.js` to answer `disco#info` with Lingue/IBIS feature URIs.
   - Add a helper to probe peer capabilities before structured negotiation.
2. **IBIS Detection (NL-first)**
   - Add `src/lib/ibis-detect.js` using an LLM prompt to extract Issues/Positions/Arguments with confidence scoring.
   - On high confidence, post a short meta-transparent summary to the room; invite users to request RDF.
3. **Structured Exchange**
   - Create `src/lib/ibis-rdf.js` for Turtle serialization/parsing of detected IBIS structures.
   - Implement DM-based negotiation: offer structured exchange to Lingue-capable peers; send RDF in `<message><data>`; keep NL summaries public.
4. **ASK/TELL Primitives**
   - Add minimal handlers for `ASK`/`TELL` over XMPP DM backed by an in-memory N3 store.
   - Support simple queries (positions for an issue, arguments for a position); document expected message shapes.
5. **Persistence (Optional/Phase 2)**
   - Add optional persistence to a shared triple store or local file cache with TTL; sync on demand.
6. **Facilitation**
   - Use detected IBIS graphs to suggest next positions or arguments when discussion is thin; gate behind a config flag.

## Testing & Demos
- Provide runnable scripts under `src/examples/`:
  - `lingue-detect-demo.js`: runs detector on sample text, prints summary + Turtle.
  - `lingue-exchange-demo.js`: simulates DM negotiation and RDF exchange between two mock agents.
- Manual flows: start bot, join `general@conference.xmpp`, send deliberation text, observe summaries and (optionally) RDF offers.

## Documentation
- Update `README.md` with quickstart commands for Lingue features.
- Add a detailed `docs/lingue.md` covering protocol expectations, config flags (`LINGUE_ENABLED`, `LINGUE_CONFIDENCE_MIN`, etc.), and example transcripts.
