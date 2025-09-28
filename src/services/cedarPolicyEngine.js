/**
 * Cedar Policy Evaluation Service
 * Implements authorization logic based on Cedar policies
 * For production: replace with actual Cedar policy engine
 */

/**
 * Policy evaluation result
 */
class PolicyDecision {
  constructor(decision, reasons = []) {
    this.decision = decision; // 'Allow' or 'Deny'
    this.reasons = reasons;
  }

  get allowed() {
    return this.decision === 'Allow';
  }

  get denied() {
    return this.decision === 'Deny';
  }
}

/**
 * Cedar Policy Engine Service
 */
export class CedarPolicyEngine {
  /**
   * Evaluate if a user is authorized to perform an action on a resource
   * @param {Object} principal - The user/actor
   * @param {string} action - The action being performed
   * @param {Object} resource - The resource being acted upon
   * @param {Object} context - Additional context
   */
  static async isAuthorized(principal, action, resource, context = {}) {
    try {
      // Get applicable policies
      const policies = CedarPolicyEngine.getPolicies();
      
      // Evaluate each policy
      const decisions = [];
      
      for (const policy of policies) {
        const decision = await CedarPolicyEngine.evaluatePolicy(
          policy, 
          principal, 
          action, 
          resource, 
          context
        );
        
        if (decision) {
          decisions.push(decision);
        }
      }
      
      // Apply policy combination logic
      return CedarPolicyEngine.combineDecisions(decisions, action, principal, resource);
      
    } catch (error) {
      console.error('Policy evaluation error:', error);
      // Fail secure - deny by default
      return new PolicyDecision('Deny', [`Policy evaluation failed: ${error.message}`]);
    }
  }

  /**
   * Get all Cedar policies (simplified implementation)
   */
  static getPolicies() {
    return [
      // Policy 1: Demo user access
      {
        id: 'demo-user-access',
        effect: 'Allow',
        principal: { type: 'User', conditions: { role: 'admin', id: 'demo-user-123' } },
        actions: ['ViewPatient', 'UpdatePatient', 'UseAIAgent', 'ConfirmAIAction'],
        resource: { type: 'Patient' },
        when: (principal, resource) => {
          // Demo user has full access
          return principal.id === 'demo-user-123' && principal.role === 'admin';
        }
      },
      
      // Policy 2: Provider access to assigned patients
      {
        id: 'provider-patient-access',
        effect: 'Allow',
        principal: { type: 'User', conditions: { role: 'provider' } },
        actions: ['ViewPatient', 'UpdatePatient', 'CreateEncounter', 'UseAIAgent'],
        resource: { type: 'Patient' },
        when: (principal, resource) => {
          return principal.role === 'provider' && 
                 principal.is_active && 
                 (resource.assigned_provider === principal.id || 
                  resource.care_team?.includes(principal.id));
        }
      },
      
      // Policy 3: AI Agent restrictions
      {
        id: 'ai-agent-restrictions',
        effect: 'Allow',
        principal: { type: 'User' },
        actions: ['UseAIAgent', 'ConfirmAIAction'],
        resource: { type: 'Patient' },
        when: (principal, resource, context) => {
          // Only licensed providers can use AI agents
          return ['provider', 'resident', 'admin'].includes(principal.role) &&
                 principal.is_active &&
                 (principal.license_number || principal.role === 'admin') &&
                 (context.tool_risk_level !== 'high' || principal.role === 'admin');
        }
      },
      
      // Policy 4: Emergency access
      {
        id: 'emergency-access',
        effect: 'Allow',
        principal: { type: 'User', conditions: { role: 'emergency_provider' } },
        actions: ['ViewPatient', 'ViewEncounter', 'ViewMedication', 'ViewLabResult'],
        resource: '*',
        when: (principal) => {
          return principal.role === 'emergency_provider' && 
                 principal.is_active && 
                 principal.department === 'emergency';
        }
      },
      
      // Policy 5: VIP patient restrictions
      {
        id: 'vip-patient-restriction',
        effect: 'Deny',
        principal: { type: 'User' },
        actions: '*',
        resource: { type: 'Patient', conditions: { privacy_level: 'vip' } },
        when: (principal, resource) => {
          return resource.privacy_level === 'vip' &&
                 principal.role !== 'provider' &&
                 resource.assigned_provider !== principal.id &&
                 !resource.care_team?.includes(principal.id);
        }
      },
      
      // Policy 6: Inactive user restriction
      {
        id: 'inactive-user-restriction',
        effect: 'Deny',
        principal: { type: 'User', conditions: { is_active: false } },
        actions: '*',
        resource: '*',
        when: (principal) => {
          return principal.is_active === false;
        }
      },
      
      // Policy 7: Controlled substance restrictions
      {
        id: 'controlled-substance-restriction',
        effect: 'Deny',
        principal: { type: 'User' },
        actions: ['PrescribeMedication', 'UpdateMedication'],
        resource: { type: 'Medication', conditions: { is_controlled: true } },
        when: (principal, resource) => {
          return resource.is_controlled && 
                 !['pain_management', 'psychiatry', 'anesthesiology', 'oncology'].includes(principal.specialty);
        }
      }
    ];
  }

