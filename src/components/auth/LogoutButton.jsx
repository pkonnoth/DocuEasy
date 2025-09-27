"use client";

import { useState } from 'react';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuditLogger } from '@/utils/auditLogger';

export default function LogoutButton({ variant = "ghost", size = "sm", className = "" }) {
  const [loading, setLoading] = useState(false);
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      // Log logout action before signing out
      await AuditLogger.logUserLogout();
      
      // Sign out from Supabase
      await signOut();
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {loading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}