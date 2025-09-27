"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '@/lib/auth-demo';
import DashboardClientLayout from './layout-client';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--medical-blue)]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardClientLayout 
      user={user} 
      profile={user} 
      isAdmin={user.role === 'admin'}
    >
      {children}
    </DashboardClientLayout>
  );
}