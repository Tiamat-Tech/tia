import rdf from "rdf-ext";
import { AgentProfile } from "./agent-profile.js";
import { XmppConfig } from "./xmpp-config.js";
import { MistralProviderConfig, GroqProviderConfig, SememProviderConfig, DataProviderConfig } from "./provider-config.js";
import { Capability } from "./capability.js";
import {
  PREFIXES,
  extractLiteral,
  extractObject,
  extractObjects,
  extractLiterals,
  extractBoolean,
  extractInteger,
  extractFloat,
  extractObjectValue,
  extractObjectValues,
  stripPrefix,
  hasType
} from "./profile-rdf.js";
import { resolveXmppPassword } from "./profile-io.js";

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

function extractDataProvider(dataset, providerNode) {
  return new DataProviderConfig({
    sparqlEndpoint: extractLiteral(dataset, providerNode, PREFIXES.ai + "sparqlEndpoint"),
    extractionModel: extractLiteral(dataset, providerNode, PREFIXES.ai + "extractionModel"),
    extractionApiKeyEnv: extractLiteral(dataset, providerNode, PREFIXES.ai + "extractionApiKeyEnv"),
    maxTokens: extractInteger(dataset, providerNode, PREFIXES.ai + "maxTokens"),
    temperature: extractFloat(dataset, providerNode, PREFIXES.ai + "temperature")
  });
}

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
    enableDebate: extractBoolean(dataset, configNode, PREFIXES.mfr + "enableDebate"),
    planningDefaultRoute: extractLiteral(dataset, configNode, PREFIXES.mfr + "planningDefaultRoute")
  };
}

function extractMfrRooms(dataset, subject) {
  const roomsNode = extractObject(dataset, subject, PREFIXES.agent + "mfrRooms");
  if (!roomsNode) return null;

  return {
    construct: extractLiteral(dataset, roomsNode, PREFIXES.mfr + "constructRoom"),
    validate: extractLiteral(dataset, roomsNode, PREFIXES.mfr + "validateRoom"),
    reason: extractLiteral(dataset, roomsNode, PREFIXES.mfr + "reasonRoom")
  };
}
