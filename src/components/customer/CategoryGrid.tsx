'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PartyPopper, ClipboardList, UtensilsCrossed, Camera,
  Palette, Music, Building2, Sparkles, Search,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Category } from '@/lib/types';

interface CategoryWithCount extends Category {
  serviceCount?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  PartyPopper: <PartyPopper className="size-7" />,
  ClipboardList: <ClipboardList className="size-7" />,
  UtensilsCrossed: <UtensilsCrossed className="size-7" />,
  Camera: <Camera className="size-7" />,
  Palette: <Palette className="size-7" />,
  Music: <Music className="size-7" />,
  Building2: <Building2 className="size-7" />,
  Sparkles: <Sparkles className="size-7" />,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function CategoryGrid() {
  const { setView } = useAppStore();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Browse by category" />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search categories..."
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Search className="size-8" />}
          title="No categories found"
          description={searchQuery ? 'Try a different search term' : undefined}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('customer-search', { categoryId: category.id })}
              className="cursor-pointer rounded-xl border border-border bg-[#1a1a1a] p-5 flex flex-col items-center text-center gap-3 transition-shadow duration-300 hover:shadow-[0_4px_20px_rgba(139,26,43,0.15)] hover:border-[#8B1A2B]/30"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-[#8B1A2B]/15 text-[#D4A843]">
                {iconMap[category.icon || ''] || <Sparkles className="size-7" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                {category.serviceCount !== undefined && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {category.serviceCount} service{category.serviceCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {category.description && (
                <p className="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
