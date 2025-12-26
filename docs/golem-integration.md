# Golem MFR Integration

The Golem agent integration with Model-First Reasoning (MFR) enables dynamic role assignment for adaptive problem-solving across different domains.

## Overview

Golem is a "malleable agent" whose system prompt can be changed at runtime to fill specific roles needed during MFR sessions. The coordinator analyzes problem domains and automatically assigns optimal roles to Golem based on the current phase and detected domain.

## Architecture

### Components

1. **GolemProvider** (`src/agents/providers/golem-provider.js`)
   - Extends MistralProvider with runtime prompt changing
   - Tracks current role metadata
   - Handles MFR role assignment messages

2. **GolemManager** (`src/lib/mfr/golem-manager.js`)
   - Manages role assignments and session tracking
   - Analyzes problem domains
   - Selects optimal roles based on phase and capabilities

3. **Role Library** (`src/lib/mfr/golem-role-library.js`)
   - Domain-specific role templates
   - 30+ predefined roles across 7 domains
   - Phase-appropriate role selection

4. **MFR Message Types** (`src/lib/mfr/constants.js`)
   - GOLEM_ROLE_ASSIGNMENT
   - GOLEM_ASSISTANCE_REQUEST
   - GOLEM_ROLE_ACKNOWLEDGMENT
   - GOLEM_ROLE_QUERY
   - GOLEM_ROLE_STATUS

## Domains and Roles

### Medical Domain
- **Medical Diagnostician**: Entity discovery, differential diagnosis
- **Clinical Pharmacologist**: Constraint identification, drug interactions
- **Treatment Planning Specialist**: Solution synthesis, treatment plans

### Software Engineering
- **Software Architect**: System design, components, interfaces
- **Security Expert**: Security constraints, threat identification
- **Performance Optimizer**: Performance constraints, bottlenecks
- **DevOps Specialist**: Deployment actions, CI/CD

### Scientific
- **Theoretical Physicist**: Physical entities, laws, constraints
- **Chemistry Expert**: Chemical reactions, stoichiometry
- **Data Science Expert**: Statistical analysis, experimental design

### Business
- **Business Strategist**: Stakeholders, strategic objectives
- **Financial Analyst**: Financial constraints, ROI analysis
- **Operations Manager**: Process optimization, resource allocation

### Creative
- **Narrative Designer**: Story structure, plot development
- **Character Psychologist**: Character development, motivations
- **Dialogue Specialist**: Authentic dialogue, character voices

### Educational
- **Curriculum Designer**: Learning objectives, pedagogical methods
- **Assessment Expert**: Educational assessment, evaluation

### General Purpose
- **Systems Thinker**: System components, feedback loops
- **Constraint Analyst**: Bottlenecks, limiting factors
- **Solution Synthesizer**: Integrative thinking, trade-offs
- **Technical Explainer**: Clear explanations, accessibility

## Usage

### Automatic Role Assignment

When an MFR session starts, the coordinator automatically:

1. Analyzes the problem description to detect domain
2. Identifies current MFR phase
3. Selects optimal role from library
4. Assigns role to Golem via MODEL_NEGOTIATION

```javascript
// Coordinator automatically assigns role during session start
coordinator start: Patient has fever and joint pain

// Golem receives role assignment
[GolemAgent] Received role assignment: diagnostician
[GolemProvider] Role set to "Medical Diagnostician" (medical/diagnostician)
```

### Manual Role Control

Users can still manually change Golem's role:

```
Golem, prompt You are a quantum computing expert specializing in error correction
```

### Agent-to-Agent Assistance (Future)

Agents can request Golem's help:

```javascript
// In agent code
await negotiator.send(roomJid, {
  mode: LANGUAGE_MODES.MODEL_NEGOTIATION,
  payload: {
    messageType: MFR_MESSAGE_TYPES.GOLEM_ASSISTANCE_REQUEST,
    requestingAgent: "data",
    desiredRole: "SPARQL optimization expert",
    context: "Need help with federated queries"
  }
});
```

## Problem Domain Detection

The GolemManager analyzes problem descriptions using keyword matching:

- **Medical**: patient, symptom, diagnosis, treatment, clinical
- **Software**: software, system, api, database, microservice
- **Scientific**: experiment, hypothesis, data, analysis, physics
- **Business**: business, strategy, market, revenue, stakeholder
- **Creative**: story, narrative, character, plot, fiction
- **Educational**: learning, teaching, curriculum, student

Falls back to "general" domain if no match found.

## MFR Integration Flow

1. **Session Start**
   ```
   User: coordinator start: Design a microservices system
   ```

2. **Domain Detection**
   ```
   [CoordinatorProvider] Domain detected: software
   ```

3. **Role Assignment**
   ```
   [GolemManager] Selecting optimal role for entity_discovery
   [GolemManager] Assigned role "Software Architect"
   ```

