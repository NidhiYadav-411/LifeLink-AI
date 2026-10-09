// Centralized API Contract endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout'
  },
  // Donors
  DONORS: {
    PROFILE: '/api/donors/profile',
    UPDATE_AVAILABILITY: '/api/donors/availability',
    INCOMING_REQUESTS: '/api/donors/incoming-requests',
    RESPOND_REQUEST: (requestId) => `/api/donors/requests/${requestId}/respond`,
    DONATION_HISTORY: '/api/donors/history'
  },
  // Requests
  REQUESTS: {
    LIST: '/api/requests',
    CREATE: '/api/requests',
    GET_BY_ID: (id) => `/api/requests/${id}`,
    VERIFY: (id) => `/api/requests/${id}/verify`,
    UPDATE_STATUS: (id) => `/api/requests/${id}/status`,
    CANCEL: (id) => `/api/requests/${id}/cancel`,
    HISTORY: (id) => `/api/requests/${id}/history`
  },
  // Matching
  MATCHING: {
    FIND_CANDIDATES: (requestId) => `/api/matching/requests/${requestId}/candidates`,
    INITIATE_OUTREACH: (requestId) => `/api/matching/requests/${requestId}/outreach`,
    EXPAND_RADIUS: (requestId) => `/api/matching/requests/${requestId}/expand-radius`,
    RECORD_RESPONSE: (requestId) => `/api/matching/requests/${requestId}/response`
  },
  // Admin
  ADMIN: {
    USERS: '/api/admin/users',
    HOSPITALS: '/api/admin/hospitals',
    VERIFY_HOSPITAL: (id) => `/api/admin/hospitals/${id}/verify`,
    AUDIT_LOGS: '/api/admin/audit-logs',
    STATS: '/api/admin/stats'
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all'
  }
};
