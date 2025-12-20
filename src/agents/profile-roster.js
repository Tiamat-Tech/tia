import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { turtleToDataset } from "../lib/ibis-rdf.js";

const AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR ||
  path.join(process.cwd(), "config", "agents");

const FOAF_NICK = rdf.namedNode("http://xmlns.com/foaf/0.1/nick");

export async function loadAgentRoster({ profileDir = AGENT_PROFILE_DIR } = {}) {
  const entries = await fs.readdir(profileDir, { withFileTypes: true });
  const roster = new Set();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".ttl")) continue;
    const filePath = path.join(profileDir, entry.name);
    const turtle = await fs.readFile(filePath, "utf8");
    const dataset = await turtleToDataset(turtle);
    const nicks = Array.from(dataset.match(null, FOAF_NICK, null))
      .map((quad) => quad.object?.value)
      .filter(Boolean);
    nicks.forEach((nick) => roster.add(nick));
  }

  return Array.from(roster.values());
}
