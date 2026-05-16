'use client';

import React from 'react';
import { Shield, Users, CalendarCheck, BarChart3, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Sidebar, type NavItem } from './Sidebar';
import { TopBar } from './TopBar';

const adminNavItems: NavItem[] = [
  { view: 'admin-panel', label: 'Dashboard', icon: <Shield className="h-5 w-5" /> },
  { view: 'admin-panel', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { view: 'admin-panel', label: 'Bookings', icon: <CalendarCheck className="h-5 w-5" /> },
  { view: 'admin-panel', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { view: 'admin-panel', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, currentView, setView, logout } = useAppStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Sidebar - always visible for admin (even on mobile) */}
      <Sidebar
        items={adminNavItems}
        user={user}
        activeView={currentView}
        onNavigate={setView}
        onLogout={logout}
        alwaysVisible
      />

      {/* Main Content Area */}
      <div className="ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar
          title="Admin Panel"
          user={user}
          onNavigate={setView}
          onLogout={logout}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
