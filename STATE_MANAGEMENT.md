# 🗄️ EMR State Management Architecture

## 📋 Overview

This EMR system uses **Zustand** with **Immer** for state management, providing a clean, simple, and performant solution.

## 🏗️ Store Architecture

### **1. Patient Store** (`patientStore.js`)
Manages all patient-related data and operations.

**State:**
- `patients[]` - List of all patients
- `currentPatient` - Currently selected patient
- `encounters[]` - Patient encounters
- `medications[]` - Patient medications  
- `labResults[]` - Patient lab results
- `agentActions[]` - AI agent interactions
- `loading` - Loading states for async operations
- `error` - Error messages

**Actions:**
- `fetchPatients()` - Load all patients from Supabase
- `fetchPatientWithData(id)` - Load patient with related data
- `updatePatientData(data)` - Optimistic updates
- `addEncounter()` - Add new encounter
- `addAgentAction()` - Add AI agent interaction

### **2. UI Store** (`uiStore.js`)
Manages UI state and user interactions.

**State:**
- `activeAgentAction` - Currently running AI action
- `agentLoading` - AI processing state
- `showSummary` - Summary dialog visibility
- `showLiterature` - Literature panel visibility
- `modals{}` - Modal visibility states
- `searchTerm` - Global search
- `filterBy` - Patient filters
- `notifications[]` - Toast messages

**Actions:**
- `setActiveAgentAction()` - Start AI action
- `showAgentSummary()` - Display AI results
- `toggleLiteraturePanel()` - Show/hide literature
- `openModal()` / `closeModal()` - Modal management
- `setSearchTerm()` - Update search
- `addNotification()` - Show toast message

## 🔄 Usage Patterns

### **1. Loading Data**
```javascript
// In component
const { patients, loading, fetchPatients } = usePatientStore(
  (state) => ({
    patients: state.patients,
    loading: state.loading.patients,
    fetchPatients: state.fetchPatients,
  })
);

// Fetch on mount
useEffect(() => {
  fetchPatients();
}, [fetchPatients]);
```

### **2. Optimistic Updates**
```javascript
// Update UI immediately, sync with server later
const { updatePatientData } = usePatientStore();

const handleSave = async (patientData) => {
  // Update UI immediately
  updatePatientData(patientData);
  
  // Sync with server
  try {
    await updatePatient(patientData.id, patientData);
  } catch (error) {
    // Revert on error
    fetchPatientWithData(patientData.id);
  }
};
```

### **3. Agent Interactions**
```javascript
const { setActiveAgentAction, showAgentSummary } = useUIStore();
const { addAgentAction } = usePatientStore();

const handleAgentSummary = async () => {
  setActiveAgentAction('summary');
  
  try {
    const result = await generateSummary(patientId);
    showAgentSummary(result);
    addAgentAction({
      type: 'summary',
      result,
      status: 'completed'
    });
  } catch (error) {
    // Handle error
  }
};
```

### **4. Selective State Subscription**
```javascript
// Only re-render when specific state changes
const currentPatient = usePatientStore((state) => state.currentPatient);
const agentLoading = useUIStore((state) => state.agentLoading);
```

## 🎯 Benefits

### **1. Performance**
- **Selective Subscriptions** - Components only re-render when needed
- **Immer Integration** - Immutable updates with mutable syntax
- **Minimal Boilerplate** - Less code than Redux/Context

### **2. Developer Experience**
- **TypeScript Support** - Full type safety
- **DevTools Integration** - Time-travel debugging
- **Simple API** - Easy to understand and use

### **3. Scalability**
- **Modular Stores** - Separate concerns (data vs UI)
- **Action Patterns** - Consistent state updates
- **Error Handling** - Centralized error management

## 📊 Data Flow

```
User Action → Zustand Action → Supabase API → Update Store → Re-render Components
```

### **Example: Loading Patient**
1. User clicks patient card
2. Component calls `fetchPatientWithData(id)`
3. Store sets loading state
4. API fetches data from Supabase
5. Store updates with patient data
6. Components re-render with new data

### **Example: Agent Summary**
1. User clicks "Summarize Visits"
2. UI store sets `agentLoading: true`
3. AI processes patient data
4. Result stored in UI store
5. Summary card displays with data

## 🔮 Future Enhancements

### **1. Persistence**
- Add `persist` middleware for offline support
- Cache frequently accessed data

### **2. Real-time Updates**
- Integrate Supabase real-time subscriptions
- Auto-sync data changes across tabs/users

### **3. Advanced Features**
- Undo/Redo functionality
- Optimistic mutations with rollback
- Background data prefetching

## 🛠️ Store Files

```
src/stores/
├── index.js          # Export all stores
├── patientStore.js   # Patient data management
└── uiStore.js        # UI state management
```

This architecture provides a solid foundation for your EMR system that scales with complexity while maintaining simplicity! 🚀