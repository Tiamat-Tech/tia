import rdf from "rdf-ext";
import ParserN3 from "@rdfjs/parser-n3";
import { Writer } from "n3";
import { Readable } from "stream";

const PREFIXES = {
  ibis: "https://vocab.methodandstructure.com/ibis#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
};

export function structureToDataset(structure) {
  const dataset = rdf.dataset();
  const issue = structure.issues?.[0] || {
    id: "issue-1",
    label: "Unspecified issue",
  };

  const issueNode = rdf.namedNode(`#${issue.id}`);
  dataset.add(
    rdf.quad(issueNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(issue.label))
  );
  dataset.add(
    rdf.quad(issueNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Issue`))
  );

  (structure.positions || []).forEach((pos, idx) => {
    const posId = pos.id || `pos-${idx + 1}`;
    const posNode = rdf.namedNode(`#${posId}`);
    dataset.add(
      rdf.quad(posNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(pos.label || "Position"))
    );
    dataset.add(
      rdf.quad(posNode, rdf.namedNode(`${PREFIXES.ibis}responds-to`), issueNode)
    );
    dataset.add(
      rdf.quad(posNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Position`))
    );
  });

  (structure.arguments || []).forEach((arg, idx) => {
    const argId = arg.id || `arg-${idx + 1}`;
    const argNode = rdf.namedNode(`#${argId}`);
    const posTarget =
      arg.position || (structure.positions || [])[0]?.id || "pos-1";
    const predicate =
      arg.stance === "object"
        ? rdf.namedNode(`${PREFIXES.ibis}objects-to`)
        : rdf.namedNode(`${PREFIXES.ibis}supports`);

    dataset.add(
      rdf.quad(argNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(arg.label || "Argument"))
    );
    dataset.add(
      rdf.quad(argNode, predicate, rdf.namedNode(`#${posTarget}`))
    );
    dataset.add(
      rdf.quad(argNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Argument`))
    );
  });

  return dataset;
}

export async function datasetToTurtle(dataset) {
  const writer = new Writer({ prefixes: PREFIXES });
  dataset.forEach((quad) => {
    writer.addQuad(
      toTerm(quad.subject),
      toTerm(quad.predicate),
      toTerm(quad.object),
      quad.graph
    );
  });

  return new Promise((resolve, reject) => {
    writer.end((err, result) => {
      if (err) return reject(err);
      resolve(result.trim());
    });
  });
}

export async function turtleToDataset(turtle) {
  const parser = new ParserN3({ factory: rdf });
  const input = new Readable({
    read() {
      this.push(turtle);
      this.push(null);
    },
  });
  const dataset = rdf.dataset();
  const stream = parser.import(input);

  return new Promise((resolve, reject) => {
    stream.on("data", (quad) => dataset.add(quad));
    stream.on("error", reject);
    stream.on("end", () => resolve(dataset));
  });
}

export function datasetToStructure(dataset) {
  const issues = [];
  const positions = [];
  const argumentsList = [];

  dataset.forEach((quad) => {
    if (quad.predicate.value === `${PREFIXES.rdfs}label`) {
      if (quad.subject.value.includes("#issue")) {
        issues.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#pos-")) {
        positions.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#arg-")) {
        argumentsList.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
          stance: "support",
        });
      }
    }
    if (
      quad.predicate.value === `${PREFIXES.ibis}objects-to` &&
      quad.subject.value.includes("#arg-")
    ) {
      const arg = argumentsList.find((a) => a.id === stripHash(quad.subject.value));
      if (arg) {
        arg.stance = "object";
        arg.position = stripHash(quad.object.value);
      }
    }
    if (
      quad.predicate.value === `${PREFIXES.ibis}supports` &&
      quad.subject.value.includes("#arg-")
    ) {
      const arg = argumentsList.find((a) => a.id === stripHash(quad.subject.value));
      if (arg) {
        arg.stance = "support";
        arg.position = stripHash(quad.object.value);
      }
    }
  });

  return {
    issues,
    positions,
    arguments: argumentsList,
    confidence: issues.length + positions.length > 0 ? 0.7 : 0.2,
  };
}

function stripHash(value) {
  return value.split("#").pop();
}

function toTerm(term) {
  if (term.termType === "NamedNode" || term.termType === "BlankNode") {
    return term;
  }
  if (term.termType === "Literal") {
    return term;
  }
  return rdf.namedNode(term.value);
}
