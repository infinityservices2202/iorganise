'use client';

import { motion } from 'framer-motion';
import { MapPin, BadgeCheck, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { StarRating } from './StarRating';
import type { OrganizerProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OrganizerCardProps {
  organizer: OrganizerProfile;
}

export function OrganizerCard({ organizer }: OrganizerCardProps) {
  const setView = useAppStore((s) => s.setView);

  const handleClick = () => {
    setView('organizer-profile', { organizerId: organizer.id });
  };

  const initials = organizer.companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn(
        'group cursor-pointer rounded-xl border border-border bg-[#1a1a1a]',
        'p-4 transition-shadow duration-300',
        'hover:shadow-[0_4px_20px_rgba(139,26,43,0.15)]'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <Avatar className="size-12 shrink-0 border border-border">
          <AvatarImage src={organizer.logo} alt={organizer.companyName} />
          <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {organizer.companyName}
            </h3>
            {organizer.isVerified && (
              <BadgeCheck className="size-4 shrink-0 text-[#D4A843]" />
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={organizer.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({organizer.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {organizer.city && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>{organizer.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="size-3" />
              <span>{organizer.services.length} service{organizer.services.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {organizer.experience > 0 && (
            <p className="text-[10px] text-muted-foreground/60 mt-1.5">
              {organizer.experience} year{organizer.experience !== 1 ? 's' : ''} experience
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
