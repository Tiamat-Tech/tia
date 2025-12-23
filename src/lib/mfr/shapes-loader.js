import { readFile } from "fs/promises";
import { resolve } from "path";
import { RdfUtils } from "./rdf-utils.js";

/**
 * Loader for SHACL shapes from Turtle files
 */
export class ShapesLoader {
  constructor({ logger = console } = {}) {
    this.logger = logger;
    this.cache = new Map();
  }

  /**
   * Load SHACL shapes from a Turtle file
   * @param {string} shapesPath - Path to shapes file (relative to project root)
   * @returns {Promise<Object>} RDF dataset containing shapes
   */
  async loadShapes(shapesPath) {
    // Check cache first
    if (this.cache.has(shapesPath)) {
      this.logger.debug?.(`[ShapesLoader] Using cached shapes: ${shapesPath}`);
      return this.cache.get(shapesPath);
    }

    try {
      this.logger.debug?.(`[ShapesLoader] Loading shapes from: ${shapesPath}`);

      // Resolve path relative to project root
      const absolutePath = resolve(process.cwd(), shapesPath);

      // Read the file
      const turtleContent = await readFile(absolutePath, "utf-8");

      // Parse Turtle to RDF dataset
      const shapesDataset = await RdfUtils.parseTurtle(turtleContent);

      const quadCount = RdfUtils.countQuads(shapesDataset);
      this.logger.debug?.(
        `[ShapesLoader] Loaded ${quadCount} quads from ${shapesPath}`
      );

      // Cache the shapes
      this.cache.set(shapesPath, shapesDataset);

      return shapesDataset;
    } catch (error) {
      this.logger.error?.(
        `[ShapesLoader] Failed to load shapes from ${shapesPath}: ${error.message}`
      );
      throw new Error(`Failed to load SHACL shapes: ${error.message}`);
    }
  }

  /**
   * Load MFR shapes from default location
   * @returns {Promise<Object>} RDF dataset containing MFR shapes
   */
  async loadMfrShapes() {
    return this.loadShapes("vocabs/mfr-shapes.ttl");
  }

  /**
   * Load shapes from multiple files and merge them
   * @param {Array<string>} shapesPaths - Array of paths to shapes files
   * @returns {Promise<Object>} Merged RDF dataset
   */
  async loadMultipleShapes(shapesPaths) {
    const datasets = [];

    for (const path of shapesPaths) {
      const dataset = await this.loadShapes(path);
      datasets.push(dataset);
    }

    return RdfUtils.mergeDatasets(datasets);
  }

  /**
   * Clear the shapes cache
   */
  clearCache() {
    this.logger.debug?.("[ShapesLoader] Clearing shapes cache");
    this.cache.clear();
  }

  /**
   * Remove a specific shapes file from cache
   * @param {string} shapesPath - Path to shapes file
   */
  clearCacheForPath(shapesPath) {
    this.cache.delete(shapesPath);
  }

  /**
   * Get statistics about loaded shapes
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const entries = [];

    for (const [path, dataset] of this.cache.entries()) {
      entries.push({
        path,
        quadCount: RdfUtils.countQuads(dataset)
      });
    }

    return {
      cachedFiles: this.cache.size,
      entries
    };
  }
}

export default ShapesLoader;
