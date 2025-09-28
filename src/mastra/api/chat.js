import { mastra } from '../index.js';

/**
 * Chat API endpoint for Mastra agent integration
 * This creates the /api/chat endpoint that Cedar-OS expects
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, patientContext } = body;

    // Get the EMR assistant agent
    const agent = mastra.getAgent('emrAssistant');
    
    if (!agent) {
      return new Response(JSON.stringify({
        error: 'EMR Assistant agent not found'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add patient context to the conversation if available
    let contextualMessages = [...messages];
    if (patientContext) {
      const contextMessage = {
        role: 'system',
        content: `Current patient context: 
        - Patient: ${patientContext.patientName}
        - Age: ${patientContext.patientAge}
        - Active Medications: ${patientContext.currentMedications}
        - Recent Encounters: ${patientContext.recentEncounters}
        
        Use this context to provide relevant medical assistance.`
      };
      contextualMessages = [contextMessage, ...messages];
    }

    // Generate response using Mastra agent
    const response = await agent.generate({
      messages: contextualMessages
    });

    // Return in OpenAI-compatible format for Cedar-OS
    return new Response(JSON.stringify({
      id: `chat-${Date.now()}`,
      object: 'chat.completion',
      model: 'mastra-emr-assistant',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.text
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: contextualMessages.reduce((sum, msg) => sum + msg.content.length / 4, 0),
        completion_tokens: response.text.length / 4,
        total_tokens: (contextualMessages.reduce((sum, msg) => sum + msg.content.length / 4, 0)) + (response.text.length / 4)
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

// Health check endpoint
export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'Mastra EMR Chat API',
    agent: 'emrAssistant',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}