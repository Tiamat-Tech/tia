The IBIS support is lacking some key constructs from the methodology. These already have URIs minted for them, their meaning is clear from their names. Chair should recognise these terms and abbreviated versions, eg. "Question:" = "Q:"

All in the namespace http://purl.org/ibis#
RDF Classes : Idea, Question, Argument, Decision, Reference, Note, Map, 
Properties : refersTo, pro, con

The trigger phrases for the agents appears to be getting in a bit of a mess. We need to add these as properties in each agent's RDF profile.

We need to add another LLM-backed chat completion agent that uses a different API. First it makes sense to abstract out the parts of the code that will be common to all such APIs. The next agent will be Groq, which will act as a template for any Groq-based agenet interfaces, in the same way we have a base Mistral agent plus specialised instances that inherit charactistics. See https://console.groq.com/docs/quickstart