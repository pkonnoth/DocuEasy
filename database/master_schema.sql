-- =============================================================================
-- EMR AGENTIC AI - MASTER SCHEMA (Clean Creation)
-- =============================================================================
-- Creates all tables from scratch - no drops needed
-- Compatible with demo auth system - no user table dependencies

-- =============================================================================
-- EXTENSIONS AND SETUP
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector; -- For RAG vector similarity search

-- =============================================================================
-- CUSTOM TYPES
-- =============================================================================

-- Core EMR types
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE encounter_type AS ENUM ('Office Visit', 'Emergency', 'Telehealth', 'Follow-up', 'Annual Physical');
CREATE TYPE encounter_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE lab_status AS ENUM ('Normal', 'Abnormal', 'Critical', 'Pending');
CREATE TYPE appointment_status AS ENUM ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show');

-- AI Agent types
CREATE TYPE agent_action_type AS ENUM ('summary', 'literature', 'draft_note', 'schedule_followup', 'triage');
CREATE TYPE agent_action_status AS ENUM ('pending', 'completed', 'confirmed', 'rejected');
CREATE TYPE workflow_status AS ENUM ('running', 'completed', 'failed', 'cancelled');

-- Audit types
CREATE TYPE user_role AS ENUM ('admin', 'clinician', 'demo_user');
CREATE TYPE audit_result_status AS ENUM ('success', 'failure', 'pending');
CREATE TYPE confirmation_status AS ENUM ('auto_executed', 'approved', 'rejected', 'pending');
CREATE TYPE audit_entity_type AS ENUM ('patient', 'encounter', 'medication', 'lab', 'appointment');

-- =============================================================================
-- CORE EMR TABLES
-- =============================================================================

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    
    -- Address stored as JSONB for flexibility
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Insurance information as JSONB
    insurance JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Emergency contact as JSONB
    emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Allergies as text array
    allergies TEXT[] DEFAULT '{}',
    
    medical_record_number TEXT UNIQUE NOT NULL,
    created_by TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encounters table (medical visits)
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type encounter_type NOT NULL DEFAULT 'Office Visit',
    provider TEXT DEFAULT 'demo_provider',
    chief_complaint TEXT,
    assessment TEXT,
    plan TEXT,
    notes TEXT,
    
    -- Vitals stored as JSONB for flexibility
    vitals JSONB DEFAULT '{}'::jsonb,
    
    -- Diagnoses and procedures as arrays
    diagnoses TEXT[] DEFAULT '{}',
    procedures TEXT[] DEFAULT '{}',
    
    status encounter_status DEFAULT 'Scheduled',
    created_by TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Results table
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    result_value TEXT NOT NULL,
    result_unit TEXT,
    reference_range TEXT,
    status lab_status NOT NULL DEFAULT 'Pending',
    ordered_by TEXT DEFAULT 'demo_provider',
    ordered_date TIMESTAMPTZ DEFAULT NOW(),
    result_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    category TEXT DEFAULT 'general',
    is_critical BOOLEAN DEFAULT FALSE,
    created_by TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT DEFAULT 'oral',
    prescribed_by TEXT DEFAULT 'demo_provider',
    prescribed_date TIMESTAMPTZ DEFAULT NOW(),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    refills INTEGER DEFAULT 0,
    quantity TEXT,
    created_by TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id TEXT DEFAULT 'demo_provider',
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type TEXT NOT NULL,
    reason TEXT,
    status appointment_status DEFAULT 'Scheduled',
    notes TEXT,
    created_by_ai BOOLEAN DEFAULT FALSE,
    created_by TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CEDAR-OS PENDING OPERATIONS TABLE
-- =============================================================================

