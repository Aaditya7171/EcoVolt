<template>
  <div class="card p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-white via-light-bg to-light-bg-alt dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 hover:animate-breathing border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-700">
    <!-- Animated background gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <!-- Content wrapper -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {{ charger.name }}
          </h3>
          <div class="flex items-center space-x-2">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="statusClasses"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClasses"></span>
              {{ charger.status }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              ID: {{ charger.id }}
            </span>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="space-y-3">
        <!-- Location -->
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-gray-600 dark:text-gray-400">
            {{ formatCoordinates(charger.latitude, charger.longitude) }}
          </span>
        </div>

        <!-- Power Output -->
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
          </svg>
          <span class="text-gray-600 dark:text-gray-400">
            {{ charger.power_output }} kW
          </span>
        </div>

        <!-- Connector Type -->
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
          <span class="text-gray-600 dark:text-gray-400">
            {{ charger.connector_type }}
          </span>
        </div>

        <!-- Owner -->
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
          <span class="text-gray-600 dark:text-gray-400">
            {{ charger.owner_name || 'Unknown' }}
          </span>
        </div>

        <!-- Created Date -->
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <span class="text-gray-600 dark:text-gray-400">
            {{ formatDate(charger.created_at) }}
          </span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-6 space-y-3">
        <!-- Primary Actions Row -->
        <div class="flex space-x-2">
          <!-- Edit Button -->
          <button
            v-if="canEdit"
            @click="toggleEditMode"
            :class="isEditMode ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
            class="flex-1 inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium border rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 group transform hover:scale-105 active:scale-95"
          >
            <svg class="w-4 h-4 mr-1 group-hover:rotate-12 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            {{ isEditMode ? 'Cancel Edit' : 'Edit' }}
          </button>

          <!-- View on Map Button -->
          <button
            @click="viewOnMap"
            :class="!canEdit && !canDelete ? 'w-full' : 'flex-1'"
            class="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 group transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4 mr-1 group-hover:scale-110 group-hover:animate-pulse transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Map
          </button>
        </div>

        <!-- Edit Actions Row (shown when edit mode is active) -->
        <div v-if="isEditMode && canEdit" class="flex space-x-2 animate-slide-up">
          <!-- Confirm Edit Button -->
          <button
            @click="confirmEdit"
            class="flex-1 inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 group transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Edit Station
          </button>

          <!-- Delete Button (only shown in edit mode) -->
          <button
            v-if="canDelete"
            @click="confirmDelete"
            class="flex-1 inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 group transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:animate-wiggle"
          >
            <svg class="w-4 h-4 mr-1 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete Station
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'

const props = defineProps({
  charger: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const router = useRouter()
const authStore = useAuthStore()
const showActions = ref(false)
const isEditMode = ref(false)

const statusClasses = computed(() => {
  return props.charger.status === 'Active'
    ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
    : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
})

const statusDotClasses = computed(() => {
  return props.charger.status === 'Active'
    ? 'bg-success-400'
    : 'bg-warning-400'
})

// Permission checks
const canEdit = computed(() => {
  if (!authStore.isAuthenticated) return false
  // Admin can edit all stations, regular users can edit their own stations
  return authStore.isAdmin || props.charger.user_id === authStore.user?.id
})

const canDelete = computed(() => {
  if (!authStore.isAuthenticated) return false
  // Admin can delete all stations, regular users can delete their own stations
  return authStore.isAdmin || props.charger.user_id === authStore.user?.id
})

const formatCoordinates = (lat, lng) => {
  return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const confirmEdit = () => {
  emit('edit', props.charger)
  isEditMode.value = false
}

const confirmDelete = () => {
  emit('delete', props.charger)
  isEditMode.value = false
}

const viewOnMap = () => {
  router.push({
    name: 'map',
    query: {
      lat: props.charger.latitude,
      lng: props.charger.longitude,
      id: props.charger.id
    }
  })
}
</script>
