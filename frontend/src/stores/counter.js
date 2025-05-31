import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authAPI, setAuthToken } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null

      const response = await authAPI.login(credentials)

      if (response.success) {
        user.value = response.data.user
        token.value = response.data.token

        // Store in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // Set axios default header
        setAuthToken(response.data.token)

        return { success: true }
      }
    } catch (err) {
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null

      const response = await authAPI.register(userData)

      if (response.success) {
        user.value = response.data.user
        token.value = response.data.token

        // Store in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // Set axios default header
        setAuthToken(response.data.token)

        return { success: true }
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }



  const logout = () => {
    user.value = null
    token.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Clear axios header
    setAuthToken(null)
  }

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      // Initialize authenticated user
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      setAuthToken(storedToken)
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.success) {
        user.value = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    } catch (err) {
      console.error('Failed to get current user:', err)
      logout()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    initializeAuth,
    getCurrentUser
  }
})
