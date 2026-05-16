'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Save,
  Image as ImageIcon,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { StarRating } from '@/components/shared/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { OrganizerProfile } from '@/lib/types';

interface ProfileFormData {
  companyName: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  city: string;
  state: string;
  experience: string;
  isAvailable: boolean;
}

export function OrganizerProfileEdit() {
  const { user } = useAppStore();
  const [organizerId, setOrganizerId] = useState<string>('');
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProfileFormData>({
    companyName: '',
    description: '',
    logo: '',
    coverImage: '',
    address: '',
    city: '',
    state: '',
    experience: '0',
    isAvailable: true,
  });

  const fetchOrganizerId = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/organizers');
      if (res.ok) {
        const organizers = await res.json();
        const org = organizers.find((o: { userId: string }) => o.userId === user.id);
        if (org) setOrganizerId(org.id);
      }
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizerId();
  }, [fetchOrganizerId]);

  const fetchProfile = useCallback(async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/organizers?id=${organizerId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm({
          companyName: data.companyName || '',
          description: data.description || '',
          logo: data.logo || '',
          coverImage: data.coverImage || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          experience: String(data.experience || 0),
          isAvailable: data.isAvailable ?? true,
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!organizerId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/organizers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: organizerId,
          companyName: form.companyName,
          description: form.description,
          logo: form.logo || null,
          coverImage: form.coverImage || null,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          experience: parseInt(form.experience) || 0,
          isAvailable: form.isAvailable,
        }),
      });
      if (res.ok) {
        await fetchProfile();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-4"
    >
      <PageHeader title="Company Profile" />

      {/* Profile Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-[#1a1a1a] border-white/[0.08] overflow-hidden">
          {/* Cover Image */}
          <div className="h-28 md:h-36 relative bg-gradient-to-br from-[#8B1A2B]/40 to-[#D4A843]/20">
            {profile?.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="size-8 text-white/20" />
              </div>
            )}
          </div>

          <CardContent className="p-4 -mt-10 relative">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-xl border-4 border-[#1a1a1a] overflow-hidden bg-[#0f0f0f] shrink-0">
                {profile?.logo ? (
                  <img
                    src={profile.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="size-8 text-[#D4A843]/50" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground truncate">
                    {profile?.companyName || 'Company Name'}
                  </h2>
                  {profile?.isVerified && (
                    <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/20 text-[10px] gap-1">
                      <ShieldCheck className="size-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={profile?.rating || 0} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    ({profile?.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-[#1a1a1a] border-white/[0.08]">
          <CardContent className="p-4 md:p-6 space-y-5">
            {/* Company Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="size-4 text-[#D4A843]" />
                Company Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs text-muted-foreground">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Your company name"
                    className="bg-white/[0.05] border-white/[0.08] text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tell customers about your company and services..."
                    className="bg-white/[0.05] border-white/[0.08] text-foreground min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo" className="text-xs text-muted-foreground">
                      Logo URL
                    </Label>
                    <Input
                      id="logo"
                      value={form.logo}
                      onChange={(e) => setForm({ ...form, logo: e.target.value })}
                      placeholder="https://example.com/logo.jpg"
                      className="bg-white/[0.05] border-white/[0.08] text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverImage" className="text-xs text-muted-foreground">
                      Cover Image URL
                    </Label>
                    <Input
                      id="coverImage"
                      value={form.coverImage}
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                      placeholder="https://example.com/cover.jpg"
                      className="bg-white/[0.05] border-white/[0.08] text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Location Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="size-4 text-[#D4A843]" />
                Location
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs text-muted-foreground">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street address"
                    className="bg-white/[0.05] border-white/[0.08] text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs text-muted-foreground">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Mumbai"
                      className="bg-white/[0.05] border-white/[0.08] text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs text-muted-foreground">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="bg-white/[0.05] border-white/[0.08] text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Professional Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="size-4 text-[#D4A843]" />
                Professional Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-xs text-muted-foreground">
                    Experience (years)
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="5"
                    className="bg-white/[0.05] border-white/[0.08] text-foreground"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="isAvailable" className="text-sm text-foreground">
                      Available for Bookings
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toggle to appear in search results
                    </p>
                  </div>
                  <Switch
                    id="isAvailable"
                    checked={form.isAvailable}
                    onCheckedChange={(checked) => setForm({ ...form, isAvailable: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !form.companyName}
                className="w-full bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white gap-2"
              >
                <Save className="size-4" />
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
