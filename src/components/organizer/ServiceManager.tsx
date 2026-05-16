'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Users,
  Clock,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StarRating } from '@/components/shared/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Service, Category } from '@/lib/types';

interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  priceType: 'fixed' | 'hourly' | 'per_person';
  duration: string;
  maxGuests: string;
  images: string;
  isActive: boolean;
}

const emptyForm: ServiceFormData = {
  title: '',
  description: '',
  categoryId: '',
  price: '',
  priceType: 'fixed',
  duration: '',
  maxGuests: '',
  images: '',
  isActive: true,
};

const priceTypeLabels: Record<string, string> = {
  fixed: 'Fixed',
  hourly: 'Per Hour',
  per_person: 'Per Person',
};

export function ServiceManager() {
  const { user } = useAppStore();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizerId, setOrganizerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const fetchServices = useCallback(async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services?organizerId=${organizerId}&includeInactive=true`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAddDialog = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description,
      categoryId: service.categoryId,
      price: String(service.price),
      priceType: service.priceType,
      duration: service.duration || '',
      maxGuests: String(service.maxGuests || ''),
      images: (service.images || []).join(', '),
      isActive: service.isActive,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!organizerId || !form.title || !form.categoryId || !form.price) return;
    setSaving(true);
    try {
      const imagesArray = form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        organizerId,
        categoryId: form.categoryId,
        title: form.title,
        description: form.description,
        price: form.price,
        priceType: form.priceType,
        images: imagesArray,
        duration: form.duration || null,
        maxGuests: form.maxGuests || null,
        isActive: form.isActive,
      };

      if (editingService) {
        const res = await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingService.id, ...payload }),
        });
        if (res.ok) {
          await fetchServices();
        }
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchServices();
        }
      }
      setShowDialog(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/services?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchServices();
        setDeleteTarget(null);
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
      });
      await fetchServices();
    } catch {
      // silent
    }
  };

  const getServiceBookingCount = (_service: Service) => {
    // This would ideally come from API, using mock for now
    return Math.floor(Math.random() * 25) + 1;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
      <PageHeader
        title="My Services"
        subtitle={`${services.length} service${services.length !== 1 ? 's' : ''}`}
        action={
          <Button
            onClick={openAddDialog}
            className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white gap-1.5"
          >
            <Plus className="size-4" />
            Add Service
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<BriefcaseIcon />}
          title="No services yet"
          description="Add your first service to start receiving bookings"
          actionLabel="Add Service"
          onAction={openAddDialog}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="bg-[#1a1a1a] border-white/[0.08] overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Service Image */}
                      <div className="w-16 h-16 rounded-lg bg-white/[0.05] shrink-0 overflow-hidden">
                        {service.images?.[0] ? (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="size-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {service.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {service.category?.name || 'Uncategorized'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] border ${
                                service.isActive
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                              }`}
                            >
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm font-semibold text-[#D4A843]">
                            <IndianRupee className="size-3.5" />
                            <span>{service.price.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              /{priceTypeLabels[service.priceType]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <StarRating rating={service.rating} size="sm" />
                            <span className="text-[10px] text-muted-foreground">
                              ({service.reviewCount})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Users className="size-3" />
                            {getServiceBookingCount(service)} bookings
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(service)}
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => setDeleteTarget(service)}
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => toggleServiceStatus(service)}
                        >
                          {service.isActive ? (
                            <>
                              <ToggleRight className="size-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="size-3.5 text-gray-400" />
                              <span className="text-gray-400">Inactive</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                      >
                        {expandedId === service.id ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === service.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t border-white/[0.05] space-y-2">
                            <p className="text-xs text-muted-foreground">
                              {service.description}
                            </p>
                            {service.duration && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                Duration: {service.duration}
                              </div>
                            )}
                            {service.maxGuests && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="size-3" />
                                Max Guests: {service.maxGuests}
                              </div>
                            )}
                            {service.images?.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {service.images.slice(0, 4).map((img, i) => (
                                  <div
                                    key={i}
                                    className="w-14 h-14 rounded-md overflow-hidden bg-white/[0.05]"
                                  >
                                    <img
                                      src={img}
                                      alt={`${service.title} ${i + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#1a1a1a] border-white/[0.08] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingService
                ? 'Update your service details below'
                : 'Fill in the details to create a new service'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs text-muted-foreground">
                Title *
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Premium Wedding Decoration"
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
                placeholder="Describe your service in detail..."
                className="bg-white/[0.05] border-white/[0.08] text-foreground min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(val) => setForm({ ...form, categoryId: val })}
                >
                  <SelectTrigger className="bg-white/[0.05] border-white/[0.08] text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/[0.08]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Price Type</Label>
                <Select
                  value={form.priceType}
                  onValueChange={(val) =>
                    setForm({ ...form, priceType: val as 'fixed' | 'hourly' | 'per_person' })
                  }
                >
                  <SelectTrigger className="bg-white/[0.05] border-white/[0.08] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/[0.08]">
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="per_person">Per Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs text-muted-foreground">
                  Price (₹) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g., 15000"
                  className="bg-white/[0.05] border-white/[0.08] text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs text-muted-foreground">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g., 4 hours"
                  className="bg-white/[0.05] border-white/[0.08] text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests" className="text-xs text-muted-foreground">
                Max Guests
              </Label>
              <Input
                id="maxGuests"
                type="number"
                value={form.maxGuests}
                onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                placeholder="e.g., 200"
                className="bg-white/[0.05] border-white/[0.08] text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images" className="text-xs text-muted-foreground">
                Image URLs (comma-separated)
              </Label>
              <Input
                id="images"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="https://img1.jpg, https://img2.jpg"
                className="bg-white/[0.05] border-white/[0.08] text-foreground"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="isActive" className="text-sm text-muted-foreground">
                Service Active
              </Label>
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-white/[0.08] text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title || !form.categoryId || !form.price}
              className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
            >
              {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Service</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
