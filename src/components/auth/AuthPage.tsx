'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Sparkles, PartyPopper, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAppStore } from '@/lib/store';
import type { User as UserType, UserRole } from '@/lib/types';

function FloatingShape({
  className,
  delay = 0,
  duration = 20,
}: {
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

export function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const login = useAppStore((s) => s.login);

  const handleDemoLogin = async (role: 'customer' | 'organizer' | 'admin') => {
    setDemoLoading(role);
    try {
      const credentials: Record<string, { email: string; password: string }> = {
        customer: { email: 'priya@example.com', password: 'hashed_password_1' },
        organizer: { email: 'vikram@eventpro.com', password: 'hashed_password_4' },
        admin: { email: 'admin@eventmarket.com', password: 'hashed_admin_password' },
      };
      const { email, password } = credentials[role];

      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Fallback: set user directly from known seed data
        const fallbackUsers: Record<string, UserType> = {
          customer: {
            id: 'demo-customer',
            email: 'priya@example.com',
            name: 'Priya Sharma',
            phone: '+91-9876543210',
            role: 'customer' as UserRole,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
          },
          organizer: {
            id: 'demo-organizer',
            email: 'vikram@eventpro.com',
            name: 'Vikram Patel',
            phone: '+91-9876543220',
            role: 'organizer' as UserRole,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
          },
          admin: {
            id: 'demo-admin',
            email: 'admin@eventmarket.com',
            name: 'Admin User',
            phone: '+91-9876543200',
            role: 'admin' as UserRole,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
          },
        };
        login(fallbackUsers[role]);
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
      // Fallback: set user directly
      const fallbackUsers: Record<string, UserType> = {
        customer: {
          id: 'demo-customer',
          email: 'priya@example.com',
          name: 'Priya Sharma',
          phone: '+91-9876543210',
          role: 'customer' as UserRole,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        },
        organizer: {
          id: 'demo-organizer',
          email: 'vikram@eventpro.com',
          name: 'Vikram Patel',
          phone: '+91-9876543220',
          role: 'organizer' as UserRole,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        },
        admin: {
          id: 'demo-admin',
          email: 'admin@eventmarket.com',
          name: 'Admin User',
          phone: '+91-9876543200',
          role: 'admin' as UserRole,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        },
      };
      login(fallbackUsers[role]);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f0f0f] px-4 py-8">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <FloatingShape
          className="absolute -left-20 top-1/4 size-72 rounded-full bg-maroon/8 blur-3xl"
          delay={0}
          duration={25}
        />
        <FloatingShape
          className="absolute -right-20 top-1/3 size-80 rounded-full bg-gold/6 blur-3xl"
          delay={2}
          duration={30}
        />
        <FloatingShape
          className="absolute bottom-1/4 left-1/3 size-60 rounded-full bg-maroon/5 blur-3xl"
          delay={4}
          duration={22}
        />

        {/* Geometric shapes */}
        <FloatingShape
          className="absolute right-1/4 top-[15%] size-3 rounded-full bg-gold/20"
          delay={1}
          duration={15}
        />
        <FloatingShape
          className="absolute left-[10%] top-[60%] size-2 rounded-full bg-maroon/30"
          delay={3}
          duration={18}
        />
        <FloatingShape
          className="absolute right-[15%] bottom-[20%] size-4 rounded-sm bg-gold/10 rotate-45"
          delay={2}
          duration={20}
        />
        <FloatingShape
          className="absolute left-[20%] top-[20%] size-2.5 rounded-full bg-gold/15"
          delay={5}
          duration={16}
        />
        <FloatingShape
          className="absolute right-[30%] top-[45%] size-3 rotate-45 bg-maroon/15"
          delay={3.5}
          duration={19}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,168,67,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-maroon/20 ring-1 ring-maroon/30">
              <PartyPopper className="size-7 text-gold" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Event<span className="text-gold">Hub</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your Premier Event Marketplace
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/40 sm:p-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 h-11 w-full bg-white/5 p-1">
              <TabsTrigger
                value="login"
                className="h-9 flex-1 rounded-lg text-sm font-medium transition-all duration-200 data-[state=active]:bg-maroon data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-maroon/20"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="h-9 flex-1 rounded-lg text-sm font-medium transition-all duration-200 data-[state=active]:bg-maroon data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-maroon/20"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Demo Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-white/10" />
            <span className="text-xs text-zinc-500">Quick Demo</span>
            <Separator className="flex-1 bg-white/10" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('customer')}
              disabled={demoLoading !== null}
              className="h-11 border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:border-maroon/50 hover:bg-maroon/10 hover:text-white hover:shadow-[0_0_15px_rgba(139,26,43,0.15)]"
            >
              {demoLoading === 'customer' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <User className="size-4" />
                  <span className="ml-1.5 hidden sm:inline">Customer</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDemoLogin('organizer')}
              disabled={demoLoading !== null}
              className="h-11 border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:border-gold/50 hover:bg-gold/10 hover:text-white hover:shadow-[0_0_15px_rgba(212,168,67,0.15)]"
            >
              {demoLoading === 'organizer' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span className="ml-1.5 hidden sm:inline">Organizer</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDemoLogin('admin')}
              disabled={demoLoading !== null}
              className="h-11 border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              {demoLoading === 'admin' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Shield className="size-4" />
                  <span className="ml-1.5 hidden sm:inline">Admin</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 text-center text-xs text-zinc-600"
        >
          By continuing, you agree to EventHub&apos;s Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
}
