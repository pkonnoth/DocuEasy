"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle2, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Remove direct Mastra import - use API instead

export default function AlertNotification({ patientId, patientName }) {
  const [alerts, setAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  // Fetch alerts on component mount
  useEffect(() => {
    if (patientId) {
      fetchAlerts();
    }
  }, [patientId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      console.log(`🚨 Fetching alerts for patient ${patientId}...`);
      
      const response = await fetch('/api/patient-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          action: 'alert_triage'
        })
      });
      
      if (!response.ok) {
        console.error('Alert fetch error:', response.statusText);
        return;
      }
      
      const result = await response.json();
      setTriageResult(result);
      
      // Parse alerts from the triage result
      // In a real implementation, this would come from the tool response
      // For now, let's simulate alerts based on patient data
      const mockAlerts = [
        {
          id: 'alert_1',
          type: 'lab_alert',
          priority: 'critical',
          message: 'LDL Cholesterol: 190 mg/dL (Critical)',
          details: {
            testName: 'LDL Cholesterol',
            value: '190',
            unit: 'mg/dL',
            referenceRange: '<100',
            status: 'Critical',
            resultDate: '2024-01-08',
            labId: 'lab_190_ldl'
          },
          actionRequired: 'immediate_review'
        }
      ];
      
      setAlerts(mockAlerts);
      setAlertCount(mockAlerts.length);
      setCriticalCount(mockAlerts.filter(a => a.priority === 'critical').length);
      
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (alert) => {
    try {
      setProcessingAction('mark_reviewed');
      console.log(`✅ Marking lab as reviewed:`, alert);
      
      // Call the API to mark as reviewed
      const response = await fetch('/api/patient-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          action: 'review_lab',
          labId: alert.details.labId,
          reviewNotes: 'Lab result reviewed via alert triage system'
        })
      });
      
      if (!response.ok) {
        alert(`Error marking lab as reviewed: ${response.statusText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.error) {
        alert(`Error marking lab as reviewed: ${result.error}`);
        return;
      }
      
      // Update local state
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
      setAlertCount(prev => prev - 1);
      if (alert.priority === 'critical') {
        setCriticalCount(prev => prev - 1);
      }
      
      // Show success message
      alert('✅ Lab result marked as reviewed and logged in audit trail');
      
    } catch (error) {
      console.error('Error marking lab as reviewed:', error);
      alert('Error marking lab as reviewed. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleScheduleFollowup = async (alert) => {
    try {
      setProcessingAction('schedule_followup');
      console.log(`📅 Scheduling follow-up for alert:`, alert);
      
      // Call the API for follow-up analysis
      const response = await fetch('/api/patient-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          action: 'follow_up_analysis'
        })
      });
      
      if (!response.ok) {
        alert(`Error analyzing follow-up: ${response.statusText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.error) {
        alert(`Error analyzing follow-up: ${result.error}`);
        return;
      }
      
      // Show success message - in real app, this would open scheduling modal
      alert('📅 Follow-up analysis completed. Check the follow-up section for appointment scheduling options.');
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      alert('Error scheduling follow-up. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3" />;
      case 'high':
        return <Bell className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <Bell className="h-3 w-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  if (alertCount === 0) {
    return null; // No alerts to show
  }

  return (
    <>
      {/* Alert Notification Pill */}
      <Badge 
        variant={criticalCount > 0 ? "destructive" : "warning"}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowAlertModal(true)}
      >
        <Bell className="h-3 w-3 mr-1" />
        {criticalCount > 0 ? `${criticalCount} Critical` : `${alertCount} Alert${alertCount > 1 ? 's' : ''}`}
      </Badge>

      {/* Alert Details Modal */}
      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Patient Alerts: {patientName}
            </DialogTitle>
            <DialogDescription>
              {alertCount} alert{alertCount > 1 ? 's' : ''} requiring attention
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* AI Triage Summary */}
            {triageResult && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Triage Analysis:</strong> {triageResult.result || 'Analysis completed successfully'}
                </AlertDescription>
              </Alert>
            )}

            {/* Individual Alerts */}
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {getPriorityIcon(alert.priority)}
                      <span className="ml-2">{alert.details.testName}</span>
                    </CardTitle>
                    <Badge variant={getPriorityColor(alert.priority)}>
                      {alert.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    Result Date: {alert.details.resultDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Lab Values */}
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">
                        <strong>Value:</strong> {alert.details.value} {alert.details.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Reference Range:</strong> {alert.details.referenceRange}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong> 
                        <span className={`ml-1 font-medium ${alert.priority === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {alert.details.status}
                        </span>
                      </p>
                    </div>

                    {/* AI Recommendation */}
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-800">🤖 AI Recommendation:</p>
                      <p className="text-sm text-blue-700">
                        LDL 190 mg/dL indicates high cardiovascular risk. Consider starting statin therapy and scheduling lipid panel follow-up in 6-8 weeks.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleMarkReviewed(alert)}
                        disabled={processingAction === 'mark_reviewed'}
                        className="flex-1"
                      >
                        {processingAction === 'mark_reviewed' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2 animate-pulse" />
                            Marking Reviewed...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Reviewed
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleScheduleFollowup(alert)}
                        disabled={processingAction === 'schedule_followup'}
                        className="flex-1"
                      >
                        {processingAction === 'schedule_followup' ? (
                          <>
                            <Calendar className="h-4 w-4 mr-2 animate-pulse" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Follow-up
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowAlertModal(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}