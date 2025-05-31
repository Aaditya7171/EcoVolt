<template>
  <nav class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16 animate-on-load">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-4">
          <router-link to="/chargers" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 overflow-hidden bg-primary-600 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                EcoVolt
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Charging Network
              </span>
            </div>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-6" v-if="authStore.isAuthenticated">
          <router-link
            to="/chargers"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'chargers' }"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Chargers
          </router-link>

          <router-link
            to="/map"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'map' }"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            Map
          </router-link>

          <router-link
            to="/profile"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'profile' }"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            Profile
          </router-link>

          <!-- Admin Navigation -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin/pending"
            class="nav-link relative"
            :class="{ 'nav-link-active': $route.name === 'admin-pending' }"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            Pending Approvals
            <span
              v-if="pendingCounts.total > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ pendingCounts.total > 99 ? '99+' : pendingCounts.total }}
            </span>
          </router-link>
        </div>

        <!-- Right side controls -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-800 hover:scale-105 transition-all duration-300 group"
            title="Toggle theme"
          >
            <svg v-if="themeStore.isDark" class="w-5 h-5 text-yellow-500 group-hover:rotate-180 group-hover:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-5 h-5 text-primary-600 group-hover:rotate-180 group-hover:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary-600">
                <span class="text-white text-sm font-medium">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="hidden md:block text-gray-700 dark:text-gray-300">
                {{ authStore.user?.name }}
                <span v-if="authStore.isAdmin" class="text-xs text-green-500 dark:text-green-400 block">
                  (Admin)
                </span>
              </span>
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              @click="showUserMenu = false"
            >
              <div class="py-1">
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile Settings
                </router-link>
                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin/pending"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <div class="flex items-center justify-between">
                    <span>Pending Approvals</span>
                    <span
                      v-if="pendingCounts.total > 0"
                      class="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2"
                    >
                      {{ pendingCounts.total > 99 ? '99+' : pendingCounts.total }}
                    </span>
                  </div>
                </router-link>
                <hr class="border-gray-200 dark:border-gray-700">
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <!-- Login/Register buttons for guests -->
          <div v-else class="flex items-center space-x-2">
            <router-link to="/login" class="btn btn-secondary btn-sm">
              Sign In
            </router-link>
            <router-link to="/register" class="btn btn-primary btn-sm">
              Sign Up
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <button
            v-if="authStore.isAuthenticated"
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="showMobileMenu && authStore.isAuthenticated" class="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="space-y-2">
          <router-link
            to="/chargers"
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            Chargers
          </router-link>
          <router-link
            to="/map"
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            Map
          </router-link>
          <router-link
            to="/profile"
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            Profile
          </router-link>
          <router-link
            v-if="authStore.isAdmin"
            to="/admin/pending"
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            <div class="flex items-center justify-between">
              <span>Pending Approvals</span>
              <span
                v-if="pendingCounts.total > 0"
                class="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2"
              >
                {{ pendingCounts.total > 99 ? '99+' : pendingCounts.total }}
              </span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'
import { useThemeStore } from '@/stores/theme'
import { adminAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// Pending counts for admin
const pendingCounts = reactive({
  stations: 0,
  deletions: 0,
  total: 0
})

let pendingCountsInterval = null

const fetchPendingCounts = async () => {
  if (!authStore.isAdmin) {
    return
  }

  try {
    const response = await adminAPI.getPendingCounts()
    if (response.success) {
      pendingCounts.stations = response.data.stations
      pendingCounts.deletions = response.data.deletions
      pendingCounts.total = response.data.total
    }
  } catch (error) {
    console.error('Failed to fetch pending counts:', error)
  }
}

const startPendingCountsPolling = () => {
  if (authStore.isAdmin) {
    fetchPendingCounts()
    pendingCountsInterval = setInterval(fetchPendingCounts, 30000) // Poll every 30 seconds
  }
}

const stopPendingCountsPolling = () => {
  if (pendingCountsInterval) {
    clearInterval(pendingCountsInterval)
    pendingCountsInterval = null
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Close menus when clicking outside
const closeMenus = (event) => {
  // Close user menu if clicking outside the user menu area
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }

  // Close mobile menu if clicking outside the mobile menu button or mobile menu area
  if (!event.target.closest('.md\\:hidden') && !event.target.closest('[class*="mobile-nav"]')) {
    showMobileMenu.value = false
  }
}

// Watch for admin status changes
watch(() => authStore.isAdmin, (isAdmin) => {
  if (isAdmin) {
    startPendingCountsPolling()
  } else {
    stopPendingCountsPolling()
    // Reset counts
    pendingCounts.stations = 0
    pendingCounts.deletions = 0
    pendingCounts.total = 0
  }
})

onMounted(() => {
  document.addEventListener('click', closeMenus)

  // Start polling if user is already admin
  if (authStore.isAdmin) {
    startPendingCountsPolling()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
  stopPendingCountsPolling()
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
}

.nav-link-active {
  @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}

.mobile-nav-link {
  @apply block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
}
</style>
