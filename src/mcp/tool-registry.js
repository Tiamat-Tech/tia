export class McpToolRegistry {
  constructor({ logger = console } = {}) {
    this.logger = logger;
    this.tools = [];
    this.resources = [];
    this.prompts = [];
    this.serverInfo = null;
  }

  update({ tools = [], resources = [], prompts = [], serverInfo = null } = {}) {
    this.tools = tools.map(normalizeTool);
    this.resources = resources.map(normalizeResource);
    this.prompts = prompts.map(normalizePrompt);
    this.serverInfo = serverInfo;
  }

  listTools() {
    return this.tools;
  }

  listResources() {
    return this.resources;
  }

  listPrompts() {
    return this.prompts;
  }
}

function normalizeTool(tool = {}) {
  const endpoints = extractEndpoints(tool);
  return {
    name: tool.name,
    description: tool.description || tool.title || "",
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema,
    endpoints,
    meta: tool._meta || null
  };
}

function normalizeResource(resource = {}) {
  return {
    name: resource.name,
    description: resource.description || "",
    uri: resource.uri,
    mimeType: resource.mimeType,
    meta: resource._meta || null
  };
}

function normalizePrompt(prompt = {}) {
  return {
    name: prompt.name,
    description: prompt.description || "",
    meta: prompt._meta || null
  };
}

function extractEndpoints(tool = {}) {
  const meta = tool._meta || {};
  if (meta.endpoints) return meta.endpoints;
  if (meta.tia?.endpoints) return meta.tia.endpoints;
  if (meta.sparql?.endpoints) return meta.sparql.endpoints;
  return null;
}
