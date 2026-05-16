'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, ChevronDown, Search, ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { StarRating } from '@/components/shared/StarRating';
import type { Service, Category } from '@/lib/types';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function SearchPage() {
  const { viewParams } = useAppStore();
  const setView = useAppStore((s) => s.setView);

  const [searchQuery, setSearchQuery] = useState(viewParams.search || '');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(viewParams.categoryId || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const LIMIT = 12;

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
      } catch { /* ignore */ }
    };
    fetchCategories();
  }, []);

  const buildQuery = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      params.set('limit', String(LIMIT));
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRating > 0) params.set('minRating', String(minRating));
      if (city.trim()) params.set('city', city.trim());
      if (sortBy) params.set('sortBy', sortBy);
      return `/api/services?${params.toString()}`;
    },
    [searchQuery, selectedCategory, minPrice, maxPrice, minRating, city, sortBy]
  );

  const fetchServices = useCallback(
    async (offset = 0, append = false) => {
      setLoading(true);
      try {
        const res = await fetch(buildQuery(offset));
        if (res.ok) {
          const data: Service[] = await res.json();
          if (append) {
            setServices((prev) => [...prev, ...data]);
          } else {
            setServices(data);
          }
          setHasMore(data.length === LIMIT);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  // Initial fetch and when filters change
  useEffect(() => {
    setPage(0);
    fetchServices(0, false);
  }, [selectedCategory, minPrice, maxPrice, minRating, city, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchServices(0, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    setPage(0);
    fetchServices(0, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchServices(nextPage * LIMIT, true);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setCity('');
    setSortBy('newest');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (minRating > 0) count++;
    if (city.trim()) count++;
    return count;
  }, [selectedCategory, minPrice, maxPrice, minRating, city]);

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-[#0f0f0f] pt-1 pb-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search services..."
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative shrink-0 border-border bg-[#1a1a1a] hover:bg-[#1a1a1a]/80"
          >
            <SlidersHorizontal className="size-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#8B1A2B] text-[10px] text-white font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#8B1A2B] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-[#0f0f0f] border-border text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-border">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-[#0f0f0f] border-border text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-[#0f0f0f] border-border text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Minimum Rating</label>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={minRating}
                    size="md"
                    interactive
                    onChange={setMinRating}
                  />
                  {minRating > 0 && (
                    <button
                      onClick={() => setMinRating(0)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* City Filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">City</label>
                <Input
                  placeholder="e.g. Mumbai, Delhi..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-[#0f0f0f] border-border text-sm"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-[#0f0f0f] border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-border">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge
              variant="outline"
              className="gap-1 border-[#8B1A2B]/30 bg-[#8B1A2B]/10 text-[#D4A843] cursor-pointer"
              onClick={() => setSelectedCategory('')}
            >
              {categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
              <X className="size-3" />
            </Badge>
          )}
          {(minPrice || maxPrice) && (
            <Badge
              variant="outline"
              className="gap-1 border-[#8B1A2B]/30 bg-[#8B1A2B]/10 text-[#D4A843] cursor-pointer"
              onClick={() => { setMinPrice(''); setMaxPrice(''); }}
            >
              ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
              <X className="size-3" />
            </Badge>
          )}
          {minRating > 0 && (
            <Badge
              variant="outline"
              className="gap-1 border-[#8B1A2B]/30 bg-[#8B1A2B]/10 text-[#D4A843] cursor-pointer"
              onClick={() => setMinRating(0)}
            >
              {minRating}+ Stars
              <X className="size-3" />
            </Badge>
          )}
          {city.trim() && (
            <Badge
              variant="outline"
              className="gap-1 border-[#8B1A2B]/30 bg-[#8B1A2B]/10 text-[#D4A843] cursor-pointer"
              onClick={() => setCity('')}
            >
              {city}
              <X className="size-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      {loading && services.length === 0 ? (
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
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Search className="size-8" />}
          title="No services found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {services.map((service) => (
              <motion.div key={service.id} variants={staggerItem}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="border-border bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-foreground"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
