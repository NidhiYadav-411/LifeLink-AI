import { apiRequest } from './api.js';
import { API_ENDPOINTS } from '@shared/api-contracts/endpoints.js';

export const notificationService = {
  async getNotifications() {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.LIST);
  },

  async markAsRead(id) {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: 'PATCH'
    });
  },

  async markAllAsRead() {
    return await apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PATCH'
    });
  }
};
