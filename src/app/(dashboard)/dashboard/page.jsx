"use client";

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, subDays, addDays } from 'date-fns';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Stethoscope,
  Plus,
  ArrowRight,
  Bell
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { usePatientStore } from '@/stores';

export default function DashboardPage() {
  const patients = usePatientStore((state) => state.patients);
  const loading = usePatientStore((state) => state.loading.patients);
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    recentActivity: [],
    alerts: [],
    metrics: {
      totalPatients: 0,
      todayAppointments: 0,
      pendingAlerts: 0,
      completedToday: 0
    }
  });

  // Fetch patients and generate dashboard data
  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients();
    }
  }, [fetchPatients, patients.length]);

  useEffect(() => {
    if (patients.length > 0) {
      generateDashboardData();
    }
  }, [patients]);

  const generateDashboardData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    // Mock appointment data
    const mockAppointments = [
      {
        id: '1',
        patientId: patients[0]?.id,
        patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'Michael Chen',
        time: '09:00 AM',
        type: 'Follow-up',
        status: 'confirmed',
        duration: 30
      },
      {
        id: '2',
        patientId: patients[1]?.id,
        patientName: patients[1] ? `${patients[1].first_name} ${patients[1].last_name}` : 'Sarah Johnson',
        time: '10:30 AM',
        type: 'Annual Checkup',
        status: 'confirmed',
        duration: 60
      },
      {
        id: '3',
        patientId: patients[2]?.id,
        patientName: patients[2] ? `${patients[2].first_name} ${patients[2].last_name}` : 'Robert Davis',
        time: '02:15 PM',
        type: 'Lab Review',
        status: 'pending',
        duration: 30
      },
      {
        id: '4',
        patientId: patients[0]?.id,
        patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'Emily Wilson',
        time: '04:00 PM',
        type: 'Consultation',
        status: 'confirmed',
        duration: 45
      }
    ];

    // Mock recent activity
    const mockActivity = [
      {
        id: '1',
        type: 'patient_visit',
        message: 'Completed visit with Michael Chen',
        time: '2 hours ago',
        icon: Users,
        color: 'text-green-600'
      },
      {
        id: '2',
        type: 'lab_result',
        message: 'Lab results received for Sarah Johnson',
        time: '4 hours ago',
        icon: FileText,
        color: 'text-blue-600'
      },
      {
        id: '3',
        type: 'appointment',
        message: 'New appointment scheduled for Robert Davis',
        time: '6 hours ago',
        icon: Calendar,
        color: 'text-purple-600'
      },
      {
        id: '4',
        type: 'alert',
        message: 'Critical lab alert for Emily Wilson',
        time: '1 day ago',
        icon: AlertTriangle,
        color: 'text-red-600'
      }
    ];

    // Mock alerts
    const mockAlerts = [
      {
        id: '1',
        patientId: patients[0]?.id,
        patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'Michael Chen',
        type: 'lab_critical',
        message: 'LDL Cholesterol: 190 mg/dL (Critical)',
        priority: 'high',
        time: '2 hours ago'
      },
      {
        id: '2',
        patientId: patients[1]?.id,
        patientName: patients[1] ? `${patients[1].first_name} ${patients[1].last_name}` : 'Sarah Johnson',
        type: 'follow_up',
        message: 'Follow-up required for blood pressure medication',
        priority: 'medium',
        time: '1 day ago'
      },
      {
        id: '3',
        patientId: patients[2]?.id,
        patientName: patients[2] ? `${patients[2].first_name} ${patients[2].last_name}` : 'Robert Davis',
        type: 'appointment',
        message: 'Appointment confirmation pending',
        priority: 'low',
        time: '2 days ago'
      }
    ];

    setDashboardData({
      todayAppointments: mockAppointments,
      recentActivity: mockActivity,
      alerts: mockAlerts,
      metrics: {
        totalPatients: patients.length,
        todayAppointments: mockAppointments.length,
        pendingAlerts: mockAlerts.filter(alert => alert.priority === 'high').length,
        completedToday: 3
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/patients">
              <Users className="h-4 w-4 mr-2" />
              View Patients
            </Link>
          </Button>
          <Button asChild className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90">
            <Link href="/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics.totalPatients}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +2 this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics.todayAppointments}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              3 confirmed, 1 pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.metrics.pendingAlerts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Bell className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.metrics.completedToday}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +1 vs yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[var(--medical-blue)]" />
                Today's Appointments
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/calendar">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-[var(--medical-blue)]">
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type} • {appointment.duration}min</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              {dashboardData.todayAppointments.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Pending Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(alert.priority)}`}>
                  <p className="font-medium text-sm">{alert.patientName}</p>
                  <p className="text-xs text-muted-foreground mb-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              ))}
              {dashboardData.alerts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No pending alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-[var(--medical-blue)]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-gray-100`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            {dashboardData.recentActivity.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-[var(--medical-blue)]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
              <Link href="/patients">
                <Users className="h-5 w-5 mb-2 text-[var(--medical-blue)]" />
                <span className="font-medium">Add Patient</span>
                <span className="text-xs text-muted-foreground">Register new patient</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
              <Link href="/calendar">
                <Plus className="h-5 w-5 mb-2 text-green-600" />
                <span className="font-medium">Schedule</span>
                <span className="text-xs text-muted-foreground">Book appointment</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <FileText className="h-5 w-5 mb-2 text-blue-600" />
              <span className="font-medium">Create Note</span>
              <span className="text-xs text-muted-foreground">Document visit</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <AlertTriangle className="h-5 w-5 mb-2 text-yellow-600" />
              <span className="font-medium">Review Alerts</span>
              <span className="text-xs text-muted-foreground">Check notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}