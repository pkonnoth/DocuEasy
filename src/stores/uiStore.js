import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useUIStore = create()(
  devtools(
    immer((set, get) => ({
      // Agent Interaction State
      activeAgentAction: null,
      agentLoading: false,
      showSummary: false,
      showLiterature: false,
      summaryData: null,

      // Modal/Dialog State
      modals: {
        addPatient: false,
        editPatient: false,
        addEncounter: false,
        schedulingModal: false,
      },

      // Search & Filter State
      searchTerm: '',
      filterBy: 'all',

      // Toast/Notification State
      notifications: [],

      // Actions - Agent Interactions
      setActiveAgentAction: (actionType) => {
        set((state) => {
          state.activeAgentAction = actionType
          state.agentLoading = true
        })
      },

      clearActiveAgentAction: () => {
        set((state) => {
          state.activeAgentAction = null
          state.agentLoading = false
        })
      },

      setAgentLoading: (loading) => {
        set((state) => {
          state.agentLoading = loading
        })
      },

      showAgentSummary: (summaryData) => {
        set((state) => {
          state.showSummary = true
          state.summaryData = summaryData
          state.agentLoading = false
        })
      },

      hideAgentSummary: () => {
        set((state) => {
          state.showSummary = false
          state.summaryData = null
        })
      },

      toggleLiteraturePanel: () => {
        set((state) => {
          state.showLiterature = !state.showLiterature
        })
      },

      // Actions - Modal Management
      openModal: (modalName) => {
        set((state) => {
          state.modals[modalName] = true
        })
      },

      closeModal: (modalName) => {
        set((state) => {
          state.modals[modalName] = false
        })
      },

      closeAllModals: () => {
        set((state) => {
          Object.keys(state.modals).forEach(key => {
            state.modals[key] = false
          })
        })
      },

      // Actions - Search & Filter
      setSearchTerm: (term) => {
        set((state) => {
          state.searchTerm = term
        })
      },

      setFilterBy: (filter) => {
        set((state) => {
          state.filterBy = filter
        })
      },

      // Actions - Notifications
      addNotification: (notification) => {
        const id = Date.now().toString()
        set((state) => {
          state.notifications.push({
            id,
            ...notification,
            timestamp: new Date()
          })
        })

        // Auto-remove after 5 seconds
        setTimeout(() => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id)
          })
        }, 5000)
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id)
        })
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = []
        })
      },
    })),
    {
      name: 'ui-store',
    }
  )
)

export default useUIStore