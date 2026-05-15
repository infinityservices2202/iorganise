'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

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

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const status = statusConfig[booking.status];

  const formattedDate = (() => {
    try {
      return format(parseISO(booking.eventDate), 'MMM dd, yyyy');
    } catch {
      return booking.eventDate;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'cursor-pointer rounded-xl border border-border bg-[#1a1a1a]',
        'p-4 transition-all duration-200',
        'hover:border-[#8B1A2B]/30 hover:shadow-[0_2px_12px_rgba(139,26,43,0.1)]'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {booking.service.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            by {booking.service.organizer.companyName}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('shrink-0 text-[10px] border', status.className)}
        >
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>{booking.eventTime}</span>
        </div>
      </div>

      {booking.guestCount && (
        <p className="text-xs text-muted-foreground/60 mt-1.5">
          {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-0.5 text-sm font-semibold text-[#D4A843]">
          <IndianRupee className="size-3.5" />
          <span>{booking.totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50">
          Advance: ₹{booking.advancePaid.toLocaleString('en-IN')}
        </span>
      </div>
    </motion.div>
  );
}
