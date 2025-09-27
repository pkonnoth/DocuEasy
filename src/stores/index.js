// Export all stores from a single index
export { default as usePatientStore } from './patientStore'
export { default as useUIStore } from './uiStore'

// You can also create a combined store selector hook if needed
export const useAppStore = () => ({
  patient: usePatientStore(),
  ui: useUIStore(),
})