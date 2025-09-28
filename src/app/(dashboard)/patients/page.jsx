"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, Filter, Plus, User, Phone, Calendar, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { usePatientStore, useUIStore } from '@/stores';
import AddPatientModal from '@/components/patients/AddPatientModal';
import '@/lib/testSupabase'; // Auto-test Supabase connection

export default function PatientsPage() {
  const patients = usePatientStore((state) => state.patients);
  const loading = usePatientStore((state) => state.loading.patients);
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  
  const searchTerm = useUIStore((state) => state.searchTerm);
  const filterBy = useUIStore((state) => state.filterBy);
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  const setFilterBy = useUIStore((state) => state.setFilterBy);
  
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Fetch patients from Supabase on mount
  useEffect(() => {
    fetchPatients();
  }, []); // Empty dependency array to run only once

  // Debug: Log patients when they load
  useEffect(() => {
    if (patients.length > 0) {
      console.log('✅ Loaded patients:', patients.map(p => ({ 
        id: p.id, 
        name: `${p.first_name} ${p.last_name}`,
        url: `/patient/${p.id}`
      })));
    }
  }, [patients]);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'allergies') return matchesSearch && patient.allergies.length > 0;
    if (filterBy === 'recent') return matchesSearch; // Could add date logic here
    
    return matchesSearch;
  });

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-80 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-28 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="h-3 w-16 bg-muted rounded mt-auto" />
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
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage and view all patient records
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90 text-[var(--medical-blue-foreground)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, MRN, or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter patients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="recent">Recent Visits</SelectItem>
              <SelectItem value="allergies">With Allergies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      {/* Patient Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => {
          console.log('Patient ID:', patient.id, 'Name:', patient.first_name, patient.last_name);
          return (
          <Link key={patient.id} href={`/patient/${patient.id}`}>
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-[var(--patient-card)] border-border/50 h-80 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between h-16">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-[var(--medical-blue)] text-[var(--medical-blue-foreground)]">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg truncate">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        MRN: {patient.medical_record_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {patient.allergies.length > 0 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Allergies
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 flex-grow flex flex-col justify-between">
                <div className="space-y-3 flex-grow">
                  {/* Basic Info - Fixed Height */}
                  <div className="grid grid-cols-2 gap-4 text-sm h-12">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{calculateAge(patient.date_of_birth)} years, {patient.gender}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{patient.phone}</span>
                    </div>
                  </div>

                  {/* Insurance - Fixed Height */}
                  <div className="flex items-center justify-between h-8">
                    <span className="text-sm font-medium">Insurance:</span>
                    <Badge variant="outline" className="text-xs">
                      {patient.insurance?.provider || 'N/A'}
                    </Badge>
                  </div>

                  {/* Allergies - Fixed Height with Overflow */}
                  <div className="min-h-[3rem] max-h-[4.5rem]">
                    {patient.allergies.length > 0 ? (
                      <div>
                        <span className="text-sm font-medium text-destructive">Allergies:</span>
                        <p className="text-sm text-muted-foreground mt-1 overflow-hidden text-ellipsis">
                          {patient.allergies.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center h-12 text-sm text-muted-foreground">
                        No known allergies
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Updated - Fixed at Bottom */}
                <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border/50 mt-auto h-8 flex-shrink-0">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {format(new Date(patient.updated_at), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No patients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 
              'Try adjusting your search criteria or filters.' : 
              'Get started by adding your first patient.'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90 text-[var(--medical-blue-foreground)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Patient
            </Button>
          )}
        </div>
      )}
      
      {/* Add Patient Modal */}
      <AddPatientModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
