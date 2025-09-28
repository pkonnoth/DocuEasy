"use client";

import { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle2, 
  X, 
  Clock,
  User,
  Calendar,
  FileText
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

/**
 * ConfirmationDialog - Cedar-OS Confirmation System
 * Handles user confirmation for write operations
 */
export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  operation,
  data,
  riskLevel = 'medium', // 'low', 'medium', 'high'
  estimatedTime = null,
  isConfirming = false
}) {
  const [userAcknowledged, setUserAcknowledged] = useState(false);

  if (!operation) return null;

  const handleConfirm = () => {
    if (riskLevel === 'high' && !userAcknowledged) {
      return; // Require acknowledgment for high-risk operations
    }
    onConfirm();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  const getRiskConfig = (level) => {
    switch (level) {
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badge: 'destructive',
          icon: AlertTriangle,
          title: 'High Risk Operation'
        };
      case 'medium':
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badge: 'secondary',
          icon: Shield,
          title: 'Confirmation Required'
        };
      case 'low':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badge: 'outline',
          icon: CheckCircle2,
          title: 'Confirm Action'
        };
      default:
        return getRiskConfig('medium');
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  const getOperationDisplay = () => {
    switch (operation.tool) {
      case 'create_appointment':
        return {
          title: 'Schedule Appointment',
          description: 'Create a new appointment in the system',
          icon: Calendar,
          details: [
            { label: 'Patient', value: operation.args?.patient_id },
            { label: 'Type', value: operation.args?.appointment_type },
            { label: 'Date', value: operation.args?.preferred_date ? new Date(operation.args.preferred_date).toLocaleDateString() : 'Auto-scheduled' },
            { label: 'Duration', value: `${operation.args?.duration_minutes || 30} minutes` }
          ]
        };
      case 'draft_progress_note':
        return {
          title: 'Create Draft Note',
          description: 'Generate a draft progress note',
          icon: FileText,
          details: [
            { label: 'Patient', value: operation.args?.patient_id },
            { label: 'Template', value: operation.args?.template?.toUpperCase() || 'SOAP' },
            { label: 'Context', value: operation.args?.context || 'Standard visit note' }
          ]
        };
      case 'update_medication':
        return {
          title: 'Update Medication',
          description: 'Modify patient medication record',
          icon: AlertTriangle,
          details: [
            { label: 'Patient', value: operation.args?.patient_id },
            { label: 'Medication', value: operation.args?.medication_name },
            { label: 'Changes', value: 'Dosage, frequency, or status' }
          ]
        };
      default:
        return {
          title: operation.tool.replace('_', ' ').toUpperCase(),
          description: 'Perform system operation',
          icon: Shield,
          details: Object.entries(operation.args || {}).map(([key, value]) => ({
            label: key.replace('_', ' '),
            value: String(value)
          }))
        };
    }
  };

  const operationDisplay = getOperationDisplay();
  const OperationIcon = operationDisplay.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${riskConfig.bgColor}`}>
              <RiskIcon className={`h-5 w-5 ${riskConfig.color}`} />
            </div>
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <span>{riskConfig.title}</span>
                <Badge variant={riskConfig.badge}>{riskLevel.toUpperCase()}</Badge>
              </DialogTitle>
              <DialogDescription>
                Review the operation details before proceeding
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Operation Details */}
          <div className={`rounded-lg border p-4 ${riskConfig.borderColor} ${riskConfig.bgColor}`}>
            <div className="flex items-center space-x-3 mb-3">
              <OperationIcon className="h-5 w-5" />
              <div>
                <h4 className="font-semibold">{operationDisplay.title}</h4>
                <p className="text-sm text-muted-foreground">{operationDisplay.description}</p>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="grid grid-cols-2 gap-3">
              {operationDisplay.details.slice(0, 6).map((detail, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {detail.label}
                  </span>
                  <span className="text-sm font-mono truncate" title={detail.value}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cedar-OS Security Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Cedar-OS Protection:</strong> This operation is validated against security policies, 
              logged for audit compliance, and requires explicit user confirmation.
              {estimatedTime && (
                <span className="ml-2">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Est. completion: {estimatedTime}
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* High-risk acknowledgment */}
          {riskLevel === 'high' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="text-red-800 font-medium">
                    ⚠️ High-Risk Operation - Additional Confirmation Required
                  </p>
                  <p className="text-red-700 text-sm">
                    This operation may have significant clinical or system impact. 
                    Please review all details carefully before proceeding.
                  </p>
                  <label className="flex items-center space-x-2 text-red-700">
                    <input
                      type="checkbox"
                      checked={userAcknowledged}
                      onChange={(e) => setUserAcknowledged(e.target.checked)}
                      className="rounded border-red-300"
                    />
                    <span className="text-sm">
                      I have reviewed the operation details and understand the risks
                    </span>
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* User Context */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span>
                Requesting User: {data?.user?.name || data?.user?.email || 'demo-user-123'}
              </span>
            </div>
            <div className="mt-1">
              Session ID: {data?.sessionId || 'current-session'}
            </div>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleReject}
            disabled={isConfirming}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isConfirming || (riskLevel === 'high' && !userAcknowledged)}
            className="bg-[var(--medical-green)] hover:bg-[var(--medical-green)]/90"
          >
            {isConfirming ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm & Execute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}