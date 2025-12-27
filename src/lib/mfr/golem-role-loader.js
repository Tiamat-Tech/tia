/**
 * Golem Role Loader - Load role definitions from RDF/Turtle format
 * Following the patterns established in src/agents/profile-loader.js
 */

import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { turtleToDataset } from "../ibis-rdf.js";

const DEFAULT_ROLES_FILE = path.join(process.cwd(), "config", "golem-roles.ttl");

const PREFIXES = {
  mfr: "http://purl.org/stuff/mfr/",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  dcterms: "http://purl.org/dc/terms/"
};

/**
 * GolemRole class representing a single role definition
 */
export class GolemRole {
  constructor({ id, domain, name, systemPrompt, capabilities, phase }) {
    this.id = id;
    this.domain = domain;
    this.name = name;
    this.systemPrompt = systemPrompt;
    this.capabilities = capabilities || [];
    this.phase = phase;
  }
}

/**
 * Load all roles from the Turtle file
 * @param {string} [rolesPath] - Optional path to roles file
 * @returns {Promise<Object>} Object with roles organized by domain
 */
export async function loadGolemRoles(rolesPath) {
  const filePath = rolesPath || DEFAULT_ROLES_FILE;

  try {
    const turtle = await fs.readFile(filePath, "utf8");
    const dataset = await turtleToDataset(turtle);
    return datasetToRoles(dataset);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Golem roles file not found: ${filePath}`);
    }
    throw new Error(`Failed to load Golem roles: ${err.message}`);
  }
}

/**
 * Extract all role definitions from RDF dataset
 * @param {Object} dataset - RDF dataset
 * @returns {Object} Roles organized by domain
 */
export function datasetToRoles(dataset) {
  const rolesByDomain = {};

  // Find all subjects that are GolemRoles
  const roleQuads = Array.from(dataset.match(
    null,
    rdf.namedNode(PREFIXES.rdf + "type"),
    rdf.namedNode(PREFIXES.mfr + "GolemRole")
  ));

  roleQuads.forEach(quad => {
    const roleSubject = quad.subject;
    const role = extractRole(dataset, roleSubject);

    if (role && role.domain && role.id) {
      if (!rolesByDomain[role.domain]) {
        rolesByDomain[role.domain] = {};
      }
      rolesByDomain[role.domain][role.id] = role;
    }
  });

  return rolesByDomain;
}

/**
 * Extract a single role definition from the dataset
 * @param {Object} dataset - RDF dataset
 * @param {Object} subject - RDF subject node
 * @returns {GolemRole}
 */
function extractRole(dataset, subject) {
  const domain = extractLiteral(dataset, subject, PREFIXES.mfr + "domain");
  const name = extractLiteral(dataset, subject, PREFIXES.mfr + "roleName");
  const id = extractLiteral(dataset, subject, PREFIXES.mfr + "roleId");
  const systemPrompt = extractLiteral(dataset, subject, PREFIXES.mfr + "systemPrompt");
  const phase = extractPhase(dataset, subject);
  const capabilities = extractCapabilities(dataset, subject);

  if (!domain || !name || !id || !systemPrompt) {
    return null;
  }

  return new GolemRole({
    id,
    domain,
    name,
    systemPrompt,
    capabilities,
    phase
  });
}

/**
 * Extract capabilities for a role
 * @param {Object} dataset - RDF dataset
 * @param {Object} subject - RDF subject node
 * @returns {string[]} Array of capability identifiers
 */
function extractCapabilities(dataset, subject) {
  const capabilityQuads = Array.from(dataset.match(
    subject,
    rdf.namedNode(PREFIXES.mfr + "hasCapability"),
    null
  ));

  return capabilityQuads.map(quad => {
    const capUri = quad.object.value;
    return stripPrefix(capUri);
  });
}

/**
 * Extract optimal phase for a role
 * @param {Object} dataset - RDF dataset
 * @param {Object} subject - RDF subject node
 * @returns {string|null} Phase identifier
 */
function extractPhase(dataset, subject) {
  const phaseObj = extractObject(dataset, subject, PREFIXES.mfr + "optimalPhase");
  if (!phaseObj) return null;

  const phaseUri = phaseObj.value;
  const phaseName = stripPrefix(phaseUri);

  // Convert from CamelCase to snake_case to match existing convention
  return phaseName
    .replace(/Phase$/, '')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

// Helper functions

function extractLiteral(dataset, subject, predicateUri) {
  const quad = Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))[0];
  return quad?.object?.value;
}

function extractObject(dataset, subject, predicateUri) {
  const quad = Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))[0];
  return quad?.object;
}

function stripPrefix(uri) {
  return uri.split('#').pop().split('/').pop();
}

/**
 * Get a specific role by domain and role ID
 * @param {Object} roleLibrary - The loaded role library
 * @param {string} domain - Domain name
 * @param {string} roleId - Role ID
 * @returns {GolemRole|null}
 */
export function getRole(roleLibrary, domain, roleId) {
  return roleLibrary?.[domain]?.[roleId] || null;
}

/**
 * Get all roles for a specific domain
 * @param {Object} roleLibrary - The loaded role library
 * @param {string} domain - Domain name
 * @returns {Object} Roles for the domain
 */
export function getDomainRoles(roleLibrary, domain) {
  return roleLibrary?.[domain] || {};
}

/**
 * Get all roles suitable for a specific phase
 * @param {Object} roleLibrary - The loaded role library
 * @param {string} phase - Phase name
 * @returns {GolemRole[]} Array of roles
 */
export function getRolesForPhase(roleLibrary, phase) {
  const roles = [];

  Object.values(roleLibrary).forEach(domainRoles => {
    Object.values(domainRoles).forEach(role => {
      if (role.phase === phase || !role.phase) {
        roles.push(role);
      }
    });
  });

  return roles;
}

/**
 * Search roles by keyword in name or system prompt
 * @param {Object} roleLibrary - The loaded role library
 * @param {string} keyword - Search keyword
 * @returns {GolemRole[]} Matching roles
 */
export function searchRoles(roleLibrary, keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();

  Object.values(roleLibrary).forEach(domainRoles => {
    Object.values(domainRoles).forEach(role => {
      const matchesName = role.name.toLowerCase().includes(lowerKeyword);
      const matchesPrompt = role.systemPrompt.toLowerCase().includes(lowerKeyword);

      if (matchesName || matchesPrompt) {
        results.push(role);
      }
    });
  });

  return results;
}

/**
 * Get all available domains
 * @param {Object} roleLibrary - The loaded role library
 * @returns {string[]} Array of domain names
 */
export function getDomains(roleLibrary) {
  return Object.keys(roleLibrary);
}

/**
 * Get count of roles by domain
 * @param {Object} roleLibrary - The loaded role library
 * @returns {Object} Domain names mapped to role counts
 */
export function getRoleCounts(roleLibrary) {
  const counts = {};

  Object.entries(roleLibrary).forEach(([domain, roles]) => {
    counts[domain] = Object.keys(roles).length;
  });

  return counts;
}
