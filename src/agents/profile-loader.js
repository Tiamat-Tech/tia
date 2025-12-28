import { turtleToDataset } from "../lib/ibis-rdf.js";
import rdf from "rdf-ext";
import { assertXmppPassword } from "./profile/profile-validation.js";
import { mergeAgentProfiles } from "./profile/profile-merge.js";
import { datasetToProfile } from "./profile/profile-parser.js";
import { profileToDataset, profileToTurtle } from "./profile/profile-serializer.js";
import {
  extractBaseProfileNames
} from "./profile/profile-rdf.js";
import {
  loadSecrets,
  buildProfilePath,
  resolveProfileDir,
  readProfileTurtle
} from "./profile/profile-io.js";

/**
 * Load agent profile from Turtle file
 */
export async function loadAgentProfile(name, options = {}) {
  if (!name) return null;

  const profileDir = resolveProfileDir(options);
  const filePath = buildProfilePath(name, profileDir);

  try {
    const turtle = await readProfileTurtle(name, profileDir);
    const subjectUri = options.subjectUri || `#${name}`;
    const secrets = await loadSecrets({
      secretsPath: options.secretsPath,
      profileDir
    });
    const dataset = await turtleToDataset(turtle);
    const subject = rdf.namedNode(subjectUri);
    const profile = datasetToProfile(dataset, subject, {
      secrets,
      allowMissingPasswordKey: options.allowMissingPasswordKey
    });
    const baseProfiles = extractBaseProfileNames(dataset, subject);

    if (!baseProfiles.length) {
      if (!options.allowMissingPasswordKey) {
        assertXmppPassword(profile);
      }
      return profile;
    }

    const stack = new Set(options._stack || []);
    if (stack.has(name)) {
      throw new Error(`Circular profile inheritance detected: ${Array.from(stack).join(" -> ")} -> ${name}`);
    }
    stack.add(name);

    let mergedProfile = profile;
    for (const baseName of baseProfiles) {
      const baseProfile = await loadAgentProfile(baseName, {
        ...options,
        profileDir,
        secretsPath: options.secretsPath,
        _stack: Array.from(stack),
        allowMissingPasswordKey: true
      });
      mergedProfile = mergeAgentProfiles(baseProfile, mergedProfile);
    }

    if (!options.allowMissingPasswordKey) {
      assertXmppPassword(mergedProfile);
    }
    return mergedProfile;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    console.error(`[profile-loader] Failed to load ${filePath}:`, err.message);
    throw err;
  }
}

/**
 * Parse Turtle string to AgentProfile
 */
export async function parseAgentProfile(turtle, subjectUri, options = {}) {
  const dataset = await turtleToDataset(turtle);
  const subject = rdf.namedNode(subjectUri);
  const secrets = await loadSecrets({
    secretsPath: options.secretsPath,
    profileDir: options.profileDir
  });
  const profile = datasetToProfile(dataset, subject, {
    secrets,
    allowMissingPasswordKey: options.allowMissingPasswordKey
  });
  if (!options.allowMissingPasswordKey) {
    assertXmppPassword(profile);
  }
  return profile;
}

/**
 * Extract AgentProfile from RDF dataset
 */
export { profileToDataset, profileToTurtle };


/**
 * Set the default profile directory for profile loading.
 * This is a convenience function that sets the AGENT_PROFILE_DIR environment variable.
 *
 * @param {string} dir - The directory path to use as default for profile loading
 * @example
 * import { setDefaultProfileDir, loadAgentProfile } from "tia-agents";
 *
 * setDefaultProfileDir("./my-agents");
 * const profile = await loadAgentProfile("mybot"); // loads from ./my-agents/mybot.ttl
 */
export function setDefaultProfileDir(dir) {
  process.env.AGENT_PROFILE_DIR = dir;
}
