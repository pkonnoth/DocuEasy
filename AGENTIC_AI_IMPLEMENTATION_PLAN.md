# Agentic AI + Cedar-OS + Mastra Implementation Plan

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AGENTIC AI    │    │    CEDAR-OS     │    │     MASTRA      │
│  (Intelligence) │◄───┤   (Governance)  │◄───┤ (Orchestration) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Summarization │    │ • Tool Safety   │    │ • Workflows     │
│ • Drafting      │    │ • Validation    │    │ • Sequencing    │
│ • Decision Sup. │    │ • Confirmation  │    │ • State Mgmt    │
│ • Triage        │    │ • Audit Logs    │    │ • Error Handling│
│ • Scheduling    │    │ • UI Panels     │    │ • Agent-to-Agent│
│ • Context Reas. │    │ • Scope Control │    │ • Branching     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Phase 1: System Architecture & Foundation

### 1.1 Core Dependencies to Add
```bash
npm install:
# AI/LLM Integration
- @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/core
- @langchain/core @langchain/openai
- openai anthropic

# Validation & Schema
- zod @hookform/resolvers
- ajv

# Workflow Engine 
- @temporalio/workflow @temporalio/client
# OR custom state machine
- xstate

# Additional utilities
- uuid nanoid
- lodash-es
- date-fns-tz
```

### 1.2 Directory Structure Extension
```
src/
├── agentic-ai/           # AI Intelligence Layer
│   ├── agents/
│   │   ├── summarizer.js
│   │   ├── drafter.js
│   │   ├── decision-support.js
│   │   ├── triage.js
│   │   └── scheduler.js
│   ├── prompts/
│   ├── context/
│   └── index.js
├── cedar-os/             # Governance Layer
│   ├── tools/
│   │   ├── patient-tools.js
│   │   ├── encounter-tools.js
│   │   └── appointment-tools.js
│   ├── validation/
│   │   ├── schemas/
│   │   └── validators.js
│   ├── confirmation/
│   ├── ui/
│   │   ├── agent-cards/
│   │   ├── confirmation-dialogs/
│   │   └── result-panels/
│   └── index.js
├── mastra/               # Orchestration Layer
│   ├── workflows/
│   │   ├── visit-prep.js
│   │   ├── lab-review.js
│   │   └── discharge-summary.js
│   ├── state/
│   ├── engine/
│   └── index.js
└── hooks/
    ├── useAgentWorkflow.js
    ├── useCedarTools.js
    └── useMastraState.js
```

## 🧠 Phase 2: Agentic AI Intelligence Layer

### 2.1 Core AI Agents

#### Summarizer Agent
```javascript
// src/agentic-ai/agents/summarizer.js
export class SummarizerAgent {
  async summarizePatientTimeline(patientId, timeframe = '30days') {
    // Condense visits, labs, medications into bullet points
    // Return: { timeline: [], keyFindings: [], alerts: [] }
  }
  
  async summarizeEncounterNotes(encounterId) {
    // Extract key points from previous encounters
  }
  
  async summarizeLabTrends(patientId, labTypes = []) {
    // Identify trends and abnormalities
  }
}
```

#### Drafter Agent
```javascript
// src/agentic-ai/agents/drafter.js
export class DrafterAgent {
  async draftSOAPNote(patientId, encounterData) {
    // Generate SOAP note structure
    // Return: { subjective, objective, assessment, plan }
  }
  
  async draftMessageReply(messageId, context) {
    // Draft patient/provider message responses
  }
  
  async draftOrderProposals(patientId, clinicalContext) {
    // Suggest lab orders, referrals, medications
  }
}
```

### 2.2 Context Management
```javascript
// src/agentic-ai/context/memory.js
export class AgentMemory {
  constructor(patientId, sessionId) {
    this.patientId = patientId;
    this.sessionId = sessionId;
    this.conversationHistory = [];
    this.clinicalContext = {};
  }
  
  async remember(step, input, output) {
    // Track conversation and decisions
  }
  
  async recall(contextType) {
    // Retrieve relevant context for next step
  }
}
```

## 🛡️ Phase 3: Cedar-OS Governance Layer

