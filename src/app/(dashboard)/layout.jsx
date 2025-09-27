"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  Search,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/ui/toast';

const sidebarItems = [
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
    badge: '3'
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Activity
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    badge: '2'
  },
  {
    title: 'Audit Log',
    href: '/audit',
    icon: FileText
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings
  }
];

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--medical-blue)' }}>
                <Stethoscope className="h-5 w-5" style={{ color: 'var(--medical-blue-foreground)' }} />
              </div>
              <span className="font-semibold text-lg">EMR Co-Pilot</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8 pr-4"
                />
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "sticky top-14 z-30 -ml-2 h-[calc(100vh-3.5rem)] w-full shrink-0 border-r border-border/40 md:sticky md:block transition-all duration-300",
            sidebarCollapsed ? "md:w-16" : "md:w-64"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Toggle */}
            <div className="flex items-center justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                    {!sidebarCollapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            {!sidebarCollapsed && (
              <div className="border-t border-border/40 p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dr. Sarah Wilson</p>
                    <p className="text-xs text-muted-foreground">Primary Care</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-screen-2xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      </div>
    </ToastProvider>
  );
}