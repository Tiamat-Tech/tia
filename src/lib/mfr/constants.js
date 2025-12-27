/**
 * Constants for Model-First Reasoning (MFR) protocol
 */

// Namespace for MFR vocabulary
export const MFR_NS = "http://purl.org/stuff/mfr/";

// ========================================
// MFR Message Types
// ========================================

export const MFR_MESSAGE_TYPES = {
  // Phase 1: Model Construction
  MODEL_CONTRIBUTION_REQUEST: `${MFR_NS}ModelContributionRequest`,
  ENTITY_PROPOSAL: `${MFR_NS}EntityProposal`,
  CONSTRAINT_PROPOSAL: `${MFR_NS}ConstraintProposal`,
  ACTION_DEFINITION: `${MFR_NS}ActionDefinition`,
  ACTION_SCHEMA: `${MFR_NS}ActionSchema`,
  GOAL_PROPOSAL: `${MFR_NS}GoalProposal`,
  STATE_VARIABLE_PROPOSAL: `${MFR_NS}StateVariableProposal`,

  // Merging and Validation
  MODEL_MERGE: `${MFR_NS}ModelMerge`,
  MODEL_VALIDATION_REQUEST: `${MFR_NS}ModelValidationRequest`,
  MODEL_VALIDATION_RESULT: `${MFR_NS}ModelValidationResult`,

  // Conflict Resolution
  MODEL_CONFLICT: `${MFR_NS}ModelConflict`,
  CONFLICT_RESOLUTION_PROPOSAL: `${MFR_NS}ConflictResolutionProposal`,
  CONFLICT_RESOLUTION_ACCEPTED: `${MFR_NS}ConflictResolutionAccepted`,

  // Phase 2: Constrained Reasoning
  SOLUTION_REQUEST: `${MFR_NS}SolutionRequest`,
  SOLUTION_PROPOSAL: `${MFR_NS}SolutionProposal`,

  // Tool Selection (optional debate phase)
  TOOL_RECOMMENDATION: `${MFR_NS}ToolRecommendation`,
  SOLUTION_VALIDATION: `${MFR_NS}SolutionValidation`,
  SOLUTION_VALIDATION_RESULT: `${MFR_NS}SolutionValidationResult`,
  PLAN_EXECUTION_REQUEST: `${MFR_NS}PlanExecutionRequest`,
  PLAN_EXECUTION_RESULT: `${MFR_NS}PlanExecutionResult`,

  // Synthesis and Explanation
  SOLUTION_SYNTHESIS_REQUEST: `${MFR_NS}SolutionSynthesisRequest`,
  SOLUTION_RANKING: `${MFR_NS}SolutionRanking`,
  EXPLANATION_REQUEST: `${MFR_NS}ExplanationRequest`,
  EXPLANATION_RESPONSE: `${MFR_NS}ExplanationResponse`,

  // Session Management
  SESSION_INIT: `${MFR_NS}SessionInit`,
  SESSION_COMPLETE: `${MFR_NS}SessionComplete`,
  SESSION_ERROR: `${MFR_NS}SessionError`,
  SESSION_ABORT: `${MFR_NS}SessionAbort`,

  // Golem Role Management
  GOLEM_ROLE_ASSIGNMENT: `${MFR_NS}GolemRoleAssignment`,
  GOLEM_ASSISTANCE_REQUEST: `${MFR_NS}GolemAssistanceRequest`,
  GOLEM_ROLE_ACKNOWLEDGMENT: `${MFR_NS}GolemRoleAcknowledgment`,
  GOLEM_ROLE_QUERY: `${MFR_NS}GolemRoleQuery`,
  GOLEM_ROLE_STATUS: `${MFR_NS}GolemRoleStatus`
};

// ========================================
// MFR Protocol Phases
// ========================================

export const MFR_PHASES = {
  // Initialization
  INITIALIZATION: 'initialization',

  // Phase 1: Collaborative Model Construction
  PROBLEM_INTERPRETATION: 'problem_interpretation',
  TOOL_SELECTION_DEBATE: 'tool_selection_debate',  // Optional debate phase for tool selection
  CONSENSUS_DISCOVERY: 'consensus_discovery',
  ENTITY_DISCOVERY: 'entity_discovery',
  CONSTRAINT_IDENTIFICATION: 'constraint_identification',
  ACTION_DEFINITION: 'action_definition',
  GOAL_IDENTIFICATION: 'goal_identification',

  // Validation and Conflict Resolution
  MODEL_MERGE: 'model_merge',
  MODEL_VALIDATION: 'model_validation',
  CONFLICT_NEGOTIATION: 'conflict_negotiation',

  // Phase 2: Constrained Reasoning
  CONSTRAINED_REASONING: 'constrained_reasoning',
  SOLUTION_VALIDATION: 'solution_validation',
  SOLUTION_SYNTHESIS: 'solution_synthesis',
  SOLUTION_EXPLANATION: 'solution_explanation',

  // Completion
  COMPLETE: 'complete',
  ERROR: 'error',
  ABORTED: 'aborted'
};

// ========================================
// Phase Transitions
// ========================================

