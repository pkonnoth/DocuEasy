-- =============================================================================
-- DEMO PATIENT DATA - 5 Realistic Medical Scenarios
-- =============================================================================
-- Comprehensive test data for Cedar API and Agentic AI features
-- Includes patients, encounters, labs, medications, and appointments

-- =============================================================================
-- PATIENT DATA (5 Patients with Different Medical Profiles)
-- =============================================================================

-- Patient 1: Sarah Johnson (38F) - Diabetes Management
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, insurance, emergency_contact, allergies, medical_record_number) VALUES
('123e4567-e89b-12d3-a456-426614174001', 
 'Sarah', 'Johnson', '1985-03-15', 'Female', '(555) 123-4567', 'sarah.johnson@email.com',
 '{"street": "123 Main St", "city": "Boston", "state": "MA", "zipCode": "02101"}',
 '{"provider": "Blue Cross Blue Shield", "memberId": "BC123456789", "groupNumber": "GRP001"}',
 '{"name": "John Johnson", "relationship": "Spouse", "phone": "(555) 987-6543"}',
 '{"Penicillin", "Shellfish"}',
 'MRN001234');

-- Patient 2: Michael Chen (45M) - Hypertension and Heart Disease
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, insurance, emergency_contact, allergies, medical_record_number) VALUES
('123e4567-e89b-12d3-a456-426614174002',
 'Michael', 'Chen', '1978-11-22', 'Male', '(555) 234-5678', 'michael.chen@email.com',
 '{"street": "456 Oak Avenue", "city": "Cambridge", "state": "MA", "zipCode": "02138"}',
 '{"provider": "Aetna", "memberId": "AET987654321", "groupNumber": "GRP002"}',
 '{"name": "Lisa Chen", "relationship": "Wife", "phone": "(555) 876-5432"}',
 '{"Latex", "Aspirin"}',
 'MRN002345');

-- Patient 3: Emily Rodriguez (31F) - Mental Health and Anxiety
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, insurance, emergency_contact, allergies, medical_record_number) VALUES
('123e4567-e89b-12d3-a456-426614174003',
 'Emily', 'Rodriguez', '1992-07-08', 'Female', '(555) 345-6789', 'emily.rodriguez@email.com',
 '{"street": "789 Pine Street", "city": "Somerville", "state": "MA", "zipCode": "02143"}',
 '{"provider": "Harvard Pilgrim", "memberId": "HP456789123", "groupNumber": "GRP003"}',
 '{"name": "Maria Rodriguez", "relationship": "Mother", "phone": "(555) 765-4321"}',
 '{}',
 'MRN003456');

-- Patient 4: David Thompson (58M) - COPD and Chronic Conditions
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, insurance, emergency_contact, allergies, medical_record_number) VALUES
('123e4567-e89b-12d3-a456-426614174004',
 'David', 'Thompson', '1965-09-12', 'Male', '(555) 456-7890', 'david.thompson@email.com',
 '{"street": "321 Elm Street", "city": "Newton", "state": "MA", "zipCode": "02460"}',
 '{"provider": "Cigna", "memberId": "CIG789012345", "groupNumber": "GRP004"}',
 '{"name": "Margaret Thompson", "relationship": "Wife", "phone": "(555) 654-3210"}',
 '{"Iodine", "Codeine"}',
 'MRN004567');

-- Patient 5: Lisa Anderson (33F) - Healthy Young Adult with Preventive Care
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, insurance, emergency_contact, allergies, medical_record_number) VALUES
('123e4567-e89b-12d3-a456-426614174005',
 'Lisa', 'Anderson', '1990-01-28', 'Female', '(555) 567-8901', 'lisa.anderson@email.com',
 '{"street": "654 Maple Drive", "city": "Brookline", "state": "MA", "zipCode": "02445"}',
 '{"provider": "United Healthcare", "memberId": "UHC012345678", "groupNumber": "GRP005"}',
 '{"name": "Robert Anderson", "relationship": "Father", "phone": "(555) 543-2109"}',
 '{"Latex"}',
 'MRN005678');

-- =============================================================================
-- ENCOUNTERS (Medical Visits)
-- =============================================================================

