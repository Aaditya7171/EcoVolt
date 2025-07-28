<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🗺️ Charging Stations Map
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Interactive map showing all charging stations with real-time status
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Total Stations:</span>
          <span class="font-semibold text-primary-600 dark:text-primary-400">{{ chargersStore.chargers.length }}</span>
        </div>
        <router-link to="/chargers/new" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add Station
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
        </div>

        <select v-model="filters.status" @change="applyFilters" class="input-sm">
          <option value="">All Status</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>

        <select v-model="filters.connector_type" @change="applyFilters" class="input-sm">
          <option value="">All Connectors</option>
          <option value="Type 1">Type 1</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
        </select>

        <input
          v-model="filters.power_output"
          @input="applyFilters"
          type="number"
          placeholder="Min Power (kW)"
          class="input-sm w-32"
        />

        <button @click="clearFilters" class="btn btn-secondary btn-sm">
          Clear Filters
        </button>

        <button @click="centerMap" class="btn btn-secondary btn-sm">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          Center Map
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="card overflow-hidden">
      <div class="relative">
        <div
          ref="mapContainer"
          class="w-full h-96 lg:h-[500px]"
          :class="{ 'opacity-50': chargersStore.loading }"
        ></div>

        <!-- Loading Overlay -->
        <div v-if="chargersStore.loading || mapLoading" class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div class="text-center">
            <div class="spinner w-8 h-8 mx-auto mb-2"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Loading map and stations...</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">This may take a moment if the server is experiencing high load.</p>
          </div>
        </div>

        <!-- Map Controls -->
        <div class="absolute top-4 right-4 space-y-2">
          <button
            @click="toggleMapType"
            class="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            title="Toggle Map Type"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Station Info Panel -->
    <div v-if="selectedStation" class="card p-6 border-l-4 border-primary-500 station-info-panel">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ selectedStation.name }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Status:</span>
              <span
                class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="selectedStation.status === 'Active'
                  ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                  : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'"
              >
                {{ selectedStation.status }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Power:</span>
              <span class="ml-2 font-medium">{{ selectedStation.power_output }}kW</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Connector:</span>
              <span class="ml-2 font-medium">{{ selectedStation.connector_type }}</span>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            📍 {{ selectedStation.latitude }}, {{ selectedStation.longitude }}
          </div>
        </div>
        <div class="flex space-x-2">
          <router-link
            :to="`/chargers/${selectedStation.id}/edit`"
            class="btn btn-secondary btn-sm"
          >
            Edit
          </router-link>
          <button @click="selectedStation = null" class="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4 text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-850 dark:to-green-900/20 border-2 border-transparent hover:border-green-200 dark:hover:border-green-700 hover:animate-floating">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ activeStations }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Active Stations</div>
        </div>
      </div>
      <div class="card p-4 text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-800 dark:via-gray-850 dark:to-orange-900/20 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-700 hover:animate-floating">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ inactiveStations }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Inactive Stations</div>
        </div>
      </div>
      <div class="card p-4 text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-purple-900/20 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-700 hover:animate-floating">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ averagePower }}kW</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Avg Power</div>
        </div>
      </div>
      <div class="card p-4 text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-850 dark:to-blue-900/20 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 hover:animate-floating">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ filteredStations.length }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Visible on Map</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChargersStore } from '@/stores/chargers'
import L from 'leaflet'

const route = useRoute()
const chargersStore = useChargersStore()

// Reactive data
const mapContainer = ref(null)
const map = ref(null)
const markers = ref([])
const selectedStation = ref(null)
const mapLoading = ref(true)
const currentMapType = ref('streets')

// Filters
const filters = ref({
  status: '',
  connector_type: '',
  power_output: ''
})

// Map tile layers
const tileLayers = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors'
  }
}

// Computed properties
const filteredStations = computed(() => {
  let stations = chargersStore.chargers

  if (filters.value.status) {
    stations = stations.filter(s => s.status === filters.value.status)
  }

  if (filters.value.connector_type) {
    stations = stations.filter(s => s.connector_type === filters.value.connector_type)
  }

  if (filters.value.power_output) {
    stations = stations.filter(s => s.power_output >= parseInt(filters.value.power_output))
  }

  return stations
})

const activeStations = computed(() =>
  chargersStore.chargers.filter(s => s.status === 'Active').length
)

const inactiveStations = computed(() =>
  chargersStore.chargers.filter(s => s.status === 'Inactive').length
)

const averagePower = computed(() => {
  if (chargersStore.chargers.length === 0) return 0
  const total = chargersStore.chargers.reduce((sum, s) => sum + s.power_output, 0)
  return Math.round(total / chargersStore.chargers.length)
})

