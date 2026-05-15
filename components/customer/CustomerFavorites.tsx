'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Favorite } from '@/lib/types';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function CustomerFavorites() {
  const { user, setView } = useAppStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (serviceId: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, serviceId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.isFavorite) {
          // Removed from favorites
          setFavorites((prev) => prev.filter((f) => f.serviceId !== serviceId));
        }
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Favorites" subtitle={`${favorites.length} saved service${favorites.length !== 1 ? 's' : ''}`} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[16/10] rounded-xl bg-muted/40" />
              <div className="mt-2 space-y-2 px-1">
                <Skeleton className="h-4 w-3/4 bg-muted/40" />
                <Skeleton className="h-3 w-1/2 bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-8" />}
          title="No favorites yet"
          description="Browse services and tap the heart icon to save your favorites"
          actionLabel="Browse Services"
          onAction={() => setView('customer-search')}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {favorites.map((favorite) => (
            <motion.div key={favorite.id} variants={staggerItem} className="relative group">
              <ServiceCard service={favorite.service} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(favorite.serviceId);
                }}
                className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-[#1a1a1a]/60 backdrop-blur-sm transition-all duration-200 hover:bg-[#1a1a1a]/80"
                aria-label="Remove from favorites"
              >
                <Heart className="size-4 fill-[#8B1A2B] text-[#8B1A2B] transition-transform duration-200 group-hover:scale-110" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