-- Sarah Johnson Encounters (Diabetes Management)
INSERT INTO encounters (id, patient_id, encounter_date, type, provider, chief_complaint, assessment, plan, notes, vitals, diagnoses, procedures, status) VALUES
-- Recent diabetes follow-up
('550e8400-e29b-41d4-a716-446655440001',
 '123e4567-e89b-12d3-a456-426614174001',
 '2024-01-15 10:00:00+00',
 'Follow-up',
 'Dr. Sarah Smith',
 'Diabetes follow-up, checking blood sugar levels',
 'Type 2 diabetes well controlled, HbA1c improved',
 'Continue metformin, increase exercise, follow up in 3 months',
 'Patient reports good compliance with diet and medications',
 '{"temperature": 98.6, "bloodPressure": {"systolic": 128, "diastolic": 82}, "heartRate": 76, "weight": 165, "height": 65, "bmi": 27.4}',
 '{"E11.9 - Type 2 diabetes mellitus without complications"}',
 '{"HbA1c test", "Blood glucose monitoring"}',
 'Completed'),

-- Initial diabetes diagnosis
('550e8400-e29b-41d4-a716-446655440002',
 '123e4567-e89b-12d3-a456-426614174001',
 '2023-09-20 14:30:00+00',
 'Office Visit',
 'Dr. Sarah Smith',
 'Fatigue, increased thirst, frequent urination',
 'New diagnosis Type 2 diabetes mellitus',
 'Start metformin 500mg twice daily, diabetes education, nutrition consult',
 'Patient shocked by diagnosis, provided extensive education and support',
 '{"temperature": 98.2, "bloodPressure": {"systolic": 135, "diastolic": 88}, "heartRate": 82, "weight": 170, "height": 65, "bmi": 28.3}',
 '{"E11.9 - Type 2 diabetes mellitus without complications", "R35.0 - Polyuria"}',
 '{"Diabetes education", "Nutritional counseling"}',
 'Completed');

-- Michael Chen Encounters (Heart Disease)
INSERT INTO encounters (id, patient_id, encounter_date, type, provider, chief_complaint, assessment, plan, notes, vitals, diagnoses, procedures, status) VALUES
-- Chest pain emergency
('550e8400-e29b-41d4-a716-446655440003',
 '123e4567-e89b-12d3-a456-426614174002',
 '2024-01-08 18:45:00+00',
 'Emergency',
 'Dr. Michael Johnson',
 'Severe chest pain radiating to left arm',
 'NSTEMI - Non-ST elevation myocardial infarction',
 'Admit to CCU, dual antiplatelet therapy, cardiology consult, cardiac cath',
 'Patient presented with crushing chest pain, troponin elevated, EKG changes',
 '{"temperature": 99.1, "bloodPressure": {"systolic": 160, "diastolic": 95}, "heartRate": 105, "oxygenSaturation": 96}',
 '{"I21.4 - Non-ST elevation myocardial infarction"}',
 '{"EKG", "Chest X-ray", "Cardiac catheterization", "Troponin levels"}',
 'Completed'),

-- Hypertension follow-up
('550e8400-e29b-41d4-a716-446655440004',
 '123e4567-e89b-12d3-a456-426614174002',
 '2023-12-15 11:15:00+00',
 'Follow-up',
 'Dr. Sarah Smith',
 'Hypertension follow-up',
 'Blood pressure well controlled on current medications',
 'Continue lisinopril 10mg daily, check labs in 3 months',
 'Patient compliant with medications, lifestyle modifications working well',
 '{"bloodPressure": {"systolic": 125, "diastolic": 78}, "heartRate": 68, "weight": 180}',
 '{"I10 - Essential hypertension"}',
 '{"Blood pressure monitoring"}',
 'Completed');

-- Emily Rodriguez Encounters (Mental Health)
INSERT INTO encounters (id, patient_id, encounter_date, type, provider, chief_complaint, assessment, plan, notes, vitals, diagnoses, procedures, status) VALUES
-- Telehealth anxiety visit
('550e8400-e29b-41d4-a716-446655440005',
 '123e4567-e89b-12d3-a456-426614174003',
 '2024-01-10 16:00:00+00',
 'Telehealth',
 'Dr. Patricia Wilson',
 'Increased anxiety and panic attacks',
 'Generalized anxiety disorder with panic attacks',
 'Increase sertraline to 75mg daily, cognitive behavioral therapy referral',
 'Patient reports work stress triggering more frequent panic attacks',
 '{}',
 '{"F41.1 - Generalized anxiety disorder", "F41.0 - Panic disorder"}',
 '{"Mental health assessment", "Telehealth consultation"}',
 'Completed'),

