import { apiRequest } from './api.js';
import { API_ENDPOINTS } from '@shared/api-contracts/endpoints.js';

export const authService = {
  async register(data) {
    const res = await apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: data
    });
    if (res.token) {
      localStorage.setItem('lifelink_token', res.token);
    }
    return res;
  },

  async login(email, password) {
    const res = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: { email, password }
    });
    if (res.token) {
      localStorage.setItem('lifelink_token', res.token);
    }
    return res;
  },

  async getCurrentUser() {
    return await apiRequest(API_ENDPOINTS.AUTH.ME);
  },

  logout() {
    localStorage.removeItem('lifelink_token');
  }
};
