import { NextResponse } from 'next/server';
import { z } from 'zod';
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

// RAG search function
async function searchPatientContext(query, patientId) {
  try {
    // Generate embedding for the query
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    
    const queryEmbedding = response.data[0].embedding;
    
    // Search for relevant patient content
    const { data, error } = await supabase
      .rpc('search_patient_embeddings', {
        query_embedding: JSON.stringify(queryEmbedding),
        target_patient_id: patientId,
        match_threshold: 0.7,
        match_count: 5
      });
      
    if (error) {
      console.error('RAG search error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('RAG search failed:', error);
    return [];
  }
}

// Get patient context for RAG
async function getPatientContext(patientId, query) {
  try {
    // Get basic patient info
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
      
    if (patientError) {
      console.error('Error fetching patient:', patientError);
      return null;
    }
    
    let contextItems = [];
    
    // If we have a query, search for relevant content
    if (query) {
      contextItems = await searchPatientContext(query, patientId);
    } else {
      // Otherwise get recent patient content
      const { data, error } = await supabase
        .from('patient_embeddings')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (!error && data) {
        contextItems = data;
      }
    }
    
    return {
      patient,
      contextItems
    };
  } catch (error) {
    console.error('Error getting patient context:', error);
    return null;
  }
}

// Chat request schema
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  patient_id: z.string().uuid().optional(),
  context: z.object({}).passthrough().optional(),
  stream: z.boolean().default(false)
});

/**
 * POST /api/chat
 * Mastra-compatible chat endpoint for Cedar-OS integration
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, patientContext, patient_id } = body;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({
        error: {
          message: 'No messages provided',
          type: 'invalid_request_error'
        }
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lastMessage = messages[messages.length - 1];
    
    // Use patient_id from either location
    const targetPatientId = patient_id || patientContext?.patientId;
    
    // Generate AI response with RAG
    let response = await generateResponse(lastMessage.content, targetPatientId, patientContext);
    
    // Check if this requires tool usage
    const toolUsage = detectToolUsage(lastMessage.content);
    
    if (toolUsage) {
      response = {
        ...response,
        tool_calls: toolUsage.tools,
        requires_confirmation: toolUsage.requiresConfirmation
      };
    }

    // Return in Mastra-compatible format (which is OpenAI-compatible)
    return new Response(JSON.stringify({
      id: `chat-${Date.now()}`,
      object: 'chat.completion',
      model: 'mastra-emr-assistant',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.content
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: estimateTokens(messages),
        completion_tokens: estimateTokens([{ content: response.content }]),
        total_tokens: estimateTokens(messages) + estimateTokens([{ content: response.content }])
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({
      error: {
        message: error.message,
        type: 'chat_completion_error'
      }
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate AI response based on user input with RAG
 */
async function generateResponse(userMessage, patientId, context) {
  const message = userMessage.toLowerCase();
  
  // If we have a patient ID, use RAG to get contextual information
  if (patientId) {
    try {
      const patientContext = await getPatientContext(patientId, userMessage);
      
      if (patientContext) {
        // Build context string from relevant patient data
        const contextString = buildContextString(patientContext);
        
        // Generate AI response using OpenAI with patient context
        const aiResponse = await generateAIResponse(userMessage, contextString, patientContext.patient);
        
        return {
          content: aiResponse,
          patient_context: patientContext
        };
      }
    } catch (error) {
      console.error('RAG error:', error);
      // Fall back to pattern matching if RAG fails
    }
  }
  
  // Pattern matching for different types of requests (fallback)
  if (message.includes('summary') || message.includes('timeline')) {
    return {
      content: `I can help you get a patient timeline summary. This will retrieve the patient's recent encounters, lab results, medications, and appointments. Would you like me to proceed?`,
      suggested_action: 'get_patient_timeline'
    };
  }
  
  if (message.includes('note') || message.includes('soap') || message.includes('documentation')) {
    return {
      content: `I can help you draft a clinical note. I'll create a SOAP format note based on the patient's recent data. This will be saved as a draft for your review. Should I proceed?`,
      suggested_action: 'draft_progress_note'
    };
  }
  
  if (message.includes('appointment') || message.includes('schedule') || message.includes('follow')) {
    return {
      content: `I can help you schedule an appointment for this patient. This will create a new appointment entry that requires your confirmation. Would you like to proceed?`,
      suggested_action: 'create_appointment'
    };
  }
  
  // General response
  return {
    content: `I'm your DocuEase AI assistant with RAG-powered patient context. I can help you with:

• **Patient Questions** - Ask about medical history, medications, lab results, or conditions
• **Clinical Insights** - Get AI analysis of patient data and trends
• **Documentation** - Draft SOAP notes and clinical documentation  
• **Scheduling** - Create follow-up appointments and manage calendar

${patientId ? `Currently viewing patient: ${patientId.substring(0, 8)}...` : 'Select a patient to get started with context-aware responses.'}

What would you like to know about this patient?`
  };
}

