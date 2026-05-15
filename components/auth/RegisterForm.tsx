'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Phone, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import type { User as UserType, UserRole } from '@/lib/types';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['customer', 'organizer']),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'organizer'>('customer');
  const login = useAppStore((s) => s.login);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      terms: false as unknown as true,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed');
        return;
      }

      const user: UserType = {
        id: result.id,
        email: result.email,
        name: result.name,
        phone: result.phone,
        role: result.role as UserRole,
        avatar: result.avatar,
      };
      login(user);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="reg-name" className="text-sm text-zinc-300">
            Full Name
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <User className="size-4" />
            </div>
            <Input
              id="reg-name"
              placeholder="Enter your full name"
              className="border-white/10 bg-white/5 pl-10 text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus-visible:border-maroon focus-visible:ring-maroon/30 focus-visible:ring-[3px]"
              {...form.register('name')}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-sm text-zinc-300">
            Email
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Mail className="size-4" />
            </div>
            <Input
              id="reg-email"
              type="email"
              placeholder="Enter your email"
              className="border-white/10 bg-white/5 pl-10 text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus-visible:border-maroon focus-visible:ring-maroon/30 focus-visible:ring-[3px]"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="reg-phone" className="text-sm text-zinc-300">
            Phone Number
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Phone className="size-4" />
            </div>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="Enter your phone number"
              className="border-white/10 bg-white/5 pl-10 text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus-visible:border-maroon focus-visible:ring-maroon/30 focus-visible:ring-[3px]"
              {...form.register('phone')}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-sm text-zinc-300">
            Password
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="border-white/10 bg-white/5 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus-visible:border-maroon focus-visible:ring-maroon/30 focus-visible:ring-[3px]"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="reg-confirm-password" className="text-sm text-zinc-300">
            Confirm Password
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <Input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="border-white/10 bg-white/5 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus-visible:border-maroon focus-visible:ring-maroon/30 focus-visible:ring-[3px]"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-400">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label className="text-sm text-zinc-300">I want to</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('customer');
                form.setValue('role', 'customer');
              }}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                selectedRole === 'customer'
                  ? 'border-maroon bg-maroon/10 shadow-[0_0_15px_rgba(139,26,43,0.2)]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedRole === 'customer'
                    ? 'bg-maroon text-white'
                    : 'bg-white/10 text-zinc-400 group-hover:bg-white/15'
                }`}
              >
                <User className="size-5" />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  selectedRole === 'customer' ? 'text-gold' : 'text-zinc-400'
                }`}
              >
                Customer
              </span>
              <span className="text-xs text-zinc-500">Book event services</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('organizer');
                form.setValue('role', 'organizer');
              }}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                selectedRole === 'organizer'
                  ? 'border-maroon bg-maroon/10 shadow-[0_0_15px_rgba(139,26,43,0.2)]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedRole === 'organizer'
                    ? 'bg-maroon text-white'
                    : 'bg-white/10 text-zinc-400 group-hover:bg-white/15'
                }`}
              >
                <Sparkles className="size-5" />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  selectedRole === 'organizer' ? 'text-gold' : 'text-zinc-400'
                }`}
              >
                Organizer
              </span>
              <span className="text-xs text-zinc-500">Offer event services</span>
            </button>
          </div>
          <input type="hidden" {...form.register('role')} />
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="terms"
            className="mt-0.5 border-white/20 data-[state=checked]:bg-maroon data-[state=checked]:border-maroon"
            onCheckedChange={(checked) => {
              form.setValue('terms', (checked === true) as true, {
                shouldValidate: true,
              });
            }}
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm leading-snug text-zinc-400">
            I agree to the{' '}
            <span className="text-gold hover:text-gold-light cursor-pointer">Terms & Conditions</span>{' '}
            and{' '}
            <span className="text-gold hover:text-gold-light cursor-pointer">Privacy Policy</span>
          </Label>
        </div>
        {form.formState.errors.terms && (
          <p className="text-xs text-red-400">{form.formState.errors.terms.message}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full bg-maroon text-white transition-all duration-200 hover:scale-[1.02] hover:bg-maroon-light hover:shadow-[0_0_20px_rgba(139,26,43,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
