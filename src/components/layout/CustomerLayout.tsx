'use client';

import React from 'react';
import { Home, Grid3X3, CalendarCheck, Heart, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { ViewName } from '@/lib/types';
import { Sidebar, type NavItem } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

const customerNavItems: NavItem[] = [
  { view: 'customer-home', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { view: 'customer-categories', label: 'Categories', icon: <Grid3X3 className="h-5 w-5" /> },
  { view: 'customer-bookings', label: 'Bookings', icon: <CalendarCheck className="h-5 w-5" /> },
  { view: 'customer-favorites', label: 'Favorites', icon: <Heart className="h-5 w-5" /> },
  { view: 'customer-profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, currentView, setView, logout } = useAppStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Desktop Sidebar */}
      <Sidebar
        items={customerNavItems}
        user={user}
        activeView={currentView}
        onNavigate={setView}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="md:ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar
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
        items={customerNavItems}
        activeView={currentView}
        onNavigate={setView}
      />
    </div>
  );
}