-- Initial mental health visit
('550e8400-e29b-41d4-a716-446655440006',
 '123e4567-e89b-12d3-a456-426614174003',
 '2023-11-20 13:30:00+00',
 'Office Visit',
 'Dr. Patricia Wilson',
 'Anxiety, sleep issues, feeling overwhelmed',
 'Generalized anxiety disorder, insomnia',
 'Start sertraline 50mg daily, sleep hygiene counseling, therapy referral',
 'First-time patient seeking help for anxiety, very motivated for treatment',
 '{"temperature": 98.4, "bloodPressure": {"systolic": 110, "diastolic": 70}, "heartRate": 88}',
 '{"F41.1 - Generalized anxiety disorder", "G47.00 - Insomnia"}',
 '{"PHQ-9 depression screening", "GAD-7 anxiety assessment"}',
 'Completed');

-- David Thompson Encounters (COPD)
INSERT INTO encounters (id, patient_id, encounter_date, type, provider, chief_complaint, assessment, plan, notes, vitals, diagnoses, procedures, status) VALUES
-- COPD exacerbation
('550e8400-e29b-41d4-a716-446655440007',
 '123e4567-e89b-12d3-a456-426614174004',
 '2024-01-05 09:30:00+00',
 'Office Visit',
 'Dr. Robert Martinez',
 'Shortness of breath, increased cough, yellow sputum',
 'COPD exacerbation, likely bacterial infection',
 'Prednisone 40mg daily x5 days, azithromycin, increase albuterol use',
 'Patient with worsening symptoms over 3 days, smoking cessation counseling',
 '{"temperature": 100.2, "bloodPressure": {"systolic": 145, "diastolic": 90}, "heartRate": 95, "oxygenSaturation": 88, "respiratoryRate": 24}',
 '{"J44.1 - Chronic obstructive pulmonary disease with acute exacerbation"}',
 '{"Chest X-ray", "Sputum culture", "Peak flow measurement"}',
 'Completed'),

-- Routine COPD management
('550e8400-e29b-41d4-a716-446655440008',
 '123e4567-e89b-12d3-a456-426614174004',
 '2023-10-12 14:15:00+00',
 'Follow-up',
 'Dr. Robert Martinez',
 'COPD routine follow-up',
 'COPD stable, patient doing well on current regimen',
 'Continue current medications, flu vaccine given, pulmonary rehab referral',
 'Patient reports improved exercise tolerance, still smoking occasionally',
 '{"temperature": 98.8, "bloodPressure": {"systolic": 138, "diastolic": 85}, "heartRate": 78, "oxygenSaturation": 92}',
 '{"J44.0 - Chronic obstructive pulmonary disease with acute lower respiratory infection"}',
 '{"Spirometry", "Flu vaccination"}',
 'Completed');

-- Lisa Anderson Encounters (Preventive Care)
INSERT INTO encounters (id, patient_id, encounter_date, type, provider, chief_complaint, assessment, plan, notes, vitals, diagnoses, procedures, status) VALUES
-- Annual physical
('550e8400-e29b-41d4-a716-446655440009',
 '123e4567-e89b-12d3-a456-426614174005',
 '2024-01-12 10:00:00+00',
 'Annual Physical',
 'Dr. Jennifer Davis',
 'Annual wellness exam',
 'Healthy young adult, all preventive care up to date',
 'Continue healthy lifestyle, return in 1 year, mammogram due next year',
 'Patient very health-conscious, exercises regularly, good diet',
 '{"temperature": 98.2, "bloodPressure": {"systolic": 105, "diastolic": 68}, "heartRate": 62, "weight": 125, "height": 66, "bmi": 20.2}',
 '{"Z00.00 - Encounter for general adult medical examination without abnormal findings"}',
 '{"Annual physical", "Pap smear", "Blood work"}',
 'Completed');

-- =============================================================================
-- LAB RESULTS
-- =============================================================================

