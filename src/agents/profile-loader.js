import fs from "fs/promises";
import path from "path";
import rdf from "rdf-ext";
import { Writer } from "n3";
import { turtleToDataset } from "../lib/ibis-rdf.js";
import { AgentProfile } from "./profile/agent-profile.js";
import { XmppConfig } from "./profile/xmpp-config.js";
import { MistralProviderConfig, GroqProviderConfig, SememProviderConfig, DataProviderConfig } from "./profile/provider-config.js";
import { Capability } from "./profile/capability.js";

const DEFAULT_PROFILE_DIR = path.join(process.cwd(), "config", "agents");
const AGENT_PROFILE_DIR = process.env.AGENT_PROFILE_DIR || DEFAULT_PROFILE_DIR;
const defaultSecretsPath = (profileDir) =>
  process.env.AGENT_SECRETS_PATH || path.join(profileDir || AGENT_PROFILE_DIR, "secrets.json");
const secretsCache = new Map();

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
  mfr: "http://purl.org/stuff/mfr/",
  mcp: "http://purl.org/stuff/mcp/"
};

/**
 * Load agent profile from Turtle file
 */
export async function loadAgentProfile(name, options = {}) {
  if (!name) return null;

  const profileDir = options.profileDir || process.env.AGENT_PROFILE_DIR || DEFAULT_PROFILE_DIR;
  const filePath = path.join(profileDir, `${name}.ttl`);

  try {
    const turtle = await fs.readFile(filePath, "utf8");
    const subjectUri = options.subjectUri || `#${name}`;
    const secrets = await loadSecrets(options.secretsPath || defaultSecretsPath(profileDir));
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
  const secrets = await loadSecrets(options.secretsPath);
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
export function datasetToProfile(dataset, subject, options = {}) {
  const identifier = extractLiteral(dataset, subject, PREFIXES.schema + "identifier");
  const nickname = extractLiteral(dataset, subject, PREFIXES.foaf + "nick");
  const roomJid = extractLiteral(dataset, subject, PREFIXES.agent + "roomJid");

  const types = Array.from(
    dataset.match(subject, rdf.namedNode(PREFIXES.rdf + "type"), null)
  ).map(quad => stripPrefix(quad.object.value));

  const xmppAccount = extractXmppConfig(dataset, subject, options);
  const provider = extractProviderConfig(dataset, subject);
  const capabilities = extractCapabilities(dataset, subject);
  const lingue = extractLingueCapabilities(dataset, subject);
  const mcp = extractMcpMetadata(dataset, subject);
  const mfrConfig = extractMfrConfig(dataset, subject);
  const mfrRooms = extractMfrRooms(dataset, subject);

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
    mcp,
    customProperties: {
      mfrConfig,
      mfrRooms
    }
  });
}

/**
 * Extract XMPP configuration from blank node
 */
function extractXmppConfig(dataset, subject, options = {}) {
  const xmppAccountNode = extractObject(dataset, subject, PREFIXES.agent + "xmppAccount");
  if (!xmppAccountNode) return null;

  const passwordKey = extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "passwordKey");
  const password = passwordKey
    ? resolveXmppPassword(passwordKey, options.secrets)
    : null;
  if (!passwordKey && !options.allowMissingPasswordKey) {
    throw new Error("Missing xmpp:passwordKey in agent profile.");
  }

  return new XmppConfig({
    service: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "service"),
    domain: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "domain"),
    username: extractLiteral(dataset, xmppAccountNode, PREFIXES.xmpp + "username"),
    password,
    passwordKey,
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

  providerNode = extractObject(dataset, subject, PREFIXES.agent + "groqProvider");
  if (providerNode) {
    return extractGroqProvider(dataset, providerNode);
  }

  providerNode = extractObject(dataset, subject, PREFIXES.agent + "mcpProvider");
  if (providerNode) {
    return extractSememProvider(dataset, providerNode);
  }

  providerNode = extractObject(dataset, subject, PREFIXES.agent + "dataProvider");
  if (providerNode) {
    return extractDataProvider(dataset, providerNode);
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
      PREFIXES.agent + "lingueConfidenceMin"),
    systemPrompt: extractLiteral(dataset, providerNode, PREFIXES.ai + "systemPrompt"),
    systemTemplate: extractLiteral(dataset, providerNode, PREFIXES.ai + "systemTemplate")
  });
}

/**
 * Extract Groq provider config
 */
