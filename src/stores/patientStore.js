import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getPatients, getPatientWithData } from '@/lib/api/patients'

const usePatientStore = create()(
  devtools(
    immer((set, get) => ({
      // State
      patients: [],
      currentPatient: null,
      encounters: [],
      medications: [],
      labResults: [],
      agentActions: [],
      loading: {
        patients: false,
        currentPatient: false,
      },
      error: null,

      // Actions - Patients List
      fetchPatients: async () => {
        set((state) => {
          state.loading.patients = true
          state.error = null
        })
        
        try {
          const patients = await getPatients()
          set((state) => {
            state.patients = patients
            state.loading.patients = false
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
            state.loading.patients = false
          })
        }
      },

      // Actions - Current Patient
      fetchPatientWithData: async (patientId) => {
        set((state) => {
          state.loading.currentPatient = true
          state.error = null
        })
        
        try {
          const data = await getPatientWithData(patientId)
          if (data) {
            set((state) => {
              state.currentPatient = data
              state.encounters = data.encounters || []
              state.medications = data.medications || []
              state.labResults = data.labResults || []
              state.agentActions = data.agentActions || []
              state.loading.currentPatient = false
            })
          }
        } catch (error) {
          set((state) => {
            state.error = error.message
            state.loading.currentPatient = false
          })
        }
      },

      // Actions - Clear Current Patient
      clearCurrentPatient: () => {
        set((state) => {
          state.currentPatient = null
          state.encounters = []
          state.medications = []
          state.labResults = []
          state.agentActions = []
        })
      },

      // Actions - Update Patient Data (optimistic updates)
      updatePatientData: (patientData) => {
        set((state) => {
          if (state.currentPatient && state.currentPatient.id === patientData.id) {
            state.currentPatient = { ...state.currentPatient, ...patientData }
          }
          // Update in patients list too
          const index = state.patients.findIndex(p => p.id === patientData.id)
          if (index >= 0) {
            state.patients[index] = { ...state.patients[index], ...patientData }
          }
        })
      },

      // Actions - Add New Encounter
      addEncounter: (encounter) => {
        set((state) => {
          state.encounters.unshift(encounter)
        })
      },

      // Actions - Update Encounter
      updateEncounter: (encounterId, updates) => {
        set((state) => {
          const index = state.encounters.findIndex(e => e.id === encounterId)
          if (index >= 0) {
            state.encounters[index] = { ...state.encounters[index], ...updates }
          }
        })
      },

      // Actions - Add Agent Action
      addAgentAction: (agentAction) => {
        set((state) => {
          state.agentActions.unshift(agentAction)
        })
      },

      // Actions - Update Agent Action
      updateAgentAction: (actionId, updates) => {
        set((state) => {
          const index = state.agentActions.findIndex(a => a.id === actionId)
          if (index >= 0) {
            state.agentActions[index] = { ...state.agentActions[index], ...updates }
          }
        })
      },
    })),
    {
      name: 'patient-store',
    }
  )
)

export default usePatientStore