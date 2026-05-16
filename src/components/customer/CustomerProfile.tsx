'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, CreditCard, Bell, Moon, HelpCircle,
  Info, LogOut, ChevronRight, Pencil, Check, X, Shield,
  CalendarCheck, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';

interface ProfileSection {
  icon: React.ReactNode;
  label: string;
  value?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

// Mock payment methods
const mockPaymentMethods = [
  { id: '1', type: 'UPI', detail: 'alex@upi', icon: '📱' },
  { id: '2', type: 'Card', detail: '•••• •••• •••• 4242', icon: '💳' },
];

export function CustomerProfile() {
  const { user, logout, setView } = useAppStore();
  const [stats, setStats] = useState({ totalBookings: 0, completed: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const [bookingsRes, favoritesRes] = await Promise.all([
          fetch(`/api/bookings?customerId=${user.id}`),
          fetch(`/api/favorites?userId=${user.id}`),
        ]);

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          setStats((prev) => ({
            ...prev,
            totalBookings: bookings.length,
            completed: bookings.filter((b: { status: string }) => b.status === 'completed').length,
          }));
        }
        if (favoritesRes.ok) {
          const favorites = await favoritesRes.json();
          setStats((prev) => ({ ...prev, favorites: favorites.length }));
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  const startEditing = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveEditing = () => {
    // In a real app, this would call an API to update user profile
    setEditing(false);
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="space-y-6 pb-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <Avatar className="size-16 border-2 border-[#8B1A2B]/30">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{user?.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Bookings', value: stats.totalBookings, icon: <CalendarCheck className="size-4 text-[#D4A843]" /> },
          { label: 'Completed', value: stats.completed, icon: <Shield className="size-4 text-emerald-500" /> },
          { label: 'Favorites', value: stats.favorites, icon: <Heart className="size-4 text-[#8B1A2B]" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-[#1a1a1a] p-3 text-center space-y-1"
          >
            <div className="flex justify-center">{stat.icon}</div>
            {loading ? (
              <Skeleton className="h-6 w-8 mx-auto bg-muted/40" />
            ) : (
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            )}
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Sections */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {/* Personal Info */}
        <motion.div
          variants={staggerItem}
          className="rounded-xl border border-border bg-[#1a1a1a] overflow-hidden"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#8B1A2B]/15">
                <User className="size-4 text-[#D4A843]" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Personal Info</h3>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelEditing}
                  className="size-8 text-muted-foreground hover:text-red-500"
                >
                  <X className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={saveEditing}
                  className="size-8 text-emerald-500 hover:text-emerald-400"
                >
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditing}
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
          </div>

          <div className="px-4 pb-4 space-y-3">
            {editing ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-[#0f0f0f] border-border text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-[#0f0f0f] border-border text-sm h-9"
                    type="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-[#0f0f0f] border-border text-sm h-9"
                    type="tel"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{user.phone}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          variants={staggerItem}
          className="rounded-xl border border-border bg-[#1a1a1a] overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#8B1A2B]/15">
              <CreditCard className="size-4 text-[#D4A843]" />
            </div>
            <h3 className="text-sm font-semibold text-foreground flex-1">Payment Methods</h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {mockPaymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0f0f] border border-border/50"
              >
                <span className="text-lg">{method.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{method.type}</p>
                  <p className="text-xs text-muted-foreground">{method.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          variants={staggerItem}
          className="rounded-xl border border-border bg-[#1a1a1a] overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#8B1A2B]/15">
              <Bell className="size-4 text-[#D4A843]" />
            </div>
            <h3 className="text-sm font-semibold text-foreground flex-1">Settings</h3>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Notifications</span>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Dark Mode</span>
              </div>
              <span className="text-xs text-muted-foreground">Always on</span>
            </div>
          </div>
        </motion.div>

        {/* Help & Support */}
        <motion.div
          variants={staggerItem}
          className="rounded-xl border border-border bg-[#1a1a1a] overflow-hidden cursor-pointer hover:border-[#8B1A2B]/20 transition-colors"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#8B1A2B]/15">
              <HelpCircle className="size-4 text-[#D4A843]" />
            </div>
            <h3 className="text-sm font-semibold text-foreground flex-1">Help & Support</h3>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </motion.div>

        {/* About EventHub */}
        <motion.div
          variants={staggerItem}
          className="rounded-xl border border-border bg-[#1a1a1a] overflow-hidden cursor-pointer hover:border-[#8B1A2B]/20 transition-colors"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#8B1A2B]/15">
              <Info className="size-4 text-[#D4A843]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">About EventHub</h3>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div variants={staggerItem}>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 py-3"
          >
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