  /**
   * Evaluate a single policy
   */
  static async evaluatePolicy(policy, principal, action, resource, context) {
    try {
      // Check if policy applies to this principal
      if (!CedarPolicyEngine.matchesPrincipal(policy.principal, principal)) {
        return null; // Policy doesn't apply
      }

      // Check if policy applies to this action
      if (!CedarPolicyEngine.matchesAction(policy.actions, action)) {
        return null; // Policy doesn't apply
      }

      // Check if policy applies to this resource
      if (!CedarPolicyEngine.matchesResource(policy.resource, resource)) {
        return null; // Policy doesn't apply
      }

      // Evaluate the policy condition (when clause)
      let conditionResult = true;
      if (policy.when) {
        conditionResult = await policy.when(principal, resource, context);
      }

      if (conditionResult) {
        return {
          policy: policy.id,
          effect: policy.effect,
          reason: `Policy ${policy.id} ${policy.effect.toLowerCase()}s access`
        };
      }

      return null; // Condition not met
    } catch (error) {
      console.error(`Error evaluating policy ${policy.id}:`, error);
      return null;
    }
  }

  /**
   * Check if principal matches policy conditions
   */
  static matchesPrincipal(policyPrincipal, actualPrincipal) {
    if (policyPrincipal.type !== 'User') return false;
    
    if (policyPrincipal.conditions) {
      for (const [key, value] of Object.entries(policyPrincipal.conditions)) {
        if (actualPrincipal[key] !== value) return false;
      }
    }
    
    return true;
  }

  /**
   * Check if action matches policy actions
   */
  static matchesAction(policyActions, actualAction) {
    if (Array.isArray(policyActions)) {
      return policyActions.includes(actualAction) || policyActions.includes('*');
    }
    return policyActions === actualAction || policyActions === '*';
  }

  /**
   * Check if resource matches policy resource
   */
  static matchesResource(policyResource, actualResource) {
    if (policyResource === '*') return true;
    if (policyResource.type !== actualResource.type) return false;
    
    if (policyResource.conditions) {
      for (const [key, value] of Object.entries(policyResource.conditions)) {
        if (actualResource[key] !== value) return false;
      }
    }
    
    return true;
  }

  /**
   * Combine multiple policy decisions
   */
  static combineDecisions(decisions, action, principal, resource) {
    const allows = decisions.filter(d => d.effect === 'Allow');
    const denies = decisions.filter(d => d.effect === 'Deny');
    
    // Cedar policy: explicit deny overrides allow
    if (denies.length > 0) {
      return new PolicyDecision('Deny', denies.map(d => d.reason));
    }
    
    // If we have allows, grant access
    if (allows.length > 0) {
      return new PolicyDecision('Allow', allows.map(d => d.reason));
    }
    
    // No applicable policies = deny (fail secure)
    return new PolicyDecision('Deny', ['No applicable policies found - access denied by default']);
  }

  /**
   * Helper method for Cedar AI tool authorization
   */
  static async authorizeAITool(user, patientId, toolName, toolArgs = {}) {
    // Determine risk level based on tool
    const riskLevel = CedarPolicyEngine.getToolRiskLevel(toolName, toolArgs);
    
    const principal = {
      id: user.id,
      role: user.role,
      is_active: user.is_active !== false, // Default to true for demo
      license_number: user.license_number || (user.role === 'admin' ? 'admin' : null),
      specialty: user.specialty
    };
    
    const resource = {
      type: 'Patient',
      id: patientId,
      privacy_level: 'standard' // Would come from database in real implementation
    };
    
    const context = {
      tool_name: toolName,
      tool_risk_level: riskLevel,
      tool_args: toolArgs
    };
    
    return await CedarPolicyEngine.isAuthorized(principal, 'UseAIAgent', resource, context);
  }

  /**
   * Determine risk level for AI tools
   */
  static getToolRiskLevel(toolName, toolArgs) {
    const riskLevels = {
      'get_patient_timeline': 'low',        // Read-only
      'draft_progress_note': 'low',         // Creates draft only
      'create_appointment': 'medium',       // Write operation
      'update_medication': 'high',          // High-risk medication changes
      'prescribe_medication': 'high',       // Prescription changes
      'finalize_note': 'medium',           // Finalizes clinical documentation
      'send_message': 'medium'             // Communication
    };
    
    let risk = riskLevels[toolName] || 'medium';
    
    // Increase risk based on arguments
    if (toolArgs.is_controlled) risk = 'high';
    if (toolArgs.critical_value) risk = 'high';
    if (toolArgs.emergency) risk = 'high';
    
    return risk;
  }

  /**
   * Get tool configuration including confirmation requirements
   */
  static getToolConfig(toolName, riskLevel) {
    const configs = {
      'get_patient_timeline': { 
        confirmation_required: false,
        risk_level: 'low'
      },
      'draft_progress_note': { 
        confirmation_required: false,
        risk_level: 'low'
      },
      'create_appointment': { 
        confirmation_required: true,
        risk_level: 'medium'
      },
      'update_medication': { 
        confirmation_required: true,
        requires_acknowledgment: true,
        risk_level: 'high'
      }
    };
    
    const config = configs[toolName] || {
      confirmation_required: true,
      risk_level: riskLevel || 'medium'
    };
    
    return config;
  }
}

export default CedarPolicyEngine;