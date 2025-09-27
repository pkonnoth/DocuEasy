# 🚀 Supabase Setup Instructions

Follow these steps to connect your EMR app to Supabase.

## 1. Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Set project name: `emr-copilot` (or your preference)
5. Generate a database password (save it!)
6. Select your region
7. Click **"Create new project"**
8. Wait 2-3 minutes for setup to complete

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghij.supabase.co`)
   - **anon public** key (long JWT token starting with `eyJ...`)

## 3. Update Your Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```bash
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-starting-with-eyJ
```

⚠️ **Important**: Never commit your actual API keys to Git!

## 4. Set Up Your Database

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste and click **"Run"**
4. Copy the entire contents of `database/seed_data.sql`
5. Paste and click **"Run"**

## 5. Verify Setup

Run this query in SQL Editor to check your data:

```sql
SELECT 'users' as table_name, count(*) as records FROM public.users
UNION ALL
SELECT 'patients', count(*) FROM public.patients
UNION ALL  
SELECT 'encounters', count(*) FROM public.encounters;
```

Expected results:
- users: 3
- patients: 3  
- encounters: 3

## 6. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## 7. Test Connection

Create a simple test file to verify connection:

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Test query
const { data, error } = await supabase
  .from('patients')
  .select('first_name, last_name')
  .limit(1)

console.log('Test result:', data, error)
```

## 🎉 You're Ready!

Your EMR app can now connect to real PostgreSQL data through Supabase!

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` 
- ✅ Using anon key for client-side (safe for public)
- ⚠️ No Row Level Security (MVP only - add for production)

## 📞 Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- Check your browser console for connection errors