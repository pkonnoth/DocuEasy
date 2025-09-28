// Mastra Tools for Patient Follow-up and Scheduling Demo
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getPatientWithData } from '../../lib/api/patients.js';

// 1. READ TOOL - Get Patient Alerts (unreviewed labs/overdue follow-ups)
export const getPatientAlerts = createTool({
  id: 'get_patient_alerts',
  inputSchema: z.object({
    patientId: z.string().describe('The patient ID to get alerts for'),
  }),
  description: 'Fetches unreviewed lab results and overdue follow-ups for a patient',
  execute: async ({ context: { patientId } }) => {
    try {
      console.log(`🚨 Fetching alerts for patient ${patientId.substring(0, 8)}...`);
      
      // Get patient data including lab results
      const patientData = await getPatientWithData(patientId);
      if (!patientData) {
        return { error: 'Patient not found' };
      }
      
      const alerts = [];
      
      // Check for unreviewed/abnormal lab results
      const labResults = patientData.labResults || [];
      labResults.forEach(lab => {
        if (lab.status === 'Abnormal' || lab.status === 'Critical') {
          const isHighPriority = lab.status === 'Critical' || 
            (lab.test_name.includes('LDL') && parseFloat(lab.value) > 160) ||
            (lab.test_name.includes('Glucose') && parseFloat(lab.value) > 140) ||
            (lab.test_name.includes('Creatinine') && parseFloat(lab.value) > 1.5);
            
          alerts.push({
            type: 'lab_alert',
            priority: isHighPriority ? 'critical' : 'high',
            message: `${lab.test_name}: ${lab.value} ${lab.unit} (${lab.status})`,
            details: {
              testName: lab.test_name,
              value: lab.value,
              unit: lab.unit,
              referenceRange: lab.reference_range,
              resultDate: lab.result_date,
              status: lab.status,
              labId: lab.id
            },
            actionRequired: isHighPriority ? 'immediate_review' : 'follow_up_needed'
          });
        }
      });
      
      // Check for overdue follow-ups (encounters > 30 days old with follow-up plans)
      const encounters = patientData.encounters || [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      encounters.forEach(encounter => {
        const encounterDate = new Date(encounter.encounter_date);
        if (encounterDate < thirtyDaysAgo && encounter.plan?.toLowerCase().includes('follow')) {
          alerts.push({
            type: 'followup_alert',
            priority: 'medium',
            message: `Follow-up overdue: ${encounter.type} from ${encounter.encounter_date}`,
            details: {
              encounterId: encounter.id,
              encounterType: encounter.type,
              encounterDate: encounter.encounter_date,
              plan: encounter.plan,
              provider: encounter.provider
            },
            actionRequired: 'schedule_followup'
          });
        }
      });
      
      return {
        patientId,
        patientName: `${patientData.first_name} ${patientData.last_name}`,
        alertCount: alerts.length,
        criticalCount: alerts.filter(a => a.priority === 'critical').length,
        alerts: alerts.sort((a, b) => {
          const priorityOrder = { critical: 3, high: 2, medium: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
      };
    } catch (error) {
      console.error('Error fetching patient alerts:', error);
      return { error: 'Failed to fetch patient alerts', details: error.message };
    }
  },
});

// 2. READ TOOL - Propose Available Appointment Slots
export const proposeSlots = createTool({
  id: 'propose_slots',
  inputSchema: z.object({
    patientId: z.string().describe('The patient ID to schedule for'),
    window: z.string().optional().describe('Time window preference (e.g., "next_week", "2_weeks")'),
    appointmentType: z.string().optional().describe('Type of appointment (e.g., "follow_up", "lab_review")'),
  }),
  description: 'Proposes 3 available appointment slots for a patient',
  execute: async ({ context: { patientId, window = 'next_week', appointmentType = 'follow_up' } }) => {
    try {
      console.log(`📅 Proposing appointment slots for patient ${patientId.substring(0, 8)}...`);
      
      // Calculate date range based on window
      const startDate = new Date();
      const endDate = new Date();
      
      switch (window) {
        case 'next_week':
          startDate.setDate(startDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + 7);
          break;
        case '2_weeks':
          startDate.setDate(startDate.getDate() + 7);
          endDate.setDate(endDate.getDate() + 14);
          break;
        default:
          startDate.setDate(startDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + 7);
      }
      
      // Generate available slots (mock data - in real app, check calendar)
      const availableSlots = [
        {
          slotId: `slot_${Date.now()}_1`,
          datetime: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000), // Tue 10:30 AM
          displayTime: 'Tuesday 10:30 AM',
          duration: 30,
          provider: 'Dr. Jennifer Davis',
          appointmentType
        },
        {
          slotId: `slot_${Date.now()}_2`,
          datetime: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Wed 2:00 PM
          displayTime: 'Wednesday 2:00 PM',
          duration: 30,
          provider: 'Dr. Jennifer Davis',
          appointmentType
        },
        {
          slotId: `slot_${Date.now()}_3`,
          datetime: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Thu 9:00 AM
          displayTime: 'Thursday 9:00 AM',
          duration: 30,
          provider: 'Dr. Michael Johnson',
          appointmentType
        }
      ];
      
      return {
        patientId,
        appointmentType,
        window,
        proposedSlots: availableSlots,
        message: `Found ${availableSlots.length} available slots for ${appointmentType} appointment`
      };
    } catch (error) {
      console.error('Error proposing appointment slots:', error);
      return { error: 'Failed to propose appointment slots', details: error.message };
    }
  },
});

// 3. ACTION TOOL - Mark Lab as Reviewed (with confirmation)
export const markLabReviewed = createTool({
  id: 'mark_lab_reviewed',
  inputSchema: z.object({
    labId: z.string().describe('The lab result ID to mark as reviewed'),
    patientId: z.string().describe('The patient ID'),
    reviewNotes: z.string().optional().describe('Optional notes about the review'),
    confirm: z.boolean().default(false).describe('User confirmation required'),
  }),
  description: 'Marks a lab result as reviewed after user confirmation',
  execute: async ({ context: { labId, patientId, reviewNotes, confirm } }) => {
    if (!confirm) {
      return {
        requiresConfirmation: true,
        message: 'Please confirm marking this lab result as reviewed',
        action: 'mark_lab_reviewed',
        params: { labId, patientId, reviewNotes }
      };
    }
    
    try {
      console.log(`✅ Marking lab ${labId} as reviewed for patient ${patientId.substring(0, 8)}...`);
      
      // In real implementation, update database
      // await updateLabResult(labId, { reviewed: true, reviewedAt: new Date(), reviewNotes });
      
      // Log audit entry
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
        success: true,
        message: 'Lab result marked as reviewed',
        labId,
        patientId,
        auditEntry,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error marking lab as reviewed:', error);
      return { error: 'Failed to mark lab as reviewed', details: error.message };
    }
  },
});

// 4. ACTION TOOL - Create Appointment (with confirmation)
export const createAppointment = createTool({
  id: 'create_appointment',
  inputSchema: z.object({
    patientId: z.string().describe('The patient ID'),
    slotId: z.string().describe('The selected appointment slot ID'),
    datetime: z.string().describe('The appointment date and time'),
    appointmentType: z.string().describe('Type of appointment'),
    reason: z.string().describe('Reason for the appointment'),
    provider: z.string().describe('Healthcare provider name'),
    confirm: z.boolean().default(false).describe('User confirmation required'),
  }),
  description: 'Creates a new appointment after user confirmation',
  execute: async ({ context: { patientId, slotId, datetime, appointmentType, reason, provider, confirm } }) => {
    if (!confirm) {
      return {
        requiresConfirmation: true,
        message: `Confirm scheduling ${appointmentType} appointment for ${datetime}`,
        action: 'create_appointment',
        params: { patientId, slotId, datetime, appointmentType, reason, provider }
      };
    }
    
    try {
      console.log(`📅 Creating appointment for patient ${patientId.substring(0, 8)}...`);
      
      const appointmentId = `appt_${Date.now()}_${patientId.substring(0, 8)}`;
      
      // In real implementation, save to database
      const appointmentData = {
        id: appointmentId,
        patientId,
        scheduledFor: datetime,
        appointmentType,
        reason,
        provider,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      // Log audit entry
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'create_appointment',
        userId: 'demo_user',
        patientId,
        details: {
          appointmentId,
          scheduledFor: datetime,
          appointmentType,
          reason,
          provider,
          confirmed: true
        }
      };
      
      console.log('📋 Audit log entry:', auditEntry);
      
      return {
        success: true,
        message: `Appointment scheduled for ${datetime}`,
        appointment: appointmentData,
        auditEntry,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { error: 'Failed to create appointment', details: error.message };
    }
  },
});

// 5. OPTIONAL ACTION TOOL - Draft Patient Reminder
export const draftPatientReminder = createTool({
  id: 'draft_patient_reminder',
  inputSchema: z.object({
    appointmentId: z.string().describe('The appointment ID'),
    patientId: z.string().describe('The patient ID'),
    reminderType: z.string().describe('Type of reminder (sms, email)'),
    appointmentDetails: z.string().describe('Appointment details for the reminder'),
  }),
  description: 'Drafts a patient reminder message (saves as draft, no external send)',
  execute: async ({ context: { appointmentId, patientId, reminderType, appointmentDetails } }) => {
    try {
      console.log(`📱 Drafting ${reminderType} reminder for appointment ${appointmentId}...`);
      
      const reminderMessage = reminderType === 'sms' 
        ? `Hi! This is a reminder about your upcoming appointment: ${appointmentDetails}. Reply CONFIRM to confirm or call us at (555) 123-4567.`
        : `Dear Patient,\n\nThis is a friendly reminder about your upcoming appointment:\n\n${appointmentDetails}\n\nPlease confirm your attendance by replying to this email or calling our office.\n\nBest regards,\nYour Healthcare Team`;
      
      const draftData = {
        id: `draft_${Date.now()}_${patientId.substring(0, 8)}`,
        appointmentId,
        patientId,
        reminderType,
        message: reminderMessage,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      
      console.log('📝 Draft reminder saved:', draftData);
      
      return {
        success: true,
        message: `${reminderType.toUpperCase()} reminder drafted`,
        draft: draftData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error drafting patient reminder:', error);
      return { error: 'Failed to draft patient reminder', details: error.message };
    }
  },
});

// Export all tools
export const patientTools = {
  getPatientAlerts,
  proposeSlots,
  markLabReviewed,
  createAppointment,
  draftPatientReminder
};