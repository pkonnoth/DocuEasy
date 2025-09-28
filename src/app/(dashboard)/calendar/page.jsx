"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isToday, parseISO, addMonths, subMonths } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePatientStore } from '@/stores';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const patients = usePatientStore((state) => state.patients);
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch patients if not loaded
  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients();
    }
  }, [fetchPatients, patients.length]);

  // Generate mock appointments
  useEffect(() => {
    if (patients.length > 0) {
      generateMockAppointments();
    }
  }, [patients, currentDate]);

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, filterStatus]);

  const generateMockAppointments = () => {
    const mockData = [
      // Today
      {
        id: '1',
        patientId: patients[0]?.id,
        patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'Michael Chen',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        endTime: '09:30',
        type: 'Follow-up',
        status: 'confirmed',
        location: 'Room 101',
        notes: 'Blood pressure check'
      },
      {
        id: '2',
        patientId: patients[1]?.id,
        patientName: patients[1] ? `${patients[1].first_name} ${patients[1].last_name}` : 'Sarah Johnson',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:30',
        endTime: '11:30',
        type: 'Annual Checkup',
        status: 'confirmed',
        location: 'Room 102',
        notes: 'Complete physical examination'
      },
      {
        id: '3',
        patientId: patients[2]?.id,
        patientName: patients[2] ? `${patients[2].first_name} ${patients[2].last_name}` : 'Robert Davis',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '14:15',
        endTime: '14:45',
        type: 'Lab Review',
        status: 'pending',
        location: 'Room 103',
        notes: 'Discuss lab results'
      },
      {
        id: '4',
        patientId: patients[0]?.id,
        patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'Emily Wilson',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '16:00',
        endTime: '16:45',
        type: 'Consultation',
        status: 'confirmed',
        location: 'Room 101',
        notes: 'New patient consultation'
      },
      // Tomorrow
      {
        id: '5',
        patientId: patients[1]?.id,
        patientName: patients[1] ? `${patients[1].first_name} ${patients[1].last_name}` : 'Sarah Johnson',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '11:00',
        endTime: '11:30',
        type: 'Follow-up',
        status: 'confirmed',
        location: 'Room 102',
        notes: 'Medication review'
      },
      // Next week
      {
        id: '6',
        patientId: patients[2]?.id,
        patientName: patients[2] ? `${patients[2].first_name} ${patients[2].last_name}` : 'Robert Davis',
        date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        time: '13:30',
        endTime: '14:30',
        type: 'Procedure',
        status: 'scheduled',
        location: 'Procedure Room',
        notes: 'Minor procedure'
      }
    ];

    setAppointments(mockData);
  };

  const getCalendarDays = () => {
    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfWeek(endOfMonth(currentDate));
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    return filteredAppointments.filter(apt => 
      isSameDay(parseISO(apt.date), date)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage appointments and schedule patient visits
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Month Navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setCurrentDate(new Date())}
            className="text-sm"
          >
            Today
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-[var(--medical-blue)]" />
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((date) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isSelected = isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);

                return (
                  <div
                    key={date.toString()}
                    className={cn(
                      "min-h-[100px] p-2 border border-border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      isSelected && "ring-2 ring-[var(--medical-blue)] ring-offset-2",
                      isCurrentDay && "bg-[var(--medical-blue)]/10",
                      !isCurrentMonth && "text-muted-foreground bg-muted/30"
                    )}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isCurrentDay && "text-[var(--medical-blue)] font-bold"
                    )}>
                      {format(date, 'd')}
                    </div>
                    
                    {/* Appointments */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={cn(
                            "text-xs p-1 rounded border cursor-pointer hover:opacity-80",
                            getStatusColor(appointment.status)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appointment);
                          }}
                        >
                          <div className="font-medium truncate">
                            {appointment.time} {appointment.patientName}
                          </div>
                          <div className="truncate opacity-75">
                            {appointment.type}
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Selected Date Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {appointment.time} - {appointment.endTime}
                        </span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{appointment.patientName}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {appointment.type}
                      </div>
                      
                      {appointment.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {appointment.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getAppointmentsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No appointments scheduled
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  <span className="font-medium">{appointments.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="font-medium text-green-600">
                    {appointments.filter(apt => apt.status === 'confirmed').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {appointments.filter(apt => apt.status === 'pending').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-blue-600">
                    {appointments.filter(apt => apt.status === 'completed').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Appointment Details</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Patient</span>
                  <p className="text-sm">{selectedAppointment.patientName}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <p className="text-sm">{selectedAppointment.type}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                  <p className="text-sm">{format(parseISO(selectedAppointment.date), 'MMM d, yyyy')}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Time</span>
                  <p className="text-sm">{selectedAppointment.time} - {selectedAppointment.endTime}</p>
                </div>
                
                {selectedAppointment.location && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Location</span>
                    <p className="text-sm">{selectedAppointment.location}</p>
                  </div>
                )}
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Notes</span>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1 bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Appointment
                </Button>
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Appointment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* This would be a form to add appointments */}
            <p className="text-sm text-muted-foreground">
              Appointment scheduling form would be implemented here with patient selection, 
              date/time picker, appointment type, and other relevant fields.
            </p>
            
            <div className="flex space-x-2">
              <Button className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90">
                Schedule Appointment
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}