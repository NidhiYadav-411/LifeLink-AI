import { apiRequest } from '../../services/api.js';
import { API_ENDPOINTS } from '@shared/api-contracts/endpoints.js';

export const matchingService = {
  async getCandidates(requestId, radiusKm = 10) {
    return await apiRequest(`${API_ENDPOINTS.MATCHING.FIND_CANDIDATES(requestId)}?radius=${radiusKm}`);
  },

  async initiateOutreach(requestId, donorIds) {
    return await apiRequest(API_ENDPOINTS.MATCHING.INITIATE_OUTREACH(requestId), {
      method: 'POST',
      body: { donorIds }
    });
  },

  async expandRadius(requestId, nextRadiusKm) {
    return await apiRequest(API_ENDPOINTS.MATCHING.EXPAND_RADIUS(requestId), {
      method: 'POST',
      body: { nextRadiusKm }
    });
  },

  async recordResponse(requestId, donorId, response, notes = '') {
    return await apiRequest(API_ENDPOINTS.MATCHING.RECORD_RESPONSE(requestId), {
      method: 'POST',
      body: { donorId, response, notes }
    });
  }
};
