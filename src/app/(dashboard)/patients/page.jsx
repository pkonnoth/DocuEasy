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
import '@/lib/testSupabase'; // Auto-test Supabase connection

export default function PatientsPage() {
  const patients = usePatientStore((state) => state.patients);
  const loading = usePatientStore((state) => state.loading.patients);
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  
  const searchTerm = useUIStore((state) => state.searchTerm);
  const filterBy = useUIStore((state) => state.filterBy);
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  const setFilterBy = useUIStore((state) => state.setFilterBy);
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
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
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
        <Button className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90 text-[var(--medical-blue-foreground)]">
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
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-[var(--patient-card)] border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[var(--medical-blue)] text-[var(--medical-blue-foreground)]">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        MRN: {patient.medical_record_number}
                      </p>
                    </div>
                  </div>
                  {patient.allergies.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Allergies
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {calculateAge(patient.date_of_birth)} years, {patient.gender}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {patient.phone}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Insurance:</span>
                    <Badge variant="outline" className="text-xs">
                      {patient.insurance?.provider || 'N/A'}
                    </Badge>
                  </div>

                  {/* Allergies */}
                  {patient.allergies.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-destructive">Allergies:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.allergies.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <Calendar className="h-3 w-3 mr-1" />
                    Updated {format(new Date(patient.updated_at), 'MMM d, yyyy')}
                  </div>
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
            <Button className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90 text-[var(--medical-blue-foreground)]">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Patient
            </Button>
          )}
        </div>
      )}
    </div>
  );
}