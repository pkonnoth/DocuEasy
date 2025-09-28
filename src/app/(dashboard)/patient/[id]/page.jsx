"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format, differenceInYears } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Activity,
  Pill,
  TestTube,
  AlertTriangle,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Bot,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  UserCheck,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { getPatientWithData } from '@/lib/api/patients';
import { getLiteratureResults } from '@/lib/api/literature';
import AgentSummaryCard from '@/components/agents/AgentSummaryCard';
import LiteraturePanel from '@/components/agents/LiteraturePanel';
import CedarPanel from '@/components/CedarPanel';
// Import Cedar-OS components
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { useCedarStore } from 'cedar-os';
// Import alert and appointment components
import AlertNotification from '@/components/alerts/AlertNotification';
import AppointmentScheduler from '@/components/appointments/AppointmentScheduler';

export default function PatientPage() {
  const params = useParams();
  const patientId = params.id;
  const [activeAgentAction, setActiveAgentAction] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLiterature, setShowLiterature] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [medications, setMedications] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [agentActions, setAgentActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [appointmentType, setAppointmentType] = useState('follow_up');
  const [appointmentReason, setAppointmentReason] = useState('Follow-up care');
  
  // Cedar store hooks for messaging
  const addMessage = useCedarStore((state) => state.addMessage);
  const setShowChat = useCedarStore((state) => state.setShowChat);
  const createThread = useCedarStore((state) => state.createThread);
  const switchThread = useCedarStore((state) => state.switchThread);
  const sendMessage = useCedarStore((state) => state.sendMessage);

  // Fetch patient data from Supabase
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching patient with ID:', patientId);
        const data = await getPatientWithData(patientId);
        if (data) {
          setPatient(data);
          setEncounters(data.encounters || []);
          setMedications(data.medications || []);
          setLabResults(data.labResults || []);
          setAgentActions(data.agentActions || []);
        } else {
          setError('Patient not found');
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError(error.message || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="ml-4">
              <div className="h-8 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-lg">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Error Loading Patient</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-muted-foreground mb-4">
            Patient ID: {patientId}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground">Patient ID: {patientId}</p>
        </div>
      </div>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.date_of_birth));
  const latestEncounter = encounters[0];

  const handleAgentAction = async (actionType) => {
    setAgentLoading(true);
    setActiveAgentAction(actionType);
    
    try {
      let prompt = '';
      let chatTitle = '';
      let threadId = '';
      
      if (actionType === 'summary') {
        prompt = `Please provide a comprehensive AI summary of ${patient.first_name} ${patient.last_name}'s last 2 encounters. Include key findings, assessments, treatments, and any significant changes or patterns. Focus on clinical relevance and continuity of care.`;
        chatTitle = 'Visit Summary';
        threadId = `agent-action-summary-${patientId}`;
      } else if (actionType === 'literature') {
        const conditions = encounters.slice(0, 2).map(e => e.assessment).join(', ');
        prompt = `Find relevant medical literature and research studies related to ${patient.first_name} ${patient.last_name}'s current conditions and recent assessments: ${conditions}. Include recent guidelines, treatment options, and evidence-based recommendations.`;
        chatTitle = 'Medical Literature Search';
        threadId = `agent-action-literature-${patientId}`;
      } else if (actionType === 'draft-note') {
        const latestEncounter = encounters[0];
        prompt = `Please draft a comprehensive SOAP note for ${patient.first_name} ${patient.last_name}'s${latestEncounter ? ` most recent encounter on ${format(new Date(latestEncounter.encounter_date), 'MMM d, yyyy')}` : ' current visit'}. Include:
        
        SUBJECTIVE: Patient's chief complaint and symptoms
        OBJECTIVE: Vital signs, physical examination findings, and relevant test results
        ASSESSMENT: Clinical impression and diagnoses
        PLAN: Treatment plan, medications, follow-up, and patient education
        
        Base this on the patient's medical history, current medications, and recent encounters.`;
        chatTitle = 'SOAP Note Draft';
        threadId = `agent-action-draft-note-${patientId}`;
      }
      
      // Create thread for this action if it doesn't exist
      createThread(threadId, chatTitle);
      
      // Switch to the action-specific thread
      switchThread(threadId, chatTitle);
      
      // Open the chat to show the interaction
      setShowChat(true);
      
      // Add user message to chat
      addMessage({
        role: 'user',
        content: `🤖 ${chatTitle}: ${prompt}`,
        type: 'text'
      }, true, threadId);
      
      // Use Cedar's sendMessage to trigger the AI response
      if (sendMessage) {
        await sendMessage({
          prompt: prompt,
          model: 'gpt-4o',
          stream: true,
          threadId: threadId,
          resourceId: patientId,
          additionalContext: {
            patientId: patientId,
            actionType: actionType,
            patientName: `${patient.first_name} ${patient.last_name}`
          }
        });
      } else {
        console.warn('sendMessage function not available in Cedar store');
      }
      
      console.log(`✅ ${chatTitle} request sent through Cedar messaging system`);
      
    } catch (error) {
      console.error(`Error in handleAgentAction (${actionType}):`, error);
      alert(`Error generating ${actionType}. Please try again.`);
    } finally {
      setAgentLoading(false);
      setActiveAgentAction(null);
    }
  };
  
  // Handle appointment scheduling requests
  const handleScheduleAppointment = (type = 'follow_up', reason = 'Follow-up care') => {
    setAppointmentType(type);
    setAppointmentReason(reason);
    setShowAppointmentScheduler(true);
  };
  
  const handleSummaryConfirm = () => {
    console.log('Summary confirmed by user');
    // In real implementation, this would save the confirmed summary
    setShowSummary(false);
  };
  
  const handleSummaryReject = () => {
    console.log('Summary rejected by user');
    setShowSummary(false);
    setSummaryData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-[var(--medical-blue)] text-[var(--medical-blue-foreground)] text-xl">
              {patient.first_name[0]}{patient.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{patient.first_name} {patient.last_name}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span>{age} years old • {patient.gender}</span>
              <span>MRN: {patient.medical_record_number}</span>
              {patient.allergies.length > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {patient.allergies.length} Allergies
                </Badge>
              )}
              {/* Patient Alerts Notification */}
              <AlertNotification 
                patientId={patientId} 
                patientName={`${patient.first_name} ${patient.last_name}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Action Bar */}
      <Card className="bg-[var(--agent-card)] border-[var(--medical-blue)]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 mr-2 text-[var(--medical-blue)]" />
            AI Co-Pilot Actions
          </CardTitle>
          <CardDescription>
            Let AI assist with patient care decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start text-left"
              onClick={() => handleAgentAction('summary')}
              disabled={agentLoading}
            >
              <div className="flex items-center w-full mb-2">
                <Sparkles className="h-4 w-4 mr-2 text-[var(--medical-blue)]" />
                <span className="font-medium">Summarize Visits</span>
              </div>
              <span className="text-sm text-muted-foreground">
                AI summary of last 2 encounters in chat
              </span>
              {agentLoading && activeAgentAction === 'summary' && (
                <Progress value={66} className="w-full mt-2 h-2" />
              )}
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start text-left"
              onClick={() => handleAgentAction('literature')}
              disabled={agentLoading}
            >
              <div className="flex items-center w-full mb-2">
                <FileText className="h-4 w-4 mr-2 text-[var(--medical-blue)]" />
                <span className="font-medium">Relevant Studies</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Research delivered to chat
              </span>
              {agentLoading && activeAgentAction === 'literature' && (
                <Progress value={33} className="w-full mt-2 h-2" />
              )}
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start text-left"
              onClick={() => handleAgentAction('draft-note')}
              disabled={agentLoading}
            >
              <div className="flex items-center w-full mb-2">
                <UserCheck className="h-4 w-4 mr-2 text-[var(--medical-blue)]" />
                <span className="font-medium">Draft SOAP Note</span>
              </div>
              <span className="text-sm text-muted-foreground">
                SOAP note generated in chat
              </span>
              {agentLoading && activeAgentAction === 'draft-note' && (
                <Progress value={90} className="w-full mt-2 h-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Patient Management Section */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Patient Management
          </CardTitle>
          <CardDescription>
            AI-powered follow-up recommendations and appointment scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Schedule Follow-up */}
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start text-left border-green-200 hover:bg-green-50"
              onClick={() => handleScheduleAppointment('follow_up', 'Routine follow-up visit')}
            >
              <div className="flex items-center w-full mb-2">
                <Calendar className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Schedule Follow-up</span>
              </div>
              <span className="text-sm text-muted-foreground">
                AI-recommended follow-up appointments
              </span>
            </Button>

            {/* Lab Review Appointment */}
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start text-left border-green-200 hover:bg-green-50"
              onClick={() => handleScheduleAppointment('lab_review', 'Lab results review and discussion')}
            >
              <div className="flex items-center w-full mb-2">
                <TestTube className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Lab Review</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Schedule lab results discussion
              </span>
            </Button>

            {/* Medication Follow-up */}
            <Button 
              variant="outline" 
              className="h-auto p-4 flex-col items-start text-left border-green-200 hover:bg-green-50"
              onClick={() => handleScheduleAppointment('follow_up', 'Medication review and adjustment')}
            >
              <div className="flex items-center w-full mb-2">
                <Pill className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Medication Review</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Review and adjust current medications
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Summary Card */}
      {(showSummary || (agentLoading && activeAgentAction === 'summary')) && (
        <AgentSummaryCard
          summary={summaryData}
          onConfirm={handleSummaryConfirm}
          onReject={handleSummaryReject}
          timestamp={new Date()}
          isLoading={agentLoading && activeAgentAction === 'summary'}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(patient.date_of_birth), 'MMMM d, yyyy')} ({age} years)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {patient.address?.city}, {patient.address?.state}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Insurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Provider:</span>
                  <p className="text-sm text-muted-foreground">{patient.insurance?.provider}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Member ID:</span>
                  <p className="text-sm text-muted-foreground">{patient.insurance?.memberId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Allergies: </span>
                {patient.allergies.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Latest Vitals */}
          {latestEncounter?.vitals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Latest Vitals
                </CardTitle>
                <CardDescription>
                  {format(new Date(latestEncounter.encounter_date), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {latestEncounter.vitals.temperature && (
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span>{latestEncounter.vitals.temperature}°F</span>
                    </div>
                  )}
                  {latestEncounter.vitals.bloodPressure && (
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {latestEncounter.vitals.bloodPressure.systolic}/
                        {latestEncounter.vitals.bloodPressure.diastolic}
                      </span>
                    </div>
                  )}
                  {latestEncounter.vitals.weight && (
                    <div className="flex items-center space-x-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span>{latestEncounter.vitals.weight} lbs</span>
                    </div>
                  )}
                  {latestEncounter.vitals.heartRate && (
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{latestEncounter.vitals.heartRate} bpm</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="encounters">Encounters</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="labs">Labs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Recent Encounters */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Encounters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {encounters.slice(0, 3).map((encounter) => (
                      <div key={encounter.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="h-2 w-2 rounded-full bg-[var(--medical-blue)]" />
                            <span className="font-medium">{encounter.type}</span>
                            <Badge variant="outline">{encounter.status}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(encounter.encounter_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Chief Complaint:</span> {encounter.chief_complaint}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Assessment:</span> {encounter.assessment}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-[var(--medical-blue)]" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{encounters.length}</p>
                        <p className="text-xs text-muted-foreground">Total Encounters</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Pill className="h-8 w-8 text-[var(--medical-green)]" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{medications.length}</p>
                        <p className="text-xs text-muted-foreground">Active Medications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <TestTube className="h-8 w-8 text-[var(--warning)]" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{labResults.length}</p>
                        <p className="text-xs text-muted-foreground">Lab Results</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Encounters Tab */}
            <TabsContent value="encounters">
              <Card>
                <CardHeader>
                  <CardTitle>Encounter History</CardTitle>
                  <CardDescription>Complete chronological record</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {encounters.map((encounter, index) => (
                      <div key={encounter.id} className="relative">
                        {/* Timeline Line */}
                        {index < encounters.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-16 bg-[var(--timeline-line)]" />
                        )}
                        
                        <div className="flex space-x-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--medical-blue)] text-[var(--medical-blue-foreground)]">
                            <Calendar className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold">{encounter.type}</h4>
                                <Badge variant="outline">{encounter.provider}</Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(encounter.encounter_date), 'MMMM d, yyyy')}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Chief Complaint:</span> {encounter.chief_complaint}</p>
                              <p><span className="font-medium">Assessment:</span> {encounter.assessment}</p>
                              <p><span className="font-medium">Plan:</span> {encounter.plan}</p>
                              
                              {encounter.vitals && (
                                <div className="mt-3 p-3 bg-muted/50 rounded">
                                  <p className="font-medium mb-2">Vitals:</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {encounter.vitals.temperature && (
                                      <span>Temp: {encounter.vitals.temperature}°F</span>
                                    )}
                                    {encounter.vitals.bloodPressure && (
                                      <span>BP: {encounter.vitals.bloodPressure.systolic}/{encounter.vitals.bloodPressure.diastolic}</span>
                                    )}
                                    {encounter.vitals.heartRate && (
                                      <span>HR: {encounter.vitals.heartRate} bpm</span>
                                    )}
                                    {encounter.vitals.weight && (
                                      <span>Weight: {encounter.vitals.weight} lbs</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications">
              <Card>
                <CardHeader>
                  <CardTitle>Active Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medications.map((medication) => (
                      <div key={medication.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{medication.medication_name}</h4>
                          <Badge variant="outline" className="bg-[var(--medical-green)]/10">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Dosage:</span> {medication.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Route:</span> {medication.route}
                          </div>
                          <div>
                            <span className="font-medium">Prescribed by:</span> {medication.prescribed_by}
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          <span className="font-medium">Instructions:</span> {medication.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Labs Tab */}
            <TabsContent value="labs">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratory Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {labResults.map((lab) => (
                      <div key={lab.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{lab.test_name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={lab.status === 'Normal' ? 'secondary' : lab.status === 'Abnormal' ? 'destructive' : 'default'}
                            >
                              {lab.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(lab.result_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Value:</span> {lab.value} {lab.unit}
                          </div>
                          <div>
                            <span className="font-medium">Reference:</span> {lab.reference_range}
                          </div>
                          <div>
                            <span className="font-medium">Ordered by:</span> {lab.ordered_by}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Literature Panel */}
      <LiteraturePanel
        patientId={patientId}
        isVisible={showLiterature}
        onClose={() => setShowLiterature(false)}
      />
      
      {/* Cedar-OS Components */}
      <CedarPanel patientId={patientId} />
      
      {/* Cedar-OS Floating Chat - AI Assistant */}
      <FloatingCedarChat 
        patientContext={{
          patientId: patientId,
          patientName: `${patient.first_name} ${patient.last_name}`,
          patientAge: age,
          currentMedications: medications.length,
          recentEncounters: encounters.length
        }}
      />
      
      {/* Appointment Scheduler */}
      <AppointmentScheduler
        patientId={patientId}
        patientName={`${patient.first_name} ${patient.last_name}`}
        isVisible={showAppointmentScheduler}
        onClose={() => setShowAppointmentScheduler(false)}
        appointmentType={appointmentType}
        reason={appointmentReason}
      />
    </div>
  );
}
