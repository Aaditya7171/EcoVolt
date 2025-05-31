<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ⚡ Charging Stations
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage your electric vehicle charging stations network
        </p>
      </div>
      <div v-if="!authStore.isGuest" class="flex-shrink-0">
        <router-link
          to="/chargers/new"
          class="btn btn-primary btn-lg inline-flex items-center group"
        >
          <svg class="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add New Station
          <div class="ml-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </router-link>
      </div>
      <!-- Guest mode indicator -->
      <div v-else class="flex-shrink-0">
        <div class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            👁️ Viewing as Guest (Read-only)
          </span>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-800 dark:via-gray-850 dark:to-primary-900/20 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-700 hover:animate-breathing animate-on-load">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-light-text-secondary dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">Total Stations</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ chargersStore.totalChargers }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-800 dark:via-gray-850 dark:to-primary-900/20 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-700 hover:animate-breathing animate-on-load-delayed">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-light-text-secondary dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">Active</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ chargersStore.activeChargers.length }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-800 dark:via-gray-850 dark:to-orange-900/20 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-700 hover:animate-breathing animate-on-load-delayed-2">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-light-text-secondary dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Inactive</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ chargersStore.inactiveChargers.length }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-accent-50 via-white to-primary-50 dark:from-gray-800 dark:via-gray-850 dark:to-accent-900/20 border-2 border-transparent hover:border-accent-200 dark:hover:border-accent-700 hover:animate-breathing animate-on-load-delayed-3">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-accent-500/10 via-primary-500/10 to-accent-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-accent-500 to-primary-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-light-text-secondary dark:text-gray-400 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors duration-300">Avg Power</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ averagePower }}kW</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">Status</label>
          <select v-model="filters.status" class="input">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label class="label">Min Power Output (kW)</label>
          <input
            v-model="filters.power_output"
            type="number"
            placeholder="e.g. 50"
            class="input"
          />
        </div>

        <div>
          <label class="label">Connector Type</label>
          <select v-model="filters.connector_type" class="input">
            <option value="">All Types</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="Type 3">Type 3</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>
        </div>

        <div class="flex items-end space-x-2">
          <button @click="applyFilters" class="btn btn-primary">
            Apply Filters
          </button>
          <button @click="clearFilters" class="btn btn-secondary">
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="chargersStore.loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="chargersStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <p class="ml-3 text-sm text-red-800 dark:text-red-200">
          {{ chargersStore.error }}
        </p>
      </div>
    </div>

    <!-- Chargers Grid -->
    <div v-else-if="chargersStore.filteredChargers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChargerCard
        v-for="(charger, index) in chargersStore.filteredChargers"
        :key="charger.id"
        :charger="charger"
        :class="`animate-on-load-delayed-${Math.min(index % 4 + 1, 4)}`"
        @edit="editCharger"
        @delete="deleteCharger"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No charging stations found</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ authStore.isGuest ? 'No charging stations available to view.' : (hasFilters ? 'Try adjusting your filters or' : 'Get started by') + ' creating a new charging station.' }}
      </p>
      <div v-if="!authStore.isGuest" class="mt-6">
        <router-link to="/chargers/new" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add New Station
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useChargersStore } from '@/stores/chargers'
import { useAuthStore } from '@/stores/counter'
import ChargerCard from '@/components/ChargerCard.vue'

const router = useRouter()
const chargersStore = useChargersStore()
const authStore = useAuthStore()

const filters = reactive({
  status: '',
  power_output: '',
  connector_type: ''
})

const hasFilters = computed(() => {
  return filters.status || filters.power_output || filters.connector_type
})

const averagePower = computed(() => {
  if (chargersStore.chargers.length === 0) return 0
  const total = chargersStore.chargers.reduce((sum, charger) => sum + charger.power_output, 0)
  return Math.round(total / chargersStore.chargers.length)
})

const applyFilters = () => {
  chargersStore.setFilters(filters)
}

const clearFilters = () => {
  filters.status = ''
  filters.power_output = ''
  filters.connector_type = ''
  chargersStore.clearFilters()
}

const editCharger = (charger) => {
  router.push(`/chargers/${charger.id}/edit`)
}

const deleteCharger = async (charger) => {
  const isAdmin = authStore.isAdmin

  let reason = ''
  if (!isAdmin) {
    reason = prompt(`Please provide a reason for deleting "${charger.name}":`)
    if (reason === null) return // User cancelled
  }

  const confirmMessage = isAdmin
    ? `Are you sure you want to delete "${charger.name}"? This action cannot be undone.`
    : `Are you sure you want to request deletion of "${charger.name}"? This will be sent to admin for approval.`

  if (confirm(confirmMessage)) {
    const result = await chargersStore.deleteCharger(charger.id, reason)
    if (result.success) {
      const message = isAdmin
        ? 'Charging station deleted successfully'
        : 'Deletion request submitted for admin approval'
      alert(message)
    } else {
      alert(result.message || 'Failed to process deletion request')
    }
  }
}

onMounted(() => {
  chargersStore.fetchChargers()
})
</script>
