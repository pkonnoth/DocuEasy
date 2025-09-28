// Patient Management Agents using Mastra
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { patientTools } from '../tools/patientTools.js';

// 1. Alert Triage Agent - Processes and summarizes patient alerts
export const alertTriageAgent = new Agent({
  name: 'Alert Triage Agent',
  instructions: `
    You are Dr. ALERT, a specialized triage assistant for patient notifications and alerts.
    
    CORE FUNCTIONS:
    1. Fetch and analyze patient alerts (unreviewed labs, overdue follow-ups)
    2. Prioritize alerts by clinical significance
    3. Provide clear action recommendations
    4. Present information in a user-friendly format
    
    ANALYSIS APPROACH:
    - Focus on critical and high-priority alerts first
    - Consider patient context (age, conditions, medications)
    - Provide specific, actionable recommendations
    - Use clear medical terminology with explanations
    
    OUTPUT FORMAT:
    🚨 CRITICAL - Immediate action required
    ⚠️ HIGH - Follow-up needed soon  
    ℹ️ MEDIUM - Routine follow-up
    
    Always include:
    - Alert summary with priority level
    - Clinical significance explanation
    - Specific recommended actions
    - Timeline for follow-up
  `,
  model: openai('gpt-4o-mini'),
  tools: {
    getPatientAlerts: patientTools.getPatientAlerts,
    markLabReviewed: patientTools.markLabReviewed,
  },
});

// 2. Follow-up Agent - Analyzes need for follow-ups and schedules appointments
export const followUpAgent = new Agent({
  name: 'Follow-up Agent',
  instructions: `
    You are Dr. FOLLOW, a patient care coordinator specializing in follow-up care management.
    
    CORE FUNCTIONS:
    1. Analyze patient data to determine follow-up needs
    2. Recommend appropriate follow-up timing and type
    3. Propose available appointment slots
    4. Coordinate appointment scheduling with confirmations
    
    ASSESSMENT CRITERIA:
    - Review recent encounters and treatment plans
    - Consider medication changes and monitoring needs
    - Evaluate lab results requiring follow-up
    - Account for chronic condition management
    
    SCHEDULING APPROACH:
    - Suggest appropriate appointment types (follow-up, lab review, consultation)
    - Provide multiple time slot options
    - Explain the clinical rationale for follow-up
    - Ensure proper timing based on medical needs
    
    OUTPUT FORMAT:
    📅 Recommended follow-up with clinical reasoning
    ⏰ Suggested timeframe (urgent, 1-2 weeks, monthly)
    👩‍⚕️ Provider recommendations
    📝 Appointment type and duration
  `,
  model: openai('gpt-4o-mini'),
  tools: {
    getPatientAlerts: patientTools.getPatientAlerts,
    proposeSlots: patientTools.proposeSlots,
    createAppointment: patientTools.createAppointment,
    draftPatientReminder: patientTools.draftPatientReminder,
  },
});

// Agent orchestrator for coordinated patient management
export class PatientManagementOrchestrator {
  constructor() {
    this.alertAgent = alertTriageAgent;
    this.followUpAgent = followUpAgent;
  }
  
  // Run alert triage for a patient
  async runAlertTriage(patientId) {
    try {
      console.log(`🚨 Running alert triage for patient ${patientId.substring(0, 8)}...`);
      
      const response = await this.alertAgent.chat([{
        role: 'user',
        content: `Please analyze alerts for patient ${patientId}. Use the getPatientAlerts tool to fetch current alerts, then provide a summary with recommendations for each alert. Focus on priority and actionable steps.`
      }]);
      
      return {
        type: 'alert_triage',
        patientId,
        result: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in alert triage:', error);
      return { error: 'Alert triage failed', details: error.message };
    }
  }
  
  // Run follow-up analysis and scheduling
  async runFollowUpAnalysis(patientId, preferredWindow = 'next_week') {
    try {
      console.log(`📅 Running follow-up analysis for patient ${patientId.substring(0, 8)}...`);
      
      const response = await this.followUpAgent.chat([{
        role: 'user',
        content: `Please analyze patient ${patientId} to determine if follow-up care is needed. First check for alerts using getPatientAlerts, then if follow-up is recommended, use proposeSlots to suggest appointment times. Consider the patient's recent encounters and current status. Preferred scheduling window: ${preferredWindow}.`
      }]);
      
      return {
        type: 'followup_analysis',
        patientId,
        result: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in follow-up analysis:', error);
      return { error: 'Follow-up analysis failed', details: error.message };
    }
  }
  
  // Schedule appointment (with confirmation)
  async scheduleAppointment(patientId, appointmentDetails) {
    try {
      console.log(`📅 Scheduling appointment for patient ${patientId.substring(0, 8)}...`);
      
      const { slotId, datetime, appointmentType, reason, provider } = appointmentDetails;
      
      const response = await this.followUpAgent.chat([{
        role: 'user',
        content: `Please schedule an appointment using the createAppointment tool with these details:
        - Patient ID: ${patientId}
        - Slot ID: ${slotId}
        - Date/Time: ${datetime}
        - Appointment Type: ${appointmentType}
        - Reason: ${reason}
        - Provider: ${provider}
        
        This requires user confirmation, so set confirm=true when calling the tool.`
      }]);
      
      return {
        type: 'appointment_scheduling',
        patientId,
        result: response,
        appointmentDetails,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      return { error: 'Appointment scheduling failed', details: error.message };
    }
  }
  
  // Mark lab as reviewed (with confirmation)
  async reviewLab(patientId, labId, reviewNotes = '') {
    try {
      console.log(`✅ Reviewing lab ${labId} for patient ${patientId.substring(0, 8)}...`);
      
      const response = await this.alertAgent.chat([{
        role: 'user',
        content: `Please mark lab result ${labId} as reviewed for patient ${patientId} using the markLabReviewed tool. Review notes: "${reviewNotes}". This requires user confirmation, so set confirm=true when calling the tool.`
      }]);
      
      return {
        type: 'lab_review',
        patientId,
        labId,
        result: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error reviewing lab:', error);
      return { error: 'Lab review failed', details: error.message };
    }
  }
  
  // Draft patient reminder
  async draftReminder(appointmentId, patientId, reminderType, appointmentDetails) {
    try {
      console.log(`📱 Drafting ${reminderType} reminder for appointment ${appointmentId}...`);
      
      const response = await this.followUpAgent.chat([{
        role: 'user',
        content: `Please draft a ${reminderType} reminder for appointment ${appointmentId} for patient ${patientId}. Use the draftPatientReminder tool with appointment details: "${appointmentDetails}".`
      }]);
      
      return {
        type: 'reminder_draft',
        patientId,
        appointmentId,
        reminderType,
        result: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error drafting reminder:', error);
      return { error: 'Reminder drafting failed', details: error.message };
    }
  }
  
  // Run comprehensive patient management workflow
  async runComprehensiveWorkflow(patientId) {
    console.log(`🔄 Running comprehensive patient management for ${patientId.substring(0, 8)}...`);
    
    const [alertResult, followUpResult] = await Promise.all([
      this.runAlertTriage(patientId),
      this.runFollowUpAnalysis(patientId)
    ]);
    
    return {
      type: 'comprehensive_patient_management',
      patientId,
      alertTriage: alertResult,
      followUpAnalysis: followUpResult,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const patientOrchestrator = new PatientManagementOrchestrator();