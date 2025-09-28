"use client";

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-demo';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
    >
      <LogOut className="h-4 w-4 mr-1" />
      Sign Out
    </Button>
  );
}
