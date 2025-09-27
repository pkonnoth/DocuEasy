-- EMR Co-Pilot Database Schema
-- For hosted Supabase project - No Row Level Security (MVP)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for type safety
CREATE TYPE public.gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE public.encounter_type AS ENUM ('Office Visit', 'Emergency', 'Telehealth', 'Follow-up', 'Annual Physical');
CREATE TYPE public.encounter_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE public.lab_status AS ENUM ('Normal', 'Abnormal', 'Critical', 'Pending');
CREATE TYPE public.appointment_status AS ENUM ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show');
CREATE TYPE public.agent_action_type AS ENUM ('summary', 'literature', 'draft-note', 'schedule-followup');
CREATE TYPE public.agent_action_status AS ENUM ('pending', 'completed', 'confirmed', 'rejected');
CREATE TYPE public.audit_entity_type AS ENUM ('patient', 'encounter', 'medication', 'lab', 'appointment');
CREATE TYPE public.encounter_type AS ENUM ('Office Visit', 'Emergency', 'Telehealth', 'Follow-up', 'Annual Physical');
CREATE TYPE public.encounter_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE public.lab_status AS ENUM ('Normal', 'Abnormal', 'Critical', 'Pending');
CREATE TYPE public.appointment_status AS ENUM ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show');
CREATE TYPE public.agent_action_type AS ENUM ('summary', 'literature', 'draft-note', 'schedule-followup');
CREATE TYPE public.agent_action_status AS ENUM ('pending', 'completed', 'confirmed', 'rejected');
CREATE TYPE public.audit_entity_type AS ENUM ('patient', 'encounter', 'medication', 'lab', 'appointment');

-- Users table (healthcare providers)
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'provider',
  specialty TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE public.patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender public.gender_type NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  
  -- Address stored as JSON for flexibility
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Insurance information as JSON
  insurance JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Emergency contact as JSON
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Allergies as text array
  allergies TEXT[] DEFAULT '{}',
  
  medical_record_number TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encounters table (medical visits)
CREATE TABLE public.encounters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  type public.encounter_type NOT NULL,
  provider TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  notes TEXT,
  
  -- Vitals stored as JSON for flexibility
  vitals JSONB DEFAULT '{}'::jsonb,
  
  -- Diagnoses and procedures as arrays
  diagnoses TEXT[] DEFAULT '{}',
  procedures TEXT[] DEFAULT '{}',
  
  status public.encounter_status DEFAULT 'Scheduled',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE public.medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT NOT NULL,
  prescribed_by TEXT NOT NULL,
  prescribed_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  instructions TEXT,
  refills INTEGER DEFAULT 0,
  quantity TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Results table
CREATE TABLE public.lab_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  reference_range TEXT NOT NULL,
  status public.lab_status NOT NULL DEFAULT 'Pending',
  ordered_by TEXT NOT NULL,
  ordered_date DATE NOT NULL,
  result_date DATE NOT NULL,
  notes TEXT,
  category TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- minutes
  type TEXT NOT NULL,
  status public.appointment_status DEFAULT 'Scheduled',
  reason TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Actions table (AI interactions)
CREATE TABLE public.agent_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  type public.agent_action_type NOT NULL,
  description TEXT NOT NULL,
  result JSONB DEFAULT '{}'::jsonb,
  status public.agent_action_status DEFAULT 'pending',
  confirmation_required BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Literature Results table (AI-curated medical studies)
CREATE TABLE public.literature_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  journal TEXT NOT NULL,
  published_date DATE NOT NULL,
  abstract TEXT NOT NULL,
  doi TEXT,
  relevance_score INTEGER NOT NULL DEFAULT 0,
  keywords TEXT[] DEFAULT '{}',
  patient_id UUID REFERENCES public.patients(id),
  agent_action_id UUID REFERENCES public.agent_actions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log table (compliance tracking)
CREATE TABLE public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type public.audit_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  agent_action_id UUID REFERENCES public.agent_actions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_mrn ON public.patients(medical_record_number);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_encounters_patient_date ON public.encounters(patient_id, date DESC);
CREATE INDEX idx_encounters_date ON public.encounters(date DESC);
CREATE INDEX idx_medications_patient_active ON public.medications(patient_id, is_active);
CREATE INDEX idx_lab_results_patient_date ON public.lab_results(patient_id, result_date DESC);
CREATE INDEX idx_appointments_patient_date ON public.appointments(patient_id, date);
CREATE INDEX idx_agent_actions_patient ON public.agent_actions(patient_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user_date ON public.audit_log(user_id, created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON public.encounters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON public.lab_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_actions_updated_at BEFORE UPDATE ON public.agent_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();