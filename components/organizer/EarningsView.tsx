'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Earning } from '@/lib/types';
import { format, parseISO } from 'date-fns';

type TransactionFilter = 'all' | 'available' | 'pending' | 'withdrawn';

const statusBadgeConfig: Record<string, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  },
};

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

export function EarningsView() {
  const { user } = useAppStore();
  const [organizerId, setOrganizerId] = useState<string>('');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState({
    totalAvailable: 0,
    totalPending: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');

  // Withdraw dialog
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

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

  const fetchEarnings = useCallback(async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/earnings?organizerId=${organizerId}`);
      if (res.ok) {
        const data = await res.json();
        setEarnings(data.earnings || []);
        setSummary(
          data.summary || { totalAvailable: 0, totalPending: 0, totalWithdrawn: 0, totalEarned: 0 }
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > summary.totalAvailable) return;
    setWithdrawing(true);
    try {
      const res = await fetch('/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizerId, amount }),
      });
      if (res.ok) {
        await fetchEarnings();
        setShowWithdraw(false);
        setWithdrawAmount('');
      }
    } catch {
      // silent
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredEarnings = earnings.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.status === activeFilter;
  });

  const summaryCards = [
    {
      icon: TrendingUp,
      value: formatCurrency(summary.totalEarned),
      label: 'Total Earned',
      color: 'text-foreground',
      iconBg: 'bg-[#8B1A2B]/15',
    },
    {
      icon: CheckCircle2,
      value: formatCurrency(summary.totalAvailable),
      label: 'Available Balance',
      color: 'text-emerald-500',
      iconBg: 'bg-emerald-500/15',
    },
    {
      icon: Clock,
      value: formatCurrency(summary.totalPending),
      label: 'Pending Amount',
      color: 'text-yellow-500',
      iconBg: 'bg-yellow-500/15',
    },
    {
      icon: ArrowDownToLine,
      value: formatCurrency(summary.totalWithdrawn),
      label: 'Withdrawn',
      color: 'text-muted-foreground',
      iconBg: 'bg-gray-500/15',
    },
  ];

  const filterTabs: { value: TransactionFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'pending', label: 'Pending' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
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
        title="Earnings"
        action={
          summary.totalAvailable > 0 ? (
            <Button
              onClick={() => setShowWithdraw(true)}
              className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white gap-1.5"
            >
              <Wallet className="size-4" />
              Withdraw
            </Button>
          ) : undefined
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-[#1a1a1a] border-white/[0.08]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                    <card.icon className="size-4 text-[#D4A843]" />
                  </div>
                </div>
                <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transaction Filters */}
      <Tabs
        value={activeFilter}
        onValueChange={(val) => setActiveFilter(val as TransactionFilter)}
      >
        <TabsList className="bg-[#1a1a1a] border border-white/[0.08]">
          {filterTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs data-[state=active]:bg-[#8B1A2B] data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Earnings History */}
      {filteredEarnings.length === 0 ? (
        <EmptyState
          icon={<IndianRupee className="size-6" />}
          title="No transactions"
          description="Your earnings history will appear here"
        />
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          <AnimatePresence>
            {filteredEarnings.map((earning, index) => {
              const badgeConfig = statusBadgeConfig[earning.status] || statusBadgeConfig.pending;
              const isWithdrawal = earning.type === 'withdrawal';
              return (
                <motion.div
                  key={earning.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isWithdrawal
                            ? 'bg-orange-500/15'
                            : 'bg-emerald-500/15'
                        }`}
                      >
                        {isWithdrawal ? (
                          <ArrowDownToLine className="size-4 text-orange-500" />
                        ) : (
                          <IndianRupee className="size-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {isWithdrawal ? 'Withdrawal' : 'Booking Payment'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(earning.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] border ${badgeConfig.className}`}
                      >
                        {badgeConfig.label}
                      </Badge>
                      <span
                        className={`text-sm font-semibold ${
                          isWithdrawal ? 'text-orange-400' : 'text-emerald-400'
                        }`}
                      >
                        {isWithdrawal ? '-' : '+'}
                        {formatCurrency(earning.amount)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="bg-[#1a1a1a] border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Withdraw Funds</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Transfer your available balance to your bank account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-lg font-bold text-emerald-500">
                {formatCurrency(summary.totalAvailable)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawAmount" className="text-xs text-muted-foreground">
                Amount to Withdraw (₹)
              </Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={summary.totalAvailable}
                className="bg-white/[0.05] border-white/[0.08] text-foreground"
              />
              {withdrawAmount && parseFloat(withdrawAmount) > summary.totalAvailable && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="size-3" />
                  Amount exceeds available balance
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-white/[0.08] text-muted-foreground"
                  onClick={() =>
                    setWithdrawAmount(
                      String(Math.round(summary.totalAvailable * (pct / 100)))
                    )
                  }
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWithdraw(false)}
              className="border-white/[0.08] text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                withdrawing ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0 ||
                parseFloat(withdrawAmount) > summary.totalAvailable
              }
              className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
            >
              {withdrawing ? 'Processing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
