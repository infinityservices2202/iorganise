'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, IndianRupee, Phone, Mail, Star,
  MessageSquare, X, Send, Loader2, RefreshCw,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookingCard } from '@/components/shared/BookingCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { StarRating } from '@/components/shared/StarRating';
import type { Booking } from '@/lib/types';

const statusConfig: Record<Booking['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20' },
  accepted: { label: 'Accepted', className: 'bg-green-500/15 text-green-500 border-green-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/15 text-red-500 border-red-500/20' },
  ongoing: { label: 'Ongoing', className: 'bg-blue-500/15 text-blue-500 border-blue-500/20' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
};

const tabStatuses = ['all', 'pending', 'accepted', 'ongoing', 'completed', 'cancelled'] as const;
type TabStatus = (typeof tabStatuses)[number];

export function CustomerBookings() {
  const { user, setView } = useAppStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?customerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const handleOpenReview = (booking: Booking) => {
    setReviewBookingId(booking.id);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewBookingId) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reviewBookingId,
          userId: user.id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowReviewDialog(false);
        fetchBookings(); // Refresh to show review
      }
    } catch { /* ignore */ } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Bookings"
        action={
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchBookings}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Refresh bookings"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-[#1a1a1a] border border-border overflow-x-auto flex-nowrap justify-start sm:justify-center">
          {tabStatuses.map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="text-xs capitalize data-[state=active]:bg-[#8B1A2B] data-[state=active]:text-white shrink-0"
            >
              {status}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabStatuses.map((tabStatus) => (
          <TabsContent key={tabStatus} value={tabStatus} className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl bg-muted/40" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState
                icon={<Calendar className="size-8" />}
                title="No bookings found"
                description={tabStatus === 'all' ? "You haven't made any bookings yet" : `No ${tabStatus} bookings`}
                actionLabel={tabStatus === 'all' ? 'Browse Services' : undefined}
                onAction={tabStatus === 'all' ? () => setView('customer-search') : undefined}
              />
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
                }}
                className="space-y-3"
              >
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                  >
                    <BookingCard
                      booking={booking}
                      onClick={() => setSelectedBooking(booking)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Booking Detail Sheet */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="bg-[#0f0f0f] border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-foreground">Booking Details</SheetTitle>
          </SheetHeader>
          {selectedBooking && (
            <div className="mt-6 space-y-5">
              {/* Service Info */}
              <div className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedBooking.service.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  by {selectedBooking.service.organizer.companyName}
                </p>
                <Badge
                  variant="outline"
                  className={`text-[10px] border ${statusConfig[selectedBooking.status].className}`}
                >
                  {statusConfig[selectedBooking.status].label}
                </Badge>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="size-4 text-[#D4A843] shrink-0" />
                  <span className="text-foreground">
                    {(() => {
                      try { return format(parseISO(selectedBooking.eventDate), 'MMMM dd, yyyy'); }
                      catch { return selectedBooking.eventDate; }
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="size-4 text-[#D4A843] shrink-0" />
                  <span className="text-foreground">{selectedBooking.eventTime}</span>
                </div>
                {selectedBooking.guestCount && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{selectedBooking.guestCount} guest{selectedBooking.guestCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-[#D4A843] font-semibold flex items-center gap-0.5">
                    <IndianRupee className="size-3.5" />
                    {selectedBooking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Advance Paid</span>
                  <span className="text-foreground">
                    ₹{selectedBooking.advancePaid.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="text-foreground">
                    ₹{(selectedBooking.totalAmount - selectedBooking.advancePaid).toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                  <div className="pt-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground/60">Payment History</p>
                    {selectedBooking.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{payment.method}</span>
                        <span className={payment.status === 'completed' ? 'text-emerald-500' : 'text-yellow-500'}>
                          ₹{payment.amount.toLocaleString('en-IN')} • {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Organizer Contact */}
              <div className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organizer</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground font-medium">
                    {selectedBooking.service.organizer.companyName}
                  </span>
                  {selectedBooking.service.organizer.isVerified && (
                    <Badge className="bg-[#D4A843]/20 text-[#D4A843] text-[10px] border-0">Verified</Badge>
                  )}
                </div>
                {selectedBooking.service.organizer.city && (
                  <p className="text-xs text-muted-foreground">{selectedBooking.service.organizer.city}</p>
                )}
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="rounded-xl border border-border bg-[#1a1a1a] p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</h4>
                  <p className="text-sm text-foreground">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Cancel button for pending/accepted bookings */}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'accepted') && (
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/bookings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: selectedBooking.id, status: 'cancelled' }),
                      });
                      if (res.ok) {
                        setSelectedBooking(null);
                        fetchBookings();
                      }
                    } catch { /* ignore */ }
                  }}
                  variant="outline"
                  className="w-full border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400"
                >
                  Cancel Booking
                </Button>
              )}

              {/* Review button for completed bookings */}
              {selectedBooking.status === 'completed' && !selectedBooking.review && (
                <Button
                  onClick={() => handleOpenReview(selectedBooking)}
                  className="w-full bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
                >
                  <MessageSquare className="size-4 mr-2" />
                  Write a Review
                </Button>
              )}

              {/* Show existing review */}
              {selectedBooking.review && (
                <div className="rounded-xl border border-[#D4A843]/20 bg-[#D4A843]/5 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 fill-[#D4A843] text-[#D4A843]" />
                    <span className="text-sm font-semibold text-foreground">{selectedBooking.review.rating}/5</span>
                    <span className="text-xs text-muted-foreground">Your Review</span>
                  </div>
                  {selectedBooking.review.comment && (
                    <p className="text-sm text-muted-foreground">{selectedBooking.review.comment}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-[#1a1a1a] border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Rating</label>
              <StarRating
                rating={reviewRating}
                size="lg"
                interactive
                onChange={setReviewRating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Comment</label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                className="bg-[#0f0f0f] border-border min-h-[80px] resize-none"
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || reviewRating === 0}
              className="w-full bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
            >
              {submittingReview ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
