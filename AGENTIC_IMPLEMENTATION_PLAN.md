# Agentic AI Implementation Plan
*Based on README.md MVP Requirements*

## 🎯 Core Objective
Build a minimal but functional Agentic AI system with 3 core tools, orchestrated workflows, and Cedar-OS governance - deliverable in 1-2 weeks.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PATIENT PAGE                            │
├─────────────────────────────────────────────────────────────┤
│  [Summarize] [Draft Note] [Schedule Follow-up] [Alerts🔴]  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Summary Card  │  │  Draft Note     │  │ Appointments │ │
│  │   • Timeline    │  │  • SOAP Draft   │  │ • Confirmed  │ │
│  │   • Key Points  │  │  • Status:Draft │  │ • Pending    │ │
│  │   • Citations   │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│               CEDAR-OS GOVERNANCE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  Tools: get_timeline | draft_note | create_appointment     │
│  Validation: Zod schemas + Cedar policies                  │
│  Confirmation: Required for all writes                     │
│  Audit: Every tool call → audit_logs table                 │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│               MASTRA ORCHESTRATION                          │
├─────────────────────────────────────────────────────────────┤
│  Visit Prep: GET_TIMELINE → LLM_SUMMARY → DRAFT_NOTE       │
│  Follow-Up: COMPUTE_SLOTS → CEDAR_CONFIRM → CREATE_APPT    │
│  Alerts: GET_LABS → CLASSIFY → ALERT_CARD                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  AGENTIC AI CORE                            │
├─────────────────────────────────────────────────────────────┤
│  OpenAI GPT-4o: Summarization, Draft Generation, Triage    │
│  Context Memory: Patient timeline, clinical reasoning       │
│  Prompt Templates: Medical-specific prompts                │
└─────────────────────────────────────────────────────────────┘
```

## 🛠 Minimal Feature Implementation

### 1. Core Tools (Cedar-OS Layer)
```javascript
// Three essential tools matching your requirements:

GET_PATIENT_TIMELINE: {
  // Read-only, no confirmation needed
  input: { patientId, timeframe }
  output: { encounters[], labs[], medications[] }
  audit: "user viewed timeline for patient X"
}

DRAFT_PROGRESS_NOTE: {
  // Write operation, creates draft only
  input: { patientId, encounterId, template }
  output: { note_id, content, status: 'draft' }
  confirmation: false // Creates draft, never finalizes
  audit: "user drafted note for patient X"
}

CREATE_APPOINTMENT: {
  // Write operation, requires confirmation
  input: { patientId, providerId, date, type }
  output: { appointment_id, scheduled_date }
  confirmation: true // Must be explicitly approved
  audit: "user created appointment for patient X"
}
```

### 2. Orchestrated Flows (Mastra Layer)
```javascript
// Three key workflows from your README:

VISIT_PREP_FLOW: {
  steps: [
    "GET_PATIENT_TIMELINE(90days)",
    "LLM_SUMMARIZE(timeline_data)",
    "DRAFT_PROGRESS_NOTE(summary_context)"
  ],
  success_criteria: "Complete in <2s, cite sources",
  ui_result: "Summary card with timeline + key points"
}

FOLLOW_UP_FLOW: {
  steps: [
    "COMPUTE_AVAILABLE_SLOTS(provider, +2weeks)",
    "PRESENT_OPTIONS(3_best_slots)",
    "CEDAR_CONFIRM(user_selection)",
    "CREATE_APPOINTMENT(confirmed_slot)"
  ],
  success_criteria: "≤30s total time, explicit confirmation",
  ui_result: "Appointment in confirmed state"
}

ALERTS_LITE_FLOW: {
  steps: [
    "GET_RECENT_LABS(patientId, 7days)",
    "CLASSIFY_CRITICALITY(lab_values)",
    "ALERT_CARD(critical_only)"
  ],
  success_criteria: "Show only critical alerts",
  ui_result: "Red alert chip on patient page"
}
```

### 3. UI Components (Cedar Panel)
```jsx
// Main Cedar Panel on Patient Page:

<CedarPanel patientId={patientId}>
  <ToolButton 
    action="visit_prep" 
    label="Summarize"
    icon={<Brain />}
  />
  <ToolButton 
    action="draft_note" 
    label="Draft Note"
    icon={<FileText />}
  />
  <ToolButton 
    action="schedule_followup" 
    label="Schedule Follow-up"
    icon={<Calendar />}
    requiresConfirmation={true}
  />
  <AlertChip 
    criticalCount={alerts.critical.length}
    onClick={() => showAlerts()}
  />
</CedarPanel>

