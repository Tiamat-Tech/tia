import rdf from "rdf-ext";

export const PREFIXES = {
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

export function extractLiteral(dataset, subject, predicateUri) {
  const quad = Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))[0];
  return quad?.object?.value;
}

export function extractObject(dataset, subject, predicateUri) {
  const quad = Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))[0];
  return quad?.object;
}

export function extractObjects(dataset, subject, predicateUri) {
  return Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))
    .map(quad => quad.object);
}

export function extractLiterals(dataset, subject, predicateUri) {
  return Array.from(dataset.match(subject, rdf.namedNode(predicateUri), null))
    .map(quad => quad.object.value);
}

export function extractBoolean(dataset, subject, predicateUri, defaultValue) {
  const value = extractLiteral(dataset, subject, predicateUri);
  if (value === undefined) return defaultValue;
  return value === "true" || value === true;
}

export function extractInteger(dataset, subject, predicateUri) {
  const value = extractLiteral(dataset, subject, predicateUri);
  return value ? parseInt(value, 10) : undefined;
}

export function extractFloat(dataset, subject, predicateUri) {
  const value = extractLiteral(dataset, subject, predicateUri);
  return value ? parseFloat(value) : undefined;
}

export function extractObjectValue(dataset, subject, predicateUri) {
  const obj = extractObject(dataset, subject, predicateUri);
  return obj ? resolveNodeValue(dataset, obj) : null;
}

export function extractObjectValues(dataset, subject, predicateUri) {
  return extractObjects(dataset, subject, predicateUri)
    .map(obj => resolveNodeValue(dataset, obj));
}

export function resolveNodeValue(dataset, node) {
  if (node.termType === "Literal") return node.value;
  if (node.termType === "NamedNode") return node.value;
  const label = extractLiteral(dataset, node, PREFIXES.rdfs + "label");
  return label || node.value || null;
}

export function nodeFromValue(value) {
  if (!value) return rdf.literal("");
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("#")) {
    return rdf.namedNode(value);
  }
  return rdf.literal(value);
}

export function addProfileComponentTriples(dataset, profileNode, predicateUri, values, typeUri) {
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

export function addMcpMetadata(dataset, subject, mcp) {
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

export function stripPrefix(uri) {
  return uri.split('#').pop().split('/').pop();
}

export function hasType(dataset, subject, typeUri) {
  return dataset.match(subject, rdf.namedNode(PREFIXES.rdf + "type"), rdf.namedNode(typeUri)).size > 0;
}

export function extractBaseProfileNames(dataset, subject) {
  return extractObjects(dataset, subject, PREFIXES.dcterms + "isPartOf")
    .map(nodeToProfileName)
    .filter(Boolean);
}

export function nodeToProfileName(node) {
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

export function normalizeProfileName(value) {
  if (!value) return null;
  return value.endsWith(".ttl") ? value.slice(0, -4) : value;
}