### 3.1 Safe Tool Definitions
```javascript
// src/cedar-os/tools/patient-tools.js
import { z } from 'zod';

export const PatientTools = {
  get_patient_timeline: {
    name: 'get_patient_timeline',
    description: 'Retrieve patient medical timeline',
    schema: z.object({
      patientId: z.string().uuid(),
      timeframe: z.enum(['7days', '30days', '90days', '1year']).default('30days'),
      includeTypes: z.array(z.enum(['encounters', 'labs', 'medications', 'appointments'])).optional()
    }),
    confirm: false, // Read operation
    implementation: async (args) => {
      // Cedar policy check first
      await validateAccess('ViewPatient', args.patientId);
      // Implementation
    }
  },
  
  draft_progress_note: {
    name: 'draft_progress_note',
    description: 'Draft a progress note for patient encounter',
    schema: z.object({
      patientId: z.string().uuid(),
      encounterId: z.string().uuid(),
      template: z.enum(['soap', 'brief', 'detailed']).default('soap')
    }),
    confirm: true, // Requires confirmation before execution
    implementation: async (args) => {
      // Implementation with audit logging
    }
  },
  
  create_appointment: {
    name: 'create_appointment',
    description: 'Create new patient appointment',
    schema: z.object({
      patientId: z.string().uuid(),
      providerId: z.string().uuid(),
      appointmentType: z.string(),
      preferredDate: z.string().datetime(),
      duration: z.number().min(15).max(180)
    }),
    confirm: true, // Requires confirmation
    implementation: async (args) => {
      // Implementation
    }
  }
};
```

### 3.2 Validation & Enforcement
```javascript
// src/cedar-os/validation/validators.js
export class CedarValidator {
  static async validateToolCall(toolName, args, context) {
    // 1. Schema validation with Zod
    const tool = getToolDefinition(toolName);
    const validArgs = tool.schema.parse(args);
    
    // 2. Cedar policy check
    const allowed = await cedarAuthorize(
      context.user,
      tool.action,
      { patientId: validArgs.patientId }
    );
    
    if (!allowed) {
      throw new Error(`Access denied for ${toolName}`);
    }
    
    // 3. Scope enforcement
    await validateScope(validArgs, context.orgId);
    
    return { valid: true, sanitizedArgs: validArgs };
  }
}
```

### 3.3 UI Components for Governance
```jsx
// src/cedar-os/ui/confirmation-dialogs/ToolConfirmationDialog.jsx
export function ToolConfirmationDialog({ 
  toolName, 
  args, 
  preview, 
  onConfirm, 
  onReject 
}) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm AI Action</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Tool: {toolName}</h4>
            <p className="text-sm text-muted-foreground">
              {getToolDescription(toolName)}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Preview:</h4>
            <pre className="bg-muted p-3 rounded text-sm">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onConfirm} className="bg-green-600">
              Approve & Execute
            </Button>
            <Button onClick={onReject} variant="destructive">
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 🧠 Phase 4: Mastra Orchestration Engine

### 4.1 Workflow Engine
```javascript
// src/mastra/engine/workflow-engine.js
export class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.activeExecutions = new Map();
  }
  
  async executeWorkflow(workflowName, input, context) {
    const workflow = this.workflows.get(workflowName);
    const executionId = generateId();
    
    const execution = new WorkflowExecution(
      executionId,
      workflow,
      input,
      context
    );
    
    this.activeExecutions.set(executionId, execution);
    
    try {
      const result = await execution.run();
      return result;
    } catch (error) {
      await this.handleWorkflowError(executionId, error);
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }
}
```

### 4.2 Visit Prep Workflow
```javascript
// src/mastra/workflows/visit-prep.js
export const VisitPrepWorkflow = {
  name: 'VISIT_PREP',
  description: 'Prepare for patient visit',
  steps: [
    {
      name: 'get_timeline',
      tool: 'get_patient_timeline',
      args: (input) => ({
        patientId: input.patientId,
        timeframe: '90days'
      })
    },
    {
      name: 'summarize_timeline',
      agent: 'summarizer',
      method: 'summarizePatientTimeline',
      dependsOn: ['get_timeline'],
      args: (input, context) => ({
        timeline: context.get_timeline.result,
        focusAreas: input.visitReason
      })
    },
    {
      name: 'draft_note_template',
      agent: 'drafter',
      method: 'draftSOAPNote',
      dependsOn: ['summarize_timeline'],
      args: (input, context) => ({
        patientId: input.patientId,
        summary: context.summarize_timeline.result,
        visitType: input.visitType
      }),
      confirm: true // Requires user confirmation
    },
    {
      name: 'suggest_orders',
      agent: 'drafter',
      method: 'draftOrderProposals',
      dependsOn: ['summarize_timeline'],
      args: (input, context) => ({
        patientId: input.patientId,
        clinicalContext: context.summarize_timeline.result
      }),
      condition: (input) => input.includeOrderSuggestions
    }
  ]
};
```

### 4.3 State Management
```javascript
// src/mastra/state/workflow-state.js
export class WorkflowState {
  constructor(executionId) {
    this.executionId = executionId;
    this.steps = new Map();
    this.currentStep = null;
    this.status = 'pending';
    this.results = {};
    this.errors = [];
  }
  
