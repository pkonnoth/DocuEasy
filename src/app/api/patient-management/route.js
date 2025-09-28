// API endpoint for Patient Management (simplified to avoid stream/web issues)
import { getPatientWithData } from '../../../lib/api/patients.js';

export async function POST(request) {
  try {
    const { patientId, action, ...params } = await request.json();
    
    console.log(`🏥 Patient Management API called - Action: ${action}, Patient: ${patientId?.substring(0, 8)}...`);
    
    if (!patientId) {
      return new Response(JSON.stringify({ 
        error: 'Patient ID is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get patient data for context
    const patientData = await getPatientWithData(patientId);
    if (!patientData) {
      return new Response(JSON.stringify({ 
        error: 'Patient not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let result;
    
    switch (action) {
      case 'alert_triage':
        result = await handleAlertTriage(patientId, patientData);
        break;
        
      case 'follow_up_analysis':
        result = await handleFollowUpAnalysis(patientId, patientData, params.preferredWindow);
        break;
        
      case 'schedule_appointment':
        result = await handleScheduleAppointment(patientId, patientData, params.appointmentDetails);
        break;
        
      case 'review_lab':
        result = await handleReviewLab(patientId, params.labId, params.reviewNotes);
        break;
        
      case 'draft_reminder':
        result = await handleDraftReminder(patientId, params.appointmentId, params.reminderType, params.appointmentDetails);
        break;
        
      case 'comprehensive_workflow':
        result = await handleComprehensiveWorkflow(patientId, patientData);
        break;
        
      default:
        return new Response(JSON.stringify({ 
          error: 'Invalid action. Must be: alert_triage, follow_up_analysis, schedule_appointment, review_lab, draft_reminder, or comprehensive_workflow' 
        }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (result.error) {
      console.error('🚨 Patient Management Error:', result);
      return new Response(JSON.stringify(result), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`✅ Patient Management completed successfully - Action: ${action}`);
    
    return new Response(JSON.stringify({
      success: true,
      action,
      patientId,
      result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('🚨 Patient Management API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Patient management processing failed', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const action = searchParams.get('action') || 'alert_triage';
  
  if (!patientId) {
    return new Response(JSON.stringify({ 
      error: 'Patient ID is required as query parameter' 
    }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Forward to POST handler
  return POST({ 
    json: async () => ({ patientId, action })
  });
}

// Handler functions (simplified for demo without Mastra streams)
async function handleAlertTriage(patientId, patientData) {
  console.log(`🚨 Running alert triage for patient ${patientId.substring(0, 8)}...`);
  
  // Simulate alert analysis
  const alerts = [];
  const labResults = patientData.labResults || [];
  
  // Check for abnormal lab results
  labResults.forEach(lab => {
    if (lab.status === 'Abnormal' || lab.status === 'Critical') {
      const isHighPriority = lab.status === 'Critical' || 
        (lab.test_name.includes('LDL') && parseFloat(lab.value) > 160) ||
        (lab.test_name.includes('Glucose') && parseFloat(lab.value) > 140);
        
      alerts.push({
        type: 'lab_alert',
        priority: isHighPriority ? 'critical' : 'high',
        message: `${lab.test_name}: ${lab.value} ${lab.unit} (${lab.status})`,
        details: lab,
        actionRequired: isHighPriority ? 'immediate_review' : 'follow_up_needed'
      });
    }
  });
  
  return {
    type: 'alert_triage',
    patientId,
    patientName: `${patientData.first_name} ${patientData.last_name}`,
    alertCount: alerts.length,
    criticalCount: alerts.filter(a => a.priority === 'critical').length,
    alerts: alerts.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
    result: alerts.length > 0 
      ? `🚨 Found ${alerts.length} alert(s) requiring attention. ${alerts.filter(a => a.priority === 'critical').length} critical alerts need immediate review.`
      : 'No alerts found requiring immediate attention.',
    timestamp: new Date().toISOString()
  };
}

async function handleFollowUpAnalysis(patientId, patientData, preferredWindow = 'next_week') {
  console.log(`📅 Running follow-up analysis for patient ${patientId.substring(0, 8)}...`);
  
  // Simulate follow-up analysis
  const recentEncounters = patientData.encounters?.slice(0, 2) || [];
  const hasRecentVisit = recentEncounters.length > 0;
  const needsFollowUp = hasRecentVisit && recentEncounters[0].plan?.toLowerCase().includes('follow');
  
  const recommendation = needsFollowUp 
    ? `📅 Recommended follow-up in 2 weeks for ${recentEncounters[0].assessment} monitoring and medication review.`
    : `📅 Routine follow-up recommended in 3-6 months based on current health status.`;
  
  return {
    type: 'followup_analysis',
    patientId,
    patientName: `${patientData.first_name} ${patientData.last_name}`,
    needsFollowUp,
    recommendation,
    preferredWindow,
    result: recommendation,
    timestamp: new Date().toISOString()
  };
}

async function handleScheduleAppointment(patientId, patientData, appointmentDetails) {
  console.log(`📅 Scheduling appointment for patient ${patientId.substring(0, 8)}...`);
  
  const appointmentId = `appt_${Date.now()}_${patientId.substring(0, 8)}`;
  
  // Simulate appointment creation
  const appointment = {
    id: appointmentId,
    patientId,
    ...appointmentDetails,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  // Create audit log entry
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: 'create_appointment',
    userId: 'demo_user',
    patientId,
    details: {
      appointmentId,
      ...appointmentDetails,
      confirmed: true
    }
  };
  
  console.log('📋 Audit log entry:', auditEntry);
  
  return {
    type: 'appointment_scheduling',
    patientId,
    appointment,
    auditEntry,
    result: `✅ Appointment scheduled successfully for ${appointmentDetails.datetime}`,
    timestamp: new Date().toISOString()
  };
}

async function handleReviewLab(patientId, labId, reviewNotes = '') {
  console.log(`✅ Reviewing lab ${labId} for patient ${patientId.substring(0, 8)}...`);
  
  // Create audit log entry
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: 'mark_lab_reviewed',
    userId: 'demo_user',
    patientId,
    details: {
      labId,
      reviewNotes: reviewNotes || 'Lab result reviewed',
      confirmed: true
    }
  };
  
  console.log('📋 Audit log entry:', auditEntry);
  
  return {
    type: 'lab_review',
    patientId,
    labId,
    auditEntry,
    result: '✅ Lab result marked as reviewed and logged in audit trail',
    timestamp: new Date().toISOString()
  };
}

async function handleDraftReminder(patientId, appointmentId, reminderType, appointmentDetails) {
  console.log(`📱 Drafting ${reminderType} reminder for appointment ${appointmentId}...`);
  
  const reminderMessage = reminderType === 'sms' 
    ? `Hi! This is a reminder about your upcoming appointment: ${appointmentDetails}. Reply CONFIRM to confirm or call us at (555) 123-4567.`
    : `Dear Patient,\n\nThis is a friendly reminder about your upcoming appointment:\n\n${appointmentDetails}\n\nPlease confirm your attendance by replying to this email or calling our office.\n\nBest regards,\nYour Healthcare Team`;
  
  const draft = {
    id: `draft_${Date.now()}_${patientId.substring(0, 8)}`,
    appointmentId,
    patientId,
    reminderType,
    message: reminderMessage,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  
  return {
    type: 'reminder_draft',
    patientId,
    appointmentId,
    draft,
    result: `📝 ${reminderType.toUpperCase()} reminder drafted successfully`,
    timestamp: new Date().toISOString()
  };
}

async function handleComprehensiveWorkflow(patientId, patientData) {
  console.log(`🔄 Running comprehensive patient management for ${patientId.substring(0, 8)}...`);
  
  const [alertResult, followUpResult] = await Promise.all([
    handleAlertTriage(patientId, patientData),
    handleFollowUpAnalysis(patientId, patientData)
  ]);
  
  return {
    type: 'comprehensive_patient_management',
    patientId,
    alertTriage: alertResult,
    followUpAnalysis: followUpResult,
    result: `🔄 Comprehensive analysis completed: ${alertResult.alertCount} alerts found, follow-up ${followUpResult.needsFollowUp ? 'recommended' : 'not immediately needed'}`,
    timestamp: new Date().toISOString()
  };
}
