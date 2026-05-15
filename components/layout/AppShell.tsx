'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { CustomerLayout } from './CustomerLayout';
import { OrganizerLayout } from './OrganizerLayout';
import { AdminLayout } from './AdminLayout';
import { AuthPage } from '@/components/auth/AuthPage';

// Customer page components
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { CategoryGrid } from '@/components/customer/CategoryGrid';
import { SearchPage } from '@/components/customer/SearchPage';
import { ServiceDetail } from '@/components/customer/ServiceDetail';
import { BookingForm } from '@/components/customer/BookingForm';
import { CustomerBookings } from '@/components/customer/CustomerBookings';
import { CustomerFavorites } from '@/components/customer/CustomerFavorites';
import { CustomerProfile } from '@/components/customer/CustomerProfile';
import { OrganizerProfileView } from '@/components/customer/OrganizerProfileView';
import { PaymentPage } from '@/components/customer/PaymentPage';
import { ChatView } from '@/components/customer/ChatView';

// Organizer page components
import { OrganizerDashboard } from '@/components/organizer/OrganizerDashboard';
import { ServiceManager } from '@/components/organizer/ServiceManager';
import { OrganizerBookings } from '@/components/organizer/OrganizerBookings';
import { EarningsView } from '@/components/organizer/EarningsView';
import { OrganizerProfileEdit } from '@/components/organizer/OrganizerProfileEdit';

// Admin page components
import { AdminPanel } from '@/components/admin/AdminPanel';

// View renderer — maps view names to page content
function ViewRenderer({ view }: { view: string }) {
  switch (view) {
    // Customer views
    case 'customer-home':
      return <CustomerDashboard />;
    case 'customer-categories':
      return <CategoryGrid />;
    case 'customer-bookings':
      return <CustomerBookings />;
    case 'customer-favorites':
      return <CustomerFavorites />;
    case 'customer-profile':
      return <CustomerProfile />;
    case 'customer-search':
      return <SearchPage />;

    // Organizer views
    case 'organizer-dashboard':
      return <OrganizerDashboard />;
    case 'organizer-services':
      return <ServiceManager />;
    case 'organizer-bookings':
      return <OrganizerBookings />;
    case 'organizer-earnings':
      return <EarningsView />;
    case 'organizer-profile-edit':
      return <OrganizerProfileEdit />;

    // Admin views
    case 'admin-panel':
      return <AdminPanel />;

    // Shared detail views
    case 'service-detail':
      return <ServiceDetail />;
    case 'booking-form':
      return <BookingForm />;
    case 'organizer-profile':
      return <OrganizerProfileView />;
    case 'payment-page':
      return <PaymentPage />;
    case 'chat':
      return <ChatView />;

    default:
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-maroon/20 flex items-center justify-center">
              <span className="text-2xl">🏗️</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {view.replace(/-/g, ' ')}
            </h2>
            <p className="text-muted-foreground text-sm">Coming soon</p>
          </div>
        </div>
      );
  }
}

// Page transition animation variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

export function AppShell() {
  const { isAuthenticated, user, currentView } = useAppStore();

  // If not authenticated, show auth page
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // Determine layout based on user role
  const role = user.role;

  // Wrap view content with AnimatePresence for smooth transitions
  const content = (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <ViewRenderer view={currentView} />
      </motion.div>
    </AnimatePresence>
  );

  if (role === 'customer') {
    return <CustomerLayout>{content}</CustomerLayout>;
  }

  if (role === 'organizer') {
    return <OrganizerLayout>{content}</OrganizerLayout>;
  }

  if (role === 'admin') {
    return <AdminLayout>{content}</AdminLayout>;
  }

  return null;
}
