import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { chargersAPI } from '@/services/api'

export const useChargersStore = defineStore('chargers', () => {
  const chargers = ref([])
  const currentCharger = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    status: '',
    power_output: '',
    connector_type: ''
  })

  // Computed properties
  const filteredChargers = computed(() => {
    if (!chargers.value.length) return []

    return chargers.value.filter(charger => {
      const statusMatch = !filters.value.status || charger.status === filters.value.status
      const powerMatch = !filters.value.power_output || charger.power_output >= parseInt(filters.value.power_output)
      const connectorMatch = !filters.value.connector_type || charger.connector_type === filters.value.connector_type

      return statusMatch && powerMatch && connectorMatch
    })
  })

  const activeChargers = computed(() =>
    chargers.value.filter(charger => charger.status === 'Active')
  )

  const inactiveChargers = computed(() =>
    chargers.value.filter(charger => charger.status === 'Inactive')
  )

  const totalChargers = computed(() => chargers.value.length)

  // Actions
  const fetchChargers = async (apiFilters = {}, retryCount = 0) => {
    const maxRetries = 2

    try {
      loading.value = true
      error.value = null

      const response = await chargersAPI.getAll(apiFilters)

      if (response.success) {
        chargers.value = response.data.stations || []
        console.log(`Successfully loaded ${chargers.value.length} charging stations`)
      }
    } catch (err) {
      console.error('Fetch chargers error:', err)

      // Enhanced error handling with user-friendly messages
      let errorMessage = 'Failed to fetch chargers'

      if (err.message?.includes('timeout') || err.message?.includes('timed out')) {
        errorMessage = 'Loading is taking longer than usual. The server may be experiencing high load. Please wait or try refreshing the page.'
      } else if (err.message?.includes('Network Error') || err.message?.includes('ENOTFOUND')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      } else if (err.message?.includes('500') || err.status === 500) {
        errorMessage = 'Server error occurred. The database may be initializing or experiencing issues. Please try again in a few minutes.'
      } else if (err.message?.includes('503') || err.status === 503) {
        errorMessage = 'Service temporarily unavailable. The database may be starting up. Please try again in a moment.'
      } else if (err.message?.includes('504') || err.status === 504) {
        errorMessage = 'Server response timed out. Please try again or contact support if the issue persists.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      // Log detailed error information for debugging
      console.error('Detailed fetch error:', {
        message: err.message,
        status: err.status || err.response?.status,
        data: err.response?.data,
        code: err.code
      })

      error.value = errorMessage

      // Auto-retry for network/timeout errors
      if (retryCount < maxRetries && (
        err.message?.includes('timeout') ||
        err.message?.includes('Network Error') ||
        err.message?.includes('ENOTFOUND')
      )) {
        console.log(`Auto-retrying fetch chargers... (attempt ${retryCount + 1}/${maxRetries})`)
        setTimeout(() => {
          fetchChargers(apiFilters, retryCount + 1)
        }, 2000 * (retryCount + 1)) // Increasing delay
        return
      }
    } finally {
      loading.value = false
    }
  }

  const fetchChargerById = async (id) => {
    try {
      loading.value = true
      error.value = null

      const response = await chargersAPI.getById(id)

      if (response.success) {
        currentCharger.value = response.data.station
        return response.data.station
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch charger'
      console.error('Fetch charger error:', err)
    } finally {
      loading.value = false
    }
  }

  const createCharger = async (chargerData) => {
    try {
      loading.value = true
      error.value = null

      const response = await chargersAPI.create(chargerData)

      if (response.success) {
        chargers.value.unshift(response.data.station)
        return { success: true, data: response.data.station }
      }
    } catch (err) {
      error.value = err.message || 'Failed to create charger'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateCharger = async (id, chargerData) => {
    try {
      loading.value = true
      error.value = null

      const response = await chargersAPI.update(id, chargerData)

      if (response.success) {
        const index = chargers.value.findIndex(c => c.id === id)
        if (index !== -1) {
          chargers.value[index] = response.data.station
        }
        currentCharger.value = response.data.station
        return { success: true, data: response.data.station }
      }
    } catch (err) {
      error.value = err.message || 'Failed to update charger'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteCharger = async (id, reason = '') => {
    try {
      loading.value = true
      error.value = null

      const response = await chargersAPI.delete(id, reason)

      if (response.success) {
        // Only remove from local state if it was actually deleted (admin action)
        // For regular users, the station stays until admin approves deletion
        if (response.message && response.message.includes('deleted successfully')) {
          chargers.value = chargers.value.filter(c => c.id !== id)
          if (currentCharger.value?.id === id) {
            currentCharger.value = null
          }
        }
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete charger'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      status: '',
      power_output: '',
      connector_type: ''
    }
  }

  const setCurrentCharger = (charger) => {
    currentCharger.value = charger
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    chargers,
    currentCharger,
    loading,
    error,
    filters,

    // Computed
    filteredChargers,
    activeChargers,
    inactiveChargers,
    totalChargers,

    // Actions
    fetchChargers,
    fetchChargerById,
    createCharger,
    updateCharger,
    deleteCharger,
    setFilters,
    clearFilters,
    setCurrentCharger,
    clearError
  }
})
