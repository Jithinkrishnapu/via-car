import { useEffect, useCallback } from 'react';
import { useNotificationStore } from './useNotificationStore';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  NotificationParams 
} from '@/service/notifications';

export const useNotificationData = () => {
  const {
    notifications,
    unreadCount,
    currentPage,
    totalPages,
    hasMorePages,
    isLoading,
    error,
    setNotifications,
    addNotifications,
    markAsRead,
    markAllAsRead,
    setUnreadCount,
    setPagination,
    setLoading,
    setError,
    clearNotifications,
  } = useNotificationStore();

  // Fetch notifications
  const fetchNotifications = useCallback(async (params: NotificationParams = {}, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNotifications({
        page: params.page || 1,
        per_page: params.per_page || 10,
        type: params.type,
      });

      if (response.success) {
        if (append) {
          addNotifications(response.data);
        } else {
          setNotifications(response.data);
        }

        setPagination(
          response.pagination.current_page,
          response.pagination.last_page,
          response.pagination.has_more_pages
        );

        // Update unread count based on fetched data
        const unreadNotifications = response.data.filter(n => !n.is_read);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      setError(error.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [setNotifications, addNotifications, setPagination, setUnreadCount, setLoading, setError]);

  // Load more notifications (pagination)
  const loadMoreNotifications = useCallback(async () => {
    if (hasMorePages && !isLoading) {
      await fetchNotifications({ page: currentPage + 1 }, true);
    }
  }, [hasMorePages, isLoading, currentPage, fetchNotifications]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      markAsRead(notificationId);
      
      // Update unread count
      const updatedUnreadCount = notifications.filter(n => !n.is_read && n.id !== notificationId).length;
      setUnreadCount(updatedUnreadCount);
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      setError(error.message || 'Failed to mark notification as read');
    }
  }, [notifications, markAsRead, setUnreadCount, setError]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsRead();
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      setError(error.message || 'Failed to mark all notifications as read');
    }
  }, [markAllAsRead, setUnreadCount, setError]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.count);
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [setUnreadCount]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications({ page: 1 });
  }, [fetchNotifications]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  return {
    // Data
    notifications,
    unreadCount,
    currentPage,
    totalPages,
    hasMorePages,
    isLoading,
    error,

    // Actions
    fetchNotifications,
    loadMoreNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
    fetchUnreadCount,
    clearNotifications,
  };
};