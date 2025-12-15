import { detectIBISStructure, summarizeIBIS } from "../lib/ibis-detect.js";
import { structureToDataset, datasetToTurtle } from "../lib/ibis-rdf.js";

const text =
  "Issue: How should we handle authentication? I propose OAuth2 because it is standard. However, the downside is complexity.";

const structure = detectIBISStructure(text);
const summary = summarizeIBIS(structure);
const dataset = structureToDataset(structure);
const turtle = await datasetToTurtle(dataset);

console.log("Detected structure:", JSON.stringify(structure, null, 2));
console.log("\nSummary:\n", summary);
console.log("\nTurtle:\n", turtle);
