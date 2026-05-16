'use client';

import { useState } from 'react';
import { Bell, Info, CalendarCheck, CreditCard, Megaphone, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const notificationIconMap: Record<Notification['type'], React.ReactNode> = {
  info: <Info className="size-4 text-blue-400" />,
  booking: <CalendarCheck className="size-4 text-[#D4A843]" />,
  payment: <CreditCard className="size-4 text-emerald-400" />,
  promotion: <Megaphone className="size-4 text-purple-400" />,
};

const notificationBgMap: Record<Notification['type'], string> = {
  info: 'bg-blue-400/10',
  booking: 'bg-[#D4A843]/10',
  payment: 'bg-emerald-400/10',
  promotion: 'bg-purple-400/10',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationRead } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) {
        markNotificationRead(n.id);
      }
    });
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#8B1A2B] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 bg-[#1a1a1a] border-border p-0 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-auto py-1 px-2 text-xs text-[#D4A843] hover:text-[#D4A843]/80"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 cursor-pointer border-b border-border/50 last:border-b-0',
                    !notification.isRead && 'bg-white/[0.02]'
                  )}
                  onClick={() => handleMarkRead(notification.id)}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                      notificationBgMap[notification.type]
                    )}
                  >
                    {notificationIconMap[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm leading-tight',
                          notification.isRead
                            ? 'text-muted-foreground'
                            : 'text-foreground font-medium'
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-[#8B1A2B]" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
