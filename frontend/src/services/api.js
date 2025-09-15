import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
});

// Suggestions API
export const suggestionsApi = {
  // Get all suggestions
  getAll: () => api.get('/api/suggestions'),

  // Get single suggestion
  getById: (id) => api.get(`/api/suggestions/${id}`),

  // Create new suggestion
  create: (data) => api.post('/api/suggestions', data),

  // Update suggestion status (admin only)
  updateStatus: (id, status) => api.patch(`/api/suggestions/${id}`, { status }),

  // Delete suggestion (admin only)
  delete: (id) => api.delete(`/api/suggestions/${id}`),
};

// Voting API
export const votingApi = {
  // Vote on suggestion
  vote: (suggestionId, userId, voteValue = 1) => api.put(`/api/suggestions/${suggestionId}/vote`, { userId, voteValue }),
};

// Auth API
export const authApi = {
  // Get current user
  getUser: () => api.get('/api/auth/user'),

  // Logout
  logout: () => api.get('/api/auth/logout'),
};

export default api;
