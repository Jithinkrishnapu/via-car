import { create } from 'zustand';

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: number;
  type_name: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  hasMorePages: boolean;
  isLoading: boolean;
  error: string | null;
  
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotifications: (notifications: NotificationItem[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  setPagination: (currentPage: number, totalPages: number, hasMorePages: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  currentPage: 1,
  totalPages: 1,
  hasMorePages: false,
  isLoading: false,
  error: null,

  setNotifications: (notifications) => {
    set({ notifications });
  },

  addNotifications: (newNotifications) => {
    set((state) => ({
      notifications: [...state.notifications, ...newNotifications],
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return { notifications, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        is_read: true,
      })),
      unreadCount: 0,
    }));
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  setPagination: (currentPage, totalPages, hasMorePages) => {
    set({ currentPage, totalPages, hasMorePages });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearNotifications: () => {
    set({ 
      notifications: [], 
      unreadCount: 0, 
      currentPage: 1, 
      totalPages: 1, 
      hasMorePages: false,
      error: null 
    });
  },
}));