import { detectIBISStructure, summarizeIBIS } from "./ibis-detect.js";
import { structureToDataset, datasetToTurtle } from "./ibis-rdf.js";
import { LingueStore } from "./lingue-store.js";

export function prepareStructuredOffer(text, confidenceMin = 0.5) {
  const structure = detectIBISStructure(text);
  if (structure.confidence < confidenceMin) {
    return null;
  }

  const dataset = structureToDataset(structure);
  return {
    summary: summarizeIBIS(structure),
    turtlePromise: datasetToTurtle(dataset),
    structure,
  };
}

export async function acceptStructuredOffer(store, offer) {
  const turtle = await offer.turtlePromise;
  await store.addTurtle(turtle);
  return turtle;
}

export function createLingueStore() {
  return new LingueStore();
}
