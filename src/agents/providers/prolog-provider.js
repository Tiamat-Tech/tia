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
    const trimmed = this.normalizeContent(text);
    const marker = trimmed.indexOf("?-");
    if (marker === -1) {
      return { program: "", query: trimmed };
    }
    const program = trimmed.slice(0, marker).trim();
    const query = trimmed.slice(marker).replace(/^\?\-\s*/, "").trim();
    return { program, query };
  }

  normalizeContent(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return "";
    const nick = (this.nickname || "").toLowerCase();
    if (!nick) return trimmed;

    const lines = trimmed.split("\n").map((line) => {
      let current = line.trimStart();
      if (current.toLowerCase().startsWith(nick)) {
        current = current.slice(nick.length);
        current = current.replace(/^[\\s,:]+/, "");
      }
      return current;
    });

    return lines.join("\n").trim();
  }

  async handle({ command, content, reply }) {
    const cleaned = this.normalizeContent(content);
    if (!cleaned) return "No input provided.";

    if (command === "tell") {
      await this.consult(cleaned);
      return "Prolog program loaded.";
    }

    if (command === "ask") {
      const answers = await this.query(cleaned);
      return answers.length ? answers.join("\n") : "No.";
    }

    const { program, query } = this.parseInput(cleaned);
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
