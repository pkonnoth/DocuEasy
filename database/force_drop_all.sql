-- Force drop everything - more aggressive approach
-- WARNING: This will delete ALL data and structures!

-- First, drop all tables with CASCADE to break dependencies
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.literature_results CASCADE;
DROP TABLE IF EXISTS public.agent_actions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.lab_results CASCADE;
DROP TABLE IF EXISTS public.medications CASCADE;
DROP TABLE IF EXISTS public.encounters CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions that might be using the types
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Force drop types one by one with CASCADE
DO $$ 
BEGIN
    -- Drop each type individually with error handling
    BEGIN
        DROP TYPE IF EXISTS public.gender_type CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop gender_type: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.encounter_type CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop encounter_type: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.encounter_status CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop encounter_status: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.lab_status CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop lab_status: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.appointment_status CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop appointment_status: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.agent_action_type CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop agent_action_type: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.agent_action_status CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop agent_action_status: %', SQLERRM;
    END;
    
    BEGIN
        DROP TYPE IF EXISTS public.audit_entity_type CASCADE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop audit_entity_type: %', SQLERRM;
    END;
END $$;

-- Check what types still exist
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typname LIKE '%_type%' OR typname LIKE '%_status%';

-- Show message
DO $$ BEGIN
    RAISE NOTICE 'Drop completed. Check the output above for any remaining types.';
END $$;