'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Users, IndianRupee,
  CheckCircle2, Loader2, AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Service } from '@/lib/types';

const priceTypeLabels: Record<Service['priceType'], string> = {
  fixed: 'Fixed',
  hourly: '/hr',
  per_person: '/person',
};

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
];

export function BookingForm() {
  const { viewParams, user, setView, goBack } = useAppStore();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [notes, setNotes] = useState('');

  const serviceId = viewParams.serviceId;

  useEffect(() => {
    if (!serviceId) { setLoading(false); return; }
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services?id=${serviceId}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const totalPrice = useMemo(() => {
    if (!service) return 0;
    if (service.priceType === 'per_person') {
      return service.price * (parseInt(guestCount) || 1);
    }
    return service.price;
  }, [service, guestCount]);

  const advanceAmount = useMemo(() => {
    return Math.round(totalPrice * 0.4);
  }, [totalPrice]);

  const isFormValid = useMemo(() => {
    return selectedDate && selectedTime && parseInt(guestCount) > 0;
  }, [selectedDate, selectedTime, guestCount]);

  const handleSubmit = async () => {
    if (!user || !service || !isFormValid) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          serviceId: service.id,
          eventDate: selectedDate!.toISOString(),
          eventTime: selectedTime,
          guestCount: parseInt(guestCount),
          notes: notes.trim() || undefined,
          totalAmount: totalPrice,
        }),
      });

      if (res.ok) {
        const booking = await res.json();
        // Navigate to payment page
        setView('payment-page', {
          bookingId: booking.id,
          serviceTitle: service.title,
          totalAmount: String(totalPrice),
          advanceAmount: String(advanceAmount),
        });
        return;
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create booking');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl bg-muted/40" />
        <Skeleton className="h-64 rounded-xl bg-muted/40" />
        <Skeleton className="h-40 rounded-xl bg-muted/40" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-4">
        <PageHeader title="Service Not Found" onBack={goBack} />
        <p className="text-sm text-muted-foreground">
          The service could not be found.
        </p>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center py-16 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        >
          <CheckCircle2 className="size-20 text-emerald-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your booking for {service.title} has been submitted. The organizer will confirm shortly.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-2"
        >
          <Button
            onClick={() => setView('customer-bookings')}
            className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
          >
            View My Bookings
          </Button>
          <Button
            variant="outline"
            onClick={() => setView('customer-home')}
            className="border-border"
          >
            Go Home
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <PageHeader title="Book Service" onBack={goBack} />

      {/* Service Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-[#1a1a1a] p-4 flex gap-4"
      >
        <div className="size-20 shrink-0 rounded-lg overflow-hidden bg-muted/20">
          {service.images[0] ? (
            <img
              src={service.images[0]}
              alt={service.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="text-[10px] text-muted-foreground/40">No img</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{service.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{service.organizer.companyName}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-base font-bold text-[#D4A843]">
              ₹{service.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {priceTypeLabels[service.priceType]}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Date Picker */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <CalendarIcon className="size-4 text-[#D4A843]" />
          Event Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal border-border bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 ${
                !selectedDate && 'text-muted-foreground'
              }`}
            >
              <CalendarIcon className="size-4 mr-2" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-border" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Time Selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Clock className="size-4 text-[#D4A843]" />
          Event Time
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`py-2 text-xs rounded-lg border transition-all duration-200 ${
                selectedTime === time
                  ? 'border-[#8B1A2B] bg-[#8B1A2B]/20 text-[#D4A843] font-semibold'
                  : 'border-border bg-[#1a1a1a] text-muted-foreground hover:border-[#8B1A2B]/30 hover:bg-[#1a1a1a]/80'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Guest Count */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Users className="size-4 text-[#D4A843]" />
          Number of Guests
        </label>
        <Input
          type="number"
          min="1"
          max={service.maxGuests || 9999}
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          className="bg-[#1a1a1a] border-border"
          placeholder="Number of guests"
        />
        {service.maxGuests && service.maxGuests > 0 && (
          <p className="text-xs text-muted-foreground">Maximum {service.maxGuests} guests</p>
        )}
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-foreground">
          Special Requests / Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-[#1a1a1a] border-border min-h-[80px] resize-none"
          placeholder="Any special requirements..."
        />
      </motion.div>

      {/* Price Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground">Price Summary</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Service Price
              {service.priceType === 'per_person' && (
                <span className="text-xs"> × {guestCount} guests</span>
              )}
            </span>
            <span className="text-foreground">₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Advance Payment (40%)</span>
            <span className="text-[#D4A843] font-semibold">
              ₹{advanceAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-t border-border/50 pt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className="text-sm text-foreground">
              ₹{(totalPrice - advanceAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isFormValid || submitting}
        className="w-full bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Confirming...
          </>
        ) : (
          `Confirm Booking — ₹${advanceAmount.toLocaleString('en-IN')} Advance`
        )}
      </Button>
    </div>
  );
}
