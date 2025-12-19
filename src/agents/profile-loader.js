import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { Writer } from "n3";
import { turtleToDataset } from "../lib/ibis-rdf.js";
import { AgentProfile } from "./profile/agent-profile.js";
import { XmppConfig } from "./profile/xmpp-config.js";
import { MistralProviderConfig, SememProviderConfig } from "./profile/provider-config.js";
import { Capability } from "./profile/capability.js";

const AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR ||
  path.join(process.cwd(), "config", "agents");

const PREFIXES = {
  agent: "https://tensegrity.it/vocab/agent#",
  foaf: "http://xmlns.com/foaf/0.1/",
  schema: "https://schema.org/",
  xmpp: "https://tensegrity.it/vocab/xmpp#",
  ai: "https://tensegrity.it/vocab/ai-provider#",
  dcterms: "http://purl.org/dc/terms/",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#"
};

/**
 * Load agent profile from Turtle file
 */
export async function loadAgentProfile(name, options = {}) {
  if (!name) return null;

  const filePath = path.join(AGENT_PROFILE_DIR, `${name}.ttl`);

  try {
    const turtle = await fs.readFile(filePath, "utf8");
    const subjectUri = options.subjectUri || `#${name}`;
    return await parseAgentProfile(turtle, subjectUri);
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
export async function parseAgentProfile(turtle, subjectUri) {
  const dataset = await turtleToDataset(turtle);
  const subject = rdf.namedNode(subjectUri);
  return datasetToProfile(dataset, subject);
}

/**
 * Extract AgentProfile from RDF dataset
 */
export function datasetToProfile(dataset, subject) {
  const identifier = extractLiteral(dataset, subject, PREFIXES.schema + "identifier");
  const nickname = extractLiteral(dataset, subject, PREFIXES.foaf + "nick");
  const roomJid = extractLiteral(dataset, subject, PREFIXES.agent + "roomJid");

  const types = Array.from(
    dataset.match(subject, rdf.namedNode(PREFIXES.rdf + "type"), null)
  ).map(quad => stripPrefix(quad.object.value));

  const xmppAccount = extractXmppConfig(dataset, subject);
  const provider = extractProviderConfig(dataset, subject);
  const capabilities = extractCapabilities(dataset, subject);

  const metadata = {
    created: extractLiteral(dataset, subject, PREFIXES.dcterms + "created"),
    modified: extractLiteral(dataset, subject, PREFIXES.dcterms + "modified"),
    description: extractLiteral(dataset, subject, PREFIXES.dcterms + "description")
  };

  return new AgentProfile({
    identifier,
    nickname,
    type: types,
    xmppAccount,
    roomJid,
    provider,
    capabilities,
    metadata
  });
}

/**
 * Extract XMPP configuration from blank node
 */
function extractXmppConfig(dataset, subject) {
  const xmppAccountNode = extractObject(dataset, subject, PREFIXES.agent + "xmppAccount");
  if (!xmppAccountNode) return null;

  return new XmppConfig({
    service: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "service"),
    domain: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "domain"),
    username: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "username"),
    password: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "password"),
    resource: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "resource"),
    tlsRejectUnauthorized: extractBoolean(dataset, xmppAccountNode,
      PREFIXES.xmpp + "tlsRejectUnauthorized", false)
  });
}

/**
 * Extract provider configuration (polymorphic based on type)
 */
function extractProviderConfig(dataset, subject) {
  let providerNode = extractObject(dataset, subject, PREFIXES.agent + "aiProvider");
  if (providerNode) {
    return extractMistralProvider(dataset, providerNode);
  }

  providerNode = extractObject(dataset, subject, PREFIXES.agent + "mcpProvider");
  if (providerNode) {
    return extractSememProvider(dataset, providerNode);
  }

  return null;
}

/**
 * Extract Mistral provider config
 */
function extractMistralProvider(dataset, providerNode) {
  return new MistralProviderConfig({
    model: extractLiteral(dataset, providerNode, PREFIXES.ai + "model"),
    apiKeyEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "apiKeyEnv"),
    maxTokens: extractInteger(dataset, providerNode, PREFIXES.ai + "maxTokens"),
    temperature: extractFloat(dataset, providerNode, PREFIXES.ai + "temperature"),
    lingueEnabled: extractBoolean(dataset, providerNode,
      PREFIXES.agent + "lingueEnabled"),
    lingueConfidenceMin: extractFloat(dataset, providerNode,
      PREFIXES.agent + "lingueConfidenceMin")
  });
}

/**
 * Extract Semem provider config
 */
