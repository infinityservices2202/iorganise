'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  sm: 'size-3.5',
  md: 'size-5',
  lg: 'size-6',
};

const gapMap = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={cn('flex items-center', gapMap[size])}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;
        const isHalfFilled =
          !isFilled && starValue - 0.5 <= displayRating && starValue > displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={cn(
              'relative transition-transform duration-150',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => {
              if (interactive && onChange) {
                onChange(starValue);
              }
            }}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            {/* Background star (outline) */}
            <Star
              className={cn(
                sizeMap[size],
                'text-muted-foreground/40'
              )}
            />
            {/* Foreground star (filled) */}
            {(isFilled || isHalfFilled) && (
              <Star
                className={cn(
                  sizeMap[size],
                  'absolute inset-0 fill-[#D4A843] text-[#D4A843]',
                  isHalfFilled && 'clip-path-half'
                )}
                style={
                  isHalfFilled
                    ? { clipPath: 'inset(0 50% 0 0)' }
                    : undefined
                }
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
