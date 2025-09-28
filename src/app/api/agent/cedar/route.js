import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import AuditLogger from '@/utils/auditLogger';

// Request schema validation
const CedarRequestSchema = z.object({
  tool: z.enum(['get_patient_timeline', 'draft_progress_note', 'create_appointment']),
  args: z.object({}).passthrough(), // Will be validated per tool
  patient_id: z.string().uuid(),
  user_id: z.string().optional().default('demo-user-123'), // Match your auth-demo.js
  // Confirmation system fields
  confirmation_id: z.string().uuid().optional(), // For executing confirmed operations
  skip_confirmation: z.boolean().default(false) // For read-only operations
});

// Tool-specific argument schemas
const ToolSchemas = {
  get_patient_timeline: z.object({
    patient_id: z.string().uuid(),
    timeframe: z.enum(['7days', '30days', '90days', '1year']).default('30days'),
    include_types: z.array(z.enum(['encounters', 'labs', 'medications', 'appointments'])).optional()
  }),
  
  draft_progress_note: z.object({
    patient_id: z.string().uuid(),
    encounter_id: z.string().uuid().optional(),
    template: z.enum(['soap', 'brief', 'detailed']).default('soap'),
    context: z.string().optional()
  }),
  
  create_appointment: z.object({
    patient_id: z.string().uuid(),
    provider_id: z.string().uuid().optional(),
    appointment_type: z.string(),
    preferred_date: z.string().datetime().optional(),
    duration_minutes: z.number().min(15).max(180).default(30),
    reason: z.string().optional()
  })
};

// Tool configuration - determines which tools need confirmation
const ToolConfig = {
  get_patient_timeline: { 
    confirmation_required: false,
    risk_level: 'low',
    estimated_time: '<2s'
  },
  draft_progress_note: { 
    confirmation_required: false, // Creates draft only
    risk_level: 'low',
    estimated_time: '3-5s'
  },
  create_appointment: { 
    confirmation_required: true, // Write operation
    risk_level: 'medium',
    estimated_time: '2-3s'
  }
};

/**
 * POST /api/agent/cedar
 * Main endpoint for Cedar-OS tool execution with confirmation system
 */
export async function POST(request) {
  const startTime = new Date();
  let auditData = {
    action: null,
    tool_name: null,
    patient_id: null,
    user_id: null,
    result_status: 'failure',
    result_error_message: null
  };

  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest = CedarRequestSchema.parse(body);
    
    const { tool, args, patient_id, user_id, confirmation_id, skip_confirmation } = validatedRequest;
    
    // Update audit data
    auditData.action = `cedar_${tool}`;
    auditData.tool_name = tool;
    auditData.patient_id = patient_id;
    auditData.user_id = user_id;

    // Validate tool-specific arguments
    const toolSchema = ToolSchemas[tool];
    if (!toolSchema) {
      throw new Error(`Unsupported tool: ${tool}`);
    }
    
    const validatedArgs = toolSchema.parse(args);

    // Check user authentication and basic authorization
    const authResult = await validateUserAccess(user_id, patient_id, tool);
    if (!authResult.success) {
      auditData.result_error_message = authResult.error;
      throw new Error(authResult.error);
    }

    // Get tool configuration
    const toolConfig = ToolConfig[tool];
    
    // Handle confirmation workflow
    if (toolConfig.confirmation_required && !skip_confirmation && !confirmation_id) {
      // Tool requires confirmation - create pending operation
      const pendingOperation = await createPendingOperation({
        operation_type: tool,
        tool_name: tool,
        patient_id,
        user_id,
        operation_args: validatedArgs,
        risk_level: toolConfig.risk_level,
        estimated_duration: toolConfig.estimated_time
      });
      
      return NextResponse.json({
        success: true,
        requires_confirmation: true,
        pending_operation_id: pendingOperation.id,
        tool_config: toolConfig,
        operation: {
          tool,
          args: validatedArgs,
          patient_id,
          user_id
        },
        message: `${tool} requires user confirmation before execution`
      });
    }
    
    // If confirmation_id provided, validate it
    if (confirmation_id) {
      const confirmedOperation = await validateConfirmation(confirmation_id, user_id);
      if (!confirmedOperation) {
        throw new Error('Invalid or expired confirmation');
      }
    }

    // Execute the tool
    let result;
    switch (tool) {
      case 'get_patient_timeline':
        result = await executeGetPatientTimeline(validatedArgs);
        break;
      case 'draft_progress_note':
        result = await executeDraftProgressNote(validatedArgs);
        break;
      case 'create_appointment':
        result = await executeCreateAppointment(validatedArgs);
        break;
      default:
        throw new Error(`Tool implementation not found: ${tool}`);
    }

    // Update audit data with success
    auditData.result_status = 'success';
    auditData.result_data = {
      tool_executed: tool,
      execution_time_ms: new Date() - startTime,
      result_summary: result.summary || 'Tool executed successfully'
    };

    // Log successful execution
    await AuditLogger.log({
      actorUserId: user_id,
      action: auditData.action,
      toolName: auditData.tool_name,
      scopePatientId: auditData.patient_id,
      inputArguments: validatedArgs,
      resultStatus: auditData.result_status,
      resultData: auditData.result_data,
      completedAt: new Date(),
      durationMs: new Date() - startTime
    });

    return NextResponse.json({
      success: true,
      tool,
      result,
      execution_time_ms: new Date() - startTime
    });

  } catch (error) {
    console.error('Cedar API Error:', error);
    
    // Update audit data with error
    auditData.result_error_message = error.message;
    auditData.result_data = {
      error_type: error.constructor.name,
      execution_time_ms: new Date() - startTime
    };

    // Log failed execution
    if (auditData.action) {
      await AuditLogger.log({
        actorUserId: auditData.user_id,
        action: auditData.action,
        toolName: auditData.tool_name,
        scopePatientId: auditData.patient_id,
        inputArguments: {},
        resultStatus: auditData.result_status,
        resultData: auditData.result_data,
        resultErrorMessage: auditData.result_error_message,
        completedAt: new Date(),
        durationMs: new Date() - startTime
      });
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      execution_time_ms: new Date() - startTime
    }, { status: 400 });
  }
}

