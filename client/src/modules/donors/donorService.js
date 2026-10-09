import { apiRequest } from '../../services/api.js';
import { API_ENDPOINTS } from '@shared/api-contracts/endpoints.js';

export const donorService = {
  async getProfile() {
    return await apiRequest(API_ENDPOINTS.DONORS.PROFILE);
  },

  async updateProfile(profileData) {
    return await apiRequest(API_ENDPOINTS.DONORS.PROFILE, {
      method: 'PUT',
      body: profileData
    });
  },

  async updateAvailability(isAvailable) {
    return await apiRequest(API_ENDPOINTS.DONORS.UPDATE_AVAILABILITY, {
      method: 'PATCH',
      body: { isAvailable }
    });
  },

  async getIncomingRequests() {
    return await apiRequest(API_ENDPOINTS.DONORS.INCOMING_REQUESTS);
  },

  async respondToRequest(requestId, response, notes = '') {
    return await apiRequest(API_ENDPOINTS.DONORS.RESPOND_REQUEST(requestId), {
      method: 'POST',
      body: { response, notes }
    });
  },

  async getDonationHistory() {
    return await apiRequest(API_ENDPOINTS.DONORS.DONATION_HISTORY);
  }
};