-- Sarah Johnson Labs (Diabetes)
INSERT INTO lab_results (id, patient_id, test_name, result_value, result_unit, reference_range, status, ordered_by, ordered_date, result_date, notes, category, is_critical) VALUES
-- Recent HbA1c (improved)
('660e8400-e29b-41d4-a716-446655440001',
 '123e4567-e89b-12d3-a456-426614174001',
 'Hemoglobin A1c', '7.2', '%', '<7.0', 'Abnormal', 'Dr. Sarah Smith',
 '2024-01-15 10:00:00+00', '2024-01-16 08:00:00+00',
 'Improved from previous 8.5%, trending in right direction', 'Diabetes', false),

-- Blood glucose
('660e8400-e29b-41d4-a716-446655440002',
 '123e4567-e89b-12d3-a456-426614174001',
 'Fasting Glucose', '145', 'mg/dL', '70-100', 'Abnormal', 'Dr. Sarah Smith',
 '2024-01-15 10:00:00+00', '2024-01-16 08:00:00+00',
 'Still elevated but better than baseline', 'Diabetes', false),

-- Initial diabetes diagnosis labs
('660e8400-e29b-41d4-a716-446655440003',
 '123e4567-e89b-12d3-a456-426614174001',
 'Hemoglobin A1c', '8.5', '%', '<7.0', 'Critical', 'Dr. Sarah Smith',
 '2023-09-20 14:30:00+00', '2023-09-21 09:00:00+00',
 'Initial diagnosis, significantly elevated', 'Diabetes', true);

-- Michael Chen Labs (Heart Disease)
INSERT INTO lab_results (id, patient_id, test_name, result_value, result_unit, reference_range, status, ordered_by, ordered_date, result_date, notes, category, is_critical) VALUES
-- Cardiac markers during heart attack
('660e8400-e29b-41d4-a716-446655440004',
 '123e4567-e89b-12d3-a456-426614174002',
 'Troponin I', '8.2', 'ng/mL', '<0.04', 'Critical', 'Dr. Michael Johnson',
 '2024-01-08 19:00:00+00', '2024-01-08 20:30:00+00',
 'Significantly elevated, confirms myocardial infarction', 'Cardiac', true),

-- Cholesterol panel
('660e8400-e29b-41d4-a716-446655440005',
 '123e4567-e89b-12d3-a456-426614174002',
 'Total Cholesterol', '245', 'mg/dL', '<200', 'Abnormal', 'Dr. Sarah Smith',
 '2023-12-15 11:15:00+00', '2023-12-16 08:00:00+00',
 'Elevated, needs statin therapy', 'Lipids', false),

-- LDL Cholesterol
('660e8400-e29b-41d4-a716-446655440006',
 '123e4567-e89b-12d3-a456-426614174002',
 'LDL Cholesterol', '165', 'mg/dL', '<100', 'Abnormal', 'Dr. Sarah Smith',
 '2023-12-15 11:15:00+00', '2023-12-16 08:00:00+00',
 'Significantly elevated for cardiac risk', 'Lipids', false);

-- Emily Rodriguez Labs (Basic Health)
INSERT INTO lab_results (id, patient_id, test_name, result_value, result_unit, reference_range, status, ordered_by, ordered_date, result_date, notes, category, is_critical) VALUES
-- Basic metabolic panel
('660e8400-e29b-41d4-a716-446655440007',
 '123e4567-e89b-12d3-a456-426614174003',
 'Complete Blood Count', '6.8', 'K/uL', '4.0-11.0', 'Normal', 'Dr. Patricia Wilson',
 '2023-11-20 13:30:00+00', '2023-11-21 09:00:00+00',
 'Normal CBC, no anemia', 'Hematology', false);

-- David Thompson Labs (COPD)
INSERT INTO lab_results (id, patient_id, test_name, result_value, result_unit, reference_range, status, ordered_by, ordered_date, result_date, notes, category, is_critical) VALUES
-- Oxygen levels during exacerbation
('660e8400-e29b-41d4-a716-446655440008',
 '123e4567-e89b-12d3-a456-426614174004',
 'Arterial Blood Gas pH', '7.32', '', '7.35-7.45', 'Abnormal', 'Dr. Robert Martinez',
 '2024-01-05 09:30:00+00', '2024-01-05 10:15:00+00',
 'Mild respiratory acidosis during exacerbation', 'Blood Gas', false),

