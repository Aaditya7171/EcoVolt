import axios from 'axios'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second base delay

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 60000, // Increased to 60 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Retry function with exponential backoff
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await api.request(config)
  } catch (error) {
    // Check if we should retry
    const shouldRetry = retryCount < MAX_RETRIES && (
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ENOTFOUND' || // Network error
      error.code === 'ECONNRESET' || // Connection reset
      (error.response && error.response.status >= 500) // Server errors
    )

    if (shouldRetry) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount) // Exponential backoff
      console.log(`Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`)

      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(config, retryCount + 1)
    }

    throw error
  }
}

// Request interceptor to add auth token and retry metadata
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add retry metadata
    config.metadata = { startTime: new Date() }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and log performance
api.interceptors.response.use(
  (response) => {
    // Log successful request timing
    if (response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime
      if (duration > 5000) { // Log slow requests (>5s)
        console.log(`Slow request detected: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
      }
    }
    return response.data
  },
  (error) => {
    // Log error timing
    if (error.config?.metadata) {
      const duration = new Date() - error.config.metadata.startTime
      console.log(`Request failed: ${error.config.method?.toUpperCase()} ${error.config.url} after ${duration}ms`)
    }

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

    // Enhanced error message for timeouts
    if (error.code === 'ECONNABORTED') {
      const timeoutMessage = 'Request timed out. The server may be experiencing high load. Please try again.'
      return Promise.reject(new Error(timeoutMessage))
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

// Simple cache for chargers data
let chargersCache = {
  data: null,
  timestamp: null,
  ttl: 30000 // 30 seconds cache
}

// Charging Stations API calls with retry and caching
export const chargersAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key])
    })

    const cacheKey = `/chargers?${params}`
    const now = Date.now()

    // Check cache for unfiltered requests
    if (!Object.keys(filters).length && chargersCache.data &&
        chargersCache.timestamp && (now - chargersCache.timestamp < chargersCache.ttl)) {
      console.log('Returning cached chargers data')
      return chargersCache.data
    }

    try {
      const response = await retryRequest({
        method: 'get',
        url: cacheKey,
        timeout: 60000 // 60 seconds for chargers list
      })

      // Cache unfiltered results
      if (!Object.keys(filters).length) {
        chargersCache.data = response
        chargersCache.timestamp = now
      }

      return response
    } catch (error) {
      console.error('Failed to fetch chargers after retries:', error)
      throw error
    }
  },

  getById: (id) => retryRequest({
    method: 'get',
    url: `/chargers/${id}`,
    timeout: 30000 // 30 seconds for single charger
  }),

  create: (chargerData) => {
    // Clear cache when creating new charger
    chargersCache.data = null
    return retryRequest({
      method: 'post',
      url: '/chargers',
      data: chargerData,
      timeout: 45000 // 45 seconds for create operations
    })
  },

  update: (id, chargerData) => {
    // Clear cache when updating charger
    chargersCache.data = null
    return retryRequest({
      method: 'put',
      url: `/chargers/${id}`,
      data: chargerData,
      timeout: 45000 // 45 seconds for update operations
    })
  },

  delete: (id, reason) => {
    // Clear cache when deleting charger
    chargersCache.data = null
    return retryRequest({
      method: 'delete',
      url: `/chargers/${id}`,
      data: { reason },
      timeout: 30000 // 30 seconds for delete operations
    })
  },

  getDebugData: () => retryRequest({
    method: 'get',
    url: '/chargers/debug/all-data',
    timeout: 90000 // 90 seconds for debug data (potentially large)
  }),

  // Database health check
  checkHealth: () => retryRequest({
    method: 'get',
    url: '/chargers/health',
    timeout: 30000 // 30 seconds for health check
  }),

  // Initialize database tables
  initDatabase: () => retryRequest({
    method: 'post',
    url: '/chargers/init-db',
    timeout: 60000 // 60 seconds for database initialization
  })
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

// Cache management utilities
export const clearChargersCache = () => {
  chargersCache.data = null
  chargersCache.timestamp = null
  console.log('Chargers cache cleared')
}

export const getCacheStatus = () => {
  const now = Date.now()
  const isValid = chargersCache.data && chargersCache.timestamp &&
                  (now - chargersCache.timestamp < chargersCache.ttl)

  return {
    hasData: !!chargersCache.data,
    timestamp: chargersCache.timestamp,
    isValid,
    age: chargersCache.timestamp ? now - chargersCache.timestamp : null
  }
}

export default api
