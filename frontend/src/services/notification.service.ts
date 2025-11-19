import { api } from './api';
import { Notification } from '@/types';

interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export const notificationService = {
  async getNotifications(params?: {
    skip?: number;
    limit?: number;
    is_read?: boolean;
  }): Promise<NotificationListResponse> {
    const response = await api.get<NotificationListResponse>('/notifications', {
      params,
    });
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}`, { is_read: true });
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },
};
