export class PrologProvider {
  constructor({
    nickname = "PrologAgent",
    maxAnswers = 5,
    logger = console
  } = {}) {
    this.nickname = nickname;
    this.maxAnswers = maxAnswers;
    this.logger = logger;
    this.pl = null;
    this.session = null;
  }

  async ensureSession() {
    if (this.session) return;
    try {
      const module = await import("tau-prolog");
      await import("tau-prolog/modules/lists.js");
      this.pl = module.default || module;
      this.session = this.pl.create(1000);
    } catch (error) {
      throw new Error("tau-prolog is required for PrologProvider.");
    }
  }

  async consult(program) {
    if (!program) return;
    await this.ensureSession();
    return new Promise((resolve, reject) => {
      this.session.consult(program, {
        success: () => resolve(),
        error: (err) => reject(new Error(err))
      });
    });
  }

  async query(queryText) {
    await this.ensureSession();
    return new Promise((resolve) => {
      const answers = [];
      this.session.query(queryText, {
        success: () => {
          this.session.answers((answer) => {
            if (answer === false) {
              resolve(answers);
              return;
            }
            answers.push(this.pl.format_answer(answer));
            if (answers.length >= this.maxAnswers) {
              resolve(answers);
            }
          });
        },
        error: (err) => resolve([`Error: ${err}`])
      });
    });
  }

  parseInput(text) {
    const trimmed = (text || "").trim();
    const marker = trimmed.indexOf("?-");
    if (marker === -1) {
      return { program: "", query: trimmed };
    }
    const program = trimmed.slice(0, marker).trim();
    const query = trimmed.slice(marker).replace(/^\?\-\s*/, "").trim();
    return { program, query };
  }

  async handle({ command, content, reply }) {
    if (!content) return "No input provided.";

    if (command === "tell") {
      await this.consult(content);
      return "Prolog program loaded.";
    }

    if (command === "ask") {
      const answers = await this.query(content);
      return answers.length ? answers.join("\n") : "No.";
    }

    const { program, query } = this.parseInput(content);
    if (program) {
      await this.consult(program);
    }

    if (query) {
      const answers = await this.query(query);
      return answers.length ? answers.join("\n") : "No.";
    }

    await reply?.("Provide a query with '?-' or use 'ask'.");
    return "";
  }
}

export default PrologProvider;