-- Pending Operations table (for confirmation workflows)
CREATE TABLE pending_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL, -- 'create_appointment', 'draft_progress_note', etc.
    tool_name TEXT NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL DEFAULT 'demo-user-123',
    
    -- Operation data
    operation_args JSONB NOT NULL DEFAULT '{}'::jsonb,
    operation_context JSONB DEFAULT '{}'::jsonb,
    
    -- Confirmation tracking
    confirmation_status confirmation_status DEFAULT 'pending',
    confirmed_by TEXT,
    confirmed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Risk and metadata
    risk_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    estimated_duration TEXT,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    
    -- Lifecycle
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for pending operations
CREATE INDEX idx_pending_operations_patient ON pending_operations(patient_id);
CREATE INDEX idx_pending_operations_user ON pending_operations(user_id);
CREATE INDEX idx_pending_operations_status ON pending_operations(confirmation_status);
CREATE INDEX idx_pending_operations_expires ON pending_operations(expires_at);

-- =============================================================================
-- AI AGENT TABLES
-- =============================================================================

-- Agent Actions table (AI interactions)
CREATE TABLE agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type agent_action_type NOT NULL,
    description TEXT NOT NULL,
    input_data JSONB DEFAULT '{}'::jsonb,
    result_data JSONB DEFAULT '{}'::jsonb,
    status agent_action_status DEFAULT 'pending',
    confirmation_required BOOLEAN DEFAULT TRUE,
    confirmed_by TEXT,
    user_id TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Literature Results table (AI-curated medical studies)
CREATE TABLE literature_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    journal TEXT NOT NULL,
    published_date DATE NOT NULL,
    abstract TEXT NOT NULL,
    doi TEXT,
    relevance_score NUMERIC(3,2) DEFAULT 0.0,
    keywords TEXT[] DEFAULT '{}',
    patient_id UUID REFERENCES patients(id),
    agent_action_id UUID REFERENCES agent_actions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table (for AI-generated clinical notes)
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id),
    title TEXT DEFAULT 'Progress Note',
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'final', 'signed'
    template TEXT DEFAULT 'soap', -- 'soap', 'brief', 'detailed'
    ai_generated BOOLEAN DEFAULT FALSE,
    created_by TEXT DEFAULT 'demo-user-123',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions table (AI workflow tracking)
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type TEXT NOT NULL, -- 'visit_prep', 'follow_up', 'alerts'
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'demo-user-123',
    status workflow_status NOT NULL DEFAULT 'running',
    input_data JSONB,
    result_data JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER
);

-- =============================================================================
-- AUDIT AND COMPLIANCE TABLES
-- =============================================================================

-- Comprehensive Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor (Who performed the action)
    actor_user_id TEXT DEFAULT 'demo-user-123',
    actor_email TEXT DEFAULT 'demo@emr.com',
    actor_role user_role DEFAULT 'admin',
    actor_agent_id TEXT, -- For AI actions
    
    -- Action (What was performed)
    action TEXT NOT NULL,
    tool_name TEXT,
    
    -- Scope (What was affected)
    scope_patient_id UUID,
    scope_org_id TEXT DEFAULT 'demo_org',
    scope_resource_type TEXT,
    scope_resource_id UUID,
    
    -- Input (How it was performed - PHI minimized)
    input_arguments JSONB DEFAULT '{}'::jsonb,
    
    -- Result (What happened)
    result_status audit_result_status DEFAULT 'success',
    result_data JSONB DEFAULT '{}'::jsonb,
    result_error_message TEXT,
    
    -- Confirmation (Was it approved)
    confirmation_status confirmation_status DEFAULT 'auto_executed',
    confirmed_by_user_id TEXT,
    
    -- Timing
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    session_id TEXT
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Patient indexes
CREATE INDEX idx_patients_mrn ON patients(medical_record_number);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

-- Encounter indexes
CREATE INDEX idx_encounters_patient_date ON encounters(patient_id, encounter_date DESC);
CREATE INDEX idx_encounters_date ON encounters(encounter_date DESC);
CREATE INDEX idx_encounters_status ON encounters(status);

