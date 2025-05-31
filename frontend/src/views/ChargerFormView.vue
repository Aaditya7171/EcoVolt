<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <button
          @click="$router.go(-1)"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Charging Station' : 'Add New Charging Station' }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ isEditing ? 'Update the charging station details' : 'Create a new charging station for your network' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="card p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h2>

        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="label">Station Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              :class="{ 'border-red-500 dark:border-red-500': errors.name }"
              placeholder="e.g. Downtown Charging Hub"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.name }}
            </p>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="label">Status *</label>
            <select
              id="status"
              v-model="form.status"
              required
              class="input"
              :class="{ 'border-red-500 dark:border-red-500': errors.status }"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.status }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Location</h2>

        <!-- Location Search Component -->
        <LocationSearch
          v-model="locationCoordinates"
          :on-show-on-map="showLocationOnMap"
          @location-selected="handleLocationSelected"
        />

        <!-- Location validation error -->
        <p v-if="errors.location" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.location }}
        </p>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Technical Specifications</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Power Output -->
          <div>
            <label for="power_output" class="label">Power Output (kW) *</label>
            <input
              id="power_output"
              v-model="form.power_output"
              type="number"
              min="1"
              required
              class="input"
              :class="{ 'border-red-500 dark:border-red-500': errors.power_output }"
              placeholder="e.g. 150"
            />
            <p v-if="errors.power_output" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.power_output }}
            </p>
          </div>

          <!-- Connector Type -->
          <div>
            <label for="connector_type" class="label">Connector Type *</label>
            <select
              id="connector_type"
              v-model="form.connector_type"
              required
              class="input"
              :class="{ 'border-red-500 dark:border-red-500': errors.connector_type }"
            >
              <option value="">Select Connector Type</option>
              <option value="Type 1">Type 1 (J1772)</option>
              <option value="Type 2">Type 2 (Mennekes)</option>
              <option value="Type 3">Type 3</option>
              <option value="CCS">CCS (Combined Charging System)</option>
              <option value="CHAdeMO">CHAdeMO</option>
            </select>
            <p v-if="errors.connector_type" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.connector_type }}
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="chargersStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="ml-3 text-sm text-red-800 dark:text-red-200">
            {{ chargersStore.error }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-4">
        <button
          type="button"
          @click="$router.go(-1)"
          class="flex-1 btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="chargersStore.loading"
          class="flex-1 btn btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': chargersStore.loading }"
        >
          <div v-if="chargersStore.loading" class="flex items-center justify-center">
            <div class="spinner w-5 h-5 mr-2"></div>
            {{ isEditing ? 'Updating...' : (authStore.isAdmin ? 'Creating...' : 'Submitting...') }}
          </div>
          <span v-else>
            {{ isEditing ? 'Update Station' : (authStore.isAdmin ? 'Create Station' : 'Submit for Approval') }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChargersStore } from '@/stores/chargers'
import { useAuthStore } from '@/stores/counter'
import LocationSearch from '@/components/LocationSearch.vue'

const route = useRoute()
const router = useRouter()
const chargersStore = useChargersStore()
const authStore = useAuthStore()

const isEditing = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  status: 'Active',
  power_output: '',
  connector_type: ''
})

const locationCoordinates = ref({
  latitude: '',
  longitude: ''
})

const errors = reactive({
  name: '',
  location: '',
  status: '',
  power_output: '',
  connector_type: ''
})

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  if (!form.name.trim()) {
    errors.name = 'Station name is required'
    isValid = false
  }

  if (!locationCoordinates.value.latitude || !locationCoordinates.value.longitude) {
    errors.location = 'Location is required. Please search for a location or enter coordinates manually.'
    isValid = false
  } else {
    const lat = parseFloat(locationCoordinates.value.latitude)
    const lng = parseFloat(locationCoordinates.value.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      errors.location = 'Invalid coordinates format'
      isValid = false
    } else if (lat < -90 || lat > 90) {
      errors.location = 'Latitude must be between -90 and 90'
      isValid = false
    } else if (lng < -180 || lng > 180) {
      errors.location = 'Longitude must be between -180 and 180'
      isValid = false
    }
  }

  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  if (!form.power_output) {
    errors.power_output = 'Power output is required'
    isValid = false
  } else if (form.power_output <= 0) {
    errors.power_output = 'Power output must be greater than 0'
    isValid = false
  }

  if (!form.connector_type) {
    errors.connector_type = 'Connector type is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const chargerData = {
    name: form.name.trim(),
    latitude: parseFloat(locationCoordinates.value.latitude),
    longitude: parseFloat(locationCoordinates.value.longitude),
    status: form.status,
    power_output: parseInt(form.power_output),
    connector_type: form.connector_type
  }

  let result
  if (isEditing.value) {
    result = await chargersStore.updateCharger(route.params.id, chargerData)
  } else {
    result = await chargersStore.createCharger(chargerData)
  }

  if (result.success) {
    router.push('/chargers')
  }
}

// Location handling methods
const handleLocationSelected = (location) => {
  console.log('Location selected:', location)
  // Clear any location errors when a location is selected
  errors.location = ''
}

const showLocationOnMap = (latitude, longitude) => {
  // Open map view with the selected coordinates
  const mapUrl = `/map?lat=${latitude}&lng=${longitude}`
  window.open(mapUrl, '_blank')
}

onMounted(async () => {
  if (isEditing.value) {
    const charger = await chargersStore.fetchChargerById(route.params.id)
    if (charger) {
      form.name = charger.name
      form.status = charger.status
      form.power_output = charger.power_output
      form.connector_type = charger.connector_type

      // Set location coordinates
      locationCoordinates.value = {
        latitude: charger.latitude,
        longitude: charger.longitude
      }
    }
  }
})
</script>
