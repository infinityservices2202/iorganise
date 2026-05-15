'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Loader2, Phone, MoreVertical, ShieldCheck,
  Image as ImageIcon, Paperclip, Smile, Check, CheckCheck,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { StarRating } from '@/components/shared/StarRating';
import type { ChatMessage, OrganizerProfile } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface ChatOrganizerInfo {
  id: string;
  companyName: string;
  logo?: string;
  rating: number;
  isVerified: boolean;
  userId: string;
}

export function ChatView() {
  const { viewParams, user, goBack } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [organizerInfo, setOrganizerInfo] = useState<ChatOrganizerInfo | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const organizerId = viewParams.organizerId || '';
  const organizerUserId = viewParams.organizerUserId || '';
  const organizerName = viewParams.organizerName || 'Organizer';
  const organizerLogo = viewParams.organizerLogo || '';
  const organizerRating = parseFloat(viewParams.organizerRating || '0');
  const organizerVerified = viewParams.organizerVerified === 'true';

  // Connect to socket
  useEffect(() => {
    const newSocket = io('/?XTransformPort=3003', {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('[ChatView] Connected to chat server');
      if (user?.id) {
        newSocket.emit('register', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[ChatView] Disconnected from chat server');
    });

    // Listen for new messages
    newSocket.on('new-message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for user typing
    newSocket.on('user-typing', (data: { senderId: string }) => {
      if (data.senderId === organizerUserId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    newSocket.on('user-stop-typing', (data: { senderId: string }) => {
      if (data.senderId === organizerUserId) {
        setIsTyping(false);
      }
    });

    // Listen for online/offline
    newSocket.on('user-online', (userId: string) => {
      if (userId === organizerUserId) setIsOnline(true);
    });

    newSocket.on('user-offline', (userId: string) => {
      if (userId === organizerUserId) setIsOnline(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, organizerUserId]);

  // Fetch existing messages
  useEffect(() => {
    if (!user?.id || !organizerUserId || !organizerId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/chat?userId1=${user.id}&userId2=${organizerUserId}&organizerId=${organizerId}`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 5 seconds as fallback
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user?.id, organizerUserId, organizerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !organizerUserId || !organizerId) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Save to database via API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: organizerUserId,
          organizerId,
          message: messageText,
        }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => [...prev, savedMessage]);

        // Emit via socket for real-time
        socket?.emit('send-message', {
          senderId: user.id,
          receiverId: organizerUserId,
          organizerId,
          message: messageText,
        });
      }
    } catch { /* ignore */ } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    socket?.emit('typing', { senderId: user?.id, receiverId: organizerUserId });
    // Auto stop typing after 2s of inactivity
    setTimeout(() => {
      socket?.emit('stop-typing', { senderId: user?.id, receiverId: organizerUserId });
    }, 2000);
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  const formatDateSeparator = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const now = new Date();
      if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) return 'Today';
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Yesterday';
      return format(date, 'MMMM dd, yyyy');
    } catch {
      return '';
    }
  };

  const organizerInitials = organizerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userInitials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  let currentDate = '';
  messages.forEach((msg) => {
    const msgDate = msg.createdAt?.split('T')[0] || '';
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1]?.messages.push(msg);
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#151515]/80 backdrop-blur-md px-3 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex size-8 items-center justify-center rounded-full hover:bg-white/5 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>

          <Avatar className="size-10 border border-white/10 shrink-0">
            <AvatarImage src={organizerLogo} alt={organizerName} />
            <AvatarFallback className="bg-[#8B1A2B]/30 text-[#D4A843] text-sm font-semibold">
              {organizerInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-foreground truncate">{organizerName}</h2>
              {organizerVerified && (
                <ShieldCheck className="size-4 shrink-0 text-[#D4A843]" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Offline</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-muted-foreground hover:text-foreground"
            >
              <Phone className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/[0.08]">
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  Search in Chat
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-red-400">
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className={`h-12 rounded-2xl bg-muted/40 ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-4"
          >
            <div className="size-20 rounded-full bg-[#8B1A2B]/10 flex items-center justify-center">
              <Avatar className="size-12 border-2 border-[#8B1A2B]/20">
                <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-lg font-bold">
                  {organizerInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{organizerName}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <StarRating rating={organizerRating} size="sm" />
                {organizerVerified && (
                  <Badge className="bg-[#D4A843]/15 text-[#D4A843] text-[9px] border-[#D4A843]/20 gap-0.5">
                    <ShieldCheck className="size-2.5" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-[260px]">
              Start a conversation with {organizerName}. Ask about their services, availability, or pricing!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Hi! I\'m interested in your services', 'What packages do you offer?', 'Are you available on my event date?'].map((quickMsg) => (
                <button
                  key={quickMsg}
                  onClick={() => {
                    setNewMessage(quickMsg);
                    inputRef.current?.focus();
                  }}
                  className="text-xs border border-border bg-[#1a1a1a] rounded-full px-3 py-1.5 text-muted-foreground hover:border-[#8B1A2B]/30 hover:text-foreground transition-colors"
                >
                  {quickMsg}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          groupedMessages.map((group, gi) => (
            <div key={gi}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span className="text-[10px] text-muted-foreground/50 bg-[#1a1a1a] border border-border/50 rounded-full px-3 py-0.5">
                  {formatDateSeparator(group.messages[0]?.createdAt || '')}
                </span>
              </div>

              {/* Messages in this group */}
              {group.messages.map((msg, mi) => {
                const isMe = msg.senderId === user?.id;
                const showAvatar = !isMe && (mi === group.messages.length - 1 || group.messages[mi + 1]?.senderId !== msg.senderId);
                const isConsecutive = mi > 0 && group.messages[mi - 1]?.senderId === msg.senderId;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-2'}`}
                  >
                    {/* Avatar for receiver */}
                    {!isMe && (
                      <div className="w-7 shrink-0">
                        {showAvatar && (
                          <Avatar className="size-7 border border-white/10">
                            <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-[9px] font-semibold">
                              {organizerInitials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] ${
                        isMe
                          ? 'bg-[#8B1A2B] text-white rounded-2xl rounded-br-md'
                          : 'bg-[#1a1a1a] border border-white/[0.06] text-foreground rounded-2xl rounded-bl-md'
                      } px-3.5 py-2`}
                    >
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${isMe ? 'text-white/50' : 'text-muted-foreground/50'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isMe && (
                          msg.isRead ? (
                            <CheckCheck className="size-3 text-[#D4A843]" />
                          ) : (
                            <Check className="size-3 text-white/40" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-2 mt-2"
            >
              <Avatar className="size-7 border border-white/10">
                <AvatarFallback className="bg-[#8B1A2B]/20 text-[#D4A843] text-[9px] font-semibold">
                  {organizerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#151515]/80 backdrop-blur-md px-3 py-2.5 pb-safe">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="size-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="bg-white/[0.05] border-white/[0.08] text-sm pr-10 h-10 rounded-full"
              disabled={sending}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:text-foreground"
            >
              <Smile className="size-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="size-10 rounded-full bg-[#8B1A2B] hover:bg-[#8B1A2B]/90 text-white shrink-0 disabled:opacity-40"
            size="icon"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
