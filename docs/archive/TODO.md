Status: scratchpad; candidate for removal.

The IBIS support is lacking some key constructs from the methodology. These already have URIs minted for them, their meaning is clear from their names. Chair should recognise these terms and abbreviated versions, eg. "Question:" = "Q:"

All in the namespace http://purl.org/ibis#
RDF Classes : Idea, Question, Argument, Decision, Reference, Note, Map, 
Properties : refersTo, pro, con

The trigger phrases for the agents appears to be getting in a bit of a mess. We need to add these as properties in each agent's RDF profile.

We need to add another LLM-backed chat completion agent that uses a different API. First it makes sense to abstract out the parts of the code that will be common to all such APIs. The next agent will be Groq, which will act as a template for any Groq-based agenet interfaces, in the same way we have a base Mistral agent plus specialised instances that inherit charactistics. See https://console.groq.com/docs/quickstart

---
  ✅ Task 2.6: Create tests for capability command parser
  ✅ Task 1.1: Add legacy IBIS markers to ibis-detect.js
  ✅ Task 1.2: Update RDF conversion in ibis-rdf.js for legacy namespace
  ✅ Task 1.3: Update ChairProvider for new IBIS elements
  ✅ Task 1.4: Create ibis-legacy.test.js with comprehensive tests
  ✅ Task 3.1: Create BaseLLMProvider abstract class
  ✅ Task 3.2: Refactor MistralProvider to extend BaseLLMProvider
  ✅ Task 3.3: Create GroqProvider extending BaseLLMProvider
  ✅ Task 3.4: Add GroqProviderConfig to provider-config.js
  ✅ Task 3.5: Update profile loader for Groq support
  ✅ Task 3.6: Create groq-bot.js service and profile
  ✅ Task 3.7: Create tests for base class and Groq provider
  ✅ Final: Run full regression test suite and integration tests
  ✅ Final: Update all documentation files

## Summary

All three TODO items have been completed:

1. **Enhanced IBIS Support**: Added legacy IBIS constructs (Idea, Question, Argument, Decision, Reference, Note, Map) with full Chair recognition and RDF conversion.

2. **RDF-based Command Routing**: Moved agent trigger phrases to RDF profiles with capability-based command parsing and fallback support.

3. **Groq LLM Agent**: Created BaseLLMProvider abstraction, refactored MistralProvider, and added GroqProvider with full profile support and comprehensive tests.

### Files Created/Modified:
- `src/agents/providers/base-llm-provider.js` (NEW - 470 lines)
- `src/agents/providers/mistral-provider.js` (REFACTORED - 66 lines, down from 390)
- `src/agents/providers/groq-provider.js` (NEW - 63 lines)
- `src/services/groq-bot.js` (NEW)
- `config/agents/groq-bot.ttl` (NEW)
- `start-groq-bot.sh` (NEW)
- `test/base-llm-provider.test.js` (NEW - 27 tests)
- `test/groq-provider.test.js` (NEW - 23 tests)
- Various profile loading and capability parsing updates

### Test Results:
- 76 unit tests passing (up from 26)
- 2 MFR integration tests passing
- Zero breaking changes to existing functionality