-- White blood count (infection)
('660e8400-e29b-41d4-a716-446655440009',
 '123e4567-e89b-12d3-a456-426614174004',
 'White Blood Count', '12.5', 'K/uL', '4.0-11.0', 'Abnormal', 'Dr. Robert Martinez',
 '2024-01-05 09:30:00+00', '2024-01-05 11:00:00+00',
 'Elevated suggesting bacterial infection', 'Hematology', false);

-- Lisa Anderson Labs (Preventive)
INSERT INTO lab_results (id, patient_id, test_name, result_value, result_unit, reference_range, status, ordered_by, ordered_date, result_date, notes, category, is_critical) VALUES
-- Annual screening labs
('660e8400-e29b-41d4-a716-446655440010',
 '123e4567-e89b-12d3-a456-426614174005',
 'Total Cholesterol', '165', 'mg/dL', '<200', 'Normal', 'Dr. Jennifer Davis',
 '2024-01-12 10:00:00+00', '2024-01-13 08:00:00+00',
 'Excellent lipid profile', 'Lipids', false),

('660e8400-e29b-41d4-a716-446655440011',
 '123e4567-e89b-12d3-a456-426614174005',
 'Fasting Glucose', '88', 'mg/dL', '70-100', 'Normal', 'Dr. Jennifer Davis',
 '2024-01-12 10:00:00+00', '2024-01-13 08:00:00+00',
 'Normal glucose metabolism', 'Diabetes', false);

-- =============================================================================
-- MEDICATIONS
-- =============================================================================

-- Sarah Johnson Medications (Diabetes)
INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, route, prescribed_by, prescribed_date, start_date, is_active, instructions, refills, quantity) VALUES
('770e8400-e29b-41d4-a716-446655440001',
 '123e4567-e89b-12d3-a456-426614174001',
 'Metformin', '500mg', 'Twice daily', 'oral', 'Dr. Sarah Smith',
 '2023-09-20 14:30:00+00', '2023-09-20 14:30:00+00', true,
 'Take with meals to reduce stomach upset', 5, '60 tablets'),

('770e8400-e29b-41d4-a716-446655440002',
 '123e4567-e89b-12d3-a456-426614174001',
 'Lisinopril', '10mg', 'Once daily', 'oral', 'Dr. Sarah Smith',
 '2024-01-15 10:00:00+00', '2024-01-15 10:00:00+00', true,
 'Take in the morning, monitor blood pressure', 3, '30 tablets');

-- Michael Chen Medications (Heart Disease)
INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, route, prescribed_by, prescribed_date, start_date, is_active, instructions, refills, quantity) VALUES
('770e8400-e29b-41d4-a716-446655440003',
 '123e4567-e89b-12d3-a456-426614174002',
 'Atorvastatin', '40mg', 'Once daily', 'oral', 'Dr. Michael Johnson',
 '2024-01-10 12:00:00+00', '2024-01-10 12:00:00+00', true,
 'Take at bedtime, avoid grapefruit', 5, '30 tablets'),

('770e8400-e29b-41d4-a716-446655440004',
 '123e4567-e89b-12d3-a456-426614174002',
 'Clopidogrel', '75mg', 'Once daily', 'oral', 'Dr. Michael Johnson',
 '2024-01-08 20:00:00+00', '2024-01-08 20:00:00+00', true,
 'Take with food, do not stop without consulting doctor', 11, '90 tablets'),

('770e8400-e29b-41d4-a716-446655440005',
 '123e4567-e89b-12d3-a456-426614174002',
 'Lisinopril', '5mg', 'Once daily', 'oral', 'Dr. Sarah Smith',
 '2023-12-15 11:15:00+00', '2023-12-15 11:15:00+00', true,
 'Take in morning, monitor blood pressure', 5, '30 tablets');

-- Emily Rodriguez Medications (Mental Health)
INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, route, prescribed_by, prescribed_date, start_date, is_active, instructions, refills, quantity) VALUES
('770e8400-e29b-41d4-a716-446655440006',
 '123e4567-e89b-12d3-a456-426614174003',
 'Sertraline', '75mg', 'Once daily', 'oral', 'Dr. Patricia Wilson',
 '2024-01-10 16:00:00+00', '2024-01-10 16:00:00+00', true,
 'Take in morning with food, may cause initial nausea', 5, '30 tablets');

