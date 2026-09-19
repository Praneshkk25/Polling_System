// PulsePoll API Service Client

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Retrieve or generate unique voter token for anonymous duplicate prevention
export function getVoterToken() {
  let token = localStorage.getItem('pulsepoll_voter_token');
  if (!token) {
    token = 'voter_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('pulsepoll_voter_token', token);
  }
  return token;
}

// Helper for fetch with headers
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('pulsepoll_auth_token');
  const voterToken = getVoterToken();

  const headers = {
    'Content-Type': 'application/json',
    'X-Voter-Token': voterToken,
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => {}),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),

  // Polls
  getPolls: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.userId) query.set('userId', params.userId);
    if (params.excludeMock !== undefined) query.set('excludeMock', params.excludeMock);
    const qs = query.toString();
    return request(`/polls${qs ? `?${qs}` : ''}`);
  },
  getPublicPolls: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.userId) query.set('userId', params.userId);
    if (params.excludeMock !== undefined) query.set('excludeMock', params.excludeMock);
    const qs = query.toString();
    return request(`/public/polls${qs ? `?${qs}` : ''}`);
  },
  getStats: (params = {}) => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    const qs = query.toString();
    return request(`/dashboard/stats${qs ? `?${qs}` : ''}`);
  },
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    const qs = query.toString();
    return request(`/analytics${qs ? `?${qs}` : ''}`);
  },
  getActivities: (params = {}) => {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    const qs = query.toString();
    return request(`/dashboard/activity${qs ? `?${qs}` : ''}`);
  },
  getPoll: (id) => request(`/polls/${id}`),
  getResults: (id) => request(`/polls/${id}/results`),
  createPoll: (pollData) => request('/polls', { method: 'POST', body: JSON.stringify(pollData) }),
  updatePoll: (id, pollData) => request(`/polls/${id}`, { method: 'PUT', body: JSON.stringify(pollData) }),
  deletePoll: (id) => request(`/polls/${id}`, { method: 'DELETE' }),
  closePoll: (id) => request(`/polls/${id}/close`, { method: 'POST' }),
  duplicatePoll: (id) => request(`/polls/${id}/duplicate`, { method: 'POST' }),
  updateStatus: (id, status) => request(`/polls/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Voting
  castVote: (pollId, optionId) => {
    const voterId = getVoterToken();
    return request(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId, voterId }),
    });
  },
};