/**
 * Validate user access to patient and tool
 */
async function validateUserAccess(userId, patientId, tool) {
  try {
    // For demo: Simple validation - match your existing auth-demo.js system
    if (userId === 'demo-user-123') {
      return { 
        success: true, 
        user: { 
          id: 'demo-user-123', 
          role: 'admin',
          email: 'demo@emr.com',
          name: 'Dr. Demo User'
        } 
      };
    }

    // For future: Add real user validation here
    // TODO: Add Cedar policy engine validation here
    
    return { success: false, error: 'Invalid user for demo. Must be logged in with demo account.' };
  } catch (error) {
    return { success: false, error: `Access validation failed: ${error.message}` };
  }
}

/**
 * Tool Implementation: Get Patient Timeline
 */
async function executeGetPatientTimeline(args) {
  const { patient_id, timeframe, include_types } = args;
  
  // Calculate date range based on timeframe
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeframe) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  const timeline = {};

  // Get encounters if requested (default behavior)
  if (!include_types || include_types.includes('encounters')) {
    const { data: encounters } = await supabase
      .from('encounters')
      .select('*')
      .eq('patient_id', patient_id)
      .gte('encounter_date', startDate.toISOString())
      .lte('encounter_date', endDate.toISOString())
      .order('encounter_date', { ascending: false });
    
    timeline.encounters = encounters || [];
  }

  // Get labs if requested
  if (!include_types || include_types.includes('labs')) {
    const { data: labs } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patient_id)
      .gte('result_date', startDate.toISOString())
      .lte('result_date', endDate.toISOString())
      .order('result_date', { ascending: false });
    
    timeline.labs = labs || [];
  }

  // Get medications if requested
  if (!include_types || include_types.includes('medications')) {
    const { data: medications } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patient_id)
      .gte('prescribed_date', startDate.toISOString())
      .order('prescribed_date', { ascending: false });
    
    timeline.medications = medications || [];
  }

  // Get appointments if requested
  if (!include_types || include_types.includes('appointments')) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patient_id)
      .gte('scheduled_date', startDate.toISOString())
      .order('scheduled_date', { ascending: false });
    
    timeline.appointments = appointments || [];
  }

  return {
    patient_id,
    timeframe,
    date_range: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    timeline,
    summary: `Retrieved ${timeframe} timeline with ${Object.keys(timeline).length} data types`,
    total_items: Object.values(timeline).reduce((sum, items) => sum + items.length, 0)
  };
}

/**
 * Tool Implementation: Draft Progress Note
 */