-- David Thompson Medications (COPD)
INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, route, prescribed_by, prescribed_date, start_date, is_active, instructions, refills, quantity) VALUES
('770e8400-e29b-41d4-a716-446655440007',
 '123e4567-e89b-12d3-a456-426614174004',
 'Albuterol Inhaler', '90mcg', 'As needed', 'inhaled', 'Dr. Robert Martinez',
 '2023-10-12 14:15:00+00', '2023-10-12 14:15:00+00', true,
 'Use for shortness of breath, rinse mouth after use', 5, '1 inhaler'),

('770e8400-e29b-41d4-a716-446655440008',
 '123e4567-e89b-12d3-a456-426614174004',
 'Prednisone', '40mg', 'Once daily', 'oral', 'Dr. Robert Martinez',
 '2024-01-05 09:30:00+00', '2024-01-05 09:30:00+00', false,
 'Take for 5 days only, take with food', 0, '5 tablets'),

('770e8400-e29b-41d4-a716-446655440009',
 '123e4567-e89b-12d3-a456-426614174004',
 'Azithromycin', '250mg', 'Once daily', 'oral', 'Dr. Robert Martinez',
 '2024-01-05 09:30:00+00', '2024-01-05 09:30:00+00', false,
 'Take for 5 days, complete entire course', 0, '5 tablets');

-- Lisa Anderson Medications (Vitamins)
INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, route, prescribed_by, prescribed_date, start_date, is_active, instructions, refills, quantity) VALUES
('770e8400-e29b-41d4-a716-446655440010',
 '123e4567-e89b-12d3-a456-426614174005',
 'Multivitamin', '1 tablet', 'Once daily', 'oral', 'Dr. Jennifer Davis',
 '2024-01-12 10:00:00+00', '2024-01-12 10:00:00+00', true,
 'Take with breakfast', 11, '90 tablets');

-- =============================================================================
-- APPOINTMENTS (Future and Recent)
-- =============================================================================

-- Sarah Johnson Appointments
INSERT INTO appointments (id, patient_id, provider_id, scheduled_date, duration_minutes, type, reason, status, notes) VALUES
('880e8400-e29b-41d4-a716-446655440001',
 '123e4567-e89b-12d3-a456-426614174001',
 'Dr. Sarah Smith',
 '2024-04-15 10:00:00+00', 30, 'follow-up',
 'Diabetes management follow-up', 'Scheduled',
 '3-month diabetes check, review HbA1c results'),

('880e8400-e29b-41d4-a716-446655440002',
 '123e4567-e89b-12d3-a456-426614174001',
 'Diabetes Educator',
 '2024-02-10 14:00:00+00', 60, 'education',
 'Diabetes education session', 'Scheduled',
 'Advanced carb counting and insulin techniques');

-- Michael Chen Appointments
INSERT INTO appointments (id, patient_id, provider_id, scheduled_date, duration_minutes, type, reason, status, notes) VALUES
('880e8400-e29b-41d4-a716-446655440003',
 '123e4567-e89b-12d3-a456-426614174002',
 'Dr. Elizabeth Carter (Cardiology)',
 '2024-02-05 09:00:00+00', 45, 'cardiology',
 'Post-MI cardiology follow-up', 'Scheduled',
 'Echo, stress test, medication adjustment'),

('880e8400-e29b-41d4-a716-446655440004',
 '123e4567-e89b-12d3-a456-426614174002',
 'Dr. Sarah Smith',
 '2024-03-15 11:00:00+00', 30, 'follow-up',
 'Primary care follow-up post-heart attack', 'Scheduled',
 'Review recovery, medications, lifestyle');

-- Emily Rodriguez Appointments
INSERT INTO appointments (id, patient_id, provider_id, scheduled_date, duration_minutes, type, reason, status, notes) VALUES
('880e8400-e29b-41d4-a716-446655440005',
 '123e4567-e89b-12d3-a456-426614174003',
 'Dr. Patricia Wilson',
 '2024-02-20 16:00:00+00', 30, 'telehealth',
 'Mental health follow-up via telehealth', 'Scheduled',
 'Check medication response, anxiety management'),

