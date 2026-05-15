'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, PartyPopper, ClipboardList, UtensilsCrossed, Camera, Palette, Music, Building2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { OrganizerCard } from '@/components/shared/OrganizerCard';
import { BookingCard } from '@/components/shared/BookingCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { StarRating } from '@/components/shared/StarRating';
import type { Service, OrganizerProfile, Booking, Category } from '@/lib/types';

// Lucide icon map for categories
const categoryIconMap: Record<string, React.ReactNode> = {
  PartyPopper: <PartyPopper className="size-5" />,
  ClipboardList: <ClipboardList className="size-5" />,
  UtensilsCrossed: <UtensilsCrossed className="size-5" />,
  Camera: <Camera className="size-5" />,
  Palette: <Palette className="size-5" />,
  Music: <Music className="size-5" />,
  Building2: <Building2 className="size-5" />,
  Sparkles: <Sparkles className="size-5" />,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 w-56">
          <Skeleton className="aspect-[16/10] rounded-xl bg-muted/40" />
          <div className="mt-2 space-y-2 px-1">
            <Skeleton className="h-4 w-3/4 bg-muted/40" />
            <Skeleton className="h-3 w-1/2 bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}

export function CustomerDashboard() {
  const { user, setView } = useAppStore();
  const [services, setServices] = useState<Service[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<(Category & { serviceCount?: number })[]>([]);
  const [loading, setLoading] = useState({ services: true, organizers: true, bookings: true, categories: true });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services?limit=8&sortBy=rating');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch { /* ignore */ } finally {
      setLoading((p) => ({ ...p, services: false }));
    }
  }, []);

  const fetchOrganizers = useCallback(async () => {
    try {
      const res = await fetch('/api/organizers?isVerified=true');
      if (res.ok) {
        const data = await res.json();
        setOrganizers(data.slice(0, 6));
      }
    } catch { /* ignore */ } finally {
      setLoading((p) => ({ ...p, organizers: false }));
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) { setLoading((p) => ({ ...p, bookings: false })); return; }
    try {
      const res = await fetch(`/api/bookings?customerId=${user.id}&limit=3`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.slice(0, 3));
      }
    } catch { /* ignore */ } finally {
      setLoading((p) => ({ ...p, bookings: false }));
    }
  }, [user?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch { /* ignore */ } finally {
      setLoading((p) => ({ ...p, categories: false }));
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchOrganizers();
    fetchBookings();
    fetchCategories();
  }, [fetchServices, fetchOrganizers, fetchBookings, fetchCategories]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setView('customer-search', { search: searchQuery.trim() });
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 pb-4">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Hello, {firstName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search events, services, organizers..."
        />
      </motion.div>

      {/* Categories Quick Access */}
      {!loading.categories && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setView('customer-search', { categoryId: cat.id })}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-[#1a1a1a] border border-border group-hover:border-[#8B1A2B]/40 group-hover:bg-[#8B1A2B]/10 transition-all duration-200">
                  <span className="text-[#D4A843]">
                    {categoryIconMap[cat.icon || ''] || <Sparkles className="size-5" />}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors max-w-[72px] truncate">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Featured Services */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Featured Services</h2>
          <button
            onClick={() => setView('customer-search')}
            className="flex items-center gap-0.5 text-xs text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
          >
            View All <ChevronRight className="size-3.5" />
          </button>
        </div>
        {loading.services ? (
          <SectionSkeleton count={4} />
        ) : services.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
          >
            {services.map((service) => (
              <motion.div key={service.id} variants={staggerItem} className="shrink-0 w-60">
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No services available yet.</p>
        )}
      </section>

      {/* Trending Organizers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Trending Organizers</h2>
          <button
            onClick={() => setView('customer-search')}
            className="flex items-center gap-0.5 text-xs text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
          >
            View All <ChevronRight className="size-3.5" />
          </button>
        </div>
        {loading.organizers ? (
          <SectionSkeleton count={3} />
        ) : organizers.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
          >
            {organizers.map((org) => (
              <motion.div key={org.id} variants={staggerItem} className="shrink-0 w-72">
                <OrganizerCard organizer={org} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No organizers available yet.</p>
        )}
      </section>

      {/* Recommended Services Grid */}
      {!loading.services && services.length > 4 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recommended For You</h2>
            <button
              onClick={() => setView('customer-search')}
              className="flex items-center gap-0.5 text-xs text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
            >
              Explore <ChevronRight className="size-3.5" />
            </button>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {services.slice(3, 9).map((service) => (
              <motion.div key={service.id} variants={staggerItem}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Recent Bookings */}
      {user?.id && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
            <button
              onClick={() => setView('customer-bookings')}
              className="flex items-center gap-0.5 text-xs text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
            >
              View All <ChevronRight className="size-3.5" />
            </button>
          </div>
          {loading.bookings ? (
            <BookingSkeleton />
          ) : bookings.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {bookings.map((booking) => (
                <motion.div key={booking.id} variants={staggerItem}>
                  <BookingCard
                    booking={booking}
                    onClick={() => setView('customer-bookings')}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-xl border border-border bg-[#1a1a1a] p-6 text-center">
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
              <button
                onClick={() => setView('customer-search')}
                className="mt-2 text-xs text-[#D4A843] hover:underline"
              >
                Browse services to book
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
