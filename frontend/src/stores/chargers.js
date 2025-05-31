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
  const fetchChargers = async (apiFilters = {}) => {
    try {
      loading.value = true
      error.value = null

      const response = await chargersAPI.getAll(apiFilters)

      if (response.success) {
        chargers.value = response.data.stations || []
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch chargers'
      console.error('Fetch chargers error:', err)
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
