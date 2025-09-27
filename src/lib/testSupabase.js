import { supabase } from './supabase'

// Test Supabase connection and database setup
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...')
    const { data, error } = await supabase.from('patients').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Check if table exists
      if (error.code === '42P01') {
        console.log('💡 Table "patients" does not exist. You need to run the database schema!')
        console.log('📋 Steps to fix:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Open SQL Editor')
        console.log('3. Copy and paste database/schema.sql')
        console.log('4. Run the query')
        console.log('5. Copy and paste database/seed_data.sql')
        console.log('6. Run the seed query')
      }
      
      return { success: false, error }
    }
    
    console.log('✅ Basic connection successful!')
    
    // Test 2: Check if data exists
    console.log('📊 Testing data availability...')
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .limit(5)
    
    if (patientsError) {
      console.error('❌ Data query failed:', patientsError)
      return { success: false, error: patientsError }
    }
    
    if (patients && patients.length > 0) {
      console.log(`✅ Found ${patients.length} patients in database:`)
      patients.forEach(p => console.log(`   - ${p.first_name} ${p.last_name} (${p.id})`))
    } else {
      console.log('⚠️  No patients found. You may need to run the seed data!')
    }
    
    return { success: true, patientsCount: patients?.length || 0 }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return { success: false, error }
  }
}

// Run test automatically in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run once
  if (!window.__supabaseTestRun) {
    window.__supabaseTestRun = true
    testSupabaseConnection()
  }
}