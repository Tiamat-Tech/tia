import fs from "fs/promises";
import path from "path";

// Note: shared helpers for profile loading and tooling.
const DEFAULT_PROFILE_DIR = path.join(process.cwd(), "config", "agents");
const AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR || DEFAULT_PROFILE_DIR;
const secretsCache = new Map();

function defaultSecretsPath(profileDir) {
  return process.env.AGENT_SECRETS_PATH || path.join(profileDir || AGENT_PROFILE_DIR, "secrets.json");
}

export function resolveProfileDir(options = {}) {
  return options.profileDir || process.env.AGENT_PROFILE_DIR || DEFAULT_PROFILE_DIR;
}

export function buildProfilePath(name, profileDir) {
  return path.join(profileDir, `${name}.ttl`);
}

export async function readProfileTurtle(name, profileDir) {
  const filePath = buildProfilePath(name, profileDir);
  return await fs.readFile(filePath, "utf8");
}

export async function loadSecrets({ secretsPath, profileDir } = {}) {
  const resolvedPath = secretsPath || defaultSecretsPath(profileDir);
  if (!resolvedPath) {
    throw new Error("Agent secrets path is required to load XMPP credentials.");
  }

  if (secretsCache.has(resolvedPath)) {
    return secretsCache.get(resolvedPath);
  }

  let raw;
  try {
    raw = await fs.readFile(resolvedPath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`Agent secrets file not found: ${resolvedPath}`);
    }
    throw err;
  }

  let secrets;
  try {
    secrets = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Agent secrets file is not valid JSON: ${resolvedPath}`);
  }

  secretsCache.set(resolvedPath, secrets);
  return secrets;
}

export function resolveXmppPassword(passwordKey, secrets) {
  if (!passwordKey) {
    throw new Error("Missing xmpp:passwordKey in agent profile.");
  }
  if (!secrets?.xmpp || typeof secrets.xmpp !== "object") {
    throw new Error("Agent secrets file is missing the xmpp password map.");
  }
  const password = secrets.xmpp[passwordKey];
  if (!password) {
    throw new Error(`No XMPP password found for key "${passwordKey}" in secrets file.`);
  }
  return password;
}
