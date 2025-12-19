export function applyMcpMetadata(profile, registry, options = {}) {
  const tools = registry.listTools();
  const resources = registry.listResources();
  const prompts = registry.listPrompts();
  const endpoints = collectEndpoints({ tools, resources });

  profile.mcp = {
    role: options.role || "client",
    servers: registry.serverInfo ? [registry.serverInfo] : [],
    tools,
    resources,
    prompts,
    endpoints
  };

  profile.custom.mcp = {
    tools,
    resources,
    prompts,
    endpoints,
    serverInfo: registry.serverInfo
  };

  return profile;
}

function collectEndpoints({ tools, resources }) {
  const endpoints = new Set();
  tools.forEach((tool) => {
    const toolEndpoints = tool.endpoints;
    if (!toolEndpoints) return;
    if (Array.isArray(toolEndpoints)) {
      toolEndpoints.forEach((endpoint) => endpoints.add(endpoint));
      return;
    }
    Object.values(toolEndpoints).forEach((endpoint) => endpoints.add(endpoint));
  });

  resources.forEach((resource) => {
    if (resource.uri) endpoints.add(resource.uri);
  });

  return Array.from(endpoints);
}
