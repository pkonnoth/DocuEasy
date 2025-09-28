#!/usr/bin/env node

/**
 * EMR Embedding Pipeline
 * Generates vector embeddings for patient data and stores them in Supabase
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

/**
 * Generate embedding for text content
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Fetch patient content for embedding using the view we created
 */
async function fetchPatientContent() {
  console.log('📊 Fetching patient content for embedding...');
  
  const { data, error } = await supabase
    .from('patient_content_for_embedding')
    .select('*');
    
  if (error) {
    console.error('Error fetching patient content:', error);
    throw error;
  }
  
  console.log(`✅ Found ${data.length} patient content items`);
  return data;
}

/**
 * Store embedding in database
 */
async function storeEmbedding(contentItem, embedding) {
  const embeddingData = {
    patient_id: contentItem.patient_id,
    content_type: contentItem.content_type,
    content_id: contentItem.content_id,
    content_text: contentItem.content_text,
    content_metadata: contentItem.content_metadata,
    embedding: JSON.stringify(embedding), // Supabase expects embedding as JSON string
  };
  
  const { error } = await supabase
    .from('patient_embeddings')
    .insert(embeddingData);
    
  if (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

/**
 * Clear existing embeddings
 */
async function clearExistingEmbeddings() {
  console.log('🗑️ Clearing existing embeddings...');
  
  const { error } = await supabase
    .from('patient_embeddings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible UUID)
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is fine
    console.error('Error clearing embeddings:', error);
    throw error;
  }
  
  console.log('✅ Existing embeddings cleared');
}

/**
 * Build embeddings for all patient content
 */
async function buildEmbeddings(options = {}) {
  const { clearFirst = true, batchSize = 10 } = options;
  
  console.log('🚀 Starting embedding pipeline...');
  console.log(`📋 Options: clearFirst=${clearFirst}, batchSize=${batchSize}`);
  
  try {
    // Clear existing embeddings if requested
    if (clearFirst) {
      await clearExistingEmbeddings();
    }
    
    // Fetch all patient content
    const contentItems = await fetchPatientContent();
    
    if (contentItems.length === 0) {
      console.log('⚠️ No patient content found. Make sure you have run the demo data script.');
      return;
    }
    
    let processed = 0;
    let errors = 0;
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < contentItems.length; i += batchSize) {
      const batch = contentItems.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contentItems.length/batchSize)}`);
      
      for (const item of batch) {
        try {
          console.log(`  🔄 Processing: ${item.content_type} for patient ${item.patient_id.substring(0, 8)}...`);
          
          // Generate embedding
          const embedding = await generateEmbedding(item.content_text);
          
          // Store embedding
          await storeEmbedding(item, embedding);
          
          processed++;
          console.log(`  ✅ Success: ${item.content_type}`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          errors++;
          console.error(`  ❌ Error processing ${item.content_type}:`, error.message);
        }
      }
      
      // Longer delay between batches
      if (i + batchSize < contentItems.length) {
        console.log('  ⏳ Waiting between batches...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Final summary
    console.log('\n🎉 Embedding pipeline completed!');
    console.log(`✅ Successfully processed: ${processed}/${contentItems.length}`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors}`);
    }
    
    // Verify results
    const { count } = await supabase
      .from('patient_embeddings')
      .select('*', { count: 'exact', head: true });
      
    console.log(`📊 Total embeddings in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    process.exit(1);
  }
}

/**
 * Search embeddings (for testing)
 */
async function testSearch(query) {
  console.log(`\n🔍 Testing search for: "${query}"`);
  
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search using our stored procedure
    const { data, error } = await supabase
      .rpc('search_patient_embeddings', {
        query_embedding: JSON.stringify(queryEmbedding),
        target_patient_id: '123e4567-e89b-12d3-a456-426614174001', // Sarah Johnson
        match_threshold: 0.5,
        match_count: 3
      });
      
    if (error) {
      console.error('Search error:', error);
      return;
    }
    
    console.log(`📋 Found ${data.length} relevant results:`);
    data.forEach((result, i) => {
      console.log(`\n${i + 1}. ${result.content_type} (similarity: ${result.similarity.toFixed(3)})`);
      console.log(`   Text: ${result.content_text.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('Test search failed:', error);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'build';
  
  switch (command) {
    case 'build':
      await buildEmbeddings({
        clearFirst: !args.includes('--no-clear'),
        batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 10
      });
      break;
      
    case 'test':
      const query = args[1] || 'diabetes medication';
      await testSearch(query);
      break;
      
    case 'clear':
      await clearExistingEmbeddings();
      break;
      
    default:
      console.log('📚 Usage:');
      console.log('  node scripts/build-embeddings.js build [--no-clear] [--batch-size=10]');
      console.log('  node scripts/build-embeddings.js test "search query"');
      console.log('  node scripts/build-embeddings.js clear');
      break;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}