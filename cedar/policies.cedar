// Cedar Policies for EMR Co-Pilot
// Defines authorization rules for healthcare access control

// Policy 1: Primary care providers can view/update their assigned patients
permit (
  principal is User,
  action in [ViewPatient, UpdatePatient, CreateEncounter, ViewEncounter, UpdateEncounter],
  resource is Patient
) when {
  principal.role == "provider" &&
  principal.is_active == true &&
  resource.assigned_provider == principal
};

// Policy 2: Care team members can view assigned patients
permit (
  principal is User,
  action == ViewPatient,
  resource is Patient
) when {
  principal.role in ["provider", "nurse", "resident"] &&
  principal.is_active == true &&
  resource.care_team.contains(principal)
};

// Policy 3: Doctors can prescribe medications for their patients
permit (
  principal is User,
  action in [PrescribeMedication, ViewMedication],
  resource is Patient
) when {
  principal.role == "provider" &&
  principal.is_active == true &&
  (resource.assigned_provider == principal || resource.care_team.contains(principal))
};

// Policy 4: Only prescribing doctor can modify their medications
permit (
  principal is User,
  action == UpdateMedication,
  resource is Medication
) when {
  principal.role == "provider" &&
  principal.is_active == true &&
  resource.prescribed_by == principal
};

// Policy 5: Providers can view encounters for their patients
permit (
  principal is User,
  action in [ViewEncounter, UpdateEncounter],
  resource is Encounter
) when {
  principal.role in ["provider", "nurse"] &&
  principal.is_active == true &&
  (resource.patient.assigned_provider == principal || 
   resource.patient.care_team.contains(principal) ||
   resource.provider == principal)
};

// Policy 6: Lab technicians can view/update lab results
permit (
  principal is User,
  action in [ViewLabResult, UpdateLabResult],
  resource is LabResult
) when {
  principal.role in ["provider", "lab_tech", "nurse"] &&
  principal.is_active == true &&
  (resource.patient.assigned_provider == principal || 
   resource.patient.care_team.contains(principal) ||
   resource.ordered_by == principal)
};

// Policy 7: Emergency access - emergency staff can view any patient
permit (
  principal is User,
  action in [ViewPatient, ViewEncounter, ViewMedication, ViewLabResult],
  resource
) when {
  principal.role == "emergency_provider" &&
  principal.is_active == true &&
  principal.department == "emergency"
};

// Policy 8: Administrators can view audit logs for all patients
permit (
  principal is User,
  action == ViewAuditLog,
  resource is Patient
) when {
  principal.role == "admin" &&
  principal.is_active == true
};

// Policy 9: AI Agent usage restricted to licensed providers
permit (
  principal is User,
  action in [UseAIAgent, ConfirmAIAction],
  resource
) when {
  principal.role in ["provider", "resident"] &&
  principal.is_active == true &&
  principal.license_number != "" &&
  (
    (resource has assigned_provider && resource.assigned_provider == principal) ||
    (resource has care_team && resource.care_team.contains(principal)) ||
    (resource has patient && resource.patient.assigned_provider == principal) ||
    (resource has patient && resource.patient.care_team.contains(principal))
  )
};

// Policy 10: Nurses can update vital signs and basic encounter data
permit (
  principal is User,
  action == UpdateEncounter,
  resource is Encounter
) when {
  principal.role == "nurse" &&
  principal.is_active == true &&
  (resource.patient.assigned_provider.department == principal.department ||
   resource.patient.care_team.contains(principal))
};

// Policy 11: Scheduling staff can manage appointments
permit (
  principal is User,
  action in [ScheduleAppointment, ViewAppointment, UpdateAppointment],
  resource
) when {
  principal.role in ["scheduler", "provider", "nurse"] &&
  principal.is_active == true
};

// Policy 12: Restrict access to VIP patients
forbid (
  principal is User,
  action,
  resource is Patient
) when {
  resource.privacy_level == "vip" &&
  principal.role != "provider" &&
  !(resource.assigned_provider == principal || resource.care_team.contains(principal))
};

// Policy 13: Controlled substances require special authorization
forbid (
  principal is User,
  action in [PrescribeMedication, UpdateMedication],
  resource
) when {
  (resource has is_controlled && resource.is_controlled == true) &&
  !(principal.specialty in ["pain_management", "psychiatry", "anesthesiology", "oncology"])
};

// Policy 14: Inactive users cannot access anything
forbid (
  principal is User,
  action,
  resource
) when {
  principal.is_active == false
};