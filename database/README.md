# EMR Co-Pilot Database Setup

Clean database setup for hosted Supabase project using the `public` schema.

## 📁 Files

- **`schema.sql`** - Complete database schema with all tables, types, and indexes
- **`seed_data.sql`** - Sample healthcare data (3 patients, encounters, medications, etc.)
- **`README.md`** - This setup guide

## 🗄️ Database Structure

**Schema:** `public`

**Tables:**
- `users` - Healthcare providers  
- `patients` - Patient demographics (JSONB for address/insurance)
- `encounters` - Medical visits with SOAP notes and vitals
- `medications` - Prescriptions and dosages
- `lab_results` - Test results with reference ranges
- `appointments` - Scheduled visits
- `agent_actions` - AI interactions (summaries, literature, SOAP notes)
- `literature_results` - AI-curated medical studies
- `audit_log` - Compliance tracking

**Features:**
✅ Custom ENUM types for medical data  
✅ JSONB for flexible nested data  
✅ Performance indexes  
✅ Auto-updating timestamps  
✅ No RLS (MVP friendly)  

## 🚀 Setup Instructions

### 1. Create Hosted Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Select region and create project
5. Wait for project to be ready (2-3 minutes)

### 2. Run Database Schema

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the entire contents of `schema.sql`
4. Click "Run" to create all tables and structures

### 3. Load Sample Data

1. In the SQL Editor, create a new query
2. Copy and paste the entire contents of `seed_data.sql`  
3. Click "Run" to insert all sample data

### 4. Verify Setup

Check that all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Count records in each table:
```sql
SELECT 'users' as table_name, count(*) as records FROM public.users
UNION ALL
SELECT 'patients', count(*) FROM public.patients
UNION ALL  
SELECT 'encounters', count(*) FROM public.encounters
UNION ALL
SELECT 'medications', count(*) FROM public.medications
UNION ALL
SELECT 'lab_results', count(*) FROM public.lab_results
UNION ALL
SELECT 'agent_actions', count(*) FROM public.agent_actions
UNION ALL
SELECT 'literature_results', count(*) FROM public.literature_results
UNION ALL
SELECT 'appointments', count(*) FROM public.appointments;
```

Expected results:
- users: 3
- patients: 3  
- encounters: 3
- medications: 3
- lab_results: 3
- agent_actions: 2
- literature_results: 3
- appointments: 2

## 🔑 Environment Variables

Add these to your Next.js `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Find these values in:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

## 🔍 Sample Queries

**Get patient with all related data:**
```sql
SELECT 
  p.*,
  (SELECT json_agg(e.*) FROM public.encounters e WHERE e.patient_id = p.id) as encounters,
  (SELECT json_agg(m.*) FROM public.medications m WHERE m.patient_id = p.id AND m.is_active = true) as medications,
  (SELECT json_agg(l.*) FROM public.lab_results l WHERE l.patient_id = p.id) as lab_results
FROM public.patients p
WHERE p.id = '550e8400-e29b-41d4-a716-446655440010';
```

**Get recent agent actions:**
```sql
SELECT * FROM public.agent_actions 
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440010'
ORDER BY created_at DESC;
```

## 📊 Sample Data Overview

**Patients:**
- Sarah Johnson (F, 39) - Hypertension, annual physical
- Michael Chen (M, 46) - Chest pain, musculoskeletal  
- Emily Rodriguez (F, 32) - Healthy, no visits yet

**Providers:**
- Dr. John Smith (Family Medicine)
- Dr. Sarah Wilson (Internal Medicine)
- Dr. Michael Johnson (Cardiology)

**AI Actions:**
- Patient summary for Sarah Johnson  
- Draft SOAP note (pending confirmation)

## 🔒 Security Note

**Current Setup (MVP):**
- No Row Level Security (RLS)
- Public read/write access via API
- Perfect for development, NOT production

**For Production:**
- Enable RLS on all tables
- Add proper authentication
- Implement role-based access
- Add API route protection

## 🛠️ Next Steps

1. ✅ Set up hosted Supabase project
2. ✅ Run schema and seed data  
3. 🔄 Install Supabase client in Next.js
4. 🔄 Create API functions to replace mock data
5. 🔄 Update frontend to use real database

Your EMR database is now ready for integration! 🎉