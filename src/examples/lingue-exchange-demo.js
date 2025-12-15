import { createLingueStore, acceptStructuredOffer, prepareStructuredOffer } from "../lib/lingue-exchange.js";

const storeA = createLingueStore();
const storeB = createLingueStore();

const textFromA =
  "Issue: How should we handle telemetry? I propose MQTT because it fits IoT devices. The downside is broker lock-in.";

// Agent A prepares an offer
const offer = prepareStructuredOffer(textFromA, 0.4);
if (!offer) {
  console.log("No Lingue structure detected with sufficient confidence.");
  process.exit(0);
}

console.log("Agent A summary:\n", offer.summary);

// Agent B accepts and stores the RDF
const turtle = await acceptStructuredOffer(storeB, offer);
console.log("\nExchanged Turtle:\n", turtle);

// Agent B asks for positions related to the issue
const structure = storeB.toStructure();
const issueId = structure.issues?.[0]?.id || "issue-1";
const positions = storeB.positionsForIssue(issueId);
console.log("\nPositions for issue:", positions);
