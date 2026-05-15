'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { StarRating } from './StarRating';
import type { Service } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
}

const priceTypeLabels: Record<Service['priceType'], string> = {
  fixed: 'Fixed',
  hourly: '/hr',
  per_person: '/person',
};

export function ServiceCard({ service }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const setView = useAppStore((s) => s.setView);

  const handleClick = () => {
    setView('service-detail', { serviceId: service.id });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn(
        'group cursor-pointer rounded-xl border border-border bg-[#1a1a1a]',
        'transition-shadow duration-300',
        'hover:shadow-[0_4px_20px_rgba(139,26,43,0.15)]',
        'overflow-hidden'
      )}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted/20">
        {service.images[0] ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#8B1A2B]/20 to-[#D4A843]/10">
            <span className="text-[#D4A843]/40 text-xs font-medium">{service.category.name}</span>
          </div>
        )}

        {/* Category badge */}
        <Badge
          className="absolute top-3 left-3 bg-[#1a1a1a]/80 text-white border-0 text-[10px] backdrop-blur-sm"
        >
          {service.category.name}
        </Badge>

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={cn(
            'absolute top-3 right-3 flex size-8 items-center justify-center rounded-full',
            'bg-[#1a1a1a]/60 backdrop-blur-sm transition-all duration-200',
            'hover:bg-[#1a1a1a]/80'
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'size-4 transition-colors duration-200',
              isFavorite
                ? 'fill-[#8B1A2B] text-[#8B1A2B]'
                : 'text-white/70 hover:text-white'
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
          {service.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          {service.organizer.city && (
            <>
              <MapPin className="size-3" />
              <span>{service.organizer.city}</span>
              <span className="text-muted-foreground/40">·</span>
            </>
          )}
          <span>{service.organizer.companyName}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={service.rating} size="sm" />
          <span className="text-xs text-muted-foreground">
            ({service.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-[#D4A843]">
              ₹{service.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {priceTypeLabels[service.priceType]}
            </span>
          </div>

          {service.duration && (
            <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
              {service.duration}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
