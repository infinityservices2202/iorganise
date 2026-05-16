'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User, ViewName } from '@/lib/types';

export interface NavItem {
  view: ViewName;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  user: User;
  activeView: string;
  onNavigate: (view: ViewName) => void;
  onLogout: () => void;
  /** If true, sidebar is always visible even on mobile (for admin) */
  alwaysVisible?: boolean;
}

export function Sidebar({ items, user, activeView, onNavigate, onLogout, alwaysVisible = false }: SidebarProps) {
  const visibilityClasses = alwaysVisible
    ? 'flex flex-col w-[240px] min-w-[240px]'
    : 'hidden md:flex md:flex-col md:w-[240px] md:min-w-[240px]';

  return (
    <aside className={`${visibilityClasses} h-screen bg-[#151515] border-r border-white/[0.08] fixed left-0 top-0 z-30`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-white tracking-tight">Event</span>
          <span className="text-xl font-bold text-gold tracking-tight">Hub</span>
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-3">
          {items.map((item) => {
            const isActive = activeView === item.view;
            return (
              <motion.button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-200 w-full text-left
                  ${isActive
                    ? 'bg-maroon text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                  }
                `}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className={`shrink-0 ${isActive ? 'text-gold' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/[0.06]" />

      {/* User Info */}
      <div className="p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-maroon/40 text-xs text-white">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