// Valid phase transitions
export const VALID_PHASE_TRANSITIONS = {
  [MFR_PHASES.INITIALIZATION]: [
    MFR_PHASES.PROBLEM_INTERPRETATION
  ],
  [MFR_PHASES.PROBLEM_INTERPRETATION]: [
    MFR_PHASES.TOOL_SELECTION_DEBATE,  // Optional debate path
    MFR_PHASES.CONSENSUS_DISCOVERY,
    MFR_PHASES.ENTITY_DISCOVERY         // Direct path (existing behavior)
  ],
  [MFR_PHASES.TOOL_SELECTION_DEBATE]: [
    MFR_PHASES.ENTITY_DISCOVERY
  ],
  [MFR_PHASES.CONSENSUS_DISCOVERY]: [
    MFR_PHASES.COMPLETE
  ],
  [MFR_PHASES.ENTITY_DISCOVERY]: [
    MFR_PHASES.CONSTRAINT_IDENTIFICATION,
    MFR_PHASES.ACTION_DEFINITION,
    MFR_PHASES.GOAL_IDENTIFICATION,
    MFR_PHASES.MODEL_MERGE  // Allow direct merge if sufficient contributions received
  ],
  [MFR_PHASES.CONSTRAINT_IDENTIFICATION]: [
    MFR_PHASES.ACTION_DEFINITION,
    MFR_PHASES.GOAL_IDENTIFICATION,
    MFR_PHASES.MODEL_MERGE
  ],
  [MFR_PHASES.ACTION_DEFINITION]: [
    MFR_PHASES.CONSTRAINT_IDENTIFICATION,
    MFR_PHASES.GOAL_IDENTIFICATION,
    MFR_PHASES.MODEL_MERGE
  ],
  [MFR_PHASES.GOAL_IDENTIFICATION]: [
    MFR_PHASES.MODEL_MERGE
  ],
  [MFR_PHASES.MODEL_MERGE]: [
    MFR_PHASES.MODEL_VALIDATION
  ],
  [MFR_PHASES.MODEL_VALIDATION]: [
    MFR_PHASES.CONFLICT_NEGOTIATION,
    MFR_PHASES.CONSTRAINED_REASONING
  ],
  [MFR_PHASES.CONFLICT_NEGOTIATION]: [
    MFR_PHASES.MODEL_MERGE,
    MFR_PHASES.MODEL_VALIDATION
  ],
  [MFR_PHASES.CONSTRAINED_REASONING]: [
    MFR_PHASES.SOLUTION_VALIDATION,
    MFR_PHASES.COMPLETE  // Allow direct completion when solution is received
  ],
  [MFR_PHASES.SOLUTION_VALIDATION]: [
    MFR_PHASES.SOLUTION_SYNTHESIS
  ],
  [MFR_PHASES.SOLUTION_SYNTHESIS]: [
    MFR_PHASES.SOLUTION_EXPLANATION
  ],
  [MFR_PHASES.SOLUTION_EXPLANATION]: [
    MFR_PHASES.COMPLETE
  ],
  [MFR_PHASES.COMPLETE]: [],
  [MFR_PHASES.ERROR]: [],
  [MFR_PHASES.ABORTED]: []
};

// Any phase can transition to ERROR or ABORTED
export const EMERGENCY_TRANSITIONS = [
  MFR_PHASES.ERROR,
  MFR_PHASES.ABORTED
];

// ========================================
// MFR Room Types
// ========================================

export const MFR_ROOM_TYPES = {
  CONSTRUCT: 'construct',
  VALIDATE: 'validate',
  REASON: 'reason'
};

// Map phases to appropriate rooms
export const PHASE_TO_ROOM = {
  [MFR_PHASES.INITIALIZATION]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.PROBLEM_INTERPRETATION]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.ENTITY_DISCOVERY]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.CONSTRAINT_IDENTIFICATION]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.ACTION_DEFINITION]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.GOAL_IDENTIFICATION]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.MODEL_MERGE]: MFR_ROOM_TYPES.CONSTRUCT,
  [MFR_PHASES.MODEL_VALIDATION]: MFR_ROOM_TYPES.VALIDATE,
  [MFR_PHASES.CONFLICT_NEGOTIATION]: MFR_ROOM_TYPES.VALIDATE,
  [MFR_PHASES.CONSTRAINED_REASONING]: MFR_ROOM_TYPES.REASON,
  [MFR_PHASES.SOLUTION_VALIDATION]: MFR_ROOM_TYPES.REASON,
  [MFR_PHASES.SOLUTION_SYNTHESIS]: MFR_ROOM_TYPES.REASON,
  [MFR_PHASES.SOLUTION_EXPLANATION]: MFR_ROOM_TYPES.REASON
};

// ========================================
// Contribution Types
// ========================================

