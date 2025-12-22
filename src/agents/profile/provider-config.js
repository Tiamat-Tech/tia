/**
 * Base provider configuration
 */
export class ProviderConfig {
  constructor(type, config = {}) {
    this.type = type;
    this.config = config;
  }

  toConfig() {
    return { ...this.config };
  }
}

/**
 * Mistral-specific provider
 */
export class MistralProviderConfig extends ProviderConfig {
  constructor({
    model,
    apiKeyEnv,
    maxTokens,
    temperature,
    lingueEnabled,
    lingueConfidenceMin,
    systemPrompt,
    systemTemplate
  }) {
    super('mistral', {
      model,
      apiKeyEnv,
      maxTokens,
      temperature,
      lingueEnabled,
      lingueConfidenceMin,
      systemPrompt,
      systemTemplate
    });
  }

  toConfig() {
    const config = {};
    if (this.config.model !== undefined) config.model = this.config.model;
    if (this.config.apiKeyEnv !== undefined) config.apiKeyEnv = this.config.apiKeyEnv;
    if (this.config.maxTokens !== undefined) config.maxTokens = this.config.maxTokens;
    if (this.config.temperature !== undefined) config.temperature = this.config.temperature;
    if (this.config.lingueEnabled !== undefined) config.lingueEnabled = this.config.lingueEnabled;
    if (this.config.lingueConfidenceMin !== undefined) config.lingueConfidenceMin = this.config.lingueConfidenceMin;
    if (this.config.systemPrompt !== undefined) config.systemPrompt = this.config.systemPrompt;
    if (this.config.systemTemplate !== undefined) config.systemTemplate = this.config.systemTemplate;
    return config;
  }
}

/**
 * Semem-specific provider
 */
export class SememProviderConfig extends ProviderConfig {
  constructor({ baseUrl, authTokenEnv, timeoutMs, features = {} }) {
    super('semem', {
      baseUrl,
      authTokenEnv,
      timeoutMs,
      features
    });
  }

  toConfig() {
    const config = {};
    if (this.config.baseUrl !== undefined) config.baseUrl = this.config.baseUrl;
    if (this.config.authTokenEnv !== undefined) config.authTokenEnv = this.config.authTokenEnv;
    if (this.config.timeoutMs !== undefined) config.timeoutMs = this.config.timeoutMs;
    if (this.config.features !== undefined) config.features = this.config.features;
    return config;
  }
}

/**
 * Data-specific provider for SPARQL queries
 */
export class DataProviderConfig extends ProviderConfig {
  constructor({
    sparqlEndpoint,
    extractionModel,
    extractionApiKeyEnv,
    maxTokens,
    temperature
  }) {
    super('data', {
      sparqlEndpoint,
      extractionModel,
      extractionApiKeyEnv,
      maxTokens,
      temperature
    });
  }

  toConfig() {
    const config = {};
    if (this.config.sparqlEndpoint !== undefined) config.sparqlEndpoint = this.config.sparqlEndpoint;
    if (this.config.extractionModel !== undefined) config.extractionModel = this.config.extractionModel;
    if (this.config.extractionApiKeyEnv !== undefined) config.extractionApiKeyEnv = this.config.extractionApiKeyEnv;
    if (this.config.maxTokens !== undefined) config.maxTokens = this.config.maxTokens;
    if (this.config.temperature !== undefined) config.temperature = this.config.temperature;
    return config;
  }
}
