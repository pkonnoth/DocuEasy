import { supabase, handleSupabaseError } from '../supabase'

// Get all patients
export async function getPatients() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('last_name', { ascending: true })

    if (error) {
      handleSupabaseError(error, 'fetching patients')
    }

    return data
  } catch (error) {
    console.error('Error fetching patients:', error)
    return []
  }
}

// Get patient by ID
export async function getPatientById(id) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      handleSupabaseError(error, 'fetching patient')
    }

    return data
  } catch (error) {
    console.error('Error fetching patient:', error)
    return null
  }
}

// Get patient with related data (encounters, medications, labs)
export async function getPatientWithData(id) {
  try {
    // Get patient
    const patient = await getPatientById(id)
    if (!patient) return null

    // Get encounters
    const { data: encounters, error: encountersError } = await supabase
      .from('encounters')
      .select('*')
      .eq('patient_id', id)
      .order('date', { ascending: false })

    if (encountersError) {
      handleSupabaseError(encountersError, 'fetching encounters')
    }

    // Get medications
    const { data: medications, error: medicationsError } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', id)
      .eq('is_active', true)
      .order('prescribed_date', { ascending: false })

    if (medicationsError) {
      handleSupabaseError(medicationsError, 'fetching medications')
    }

    // Get lab results
    const { data: labResults, error: labError } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', id)
      .order('result_date', { ascending: false })

    if (labError) {
      handleSupabaseError(labError, 'fetching lab results')
    }

    // Get agent actions
    const { data: agentActions, error: agentError } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })

    if (agentError) {
      handleSupabaseError(agentError, 'fetching agent actions')
    }

    return {
      ...patient,
      encounters: encounters || [],
      medications: medications || [],
      labResults: labResults || [],
      agentActions: agentActions || []
    }
  } catch (error) {
    console.error('Error fetching patient with data:', error)
    return null
  }
}

// Create new patient
export async function createPatient(patientData) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'creating patient')
    }

    return data
  } catch (error) {
    console.error('Error creating patient:', error)
    throw error
  }
}

// Update patient
export async function updatePatient(id, updates) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'updating patient')
    }

    return data
  } catch (error) {
    console.error('Error updating patient:', error)
    throw error
  }
}