import rdf from "rdf-ext";
import ParserN3 from "@rdfjs/parser-n3";
import { Writer } from "n3";
import { Readable } from "stream";

const PREFIXES = {
  ibis: "https://vocab.methodandstructure.com/ibis#",
  ibisLegacy: "http://purl.org/ibis#",
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

    dataset.add(
      rdf.quad(argNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(arg.label || "Argument"))
    );
    if (arg.stance === "support" || arg.stance === "object") {
      const posTarget =
        arg.position || (structure.positions || [])[0]?.id || "pos-1";
      const predicate =
        arg.stance === "object"
          ? rdf.namedNode(`${PREFIXES.ibis}objects-to`)
          : rdf.namedNode(`${PREFIXES.ibis}supports`);
      dataset.add(
        rdf.quad(argNode, predicate, rdf.namedNode(`#${posTarget}`))
      );
    }
    dataset.add(
      rdf.quad(argNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibis}Argument`))
    );
  });

  // Legacy IBIS constructs
  (structure.ideas || []).forEach((idea, idx) => {
    const ideaId = idea.id || `idea-${idx + 1}`;
    const ideaNode = rdf.namedNode(`#${ideaId}`);
    dataset.add(
      rdf.quad(ideaNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(idea.label || "Idea"))
    );
    dataset.add(
      rdf.quad(ideaNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibisLegacy}Idea`))
    );
  });

  (structure.questions || []).forEach((question, idx) => {
    const questionId = question.id || `question-${idx + 1}`;
    const questionNode = rdf.namedNode(`#${questionId}`);
    dataset.add(
      rdf.quad(questionNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(question.label || "Question"))
    );
    dataset.add(
      rdf.quad(questionNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibisLegacy}Question`))
    );
  });

  (structure.decisions || []).forEach((decision, idx) => {
    const decisionId = decision.id || `decision-${idx + 1}`;
    const decisionNode = rdf.namedNode(`#${decisionId}`);
    dataset.add(
      rdf.quad(decisionNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(decision.label || "Decision"))
    );
    dataset.add(
      rdf.quad(decisionNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibisLegacy}Decision`))
    );
  });

  (structure.references || []).forEach((reference, idx) => {
    const referenceId = reference.id || `reference-${idx + 1}`;
    const referenceNode = rdf.namedNode(`#${referenceId}`);
    dataset.add(
      rdf.quad(referenceNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(reference.label || "Reference"))
    );
    dataset.add(
      rdf.quad(referenceNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibisLegacy}Reference`))
    );
  });

  (structure.notes || []).forEach((note, idx) => {
    const noteId = note.id || `note-${idx + 1}`;
    const noteNode = rdf.namedNode(`#${noteId}`);
    dataset.add(
      rdf.quad(noteNode, rdf.namedNode(`${PREFIXES.rdfs}label`), rdf.literal(note.label || "Note"))
    );
    dataset.add(
      rdf.quad(noteNode, rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode(`${PREFIXES.ibisLegacy}Note`))
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
  const ideas = [];
  const questions = [];
  const decisions = [];
  const references = [];
  const notes = [];

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
          stance: "neutral",
        });
      }
      // Legacy IBIS constructs
      if (quad.subject.value.includes("#idea-")) {
        ideas.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#question-")) {
        questions.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#decision-")) {
        decisions.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#reference-")) {
        references.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
        });
      }
      if (quad.subject.value.includes("#note-")) {
        notes.push({
          id: stripHash(quad.subject.value),
          label: quad.object.value,
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

  const legacyCount = ideas.length + questions.length + decisions.length + references.length + notes.length;
  return {
    issues,
    positions,
    arguments: argumentsList,
    // Legacy IBIS constructs
    ideas,
    questions,
    decisions,
    references,
    notes,
    confidence: issues.length + positions.length + legacyCount > 0 ? 0.7 : 0.2,
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
