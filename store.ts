import { create } from 'zustand';
import type { User, UserRole, ViewName, Notification as AppNotification } from './types';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  
  // Navigation
  currentView: ViewName;
  previousView: ViewName | null;
  viewParams: Record<string, string>;
  
  // Notifications
  notifications: AppNotification[];
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setView: (view: ViewName, params?: Record<string, string>) => void;
  goBack: () => void;
  addNotification: (notification: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  
  // Navigation
  currentView: 'auth',
  previousView: null,
  viewParams: {},
  
  // Notifications
  notifications: [],
  
  // Actions
  login: (user: User) => {
    set({ isAuthenticated: true, user });
    // Fetch notifications from API
    get().fetchNotifications(user.id);
    // Navigate based on role
    if (user.role === 'customer') {
      set({ currentView: 'customer-home', previousView: 'auth' });
    } else if (user.role === 'organizer') {
      set({ currentView: 'organizer-dashboard', previousView: 'auth' });
    } else if (user.role === 'admin') {
      set({ currentView: 'admin-panel', previousView: 'auth' });
    }
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      currentView: 'auth',
      previousView: null,
      viewParams: {},
      notifications: [],
    });
  },
  
  setView: (view: ViewName, params: Record<string, string> = {}) => {
    const { currentView } = get();
    set({ currentView: view, previousView: currentView, viewParams: params });
  },
  
  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({ currentView: previousView, previousView: null });
    }
  },
  
  addNotification: (notification: AppNotification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },
  
  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
    // Also mark as read on the server
    fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => { /* ignore */ });
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },

  fetchNotifications: async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        set({ notifications: data });
      }
    } catch { /* ignore */ }
  },
}));
