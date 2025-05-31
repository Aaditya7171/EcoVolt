import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const isGuest = localStorage.getItem('isGuest') === 'true'
      if (!isGuest) {
        // Only redirect authenticated users, not guests
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  getAllUsers: () => api.get('/auth/users'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData)
}

// Charging Stations API calls
export const chargersAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key])
    })
    return api.get(`/chargers?${params}`)
  },
  getById: (id) => api.get(`/chargers/${id}`),
  create: (chargerData) => api.post('/chargers', chargerData),
  update: (id, chargerData) => api.put(`/chargers/${id}`, chargerData),
  delete: (id, reason) => api.delete(`/chargers/${id}`, { data: { reason } }),
  getDebugData: () => api.get('/chargers/debug/all-data')
}

// Admin API calls
export const adminAPI = {
  getPendingCounts: () => api.get('/chargers/pending-counts'),
  getPendingStations: () => api.get('/chargers/pending'),
  approveStation: (id) => api.post(`/chargers/${id}/approve`),
  rejectStation: (id) => api.post(`/chargers/${id}/reject`),
  getPendingDeletions: () => api.get('/chargers/deletion-requests'),
  approveDeletion: (id) => api.post(`/chargers/deletion-requests/${id}/approve`),
  rejectDeletion: (id) => api.post(`/chargers/deletion-requests/${id}/reject`)
}

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }
}

export const getStoredToken = () => {
  return localStorage.getItem('token')
}

export const isAuthenticated = () => {
  const token = getStoredToken()
  return !!token
}

export default api
