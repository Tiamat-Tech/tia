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
  xsd: "http://www.w3.org/2001/XMLSchema#",
  lng: "http://purl.org/stuff/lingue/",
  ibis: "https://vocab.methodandstructure.com/ibis#",
  mcp: "http://purl.org/stuff/mcp/"
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
  const lingue = extractLingueCapabilities(dataset, subject);
  const mcp = extractMcpMetadata(dataset, subject);

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
    lingue,
    metadata,
    mcp
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
 * Extract Lingue capabilities from agent profile
 */
function extractLingueCapabilities(dataset, subject) {
  const supports = extractObjects(dataset, subject, PREFIXES.lng + "supports")
    .map(obj => obj.value);
  const understands = extractObjects(dataset, subject, PREFIXES.lng + "understands")
    .map(obj => obj.value);
  const prefers = extractObjectValue(dataset, subject, PREFIXES.lng + "prefers");
  const profile = extractLingueProfile(dataset, subject);

  return {
    supports: new Set(supports),
    prefers,
    understands: new Set(understands),
    profile
  };
}

/**
 * Extract Lingue profile details linked from an agent
 */
function extractLingueProfile(dataset, subject) {
  const profileNode = extractObject(dataset, subject, PREFIXES.lng + "profile");
  if (!profileNode) return null;

  const availability = extractObjectValue(dataset, profileNode, PREFIXES.lng + "availability");
  const inputs = extractObjectValues(dataset, profileNode, PREFIXES.lng + "in");
  const outputs = extractObjectValues(dataset, profileNode, PREFIXES.lng + "out");
  const dependencies = extractObjectValues(dataset, profileNode, PREFIXES.lng + "dependsOn")
    .concat(extractObjectValues(dataset, profileNode, PREFIXES.lng + "hasDependency"));
  const algorithmLanguage = extractLiteral(dataset, profileNode, PREFIXES.lng + "alang");
  const location = extractObjectValue(dataset, profileNode, PREFIXES.lng + "location");

  return {
    uri: profileNode.termType === "NamedNode" ? profileNode.value : null,
    availability,
    inputs,
    outputs,
    dependencies,
    algorithmLanguage,
    location
  };
}

/**
 * Extract MCP metadata (minimal)
 */
function extractMcpMetadata(dataset, subject) {
  const isClient = hasType(dataset, subject, PREFIXES.mcp + "Client");
  if (!isClient) {
    return {
      role: null,
      servers: [],
      tools: [],
      resources: [],
      prompts: [],
      endpoints: []
    };
  }

  const tools = extractObjects(dataset, subject, PREFIXES.mcp + "providesTool").map((toolNode) => ({
    name: extractLiteral(dataset, toolNode, PREFIXES.mcp + "name"),
    description: extractLiteral(dataset, toolNode, PREFIXES.mcp + "description")
  })).filter(tool => tool.name);

  const resources = extractObjects(dataset, subject, PREFIXES.mcp + "providesResource").map((resourceNode) => ({
    name: extractLiteral(dataset, resourceNode, PREFIXES.mcp + "name"),
    uri: extractLiteral(dataset, resourceNode, PREFIXES.mcp + "uri"),
    mimeType: extractLiteral(dataset, resourceNode, PREFIXES.mcp + "mimeType")
  })).filter(resource => resource.uri || resource.name);

  const prompts = extractObjects(dataset, subject, PREFIXES.mcp + "providesPrompt").map((promptNode) => ({
    name: extractLiteral(dataset, promptNode, PREFIXES.mcp + "name"),
    description: extractLiteral(dataset, promptNode, PREFIXES.mcp + "description")
  })).filter(prompt => prompt.name);

  return {
    role: "client",
    servers: [],
    tools,
    resources,
    prompts,
    endpoints: resources.map(resource => resource.uri).filter(Boolean)
  };
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

  if (profile.lingue) {
    profile.lingue.supports?.forEach((modeUri) => {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "supports"),
        rdf.namedNode(modeUri)
      ));
    });

    if (profile.lingue.prefers) {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "prefers"),
        rdf.namedNode(profile.lingue.prefers)
      ));
    }

    profile.lingue.understands?.forEach((resourceUri) => {
      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "understands"),
        rdf.namedNode(resourceUri)
      ));
    });

    if (profile.lingue.profile) {
      const profileNode = profile.lingue.profile.uri
        ? rdf.namedNode(profile.lingue.profile.uri)
        : rdf.blankNode();

      dataset.add(rdf.quad(
        subject,
        rdf.namedNode(PREFIXES.lng + "profile"),
        profileNode
      ));

      if (profile.lingue.profile.availability) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "availability"),
          nodeFromValue(profile.lingue.profile.availability)
        ));
      }

      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "in",
        profile.lingue.profile.inputs, PREFIXES.lng + "Interface");
      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "out",
        profile.lingue.profile.outputs, PREFIXES.lng + "Interface");
      addProfileComponentTriples(dataset, profileNode, PREFIXES.lng + "dependsOn",
        profile.lingue.profile.dependencies, PREFIXES.lng + "Dependency");

      if (profile.lingue.profile.algorithmLanguage) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "alang"),
          rdf.literal(profile.lingue.profile.algorithmLanguage)
        ));
      }

      if (profile.lingue.profile.location) {
        dataset.add(rdf.quad(
          profileNode,
          rdf.namedNode(PREFIXES.lng + "location"),
          nodeFromValue(profile.lingue.profile.location)
        ));
      }
    }
  }

  if (profile.mcp) {
    addMcpMetadata(dataset, subject, profile.mcp);
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
    dcterms: PREFIXES.dcterms,
    lng: PREFIXES.lng,
    ibis: PREFIXES.ibis,
    rdfs: PREFIXES.rdfs,
    mcp: PREFIXES.mcp
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

function hasType(dataset, subject, typeUri) {
  return dataset.match(subject, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(typeUri)).size > 0;
}

function extractObjects(dataset, subject, predicateUri) {
  return Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))
    .map(quad => quad.object);
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