function extractSememProvider(dataset, providerNode) {
  const featuresNode = extractObject(dataset, providerNode, PREFIXES.ai + "features");
  const features = featuresNode ? {
    useWikipedia: extractBoolean(dataset, featuresNode, PREFIXES.ai + "useWikipedia", false),
    useWikidata: extractBoolean(dataset, featuresNode, PREFIXES.ai + "useWikidata", false),
    useWebSearch: extractBoolean(dataset, featuresNode, PREFIXES.ai + "useWebSearch", false)
  } : {};

  return new SememProviderConfig({
    baseUrl: extractLiteral(dataset, providerNode, PREFIXES.ai + "baseUrl"),
    authTokenEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "authTokenEnv"),
    timeoutMs: extractInteger(dataset, providerNode, PREFIXES.ai + "timeoutMs"),
    features
  });
}

/**
 * Extract capabilities
 */
function extractCapabilities(dataset, subject) {
  const capabilityUris = Array.from(
    dataset.match(subject, rdf.namedNode(PREFIXES.agent + "hasCapability"), null)
  ).map(quad => quad.object);

  return capabilityUris.map(capUri => {
    const name = stripPrefix(capUri.value);
    const label = extractLiteral(dataset, capUri, PREFIXES.rdfs + "label");
    const description = extractLiteral(dataset, capUri, PREFIXES.dcterms + "description");
    const command = extractLiteral(dataset, capUri, PREFIXES.agent + "command");

    return new Capability({ name, label, description, command });
  });
}

/**
 * Convert AgentProfile to RDF dataset
 */
export function profileToDataset(profile) {
  const dataset = rdf.dataset();
  const subject = rdf.namedNode(`#${profile.identifier}`);

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.foaf + "nick"),
    rdf.literal(profile.nickname)
  ));

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.schema + "identifier"),
    rdf.literal(profile.identifier)
  ));

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.agent + "roomJid"),
    rdf.literal(profile.roomJid)
  ));

  profile.type.forEach(type => {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.rdf + "type"),
      rdf.namedNode(PREFIXES.agent + type)
    ));
  });

  if (profile.xmppAccount) {
    const xmppNode = rdf.blankNode();
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.agent + "xmppAccount"),
      xmppNode
    ));

    const xmpp = profile.xmppAccount;
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "service"), rdf.literal(xmpp.service)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "domain"), rdf.literal(xmpp.domain)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "username"), rdf.literal(xmpp.username)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "password"), rdf.literal(xmpp.password)));
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "resource"), rdf.literal(xmpp.resource)));
  }

  if (profile.provider) {
    const providerNode = rdf.blankNode();
    const providerPredicate = profile.provider.type === 'mistral'
      ? PREFIXES.agent + "aiProvider"
      : PREFIXES.agent + "mcpProvider";

    dataset.add(rdf.quad(subject, rdf.namedNode(providerPredicate), providerNode));

    const config = profile.provider.config;
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'features') {
        const predicate = PREFIXES.ai + key;
        dataset.add(rdf.quad(providerNode, rdf.namedNode(predicate), rdf.literal(String(value))));
      }
    });

    if (config.features) {
      const featuresNode = rdf.blankNode();
      dataset.add(rdf.quad(providerNode, rdf.namedNode(PREFIXES.ai + "features"), featuresNode));
      Object.entries(config.features).forEach(([key, value]) => {
        dataset.add(rdf.quad(
          featuresNode,
          rdf.namedNode(PREFIXES.ai + key),
          rdf.literal(String(value))
        ));
      });
    }
  }

  return dataset;
}

/**
 * Convert AgentProfile to Turtle string
 */
export async function profileToTurtle(profile) {
  const dataset = profileToDataset(profile);
  const writer = new Writer({ prefixes: {
    agent: PREFIXES.agent,
    foaf: PREFIXES.foaf,
    schema: PREFIXES.schema,
    xmpp: PREFIXES.xmpp,
    ai: PREFIXES.ai,
    dcterms: PREFIXES.dcterms
  }});

  dataset.forEach((quad) => {
    writer.addQuad(quad);
  });

  return new Promise((resolve, reject) => {
    writer.end((err, result) => {
      if (err) return reject(err);
      resolve(result.trim());
    });
  });
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

function extractBoolean(dataset, subject, predicateUri, defaultValue) {
  const value = extractLiteral(dataset, subject, predicateUri);
  if (value === undefined) return defaultValue;
  return value === "true" || value === true;
}

function extractInteger(dataset, subject, predicateUri) {
  const value = extractLiteral(dataset, subject, predicateUri);
  return value ? parseInt(value, 10) : undefined;
}

function extractFloat(dataset, subject, predicateUri) {
  const value = extractLiteral(dataset, subject, predicateUri);
  return value ? parseFloat(value) : undefined;
}

function stripPrefix(uri) {
  return uri.split('#').pop().split('/').pop();
}
