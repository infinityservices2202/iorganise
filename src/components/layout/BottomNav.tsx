'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ViewName } from '@/lib/types';
import type { NavItem } from './Sidebar';

interface BottomNavProps {
  items: NavItem[];
  activeView: string;
  onNavigate: (view: ViewName) => void;
}

export function BottomNav({ items, activeView, onNavigate }: BottomNavProps) {
  // Show max 5 items
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#151515] border-t border-white/[0.08]">
      <div className="flex items-center justify-around h-16 pb-safe">
        {visibleItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative outline-none focus-visible:ring-0"
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomnav-active-pill"
                    className="absolute w-10 h-7 rounded-full bg-maroon"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-gold' : 'text-muted-foreground'}`}>
                  {item.icon}
                </span>
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-gold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
