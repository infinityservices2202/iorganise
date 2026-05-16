'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Smartphone, Building2, Wallet, CheckCircle2,
  Loader2, ShieldCheck, IndianRupee, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'upi',
    label: 'UPI',
    icon: <Smartphone className="size-5" />,
    description: 'Pay via UPI apps (GPay, PhonePe, Paytm)',
  },
  {
    id: 'card',
    label: 'Debit/Credit Card',
    icon: <CreditCard className="size-5" />,
    description: 'Visa, Mastercard, RuPay',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: <Building2 className="size-5" />,
    description: 'All major banks supported',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: <Wallet className="size-5" />,
    description: 'Paytm, Amazon Pay, etc.',
  },
];

export function PaymentPage() {
  const { viewParams, setView, goBack, user } = useAppStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');

  const totalAmount = parseFloat(viewParams.totalAmount || '0');
  const advanceAmount = parseFloat(viewParams.advanceAmount || '0');
  const bookingId = viewParams.bookingId || '';
  const serviceTitle = viewParams.serviceTitle || 'Service';

  const handlePayment = async () => {
    if (!user || !bookingId) return;

    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID');
      return;
    }
    if (selectedMethod === 'card' && cardNumber.length < 12) {
      setError('Please enter a valid card number');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create payment record
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          customerId: user.id,
          amount: advanceAmount,
          method: selectedMethod,
          status: 'completed',
        }),
      });

      if (res.ok) {
        // Update booking advance paid
        await fetch('/api/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bookingId, advancePaid: advanceAmount }),
        });
        setSuccess(true);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Success state
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center py-16 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        >
          <CheckCircle2 className="size-20 text-emerald-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-bold text-foreground">Payment Successful!</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Advance payment of ₹{advanceAmount.toLocaleString('en-IN')} has been processed successfully.
          </p>
          <p className="text-xs text-muted-foreground">
            Booking ID: {bookingId.slice(0, 8)}...
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-2"
        >
          <Button
            onClick={() => setView('customer-bookings')}
            className="bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white"
          >
            View My Bookings
          </Button>
          <Button
            variant="outline"
            onClick={() => setView('customer-home')}
            className="border-border"
          >
            Go Home
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <PageHeader title="Payment" onBack={goBack} />

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{serviceTitle}</span>
          <span className="text-foreground">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <Separator className="bg-white/[0.06]" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Advance Payment (40%)</span>
          <span className="text-[#D4A843] font-bold text-lg">₹{advanceAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Remaining (pay later)</span>
          <span className="text-muted-foreground">₹{(totalAmount - advanceAmount).toLocaleString('en-IN')}</span>
        </div>
      </motion.div>

      {/* Payment Method Selection */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground">Select Payment Method</h3>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => { setSelectedMethod(method.id); setError(''); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                selectedMethod === method.id
                  ? 'border-[#8B1A2B] bg-[#8B1A2B]/10'
                  : 'border-border bg-[#1a1a1a] hover:border-[#8B1A2B]/30'
              }`}
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${
                selectedMethod === method.id
                  ? 'bg-[#8B1A2B]/20 text-[#D4A843]'
                  : 'bg-white/5 text-muted-foreground'
              }`}>
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${
                  selectedMethod === method.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {method.label}
                </p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
              {selectedMethod === method.id && (
                <div className="size-5 rounded-full bg-[#8B1A2B] flex items-center justify-center">
                  <CheckCircle2 className="size-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Payment Details Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-[#1a1a1a] p-4 space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground">Payment Details</h3>

        {selectedMethod === 'upi' && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">UPI ID</label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="bg-[#0f0f0f] border-border text-sm"
            />
          </div>
        )}

        {selectedMethod === 'card' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Card Number</label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="1234 5678 9012 3456"
                className="bg-[#0f0f0f] border-border text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Expiry</label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="bg-[#0f0f0f] border-border text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">CVV</label>
                <Input
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  type="password"
                  className="bg-[#0f0f0f] border-border text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'netbanking' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You will be redirected to your bank&apos;s login page to complete the payment.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB'].map((bank) => (
                <Badge
                  key={bank}
                  variant="outline"
                  className="cursor-pointer border-border hover:border-[#8B1A2B]/30 hover:bg-[#8B1A2B]/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {bank}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedMethod === 'wallet' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Choose your preferred wallet to complete the payment.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Paytm', 'Amazon Pay', 'PhonePe Wallet', 'MobiKwik'].map((wallet) => (
                <Badge
                  key={wallet}
                  variant="outline"
                  className="cursor-pointer border-border hover:border-[#8B1A2B]/30 hover:bg-[#8B1A2B]/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {wallet}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Security Note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 text-xs text-muted-foreground bg-[#1a1a1a] border border-border rounded-lg px-4 py-3"
      >
        <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
        <span>Your payment information is encrypted and secure. We never store your card details.</span>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <span>{error}</span>
        </div>
      )}

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={processing}
        className="w-full bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <IndianRupee className="size-4 mr-2" />
            Pay ₹{advanceAmount.toLocaleString('en-IN')} Advance
          </>
        )}
      </Button>
    </div>
  );
}
