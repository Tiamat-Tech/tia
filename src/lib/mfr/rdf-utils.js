import rdf from "rdf-ext";
import { Readable } from "stream";
import formats from "@rdfjs/formats-common";
import N3 from "n3";

/**
 * Utility functions for RDF parsing, serialization, and manipulation
 */
export class RdfUtils {
  /**
   * Parse Turtle string to RDF dataset
   * @param {string} turtleString - Turtle format RDF
   * @returns {Promise<Object>} RDF dataset
   */
  static async parseTurtle(turtleString) {
    if (!turtleString || typeof turtleString !== "string") {
      throw new Error("Invalid Turtle string");
    }

    const dataset = rdf.dataset();
    const parser = new N3.Parser({ format: "text/turtle" });

    return new Promise((resolve, reject) => {
      parser.parse(turtleString, (error, quad, prefixes) => {
        if (error) {
          reject(new Error(`Turtle parsing error: ${error.message}`));
        } else if (quad) {
          dataset.add(
            rdf.quad(
              rdf.namedNode(quad.subject.value),
              rdf.namedNode(quad.predicate.value),
              quad.object.termType === "Literal"
                ? rdf.literal(
                    quad.object.value,
                    quad.object.language || quad.object.datatype
                  )
                : rdf.namedNode(quad.object.value),
              quad.graph.value ? rdf.namedNode(quad.graph.value) : rdf.defaultGraph()
            )
          );
        } else {
          // End of parsing
          resolve(dataset);
        }
      });
    });
  }

