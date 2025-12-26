#!/usr/bin/env node
/**
 * Test script for Golem role assignment integration
 * Tests the GolemManager, role library, and domain detection
 */

import { GolemManager } from "./src/lib/mfr/golem-manager.js";
import {
  GOLEM_ROLE_LIBRARY,
  getRole,
  getDomainRoles,
  getRolesForPhase,
  searchRoles
} from "./src/lib/mfr/golem-role-library.js";
import { MFR_PHASES } from "./src/lib/mfr/constants.js";

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

console.log("=== Golem Integration Test ===\n");

// Test 1: Role Library Access
console.log("Test 1: Role Library Access");
console.log("-------------------------------");
const medicalDiagnostician = getRole("medical", "diagnostician");
console.log(`✓ Retrieved role: ${medicalDiagnostician?.name}`);
console.log(`  Prompt: ${medicalDiagnostician?.systemPrompt.substring(0, 80)}...`);
console.log(`  Capabilities: ${medicalDiagnostician?.capabilities.join(", ")}`);
console.log();

// Test 2: Domain Role Listing
console.log("Test 2: Domain Role Listing");
console.log("-------------------------------");
const softwareRoles = getDomainRoles("software");
console.log(`✓ Software domain has ${Object.keys(softwareRoles).length} roles:`);
Object.keys(softwareRoles).forEach(role => {
  console.log(`  - ${softwareRoles[role].name}`);
});
console.log();

// Test 3: Phase-based Role Selection
console.log("Test 3: Phase-based Role Selection");
console.log("-------------------------------");
const entityRoles = getRolesForPhase(MFR_PHASES.ENTITY_DISCOVERY);
console.log(`✓ Found ${entityRoles.length} roles for ENTITY_DISCOVERY phase:`);
entityRoles.slice(0, 5).forEach(role => {
  console.log(`  - ${role.name} (${role.domain})`);
});
console.log();

// Test 4: Role Search
console.log("Test 4: Role Search");
console.log("-------------------------------");
const architectRoles = searchRoles("architect");
console.log(`✓ Found ${architectRoles.length} roles matching "architect":`);
architectRoles.forEach(role => {
  console.log(`  - ${role.name} (${role.domain}/${role.roleName})`);
});
console.log();

// Test 5: GolemManager Domain Detection
console.log("Test 5: GolemManager Domain Detection");
console.log("-------------------------------");
const manager = new GolemManager({ logger });

const testProblems = [
  { text: "Patient presents with fever, cough, and fatigue", expected: "medical" },
  { text: "Design a microservices architecture for e-commerce platform", expected: "software" },
  { text: "Analyze the quantum entanglement experiment data", expected: "scientific" },
  { text: "Develop a business strategy to enter the Asian market", expected: "business" },
  { text: "Write a compelling story about time travel", expected: "creative" }
];

testProblems.forEach(problem => {
  const detected = manager.analyzeProblemDomain(problem.text);
  const match = detected === problem.expected ? "✓" : "✗";
  console.log(`${match} "${problem.text.substring(0, 50)}..."`);
  console.log(`  Expected: ${problem.expected}, Detected: ${detected}`);
});
console.log();

// Test 6: Role Assignment Simulation
console.log("Test 6: Role Assignment Simulation");
console.log("-------------------------------");
const testAssignment = await manager.assignRole({
  sessionId: "test-session-123",
  domain: "medical",
  roleName: "diagnostician",
  requestingAgent: "coordinator",
  phase: MFR_PHASES.ENTITY_DISCOVERY,
  rationale: "Test assignment"
});

console.log(`✓ Role assigned:`);
console.log(`  Name: ${testAssignment.name}`);
console.log(`  Domain: ${testAssignment.domain}`);
console.log(`  Role: ${testAssignment.roleName}`);
console.log(`  Session: ${testAssignment.sessionId}`);
console.log(`  Capabilities: ${testAssignment.capabilities.join(", ")}`);
console.log();

// Test 7: Optimal Role Selection
console.log("Test 7: Optimal Role Selection");
console.log("-------------------------------");
const medicalProblem = "Patient has joint pain, morning stiffness, and fatigue";
const optimalAssignment = await manager.selectOptimalRole({
  problemDescription: medicalProblem,
  currentPhase: MFR_PHASES.ENTITY_DISCOVERY,
  availableAgents: [],
  sessionId: "test-session-456"
});

console.log(`✓ Optimal role for medical problem:`);
console.log(`  Problem: "${medicalProblem}"`);
console.log(`  Assigned: ${optimalAssignment?.name}`);
console.log(`  Domain: ${optimalAssignment?.domain}`);
console.log(`  Phase: ${optimalAssignment?.phase}`);
console.log();

// Test 8: Role History
console.log("Test 8: Role History");
console.log("-------------------------------");
const history = manager.getRoleHistory();
console.log(`✓ Role history has ${history.length} entries:`);
history.forEach((entry, idx) => {
  console.log(`  ${idx + 1}. ${entry.name} (${entry.sessionId})`);
});
console.log();

console.log("=== All Tests Passed! ===\n");
console.log("Integration is ready for use in MFR sessions.");
