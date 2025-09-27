import { Patient, Encounter, Medication, LabResult, AgentAction, Appointment, LiteratureResult } from '@/types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'Female',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    address: {
      street: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      memberId: 'BC123456789',
      groupNumber: 'GRP001'
    },
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '(555) 987-6543'
    },
    allergies: ['Penicillin', 'Shellfish'],
    medicalRecordNumber: 'MRN001234',
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: new Date('1978-11-22'),
    gender: 'Male',
    phone: '(555) 234-5678',
    email: 'michael.chen@email.com',
    address: {
      street: '456 Oak Avenue',
      city: 'Cambridge',
      state: 'MA',
      zipCode: '02138'
    },
    insurance: {
      provider: 'Aetna',
      memberId: 'AET987654321',
      groupNumber: 'GRP002'
    },
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Wife',
      phone: '(555) 876-5432'
    },
    allergies: ['Latex'],
    medicalRecordNumber: 'MRN002345',
    createdAt: new Date('2019-06-10'),
    updatedAt: new Date('2024-12-18')
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    dateOfBirth: new Date('1992-07-08'),
    gender: 'Female',
    phone: '(555) 345-6789',
    email: 'emily.rodriguez@email.com',
    address: {
      street: '789 Pine Street',
      city: 'Somerville',
      state: 'MA',
      zipCode: '02143'
    },
    insurance: {
      provider: 'Harvard Pilgrim',
      memberId: 'HP456789123',
      groupNumber: 'GRP003'
    },
    emergencyContact: {
      name: 'Maria Rodriguez',
      relationship: 'Mother',
      phone: '(555) 765-4321'
    },
    allergies: [],
    medicalRecordNumber: 'MRN003456',
    createdAt: new Date('2021-03-20'),
    updatedAt: new Date('2024-12-15')
  }
];

export const mockEncounters: Encounter[] = [
  {
    id: 'enc1',
    patientId: '1',
    date: new Date('2024-12-15'),
    type: 'Office Visit',
    provider: 'Dr. Smith',
    chiefComplaint: 'Annual physical examination',
    assessment: 'Healthy adult female, no acute concerns',
    plan: 'Continue current medications, return in 1 year for annual physical',
    notes: 'Patient reports feeling well. No new symptoms. Blood pressure normal.',
    vitals: {
      temperature: 98.6,
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      weight: 140,
      height: 65,
      bmi: 23.3
    },
    diagnoses: ['Z00.00 - Encounter for general adult medical examination'],
    procedures: ['Annual Physical'],
    status: 'Completed'
  },
  {
    id: 'enc2',
    patientId: '1',
    date: new Date('2024-11-20'),
    type: 'Follow-up',
    provider: 'Dr. Smith',
    chiefComplaint: 'Follow-up for hypertension',
    assessment: 'Blood pressure well controlled on current medication',
    plan: 'Continue lisinopril 10mg daily, recheck in 3 months',
    notes: 'Patient compliant with medications. No side effects reported.',
    vitals: {
      bloodPressure: { systolic: 125, diastolic: 82 }
    },
    diagnoses: ['I10 - Essential hypertension'],
    procedures: [],
    status: 'Completed'
  },
  {
    id: 'enc3',
    patientId: '2',
    date: new Date('2024-12-10'),
    type: 'Office Visit',
    provider: 'Dr. Wilson',
    chiefComplaint: 'Chest pain',
    assessment: 'Atypical chest pain, likely musculoskeletal',
    plan: 'NSAIDs for pain, return if symptoms worsen',
    notes: 'Patient describes sharp, stabbing chest pain that started after lifting heavy boxes.',
    vitals: {
      temperature: 98.4,
      bloodPressure: { systolic: 140, diastolic: 90 },
      heartRate: 80
    },
    diagnoses: ['R06.02 - Shortness of breath'],
    procedures: ['EKG'],
    status: 'Completed'
  }
];

export const mockMedications: Medication[] = [
  {
    id: 'med1',
    patientId: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    route: 'Oral',
    prescribedBy: 'Dr. Smith',
    prescribedDate: new Date('2024-01-15'),
    startDate: new Date('2024-01-15'),
    isActive: true,
    instructions: 'Take with or without food',
    refills: 5,
    quantity: '30 tablets'
  },
  {
    id: 'med2',
    patientId: '1',
    name: 'Multivitamin',
    dosage: '1 tablet',
    frequency: 'Once daily',
    route: 'Oral',
    prescribedBy: 'Dr. Smith',
    prescribedDate: new Date('2024-01-15'),
    startDate: new Date('2024-01-15'),
    isActive: true,
    instructions: 'Take with breakfast',
    refills: 11,
    quantity: '30 tablets'
  },
  {
    id: 'med3',
    patientId: '2',
    name: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed',
    route: 'Oral',
    prescribedBy: 'Dr. Wilson',
    prescribedDate: new Date('2024-12-10'),
    startDate: new Date('2024-12-10'),
    endDate: new Date('2025-01-10'),
    isActive: true,
    instructions: 'Take with food for chest pain',
    refills: 0,
    quantity: '20 tablets'
  }
];

