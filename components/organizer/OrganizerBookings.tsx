'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  IndianRupee,
  Users,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Flag,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Booking } from '@/lib/types';
import { format, parseISO } from 'date-fns';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'ongoing' | 'completed' | 'rejected';

const statusConfig: Record<
  Booking['status'],
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-500/15 text-green-500 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-500 border-red-500/20',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  },
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function OrganizerBookings() {
  const { user } = useAppStore();
  const [organizerId, setOrganizerId] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');

  // Action dialogs
  const [confirmAction, setConfirmAction] = useState<{
    booking: Booking;
    newStatus: string;
    label: string;
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  // Detail sheet
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const fetchOrganizerId = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/organizers');
      if (res.ok) {
        const organizers = await res.json();
        const org = organizers.find((o: { userId: string }) => o.userId === user.id);
        if (org) setOrganizerId(org.id);
      }
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizerId();
  }, [fetchOrganizerId]);

  const fetchBookings = useCallback(async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const statusParam = activeTab !== 'all' ? `&status=${activeTab}` : '';
      const res = await fetch(`/api/bookings?organizerId=${organizerId}${statusParam}`);
      if (res.ok) setBookings(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [organizerId, activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async () => {
    if (!confirmAction) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmAction.booking.id, status: confirmAction.newStatus }),
      });
      if (res.ok) {
        await fetchBookings();
        setConfirmAction(null);
      }
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  };

  const getActionButtons = (booking: Booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <>
            <Button
              size="sm"
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              onClick={() =>
                setConfirmAction({ booking, newStatus: 'accepted', label: 'Accept' })
              }
            >
              <CheckCircle2 className="size-3" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
              onClick={() =>
                setConfirmAction({ booking, newStatus: 'rejected', label: 'Reject' })
              }
            >
              <XCircle className="size-3" />
              Reject
            </Button>
          </>
        );
      case 'accepted':
        return (
          <Button
            size="sm"
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
            onClick={() =>
              setConfirmAction({ booking, newStatus: 'ongoing', label: 'Mark as Ongoing' })
            }
          >
            <PlayCircle className="size-3" />
            Start
          </Button>
        );
      case 'ongoing':
        return (
          <Button
            size="sm"
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            onClick={() =>
              setConfirmAction({ booking, newStatus: 'completed', label: 'Mark as Completed' })
            }
          >
            <Flag className="size-3" />
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (loading && bookings.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-4"
    >
      <PageHeader title="Bookings" subtitle={`${bookings.length} total`} />

      {/* Status Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as StatusFilter)}>
        <TabsList className="bg-[#1a1a1a] border border-white/[0.08] w-full overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs data-[state=active]:bg-[#8B1A2B] data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Booking List */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon />}
          title={`No ${activeTab === 'all' ? '' : activeTab + ' '}bookings`}
          description={
            activeTab === 'pending'
              ? 'New booking requests will appear here'
              : 'Bookings matching this filter will appear here'
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {bookings.map((booking, index) => {
              const status = statusConfig[booking.status];
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="bg-[#1a1a1a] border-white/[0.08]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Customer Avatar */}
                        <Avatar className="size-10 shrink-0">
                          <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-sm font-semibold">
                            {booking.customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate">
                                {booking.customer.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {booking.service.title}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`shrink-0 text-[10px] border ${status.className}`}
                            >
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              <span>{formatDate(booking.eventDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{booking.eventTime}</span>
                            </div>
                            {booking.guestCount && (
                              <div className="flex items-center gap-1">
                                <Users className="size-3" />
                                <span>{booking.guestCount} guests</span>
                              </div>
                            )}
                            <div className="flex items-center gap-0.5 text-sm font-semibold text-[#D4A843]">
                              <IndianRupee className="size-3" />
                              <span>{formatCurrency(booking.totalAmount)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            {getActionButtons(booking)}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 ml-auto"
                              onClick={() => setDetailBooking(booking)}
                            >
                              <Eye className="size-3" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {confirmAction?.label} Booking
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmAction?.newStatus === 'accepted'
                ? `Accept the booking from ${confirmAction?.booking.customer.name}? They will be notified of your acceptance.`
                : confirmAction?.newStatus === 'rejected'
                ? `Reject the booking from ${confirmAction?.booking.customer.name}? This action cannot be undone.`
                : confirmAction?.newStatus === 'ongoing'
                ? `Mark the booking for ${confirmAction?.booking.service.title} as ongoing?`
                : `Mark the booking for ${confirmAction?.booking.service.title} as completed?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={updating}
              className={
                confirmAction?.newStatus === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white'
              }
            >
              {updating ? 'Updating...' : confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Detail Sheet */}
      <Sheet open={!!detailBooking} onOpenChange={(open) => !open && setDetailBooking(null)}>
        <SheetContent className="bg-[#1a1a1a] border-white/[0.08] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-foreground">Booking Details</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Full information about this booking
            </SheetDescription>
          </SheetHeader>
          {detailBooking && (
            <div className="space-y-5 p-4">
              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] font-semibold">
                    {detailBooking.customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {detailBooking.customer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{detailBooking.customer.email}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs text-muted-foreground mb-1">Service</p>
                <p className="text-sm font-medium text-foreground">
                  {detailBooking.service.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  by {detailBooking.service.organizer?.companyName}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[10px] text-muted-foreground uppercase">Event Date</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatDate(detailBooking.eventDate)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[10px] text-muted-foreground uppercase">Event Time</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {detailBooking.eventTime}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[10px] text-muted-foreground uppercase">Guests</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {detailBooking.guestCount || 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] border mt-1 ${statusConfig[detailBooking.status].className}`}
                  >
                    {statusConfig[detailBooking.status].label}
                  </Badge>
                </div>
              </div>

              {/* Amount */}
              <div className="p-3 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Amount</span>
                  <span className="text-lg font-bold text-[#D4A843]">
                    {formatCurrency(detailBooking.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Advance Paid</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(detailBooking.advancePaid)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {detailBooking.notes && (
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Notes</p>
                  <p className="text-sm text-foreground">{detailBooking.notes}</p>
                </div>
              )}

              {/* Action buttons in detail */}
              <div className="flex gap-2 pt-2">
                {getActionButtons(detailBooking)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
