<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage pending station approvals and deletion requests
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'stations'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'stations'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Station Approvals
            <span v-if="pendingStations.length > 0" class="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              {{ pendingStations.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'deletions'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'deletions'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Deletion Requests
            <span v-if="pendingDeletions.length > 0" class="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
              {{ pendingDeletions.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Station Approvals Tab -->
    <div v-if="activeTab === 'stations'">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="spinner w-8 h-8"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Loading pending stations...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!pendingStations.length" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Station Approvals</h3>
        <p class="text-gray-600 dark:text-gray-400">All charging stations have been reviewed.</p>
      </div>

      <!-- Pending Stations List -->
      <div v-else class="space-y-6">
      <div
        v-for="station in pendingStations"
        :key="station.id"
        class="card p-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <!-- Station Info -->
          <div class="flex-1 mb-4 lg:mb-0">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ station.name }}
              </h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Pending
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span class="font-medium">Submitted by:</span> {{ station.owner_name }} ({{ station.owner_email }})
              </div>
              <div>
                <span class="font-medium">Power Output:</span> {{ station.power_output }}kW
              </div>
              <div>
                <span class="font-medium">Connector Type:</span> {{ station.connector_type }}
              </div>
              <div>
                <span class="font-medium">Status:</span> {{ station.status }}
              </div>
              <div>
                <span class="font-medium">Location:</span> {{ station.latitude }}, {{ station.longitude }}
              </div>
              <div>
                <span class="font-medium">Submitted:</span> {{ formatDate(station.created_at) }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3">
            <button
              @click="viewOnMap(station)"
              class="btn btn-secondary btn-sm"
              title="View on Map"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              Map
            </button>
            <button
              @click="approveStation(station.id)"
              :disabled="actionLoading[station.id]"
              class="btn bg-green-600 hover:bg-green-700 text-white btn-sm"
            >
              <svg v-if="actionLoading[station.id]" class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Approve
            </button>
            <button
              @click="rejectStation(station.id)"
              :disabled="actionLoading[station.id]"
              class="btn bg-red-600 hover:bg-red-700 text-white btn-sm"
            >
              <svg v-if="actionLoading[station.id]" class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              Reject
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Deletion Requests Tab -->
    <div v-if="activeTab === 'deletions'">
      <!-- Loading State -->
      <div v-if="deletionLoading" class="flex justify-center items-center py-12">
        <div class="spinner w-8 h-8"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Loading deletion requests...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!pendingDeletions.length" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Deletion Requests</h3>
        <p class="text-gray-600 dark:text-gray-400">No stations are pending deletion approval.</p>
      </div>

      <!-- Pending Deletion Requests List -->
      <div v-else class="space-y-6">
        <div
          v-for="request in pendingDeletions"
          :key="request.id"
          class="card p-6"
        >
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <!-- Request Info -->
            <div class="flex-1 mb-4 lg:mb-0">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ request.station_name }}
                </h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Deletion Request
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span class="font-medium">Requested by:</span> {{ request.requester_name }} ({{ request.requester_email }})
                </div>
                <div>
                  <span class="font-medium">Requested:</span> {{ formatDate(request.created_at) }}
                </div>
                <div v-if="request.reason" class="md:col-span-2">
                  <span class="font-medium">Reason:</span> {{ request.reason }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3">
              <button
                @click="approveDeletion(request.id)"
                :disabled="deletionActionLoading[request.id]"
                class="btn bg-red-600 hover:bg-red-700 text-white btn-sm"
              >
                <svg v-if="deletionActionLoading[request.id]" class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Approve Deletion
              </button>
              <button
                @click="rejectDeletion(request.id)"
                :disabled="deletionActionLoading[request.id]"
                class="btn btn-secondary btn-sm"
              >
                <svg v-if="deletionActionLoading[request.id]" class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI } from '@/services/api'

const router = useRouter()
const activeTab = ref('stations')
const pendingStations = ref([])
const pendingDeletions = ref([])
const loading = ref(false)
const deletionLoading = ref(false)
const actionLoading = reactive({})
const deletionActionLoading = reactive({})

const fetchPendingStations = async () => {
  try {
    loading.value = true
    const response = await adminAPI.getPendingStations()
    if (response.success) {
      pendingStations.value = response.data.stations
    }
  } catch (error) {
    console.error('Failed to fetch pending stations:', error)
  } finally {
    loading.value = false
  }
}

const approveStation = async (stationId) => {
  try {
    actionLoading[stationId] = true
    const response = await adminAPI.approveStation(stationId)
    if (response.success) {
      // Remove from pending list
      pendingStations.value = pendingStations.value.filter(s => s.id !== stationId)
    }
  } catch (error) {
    console.error('Failed to approve station:', error)
  } finally {
    actionLoading[stationId] = false
  }
}

const rejectStation = async (stationId) => {
  try {
    actionLoading[stationId] = true
    const response = await adminAPI.rejectStation(stationId)
    if (response.success) {
      // Remove from pending list
      pendingStations.value = pendingStations.value.filter(s => s.id !== stationId)
    }
  } catch (error) {
    console.error('Failed to reject station:', error)
  } finally {
    actionLoading[stationId] = false
  }
}

const fetchPendingDeletions = async () => {
  try {
    deletionLoading.value = true
    const response = await adminAPI.getPendingDeletions()
    if (response.success) {
      pendingDeletions.value = response.data.requests
    }
  } catch (error) {
    console.error('Failed to fetch pending deletions:', error)
  } finally {
    deletionLoading.value = false
  }
}

const approveDeletion = async (requestId) => {
  try {
    deletionActionLoading[requestId] = true
    const response = await adminAPI.approveDeletion(requestId)
    if (response.success) {
      // Remove from pending list
      pendingDeletions.value = pendingDeletions.value.filter(r => r.id !== requestId)
    }
  } catch (error) {
    console.error('Failed to approve deletion:', error)
  } finally {
    deletionActionLoading[requestId] = false
  }
}

const rejectDeletion = async (requestId) => {
  try {
    deletionActionLoading[requestId] = true
    const response = await adminAPI.rejectDeletion(requestId)
    if (response.success) {
      // Remove from pending list
      pendingDeletions.value = pendingDeletions.value.filter(r => r.id !== requestId)
    }
  } catch (error) {
    console.error('Failed to reject deletion:', error)
  } finally {
    deletionActionLoading[requestId] = false
  }
}

const viewOnMap = (station) => {
  router.push(`/map?lat=${station.latitude}&lng=${station.longitude}`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchPendingStations()
  fetchPendingDeletions()
})
</script>
