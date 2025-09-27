import { supabase, handleSupabaseError } from '../supabase'

// Get literature results
export async function getLiteratureResults(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('literature_results')
      .select('*')
      .order('relevance_score', { ascending: false })
      .limit(limit)

    if (error) {
      handleSupabaseError(error, 'fetching literature results')
    }

    return data || []
  } catch (error) {
    console.error('Error fetching literature results:', error)
    return []
  }
}

// Get literature results for a specific patient
export async function getLiteratureForPatient(patientId, limit = 5) {
  try {
    const { data, error } = await supabase
      .from('literature_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('relevance_score', { ascending: false })
      .limit(limit)

    if (error) {
      handleSupabaseError(error, 'fetching patient literature')
    }

    return data || []
  } catch (error) {
    console.error('Error fetching patient literature:', error)
    return []
  }
}

// Create literature result
export async function createLiteratureResult(literatureData) {
  try {
    const { data, error } = await supabase
      .from('literature_results')
      .insert([literatureData])
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'creating literature result')
    }

    return data
  } catch (error) {
    console.error('Error creating literature result:', error)
    throw error
  }
}