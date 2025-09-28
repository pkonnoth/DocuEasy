#!/usr/bin/env node

/**
 * RAG Test Script
 * Tests the RAG functionality independently of Mastra server
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.replace(/"/g, ''), // Remove quotes if present
});

// Test patient ID (Sarah Johnson from demo data)
const TEST_PATIENT_ID = '123e4567-e89b-12d3-a456-426614174001';

async function testRAGSearch(query) {
  console.log(`🔍 Testing RAG search: "${query}"`);
  
  try {
    // Generate embedding for the query
    console.log('  📊 Generating query embedding...');
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    
    const queryEmbedding = response.data[0].embedding;
    console.log('  ✅ Query embedding generated');
    
    // Search for relevant patient content
    console.log('  🔎 Searching patient embeddings...');
    const { data, error } = await supabase
      .rpc('search_patient_embeddings', {
        query_embedding: JSON.stringify(queryEmbedding),
        target_patient_id: TEST_PATIENT_ID,
        match_threshold: 0.7,
        match_count: 3
      });
      
    if (error) {
      console.error('  ❌ Search error:', error);
      return;
    }
    
    console.log(`  📋 Found ${data.length} relevant results:`);
    data.forEach((result, i) => {
      console.log(`\n  ${i + 1}. ${result.content_type} (similarity: ${result.similarity.toFixed(3)})`);
      console.log(`     Text: ${result.content_text.substring(0, 100)}...`);
    });
    
    return data;
    
  } catch (error) {
    console.error('  ❌ RAG search failed:', error);
    return [];
  }
}

async function testPatientContext(query) {
  console.log(`\n🏥 Testing patient context retrieval for: "${query}"`);
  
  try {
    // Get basic patient info
    console.log('  👤 Fetching patient info...');
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', TEST_PATIENT_ID)
      .single();
      
    if (patientError) {
      console.error('  ❌ Error fetching patient:', patientError);
      return null;
    }
    
    console.log(`  ✅ Patient: ${patient.first_name} ${patient.last_name}, Age: ${calculateAge(patient.date_of_birth)}`);
    
    // Get relevant context using RAG
    const contextItems = await testRAGSearch(query);
    
    // Build context string
    let context = `Patient Information:\n`;
    context += `Name: ${patient.first_name} ${patient.last_name}\n`;
    context += `Age: ${calculateAge(patient.date_of_birth)}\n`;
    context += `Gender: ${patient.gender}\n`;
    
    if (patient.allergies && patient.allergies.length > 0) {
      context += `Allergies: ${patient.allergies.join(', ')}\n`;
    }
    
    if (contextItems && contextItems.length > 0) {
      context += `\nRelevant Medical Information:\n`;
      contextItems.forEach((item, index) => {
        context += `${index + 1}. ${item.content_type}: ${item.content_text}\n`;
      });
    }
    
    console.log('\n📄 Generated Context:');
    console.log('=' .repeat(50));
    console.log(context);
    console.log('=' .repeat(50));
    
    return { patient, contextItems, context };
    
  } catch (error) {
    console.error('  ❌ Context retrieval failed:', error);
    return null;
  }
}

async function testAIResponse(query, context) {
  console.log(`\n🤖 Testing AI response generation...`);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful medical AI assistant integrated with an Electronic Medical Record (EMR) system. You have access to patient data and can provide contextual responses about medical history, medications, lab results, and treatment plans.

IMPORTANT: 
- Always base your responses on the provided patient context
- Be accurate and professional in medical terminology
- If you're unsure about something, say so
- Suggest appropriate follow-up actions when relevant
- Maintain patient confidentiality and HIPAA compliance

Patient Context:
${context}`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    const aiResponse = response.choices[0].message.content;
    console.log('🎯 AI Response:');
    console.log('-' .repeat(50));
    console.log(aiResponse);
    console.log('-' .repeat(50));
    
    return aiResponse;
    
  } catch (error) {
    console.error('  ❌ AI response generation failed:', error);
    return null;
  }
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function runTests() {
  console.log('🚀 Starting RAG System Tests');
  console.log('=' .repeat(70));
  
  const testQueries = [
    "Tell me about this patient's diabetes management",
    "What medications is this patient taking?",
    "What are the recent lab results?",
    "Does this patient have any allergies?"
  ];
  
  for (const query of testQueries) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 TEST: ${query}`);
    console.log('=' .repeat(70));
    
    const contextData = await testPatientContext(query);
    
    if (contextData) {
      await testAIResponse(query, contextData.context);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 RAG System Tests Complete!');
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}