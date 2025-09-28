-- =============================================================================
-- DATABASE CLEANUP SCRIPT
-- =============================================================================
-- This script removes all custom types that might already exist
-- Run this BEFORE applying the master_schema.sql

-- Drop custom types (if they exist)
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS encounter_type CASCADE;
DROP TYPE IF EXISTS encounter_status CASCADE;
DROP TYPE IF EXISTS lab_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS agent_action_type CASCADE;
DROP TYPE IF EXISTS agent_action_status CASCADE;
DROP TYPE IF EXISTS workflow_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS audit_result_status CASCADE;
DROP TYPE IF EXISTS confirmation_status CASCADE;
DROP TYPE IF EXISTS audit_entity_type CASCADE;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_patient_audit() CASCADE;
DROP FUNCTION IF EXISTS log_encounter_audit() CASCADE;
DROP FUNCTION IF EXISTS log_lab_result_audit() CASCADE;
DROP FUNCTION IF EXISTS log_medication_audit() CASCADE;
DROP FUNCTION IF EXISTS search_patient_embeddings(vector, UUID, float, int, text[]) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_embeddings(vector, float, int, text[]) CASCADE;
DROP FUNCTION IF EXISTS update_patient_embeddings_search_tokens() CASCADE;

-- Drop any existing views
DROP VIEW IF EXISTS patient_content_for_embedding CASCADE;

-- Success message
SELECT 'All custom types, functions, and views have been cleaned up!' as cleanup_status;