// Leaflet Map functions
const initializeMap = async () => {
  try {
    // Default center (you can change this to your preferred location)
    const defaultCenter = [40.7128, -74.0060] // New York City

    // Check if there's a specific station to focus on from route query
    let center = defaultCenter
    let zoom = 10

    if (route.query.lat && route.query.lng) {
      center = [parseFloat(route.query.lat), parseFloat(route.query.lng)]
      zoom = 15
    } else if (chargersStore.chargers.length > 0) {
      // Center on first station if available
      const firstStation = chargersStore.chargers[0]
      center = [parseFloat(firstStation.latitude), parseFloat(firstStation.longitude)]
    }

    // Initialize the map
    map.value = L.map(mapContainer.value).setView(center, zoom)

    // Add the default tile layer
    L.tileLayer(tileLayers[currentMapType.value].url, {
      attribution: tileLayers[currentMapType.value].attribution,
      maxZoom: 19
    }).addTo(map.value)

    // Add markers for all stations
    addMarkersToMap()

    mapLoading.value = false
  } catch (error) {
    console.error('Error initializing map:', error)
    mapLoading.value = false
  }
}

const addMarkersToMap = () => {
  if (!map.value) return

  // Clear existing markers
  clearMarkers()

  // Add markers for filtered stations
  filteredStations.value.forEach(station => {
    // Create custom icon
    const icon = createCustomIcon(station.status)

    const marker = L.marker([parseFloat(station.latitude), parseFloat(station.longitude)], {
      icon: icon
    }).addTo(map.value)

    // Create popup content
    const popupContent = `
      <div class="p-4 max-w-sm">
        <div class="flex items-center space-x-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span class="text-white text-lg">⚡</span>
          </div>
          <h3 class="font-bold text-lg text-gray-800">${station.name}</h3>
        </div>

        <div class="space-y-2 text-sm mb-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Status:</span>
            <span class="font-medium px-2 py-1 rounded-full text-xs ${station.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
              ${station.status === 'Active' ? '🟢 Active' : '🟡 Inactive'}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Power Output:</span>
            <span class="font-medium text-blue-600">${station.power_output}kW</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Connector:</span>
            <span class="font-medium">${station.connector_type}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Location:</span>
            <span class="font-medium text-xs text-gray-500">${parseFloat(station.latitude).toFixed(4)}, ${parseFloat(station.longitude).toFixed(4)}</span>
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            onclick="window.selectStation(${station.id})"
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            📍 View Details
          </button>
          <button
            onclick="window.editStation(${station.id})"
            class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            ✏️
          </button>
        </div>
      </div>
    `

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    })

    // Store marker reference
    markers.value.push({
      marker,
      station
    })
  })

  // Focus on specific station if provided in route
  if (route.query.id) {
    const stationId = parseInt(route.query.id)
    const markerData = markers.value.find(m => m.station.id === stationId)
    if (markerData) {
      map.value.setView(markerData.marker.getLatLng(), 15)
      markerData.marker.openPopup()
    }
  }
}

const createCustomIcon = (status) => {
  const color = status === 'Active' ? '#22c55e' : '#f59e0b' // Green for active, yellow for inactive
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">⚡</div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })
}

const clearMarkers = () => {
  markers.value.forEach(markerData => {
    map.value.removeLayer(markerData.marker)
  })
  markers.value = []
}

// Filter functions
const applyFilters = () => {
  nextTick(() => {
    addMarkersToMap()
  })
}

const clearFilters = () => {
  filters.value = {
    status: '',
    connector_type: '',
    power_output: ''
  }
  applyFilters()
}

// Map control functions
const centerMap = () => {
  if (!map.value || filteredStations.value.length === 0) return

  if (filteredStations.value.length === 1) {
    const station = filteredStations.value[0]
    map.value.setView([parseFloat(station.latitude), parseFloat(station.longitude)], 15)
  } else {
    const group = new L.featureGroup(markers.value.map(m => m.marker))
    map.value.fitBounds(group.getBounds().pad(0.1))
  }
}

const toggleMapType = () => {
  if (!map.value) return

  const types = Object.keys(tileLayers)
  const currentIndex = types.indexOf(currentMapType.value)
  const nextIndex = (currentIndex + 1) % types.length
  currentMapType.value = types[nextIndex]

  // Remove all tile layers and add the new one
  map.value.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.value.removeLayer(layer)
    }
  })

  L.tileLayer(tileLayers[currentMapType.value].url, {
    attribution: tileLayers[currentMapType.value].attribution,
    maxZoom: 19
  }).addTo(map.value)
}

// Global functions for popup buttons
window.selectStation = (stationId) => {
  const station = chargersStore.chargers.find(s => s.id === stationId)
  if (station) {
    selectedStation.value = station
    // Scroll to the station info panel
    setTimeout(() => {
      const infoPanel = document.querySelector('.station-info-panel')
      if (infoPanel) {
        infoPanel.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}

window.editStation = (stationId) => {
  // Navigate to edit page
  window.location.href = `/chargers/${stationId}/edit`
}

// Watch for changes in chargers data
watch(() => chargersStore.chargers, () => {
  if (map.value) {
    addMarkersToMap()
  }
}, { deep: true })

// Lifecycle hooks
onMounted(async () => {
  await chargersStore.fetchChargers()

  // Initialize map after a short delay to ensure DOM is ready
  setTimeout(() => {
    initializeMap()
  }, 100)
})

onUnmounted(() => {
  // Clean up
  if (map.value) {
    map.value.remove()
  }
  if (window.selectStation) {
    delete window.selectStation
  }
  if (window.editStation) {
    delete window.editStation
  }
})
</script>
