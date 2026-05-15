'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  IndianRupee,
  ShieldCheck,
  ShieldX,
  Trash2,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { OrganizerProfile, Service, Booking } from '@/lib/types';
import { format, parseISO } from 'date-fns';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

interface AdminStats {
  totalUsers: number;
  totalOrganizers: number;
  totalServices: number;
  totalBookings: number;
  totalRevenue: number;
}

export function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrganizers: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  // Data states
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Action states
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<{ id: string; name: string; action: 'approve' | 'reject' } | null>(null);
  const [serviceAction, setServiceAction] = useState<{ id: string; title: string; action: 'activate' | 'deactivate' | 'remove' } | null>(null);
  const [processing, setProcessing] = useState(false);

  // Detail dialog
  const [detailItem, setDetailItem] = useState<{ type: string; data: unknown } | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, svcRes, bkgRes] = await Promise.all([
        fetch('/api/organizers'),
        fetch('/api/services?limit=100'),
        fetch('/api/bookings?customerId=demo-admin-all'),
      ]);

      let orgData: OrganizerProfile[] = [];
      let svcData: Service[] = [];
      let bkgData: Booking[] = [];

      if (orgRes.ok) orgData = await orgRes.json();
      if (svcRes.ok) svcData = await svcRes.json();
      if (bkgRes.ok) bkgData = await bkgRes.json();

      setOrganizers(orgData);
      setServices(svcData);
      setBookings(bkgData);

      // Calculate stats
      const totalRevenue = bkgData.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      setStats({
        totalUsers: orgData.length + bkgData.reduce((acc, b) => {
          return acc + (b.customerId ? 1 : 0);
        }, 0),
        totalOrganizers: orgData.length,
        totalServices: svcData.length,
        totalBookings: bkgData.length,
        totalRevenue,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    // In a real app, this would call a user deletion API
    // For now, just close the dialog
    setTimeout(() => {
      setDeleteTarget(null);
      setProcessing(false);
    }, 500);
  };

  const handleVerifyOrganizer = async () => {
    if (!verifyTarget) return;
    setProcessing(true);
    try {
      await fetch('/api/organizers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifyTarget.id,
          isVerified: verifyTarget.action === 'approve',
        }),
      });
      await fetchAllData();
      setVerifyTarget(null);
    } catch {
      // silent
    } finally {
      setProcessing(false);
    }
  };

  const handleServiceAction = async () => {
    if (!serviceAction) return;
    setProcessing(true);
    try {
      if (serviceAction.action === 'remove') {
        await fetch(`/api/services?id=${serviceAction.id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: serviceAction.id,
            isActive: serviceAction.action === 'activate',
          }),
        });
      }
      await fetchAllData();
      setServiceAction(null);
    } catch {
      // silent
    } finally {
      setProcessing(false);
    }
  };

  const statsCards = [
    {
      icon: Users,
      value: stats.totalUsers,
      label: 'Total Users',
      color: 'bg-blue-500/15',
    },
    {
      icon: Building2,
      value: stats.totalOrganizers,
      label: 'Organizers',
      color: 'bg-[#D4A843]/15',
    },
    {
      icon: Briefcase,
      value: stats.totalServices,
      label: 'Services',
      color: 'bg-emerald-500/15',
    },
    {
      icon: CalendarCheck,
      value: stats.totalBookings,
      label: 'Bookings',
      color: 'bg-purple-500/15',
    },
    {
      icon: IndianRupee,
      value: formatCurrency(stats.totalRevenue),
      label: 'Revenue',
      color: 'bg-[#8B1A2B]/15',
    },
  ];

  const recentActivity = bookings.slice(0, 5).map((b) => ({
    id: b.id,
    text: `${b.customer?.name || 'Customer'} booked ${b.service?.title || 'a service'}`,
    time: formatDate(b.createdAt),
    status: b.status,
  }));

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-4"
    >
      <PageHeader title="Admin Dashboard" subtitle="Platform management & analytics" />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-[#1a1a1a] border-white/[0.08]">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="size-4 text-[#D4A843]" />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-[#1a1a1a] border border-white/[0.08]">
          <TabsTrigger
            value="overview"
            className="text-xs data-[state=active]:bg-[#8B1A2B] data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="organizers"
            className="text-xs data-[state=active]:bg-[#8B1A2B] data-[state=active]:text-white"
          >
            Organizers
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="text-xs data-[state=active]:bg-[#8B1A2B] data-[state=active]:text-white"
          >
            Services
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Key Metrics */}
            <Card className="bg-[#1a1a1a] border-white/[0.08]">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="size-4 text-[#D4A843]" />
                  Key Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-muted-foreground">Active Organizers</span>
                    <span className="text-sm font-semibold text-foreground">
                      {organizers.filter((o) => o.isAvailable).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-muted-foreground">Verified Organizers</span>
                    <span className="text-sm font-semibold text-emerald-500">
                      {organizers.filter((o) => o.isVerified).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-muted-foreground">Active Services</span>
                    <span className="text-sm font-semibold text-foreground">
                      {services.filter((s) => s.isActive).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-muted-foreground">Pending Bookings</span>
                    <span className="text-sm font-semibold text-yellow-500">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted-foreground">Completed Bookings</span>
                    <span className="text-sm font-semibold text-emerald-500">
                      {bookings.filter((b) => b.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-[#1a1a1a] border-white/[0.08]">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="size-4 text-[#D4A843]" />
                  Recent Activity
                </h3>
                {recentActivity.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 py-2 border-b border-white/[0.05] last:border-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#D4A843] mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{activity.text}</p>
                          <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[9px] shrink-0 border bg-white/[0.05]"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Organizers Tab */}
        <TabsContent value="organizers" className="mt-4">
          <Card className="bg-[#1a1a1a] border-white/[0.08]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.05] hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground">Company</TableHead>
                      <TableHead className="text-xs text-muted-foreground">City</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Rating</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Verified</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Services</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-sm text-muted-foreground"
                        >
                          No organizers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      organizers.map((org) => (
                        <TableRow
                          key={org.id}
                          className="border-white/[0.05] hover:bg-white/[0.02]"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#8B1A2B]/20 flex items-center justify-center shrink-0">
                                <Building2 className="size-3.5 text-[#D4A843]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {org.companyName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {org.user?.name || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {org.city || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {org.rating.toFixed(1)}
                          </TableCell>
                          <TableCell>
                            {org.isVerified ? (
                              <Badge className="text-[9px] bg-emerald-500/15 text-emerald-500 border-emerald-500/20">
                                <CheckCircle2 className="size-2.5 mr-0.5" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="text-[9px] bg-yellow-500/15 text-yellow-500 border-yellow-500/20">
                                <XCircle className="size-2.5 mr-0.5" />
                                Unverified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {org.services?.length || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!org.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] text-emerald-500 hover:bg-emerald-500/10 gap-0.5"
                                  onClick={() =>
                                    setVerifyTarget({
                                      id: org.id,
                                      name: org.companyName,
                                      action: 'approve',
                                    })
                                  }
                                >
                                  <ShieldCheck className="size-3" />
                                  Approve
                                </Button>
                              )}
                              {org.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] text-red-400 hover:bg-red-500/10 gap-0.5"
                                  onClick={() =>
                                    setVerifyTarget({
                                      id: org.id,
                                      name: org.companyName,
                                      action: 'reject',
                                    })
                                  }
                                >
                                  <ShieldX className="size-3" />
                                  Revoke
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] text-muted-foreground hover:text-foreground gap-0.5"
                                onClick={() =>
                                  setDetailItem({ type: 'organizer', data: org })
                                }
                              >
                                <Eye className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="mt-4">
          <Card className="bg-[#1a1a1a] border-white/[0.08]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.05] hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground">Service</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Organizer</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Category</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Price</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-sm text-muted-foreground"
                        >
                          No services found
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((svc) => (
                        <TableRow
                          key={svc.id}
                          className="border-white/[0.05] hover:bg-white/[0.02]"
                        >
                          <TableCell>
                            <p className="text-xs font-medium text-foreground truncate max-w-[200px]">
                              {svc.title}
                            </p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {svc.organizer?.companyName || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {svc.category?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs text-[#D4A843] font-medium">
                            {formatCurrency(svc.price)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-[9px] ${
                                svc.isActive
                                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                                  : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                              }`}
                            >
                              {svc.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!svc.isActive ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] text-emerald-500 hover:bg-emerald-500/10 gap-0.5"
                                  onClick={() =>
                                    setServiceAction({
                                      id: svc.id,
                                      title: svc.title,
                                      action: 'activate',
                                    })
                                  }
                                >
                                  <CheckCircle2 className="size-3" />
                                  Activate
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] text-yellow-500 hover:bg-yellow-500/10 gap-0.5"
                                  onClick={() =>
                                    setServiceAction({
                                      id: svc.id,
                                      title: svc.title,
                                      action: 'deactivate',
                                    })
                                  }
                                >
                                  <XCircle className="size-3" />
                                  Deactivate
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] text-red-400 hover:bg-red-500/10 gap-0.5"
                                onClick={() =>
                                  setServiceAction({
                                    id: svc.id,
                                    title: svc.title,
                                    action: 'remove',
                                  })
                                }
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete {deleteTarget?.type} &quot;{deleteTarget?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify/Revoke Organizer */}
      <AlertDialog open={!!verifyTarget} onOpenChange={(open) => !open && setVerifyTarget(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {verifyTarget?.action === 'approve' ? 'Approve Organizer' : 'Revoke Verification'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {verifyTarget?.action === 'approve'
                ? `Verify "${verifyTarget?.name}" as a trusted organizer? They will receive a verified badge.`
                : `Revoke verification from "${verifyTarget?.name}"? Their verified badge will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyOrganizer}
              disabled={processing}
              className={
                verifyTarget?.action === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {processing
                ? 'Processing...'
                : verifyTarget?.action === 'approve'
                ? 'Approve'
                : 'Revoke'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Action Confirmation */}
      <AlertDialog open={!!serviceAction} onOpenChange={(open) => !open && setServiceAction(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {serviceAction?.action === 'activate'
                ? 'Activate Service'
                : serviceAction?.action === 'deactivate'
                ? 'Deactivate Service'
                : 'Remove Service'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {serviceAction?.action === 'activate'
                ? `Activate "${serviceAction?.title}"? It will become visible to customers.`
                : serviceAction?.action === 'deactivate'
                ? `Deactivate "${serviceAction?.title}"? It will be hidden from customers.`
                : `Permanently remove "${serviceAction?.title}"? This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleServiceAction}
              disabled={processing}
              className={
                serviceAction?.action === 'remove'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : serviceAction?.action === 'activate'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }
            >
              {processing
                ? 'Processing...'
                : serviceAction?.action === 'activate'
                ? 'Activate'
                : serviceAction?.action === 'deactivate'
                ? 'Deactivate'
                : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/[0.08] max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {detailItem?.type === 'organizer' ? 'Organizer Details' : 'Details'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Full profile information
            </DialogDescription>
          </DialogHeader>
          {detailItem?.type === 'organizer' && detailItem.data && (() => {
            const org = detailItem.data as OrganizerProfile;
            return (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#8B1A2B]/20 flex items-center justify-center">
                    <Building2 className="size-6 text-[#D4A843]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{org.companyName}</h3>
                    <p className="text-xs text-muted-foreground">{org.user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                    <p className="text-xs text-foreground mt-1">{org.user?.email || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">City</p>
                    <p className="text-xs text-foreground mt-1">{org.city || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                    <p className="text-xs text-foreground mt-1">{org.rating.toFixed(1)} ({org.reviewCount} reviews)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">Experience</p>
                    <p className="text-xs text-foreground mt-1">{org.experience} years</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">Verified</p>
                    <Badge
                      className={`text-[10px] mt-1 ${
                        org.isVerified
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-yellow-500/15 text-yellow-500'
                      }`}
                    >
                      {org.isVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">Available</p>
                    <Badge
                      className={`text-[10px] mt-1 ${
                        org.isAvailable
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {org.isAvailable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                {org.description && (
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] text-muted-foreground uppercase">Description</p>
                    <p className="text-xs text-foreground mt-1">{org.description}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
