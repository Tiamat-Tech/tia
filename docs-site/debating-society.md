The debating society is an experiment in a mixed environment of intelligent agents (including humans).
There will be two key agents with specific roles : Chair and Recorder
Chair will coordinate inter-agent exchange of profiles, so eg. Semem may declare in Lingue RDF vocabulary that it has the capability of looking things up in wikidata, Mistral can translate between plain English and IBIS declarations and Recorder will declare that it is taking minutes. 
Exchanges will operate through a baseline of regular human-style chat but the Chair will periodically poll for consensus, ask for opinions and statements of fact or other such IBIS operation.
A debate will be initiated with a question, for example "Is the Earth flat?". The Chair will decide from onsensus when the Issue is resolved.
The system will reuse the existing code infrastructure wherever possible, favoring a modular approach. Any new operational code of significance will be given Vitest tests. Separation of concerned will be maintained, so the eg. prompt construction will be carried out through templating of separate text files, not inline with the code. RDF operations will make use of the standard RDF libs in the project, again, no inline RDF or SPARQL.  

## Implementation Plan

1) Profiles & Roles
- Add dedicated agent profiles (config/agents) for Chair and Recorder (distinct XMPP accounts/resources). Chair orchestrates; Recorder stores minutes.
- Keep Mistral and Semem as supporting agents; ensure Lingue/IBIS enabled for all participants.

2) Chair Orchestration
- Chair listens for debate initiation (`Issue: ...` or a “start debate” trigger).
- Periodically polls for consensus, requests Positions/Arguments, and posts a brief IBIS summary using `summarizeIBIS`.
- Uses mention detection only from profile nickname; no hardcoded aliases.

3) Recorder Logging
- Recorder captures MUC traffic and persists structured minutes:
  - Store IBIS summaries and raw statements via Semem `/tell` (using existing Semem provider or Recorder-specific).
  - Use Lingue detection to tag Issues/Positions/Arguments.

4) IBIS/Lingue Integration
- Reuse `ibis-detect` and Lingue summaries; ensure `LINGUE_ENABLED=true` for Chair/Recorder.
- Add Vitest coverage for: IBIS detection -> summary -> Recorder store; Chair prompting for Positions -> response flow.

5) Prompt/Template Separation
- Store Chair/Recorder prompts in templates (e.g., `config/prompts/chair.txt`, `recorder.txt`) not inline.
- Chair prompt covers polling cadence, consensus checks, and brevity.

6) Storage & RDF
- Use existing Semem client for `/tell` (Recorder) and `/ask` (Chair retrieval).
- No inline RDF/SPARQL; rely on existing RDF libs if exporting IBIS structures later.

7) Start/Run
- Add profiles to `config/agents` for chair/recorder; launch via `start-all-agents.sh` or individual start scripts with `AGENT_PROFILE=<name>`.
- Ensure distinct XMPP users/resources to avoid “bot” identity collision.
- Debate-only start: use `./start-debate-agents.sh` (AGENTS=chair,recorder) for testing Chair/Recorder without other bots.

8) Testing
- Unit: prompt/template loading; IBIS detection path.
- Integration (when XMPP reachable): Chair responds to “start debate” and polls; Recorder stores summaries via Semem `/tell`.

9) Logging & Monitoring
- Use logger-lite with file output and concise log level; add key events (debate started, poll issued, summary stored).
