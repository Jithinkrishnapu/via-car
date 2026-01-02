import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { handleApiError } from "@/utils/api-error-handler";

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

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
    from: number;
    to: number;
  };
}

export interface NotificationParams {
  page?: number;
  per_page?: number;
  type?: number;
}

export const getNotifications = async (params: NotificationParams = {}): Promise<NotificationResponse> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? "";

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params.type) queryParams.append('type', params.type.toString());

  const url = `${API_URL}/api/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Get notifications API error:", error);
    handleApiError(error, () => getNotifications(params));
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? "";

  try {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Mark notification as read API error:", error);
    handleApiError(error, () => markNotificationAsRead(notificationId));
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? "";

  try {
    const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Mark all notifications as read API error:", error);
    handleApiError(error, () => markAllNotificationsAsRead());
    throw error;
  }
};

export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? "";

  try {
    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Get unread notification count API error:", error);
    handleApiError(error, () => getUnreadNotificationCount());
    throw error;
  }
};