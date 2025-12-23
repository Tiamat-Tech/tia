import {
  MFR_PHASES,
  VALID_PHASE_TRANSITIONS,
  EMERGENCY_TRANSITIONS,
  isValidTransition
} from "./constants.js";

/**
 * State machine for MFR protocol orchestration
 */
export class MfrProtocolState {
  constructor(problemId, { logger = console, initialPhase = MFR_PHASES.INITIALIZATION } = {}) {
    this.problemId = problemId;
    this.phase = initialPhase;
    this.phaseData = {};
    this.transitions = [];
    this.logger = logger;
    this.created = new Date().toISOString();
  }

  /**
   * Transition to a new phase
   * @param {string} toPhase - Target phase
   * @param {Object} data - Phase-specific data
   * @returns {boolean} True if transition successful
   */
  transition(toPhase, data = {}) {
    if (!this.canTransitionTo(toPhase)) {
      this.logger.error?.(
        `[MfrProtocolState] Invalid transition: ${this.phase} -> ${toPhase}`
      );
      throw new Error(
        `Invalid phase transition from ${this.phase} to ${toPhase}`
      );
    }

    const fromPhase = this.phase;

    this.logger.debug?.(
      `[MfrProtocolState] Transition: ${fromPhase} -> ${toPhase}`
    );

    this.phase = toPhase;

    this.transitions.push({
      from: fromPhase,
      to: toPhase,
      timestamp: new Date().toISOString(),
      data
    });

    // Store phase-specific data
    if (data && Object.keys(data).length > 0) {
      this.phaseData[toPhase] = {
        ...this.phaseData[toPhase],
        ...data
      };
    }

    return true;
  }

  /**
   * Check if transition to target phase is valid
   * @param {string} toPhase - Target phase
   * @returns {boolean} True if transition is valid
   */
  canTransitionTo(toPhase) {
    return isValidTransition(this.phase, toPhase);
  }

  /**
   * Check if currently in a specific phase
   * @param {string} phase - Phase to check
   * @returns {boolean} True if in that phase
   */
  isPhase(phase) {
    return this.phase === phase;
  }

  /**
   * Get current phase
   * @returns {string} Current phase
   */
  getCurrentPhase() {
    return this.phase;
  }

  /**
   * Get data for a specific phase
   * @param {string} phase - Phase name (defaults to current)
   * @returns {Object} Phase data
   */
  getPhaseData(phase = null) {
    const targetPhase = phase || this.phase;
    return this.phaseData[targetPhase] || {};
  }

  /**
   * Set data for current phase
   * @param {Object} data - Data to set
   */
  setPhaseData(data) {
    this.phaseData[this.phase] = {
      ...this.phaseData[this.phase],
      ...data
    };
  }

  /**
   * Get all phase data
   * @returns {Object} All phase data
   */
  getAllPhaseData() {
    return this.phaseData;
  }

  /**
   * Get transition history
   * @returns {Array<Object>} Array of transitions
   */
  getTransitions() {
    return [...this.transitions];
  }

  /**
   * Get summary of current state
   * @returns {Object} State summary
   */
  getSummary() {
    return {
      problemId: this.problemId,
      currentPhase: this.phase,
      created: this.created,
      transitionCount: this.transitions.length,
      phaseDataKeys: Object.keys(this.phaseData)
    };
  }

  /**
   * Check if protocol is complete
   * @returns {boolean} True if in COMPLETE phase
   */
  isComplete() {
    return this.phase === MFR_PHASES.COMPLETE;
  }

  /**
   * Check if protocol has errors
   * @returns {boolean} True if in ERROR phase
   */
  hasError() {
    return this.phase === MFR_PHASES.ERROR;
  }

  /**
   * Check if protocol was aborted
   * @returns {boolean} True if in ABORTED phase
   */
  isAborted() {
    return this.phase === MFR_PHASES.ABORTED;
  }

  /**
   * Check if protocol is still active
   * @returns {boolean} True if not complete, errored, or aborted
   */
  isActive() {
    return (
      !this.isComplete() &&
      !this.hasError() &&
      !this.isAborted()
    );
  }

  /**
   * Force transition to error phase
   * @param {Object} errorData - Error information
   */
  transitionToError(errorData = {}) {
    this.transition(MFR_PHASES.ERROR, {
      error: errorData,
      previousPhase: this.phase
    });
  }

  /**
   * Force transition to aborted phase
   * @param {Object} abortData - Abort information
   */
  transitionToAborted(abortData = {}) {
    this.transition(MFR_PHASES.ABORTED, {
      abort: abortData,
      previousPhase: this.phase
    });
  }

  /**
   * Get valid next phases from current phase
   * @returns {Array<string>} Array of valid next phases
   */
  getValidNextPhases() {
    const validTransitions = VALID_PHASE_TRANSITIONS[this.phase] || [];
    return [...validTransitions, ...EMERGENCY_TRANSITIONS];
  }

  /**
   * Get duration since creation
   * @returns {number} Duration in milliseconds
   */
  getDuration() {
    return new Date() - new Date(this.created);
  }

  /**
   * Get duration of current phase
   * @returns {number} Duration in milliseconds
   */
  getCurrentPhaseDuration() {
    if (this.transitions.length === 0) {
      return this.getDuration();
    }

    const lastTransition = this.transitions[this.transitions.length - 1];
    return new Date() - new Date(lastTransition.timestamp);
  }

  /**
   * Serialize state to JSON
   * @returns {Object} Serialized state
   */
  toJSON() {
    return {
      problemId: this.problemId,
      phase: this.phase,
      phaseData: this.phaseData,
      transitions: this.transitions,
      created: this.created,
      summary: this.getSummary()
    };
  }

  /**
   * Restore state from JSON
   * @param {Object} json - Serialized state
   * @returns {MfrProtocolState} Restored state
   */
  static fromJSON(json, { logger = console } = {}) {
    const state = new MfrProtocolState(json.problemId, {
      logger,
      initialPhase: json.phase
    });

    state.phaseData = json.phaseData || {};
    state.transitions = json.transitions || [];
    state.created = json.created || new Date().toISOString();

    return state;
  }
}

export default MfrProtocolState;
