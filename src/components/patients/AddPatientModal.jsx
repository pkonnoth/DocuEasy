"use client";

import { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Shield, AlertTriangle, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { usePatientStore } from '@/stores';
import { createPatient } from '@/lib/api/patients';
import { useToast } from '@/components/ui/toast';

export default function AddPatientModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const addPatient = usePatientStore((state) => state.addPatient);
  const { addToast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    // Demographics
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    
    // Insurance
    insurance: {
      provider: '',
      memberId: '',
      groupNumber: ''
    },
    
    // Emergency Contact
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    
    // Allergies
    allergies: [],
    
    // System fields
    medical_record_number: ''
  });
  
  const [newAllergy, setNewAllergy] = useState('');

  // Update form data
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateNestedField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Add allergy
  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  // Remove allergy
  const removeAllergy = (allergyToRemove) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(allergy => allergy !== allergyToRemove)
    }));
  };

  // Generate MRN
  const generateMRN = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MRN${timestamp}${random}`;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    if (formData.phone && !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation (at least city and state)
    if (!formData.address.city.trim()) newErrors.address_city = 'City is required';
    if (!formData.address.state.trim()) newErrors.address_state = 'State is required';

    // MRN validation
    if (!formData.medical_record_number.trim()) {
      formData.medical_record_number = generateMRN();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for API
      const patientData = {
        ...formData,
        // Convert arrays to PostgreSQL format
        allergies: formData.allergies.length > 0 ? `{${formData.allergies.map(a => `"${a}"`).join(',')}}` : '{}',
        // Ensure JSON fields are properly formatted
        address: JSON.stringify(formData.address),
        insurance: JSON.stringify(formData.insurance),
        emergency_contact: JSON.stringify(formData.emergency_contact),
      };

      const newPatient = await createPatient(patientData);
      
      // Add to store
      addPatient(newPatient);
      
      // Show success notification
      addToast({
        type: 'success',
        title: 'Patient Created',
        message: `${formData.first_name} ${formData.last_name} has been successfully added to the system.`,
        duration: 5000
      });
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: { street: '', city: '', state: '', zipCode: '' },
        insurance: { provider: '', memberId: '', groupNumber: '' },
        emergency_contact: { name: '', relationship: '', phone: '' },
        allergies: [],
        medical_record_number: ''
      });
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error creating patient:', error);
      setErrors({ submit: error.message || 'Failed to create patient' });
      
      // Show error notification
      addToast({
        type: 'error',
        title: 'Error Creating Patient',
        message: error.message || 'Failed to create patient. Please try again.',
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-6 w-6 mr-2 text-[var(--medical-blue)]" />
            Add New Patient
          </DialogTitle>
          <DialogDescription>
            Enter the patient's information to create a new medical record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateField('first_name', e.target.value)}
                    className={errors.first_name ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateField('last_name', e.target.value)}
                    className={errors.last_name ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                    className={errors.date_of_birth ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.date_of_birth && (
                    <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => updateField('gender', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="mrn">Medical Record Number</Label>
                <Input
                  id="mrn"
                  value={formData.medical_record_number}
                  onChange={(e) => updateField('medical_record_number', e.target.value)}
                  placeholder="Auto-generated if left blank"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave blank to auto-generate
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => updateNestedField('address', 'street', e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                    className={errors.address_city ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.address_city && (
                    <p className="text-sm text-red-500 mt-1">{errors.address_city}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => updateNestedField('address', 'state', e.target.value)}
                    className={errors.address_state ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.address_state && (
                    <p className="text-sm text-red-500 mt-1">{errors.address_state}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => updateNestedField('address', 'zipCode', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  value={formData.insurance.provider}
                  onChange={(e) => updateNestedField('insurance', 'provider', e.target.value)}
                  placeholder="Blue Cross Blue Shield, Aetna, etc."
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member_id">Member ID</Label>
                  <Input
                    id="member_id"
                    value={formData.insurance.memberId}
                    onChange={(e) => updateNestedField('insurance', 'memberId', e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="group_number">Group Number</Label>
                  <Input
                    id="group_number"
                    value={formData.insurance.groupNumber}
                    onChange={(e) => updateNestedField('insurance', 'groupNumber', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_name">Contact Name</Label>
                  <Input
                    id="emergency_name"
                    value={formData.emergency_contact.name}
                    onChange={(e) => updateNestedField('emergency_contact', 'name', e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Select
                    value={formData.emergency_contact.relationship}
                    onValueChange={(value) => updateNestedField('emergency_contact', 'relationship', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="emergency_phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emergency_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.emergency_contact.phone}
                    onChange={(e) => updateNestedField('emergency_contact', 'phone', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergies Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Enter allergy (e.g., Penicillin, Shellfish)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAllergy}
                  disabled={!newAllergy.trim() || loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(allergy)}
                        className="ml-1 hover:bg-red-600 rounded-full p-0.5"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--medical-blue)] hover:bg-[var(--medical-blue)]/90"
            >
              {loading ? 'Creating...' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}