export const mockLabResults: LabResult[] = [
  {
    id: 'lab1',
    patientId: '1',
    testName: 'Complete Blood Count',
    value: '12.5',
    unit: 'g/dL',
    referenceRange: '12.0-15.5',
    status: 'Normal',
    orderedBy: 'Dr. Smith',
    orderedDate: new Date('2024-12-15'),
    resultDate: new Date('2024-12-16'),
    category: 'Hematology'
  },
  {
    id: 'lab2',
    patientId: '1',
    testName: 'Total Cholesterol',
    value: '195',
    unit: 'mg/dL',
    referenceRange: '<200',
    status: 'Normal',
    orderedBy: 'Dr. Smith',
    orderedDate: new Date('2024-12-15'),
    resultDate: new Date('2024-12-16'),
    category: 'Chemistry'
  },
  {
    id: 'lab3',
    patientId: '2',
    testName: 'Troponin I',
    value: '0.02',
    unit: 'ng/mL',
    referenceRange: '<0.04',
    status: 'Normal',
    orderedBy: 'Dr. Wilson',
    orderedDate: new Date('2024-12-10'),
    resultDate: new Date('2024-12-10'),
    category: 'Cardiology'
  }
];

export const mockAgentActions: AgentAction[] = [
  {
    id: 'action1',
    patientId: '1',
    type: 'summary',
    description: 'Summarize last 2 visits',
    result: {
      summary: 'Patient Sarah Johnson had her annual physical on 12/15/2024 showing good health with well-controlled blood pressure. Previous visit on 11/20/2024 was a hypertension follow-up with stable vitals.',
      keyPoints: ['BP well controlled', 'Compliant with medications', 'No new concerns']
    },
    status: 'completed',
    timestamp: new Date('2024-12-20T10:30:00'),
    userId: 'user1',
    confirmationRequired: false
  },
  {
    id: 'action2',
    patientId: '1',
    type: 'draft-note',
    description: 'Generate SOAP note for annual physical',
    result: {
      soap: {
        subjective: 'Patient reports feeling well with no new complaints.',
        objective: 'Vital signs stable, physical exam unremarkable.',
        assessment: 'Healthy adult female, hypertension well controlled.',
        plan: 'Continue current medications, return in 1 year.'
      }
    },
    status: 'pending',
    timestamp: new Date('2024-12-20T10:35:00'),
    userId: 'user1',
    confirmationRequired: true
  }
];

export const mockLiteratureResults: LiteratureResult[] = [
  {
    id: 'lit1',
    title: 'Hypertension Management in Primary Care: Updated Guidelines',
    authors: ['Smith, J.', 'Johnson, M.', 'Williams, K.'],
    journal: 'Journal of Primary Care Medicine',
    publishedDate: new Date('2024-09-15'),
    abstract: 'This comprehensive review examines the latest evidence-based approaches to hypertension management in primary care settings...',
    doi: '10.1001/jpcm.2024.001',
    relevanceScore: 95,
    keywords: ['hypertension', 'primary care', 'blood pressure', 'ACE inhibitors']
  },
  {
    id: 'lit2',
    title: 'Annual Physical Examination: Evidence-Based Screening Recommendations',
    authors: ['Brown, L.', 'Davis, R.'],
    journal: 'American Family Physician',
    publishedDate: new Date('2024-08-20'),
    abstract: 'Current recommendations for annual physical examinations including evidence-based screening protocols...',
    doi: '10.1001/afp.2024.008',
    relevanceScore: 88,
    keywords: ['annual physical', 'screening', 'preventive care']
  },
  {
    id: 'lit3',
    title: 'Chest Pain Evaluation in Primary Care: A Systematic Approach',
    authors: ['Wilson, T.', 'Anderson, S.', 'Lee, C.'],
    journal: 'Primary Care Cardiovascular Medicine',
    publishedDate: new Date('2024-11-05'),
    abstract: 'A systematic approach to evaluating chest pain in primary care settings with emphasis on risk stratification...',
    doi: '10.1001/pccm.2024.015',
    relevanceScore: 92,
    keywords: ['chest pain', 'cardiovascular', 'risk assessment', 'primary care']
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'appt1',
    patientId: '1',
    providerId: 'dr-smith',
    date: new Date('2025-01-15T09:00:00'),
    duration: 30,
    type: 'Follow-up',
    status: 'Scheduled',
    reason: 'Hypertension follow-up',
    notes: 'Patient requested morning appointment'
  },
  {
    id: 'appt2',
    patientId: '2',
    providerId: 'dr-wilson',
    date: new Date('2025-01-20T14:30:00'),
    duration: 45,
    type: 'Office Visit',
    status: 'Scheduled',
    reason: 'Chest pain follow-up'
  }
];