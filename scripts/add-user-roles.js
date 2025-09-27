// Script to add user metadata for roles
// Run with: node scripts/add-user-roles.js

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You need to add this to .env.local

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  console.log('Get it from Supabase Dashboard → Settings → API → service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addUserRoles() {
  try {
    console.log('🔍 Fetching users...')
    
    // Get all users
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError)
      return
    }

    console.log(`📊 Found ${users.users.length} users`)

    // Update each user with role metadata
    for (const user of users.users) {
      let role = 'clinician' // default role
      
      // Determine role based on email
      if (user.email === 'admin@gmail.com') {
        role = 'admin'
      } else if (user.email === 'clinician@emr.com') {
        role = 'clinician'
      }

      console.log(`👤 Updating ${user.email} with role: ${role}`)

      // Update user metadata
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          role: role
        }
      })

      if (error) {
        console.error(`❌ Error updating ${user.email}:`, error)
      } else {
        console.log(`✅ Updated ${user.email} with role: ${role}`)
      }
    }

    console.log('🎉 All users updated!')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

addUserRoles()