  async updateStep(stepName, status, result, error) {
    this.steps.set(stepName, {
      status,
      result,
      error,
      timestamp: new Date()
    });
    
    if (status === 'completed') {
      this.results[stepName] = result;
    }
    
    // Persist state for recovery
    await this.persist();
  }
  
  async persist() {
    // Save to database for error recovery
    await supabase.from('workflow_executions').upsert({
      execution_id: this.executionId,
      state: JSON.stringify(this.toJSON()),
      updated_at: new Date()
    });
  }
}
```

## 🔧 Phase 5: Integration & React Hooks

### 5.1 Main Workflow Hook
```jsx
// src/hooks/useAgentWorkflow.js
export function useAgentWorkflow(workflowName) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  
  const executeWorkflow = useCallback(async (input) => {
    setLoading(true);
    setError(null);
    
    try {
      const engine = new WorkflowEngine();
      const execution = await engine.executeWorkflow(
        workflowName,
        input,
        { user: currentUser, onConfirmation: handleConfirmation }
      );
      
      setState(execution.state);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [workflowName, currentUser]);
  
  const handleConfirmation = useCallback((confirmation) => {
    setPendingConfirmations(prev => [...prev, confirmation]);
  }, []);
  
  return {
    state,
    loading,
    error,
    pendingConfirmations,
    executeWorkflow,
    confirmStep: (stepId, approved) => {
      // Handle step confirmation
    }
  };
}
```

### 5.2 Agent Card Component
```jsx
// src/cedar-os/ui/agent-cards/AgentCard.jsx
export function AgentCard({ 
  agentType, 
  title, 
  description, 
  result, 
  status, 
  onConfirm, 
  onReject 
}) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      case 'waiting_confirmation': return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <h3 className="font-medium">{title}</h3>
        </div>
        <Badge variant="secondary">{agentType}</Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      
      {result && (
        <div className="bg-muted p-3 rounded text-sm mb-4">
          <pre>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      {status === 'waiting_confirmation' && (
        <div className="flex gap-2">
          <Button size="sm" onClick={onConfirm} className="bg-green-600">
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={onReject}>
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}
```

## 🚀 Phase 6: Implementation Workflow

### 6.1 Weekly Sprint Plan

**Week 1: Foundation**
- [ ] Add dependencies and update project structure
- [ ] Implement basic AI agent interfaces
- [ ] Set up workflow engine foundation
- [ ] Create Cedar tool validation system

**Week 2: Core Agents**
- [ ] Implement Summarizer Agent
- [ ] Implement Drafter Agent  
- [ ] Implement Decision Support Agent
- [ ] Create agent memory/context system

**Week 3: Cedar-OS Tools**
- [ ] Implement patient tools with Cedar validation
- [ ] Create confirmation dialog system
- [ ] Build agent result UI components
- [ ] Integrate audit logging for all tools

**Week 4: Mastra Workflows**
- [ ] Implement Visit Prep workflow
- [ ] Create workflow state management
- [ ] Build error handling and retry logic
- [ ] Implement workflow persistence

**Week 5: Integration & UI**
- [ ] Create React hooks for workflows
- [ ] Build main agent dashboard
- [ ] Implement real-time workflow status
- [ ] Add confirmation flow UI

**Week 6: Testing & Polish**
- [ ] Comprehensive testing suite
- [ ] Error scenarios and edge cases
- [ ] Performance optimization
- [ ] Documentation and demo workflows

### 6.2 Example Usage
```jsx
// Usage in a patient encounter page
function PatientEncounterPage({ patientId }) {
  const { 
    state, 
    loading, 
    executeWorkflow, 
    pendingConfirmations 
  } = useAgentWorkflow('VISIT_PREP');
  
  const handleStartVisitPrep = () => {
    executeWorkflow({
      patientId,
      visitType: 'follow-up',
      visitReason: 'diabetes management',
      includeOrderSuggestions: true
    });
  };
  
  return (
    <div className="space-y-6">
      <Button onClick={handleStartVisitPrep} disabled={loading}>
        Start Visit Preparation
      </Button>
      
      {state && (
        <div className="space-y-4">
          {Object.entries(state.steps).map(([stepName, step]) => (
            <AgentCard
              key={stepName}
              agentType={step.agent || step.tool}
              title={step.title}
              result={step.result}
              status={step.status}
            />
          ))}
        </div>
      )}
      
      {pendingConfirmations.map((confirmation) => (
        <ToolConfirmationDialog
          key={confirmation.id}
          {...confirmation}
        />
      ))}
    </div>
  );
}
```

This plan provides a comprehensive foundation for building your Agentic AI system with proper governance and orchestration. The modular architecture allows for incremental development and testing of each component.

Would you like me to start implementing any specific part of this plan?