// Results Display:
<ResultsSection>
  <SummaryCard data={summaryResult} />
  <DraftNoteCard noteId={draftId} status="draft" />
  <AppointmentCard appointment={newAppt} />
</ResultsSection>
```

## 🗓 10-Day Implementation Schedule

### **Days 1-2: Foundation & Tools Scaffold**
- [ ] Create `/api/agent/cedar` endpoint
- [ ] Implement 3 core tools with Zod validation
- [ ] Set up audit logging for every tool call
- [ ] Create seed data for testing
- [ ] Basic Cedar panel UI shell

**Deliverable**: Tools respond with mock data, audit logs capture calls

### **Days 3-4: Visit Prep Flow + Summary**
- [ ] Implement `GET_PATIENT_TIMELINE` tool
- [ ] Add OpenAI integration for summarization
- [ ] Create `LLM_SUMMARIZE` agent with medical prompts
- [ ] Build Summary Card UI component
- [ ] Ensure <2s response time with citations

**Deliverable**: "Summarize" button works, shows timeline summary with sources

### **Days 5-6: Draft Note Tool + Notes UI**
- [ ] Implement `DRAFT_PROGRESS_NOTE` tool
- [ ] Create SOAP note template system
- [ ] Add draft notes to database schema
- [ ] Build notes list UI showing draft status
- [ ] Ensure drafts never auto-finalize

**Deliverable**: "Draft Note" creates draft entry, visible in notes list

### **Days 7-8: Follow-up Flow + Confirmation**
- [ ] Implement `COMPUTE_AVAILABLE_SLOTS` logic
- [ ] Build `CREATE_APPOINTMENT` tool with confirmation
- [ ] Create confirmation dialog UI
- [ ] Add appointment list showing confirmed slots
- [ ] Ensure ≤30s total workflow time

**Deliverable**: "Schedule Follow-up" requires confirmation, creates appointment

### **Day 9: Alerts System**
- [ ] Implement `GET_RECENT_LABS` tool
- [ ] Add `CLASSIFY_CRITICALITY` agent
- [ ] Create alert chip UI (red indicator)
- [ ] Show only critical alerts
- [ ] Integration with patient page header

**Deliverable**: Alert chip shows when critical labs exist

### **Day 10: Polish & Demo Prep**
- [ ] Handle empty states (no timeline, no labs)
- [ ] Error handling for API failures
- [ ] Loading states and progress indicators
- [ ] Create demo script with seed patients
- [ ] Performance optimization

**Deliverable**: Polished demo-ready system

## 🎯 Success Metrics (Demo Validation)

### 1. Performance Targets
- ✅ **Summarize**: <2s response time on seed data
- ✅ **Draft Note**: Saved as draft, never auto-finalized
- ✅ **Follow-up**: ≤30s total time with confirmation
- ✅ **Audit**: 100% tool calls logged

### 2. User Experience Goals
- ✅ **≥50% fewer clicks** to produce visit note vs manual
- ✅ **Explicit confirmation** required for all writes
- ✅ **Citations included** in all AI summaries

### 3. Technical Validation
```bash
# Test scenarios for demo:
1. Fresh patient → "Summarize" → Timeline summary with sources
2. Existing patient → "Draft Note" → SOAP draft in notes list
3. Any patient → "Schedule Follow-up" → Confirmation → Appointment
4. Patient with critical labs → Alert chip visible
5. Check audit_logs → Every action recorded
```

## 🚫 Explicit Non-Goals (MVP)
- Complex role-based access (use hardcoded demo users)
- Billing codes integration
- HL7/FHIR compatibility  
- Natural language ordering
- Full inbox management
- eRx integration

## 📋 Database Schema Requirements

### New Tables Needed:
```sql
-- Workflow execution tracking
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_type TEXT NOT NULL,
  patient_id UUID NOT NULL,
  status TEXT NOT NULL, -- 'running', 'completed', 'failed'
  input_data JSONB,
  result_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Notes with draft status
ALTER TABLE notes ADD COLUMN status TEXT DEFAULT 'draft';
ALTER TABLE notes ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;

-- Appointments if not exists
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  provider_id UUID,
  scheduled_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_by_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Core Endpoint:
```
POST /api/agent/cedar
{
  "tool": "get_patient_timeline" | "draft_progress_note" | "create_appointment",
  "args": { ... },
  "patient_id": "uuid",
  "user_id": "uuid"
}
```

### Workflow Endpoints:
```
POST /api/workflows/visit-prep
POST /api/workflows/follow-up
POST /api/workflows/alerts
```

This plan focuses on your exact MVP requirements and can be delivered within your 1-2 week timeline. Each day builds incrementally toward the final demo-ready system.