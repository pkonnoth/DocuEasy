-- =============================================================================
-- MINIMAL AUTH SCHEMA FOR EMR SYSTEM
-- =============================================================================

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'clinician');

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'clinician',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  actor_role user_role,
  action TEXT NOT NULL,
  scope_patient_id UUID,
  input_arguments JSONB DEFAULT '{}',
  result_status TEXT DEFAULT 'success',
  result_error_message TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo users
INSERT INTO user_profiles (id, email, role)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'admin@gmail.com'), 'admin@gmail.com', 'admin'),
  ((SELECT id FROM auth.users WHERE email = 'clinician@emr.com'), 'clinician@emr.com', 'clinician')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
