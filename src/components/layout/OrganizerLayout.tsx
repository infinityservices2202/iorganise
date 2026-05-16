'use client';

import React from 'react';
import { LayoutDashboard, Briefcase, CalendarCheck, Wallet, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { ViewName } from '@/lib/types';
import { Sidebar, type NavItem } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

const organizerNavItems: NavItem[] = [
  { view: 'organizer-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { view: 'organizer-services', label: 'Services', icon: <Briefcase className="h-5 w-5" /> },
  { view: 'organizer-bookings', label: 'Bookings', icon: <CalendarCheck className="h-5 w-5" /> },
  { view: 'organizer-earnings', label: 'Earnings', icon: <Wallet className="h-5 w-5" /> },
  { view: 'organizer-profile-edit', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

export function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const { user, currentView, setView, logout } = useAppStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Desktop Sidebar */}
      <Sidebar
        items={organizerNavItems}
        user={user}
        activeView={currentView}
        onNavigate={setView}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="md:ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar
          title={user.name}
          user={user}
          onNavigate={setView}
          onLogout={logout}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav
        items={organizerNavItems}
        activeView={currentView}
        onNavigate={setView}
      />
    </div>
  );
}