function extractGroqProvider(dataset, providerNode) {
  return new GroqProviderConfig({
    model: extractLiteral(dataset, providerNode, PREFIXES.ai + "model"),
    apiKeyEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "apiKeyEnv"),
    maxTokens: extractInteger(dataset, providerNode, PREFIXES.ai + "maxTokens"),
    temperature: extractFloat(dataset, providerNode, PREFIXES.ai + "temperature"),
    lingueEnabled: extractBoolean(dataset, providerNode,
      PREFIXES.agent + "lingueEnabled"),
    lingueConfidenceMin: extractFloat(dataset, providerNode,
      PREFIXES.agent + "lingueConfidenceMin"),
    systemPrompt: extractLiteral(dataset, providerNode, PREFIXES.ai + "systemPrompt"),
    systemTemplate: extractLiteral(dataset, providerNode, PREFIXES.ai + "systemTemplate")
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
 * Extract Data provider config
 */
function extractDataProvider(dataset, providerNode) {
  return new DataProviderConfig({
    sparqlEndpoint: extractLiteral(dataset, providerNode, PREFIXES.ai + "sparqlEndpoint"),
    extractionModel: extractLiteral(dataset, providerNode, PREFIXES.ai + "extractionModel"),
    extractionApiKeyEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "extractionApiKeyEnv"),
    maxTokens: extractInteger(dataset, providerNode, PREFIXES.ai + "maxTokens"),
    temperature: extractFloat(dataset, providerNode, PREFIXES.ai + "temperature")
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
    const aliases = extractLiterals(dataset, capUri, PREFIXES.agent + "commandAlias");

    return new Capability({ name, label, description, command, aliases });
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
 * Extract MFR coordinator configuration
 */
function extractMfrConfig(dataset, subject) {
  const configNode = extractObject(dataset, subject, PREFIXES.agent + "mfrConfig");
  if (!configNode) return null;

  return {
    shapesPath: extractLiteral(dataset, configNode, PREFIXES.mfr + "shapesPath"),
    enableMultiRoom: extractBoolean(dataset, configNode, PREFIXES.mfr + "enableMultiRoom"),
    contributionTimeout: extractInteger(dataset, configNode, PREFIXES.mfr + "contributionTimeout"),
    validationTimeout: extractInteger(dataset, configNode, PREFIXES.mfr + "validationTimeout"),
    reasoningTimeout: extractInteger(dataset, configNode, PREFIXES.mfr + "reasoningTimeout"),
    debateTimeout: extractInteger(dataset, configNode, PREFIXES.mfr + "debateTimeout"),
    enableDebate: extractBoolean(dataset, configNode, PREFIXES.mfr + "enableDebate")
  };
}

/**
 * Extract MFR room configuration
 */
function extractMfrRooms(dataset, subject) {
  const roomsNode = extractObject(dataset, subject, PREFIXES.agent + "mfrRooms");
  if (!roomsNode) return null;

  return {
    construct: extractLiteral(dataset, roomsNode, PREFIXES.mfr + "constructRoom"),
    validate: extractLiteral(dataset, roomsNode, PREFIXES.mfr + "validateRoom"),
    reason: extractLiteral(dataset, roomsNode, PREFIXES.mfr + "reasonRoom")
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
    if (xmpp.passwordKey) {
      dataset.add(rdf.quad(
        xmppNode,
        rdf.namedNode(PREFIXES.xmpp + "passwordKey"),
        rdf.literal(xmpp.passwordKey)
      ));
    }
    dataset.add(rdf.quad(xmppNode, rdf.namedNode(PREFIXES.xmpp + "resource"), rdf.literal(xmpp.resource)));
  }

  if (profile.provider) {
    const providerNode = rdf.blankNode();
    let providerPredicate;
    if (profile.provider.type === 'mistral') {
      providerPredicate = PREFIXES.agent + "aiProvider";
    } else if (profile.provider.type === 'semem') {
      providerPredicate = PREFIXES.agent + "mcpProvider";
    } else if (profile.provider.type === 'data') {
      providerPredicate = PREFIXES.agent + "dataProvider";
    } else {
      providerPredicate = PREFIXES.agent + "aiProvider";
    }

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

async function loadSecrets(secretsPath) {
  const resolvedPath = secretsPath || defaultSecretsPath();
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

function resolveXmppPassword(passwordKey, secrets) {
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

function extractBaseProfileNames(dataset, subject) {
  return extractObjects(dataset, subject, PREFIXES.dcterms + "isPartOf")
    .map(nodeToProfileName)
    .filter(Boolean);
}

function nodeToProfileName(node) {
  if (!node) return null;
  if (node.termType === "Literal") {
    return normalizeProfileName(node.value);
  }
  if (node.termType !== "NamedNode") return null;
  const value = node.value;
  if (value.includes("#")) {
    return normalizeProfileName(value.split("#").pop());
  }
  if (value.includes("/")) {
    return normalizeProfileName(value.split("/").pop());
  }
  return normalizeProfileName(value);
}

function normalizeProfileName(value) {
  if (!value) return null;
  return value.endsWith(".ttl") ? value.slice(0, -4) : value;
}

function mergeAgentProfiles(baseProfile, derivedProfile) {
  if (!baseProfile) return derivedProfile;
  if (!derivedProfile) return baseProfile;

  const mergedXmpp = mergeXmppAccounts(baseProfile.xmppAccount, derivedProfile.xmppAccount);
  const mergedProvider = mergeProviderConfigs(baseProfile.provider, derivedProfile.provider);
  const mergedCapabilities = mergeCapabilities(baseProfile, derivedProfile);
  const mergedLingue = mergeLingue(baseProfile, derivedProfile);
  const mergedMcp = mergeMcp(baseProfile, derivedProfile);
  const mergedMetadata = mergeMetadata(baseProfile, derivedProfile);
  const mergedTypes = dedupeArray([...(baseProfile.type || []), ...(derivedProfile.type || [])]);

  return new AgentProfile({
    identifier: derivedProfile.identifier || baseProfile.identifier,
    nickname: derivedProfile.nickname || baseProfile.nickname,
    type: mergedTypes,
    xmppAccount: mergedXmpp,
    roomJid: derivedProfile.roomJid || baseProfile.roomJid,
    provider: mergedProvider,
    capabilities: mergedCapabilities,
    lingue: mergedLingue,
    mcp: mergedMcp,
    metadata: mergedMetadata,
    customProperties: {
      ...(baseProfile.custom || {}),
      ...(derivedProfile.custom || {})
    }
  });
}

function assertXmppPassword(profile) {
  if (!profile?.xmppAccount) return;
  if (!profile.xmppAccount.password) {
    const identifier = profile.identifier || profile.nickname || "unknown";
    throw new Error(`XMPP password missing for profile "${identifier}".`);
  }
}

function mergeXmppAccounts(baseXmpp, derivedXmpp) {
  if (!baseXmpp && !derivedXmpp) return null;
  if (!baseXmpp) return derivedXmpp;
  if (!derivedXmpp) return baseXmpp;

  return new XmppConfig({
    service: derivedXmpp.service || baseXmpp.service,
    domain: derivedXmpp.domain || baseXmpp.domain,
    username: derivedXmpp.username || baseXmpp.username,
    password: derivedXmpp.password || baseXmpp.password,
    passwordKey: derivedXmpp.passwordKey || baseXmpp.passwordKey,
    resource: derivedXmpp.resource || baseXmpp.resource,
    tlsRejectUnauthorized: derivedXmpp.tls?.rejectUnauthorized ?? baseXmpp.tls?.rejectUnauthorized ?? false
  });
}

function mergeProviderConfigs(baseProvider, derivedProvider) {
  if (!baseProvider) return derivedProvider;
  if (!derivedProvider) return baseProvider;
  if (baseProvider.type !== derivedProvider.type) return derivedProvider;

  const mergedConfig = { ...baseProvider.config, ...derivedProvider.config };
  if (baseProvider.type === "mistral") {
    return new MistralProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "groq") {
    return new GroqProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "semem") {
    return new SememProviderConfig(mergedConfig);
  }
  if (baseProvider.type === "data") {
    return new DataProviderConfig(mergedConfig);
  }
  return derivedProvider;
}

function mergeCapabilities(baseProfile, derivedProfile) {
  const merged = new Map();
  baseProfile?.capabilities?.forEach((cap, key) => merged.set(key, cap));
  derivedProfile?.capabilities?.forEach((cap, key) => merged.set(key, cap));
  return Array.from(merged.values());
}

function mergeLingue(baseProfile, derivedProfile) {
  const baseLingue = baseProfile?.lingue || {};
  const derivedLingue = derivedProfile?.lingue || {};
  const supports = new Set([...(baseLingue.supports || []), ...(derivedLingue.supports || [])]);
  const understands = new Set([...(baseLingue.understands || []), ...(derivedLingue.understands || [])]);
  return {
    supports,
    prefers: derivedLingue.prefers || baseLingue.prefers || null,
    understands,
    profile: derivedLingue.profile || baseLingue.profile || null
  };
}

function mergeMcp(baseProfile, derivedProfile) {
  const baseMcp = baseProfile?.mcp || {};
  const derivedMcp = derivedProfile?.mcp || {};
  return {
    role: derivedMcp.role || baseMcp.role || null,
    servers: mergeMcpList(baseMcp.servers, derivedMcp.servers, (item) => item?.uri || item?.name),
    tools: mergeMcpList(baseMcp.tools, derivedMcp.tools, (item) => item?.name),
    resources: mergeMcpList(baseMcp.resources, derivedMcp.resources, (item) => item?.uri || item?.name),
    prompts: mergeMcpList(baseMcp.prompts, derivedMcp.prompts, (item) => item?.name),
    endpoints: mergeMcpList(baseMcp.endpoints, derivedMcp.endpoints, (item) => item?.uri || item?.name)
  };
}

function mergeMcpList(baseList = [], derivedList = [], keyFn) {
  const merged = new Map();
  [...baseList, ...derivedList].forEach((item) => {
    if (!item) return;
    const key = keyFn?.(item) || JSON.stringify(item);
    merged.set(key, item);
  });
  return Array.from(merged.values());
}

function mergeMetadata(baseProfile, derivedProfile) {
  const baseMeta = baseProfile?.metadata || {};
  const derivedMeta = derivedProfile?.metadata || {};
  return {
    created: derivedMeta.created || baseMeta.created,
    modified: derivedMeta.modified || baseMeta.modified,
    description: derivedMeta.description || baseMeta.description
  };
}

function dedupeArray(values) {
  return Array.from(new Set(values.filter(Boolean)));
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

/**
 * Extract multiple literal values for a given predicate
 */
function extractLiterals(dataset, subject, predicateUri) {
  return Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))
    .map(quad => quad.object.value);
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
