import { supabase } from '@/lib/supabase';

/**
 * Simple Audit Logger for DocuEase System
 * Captures: Actor, Action, Scope, Input, Result, Confirmation, Timestamps
 */

export class AuditLogger {
  /**
   * Log an action to the audit trail
   * @param {Object} options - Audit log options
   */
  static async log({
    // Actor (Who)
    actorUserId = null,
    actorEmail = null,
    actorRole = null,
    actorAgentId = null, // For AI actions
    
    // Action (What)
    action,
    toolName = null,
    
    // Scope (Where/What affected)
    scopePatientId = null,
    scopeOrgId = null,
    scopeResourceType = null,
    scopeResourceId = null,
    
    // Input (How - with PHI minimized)
    inputArguments = {},
    
    // Result (Outcome)
    resultStatus = 'success', // 'success', 'failure', 'pending'
    resultData = {},
    resultErrorMessage = null,
    
    // Confirmation
    confirmationStatus = 'auto_executed', // 'auto_executed', 'approved', 'rejected'
    confirmedByUserId = null,
    
    // Timestamps
    requestedAt = new Date(),
    completedAt = null,
    durationMs = null
  }) {
    try {
      // Get current user from Supabase if not provided
      if (!actorUserId || !actorEmail || !actorRole) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          actorUserId = actorUserId || user.id;
          actorEmail = actorEmail || user.email;
          actorRole = actorRole || profile?.role;
        }
      }

      // Get client metadata
      const metadata = AuditLogger.getClientMetadata();
      
      // Minimize PHI in input arguments
      const sanitizedInput = AuditLogger.minimizePHI(inputArguments);
      
      // Calculate duration if not provided
      if (!durationMs && completedAt && requestedAt) {
        durationMs = new Date(completedAt) - new Date(requestedAt);
      }

      // Create audit log entry
      const auditLog = {
        // Actor
        actor_user_id: actorUserId,
        actor_email: actorEmail,
        actor_role: actorRole,
        actor_agent_id: actorAgentId,
        
        // Action
        action: action,
        tool_name: toolName,
        
        // Scope
        scope_patient_id: scopePatientId,
        scope_org_id: scopeOrgId,
        scope_resource_type: scopeResourceType,
        scope_resource_id: scopeResourceId,
        
        // Input
        input_arguments: sanitizedInput,
        
        // Result
        result_status: resultStatus,
        result_data: resultData,
        result_error_message: resultErrorMessage,
        
        // Confirmation
        confirmation_status: confirmationStatus,
        confirmed_by_user_id: confirmedByUserId,
        
        // Timestamps
        requested_at: requestedAt.toISOString(),
        completed_at: completedAt ? new Date(completedAt).toISOString() : null,
        duration_ms: durationMs,
        
        // Metadata
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
        session_id: metadata.sessionId
      };

      // Save to database
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([auditLog])
        .select()
        .single();

      if (error) {
        console.error('Failed to save audit log:', error);
        return { success: false, error };
      }

      console.log('✅ Audit log saved:', {
        id: data.id,
        action: action,
        actor: actorEmail,
        patient: scopePatientId,
        status: resultStatus
      });

      return { success: true, data };

    } catch (error) {
      console.error('Audit logger error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get client metadata for audit logging
   */
  static getClientMetadata() {
    if (typeof window === 'undefined') {
      // Server-side
      return {
        ipAddress: null,
        userAgent: null,
        sessionId: null
      };
    }

    return {
      ipAddress: null, // Would need server-side detection
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem('session_id') || 'unknown'
    };
  }

  /**
   * Minimize PHI in input data
   * @param {Object} data - Input data that may contain PHI
   */
  static minimizePHI(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Create a copy to avoid mutating original
    const sanitized = { ...data };

    // Common PHI fields to hash or remove
    const phiFields = [
      'first_name', 'last_name', 'name',
      'email', 'phone', 'ssn',
      'address', 'street', 'medical_record_number'
    ];

    phiFields.forEach(field => {
      if (sanitized[field]) {
        if (typeof sanitized[field] === 'string') {
          // Hash the value
          sanitized[field] = AuditLogger.hashPII(sanitized[field]);
        } else if (typeof sanitized[field] === 'object') {
          // For nested objects like address
          sanitized[field] = '[OBJECT_PROVIDED]';
        }
      }
    });

    // Add metadata about what was provided
    sanitized._metadata = {
      fields_provided: Object.keys(data),
      phi_minimized: true,
      timestamp: new Date().toISOString()
    };

    return sanitized;
  }

  /**
   * Simple hash function for PII (in production, use proper encryption)
   * @param {string} value - Value to hash
   */
  static hashPII(value) {
    if (!value) return null;
    
    // Simple hash (in production, use proper encryption/hashing)
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(36)}_${value.length}chars`;
  }

  /**
   * Helper methods for common audit actions
   */
  
  // Patient actions
  static async logPatientCreated(patientId, patientData, result) {
    return await AuditLogger.log({
      action: 'create_patient',
      toolName: 'AddPatientModal',
      scopePatientId: patientId,
      scopeResourceType: 'patient',
      scopeResourceId: patientId,
      inputArguments: patientData,
      resultStatus: result.success ? 'success' : 'failure',
      resultData: result.success ? { patient_id: patientId, mrn: result.data?.medical_record_number } : {},
      resultErrorMessage: result.error?.message,
      completedAt: new Date()
    });
  }

  static async logPatientViewed(patientId) {
    return await AuditLogger.log({
      action: 'view_patient',
      toolName: 'PatientDetailPage',
      scopePatientId: patientId,
      scopeResourceType: 'patient',
      scopeResourceId: patientId,
      inputArguments: { patient_id: patientId },
      resultStatus: 'success',
      completedAt: new Date()
    });
  }

  // User actions
  static async logUserLogin(userEmail, userRole) {
    return await AuditLogger.log({
      action: 'user_login',
      toolName: 'LoginForm',
      inputArguments: { email: AuditLogger.hashPII(userEmail) },
      resultStatus: 'success',
      resultData: { role: userRole },
      completedAt: new Date()
    });
  }

  static async logUserLogout() {
    return await AuditLogger.log({
      action: 'user_logout',
      toolName: 'LogoutAction',
      resultStatus: 'success',
      completedAt: new Date()
    });
  }

  // AI Agent actions
  static async logAgentAction(agentId, action, patientId, input, result) {
    return await AuditLogger.log({
      actorAgentId: agentId,
      action: `agent_${action}`,
      toolName: `AIAgent_${agentId}`,
      scopePatientId: patientId,
      scopeResourceType: 'patient',
      scopeResourceId: patientId,
      inputArguments: input,
      resultStatus: result.success ? 'success' : 'failure',
      resultData: result.data || {},
      resultErrorMessage: result.error?.message,
      confirmationStatus: 'approved', // Assuming agent actions need approval
      completedAt: new Date()
    });
  }
}

// Export default for easier imports
export default AuditLogger;