('880e8400-e29b-41d4-a716-446655440006',
 '123e4567-e89b-12d3-a456-426614174003',
 'Sarah Thompson, LCSW',
 '2024-02-08 13:00:00+00', 50, 'therapy',
 'Cognitive Behavioral Therapy session', 'Scheduled',
 'CBT for anxiety and panic management');

-- David Thompson Appointments
INSERT INTO appointments (id, patient_id, provider_id, scheduled_date, duration_minutes, type, reason, status, notes) VALUES
('880e8400-e29b-41d4-a716-446655440007',
 '123e4567-e89b-12d3-a456-426614174004',
 'Dr. Robert Martinez',
 '2024-03-05 14:30:00+00', 30, 'follow-up',
 'COPD follow-up after exacerbation', 'Scheduled',
 'Check recovery, spirometry, smoking cessation'),

('880e8400-e29b-41d4-a716-446655440008',
 '123e4567-e89b-12d3-a456-426614174004',
 'Pulmonary Rehabilitation',
 '2024-02-12 10:00:00+00', 90, 'pulm-rehab',
 'Pulmonary rehabilitation session', 'Scheduled',
 'Exercise training and breathing techniques');

-- Lisa Anderson Appointments
INSERT INTO appointments (id, patient_id, provider_id, scheduled_date, duration_minutes, type, reason, status, notes) VALUES
('880e8400-e29b-41d4-a716-446655440009',
 '123e4567-e89b-12d3-a456-426614174005',
 'Dr. Jennifer Davis',
 '2025-01-12 10:00:00+00', 30, 'annual-physical',
 'Annual wellness examination', 'Scheduled',
 'Next year annual physical, all preventive care'),

('880e8400-e29b-41d4-a716-446655440010',
 '123e4567-e89b-12d3-a456-426614174005',
 'Radiology',
 '2024-12-15 08:00:00+00', 30, 'mammogram',
 'Screening mammogram', 'Scheduled',
 'First screening mammogram at age 33');

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DEMO PATIENT DATA CREATED SUCCESSFULLY!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Created 5 patients with comprehensive medical histories:';
    RAISE NOTICE ' ';
    RAISE NOTICE '1. Sarah Johnson (38F) - Diabetes Management';
    RAISE NOTICE '   • Type 2 diabetes, recent HbA1c 7.2%%, on metformin';
    RAISE NOTICE '   • 2 encounters, 3 lab results, 2 medications, 2 appointments';
    RAISE NOTICE ' ';
    RAISE NOTICE '2. Michael Chen (45M) - Heart Disease'; 
    RAISE NOTICE '   • Recent NSTEMI, elevated troponin, on dual antiplatelet therapy';
    RAISE NOTICE '   • 2 encounters, 3 lab results, 3 medications, 2 appointments';
    RAISE NOTICE ' ';
    RAISE NOTICE '3. Emily Rodriguez (31F) - Mental Health';
    RAISE NOTICE '   • Generalized anxiety disorder, on sertraline 75mg';
    RAISE NOTICE '   • 2 encounters, 1 lab result, 1 medication, 2 appointments';
    RAISE NOTICE ' ';
    RAISE NOTICE '4. David Thompson (58M) - COPD'; 
    RAISE NOTICE '   • Recent COPD exacerbation, on albuterol and antibiotics';
    RAISE NOTICE '   • 2 encounters, 2 lab results, 3 medications, 2 appointments';
    RAISE NOTICE ' ';
    RAISE NOTICE '5. Lisa Anderson (33F) - Preventive Care';
    RAISE NOTICE '   • Healthy young adult, up to date on preventive care';
    RAISE NOTICE '   • 1 encounter, 2 lab results, 1 medication, 2 appointments';
    RAISE NOTICE ' ';
    RAISE NOTICE 'Perfect for testing Cedar API and Agentic AI features!';
    RAISE NOTICE '• Multiple critical lab values for alerts testing';
    RAISE NOTICE '• Diverse medical conditions for AI summarization';
    RAISE NOTICE '• Recent and future appointments for scheduling';
    RAISE NOTICE '• Comprehensive medication lists for interaction checking';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Test patient ID: 123e4567-e89b-12d3-a456-426614174001 (Sarah Johnson)';
    RAISE NOTICE 'Use this ID in your Cedar API tests and CedarPanel!';
    RAISE NOTICE '=============================================================================';
END
$$;