async function executeDraftProgressNote(args) {
  const { patient_id, encounter_id, template, context } = args;
  
  // For now, create a basic draft note structure
  // TODO: Integrate with OpenAI for AI-generated content
  
  const noteId = crypto.randomUUID();
  const noteContent = generateDraftNoteContent(template, context);
  
  // Save draft note to database
  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      id: noteId,
      patient_id,
      encounter_id,
      content: noteContent,
      status: 'draft',
      ai_generated: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save draft note: ${error.message}`);
  }

  return {
    note_id: noteId,
    patient_id,
    encounter_id,
    template,
    status: 'draft',
    content_preview: noteContent.substring(0, 200) + '...',
    summary: `Draft ${template.toUpperCase()} note created successfully`,
    ai_generated: true
  };
}

/**
 * Tool Implementation: Create Appointment
 */
async function executeCreateAppointment(args) {
  const { patient_id, provider_id, appointment_type, preferred_date, duration_minutes, reason } = args;
  
  // For MVP: Create appointment directly (confirmation will be handled by UI)
  // TODO: Add slot availability checking
  
  const appointmentId = crypto.randomUUID();
  const scheduledDate = preferred_date ? new Date(preferred_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 1 week from now
  
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      id: appointmentId,
      patient_id,
      provider_id: provider_id || null,
      scheduled_date: scheduledDate.toISOString(),
      duration_minutes,
      type: appointment_type,
      reason,
      status: 'scheduled',
      created_by_ai: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create appointment: ${error.message}`);
  }

  return {
    appointment_id: appointmentId,
    patient_id,
    provider_id,
    scheduled_date: scheduledDate.toISOString(),
    duration_minutes,
    type: appointment_type,
    status: 'scheduled',
    summary: `${appointment_type} appointment scheduled for ${scheduledDate.toLocaleDateString()}`,
    created_by_ai: true
  };
}

/**
 * Generate draft note content based on template
 */
function generateDraftNoteContent(template, context) {
  const timestamp = new Date().toLocaleDateString();
  
  switch (template) {
    case 'soap':
      return `SOAP Note - ${timestamp}

SUBJECTIVE:
${context ? `Context: ${context}` : '[To be completed by clinician]'}

OBJECTIVE:
- Vital signs: [To be recorded]
- Physical exam: [To be completed]

ASSESSMENT:
- [Clinical assessment to be documented]

PLAN:
- [Treatment plan to be outlined]

---
Note: This is an AI-generated draft. Please review and complete before finalizing.`;

    case 'brief':
      return `Brief Note - ${timestamp}

Patient Status: [To be documented]
Key Issues: ${context || '[To be identified]'}
Actions Taken: [To be recorded]
Follow-up: [To be scheduled]

---
Note: This is an AI-generated draft. Please review and complete before finalizing.`;

    case 'detailed':
      return `Detailed Progress Note - ${timestamp}

CHIEF COMPLAINT:
${context || '[To be documented]'}

HISTORY OF PRESENT ILLNESS:
[To be completed]

REVIEW OF SYSTEMS:
[To be documented]

PHYSICAL EXAMINATION:
[To be completed]

ASSESSMENT AND PLAN:
[To be outlined]

---
Note: This is an AI-generated draft. Please review and complete before finalizing.`;

    default:
      return `Progress Note - ${timestamp}

${context || 'Patient encounter documentation'}

[This is an AI-generated draft note. Please review and complete.]`;
  }
}

/**
 * Create a pending operation awaiting user confirmation
 */
async function createPendingOperation(operationData) {
  const { data, error } = await supabase
    .from('pending_operations')
    .insert({
      operation_type: operationData.operation_type,
      tool_name: operationData.tool_name,
      patient_id: operationData.patient_id,
      user_id: operationData.user_id,
      operation_args: operationData.operation_args,
      risk_level: operationData.risk_level,
      estimated_duration: operationData.estimated_duration,
      confirmation_status: 'pending',
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create pending operation: ${error.message}`);
  }

  return data;
}

/**
 * Validate a confirmation ID and mark operation as confirmed
 */
async function validateConfirmation(confirmationId, userId) {
  try {
    // Get the pending operation
    const { data: pendingOp, error: fetchError } = await supabase
      .from('pending_operations')
      .select('*')
      .eq('id', confirmationId)
      .eq('user_id', userId)
      .eq('confirmation_status', 'pending')
      .single();

    if (fetchError || !pendingOp) {
      return null;
    }

    // Check if expired
    if (new Date(pendingOp.expires_at) < new Date()) {
      await supabase
        .from('pending_operations')
        .update({ confirmation_status: 'expired' })
        .eq('id', confirmationId);
      return null;
    }

    // Mark as confirmed
    const { error: updateError } = await supabase
      .from('pending_operations')
      .update({
        confirmation_status: 'approved',
        confirmed_by: userId,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', confirmationId);

    if (updateError) {
      console.error('Failed to update pending operation:', updateError);
      return null;
    }

    return pendingOp;
  } catch (error) {
    console.error('Confirmation validation error:', error);
    return null;
  }
}
