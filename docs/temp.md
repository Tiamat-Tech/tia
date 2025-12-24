 I must have mentioned using the Prolog engine for constraint solving at some point, because that's the direction this seems to have gone in. So the sample problem is : "Schedule appointments for patients. Alice takes warfarin, Bob takes aspirin. Ensure no drug interactions."

The data flow looks like this:

 [![dataflow diagram](dataflow.png)](dataflow.svg)

See [Architecture Overview](docs/mfr-architecture-overview.md)

The inter-agent comms happen in a set of MUCs - general, mfr-construct, mfr-reason, mfr-validate

most of these messages are sent as minimal text + not-visible RDF payload, just a few human-readably notifications.

See [Architecture Overview](docs/mfr-architecture-overview.md)

Expand these :

* what is the purpose of SHACL validation in the system?
* where and how are JSON messages used?
* where and how are RDF messages used?
* brief overview of the vocabs used in the system (with links to vocabs/*)
* brief overview of how lingue works
* walkthrough of an mfr run