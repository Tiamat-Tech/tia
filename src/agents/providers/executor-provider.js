import { Mistral } from "@mistralai/mistralai";

export class ExecutorProvider {
  constructor({
    apiKey,
    model,
    maxTokens,
    temperature,
    systemPrompt,
    nickname = "Executor",
    logger = console
  }) {
    if (!apiKey) {
      throw new Error("ExecutorProvider requires an API key");
    }
    if (!model) {
      throw new Error("ExecutorProvider requires a model");
    }

    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
    this.systemPrompt = systemPrompt;
    this.nickname = nickname;
    this.logger = logger;
    this.client = new Mistral({ apiKey });
  }

  buildMessages(prompt) {
    const messages = [];
    if (this.systemPrompt) {
      messages.push({ role: "system", content: this.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    return messages;
  }

  async requestCompletion(prompt) {
    const response = await this.client.chat.complete({
      model: this.model,
      messages: this.buildMessages(prompt),
      maxTokens: this.maxTokens,
      temperature: this.temperature
    });

    return response.choices[0]?.message?.content?.trim() || "";
  }

  parseJson(content) {
    if (!content) return null;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
      content.match(/(\{[\s\S]*\})/);
    const jsonText = jsonMatch ? jsonMatch[1] : content;

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      return null;
    }
  }

  async generateExecutionProgram({ plan, problemDescription, modelTurtle }) {
    if (!Array.isArray(plan) || plan.length === 0) {
      return null;
    }

    const prompt = `You are generating a minimal, valid Prolog program to produce concrete bindings for a plan.

Problem description:
${problemDescription}

RDF model (Turtle):
${modelTurtle}

Plan steps (in order):
${plan.map((step, index) => `${index + 1}. ${step}`).join("\n")}

Return ONLY a JSON object with "program" and "query" fields.
Requirements:
- Output must be valid JSON only (no markdown, no commentary).
- "program" must be plain Prolog facts/rules, no JSON, no triple quotes.
- "query" must be a single Prolog query that yields bindings in finite time.
- Prefer simple facts and rules; avoid recursion unless necessary.
- Use lowercase predicate names; use atoms for identifiers (e.g., truck1, loc_a).
- Include at least one predicate that captures the plan outcome, like assignment/2.
- If constraints are unclear, include a minimal consistent model and still produce bindings.

Example JSON:
{"program":"truck(truck1).\\nlocation(a).\\nassignment(truck1,a).","query":"assignment(Truck, Location)."}\n`;

    try {
      const content = await this.requestCompletion(prompt);
      let parsed = this.parseJson(content);

      if (!parsed?.program || !parsed?.query) {
        const retryPrompt = `${prompt}\n\nReturn ONLY valid JSON. No Markdown fences, no extra text.`;
        const retryContent = await this.requestCompletion(retryPrompt);
        parsed = this.parseJson(retryContent);
      }

      if (!parsed?.program || !parsed?.query) {
        return null;
      }

      return {
        program: String(parsed.program).trim(),
        query: String(parsed.query).trim()
      };
    } catch (error) {
      this.logger.error?.(
        `[ExecutorProvider] Failed to generate execution program: ${error.message}`
      );
      return null;
    }
  }

  async handle() {
    return null;
  }
}

export default ExecutorProvider;