function extractObjectValue(dataset, subject, predicateUri) {
  const obj = extractObject(dataset, subject, predicateUri);
  return obj ? resolveNodeValue(dataset, obj) : null;
}

function extractObjectValues(dataset, subject, predicateUri) {
  return extractObjects(dataset, subject, predicateUri)
    .map(obj => resolveNodeValue(dataset, obj));
}

function resolveNodeValue(dataset, node) {
  if (node.termType === "Literal") return node.value;
  if (node.termType === "NamedNode") return node.value;
  const label = extractLiteral(dataset, node, PREFIXES.rdfs + "label");
  return label || node.value || null;
}

function nodeFromValue(value) {
  if (!value) return rdf.literal("");
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("#")) {
    return rdf.namedNode(value);
  }
  return rdf.literal(value);
}

function addProfileComponentTriples(dataset, profileNode, predicateUri, values, typeUri) {
  if (!values || values.length === 0) return;

  values.forEach((value) => {
    if (!value) return;
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("#")) {
      dataset.add(rdf.quad(
        profileNode,
        rdf.namedNode(predicateUri),
        rdf.namedNode(value)
      ));
      return;
    }

    const componentNode = rdf.blankNode();
    dataset.add(rdf.quad(
      profileNode,
      rdf.namedNode(predicateUri),
      componentNode
    ));
    dataset.add(rdf.quad(
      componentNode,
      rdf.namedNode(PREFIXES.rdf + "type"),
      rdf.namedNode(typeUri)
    ));
    dataset.add(rdf.quad(
      componentNode,
      rdf.namedNode(PREFIXES.rdfs + "label"),
      rdf.literal(value)
    ));
  });
}

function addMcpMetadata(dataset, subject, mcp) {
  const hasAny = (mcp.tools?.length || 0)
    + (mcp.resources?.length || 0)
    + (mcp.prompts?.length || 0);
  if (!hasAny) return;

  dataset.add(rdf.quad(
    subject,
    rdf.namedNode(PREFIXES.rdf + "type"),
    rdf.namedNode(PREFIXES.mcp + "Client")
  ));

  if (mcp.tools?.length) {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.mcp + "hasCapability"),
      rdf.namedNode(PREFIXES.mcp + "ToolsCapability")
    ));
    mcp.tools.forEach((tool) => {
      const toolNode = rdf.blankNode();
      dataset.add(rdf.quad(subject, rdf.namedNode(PREFIXES.mcp + "providesTool"), toolNode));
      dataset.add(rdf.quad(toolNode, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(PREFIXES.mcp + "Tool")));
      if (tool.name) {
        dataset.add(rdf.quad(toolNode, rdf.namedNode(PREFIXES.mcp + "name"), rdf.literal(tool.name)));
      }
      if (tool.description) {
        dataset.add(rdf.quad(toolNode, rdf.namedNode(PREFIXES.mcp + "description"), rdf.literal(tool.description)));
      }
    });
  }

  if (mcp.resources?.length) {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.mcp + "hasCapability"),
      rdf.namedNode(PREFIXES.mcp + "ResourcesCapability")
    ));
    mcp.resources.forEach((resource) => {
      const resourceNode = rdf.blankNode();
      dataset.add(rdf.quad(subject, rdf.namedNode(PREFIXES.mcp + "providesResource"), resourceNode));
      dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(PREFIXES.mcp + "Resource")));
      if (resource.name) {
        dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.mcp + "name"), rdf.literal(resource.name)));
      }
      if (resource.uri) {
        dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.mcp + "uri"), rdf.literal(resource.uri)));
      }
      if (resource.mimeType) {
        dataset.add(rdf.quad(resourceNode, rdf.namedNode(PREFIXES.mcp + "mimeType"), rdf.literal(resource.mimeType)));
      }
    });
  }

  if (mcp.prompts?.length) {
    dataset.add(rdf.quad(
      subject,
      rdf.namedNode(PREFIXES.mcp + "hasCapability"),
      rdf.namedNode(PREFIXES.mcp + "PromptsCapability")
    ));
    mcp.prompts.forEach((prompt) => {
      const promptNode = rdf.blankNode();
      dataset.add(rdf.quad(subject, rdf.namedNode(PREFIXES.mcp + "providesPrompt"), promptNode));
      dataset.add(rdf.quad(promptNode, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(PREFIXES.mcp + "Prompt")));
      if (prompt.name) {
        dataset.add(rdf.quad(promptNode, rdf.namedNode(PREFIXES.mcp + "name"), rdf.literal(prompt.name)));
      }
      if (prompt.description) {
        dataset.add(rdf.quad(promptNode, rdf.namedNode(PREFIXES.mcp + "description"), rdf.literal(prompt.description)));
      }
    });
  }
}

function stripPrefix(uri) {
  return uri.split('#').pop().split('/').pop();
}
