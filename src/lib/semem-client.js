import dotenv from "dotenv";

dotenv.config();

const DEFAULT_BASE_URL = process.env.SEMEM_BASE_URL || "https://mcp.tensegrity.it";
const DEFAULT_TIMEOUT_MS = parseInt(process.env.SEMEM_HTTP_TIMEOUT_MS || "20000", 10);

export class SememClient {
  constructor({
    baseUrl = DEFAULT_BASE_URL,
    authToken = process.env.SEMEM_AUTH_TOKEN,
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = {}) {
    if (!fetchImpl) {
      throw new Error("A fetch implementation is required for SememClient.");
    }

    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.authToken = authToken;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  buildHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async post(path, payload) {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response;
    try {
      response = await this.fetch(url, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error(`Semem request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
    clearTimeout(timeout);

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch (error) {
      throw new Error(`Semem response could not be parsed as JSON: ${error.message}`);
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || response.statusText;
      throw new Error(`Semem request failed (${response.status}): ${errorMessage}`);
    }

    return data;
  }

  async tell(content, { type = "interaction", metadata = {} } = {}) {
    if (!content || !content.trim()) {
      throw new Error("content is required for /tell");
    }
    return this.post("/tell", { content, type, metadata });
  }

  async ask(question, options = {}) {
    if (!question || !question.trim()) {
      throw new Error("question is required for /ask");
    }

    const {
      mode = "standard",
      useContext = true,
      useHyDE = false,
      useWikipedia = false,
      useWikidata = false,
      useWebSearch = false,
      threshold
    } = options;

    const payload = {
      question,
      mode,
      useContext,
      useHyDE,
      useWikipedia,
      useWikidata,
      useWebSearch
    };

    if (typeof threshold === "number") {
      payload.threshold = threshold;
    }

    return this.post("/ask", payload);
  }

  async chat(message, context = {}) {
    if (!message || !message.trim()) {
      throw new Error("message is required for /chat");
    }
    return this.post("/chat", { message, context });
  }

  async chatEnhanced(query, options = {}) {
    if (!query || !query.trim()) {
      throw new Error("query is required for /chat/enhanced");
    }

    const {
      useHyDE = false,
      useWikipedia = false,
      useWikidata = false,
      useWebSearch = false
    } = options;

    return this.post("/chat/enhanced", {
      query,
      useHyDE,
      useWikipedia,
      useWikidata,
      useWebSearch
    });
  }

  async augment(target, { operation = "auto", options = {} } = {}) {
    if (!target) {
      throw new Error("target is required for /augment");
    }
    return this.post("/augment", { target, operation, options });
  }

  async inspect({ what = "session", details = false } = {}) {
    return this.post("/inspect", { what, details });
  }
}

export default SememClient;
