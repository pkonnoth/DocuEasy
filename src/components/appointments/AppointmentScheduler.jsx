"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Remove direct Mastra import - use API instead

export default function AppointmentScheduler({ 
  patientId, 
  patientName, 
  isVisible, 
  onClose, 
  appointmentType = 'follow_up',
  reason = 'Follow-up care' 
}) {
  const [proposedSlots, setProposedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isVisible && patientId) {
      fetchAppointmentSlots();
    }
  }, [isVisible, patientId]);

  const fetchAppointmentSlots = async () => {
    try {
      setLoading(true);
      console.log(`📅 Fetching appointment slots for patient ${patientId}...`);
      
      // Call the patient-management API for follow-up analysis
      const response = await fetch('/api/patient-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          action: 'follow_up_analysis',
          preferredWindow: 'next_week'
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Follow-up analysis error:', data);
        return;
      }
      
      setFollowUpResult(data.result);
      
      // Generate mock appointment slots for demo
      const mockSlots = [
        {
          slotId: `slot_${Date.now()}_1`,
          datetime: 'Tuesday, January 16, 2024 at 10:30 AM',
          displayTime: 'Tue 10:30 AM',
          duration: 30,
          provider: 'Dr. Jennifer Davis',
          appointmentType,
          available: true
        },
        {
          slotId: `slot_${Date.now()}_2`,
          datetime: 'Wednesday, January 17, 2024 at 2:00 PM',
          displayTime: 'Wed 2:00 PM',
          duration: 30,
          provider: 'Dr. Jennifer Davis',
          appointmentType,
          available: true
        },
        {
          slotId: `slot_${Date.now()}_3`,
          datetime: 'Thursday, January 18, 2024 at 9:00 AM',
          displayTime: 'Thu 9:00 AM',
          duration: 30,
          provider: 'Dr. Michael Johnson',
          appointmentType,
          available: true
        }
      ];
      
      setProposedSlots(mockSlots);
      
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedSlot) return;
    
    try {
      setScheduling(true);
      console.log(`📅 Confirming appointment:`, selectedSlot);
      
      const appointmentDetails = {
        slotId: selectedSlot.slotId,
        datetime: selectedSlot.datetime,
        appointmentType: selectedSlot.appointmentType,
        reason: reason,
        provider: selectedSlot.provider
      };
      
      // Call the patient-management API for appointment scheduling
      const response = await fetch('/api/patient-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          action: 'schedule_appointment',
          appointmentDetails
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        alert(`Error scheduling appointment: ${data.error || 'Unknown error'}`);
        return;
      }
      
      // Show success message
      alert(`✅ Appointment scheduled successfully for ${selectedSlot.datetime}!`);
      
      // Close dialogs
      setShowConfirmation(false);
      onClose();
      
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Error scheduling appointment. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const getAppointmentTypeIcon = (type) => {
    switch (type) {
      case 'follow_up':
        return <Calendar className="h-4 w-4" />;
      case 'lab_review':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getAppointmentTypeLabel = (type) => {
    switch (type) {
      case 'follow_up':
        return 'Follow-up Visit';
      case 'lab_review':
        return 'Lab Results Review';
      default:
        return 'Appointment';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Scheduling Dialog */}
      <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Schedule Appointment: {patientName}
            </DialogTitle>
            <DialogDescription>
              {getAppointmentTypeLabel(appointmentType)} - {reason}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* AI Follow-up Analysis */}
            {followUpResult && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Recommendation:</strong> {followUpResult.result || 'Follow-up analysis completed successfully'}
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Finding available appointment slots...</span>
              </div>
            )}

            {/* Proposed Appointment Slots */}
            {!loading && proposedSlots.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Available Appointment Slots</h3>
                {proposedSlots.map((slot) => (
                  <Card 
                    key={slot.slotId} 
                    className={`cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-200 ${
                      selectedSlot?.slotId === slot.slotId ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{slot.displayTime}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{slot.provider}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{slot.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant="secondary">
                            {getAppointmentTypeIcon(slot.appointmentType)}
                            <span className="ml-1">{getAppointmentTypeLabel(slot.appointmentType)}</span>
                          </Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Available
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Slots Available */}
            {!loading && proposedSlots.length === 0 && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  No available appointment slots found. Please try a different time range or contact the office directly.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={fetchAppointmentSlots} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Slots
              </Button>
              {selectedSlot && (
                <Button onClick={() => setShowConfirmation(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Selected
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              Confirm Appointment
            </DialogTitle>
            <DialogDescription>
              Please confirm the appointment details below
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p><strong>Patient:</strong> {patientName}</p>
                    <p><strong>Date & Time:</strong> {selectedSlot.datetime}</p>
                    <p><strong>Provider:</strong> {selectedSlot.provider}</p>
                    <p><strong>Duration:</strong> {selectedSlot.duration} minutes</p>
                    <p><strong>Type:</strong> {getAppointmentTypeLabel(selectedSlot.appointmentType)}</p>
                    <p><strong>Reason:</strong> {reason}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Confirmation Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              disabled={scheduling}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAppointment}
              disabled={scheduling}
            >
              {scheduling ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Appointment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}