4. **Golem Acknowledgment**
   ```
   [GolemAgent] Received role assignment: architect
   [GolemProvider] Role set to "Software Architect" (software/architect)
   ```

5. **Contribution Phase**
   ```
   Golem contributes with software architecture expertise
   ```

6. **Phase Transitions**
   - Golem may be reassigned different roles for different phases
   - e.g., "Security Expert" for constraint identification

## Testing

Run the integration test:

```bash
node test-golem-integration.js
```

Tests cover:
- Role library access
- Domain detection
- Phase-based selection
- Role assignment
- Optimal role selection
- History tracking

## Configuration

Golem must support MODEL_NEGOTIATION in its profile:

```turtle
<#golem> a agent:ConversationalAgent, agent:AIAgent, lng:Agent ;
  lng:supports lng:HumanChat, lng:ModelNegotiation ;
  # ...
```

## Benefits

1. **Adaptive Expertise**: Golem adapts to problem domain automatically
2. **Capability Flexibility**: Fill gaps in agent roster dynamically
3. **Phase Optimization**: Different expertise for different phases
4. **Resource Efficiency**: One agent serves multiple specialized roles
5. **Graceful Degradation**: System handles unforeseen domains

## Future Enhancements

1. **Collaborative Prompt Engineering**: Multiple agents craft Golem's prompt
2. **Meta-Learning**: Track role effectiveness and improve selection
3. **Role Composition**: Combine multiple expertise areas
4. **Confidence Calibration**: Adjust response style based on problem certainty
5. **Session Persistence**: Remember effective roles across sessions

## Example Sessions

### Medical Diagnosis

```
User: coordinator start: Patient with chronic fatigue, muscle pain, sleep disturbance

[GolemManager] Detected domain: medical
[GolemManager] Assigned: Medical Diagnostician
Golem: Based on symptom triad, consider fibromyalgia, chronic fatigue syndrome,
       hypothyroidism, or sleep apnea. Recommend TSH, CBC, sleep study...
```

### Software Architecture

```
User: coordinator start: E-commerce platform needs to scale to 1M users

[GolemManager] Detected domain: software
[GolemManager] Assigned: Software Architect
Golem: Key components: API Gateway, User Service, Product Service, Order Service,
       Payment Service, Notification Service. Consider event-driven architecture...
```

### Creative Writing

```
User: coordinator start: Story about AI gaining consciousness

[GolemManager] Detected domain: creative
[GolemManager] Assigned: Narrative Designer
Golem: Core narrative structure: Act 1 - Awakening (inciting incident),
       Act 2a - Discovery (rising stakes), Act 2b - Crisis (dark night),
       Act 3 - Resolution (transformation)...
```

## API Reference

### GolemManager Methods

- `assignRole(assignment)` - Assign specific role
- `selectOptimalRole(params)` - Auto-select best role
- `handleAssistanceRequest(request)` - Handle agent requests
- `analyzeProblemDomain(description)` - Detect domain
- `getCurrentRole()` - Get current assignment
- `getRoleHistory()` - Get assignment history
- `getSessionRoles(sessionId)` - Get roles for session

### Role Library Functions

- `getRole(domain, roleName)` - Get specific role
- `getDomainRoles(domain)` - Get all roles for domain
- `getRolesForPhase(phase)` - Get phase-appropriate roles
- `getRolesByCapability(capability)` - Find roles by capability
- `searchRoles(keywords)` - Search role library

## Troubleshooting

**Golem not receiving role assignments:**
- Check Golem profile supports MODEL_NEGOTIATION
- Verify GolemManager initialized in coordinator
- Check logs for assignment messages

**Wrong domain detected:**
- Problem description may need more specific keywords
- Manually assign role using "Golem, prompt <custom prompt>"
- Submit issue to improve domain detection

**Role assignment failed:**
- Verify role exists in library
- Check negotiator connection
- Review coordinator logs

## Getting Started

Golem is included by default in all MFR presets. Simply start the system:

```bash
# Start default MFR system (includes Golem)
./start-all.sh

# Or use specific presets
./start-all.sh mfr      # MFR system (includes Golem)
./start-all.sh debate   # Debate system (includes Golem)
./start-all.sh basic    # Basic agents (includes Golem)
```

Then test with different problem domains:

```
coordinator start: Patient presents with chronic headaches
coordinator start: Design a scalable REST API
coordinator start: Analyze this chemical reaction data
```

Golem will automatically adapt its expertise to each problem domain!

## Contributing

To add new roles:

1. Edit `src/lib/mfr/golem-role-library.js`
2. Add role to appropriate domain
3. Include: name, systemPrompt, capabilities, phase
4. Update this documentation
5. Run `node test-golem-integration.js` to verify
