export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insurance: {
    provider: string;
    memberId: string;
    groupNumber: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  medicalRecordNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Encounter {
  id: string;
  patientId: string;
  date: Date;
  type: 'Office Visit' | 'Emergency' | 'Telehealth' | 'Follow-up' | 'Annual Physical';
  provider: string;
  chiefComplaint: string;
  assessment: string;
  plan: string;
  notes: string;
  vitals?: {
    temperature?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  diagnoses: string[];
  procedures: string[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: string;
  prescribedDate: Date;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  instructions: string;
  refills: number;
  quantity: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  orderedBy: string;
  orderedDate: Date;
  resultDate: Date;
  notes?: string;
  category: string;
}

export interface AgentAction {
  id: string;
  patientId: string;
  type: 'summary' | 'literature' | 'draft-note' | 'schedule-followup';
  description: string;
  result: any;
  status: 'pending' | 'completed' | 'confirmed' | 'rejected';
  timestamp: Date;
  userId: string;
  confirmationRequired: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: Date;
  duration: number; // in minutes
  type: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';
  reason: string;
  notes?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  entityType: 'patient' | 'encounter' | 'medication' | 'lab' | 'appointment';
  entityId: string;
  changes: any;
  agentActionId?: string;
}

export interface LiteratureResult {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publishedDate: Date;
  abstract: string;
  doi?: string;
  relevanceScore: number;
  keywords: string[];
}