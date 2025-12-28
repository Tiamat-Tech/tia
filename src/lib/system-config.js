import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { turtleToDataset } from "./ibis-rdf.js";

const SYSTEM_NS = "https://tensegrity.it/vocab/system#";
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), "config", "system.ttl");
const DEFAULTS = {
  maxAgentRounds: 5,
  coordinatorAllowAgentSenders: [],
  ibisSummarizerAgents: []
};

let cachedConfig = null;

export async function loadSystemConfig({ configPath = DEFAULT_CONFIG_PATH } = {}) {
  if (cachedConfig) return cachedConfig;
  try {
    const turtle = await fs.readFile(configPath, "utf8");
    const dataset = await turtleToDataset(turtle);
    const maxAgentRounds = extractInteger(dataset, `${SYSTEM_NS}maxAgentRounds`);
    const coordinatorAllowAgentSenders = extractLiterals(dataset, `${SYSTEM_NS}coordinatorAllowAgentSenders`);
    const ibisSummarizerAgents = extractLiterals(dataset, `${SYSTEM_NS}ibisSummarizerAgents`);
    cachedConfig = {
      maxAgentRounds: Number.isFinite(maxAgentRounds) ? maxAgentRounds : DEFAULTS.maxAgentRounds,
      coordinatorAllowAgentSenders: coordinatorAllowAgentSenders.length > 0
        ? coordinatorAllowAgentSenders
        : DEFAULTS.coordinatorAllowAgentSenders,
      ibisSummarizerAgents: ibisSummarizerAgents.length > 0
        ? ibisSummarizerAgents
        : DEFAULTS.ibisSummarizerAgents
    };
  } catch {
    cachedConfig = { ...DEFAULTS };
  }
  return cachedConfig;
}

function extractInteger(dataset, predicateUri) {
  const predicate = rdf.namedNode(predicateUri);
  const quad = Array.from(dataset.match(null, predicate, null))[0];
  const value = quad?.object?.value;
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function extractLiterals(dataset, predicateUri) {
  const predicate = rdf.namedNode(predicateUri);
  return Array.from(dataset.match(null, predicate, null))
    .map((quad) => quad?.object?.value)
    .filter(Boolean);
}
