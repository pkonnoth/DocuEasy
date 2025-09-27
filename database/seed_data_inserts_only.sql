-- EMR Co-Pilot Seed Data - INSERT STATEMENTS ONLY
-- Run this after your schema is already created

-- Insert sample healthcare providers
INSERT INTO public.users (id, email, first_name, last_name, role, specialty, license_number) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'dr.smith@example.com', 'John', 'Smith', 'provider', 'Family Medicine', 'MD123456'),
('550e8400-e29b-41d4-a716-446655440001', 'dr.wilson@example.com', 'Sarah', 'Wilson', 'provider', 'Internal Medicine', 'MD789012'),
('550e8400-e29b-41d4-a716-446655440002', 'dr.johnson@example.com', 'Michael', 'Johnson', 'provider', 'Cardiology', 'MD345678')
ON CONFLICT (id) DO NOTHING;

-- Insert sample patients
INSERT INTO public.patients (
  id, first_name, last_name, date_of_birth, gender, phone, email,
  address, insurance, emergency_contact, allergies, medical_record_number, created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440010',
  'Sarah', 'Johnson', '1985-03-15', 'Female', '(555) 123-4567', 'sarah.johnson@email.com',
  '{"street": "123 Main St", "city": "Boston", "state": "MA", "zipCode": "02101"}',
  '{"provider": "Blue Cross Blue Shield", "memberId": "BC123456789", "groupNumber": "GRP001"}',
  '{"name": "John Johnson", "relationship": "Spouse", "phone": "(555) 987-6543"}',
  '{"Penicillin", "Shellfish"}',
  'MRN001234',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  'Michael', 'Chen', '1978-11-22', 'Male', '(555) 234-5678', 'michael.chen@email.com',
  '{"street": "456 Oak Avenue", "city": "Cambridge", "state": "MA", "zipCode": "02138"}',
  '{"provider": "Aetna", "memberId": "AET987654321", "groupNumber": "GRP002"}',
  '{"name": "Lisa Chen", "relationship": "Wife", "phone": "(555) 876-5432"}',
  '{"Latex"}',
  'MRN002345',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  'Emily', 'Rodriguez', '1992-07-08', 'Female', '(555) 345-6789', 'emily.rodriguez@email.com',
  '{"street": "789 Pine Street", "city": "Somerville", "state": "MA", "zipCode": "02143"}',
  '{"provider": "Harvard Pilgrim", "memberId": "HP456789123", "groupNumber": "GRP003"}',
  '{"name": "Maria Rodriguez", "relationship": "Mother", "phone": "(555) 765-4321"}',
  '{}',
  'MRN003456',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  'David', 'Thompson', '1965-09-12', 'Male', '(555) 456-7890', 'david.thompson@email.com',
  '{"street": "321 Elm Street", "city": "Newton", "state": "MA", "zipCode": "02460"}',
  '{"provider": "Cigna", "memberId": "CIG789012345", "groupNumber": "GRP004"}',
  '{"name": "Margaret Thompson", "relationship": "Wife", "phone": "(555) 654-3210"}',
  '{"Aspirin", "Iodine"}',
  'MRN004567',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440014',
  'Lisa', 'Anderson', '1990-01-28', 'Female', '(555) 567-8901', 'lisa.anderson@email.com',
  '{"street": "654 Maple Drive", "city": "Brookline", "state": "MA", "zipCode": "02445"}',
  '{"provider": "United Healthcare", "memberId": "UHC012345678", "groupNumber": "GRP005"}',
  '{"name": "Robert Anderson", "relationship": "Father", "phone": "(555) 543-2109"}',
  '{}',
  'MRN005678',
  '550e8400-e29b-41d4-a716-446655440002'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample encounters (medical visits)
INSERT INTO public.encounters (
  id, patient_id, date, type, provider, chief_complaint, assessment, plan, notes,
  vitals, diagnoses, procedures, status, created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440010',
  '2024-12-15T10:00:00Z',
  'Office Visit',
  'Dr. Smith',
  'Annual physical examination',
  'Healthy adult female, no acute concerns',
  'Continue current medications, return in 1 year for annual physical',
  'Patient reports feeling well. No new symptoms. Blood pressure normal.',
  '{"temperature": 98.6, "bloodPressure": {"systolic": 120, "diastolic": 80}, "heartRate": 72, "respiratoryRate": 16, "oxygenSaturation": 99, "weight": 140, "height": 65, "bmi": 23.3}',
  '{"Z00.00 - Encounter for general adult medical examination"}',
  '{"Annual Physical"}',
  'Completed',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440010',
  '2024-11-20T14:30:00Z',
  'Follow-up',
  'Dr. Smith',
  'Follow-up for hypertension',
  'Blood pressure well controlled on current medication',
  'Continue lisinopril 10mg daily, recheck in 3 months',
  'Patient compliant with medications. No side effects reported.',
  '{"bloodPressure": {"systolic": 125, "diastolic": 82}}',
  '{"I10 - Essential hypertension"}',
  '{}',
  'Completed',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440011',
  '2024-12-10T11:15:00Z',
  'Office Visit',
  'Dr. Wilson',
  'Chest pain',
  'Atypical chest pain, likely musculoskeletal',
  'NSAIDs for pain, return if symptoms worsen',
  'Patient describes sharp, stabbing chest pain that started after lifting heavy boxes.',
  '{"temperature": 98.4, "bloodPressure": {"systolic": 140, "diastolic": 90}, "heartRate": 80}',
  '{"R06.02 - Shortness of breath"}',
  '{"EKG"}',
  'Completed',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440023',
  '550e8400-e29b-41d4-a716-446655440012',
  '2024-12-08T09:30:00Z',
  'Telehealth',
  'Dr. Johnson',
  'Anxiety and sleep issues',
  'Generalized anxiety disorder, insomnia',
  'Start sertraline 50mg daily, sleep hygiene counseling',
  'Patient reports increased anxiety and difficulty sleeping for past 2 months.',
  '{}',
  '{"F41.1 - Generalized anxiety disorder", "G47.00 - Insomnia, unspecified"}',
  '{"Telehealth consultation"}',
  'Completed',
  '550e8400-e29b-41d4-a716-446655440002'
),
(
  '550e8400-e29b-41d4-a716-446655440024',
  '550e8400-e29b-41d4-a716-446655440013',
  '2024-12-05T16:00:00Z',
  'Emergency',
  'Dr. Wilson',
  'Severe chest pain',
  'NSTEMI - Non-ST elevation myocardial infarction',
  'Admit to CCU, start dual antiplatelet therapy, cardiology consult',
  'Patient presented with crushing chest pain radiating to left arm. Troponin elevated.',
  '{"temperature": 99.1, "bloodPressure": {"systolic": 160, "diastolic": 95}, "heartRate": 105, "oxygenSaturation": 96}',
  '{"I21.4 - Non-ST elevation myocardial infarction"}',
  '{"EKG", "Chest X-ray", "Cardiac catheterization"}',
  'Completed',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440025',
  '550e8400-e29b-41d4-a716-446655440014',
  '2024-12-03T13:45:00Z',
  'Annual Physical',
  'Dr. Johnson',
  'Routine annual examination',
  'Healthy young adult, all screening up to date',
  'Continue healthy lifestyle, return in 1 year',
  'Patient is very healthy and active. All lab values normal.',
  '{"temperature": 98.2, "bloodPressure": {"systolic": 110, "diastolic": 70}, "heartRate": 65, "weight": 125, "height": 66, "bmi": 20.1}',
  '{"Z00.00 - Encounter for general adult medical examination"}',
  '{"Annual Physical", "Pap smear", "Mammogram referral"}',
  'Completed',
  '550e8400-e29b-41d4-a716-446655440002'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample medications
INSERT INTO public.medications (
  id, patient_id, name, dosage, frequency, route, prescribed_by,
  prescribed_date, start_date, is_active, instructions, refills, quantity, created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440010',
  'Lisinopril', '10mg', 'Once daily', 'Oral', 'Dr. Smith',
  '2024-01-15', '2024-01-15', true, 'Take with or without food', 5, '30 tablets',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440010',
  'Multivitamin', '1 tablet', 'Once daily', 'Oral', 'Dr. Smith',
  '2024-01-15', '2024-01-15', true, 'Take with breakfast', 11, '30 tablets',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440032',
  '550e8400-e29b-41d4-a716-446655440011',
  'Ibuprofen', '400mg', 'As needed', 'Oral', 'Dr. Wilson',
  '2024-12-10', '2024-12-10', true, 'Take with food for chest pain', 0, '20 tablets',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440033',
  '550e8400-e29b-41d4-a716-446655440012',
  'Sertraline', '50mg', 'Once daily', 'Oral', 'Dr. Johnson',
  '2024-12-08', '2024-12-08', true, 'Take in the morning with food', 5, '30 tablets',
  '550e8400-e29b-41d4-a716-446655440002'
),
(
  '550e8400-e29b-41d4-a716-446655440034',
  '550e8400-e29b-41d4-a716-446655440013',
  'Aspirin', '81mg', 'Once daily', 'Oral', 'Dr. Wilson',
  '2024-12-05', '2024-12-05', true, 'Take with food, for heart protection', 5, '30 tablets',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440035',
  '550e8400-e29b-41d4-a716-446655440013',
  'Clopidogrel', '75mg', 'Once daily', 'Oral', 'Dr. Wilson',
  '2024-12-05', '2024-12-05', true, 'Take at the same time each day', 3, '30 tablets',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440036',
  '550e8400-e29b-41d4-a716-446655440013',
  'Atorvastatin', '40mg', 'Once daily', 'Oral', 'Dr. Wilson',
  '2024-12-05', '2024-12-05', true, 'Take in the evening', 5, '30 tablets',
  '550e8400-e29b-41d4-a716-446655440001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lab results
INSERT INTO public.lab_results (
  id, patient_id, test_name, value, unit, reference_range, status,
  ordered_by, ordered_date, result_date, category, created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440040',
  '550e8400-e29b-41d4-a716-446655440010',
  'Complete Blood Count', '12.5', 'g/dL', '12.0-15.5', 'Normal',
  'Dr. Smith', '2024-12-15', '2024-12-16', 'Hematology',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440041',
  '550e8400-e29b-41d4-a716-446655440010',
  'Total Cholesterol', '195', 'mg/dL', '<200', 'Normal',
  'Dr. Smith', '2024-12-15', '2024-12-16', 'Chemistry',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440042',
  '550e8400-e29b-41d4-a716-446655440011',
  'Troponin I', '0.02', 'ng/mL', '<0.04', 'Normal',
  'Dr. Wilson', '2024-12-10', '2024-12-10', 'Cardiology',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440043',
  '550e8400-e29b-41d4-a716-446655440013',
  'Troponin I', '2.8', 'ng/mL', '<0.04', 'Critical',
  'Dr. Wilson', '2024-12-05', '2024-12-05', 'Cardiology',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440044',
  '550e8400-e29b-41d4-a716-446655440013',
  'Total Cholesterol', '285', 'mg/dL', '<200', 'Abnormal',
  'Dr. Wilson', '2024-12-05', '2024-12-06', 'Chemistry',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440045',
  '550e8400-e29b-41d4-a716-446655440014',
  'Hemoglobin A1c', '5.2', '%', '<5.7', 'Normal',
  'Dr. Johnson', '2024-12-03', '2024-12-04', 'Chemistry',
  '550e8400-e29b-41d4-a716-446655440002'
),
(
  '550e8400-e29b-41d4-a716-446655440046',
  '550e8400-e29b-41d4-a716-446655440014',
  'Thyroid Stimulating Hormone', '2.1', 'mIU/L', '0.4-4.0', 'Normal',
  'Dr. Johnson', '2024-12-03', '2024-12-04', 'Endocrinology',
  '550e8400-e29b-41d4-a716-446655440002'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments
INSERT INTO public.appointments (
  id, patient_id, provider_id, date, duration, type, status, reason, notes, created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440060',
  '550e8400-e29b-41d4-a716-446655440010',
  'Dr. Smith',
  '2025-02-15T10:00:00Z',
  30,
  'Follow-up',
  'Scheduled',
  'Hypertension follow-up',
  'Regular BP check and medication review',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440061',
  '550e8400-e29b-41d4-a716-446655440013',
  'Dr. Wilson',
  '2025-01-05T14:00:00Z',
  45,
  'Follow-up',
  'Confirmed',
  'Post-MI cardiology follow-up',
  'Echo and stress test results review',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440062',
  '550e8400-e29b-41d4-a716-446655440012',
  'Dr. Johnson',
  '2025-01-08T11:30:00Z',
  30,
  'Telehealth',
  'Scheduled',
  'Anxiety medication follow-up',
  'Check response to sertraline',
  '550e8400-e29b-41d4-a716-446655440002'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample agent actions (AI interactions)
INSERT INTO public.agent_actions (
  id, patient_id, type, description, result, status, user_id
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440070',
  '550e8400-e29b-41d4-a716-446655440010',
  'summary',
  'Summarize last 2 visits',
  '{"summary": "Patient Sarah Johnson had her annual physical on 12/15/2024 showing good health with well-controlled blood pressure. Previous visit on 11/20/2024 was a hypertension follow-up with stable vitals.", "keyPoints": ["BP well controlled", "Compliant with medications", "No new concerns"]}',
  'completed',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440071',
  '550e8400-e29b-41d4-a716-446655440010',
  'draft-note',
  'Generate SOAP note for annual physical',
  '{"soap": {"subjective": "Patient reports feeling well with no new complaints.", "objective": "Vital signs stable, physical exam unremarkable.", "assessment": "Healthy adult female, hypertension well controlled.", "plan": "Continue current medications, return in 1 year."}}',
  'pending',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '550e8400-e29b-41d4-a716-446655440072',
  '550e8400-e29b-41d4-a716-446655440013',
  'literature',
  'Find recent studies on post-MI care',
  '{"studies_found": 5, "relevant_papers": ["Post-MI dual antiplatelet therapy duration", "Statin therapy in acute coronary syndromes", "Cardiac rehabilitation outcomes"]}',
  'completed',
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440073',
  '550e8400-e29b-41d4-a716-446655440012',
  'summary',
  'Generate patient summary for anxiety treatment',
  '{"summary": "32-year-old female with new onset generalized anxiety disorder and insomnia. Started on sertraline 50mg daily with good initial response.", "keyPoints": ["New diagnosis GAD", "Started sertraline", "Sleep hygiene counseling provided"]}',
  'confirmed',
  '550e8400-e29b-41d4-a716-446655440002'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample literature results (AI-curated studies)
INSERT INTO public.literature_results (
  id, title, authors, journal, published_date, abstract, doi, relevance_score, keywords
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440080',
  'Hypertension Management in Primary Care: Updated Guidelines',
  '{"Smith, J.", "Johnson, M.", "Williams, K."}',
  'Journal of Primary Care Medicine',
  '2024-09-15',
  'This comprehensive review examines the latest evidence-based approaches to hypertension management in primary care settings, focusing on lifestyle modifications, medication selection, and patient monitoring strategies.',
  '10.1001/jpcm.2024.001',
  95,
  '{"hypertension", "primary care", "blood pressure", "ACE inhibitors"}'
),
(
  '550e8400-e29b-41d4-a716-446655440081',
  'Annual Physical Examination: Evidence-Based Screening Recommendations',
  '{"Brown, L.", "Davis, R."}',
  'American Family Physician',
  '2024-08-20',
  'Current recommendations for annual physical examinations including evidence-based screening protocols for cardiovascular disease, diabetes, and cancer prevention in adults.',
  '10.1001/afp.2024.008',
  88,
  '{"preventive care", "screening", "annual physical", "primary care"}'
),
(
  '550e8400-e29b-41d4-a716-446655440082',
  'Post-Myocardial Infarction Care: Optimal Duration of Dual Antiplatelet Therapy',
  '{"Martinez, C.", "Thompson, P.", "Lee, S."}',
  'Cardiology Today',
  '2024-10-12',
  'Analysis of recent clinical trials examining the optimal duration of dual antiplatelet therapy following myocardial infarction, balancing efficacy against bleeding risk.',
  '10.1016/ct.2024.010',
  92,
  '{"myocardial infarction", "antiplatelet therapy", "cardiology", "post-MI care"}'
),
(
  '550e8400-e29b-41d4-a716-446655440083',
  'Generalized Anxiety Disorder: First-Line Treatment Options',
  '{"Wilson, A.", "Garcia, M."}',
  'Journal of Clinical Psychiatry',
  '2024-07-30',
  'Review of current evidence for first-line treatments of generalized anxiety disorder, including SSRIs, cognitive behavioral therapy, and combination approaches.',
  '10.4088/jcp.2024.007',
  90,
  '{"anxiety", "GAD", "sertraline", "SSRI", "mental health"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample audit log entries
INSERT INTO public.audit_log (
  id, user_id, action, entity_type, entity_id, changes
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440090',
  '550e8400-e29b-41d4-a716-446655440000',
  'CREATE',
  'patient',
  '550e8400-e29b-41d4-a716-446655440010',
  '{"action": "created_patient", "patient_name": "Sarah Johnson", "mrn": "MRN001234"}'
),
(
  '550e8400-e29b-41d4-a716-446655440091',
  '550e8400-e29b-41d4-a716-446655440000',
  'UPDATE',
  'encounter',
  '550e8400-e29b-41d4-a716-446655440020',
  '{"action": "updated_encounter", "field": "status", "old_value": "In Progress", "new_value": "Completed"}'
),
(
  '550e8400-e29b-41d4-a716-446655440092',
  '550e8400-e29b-41d4-a716-446655440001',
  'CREATE',
  'medication',
  '550e8400-e29b-41d4-a716-446655440034',
  '{"action": "prescribed_medication", "medication": "Aspirin 81mg", "patient": "David Thompson"}'
),
(
  '550e8400-e29b-41d4-a716-446655440093',
  '550e8400-e29b-41d4-a716-446655440002',
  'UPDATE',
  'patient',
  '550e8400-e29b-41d4-a716-446655440012',
  '{"action": "updated_patient_info", "field": "phone", "patient": "Emily Rodriguez"}'
)
ON CONFLICT (id) DO NOTHING;