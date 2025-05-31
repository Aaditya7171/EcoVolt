<template>
  <div class="space-y-4">
    <!-- Location Search Input -->
    <div class="relative">
      <label for="location-search" class="label">
        Location *
        <span class="text-sm text-gray-500 dark:text-gray-400 font-normal ml-1">
          (e.g., "Vijay Nagar, Indore")
        </span>
      </label>

      <div class="relative">
        <input
          id="location-search"
          v-model="searchQuery"
          type="text"
          class="input pr-10"
          :class="{
            'border-red-500 dark:border-red-500': error,
            'border-green-500 dark:border-green-500': selectedLocation && !error
          }"
          placeholder="Start typing a location name..."
          @input="handleSearchInput"
          @focus="showSuggestions = true"
          @blur="handleBlur"
          @keydown="handleKeydown"
          autocomplete="off"
        />

        <!-- Loading spinner -->
        <div v-if="loading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div class="spinner w-5 h-5"></div>
        </div>

        <!-- Clear button -->
        <button
          v-else-if="searchQuery"
          type="button"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Error message -->
      <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>

      <!-- Success message -->
      <p v-else-if="selectedLocation" class="mt-1 text-sm text-green-600 dark:text-green-400">
        ✓ Location selected: {{ selectedLocation.displayName }}
      </p>

      <!-- Suggestions dropdown -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <div
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.latitude}-${suggestion.longitude}`"
          class="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20': index === selectedIndex }"
          @mousedown="selectLocation(suggestion)"
        >
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ suggestion.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ suggestion.displayName }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ formatCoordinates(suggestion.latitude, suggestion.longitude) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No results message -->
      <div
        v-if="showSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && !loading"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4"
      >
        <div class="text-center text-gray-500 dark:text-gray-400">
          <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm">No locations found for "{{ searchQuery }}"</p>
          <p class="text-xs mt-1">Try a different search term</p>
        </div>
      </div>
    </div>

    <!-- Manual coordinates input (fallback) -->
    <div v-if="showManualInput" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">
          Manual Coordinates Entry
        </h3>
        <button
          type="button"
          @click="showManualInput = false"
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Hide
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="manual-latitude" class="label">Latitude *</label>
          <input
            id="manual-latitude"
            v-model="manualCoordinates.latitude"
            type="number"
            step="any"
            class="input"
            placeholder="e.g. 22.7196"
            @input="handleManualCoordinateChange"
          />
        </div>
        <div>
          <label for="manual-longitude" class="label">Longitude *</label>
          <input
            id="manual-longitude"
            v-model="manualCoordinates.longitude"
            type="number"
            step="any"
            class="input"
            placeholder="e.g. 75.8577"
            @input="handleManualCoordinateChange"
          />
        </div>
      </div>

      <!-- Google Maps tip - only shown when manual input is visible -->
      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div class="flex items-start space-x-2">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> You can use Google Maps to find exact coordinates. Right-click on a location and select the coordinates to copy them.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle manual input -->
    <div class="flex justify-center">
      <button
        type="button"
        @click="showManualInput = !showManualInput"
        class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        {{ showManualInput ? 'Hide manual entry' : 'Enter coordinates manually' }}
      </button>
    </div>

    <!-- Selected coordinates display -->
    <div v-if="coordinates.latitude && coordinates.longitude" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">Selected Coordinates:</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ formatCoordinates(coordinates.latitude, coordinates.longitude) }}
          </p>
        </div>
        <button
          v-if="onShowOnMap"
          type="button"
          @click="onShowOnMap(coordinates.latitude, coordinates.longitude)"
          class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          Show on Map
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import geocodingService from '@/services/geocoding'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ latitude: '', longitude: '' })
  },
  onShowOnMap: {
    type: Function,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'location-selected'])

// Reactive data
const searchQuery = ref('')
const suggestions = ref([])
const selectedLocation = ref(null)
const selectedIndex = ref(-1)
const showSuggestions = ref(false)
const showManualInput = ref(false)
const loading = ref(false)
const error = ref('')

const manualCoordinates = reactive({
  latitude: '',
  longitude: ''
})

// Computed
const coordinates = computed(() => props.modelValue)

// Debounced search
let searchTimeout = null

// Methods
const handleSearchInput = () => {
  error.value = ''
  selectedLocation.value = null
  selectedIndex.value = -1

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  searchTimeout = setTimeout(async () => {
    await searchLocations()
  }, 300)
}

const searchLocations = async () => {
  if (searchQuery.value.length < 2) return

  loading.value = true
  error.value = ''

  try {
    const results = await geocodingService.searchLocations(searchQuery.value, 5)
    suggestions.value = results
    showSuggestions.value = true
  } catch (err) {
    error.value = err.message
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

const selectLocation = (location) => {
  selectedLocation.value = location
  searchQuery.value = location.displayName
  suggestions.value = []
  showSuggestions.value = false
  selectedIndex.value = -1

  // Update coordinates
  updateCoordinates(location.latitude, location.longitude)

  // Emit location selected event
  emit('location-selected', location)
}

const updateCoordinates = (latitude, longitude) => {
  emit('update:modelValue', {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude)
  })
}

const handleManualCoordinateChange = () => {
  const lat = parseFloat(manualCoordinates.latitude)
  const lng = parseFloat(manualCoordinates.longitude)

  if (!isNaN(lat) && !isNaN(lng)) {
    if (geocodingService.isValidCoordinates(lat, lng)) {
      updateCoordinates(lat, lng)
      selectedLocation.value = null
      searchQuery.value = ''
      error.value = ''
    } else {
      error.value = 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
    }
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  selectedLocation.value = null
  showSuggestions.value = false
  selectedIndex.value = -1
  error.value = ''

  updateCoordinates('', '')
}

const handleBlur = () => {
  // Delay hiding suggestions to allow for click events
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleKeydown = (event) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
        selectLocation(suggestions.value[selectedIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedIndex.value = -1
      break
  }
}

const formatCoordinates = (lat, lng) => {
  return geocodingService.formatCoordinates(lat, lng)
}

// Watch for external coordinate changes
watch(() => props.modelValue, (newValue) => {
  if (newValue.latitude && newValue.longitude) {
    manualCoordinates.latitude = newValue.latitude
    manualCoordinates.longitude = newValue.longitude
  }
}, { immediate: true })
</script>