export const MFR_CONTRIBUTION_TYPES = {
  ENTITY: `${MFR_NS}EntityDiscovery`,
  ENTITY_GROUNDING: `${MFR_NS}EntityGrounding`,
  RELATIONSHIP: `${MFR_NS}RelationshipDiscovery`,
  CONSTRAINT: `${MFR_NS}ConstraintIdentification`,
  ACTION: `${MFR_NS}ActionDefinition`,
  GOAL: `${MFR_NS}GoalIdentification`,
  STATE_VALIDATION: `${MFR_NS}StateValidation`,
  ONTOLOGY_VALIDATION: `${MFR_NS}OntologyValidation`,
  SOLUTION_EXPLANATION: `${MFR_NS}SolutionExplanation`
};

// ========================================
// Agent Roles
// ========================================

export const MFR_AGENT_ROLES = {
  COORDINATOR: `${MFR_NS}Coordinator`,
  ENTITY_EXTRACTOR: `${MFR_NS}EntityExtractor`,
  KNOWLEDGE_GROUNDER: `${MFR_NS}KnowledgeGrounder`,
  CONSTRAINT_REASONER: `${MFR_NS}ConstraintReasoner`,
  ACTION_MODELER: `${MFR_NS}ActionModeler`,
  SEMANTIC_VALIDATOR: `${MFR_NS}SemanticValidator`,
  SOLUTION_GENERATOR: `${MFR_NS}SolutionGenerator`
};

// ========================================
// Validation Status
// ========================================

export const VALIDATION_STATUS = {
  VALID: 'valid',
  INVALID: 'invalid',
  INCOMPLETE: 'incomplete',
  CONFLICT: 'conflict'
};

// ========================================
// Conflict Resolution Strategies
// ========================================

export const CONFLICT_RESOLUTION_STRATEGIES = {
  MANUAL: 'manual',
  AGENT_PRIORITY: 'agent_priority',
  MOST_RECENT: 'most_recent',
  MOST_GROUNDED: 'most_grounded',
  CONSENSUS: 'consensus'
};

// ========================================
// Solution Ranking Criteria
// ========================================

export const SOLUTION_RANKING_CRITERIA = {
  CONSTRAINT_SATISFACTION: 'constraint_satisfaction',
  GOAL_ACHIEVEMENT: 'goal_achievement',
  OPTIMALITY: 'optimality',
  COMPLETENESS: 'completeness',
  FEASIBILITY: 'feasibility'
};

// ========================================
// Timeouts (milliseconds)
// ========================================

export const MFR_TIMEOUTS = {
  CONTRIBUTION_PHASE: 30000,     // 30 seconds
  VALIDATION_PHASE: 10000,       // 10 seconds
  REASONING_PHASE: 60000,        // 60 seconds
  CONFLICT_RESOLUTION: 20000,    // 20 seconds
  EXPLANATION_GENERATION: 15000  // 15 seconds
};

// ========================================
// Helper Functions
// ========================================

/**
 * Check if a phase transition is valid
 * @param {string} fromPhase - Current phase
 * @param {string} toPhase - Target phase
 * @returns {boolean} - True if transition is valid
 */
export function isValidTransition(fromPhase, toPhase) {
  if (EMERGENCY_TRANSITIONS.includes(toPhase)) {
    return true;
  }

  const validTransitions = VALID_PHASE_TRANSITIONS[fromPhase] || [];
  return validTransitions.includes(toPhase);
}

/**
 * Get the appropriate room for a given phase
 * @param {string} phase - MFR protocol phase
 * @returns {string} - Room type (construct, validate, or reason)
 */
export function getRoomForPhase(phase) {
  return PHASE_TO_ROOM[phase] || MFR_ROOM_TYPES.CONSTRUCT;
}

/**
 * Check if a phase is part of Phase 1 (Model Construction)
 * @param {string} phase - MFR protocol phase
 * @returns {boolean} - True if phase is in Phase 1
 */
export function isModelConstructionPhase(phase) {
  return [
    MFR_PHASES.INITIALIZATION,
    MFR_PHASES.PROBLEM_INTERPRETATION,
    MFR_PHASES.ENTITY_DISCOVERY,
    MFR_PHASES.CONSTRAINT_IDENTIFICATION,
    MFR_PHASES.ACTION_DEFINITION,
    MFR_PHASES.GOAL_IDENTIFICATION,
    MFR_PHASES.MODEL_MERGE
  ].includes(phase);
}

/**
 * Check if a phase is part of Phase 2 (Constrained Reasoning)
 * @param {string} phase - MFR protocol phase
 * @returns {boolean} - True if phase is in Phase 2
 */
export function isConstrainedReasoningPhase(phase) {
  return [
    MFR_PHASES.CONSTRAINED_REASONING,
    MFR_PHASES.SOLUTION_VALIDATION,
    MFR_PHASES.SOLUTION_SYNTHESIS,
    MFR_PHASES.SOLUTION_EXPLANATION
  ].includes(phase);
}

/**
 * Check if a phase is a validation/conflict resolution phase
 * @param {string} phase - MFR protocol phase
 * @returns {boolean} - True if phase is validation-related
 */
export function isValidationPhase(phase) {
  return [
    MFR_PHASES.MODEL_VALIDATION,
    MFR_PHASES.CONFLICT_NEGOTIATION,
    MFR_PHASES.SOLUTION_VALIDATION
  ].includes(phase);
}
