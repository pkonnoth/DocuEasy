// Cedar Schema for EMR Co-Pilot
// Defines the entity types, actions, and relationships for healthcare authorization

// Principal types (who can perform actions)
entity User = {
  "role": String,
  "specialty": String,
  "license_number": String,
  "department": String,
  "is_active": Bool,
};

// Resource types (what actions are performed on)
entity Patient = {
  "medical_record_number": String,
  "assigned_provider": User,
  "care_team": Set<User>,
  "is_active": Bool,
  "privacy_level": String, // "standard", "restricted", "vip"
};

entity Encounter = {
  "patient": Patient,
  "provider": User,
  "type": String, // "office_visit", "emergency", "telehealth"
  "status": String, // "scheduled", "in_progress", "completed"
  "date": String,
};

entity Medication = {
  "patient": Patient,
  "prescribed_by": User,
  "is_controlled": Bool,
  "is_active": Bool,
};

entity LabResult = {
  "patient": Patient,
  "ordered_by": User,
  "status": String, // "normal", "abnormal", "critical"
  "category": String,
};

entity Appointment = {
  "patient": Patient,
  "provider": User,
  "type": String,
  "status": String,
};

entity AgentAction = {
  "patient": Patient,
  "user": User,
  "type": String, // "summary", "literature", "draft_note"
  "status": String,
  "confirmation_required": Bool,
};

// Actions that can be performed
action ViewPatient appliesTo {
  principal: [User],
  resource: [Patient]
};

action UpdatePatient appliesTo {
  principal: [User],
  resource: [Patient]
};

action CreateEncounter appliesTo {
  principal: [User],
  resource: [Patient]
};

action ViewEncounter appliesTo {
  principal: [User],
  resource: [Encounter]
};

action UpdateEncounter appliesTo {
  principal: [User],
  resource: [Encounter]
};

action PrescribeMedication appliesTo {
  principal: [User],
  resource: [Patient]
};

action ViewMedication appliesTo {
  principal: [User],
  resource: [Medication]
};

action UpdateMedication appliesTo {
  principal: [User],
  resource: [Medication]
};

action OrderLab appliesTo {
  principal: [User],
  resource: [Patient]
};

action ViewLabResult appliesTo {
  principal: [User],
  resource: [LabResult]
};

action UpdateLabResult appliesTo {
  principal: [User],
  resource: [LabResult]
};

action ScheduleAppointment appliesTo {
  principal: [User],
  resource: [Patient]
};

action ViewAppointment appliesTo {
  principal: [User],
  resource: [Appointment]
};

action UpdateAppointment appliesTo {
  principal: [User],
  resource: [Appointment]
};

action UseAIAgent appliesTo {
  principal: [User],
  resource: [Patient]
};

action ConfirmAIAction appliesTo {
  principal: [User],
  resource: [AgentAction]
};

action ViewAuditLog appliesTo {
  principal: [User],
  resource: [Patient]
};