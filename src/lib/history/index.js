import rdf from "rdf-ext";

const HISTORY_NS = "http://purl.org/stuff/tia/history#";
const DCTERMS_NS = "http://purl.org/dc/terms/";

const TERMS = {
  Turn: rdf.namedNode(`${HISTORY_NS}Turn`),
  role: rdf.namedNode(`${HISTORY_NS}role`),
  content: rdf.namedNode(`${HISTORY_NS}content`),
  seq: rdf.namedNode(`${HISTORY_NS}seq`),
  created: rdf.namedNode(`${DCTERMS_NS}created`),
  rdfType: rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
};

/**
 * Base history store interface.
 */
export class HistoryStore {
  addTurn() {
    throw new Error("HistoryStore.addTurn not implemented");
  }

  getMessages() {
    throw new Error("HistoryStore.getMessages not implemented");
  }

  clear() {
    throw new Error("HistoryStore.clear not implemented");
  }
}

/**
 * In-memory RDF-backed history store.
 */
export class InMemoryHistoryStore extends HistoryStore {
  constructor({ dataset = rdf.dataset(), maxEntries = 50 } = {}) {
    super();
    this.dataset = dataset;
    this.maxEntries = maxEntries;
    this._seq = 0;
  }

  addTurn({ role, content, created = new Date().toISOString() }) {
    if (!role || !content) {
      throw new Error("History turn requires role and content.");
    }

    const node = rdf.blankNode();
    const seq = this._seq++;

    this.dataset.add(rdf.quad(node, TERMS.rdfType, TERMS.Turn));
    this.dataset.add(rdf.quad(node, TERMS.role, rdf.literal(role)));
    this.dataset.add(rdf.quad(node, TERMS.content, rdf.literal(content)));
    this.dataset.add(rdf.quad(node, TERMS.seq, rdf.literal(String(seq))));
    this.dataset.add(rdf.quad(node, TERMS.created, rdf.literal(created)));

    this.prune();
    return node;
  }

  getMessages({ limit = this.maxEntries } = {}) {
    const turns = this.getTurns();
    return turns
      .slice(-limit)
      .map((turn) => ({
        role: turn.role,
        content: turn.content
      }));
  }

  clear() {
    this.dataset = rdf.dataset();
    this._seq = 0;
  }

  getTurns() {
    const turns = [];
    const quads = Array.from(this.dataset.match(null, TERMS.seq, null));
    for (const quad of quads) {
      const subject = quad.subject;
      const seq = parseInt(quad.object.value, 10);
      const role = this.getLiteral(subject, TERMS.role);
      const content = this.getLiteral(subject, TERMS.content);
      const created = this.getLiteral(subject, TERMS.created);
      turns.push({ subject, seq, role, content, created });
    }
    return turns.sort((a, b) => a.seq - b.seq);
  }

  getLiteral(subject, predicate) {
    const quad = Array.from(this.dataset.match(subject, predicate, null))[0];
    return quad?.object?.value || null;
  }

  prune() {
    const turns = this.getTurns();
    if (turns.length <= this.maxEntries) return;

    const toRemove = turns.slice(0, turns.length - this.maxEntries);
    for (const turn of toRemove) {
      this.dataset.deleteMatches(turn.subject, null, null);
    }
  }
}

export const HISTORY_TERMS = TERMS;