  /**
   * Serialize RDF dataset to Turtle string
   * @param {Object} dataset - RDF dataset
   * @returns {Promise<string>} Turtle format RDF
   */
  static async serializeTurtle(dataset) {
    if (!dataset) {
      throw new Error("Invalid dataset");
    }

    const writer = new N3.Writer({ format: "text/turtle" });
    const quads = [];

    // Convert dataset to N3 quads
    for (const quad of dataset) {
      quads.push({
        subject: N3.DataFactory.namedNode(quad.subject.value),
        predicate: N3.DataFactory.namedNode(quad.predicate.value),
        object:
          quad.object.termType === "Literal"
            ? N3.DataFactory.literal(
                quad.object.value,
                quad.object.language || quad.object.datatype
              )
            : N3.DataFactory.namedNode(quad.object.value),
        graph: quad.graph.value
          ? N3.DataFactory.namedNode(quad.graph.value)
          : N3.DataFactory.defaultGraph()
      });
    }

    return new Promise((resolve, reject) => {
      writer.addQuads(quads);
      writer.end((error, result) => {
        if (error) {
          reject(new Error(`Turtle serialization error: ${error.message}`));
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Merge multiple RDF datasets into one
   * @param {Array<Object>} datasets - Array of RDF datasets
   * @returns {Promise<Object>} Merged dataset
   */
  static async mergeDatasets(datasets) {
    if (!Array.isArray(datasets)) {
      throw new Error("datasets must be an array");
    }

    const merged = rdf.dataset();

    for (const dataset of datasets) {
      if (!dataset) continue;

      for (const quad of dataset) {
        // Add quad to merged dataset
        merged.add(quad);
      }
    }

    return merged;
  }

  /**
   * Query dataset by predicate
   * @param {Object} dataset - RDF dataset
   * @param {string} predicateUri - URI of predicate to query
   * @returns {Array<Object>} Array of matching quads
   */
  static queryByPredicate(dataset, predicateUri) {
    if (!dataset || !predicateUri) {
      return [];
    }

    const results = [];
    const predicate = rdf.namedNode(predicateUri);

    for (const quad of dataset) {
      if (quad.predicate.equals(predicate)) {
        results.push(quad);
      }
    }

    return results;
  }

  /**
   * Query dataset by subject
   * @param {Object} dataset - RDF dataset
   * @param {string} subjectUri - URI of subject to query
   * @returns {Array<Object>} Array of matching quads
   */
  static queryBySubject(dataset, subjectUri) {
    if (!dataset || !subjectUri) {
      return [];
    }

    const results = [];
    const subject = rdf.namedNode(subjectUri);

    for (const quad of dataset) {
      if (quad.subject.equals(subject)) {
        results.push(quad);
      }
    }

    return results;
  }

  /**
   * Get all subjects of a given type
   * @param {Object} dataset - RDF dataset
   * @param {string} typeUri - URI of the type
   * @returns {Array<string>} Array of subject URIs
   */
  static getSubjectsOfType(dataset, typeUri) {
    const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    const results = [];

    for (const quad of dataset) {
      if (
        quad.predicate.value === RDF_TYPE &&
        quad.object.value === typeUri
      ) {
        results.push(quad.subject.value);
      }
    }

    return results;
  }

  /**
   * Extract metadata from dataset
   * @param {Object} dataset - RDF dataset
   * @param {string} subjectUri - Subject URI
   * @param {string} predicateUri - Predicate URI
   * @returns {Array<any>} Array of values
   */
  static extractValues(dataset, subjectUri, predicateUri) {
    const results = [];
    const subject = rdf.namedNode(subjectUri);
    const predicate = rdf.namedNode(predicateUri);

    for (const quad of dataset) {
      if (quad.subject.equals(subject) && quad.predicate.equals(predicate)) {
        results.push(
          quad.object.termType === "Literal"
            ? quad.object.value
            : quad.object.value
        );
      }
    }

    return results;
  }

  /**
   * Count quads in dataset
   * @param {Object} dataset - RDF dataset
   * @returns {number} Number of quads
   */
  static countQuads(dataset) {
    let count = 0;
    for (const quad of dataset) {
      count++;
    }
    return count;
  }

  /**
   * Check if dataset is empty
   * @param {Object} dataset - RDF dataset
   * @returns {boolean} True if dataset has no quads
   */
  static isEmpty(dataset) {
    return this.countQuads(dataset) === 0;
  }

  /**
   * Create a blank node
   * @param {string} id - Optional ID for the blank node
   * @returns {Object} Blank node
   */
  static blankNode(id) {
    return id ? rdf.blankNode(id) : rdf.blankNode();
  }

  /**
   * Create a named node
   * @param {string} uri - URI for the named node
   * @returns {Object} Named node
   */
  static namedNode(uri) {
    return rdf.namedNode(uri);
  }

  /**
   * Create a literal
   * @param {string} value - Literal value
   * @param {string} languageOrDatatype - Language tag or datatype URI
   * @returns {Object} Literal node
   */
  static literal(value, languageOrDatatype) {
    if (!languageOrDatatype) {
      return rdf.literal(value);
    }

    // Check if it's a language tag (lowercase, no ://)
    if (
      typeof languageOrDatatype === "string" &&
      !languageOrDatatype.includes("://")
    ) {
      return rdf.literal(value, languageOrDatatype);
    }

    // Otherwise it's a datatype
    return rdf.literal(value, rdf.namedNode(languageOrDatatype));
  }

  /**
   * Create a quad
   * @param {Object} subject - Subject node
   * @param {Object} predicate - Predicate node
   * @param {Object} object - Object node
   * @param {Object} graph - Optional graph node
   * @returns {Object} Quad
   */
  static quad(subject, predicate, object, graph) {
    return graph
      ? rdf.quad(subject, predicate, object, graph)
      : rdf.quad(subject, predicate, object);
  }

  /**
   * Create an empty dataset
   * @returns {Object} Empty RDF dataset
   */
  static createDataset() {
    return rdf.dataset();
  }

  /**
   * Clone a dataset
   * @param {Object} dataset - RDF dataset to clone
   * @returns {Object} Cloned dataset
   */
  static cloneDataset(dataset) {
    const clone = rdf.dataset();

    for (const quad of dataset) {
      clone.add(quad);
    }

    return clone;
  }

  /**
   * Find quads matching a pattern
   * @param {Object} dataset - RDF dataset
   * @param {Object|null} subject - Subject pattern (null for wildcard)
   * @param {Object|null} predicate - Predicate pattern (null for wildcard)
   * @param {Object|null} object - Object pattern (null for wildcard)
   * @param {Object|null} graph - Graph pattern (null for wildcard)
   * @returns {Array<Object>} Matching quads
   */
  static match(dataset, subject, predicate, object, graph) {
    const results = [];

    for (const quad of dataset) {
      let matches = true;

      if (subject && !quad.subject.equals(subject)) matches = false;
      if (predicate && !quad.predicate.equals(predicate)) matches = false;
      if (object && !quad.object.equals(object)) matches = false;
      if (graph && !quad.graph.equals(graph)) matches = false;

      if (matches) {
        results.push(quad);
      }
    }

    return results;
  }

  /**
   * Remove quads matching a pattern
   * @param {Object} dataset - RDF dataset
   * @param {Object|null} subject - Subject pattern (null for wildcard)
   * @param {Object|null} predicate - Predicate pattern (null for wildcard)
   * @param {Object|null} object - Object pattern (null for wildcard)
   * @param {Object|null} graph - Graph pattern (null for wildcard)
   * @returns {number} Number of quads removed
   */
  static removeMatching(dataset, subject, predicate, object, graph) {
    const toRemove = this.match(dataset, subject, predicate, object, graph);

    for (const quad of toRemove) {
      dataset.delete(quad);
    }

    return toRemove.length;
  }

  /**
   * Validate that a string is valid Turtle
   * @param {string} turtleString - Turtle string to validate
   * @returns {Promise<boolean>} True if valid
   */
  static async isValidTurtle(turtleString) {
    try {
      await this.parseTurtle(turtleString);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default RdfUtils;