/**
 * Build context string from patient data and relevant embeddings
 */
function buildContextString(patientContext) {
  const { patient, contextItems } = patientContext;
  
  let context = `Patient Information:
`;
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
  
  return context;
}

/**
 * Calculate age from date of birth
 */
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

/**
 * Generate AI response using OpenAI with patient context
 */
async function generateAIResponse(userMessage, contextString, patient) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful medical AI assistant integrated with DocuEase, a document management system. You have access to patient data and can provide contextual responses about medical history, medications, lab results, and treatment plans.

IMPORTANT: 
- Always base your responses on the provided patient context
- Be accurate and professional in medical terminology
- If you're unsure about something, say so
- Suggest appropriate follow-up actions when relevant
- Maintain patient confidentiality and HIPAA compliance

Patient Context:
${contextString}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `I apologize, but I'm having trouble processing your request right now. Based on the available patient data for ${patient.first_name} ${patient.last_name}, I can see their medical information, but I'm unable to generate a detailed response at this moment. Please try again or contact your system administrator if the issue persists.`;
  }
}

/**
 * Detect if user input requires tool usage
 */
function detectToolUsage(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Timeline/Summary requests
  if (message.includes('summary') || message.includes('timeline') || message.includes('history')) {
    return {
      requiresConfirmation: false,
      tools: [{
        id: 'call_timeline',
        type: 'function',
        function: {
          name: 'get_patient_timeline',
          arguments: JSON.stringify({
            timeframe: '90days',
            include_types: ['encounters', 'labs', 'medications', 'appointments']
          })
        }
      }]
    };
  }
  
  // Note drafting requests
  if (message.includes('note') || message.includes('soap') || message.includes('draft')) {
    return {
      requiresConfirmation: false,
      tools: [{
        id: 'call_draft_note',
        type: 'function',
        function: {
          name: 'draft_progress_note',
          arguments: JSON.stringify({
            template: 'soap',
            context: 'Generated from AI assistant'
          })
        }
      }]
    };
  }
  
  // Appointment scheduling requests
  if (message.includes('appointment') || message.includes('schedule')) {
    return {
      requiresConfirmation: true,
      tools: [{
        id: 'call_create_appointment',
        type: 'function',
        function: {
          name: 'create_appointment',
          arguments: JSON.stringify({
            appointment_type: 'follow-up',
            duration_minutes: 30,
            reason: 'Follow-up appointment scheduled by AI assistant'
          })
        }
      }]
    };
  }
  
  return null;
}

/**
 * Simple token estimation
 */
function estimateTokens(messages) {
  return messages.reduce((total, msg) => {
    return total + Math.ceil(msg.content.length / 4); // Rough estimate
  }, 0);
}

/**
 * GET /api/chat
 * Health check endpoint - Mastra format
 */
export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'Mastra EMR Chat API',
    agent: 'emrAssistant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
