'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, BadgeCheck, Briefcase, Clock,
  Star, MessageSquare, Heart, CalendarPlus, Share2,
  Phone, Mail, ExternalLink, ChevronRight, ShieldCheck,
  IndianRupee, Send, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { StarRating } from '@/components/shared/StarRating';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { OrganizerProfile, Service } from '@/lib/types';

interface OrganizerWithDetails extends OrganizerProfile {
  services: Service[];
}

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

export function OrganizerProfileView() {
  const { viewParams, setView, goBack, user } = useAppStore();
  const [organizer, setOrganizer] = useState<OrganizerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const organizerId = viewParams.organizerId;

  useEffect(() => {
    if (!organizerId) { setLoading(false); return; }
    const fetchOrganizer = async () => {
      try {
        const res = await fetch(`/api/organizers?id=${organizerId}`);
        if (res.ok) {
          const data = await res.json();
          setOrganizer(data);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchOrganizer();
  }, [organizerId]);

  // Check favorite status
  useEffect(() => {
    if (!organizerId || !user?.id) return;
    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const found = data.some(
            (f: { serviceId: string; service: { organizerId: string } }) =>
              f.service.organizerId === organizerId
          );
          setIsFavorite(found);
        }
      } catch { /* ignore */ }
    };
    checkFavorite();
  }, [organizerId, user?.id]);

  const handleToggleFavorite = async () => {
    if (!user?.id || !organizer?.services?.[0]?.id) return;
    setFavoriteLoading(true);
    try {
      // Toggle favorite on the first service of this organizer
      const serviceId = organizer.services[0].id;
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, serviceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch { /* ignore */ } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBookNow = (serviceId?: string) => {
    if (serviceId) {
      setShowBookingSheet(false);
      setView('booking-form', { serviceId });
    } else if (organizer?.services?.[0]?.id) {
      setShowBookingSheet(false);
      setView('booking-form', { serviceId: organizer.services[0].id });
    }
  };

  const handleChat = () => {
    if (!organizer) return;
    setView('chat', {
      organizerId: organizer.id,
      organizerUserId: organizer.userId,
      organizerName: organizer.companyName,
      organizerLogo: organizer.logo || '',
      organizerRating: String(organizer.rating),
      organizerVerified: String(organizer.isVerified),
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl bg-muted/40" />
        <div className="space-y-3 px-1">
          <Skeleton className="h-7 w-3/4 bg-muted/40" />
          <Skeleton className="h-5 w-1/2 bg-muted/40" />
          <Skeleton className="h-20 w-full bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="space-y-4">
        <PageHeader title="Organizer Not Found" onBack={goBack} />
        <p className="text-sm text-muted-foreground">
          The organizer profile you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const initials = organizer.companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5 pb-28">
      {/* Cover + Back Button */}
      <div className="relative rounded-xl overflow-hidden bg-muted/20">
        <div className="h-40 md:h-48 relative bg-gradient-to-br from-[#8B1A2B]/60 to-[#D4A843]/30">
          {organizer.coverImage ? (
            <img src={organizer.coverImage} alt="Cover" className="size-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-20 rounded-full bg-white/5 flex items-center justify-center">
                <Briefcase className="size-8 text-white/20" />
              </div>
            </div>
          )}
          {/* Back button */}
          <button
            onClick={goBack}
            className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-[#0f0f0f]/60 backdrop-blur-sm text-white hover:bg-[#0f0f0f]/80 transition-colors z-10"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          {/* Share button */}
          <button
            onClick={() => setShowShareDialog(true)}
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-[#0f0f0f]/60 backdrop-blur-sm text-white hover:bg-[#0f0f0f]/80 transition-colors z-10"
            aria-label="Share"
          >
            <Share2 className="size-4" />
          </button>
        </div>

        {/* Logo overlapping */}
        <div className="px-4 -mt-12 relative z-10">
          <Avatar className="size-20 border-4 border-[#0f0f0f] shrink-0">
            <AvatarImage src={organizer.logo} alt={organizer.companyName} />
            <AvatarFallback className="bg-[#8B1A2B]/30 text-[#D4A843] text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Company Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3 -mt-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{organizer.companyName}</h1>
              {organizer.isVerified && (
                <BadgeCheck className="size-5 shrink-0 text-[#D4A843]" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={organizer.rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {organizer.rating.toFixed(1)} ({organizer.reviewCount} reviews)
              </span>
            </div>
          </div>
          <Badge
            className={`shrink-0 text-[10px] ${
              organizer.isAvailable
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
            }`}
          >
            {organizer.isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          {organizer.city && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-[#1a1a1a] border border-border rounded-lg px-2.5 py-1.5">
              <MapPin className="size-3.5 text-[#D4A843]" />
              <span>{organizer.city}{organizer.state ? `, ${organizer.state}` : ''}</span>
            </div>
          )}
          {organizer.experience > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-[#1a1a1a] border border-border rounded-lg px-2.5 py-1.5">
              <Clock className="size-3.5 text-[#D4A843]" />
              <span>{organizer.experience} yr{organizer.experience !== 1 ? 's' : ''} exp</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-[#1a1a1a] border border-border rounded-lg px-2.5 py-1.5">
            <Briefcase className="size-3.5 text-[#D4A843]" />
            <span>{organizer.services.length} service{organizer.services.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {/* ★ PRIMARY ACTION BUTTONS — Book, Favorite, Chat ★ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>

        <div className="grid grid-cols-3 gap-2">
          {/* Book Now */}
          <Button
            onClick={() => {
              if (organizer.services.length === 1) {
                handleBookNow(organizer.services[0].id);
              } else {
                setShowBookingSheet(true);
              }
            }}
            className="flex flex-col items-center justify-center gap-1.5 h-auto py-3 bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white rounded-xl"
          >
            <CalendarPlus className="size-5" />
            <span className="text-[11px] font-semibold">Book Now</span>
          </Button>

          {/* Favorite */}
          <Button
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            variant="outline"
            className={`flex flex-col items-center justify-center gap-1.5 h-auto py-3 rounded-xl border transition-all duration-200 ${
              isFavorite
                ? 'border-[#8B1A2B]/40 bg-[#8B1A2B]/10 text-[#8B1A2B]'
                : 'border-border bg-[#1a1a1a] text-muted-foreground hover:border-[#8B1A2B]/30 hover:text-foreground'
            }`}
          >
            {favoriteLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Heart className={`size-5 transition-transform duration-200 ${isFavorite ? 'fill-current scale-110' : ''}`} />
            )}
            <span className="text-[11px] font-semibold">{isFavorite ? 'Saved' : 'Favorite'}</span>
          </Button>

          {/* Chat */}
          <Button
            onClick={handleChat}
            variant="outline"
            className="flex flex-col items-center justify-center gap-1.5 h-auto py-3 rounded-xl border border-border bg-[#1a1a1a] text-muted-foreground hover:border-[#D4A843]/30 hover:text-foreground transition-all duration-200"
          >
            <MessageSquare className="size-5" />
            <span className="text-[11px] font-semibold">Chat</span>
          </Button>
        </div>

        {/* Price hint */}
        {organizer.services.length > 0 && (
          <p className="text-[11px] text-muted-foreground text-center">
            Starting from{' '}
            <span className="text-[#D4A843] font-semibold">
              ₹{Math.min(...organizer.services.map((s) => s.price)).toLocaleString('en-IN')}
            </span>
          </p>
        )}
      </motion.div>

      {/* Description */}
      {organizer.description && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-xl border border-border bg-[#1a1a1a] p-4"
        >
          <h2 className="text-sm font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {organizer.description}
          </p>
        </motion.div>
      )}

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Contact</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#8B1A2B]/15">
                <Mail className="size-3.5 text-[#D4A843]" />
              </div>
              <div>
                <p className="text-foreground font-medium">{organizer.user.name}</p>
                <p className="text-xs text-muted-foreground">{organizer.user.email}</p>
              </div>
            </div>
            {organizer.user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#8B1A2B]/15">
                  <Phone className="size-3.5 text-[#D4A843]" />
                </div>
                <span className="text-muted-foreground">{organizer.user.phone}</span>
              </div>
            )}
            {organizer.address && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#8B1A2B]/15">
                  <MapPin className="size-3.5 text-[#D4A843]" />
                </div>
                <span className="text-muted-foreground">{organizer.address}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <Separator className="bg-white/[0.06]" />

      {/* Services by this Organizer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Services</h2>
          <span className="text-xs text-muted-foreground">{organizer.services.length} available</span>
        </div>
        {organizer.services.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {organizer.services.map((service) => (
              <motion.div key={service.id} variants={staggerItem}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<Briefcase className="size-8" />}
            title="No services listed"
            description="This organizer hasn't listed any services yet."
          />
        )}
      </motion.div>

      {/* ─── FIXED BOTTOM ACTION BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-white/[0.06] p-3 md:left-[240px]">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          {/* Favorite (left) */}
          <Button
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            variant="outline"
            size="icon"
            className={`size-11 shrink-0 rounded-xl transition-all duration-200 ${
              isFavorite
                ? 'border-[#8B1A2B]/40 bg-[#8B1A2B]/10 text-[#8B1A2B]'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {favoriteLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} />
            )}
          </Button>

          {/* Chat (middle) */}
          <Button
            onClick={handleChat}
            variant="outline"
            className="flex-1 gap-2 border-[#D4A843]/30 bg-[#D4A843]/5 text-[#D4A843] hover:bg-[#D4A843]/10 hover:text-[#D4A843] rounded-xl h-11"
          >
            <MessageSquare className="size-4" />
            <span className="text-sm font-semibold">Chat</span>
          </Button>

          {/* Book Now (right - prominent) */}
          <Button
            onClick={() => {
              if (organizer.services.length === 1) {
                handleBookNow(organizer.services[0].id);
              } else {
                setShowBookingSheet(true);
              }
            }}
            className="flex-1 gap-2 bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white font-semibold rounded-xl h-11"
          >
            <CalendarPlus className="size-4" />
            <span>Book Now</span>
          </Button>
        </div>
      </div>

      {/* ─── SERVICE SELECTION SHEET ─── */}
      <Sheet open={showBookingSheet} onOpenChange={setShowBookingSheet}>
        <SheetContent className="bg-[#0f0f0f] border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-foreground">Select a Service to Book</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3 max-h-[70vh] overflow-y-auto">
            {organizer.services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleBookNow(service.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-[#1a1a1a] hover:border-[#8B1A2B]/30 hover:bg-[#8B1A2B]/5 transition-all duration-200 text-left"
              >
                {/* Service image */}
                <div className="size-14 shrink-0 rounded-lg overflow-hidden bg-muted/20">
                  {service.images?.[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-gradient-to-br from-[#8B1A2B]/20 to-[#D4A843]/10">
                      <Briefcase className="size-5 text-[#D4A843]/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{service.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#D4A843] font-semibold">
                      ₹{service.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {service.priceType === 'per_person' ? '/person' : service.priceType === 'hourly' ? '/hr' : ''}
                    </span>
                    {service.duration && (
                      <span className="text-[10px] text-muted-foreground">{service.duration}</span>
                    )}
                  </div>
                </div>

                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}

            {organizer.services.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No services available</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── SHARE DIALOG ─── */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#1a1a1a] border-white/[0.08] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Share Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share {organizer.companyName}&apos;s profile with others
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-4">
            {['WhatsApp', 'Twitter', 'Email', 'Copy Link'].map((platform) => (
              <button
                key={platform}
                onClick={() => setShowShareDialog(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-[#8B1A2B]/30 hover:bg-[#8B1A2B]/5 transition-colors"
              >
                <Share2 className="size-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{platform}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
