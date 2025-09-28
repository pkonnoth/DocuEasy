import { Mastra } from '@mastra/core';
import { MastraJwtAuth } from '@mastra/auth';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client for RAG
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.replace(/"/g, ''), // Remove quotes if present
});

// RAG search function
export async function searchPatientContext(query: string, patientId: string) {
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
export async function getPatientContext(patientId: string, query?: string) {
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

// Mastra configuration with authentication
export const mastra = new Mastra({
  agents: {} as any, // Empty agents object to avoid registration issues
  server: {
    experimental_auth: new MastraJwtAuth({
      secret: process.env.MASTRA_JWT_SECRET || 'your-secret-key-for-dev' // Your secret key
    }),
  },
});

export default mastra;
