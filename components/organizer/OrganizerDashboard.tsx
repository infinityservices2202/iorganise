'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  IndianRupee,
  Briefcase,
  Clock,
  Plus,
  Wallet,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { StarRating } from '@/components/shared/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Booking, Service, Earning, Notification as AppNotification } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

// Mock revenue chart data for last 6 months
const mockRevenueData = [
  { month: 'Oct', revenue: 24000 },
  { month: 'Nov', revenue: 18000 },
  { month: 'Dec', revenue: 32000 },
  { month: 'Jan', revenue: 28000 },
  { month: 'Feb', revenue: 35000 },
  { month: 'Mar', revenue: 42000 },
];

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function OrganizerDashboard() {
  const { user, setView } = useAppStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [earningsData, setEarningsData] = useState<{
    earnings: Earning[];
    summary: { totalAvailable: number; totalPending: number; totalWithdrawn: number; totalEarned: number };
  } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [organizerId, setOrganizerId] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!organizerId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, servicesRes, earningsRes, notifsRes] = await Promise.all([
          fetch(`/api/bookings?organizerId=${organizerId}`),
          fetch(`/api/services?organizerId=${organizerId}`),
          fetch(`/api/earnings?organizerId=${organizerId}`),
          fetch(`/api/notifications?userId=${user?.id || ''}`),
        ]);
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (servicesRes.ok) {
          const allServices = await servicesRes.json();
          setServices(allServices);
        }
        if (earningsRes.ok) setEarningsData(await earningsRes.json());
        if (notifsRes.ok) setNotifications(await notifsRes.json());
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [organizerId, user?.id]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending').slice(0, 5);
  const activeServices = services.filter((s) => s.isActive).length;
  const totalRevenue = earningsData?.summary.totalEarned || 0;
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  const stats = [
    {
      icon: CalendarCheck,
      value: totalBookings,
      label: 'Total Bookings',
      trend: '+12%',
      trendUp: true,
    },
    {
      icon: IndianRupee,
      value: formatCurrency(totalRevenue),
      label: 'Revenue',
      trend: '+8%',
      trendUp: true,
    },
    {
      icon: Briefcase,
      value: activeServices,
      label: 'Active Services',
      trend: '+2',
      trendUp: true,
    },
    {
      icon: Clock,
      value: pendingCount,
      label: 'Pending Requests',
      trend: pendingCount > 3 ? 'Needs attention' : 'On track',
      trendUp: pendingCount <= 3,
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Service',
      onClick: () => setView('organizer-services'),
      color: 'bg-[#8B1A2B]/20 text-[#8B1A2B]',
    },
    {
      icon: Wallet,
      label: 'View Earnings',
      onClick: () => setView('organizer-earnings'),
      color: 'bg-emerald-500/15 text-emerald-500',
    },
    {
      icon: MessageSquare,
      label: 'Check Messages',
      onClick: () => setView('organizer-bookings'),
      color: 'bg-blue-500/15 text-blue-500',
    },
  ];

  const messageNotifications = notifications.filter(
    (n) => n.type === 'booking' || n.type === 'payment'
  ).slice(0, 4);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6 space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title={`Welcome, ${user?.name || 'Organizer'}`}
          subtitle="Here's what's happening with your events"
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#1a1a1a] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#8B1A2B]/15 flex items-center justify-center">
                  <stat.icon className="size-4 text-[#D4A843]" />
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-yellow-500'}`}>
                  {stat.trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex gap-3 overflow-x-auto pb-1">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            onClick={action.onClick}
            className="shrink-0 gap-2 border-white/[0.08] bg-[#1a1a1a] hover:bg-[#222] text-foreground"
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${action.color}`}>
              <action.icon className="size-3.5" />
            </div>
            {action.label}
          </Button>
        ))}
      </motion.div>

      {/* Revenue Chart + Recent Bookings */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-[#1a1a1a] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Revenue Overview</h3>
                <Badge variant="outline" className="text-[10px] border-[#D4A843]/30 text-[#D4A843]">
                  Last 6 months
                </Badge>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#888', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#888', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#8B1A2B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Booking Requests */}
        <motion.div variants={itemVariants}>
          <Card className="bg-[#1a1a1a] border-white/[0.08]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Recent Requests</h3>
                {pendingBookings.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#D4A843] hover:text-[#D4A843]/80 h-7"
                    onClick={() => setView('organizer-bookings')}
                  >
                    View all <ArrowRight className="size-3 ml-1" />
                  </Button>
                )}
              </div>
              {pendingBookings.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#8B1A2B]/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#D4A843]">
                          {booking.customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {booking.customer.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {booking.service.title}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-[#D4A843]">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        >
                          Pending
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customer Messages Preview */}
      <motion.div variants={itemVariants}>
        <Card className="bg-[#1a1a1a] border-white/[0.08]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <MessageSquare className="size-4 text-muted-foreground" />
            </div>
            {messageNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                No new notifications
              </div>
            ) : (
              <div className="space-y-2">
                {messageNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#D4A843] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{notif.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