-- Lab result indexes
CREATE INDEX idx_lab_results_patient_date ON lab_results(patient_id, result_date DESC);
CREATE INDEX idx_lab_results_critical ON lab_results(is_critical, result_date DESC);
CREATE INDEX idx_lab_results_status ON lab_results(status);

-- Medication indexes
CREATE INDEX idx_medications_patient_active ON medications(patient_id, is_active);
CREATE INDEX idx_medications_active_date ON medications(is_active, prescribed_date DESC);

-- Appointment indexes
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, scheduled_date);
CREATE INDEX idx_appointments_status_date ON appointments(status, scheduled_date);

-- Notes indexes
CREATE INDEX idx_notes_patient_id ON notes(patient_id, created_at DESC);
CREATE INDEX idx_notes_status ON notes(status);
CREATE INDEX idx_notes_ai_generated ON notes(ai_generated);

-- Agent action indexes
CREATE INDEX idx_agent_actions_patient ON agent_actions(patient_id, created_at DESC);
CREATE INDEX idx_agent_actions_status ON agent_actions(status);
CREATE INDEX idx_agent_actions_type ON agent_actions(type);

-- Workflow execution indexes
CREATE INDEX idx_workflow_executions_patient_id ON workflow_executions(patient_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_type ON workflow_executions(workflow_type);

-- Audit log indexes
CREATE INDEX idx_audit_logs_patient_id ON audit_logs(scope_patient_id, requested_at DESC);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(actor_user_id, action, requested_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, requested_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(result_status);

-- =============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables with updated_at columns
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounters_updated_at 
    BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at 
    BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at 
    BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_actions_updated_at 
    BEFORE UPDATE ON agent_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (DISABLED FOR DEMO)
-- =============================================================================

-- RLS disabled for demo simplicity
-- Tables will be fully accessible without authentication barriers
-- NOTE: Enable RLS and proper policies before production deployment

-- =============================================================================
-- HELPFUL VIEWS FOR DEVELOPMENT
-- =============================================================================

-- Patient summary view
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    p.first_name || ' ' || p.last_name as full_name,
    p.medical_record_number as mrn,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.email,
    COUNT(DISTINCT e.id) as encounter_count,
    COUNT(DISTINCT lr.id) as lab_count,
    COUNT(DISTINCT m.id) as medication_count,
    COUNT(DISTINCT a.id) as appointment_count,
    COUNT(DISTINCT n.id) as notes_count,
    MAX(e.encounter_date) as last_encounter_date,
    p.created_at
FROM patients p
LEFT JOIN encounters e ON p.id = e.patient_id
LEFT JOIN lab_results lr ON p.id = lr.patient_id
LEFT JOIN medications m ON p.id = m.patient_id AND m.is_active = true
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN notes n ON p.id = n.patient_id
GROUP BY p.id, p.first_name, p.last_name, p.medical_record_number, 
         p.date_of_birth, p.gender, p.phone, p.email, p.created_at;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE patients IS 'Core patient demographics and contact information';
COMMENT ON TABLE encounters IS 'Medical visits and encounters with providers';
COMMENT ON TABLE lab_results IS 'Laboratory test results with critical value flagging';
COMMENT ON TABLE medications IS 'Patient medications and prescriptions';
COMMENT ON TABLE appointments IS 'Patient appointments with AI creation tracking';
COMMENT ON TABLE notes IS 'Clinical notes with draft/final status and AI generation tracking';
COMMENT ON TABLE agent_actions IS 'AI agent interactions and their results';
COMMENT ON TABLE workflow_executions IS 'Tracking for AI workflow executions and results';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance and security';

-- Column comments for key fields
COMMENT ON COLUMN patients.medical_record_number IS 'Unique identifier for patient across systems';
COMMENT ON COLUMN encounters.vitals IS 'JSON object containing vital signs data';
COMMENT ON COLUMN lab_results.is_critical IS 'Flag for abnormal results requiring immediate attention';
COMMENT ON COLUMN notes.ai_generated IS 'Flag indicating if note was generated by AI';
COMMENT ON COLUMN audit_logs.input_arguments IS 'PHI-minimized input data for audit trail';

-- =============================================================================
-- RAG EMBEDDINGS TABLES FOR MASTRA
-- =============================================================================

-- Patient data embeddings table for RAG retrieval
CREATE TABLE patient_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Content metadata
    content_type TEXT NOT NULL, -- 'encounter', 'lab_result', 'medication', 'note', 'summary'
    content_id UUID, -- Reference to the actual data record
    content_text TEXT NOT NULL, -- The actual text content that was embedded
    content_metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata about the content
    
    -- Vector embedding (1536 dimensions for OpenAI text-embedding-ada-002)
    embedding vector(1536) NOT NULL,
    
    -- Search optimization
    search_tokens tsvector, -- Full-text search tokens
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base embeddings (for general medical knowledge)
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL, -- 'clinical_guideline', 'drug_info', 'medical_reference', etc.
    source_url TEXT,
    
    -- Vector embedding
    embedding vector(1536) NOT NULL,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    relevance_score FLOAT DEFAULT 1.0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient vector search
CREATE INDEX idx_patient_embeddings_patient_id ON patient_embeddings(patient_id);
CREATE INDEX idx_patient_embeddings_content_type ON patient_embeddings(content_type);
CREATE INDEX idx_patient_embeddings_embedding ON patient_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_patient_embeddings_search_tokens ON patient_embeddings USING gin(search_tokens);
CREATE INDEX idx_patient_embeddings_content_metadata ON patient_embeddings USING gin(content_metadata);

CREATE INDEX idx_knowledge_embeddings_source ON knowledge_embeddings(source);
CREATE INDEX idx_knowledge_embeddings_category ON knowledge_embeddings(category);
CREATE INDEX idx_knowledge_embeddings_embedding ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_knowledge_embeddings_tags ON knowledge_embeddings USING gin(tags);

-- Function to search patient-specific embeddings
CREATE OR REPLACE FUNCTION search_patient_embeddings(
    query_embedding vector(1536),
    target_patient_id UUID,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    content_types text[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    patient_id UUID,
    content_type TEXT,
    content_id UUID,
    content_text TEXT,
    content_metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pe.id,
        pe.patient_id,
        pe.content_type,
        pe.content_id,
        pe.content_text,
        pe.content_metadata,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM patient_embeddings pe
    WHERE 
        pe.patient_id = target_patient_id
        AND (content_types IS NULL OR pe.content_type = ANY(content_types))
        AND 1 - (pe.embedding <=> query_embedding) > match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search general medical knowledge
CREATE OR REPLACE FUNCTION search_knowledge_embeddings(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    categories text[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    source TEXT,
    category TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ke.id,
        ke.title,
        ke.content,
        ke.source,
        ke.category,
        1 - (ke.embedding <=> query_embedding) AS similarity
    FROM knowledge_embeddings ke
    WHERE 
        (categories IS NULL OR ke.category = ANY(categories))
        AND 1 - (ke.embedding <=> query_embedding) > match_threshold
    ORDER BY ke.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to update search tokens when content changes
CREATE OR REPLACE FUNCTION update_patient_embeddings_search_tokens()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_tokens := to_tsvector('english', NEW.content_text);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search tokens
CREATE TRIGGER trigger_update_patient_embeddings_search_tokens
    BEFORE INSERT OR UPDATE ON patient_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_patient_embeddings_search_tokens();

-- View to get embeddable content from patient data
CREATE OR REPLACE VIEW patient_content_for_embedding AS
SELECT 
    p.id as patient_id,
    'patient_summary' as content_type,
    p.id as content_id,
    CONCAT(
        'Patient: ', p.first_name, ' ', p.last_name, 
        ', Age: ', EXTRACT(YEAR FROM AGE(p.date_of_birth)), 
        ', Gender: ', p.gender,
        CASE 
            WHEN array_length(p.allergies, 1) > 0 
            THEN ', Allergies: ' || array_to_string(p.allergies, ', ')
            ELSE ''
        END
    ) as content_text,
    jsonb_build_object(
        'patient_name', CONCAT(p.first_name, ' ', p.last_name),
        'age', EXTRACT(YEAR FROM AGE(p.date_of_birth)),
        'gender', p.gender,
        'mrn', p.medical_record_number
    ) as content_metadata
FROM patients p

UNION ALL

SELECT 
    e.patient_id,
    'encounter' as content_type,
    e.id as content_id,
    CONCAT(
        'Encounter Date: ', e.encounter_date::date,
        ', Type: ', e.type,
        ', Provider: ', e.provider,
        CASE WHEN e.chief_complaint IS NOT NULL 
             THEN ', Chief Complaint: ' || e.chief_complaint 
             ELSE '' END,
        CASE WHEN e.assessment IS NOT NULL 
             THEN ', Assessment: ' || e.assessment 
             ELSE '' END,
        CASE WHEN e.plan IS NOT NULL 
             THEN ', Plan: ' || e.plan 
             ELSE '' END
    ) as content_text,
    jsonb_build_object(
        'encounter_date', e.encounter_date,
        'encounter_type', e.type,
        'provider', e.provider,
        'status', e.status
    ) as content_metadata
FROM encounters e

UNION ALL

SELECT 
    l.patient_id,
    'lab_result' as content_type,
    l.id as content_id,
    CONCAT(
        'Lab Test: ', l.test_name,
        ', Result: ', l.result_value,
        CASE WHEN l.result_unit IS NOT NULL 
             THEN ' ' || l.result_unit 
             ELSE '' END,
        ', Reference Range: ', l.reference_range,
        ', Status: ', l.status,
        ', Date: ', l.result_date::date
    ) as content_text,
    jsonb_build_object(
        'test_name', l.test_name,
        'result_value', l.result_value,
        'status', l.status,
        'is_critical', l.is_critical,
        'result_date', l.result_date
    ) as content_metadata
FROM lab_results l

UNION ALL

SELECT 
    m.patient_id,
    'medication' as content_type,
    m.id as content_id,
    CONCAT(
        'Medication: ', m.medication_name,
        ', Dosage: ', m.dosage,
        ', Frequency: ', m.frequency,
        ', Route: ', m.route,
        ', Prescribed by: ', m.prescribed_by,
        CASE WHEN m.instructions IS NOT NULL 
             THEN ', Instructions: ' || m.instructions 
             ELSE '' END
    ) as content_text,
    jsonb_build_object(
        'medication_name', m.medication_name,
        'dosage', m.dosage,
        'frequency', m.frequency,
        'is_active', m.is_active,
        'prescribed_date', m.prescribed_date
    ) as content_metadata
FROM medications m;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'EMR AGENTIC AI MASTER SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  ✓ patients (core patient data)';
    RAISE NOTICE '  ✓ encounters (medical visits)';  
    RAISE NOTICE '  ✓ lab_results (with critical flagging)';
    RAISE NOTICE '  ✓ medications (prescriptions)';
    RAISE NOTICE '  ✓ appointments (with AI tracking)';
    RAISE NOTICE '  ✓ notes (AI-generated notes)';
    RAISE NOTICE '  ✓ agent_actions (AI workflows)';
    RAISE NOTICE '  ✓ workflow_executions (AI orchestration)';
    RAISE NOTICE '  ✓ literature_results (AI research)';
    RAISE NOTICE '  ✓ audit_logs (comprehensive compliance)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run demo_seed_data.sql to add sample data';
    RAISE NOTICE '  2. Test Cedar API with: node test-cedar-api.js';
    RAISE NOTICE '  3. Add CedarPanel to patient pages';
    RAISE NOTICE '  4. Start building agentic workflows!';
    RAISE NOTICE '=============================================================================';
END
$$;