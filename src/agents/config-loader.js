import fs from "fs";
import path from "path";

const AGENT_CONFIG_DIR = process.env.AGENT_CONFIG_DIR || path.join(process.cwd(), "config", "agents");

export function loadAgentConfig(name) {
  if (!name) return null;
  const filePath = path.join(AGENT_CONFIG_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[config-loader] Failed to load ${filePath}: ${err.message}`);
    return null;
  }
}

export default loadAgentConfig;
