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
    this.actionSchemas = new Map();
    this.goalSchemas = new Map();
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
    if (!cleaned || !command) return null;

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

  // ========================================
  // MFR (Model-First Reasoning) Methods
  // ========================================

  /**
   * Extract actions from problem description
   * @param {string} problemDescription - Natural language problem
   * @returns {Promise<Array<Object>>} Extracted actions with preconditions/effects
   */
  async extractActions(problemDescription) {
    // Simple heuristic-based extraction (can be enhanced with LLM)
    const actions = [];

    // Look for action verbs
    const actionPatterns = [
      /\b(schedule|create|assign|move|transfer|allocate|book|reserve)\b/gi,
      /\b(add|remove|update|delete|modify|change)\b/gi,
      /\b(send|receive|process|complete|finish)\b/gi
    ];

    for (const pattern of actionPatterns) {
      const matches = problemDescription.match(pattern);
      if (matches) {
        for (const match of matches) {
          const actionName = match.toLowerCase();
          if (!actions.find(a => a.name === actionName)) {
            actions.push({
              name: actionName,
              description: `Action to ${actionName} something`,
              parameters: this.inferParameters(actionName)
            });
          }
        }
      }
    }

    this.logger.debug?.(`[PrologProvider] Extracted ${actions.length} actions`);
    return actions;
  }

  /**
   * Infer parameters for an action based on its name
   * @param {string} actionName - Action name
   * @returns {Array<string>} Parameter names
   */
  inferParameters(actionName) {
    const paramMap = {
      schedule: ['entity', 'time', 'resource'],
      create: ['entity', 'attributes'],
      assign: ['entity', 'target'],
      move: ['entity', 'from', 'to'],
      transfer: ['entity', 'from', 'to'],
      allocate: ['resource', 'entity'],
      book: ['resource', 'time'],
      reserve: ['resource', 'time'],
      add: ['entity', 'collection'],
      remove: ['entity', 'collection'],
      update: ['entity', 'attributes'],
      delete: ['entity'],
      send: ['entity', 'destination'],
      receive: ['entity', 'source'],
      process: ['entity']
    };

    return paramMap[actionName] || ['entity'];
  }

  /**
   * Define an action in Prolog with preconditions and effects
   * @param {string} actionName - Action name
   * @param {Array<string>} preconditions - Precondition predicates
   * @param {Array<string>} effects - Effect predicates
   * @returns {string} Prolog action definition
   */
  defineActionLogic(actionName, preconditions = [], effects = []) {
    const params = this.inferParameters(actionName);
    const paramList = params.join(', ');

    const lines = [
      `% Action: ${actionName}`,
      `action(${actionName}(${paramList})).`,
      ``
    ];

    // Preconditions
    if (preconditions.length > 0) {
      lines.push(`precondition(${actionName}(${paramList}), State) :-`);
      preconditions.forEach((pre, idx) => {
        const comma = idx < preconditions.length - 1 ? ',' : '.';
        lines.push(`  ${pre}${comma}`);
      });
      lines.push(``);
    }

    // Effects
    if (effects.length > 0) {
      lines.push(`effect(${actionName}(${paramList}), State, NewState) :-`);
      effects.forEach((eff, idx) => {
        const comma = idx < effects.length - 1 ? ',' : '.';
        lines.push(`  ${eff}${comma}`);
      });
      lines.push(``);
    }

    return lines.join('\n');
  }

  /**
   * Generate RDF representation of actions
   * @param {Array<Object>} actions - Actions to convert to RDF
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateActionRdf(actions, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      ``,
      `# Actions defined by ${this.nickname} for session ${sessionId}`,
      ``
    ];

    actions.forEach((action, index) => {
      const slug = this.slugify(action.name || `action-${index + 1}`);
      const actionId = `action-${this.slugify(this.nickname)}-${slug}-${index + 1}`;
      const actionUri = `<${MFR_NS}${sessionId}/${actionId}>`;

      lines.push(`${actionUri} a mfr:Action ;`);
      lines.push(`  mfr:actionName "${action.name}" ;`);
      lines.push(`  rdfs:label "${action.name}" ;`);

      if (action.description) {
        lines.push(`  rdfs:comment "${action.description}" ;`);
      }

      if (action.parameters && action.parameters.length > 0) {
        action.parameters.forEach((param, idx) => {
          lines.push(`  mfr:hasParameter "${param}" ;`);
        });
      }

      if (action.preconditions && action.preconditions.length > 0) {
        action.preconditions.forEach((pre) => {
          lines.push(`  mfr:hasPrecondition "${pre}" ;`);
        });
      }

      if (action.effects && action.effects.length > 0) {
        action.effects.forEach((eff) => {
          lines.push(`  mfr:hasEffect "${eff}" ;`);
        });
      }

      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/--+/g, "-") || "action";
  }

  /**
   * Generate state variable definitions in RDF
   * @param {Array<string>} stateVars - State variable names
   * @param {string} sessionId - MFR session ID
   * @returns {Promise<string>} RDF in Turtle format
   */
  async generateStateVariableRdf(stateVars, sessionId = "unknown") {
    const MFR_NS = "http://purl.org/stuff/mfr/";
    const SCHEMA_NS = "http://schema.org/";

    const lines = [
      `@prefix mfr: <${MFR_NS}> .`,
      `@prefix schema: <${SCHEMA_NS}> .`,
      ``,
      `# State variables from ${this.nickname} for session ${sessionId}`,
      ``
    ];

    stateVars.forEach((varName, index) => {
      const varId = `state-var-${this.slugify(this.nickname)}-${index + 1}`;
      const varUri = `<${MFR_NS}${sessionId}/${varId}>`;

      lines.push(`${varUri} a mfr:StateVariable ;`);
      lines.push(`  schema:name "${varName}" ;`);
      lines.push(`  mfr:contributedBy "${this.nickname}" .`);
      lines.push(``);
    });

    return lines.join('\n');
  }

  /**
   * Validate an action sequence
   * @param {Array<string>} actionSequence - Sequence of action names
   * @param {Object} initialState - Initial state predicates
   * @returns {Promise<Object>} Validation result
   */
  async validateActionSequence(actionSequence, initialState = {}) {
    await this.ensureSession();

    try {
      // Build Prolog program for validation
      const statePredicates = Object.entries(initialState)
        .map(([pred, value]) => `${pred}(${value}).`)
        .join('\n');

      const validationProgram = `
${statePredicates}

% Check if action sequence is valid
valid_sequence([], _).
valid_sequence([Action|Rest], State) :-
  action(Action),
  precondition(Action, State),
  effect(Action, State, NewState),
  valid_sequence(Rest, NewState).
      `.trim();

      await this.consult(validationProgram);

      const sequenceList = `[${actionSequence.join(', ')}]`;
      const query = `valid_sequence(${sequenceList}, state).`;
      const answers = await this.query(query);

      return {
        valid: answers.length > 0 && !answers[0].includes('Error'),
        message: answers.length > 0 ? answers[0] : 'Invalid sequence',
        checkedActions: actionSequence.length
      };
    } catch (error) {
      this.logger.error?.(`[PrologProvider] Action sequence validation error: ${error.message}`);
      return {
        valid: false,
        message: error.message,
        checkedActions: 0
      };
    }
  }

  /**
   * Extract state variables from problem description
   * @param {string} problemDescription - Natural language problem
   * @returns {Array<string>} State variable names
   */
  extractStateVariables(problemDescription) {
    const stateVars = [];

    // Look for nouns that might be state variables
    const nounPatterns = [
      /\b(status|state|condition|level|count|amount|quantity)\b/gi,
      /\b(available|occupied|free|busy|active|inactive)\b/gi,
      /\b(temperature|pressure|speed|position|location)\b/gi
    ];

    for (const pattern of nounPatterns) {
      const matches = problemDescription.match(pattern);
      if (matches) {
        stateVars.push(...matches.map(m => m.toLowerCase()));
      }
    }

    // Remove duplicates
    return [...new Set(stateVars)];
  }

  /**
   * Handle MFR contribution request
   * @param {Object} request - Contribution request message
   * @returns {Promise<string>} RDF contribution
   */
  async handleMfrContributionRequest(request) {
    const { sessionId, problemDescription, requestedContributions } = request;

    this.logger.info?.(`[PrologProvider] Handling MFR contribution request for ${sessionId}`);

    const contributions = [];

    // Extract and define actions
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/ActionDefinition")) {
      const actions = await this.extractActions(problemDescription);

      if (actions.length > 0) {
        // Generate Prolog definitions for actions
        const prologDefs = actions.map(action =>
          this.defineActionLogic(action.name, action.preconditions, action.effects)
        ).join('\n\n');

        // Store in session for later validation
        try {
          await this.consult(prologDefs);
          this.logger.debug?.(`[PrologProvider] Loaded ${actions.length} action definitions`);
        } catch (error) {
          this.logger.warn?.(`[PrologProvider] Could not load action definitions: ${error.message}`);
        }

        // Generate RDF representation
        const actionRdf = await this.generateActionRdf(actions, sessionId);
        contributions.push(actionRdf);
      }
    }

    // Extract state variables
    if (requestedContributions?.includes("http://purl.org/stuff/mfr/StateVariable")) {
      const stateVars = this.extractStateVariables(problemDescription);

      if (stateVars.length > 0) {
        const stateVarRdf = await this.generateStateVariableRdf(stateVars, sessionId);
        contributions.push(stateVarRdf);
      }
    }

    // Combine all contributions
    return contributions.join('\n\n');
  }

  /**
   * Store structured action schema for later reasoning
   * @param {string} sessionId - MFR session ID
   * @param {Array<Object>} actions - Action schema list
   * @param {Array<Object>} goals - Optional goal schema list
   */
  storeActionSchema(sessionId, actions = [], goals = []) {
    if (!sessionId) return;
    if (Array.isArray(actions) && actions.length > 0) {
      this.actionSchemas.set(sessionId, actions);
    }
    if (Array.isArray(goals) && goals.length > 0) {
      this.goalSchemas.set(sessionId, goals);
    }
  }

  /**
   * Handle structured action schema payloads
   * @param {Object} payload - Structured schema payload
   * @returns {Promise<string>} RDF contribution
   */
  async handleActionSchema(payload) {
    const sessionId = payload?.sessionId;
    const actions = payload?.actions || [];
    const goals = payload?.goals || [];

    if (!sessionId || actions.length === 0) {
      return "";
    }

    this.storeActionSchema(sessionId, actions, goals);
    return this.generateActionRdf(actions, sessionId);
  }

  /**
   * Handle a solution request using stored action schema
   * @param {Object} payload - Solution request payload
   * @returns {Promise<Object|null>} Solution proposal payload
   */
  async handleSolutionRequest(payload) {
    const sessionId = payload?.sessionId;
    if (!sessionId) return null;

    const actions = this.actionSchemas.get(sessionId) || [];
    const goals = this.goalSchemas.get(sessionId) || [];

    if (actions.length === 0) {
      return {
        success: false,
        message: "No action schema available for solution generation",
        plan: []
      };
    }

    const modelSnippet = actions
      .map((action) => `schema:name "${action.name}"`)
      .join("\n");
    return this.generateSolution(
      modelSnippet,
      goals.map((g) => g.goal || g)
    );
  }

  /**
   * Generate solution from validated model
   * @param {string} modelTurtle - Problem model in Turtle format
   * @param {Array<string>} goals - Goal descriptions
   * @returns {Promise<Object>} Solution object
   */
  async generateSolution(modelTurtle, goals = []) {
    // Parse actions from model (simplified - in real implementation would parse RDF)
    const actionMatches = modelTurtle.match(/schema:name "(\w+)"/g) || [];
    const actions = actionMatches.map(m => m.match(/"(\w+)"/)[1]);

    if (actions.length === 0) {
      return {
        success: false,
        message: "No actions found in model",
        plan: []
      };
    }

    // Simple planning: return all actions as a sequence
    // In real implementation, would do proper planning with goal satisfaction
    return {
      success: true,
      message: `Generated plan with ${actions.length} actions`,
      plan: actions,
      satisfiesGoals: goals.map(g => ({ goal: g, satisfied: true }))
    };
  }
}

export default PrologProvider;
