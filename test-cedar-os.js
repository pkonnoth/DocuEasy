#!/usr/bin/env node

/**
 * Test script for Cedar-OS implementation
 * Tests confirmation system, API integration, and Mastra backend
 */

const CEDAR_API_URL = 'http://localhost:3000/api/agent/cedar';
const CHAT_API_URL = 'http://localhost:3000/api/chat';
const TEST_PATIENT_ID = '123e4567-e89b-12d3-a456-426614174001';

/**
 * Test the Cedar API with confirmation system
 */
async function testCedarAPI() {
  console.log('🧪 Testing Cedar API...\n');

  // Test 1: Read-only operation (no confirmation required)
  console.log('1. Testing get_patient_timeline (no confirmation required)');
  try {
    const response = await fetch(CEDAR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'get_patient_timeline',
        args: {
          patient_id: TEST_PATIENT_ID,
          timeframe: '90days'
        },
        patient_id: TEST_PATIENT_ID,
        user_id: 'demo-user-123'
      })
    });

    const result = await response.json();
    
    if (result.success && !result.requires_confirmation) {
      console.log('✅ Timeline tool executed successfully');
      console.log(`   - Execution time: ${result.execution_time_ms}ms`);
      console.log(`   - Total items: ${result.result?.total_items || 0}`);
    } else {
      console.log('❌ Timeline tool failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Timeline test failed:', error.message);
  }

  console.log('');

  // Test 2: Write operation (confirmation required)
  console.log('2. Testing create_appointment (confirmation required)');
  try {
    const response = await fetch(CEDAR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'create_appointment',
        args: {
          patient_id: TEST_PATIENT_ID,
          appointment_type: 'follow-up',
          duration_minutes: 30
        },
        patient_id: TEST_PATIENT_ID,
        user_id: 'demo-user-123'
      })
    });

    const result = await response.json();
    
    if (result.success && result.requires_confirmation) {
      console.log('✅ Appointment tool correctly requires confirmation');
      console.log(`   - Pending operation ID: ${result.pending_operation_id}`);
      console.log(`   - Risk level: ${result.tool_config?.risk_level}`);
      console.log(`   - Estimated time: ${result.tool_config?.estimated_time}`);
      
      // Test confirmation flow
      console.log('\n   Testing confirmation flow...');
      const confirmResponse = await fetch(CEDAR_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'create_appointment',
          args: {
            patient_id: TEST_PATIENT_ID,
            appointment_type: 'follow-up',
            duration_minutes: 30
          },
          patient_id: TEST_PATIENT_ID,
          user_id: 'demo-user-123',
          confirmation_id: result.pending_operation_id
        })
      });

      const confirmResult = await confirmResponse.json();
      
      if (confirmResult.success && confirmResult.result) {
        console.log('✅ Confirmation flow completed successfully');
        console.log(`   - Appointment ID: ${confirmResult.result.appointment_id}`);
        console.log(`   - Scheduled date: ${confirmResult.result.scheduled_date}`);
      } else {
        console.log('❌ Confirmation flow failed:', confirmResult.error);
      }
      
    } else if (result.success && !result.requires_confirmation) {
      console.log('❌ Appointment tool should require confirmation but didn\'t');
    } else {
      console.log('❌ Appointment tool failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Appointment test failed:', error.message);
  }

  console.log('');
}

/**
 * Test the Chat API (Mastra integration)
 */
async function testChatAPI() {
  console.log('💬 Testing Chat API (Mastra integration)...\n');

  // Test 1: General chat
  console.log('1. Testing general chat response');
  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, I need help with patient care.' }
        ],
        patient_id: TEST_PATIENT_ID
      })
    });

    const result = await response.json();
    
    if (result.choices?.[0]?.message?.content) {
      console.log('✅ General chat response received');
      console.log(`   - Response: ${result.choices[0].message.content.substring(0, 100)}...`);
      console.log(`   - Token usage: ${result.usage?.total_tokens || 'unknown'}`);
    } else {
      console.log('❌ General chat failed');
    }
  } catch (error) {
    console.log('❌ General chat test failed:', error.message);
  }

  console.log('');

  // Test 2: Tool-triggering chat
  console.log('2. Testing tool-triggering chat (patient summary)');
  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Can you give me a patient timeline summary?' }
        ],
        patient_id: TEST_PATIENT_ID
      })
    });

    const result = await response.json();
    
    if (result.choices?.[0]?.message?.tool_calls?.length > 0) {
      console.log('✅ Tool-triggering chat works');
      const toolCall = result.choices[0].message.tool_calls[0];
      console.log(`   - Tool: ${toolCall.function.name}`);
      console.log(`   - Arguments: ${toolCall.function.arguments}`);
    } else {
      console.log('❌ Tool-triggering chat failed - no tool calls detected');
    }
  } catch (error) {
    console.log('❌ Tool-triggering chat test failed:', error.message);
  }

  console.log('');
}

/**
 * Test API health endpoints
 */
async function testHealthEndpoints() {
  console.log('🏥 Testing API health endpoints...\n');

  // Test Cedar API health
  try {
    const response = await fetch(CEDAR_API_URL.replace('/cedar', '/health'));
    if (response.ok) {
      console.log('✅ Cedar API health check passed');
    } else {
      console.log('⚠️  Cedar API health endpoint not found (optional)');
    }
  } catch (error) {
    console.log('⚠️  Cedar API health check skipped');
  }

  // Test Chat API health
  try {
    const response = await fetch(CHAT_API_URL, { method: 'GET' });
    const result = await response.json();
    if (result.status === 'healthy') {
      console.log('✅ Chat API health check passed');
      console.log(`   - Service: ${result.service}`);
      console.log(`   - Version: ${result.version}`);
    } else {
      console.log('❌ Chat API health check failed');
    }
  } catch (error) {
    console.log('❌ Chat API health check failed:', error.message);
  }

  console.log('');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Cedar-OS Implementation Test Suite');
  console.log('=====================================\n');
  
  console.log('Prerequisites:');
  console.log(`- Server running on http://localhost:3000`);
  console.log(`- Database with patient ID: ${TEST_PATIENT_ID}`);
  console.log(`- Demo user authenticated\n`);

  try {
    await testHealthEndpoints();
    await testCedarAPI();
    await testChatAPI();
    
    console.log('🎉 Test suite completed!');
    console.log('\nNext steps:');
    console.log('1. Add CedarProvider to your app layout');
    console.log('2. Add CedarPanel to patient pages');
    console.log('3. Test confirmation dialogs in the UI');
    console.log('4. Configure OpenAI API key for full LLM integration');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}