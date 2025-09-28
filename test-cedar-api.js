/**
 * Simple test script for Cedar API endpoint
 * Run with: node test-cedar-api.js
 */

const API_BASE_URL = 'http://localhost:3000';

// Test data for demo setup - matches your auth-demo.js
const TEST_DATA = {
  user_id: 'demo-user-123', // Match your existing demo auth system
  patient_id: '123e4567-e89b-12d3-a456-426614174001', // Replace with actual patient ID
  encounter_id: '123e4567-e89b-12d3-a456-426614174002' // Replace with actual encounter ID (optional)
};

async function testCedarAPI() {
  console.log('🧪 Testing Cedar API Endpoint');
  console.log('================================\n');

  // Test 1: Get Patient Timeline
  console.log('1️⃣ Testing GET_PATIENT_TIMELINE...');
  await testTool('get_patient_timeline', {
    patient_id: TEST_DATA.patient_id,
    timeframe: '30days',
    include_types: ['encounters', 'labs', 'medications']
  });

  // Test 2: Draft Progress Note
  console.log('\n2️⃣ Testing DRAFT_PROGRESS_NOTE...');
  await testTool('draft_progress_note', {
    patient_id: TEST_DATA.patient_id,
    encounter_id: TEST_DATA.encounter_id,
    template: 'soap',
    context: 'Patient presents with chest pain and shortness of breath'
  });

  // Test 3: Create Appointment
  console.log('\n3️⃣ Testing CREATE_APPOINTMENT...');
  await testTool('create_appointment', {
    patient_id: TEST_DATA.patient_id,
    appointment_type: 'follow-up',
    duration_minutes: 30,
    reason: 'Follow up on recent lab results'
  });

  console.log('\n✅ All tests completed!');
}

async function testTool(toolName, args) {
  try {
    const payload = {
      tool: toolName,
      args: args,
      patient_id: TEST_DATA.patient_id,
      user_id: TEST_DATA.user_id
    };

    console.log(`📤 Request:`, JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/agent/cedar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success:`, JSON.stringify(result, null, 2));
    } else {
      console.log(`❌ Error:`, JSON.stringify(result, null, 2));
    }

    console.log(`⏱️  Execution time: ${result.execution_time_ms}ms`);
    
  } catch (error) {
    console.error(`❌ Network Error:`, error.message);
  }
}

// Run tests
testCedarAPI().catch(console.error);

/**
 * Usage Instructions:
 * 
 * 1. Make sure your Next.js app is running: npm run dev
 * 2. Update TEST_DATA with actual UUIDs from your database
 * 3. Run this script: node test-cedar-api.js
 * 
 * Expected Results:
 * - get_patient_timeline: Returns timeline data or empty arrays
 * - draft_progress_note: Creates a draft note and returns note_id
 * - create_appointment: Creates appointment and returns appointment_id
 * - All actions should be logged in audit_logs table
 */