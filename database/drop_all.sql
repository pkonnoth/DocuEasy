-- Drop all EMR tables and types for a clean restart
-- WARNING: This will delete ALL data!

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.literature_results CASCADE;
DROP TABLE IF EXISTS public.agent_actions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.lab_results CASCADE;
DROP TABLE IF EXISTS public.medications CASCADE;
DROP TABLE IF EXISTS public.encounters CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.audit_entity_type CASCADE;
DROP TYPE IF EXISTS public.agent_action_status CASCADE;
DROP TYPE IF EXISTS public.agent_action_type CASCADE;
DROP TYPE IF EXISTS public.appointment_status CASCADE;
DROP TYPE IF EXISTS public.lab_status CASCADE;
DROP TYPE IF EXISTS public.encounter_status CASCADE;
DROP TYPE IF EXISTS public.encounter_type CASCADE;
DROP TYPE IF EXISTS public.gender_type CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;