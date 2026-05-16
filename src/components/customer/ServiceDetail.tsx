'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Users, BadgeCheck,
  ChevronLeft, ChevronRight, IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { StarRating } from '@/components/shared/StarRating';
import type { Service } from '@/lib/types';

const priceTypeLabels: Record<Service['priceType'], string> = {
  fixed: 'Fixed Price',
  hourly: 'Per Hour',
  per_person: 'Per Person',
};

export function ServiceDetail() {
  const { viewParams, setView, goBack } = useAppStore();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleBookNow = () => {
    if (service) {
      setView('booking-form', { serviceId: service.id });
    }
  };

  const nextImage = () => {
    if (!service) return;
    setCurrentImageIndex((prev) =>
      prev < service.images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    if (!service) return;
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : service.images.length - 1
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[16/9] rounded-xl bg-muted/40" />
        <div className="space-y-3 px-1">
          <Skeleton className="h-7 w-3/4 bg-muted/40" />
          <Skeleton className="h-5 w-1/2 bg-muted/40" />
          <Skeleton className="h-20 w-full bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-4">
        <PageHeader title="Service Not Found" onBack={goBack} />
        <p className="text-sm text-muted-foreground">
          The service you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const images = service.images.length > 0 ? service.images : [''];

  return (
    <div className="space-y-5 pb-24">
      {/* Image Gallery */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted/20">
        {images[0] ? (
          <img
            src={images[currentImageIndex]}
            alt={service.title}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-muted-foreground/40">No image</span>
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-[#0f0f0f]/60 backdrop-blur-sm text-white hover:bg-[#0f0f0f]/80 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-[#0f0f0f]/60 backdrop-blur-sm text-white hover:bg-[#0f0f0f]/80 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`size-1.5 rounded-full transition-all duration-200 ${
                    i === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Back button overlay */}
        <button
          onClick={goBack}
          className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-[#0f0f0f]/60 backdrop-blur-sm text-white hover:bg-[#0f0f0f]/80 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {/* Title & Price */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground leading-tight flex-1">
            {service.title}
          </h1>
          <Badge className="shrink-0 bg-[#8B1A2B]/20 text-[#D4A843] border-0 text-[10px]">
            {service.category.name}
          </Badge>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <StarRating rating={service.rating} size="sm" />
            <span className="text-sm text-muted-foreground">
              {service.rating} ({service.reviewCount} reviews)
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-[#D4A843]">
            ₹{service.price.toLocaleString('en-IN')}
          </span>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            {priceTypeLabels[service.priceType]}
          </Badge>
        </div>
      </motion.div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-3 flex-wrap"
      >
        {service.duration && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-[#1a1a1a] border border-border rounded-lg px-3 py-2">
            <Clock className="size-4 text-[#D4A843]" />
            <span>{service.duration}</span>
          </div>
        )}
        {service.maxGuests && service.maxGuests > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-[#1a1a1a] border border-border rounded-lg px-3 py-2">
            <Users className="size-4 text-[#D4A843]" />
            <span>Up to {service.maxGuests} guests</span>
          </div>
        )}
      </motion.div>

      {/* Organizer Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        onClick={() => setView('organizer-profile', { organizerId: service.organizer.id })}
        className="cursor-pointer rounded-xl border border-border bg-[#1a1a1a] p-4 flex items-center gap-3 transition-all duration-200 hover:border-[#8B1A2B]/30 hover:shadow-[0_2px_12px_rgba(139,26,43,0.1)]"
      >
        <Avatar className="size-12 shrink-0 border border-border">
          <AvatarImage src={service.organizer.logo} alt={service.organizer.companyName} />
          <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-sm font-semibold">
            {service.organizer.companyName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {service.organizer.companyName}
            </h3>
            {service.organizer.isVerified && (
              <BadgeCheck className="size-4 shrink-0 text-[#D4A843]" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {service.organizer.city && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>{service.organizer.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <StarRating rating={service.organizer.rating} size="sm" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="text-base font-semibold text-foreground">About this service</h2>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {service.description}
        </p>
      </motion.div>

      {/* Fixed Book Now Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-sm border-t border-border p-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:pt-2">
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="lg:hidden">
            <p className="text-xs text-muted-foreground">Total Price</p>
            <p className="text-lg font-bold text-[#D4A843]">
              ₹{service.price.toLocaleString('en-IN')}
            </p>
          </div>
          <Button
            onClick={handleBookNow}
            className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white font-semibold px-8 py-3 lg:py-2 lg:px-6 rounded-lg"
            size="lg"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
