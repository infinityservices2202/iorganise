'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, X, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User, ViewName } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface TopBarProps {
  title?: string;
  user: User;
  onNavigate?: (view: ViewName) => void;
  onLogout?: () => void;
}

export function TopBar({ title, user, onNavigate, onLogout }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications, setView, markNotificationRead } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setView('customer-search', { query: searchQuery.trim() });
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#151515]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 gap-3">
      {/* Title */}
      {title && (
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>
      )}

      {/* Search - Desktop */}
      <div className="hidden sm:flex flex-1 max-w-md ml-2">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white/[0.05] border-white/[0.08] text-sm placeholder:text-muted-foreground/60 focus-visible:ring-gold/30"
            />
          </div>
        </form>
      </div>

      {/* Search - Mobile (expandable) */}
      <div className="flex sm:hidden flex-1 items-center">
        {searchOpen ? (
          <motion.form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-white/[0.05] border-white/[0.08] text-sm placeholder:text-muted-foreground/60"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground shrink-0"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.form>
        ) : (
          <>
            {title && (
              <h1 className="text-lg font-semibold text-foreground flex-1">{title}</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-maroon text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-popover border-white/[0.08]">
            <DropdownMenuLabel className="text-foreground">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-4 px-2 text-center text-muted-foreground text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 py-2 px-2 cursor-pointer"
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-sm font-medium text-foreground">{notification.title}</span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-gold shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-white/[0.05]">
              <Avatar className="h-7 w-7 border border-white/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-maroon/40 text-[10px] text-white">
                  {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground hidden lg:block">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-white/[0.08]">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer text-muted-foreground focus:text-foreground"
                onClick={() => {
                  if (user.role === 'customer') onNavigate?.('customer-profile');
                  else if (user.role === 'organizer') onNavigate?.('organizer-profile-edit');
                }}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-muted-foreground focus:text-foreground"
                onClick={() => {
                  if (user.role === 'customer') onNavigate?.('customer-profile');
                  else if (user.role === 'organizer') onNavigate?.('organizer-profile-edit');
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
