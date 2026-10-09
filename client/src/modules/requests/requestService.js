import { apiRequest } from '../../services/api.js';
import { API_ENDPOINTS } from '@shared/api-contracts/endpoints.js';

export const requestService = {
  async getRequests(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.urgency) queryParams.append('urgency', filters.urgency);
    if (filters.bloodGroup) queryParams.append('bloodGroup', filters.bloodGroup);

    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await apiRequest(`${API_ENDPOINTS.REQUESTS.LIST}${queryStr}`);
  },

  async getRequestById(id) {
    return await apiRequest(API_ENDPOINTS.REQUESTS.GET_BY_ID(id));
  },

  async createRequest(data) {
    return await apiRequest(API_ENDPOINTS.REQUESTS.CREATE, {
      method: 'POST',
      body: data
    });
  },

  async verifyRequest(id, status = 'VERIFIED', notes = '') {
    return await apiRequest(API_ENDPOINTS.REQUESTS.VERIFY(id), {
      method: 'POST',
      body: { status, notes }
    });
  },

  async updateStatus(id, nextStatus, notes = '') {
    return await apiRequest(API_ENDPOINTS.REQUESTS.UPDATE_STATUS(id), {
      method: 'PATCH',
      body: { nextStatus, notes }
    });
  },

  async cancelRequest(id, reason = '') {
    return await apiRequest(API_ENDPOINTS.REQUESTS.CANCEL(id), {
      method: 'POST',
      body: { reason }
    });
  },

  async getHistory(id) {
    return await apiRequest(API_ENDPOINTS.REQUESTS.HISTORY(id));
  }
};
