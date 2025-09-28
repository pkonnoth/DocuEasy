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

// Build context string from patient data and relevant embeddings
function buildContextString(patientContext) {
  const { patient, contextItems } = patientContext;
  
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
  
  return context;
}

// Calculate age from date of birth
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
 * POST /api/chat/stream
 * Streaming chat endpoint for Cedar-OS
 */
export async function POST(request) {
  console.log('🌊 Streaming chat API POST request received');
  console.log('🌐 Request URL:', request.url);
  
  // Handle authentication if provided
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    console.log('🔐 Authorization header present');
  }
  
  try {
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    // Handle Cedar-OS format
    const { prompt, messages, patientContext, patient_id, additionalContext } = body;
    
    let userMessage;
    if (prompt) {
      // Cedar-OS sends 'prompt' field
      userMessage = prompt;
    } else if (messages && messages.length > 0) {
      // Standard format with messages array
      userMessage = messages[messages.length - 1].content;
    } else {
      return new Response(JSON.stringify({
        error: {
          message: 'No prompt or messages provided',
          type: 'invalid_request_error'
        }
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract patient ID from multiple possible sources
    let targetPatientId = patient_id || patientContext?.patientId;
    
    // Try to extract from URL query params if not in body
    if (!targetPatientId && request.url) {
      const url = new URL(request.url);
      targetPatientId = url.searchParams.get('patient_id');
    }
    
    // Try to extract from referrer URL (if the request came from a patient page)
    if (!targetPatientId) {
      const referrer = request.headers.get('referer');
      if (referrer) {
        const referrerUrl = new URL(referrer);
        const pathMatch = referrerUrl.pathname.match(/\/patient\/([^/]+)/);
        if (pathMatch) {
          targetPatientId = pathMatch[1];
          console.log('🔍 Extracted patient ID from referrer:', targetPatientId);
        }
      }
    }
    
    // Try to extract from additionalContext
    if (!targetPatientId && additionalContext) {
      targetPatientId = additionalContext.patient_id || additionalContext.patientId;
    }
    
    // For demo purposes, if we still don't have a patient ID, use Sarah Johnson's ID
    // This happens when Cedar-OS doesn't send patient context
    if (!targetPatientId) {
      console.log('🚨 No patient ID found, using demo patient Sarah Johnson');
      targetPatientId = '123e4567-e89b-12d3-a456-426614174001';
    }
    
    console.log('🎯 Target patient ID:', targetPatientId);
    
    let responseContent = '';
    
    // Generate AI response with RAG
    if (targetPatientId) {
      try {
        const patientContextData = await getPatientContext(targetPatientId, userMessage);
        
        if (patientContextData) {
          // Build context string from relevant patient data
          const contextString = buildContextString(patientContextData);
          
          // Generate AI response using OpenAI with patient context
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
            temperature: 0.7,
            stream: false // For now, return non-streaming response
          });
          
          responseContent = response.choices[0].message.content;
        }
      } catch (error) {
        console.error('RAG error:', error);
        responseContent = `I apologize, but I'm having trouble accessing patient data right now. Please try again or contact your system administrator if the issue persists.`;
      }
    } else {
      responseContent = `I'm your DocuEase AI assistant with RAG-powered patient context. I can help you with:

• **Patient Questions** - Ask about medical history, medications, lab results, or conditions
• **Clinical Insights** - Get AI analysis of patient data and trends
• **Documentation** - Draft SOAP notes and clinical documentation  
• **Scheduling** - Create follow-up appointments and manage calendar

Select a patient to get started with context-aware responses.

What would you like to know about this patient?`;
    }

    // Create Cedar-OS compatible SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('📤 Streaming response:', responseContent);
          
          // Escape literal newlines for SSE compliance
          const escaped = responseContent.replace(/\n/g, '\\n');
          
          // Send the response as SSE data chunks
          controller.enqueue(encoder.encode(`data: ${escaped}\n\n`));
          
          // Signal completion
          controller.enqueue(encoder.encode('event: done\n'));
          controller.enqueue(encoder.encode('data: \n\n'));
          
        } catch (err) {
          console.error('Error during SSE stream:', err);
          const message = err instanceof Error ? err.message : 'Internal error';
          controller.enqueue(encoder.encode('data: '));
          controller.enqueue(encoder.encode(`${JSON.stringify({ type: 'error', message })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Streaming chat API error:', error);
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
 * GET /api/chat/stream
 * Health check endpoint
 */
export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'DocuEase Streaming Chat API',
    agent: 'emrAssistant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}