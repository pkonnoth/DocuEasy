"use client";

import { useState } from 'react';
import { Brain, FileText, Calendar, AlertCircle, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth-demo';
import ConfirmationDialog from '@/components/cedar/ConfirmationDialog';

/**
 * Cedar Panel - AI Agent Tools for Patient Pages
 * Integrates with your existing demo auth system
 */
export default function CedarPanel({ patientId }) {
  const [loading, setLoading] = useState(null); // Track which tool is loading
  const [results, setResults] = useState({}); // Store tool results
  const [error, setError] = useState(null);
  
  // Confirmation system state
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const currentUser = getCurrentUser();

  // Call Cedar API endpoint
  const callCedarTool = async (toolName, toolArgs, confirmationId = null) => {
    setLoading(toolName);
    setError(null);

    try {
      const response = await fetch('/api/agent/cedar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          args: {
            patient_id: patientId,
            ...toolArgs
          },
          patient_id: patientId,
          user_id: currentUser?.id || 'demo-user-123',
          confirmation_id: confirmationId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API call failed');
      }

      // Handle confirmation required
      if (result.requires_confirmation) {
        setPendingConfirmation({
          toolName,
          toolArgs,
          pendingOperationId: result.pending_operation_id,
          toolConfig: result.tool_config,
          operation: result.operation
        });
        setShowConfirmationDialog(true);
        return result;
      }

      // Store result
      setResults(prev => ({
        ...prev,
        [toolName]: result
      }));

      return result;
    } catch (err) {
      console.error('Cedar tool error:', err);
      setError(`${toolName} failed: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  // Confirmation handlers
  const handleConfirmOperation = async () => {
    if (!pendingConfirmation) return;
    
    setConfirming(true);
    try {
      await callCedarTool(
        pendingConfirmation.toolName,
        pendingConfirmation.toolArgs,
        pendingConfirmation.pendingOperationId
      );
    } finally {
      setConfirming(false);
      setShowConfirmationDialog(false);
      setPendingConfirmation(null);
    }
  };

  const handleRejectOperation = () => {
    setShowConfirmationDialog(false);
    setPendingConfirmation(null);
    setLoading(null);
  };

  // Tool handlers
  const handleSummarize = () => {
    callCedarTool('get_patient_timeline', {
      timeframe: '90days',
      include_types: ['encounters', 'labs', 'medications', 'appointments']
    });
  };

  const handleDraftNote = () => {
    callCedarTool('draft_progress_note', {
      template: 'soap',
      context: 'Regular follow-up visit'
    });
  };

  const handleScheduleFollowup = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // 2 weeks from now

    callCedarTool('create_appointment', {
      appointment_type: 'follow-up',
      preferred_date: futureDate.toISOString(),
      duration_minutes: 30,
      reason: 'Follow-up appointment scheduled by AI'
    });
  };

  // Get status icon for results
  const getStatusIcon = (toolName) => {
    if (loading === toolName) return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    if (results[toolName]?.success) return <Check className="h-4 w-4 text-green-500" />;
    if (error && error.includes(toolName)) return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  const isToolLoading = (toolName) => loading === toolName;
  const isAnyToolLoading = loading !== null;

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={handleConfirmOperation}
        onReject={handleRejectOperation}
        operation={pendingConfirmation?.operation}
        data={{
          user: currentUser,
          sessionId: 'current-session'
        }}
        riskLevel={pendingConfirmation?.toolConfig?.risk_level || 'medium'}
        estimatedTime={pendingConfirmation?.toolConfig?.estimated_time}
        isConfirming={confirming}
      />
      
      {/* Cedar Panel Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Assistant
            <Badge variant="secondary" className="ml-2">Cedar-OS</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered tools for patient care and documentation
          </p>
        </CardHeader>

        <CardContent>
          {/* Tool Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Button
              onClick={handleSummarize}
              disabled={isAnyToolLoading}
              variant="outline"
              className="flex items-center justify-start gap-2 h-auto p-4"
            >
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon('get_patient_timeline')}
                <Brain className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Summarize</div>
                  <div className="text-xs text-muted-foreground">
                    Get timeline summary
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleDraftNote}
              disabled={isAnyToolLoading}
              variant="outline"
              className="flex items-center justify-start gap-2 h-auto p-4"
            >
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon('draft_progress_note')}
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Draft Note</div>
                  <div className="text-xs text-muted-foreground">
                    Create SOAP note
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleScheduleFollowup}
              disabled={isAnyToolLoading}
              variant="outline"
              className="flex items-center justify-start gap-2 h-auto p-4"
            >
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon('create_appointment')}
                <Calendar className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Schedule Follow-up</div>
                  <div className="text-xs text-muted-foreground">
                    Book next appointment
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Results Display */}
          <div className="space-y-4">
            {/* Timeline Summary Result */}
            {results.get_patient_timeline && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Patient Timeline Summary
                    <Badge className="bg-green-600">
                      ⚡ {results.get_patient_timeline.execution_time_ms}ms
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm">
                    <p><strong>Timeframe:</strong> {results.get_patient_timeline.result.timeframe}</p>
                    <p><strong>Total Items:</strong> {results.get_patient_timeline.result.total_items}</p>
                    <p><strong>Data Types:</strong> {Object.keys(results.get_patient_timeline.result.timeline).join(', ')}</p>
                  </div>
                  {results.get_patient_timeline.result.total_items > 0 && (
                    <div className="mt-3 p-2 bg-white rounded text-xs">
                      <strong>Timeline Data:</strong>
                      <pre className="mt-1 overflow-x-auto">
                        {JSON.stringify(results.get_patient_timeline.result.timeline, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Draft Note Result */}
            {results.draft_progress_note && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Draft Progress Note Created
                    <Badge className="bg-blue-600">
                      Status: {results.draft_progress_note.result.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm space-y-2">
                    <p><strong>Note ID:</strong> {results.draft_progress_note.result.note_id}</p>
                    <p><strong>Template:</strong> {results.draft_progress_note.result.template.toUpperCase()}</p>
                    <div className="p-2 bg-white rounded text-xs">
                      <strong>Preview:</strong>
                      <div className="mt-1 whitespace-pre-wrap">
                        {results.draft_progress_note.result.content_preview}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appointment Result */}
            {results.create_appointment && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Follow-up Appointment Scheduled
                    <Badge className="bg-purple-600">
                      {results.create_appointment.result.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm space-y-1">
                    <p><strong>Date:</strong> {new Date(results.create_appointment.result.scheduled_date).toLocaleString()}</p>
                    <p><strong>Duration:</strong> {results.create_appointment.result.duration_minutes} minutes</p>
                    <p><strong>Type:</strong> {results.create_appointment.result.type}</p>
                    <p><strong>Provider:</strong> {results.create_appointment.result.provider_id || 'demo_provider'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}