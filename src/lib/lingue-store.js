import rdf from "rdf-ext";
import { structureToDataset, datasetToStructure, datasetToTurtle, turtleToDataset } from "./ibis-rdf.js";

const PREFIXES = {
  ibis: "https://vocab.methodandstructure.com/ibis#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
};

export class LingueStore {
  constructor() {
    this.dataset = rdf.dataset();
  }

  addStructure(structure) {
    const ds = structureToDataset(structure);
    this.dataset.addAll(ds);
  }

  addDataset(ds) {
    this.dataset.addAll(ds);
  }

  async addTurtle(turtle) {
    const ds = await turtleToDataset(turtle);
    this.dataset.addAll(ds);
  }

  positionsForIssue(issueId) {
    const issueNode = rdf.namedNode(`#${issueId}`);
    const respondsTo = rdf.namedNode(`${PREFIXES.ibis}responds-to`);
    const labelPred = rdf.namedNode(`${PREFIXES.rdfs}label`);

    const positionNodes = Array.from(
      this.dataset.match(null, respondsTo, issueNode)
    ).map((quad) => quad.subject.value);

    return positionNodes.map((nodeValue) => {
      const labelQuad = Array.from(
        this.dataset.match(rdf.namedNode(nodeValue), labelPred, null)
      )[0];
      return {
        id: stripHash(nodeValue),
        label: labelQuad?.object?.value || "",
      };
    });
  }

  argumentsForPosition(posId) {
    const posNode = rdf.namedNode(`#${posId}`);
    const supports = rdf.namedNode(`${PREFIXES.ibis}supports`);
    const objectsTo = rdf.namedNode(`${PREFIXES.ibis}objects-to`);
    const labelPred = rdf.namedNode(`${PREFIXES.rdfs}label`);

    const stanceForPredicate = (pred) =>
      pred.value.endsWith("objects-to") ? "object" : "support";

    const matches = [
      ...Array.from(this.dataset.match(null, supports, posNode)),
      ...Array.from(this.dataset.match(null, objectsTo, posNode)),
    ];

    return matches.map((quad) => {
      const labelQuad = Array.from(
        this.dataset.match(quad.subject, labelPred, null)
      )[0];
      return {
        id: stripHash(quad.subject.value),
        label: labelQuad?.object?.value || "",
        stance: stanceForPredicate(quad.predicate),
      };
    });
  }

  async toTurtle() {
    return datasetToTurtle(this.dataset);
  }

  toStructure() {
    return datasetToStructure(this.dataset);
  }
}

function stripHash(value) {
  return value.split("#").pop();
}
