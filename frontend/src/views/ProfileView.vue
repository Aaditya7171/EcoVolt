<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ authStore.isGuest ? 'Guest Profile' : 'Profile Settings' }}
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ authStore.isGuest ? 'You are viewing the site as a guest with read-only access' : 'Manage your account settings and preferences' }}
      </p>
    </div>

    <!-- Profile Information -->
    <div class="card p-6">
      <div class="flex items-center space-x-6 mb-6">
        <div class="w-20 h-20 rounded-full flex items-center justify-center"
             :class="authStore.isGuest ? 'bg-gray-500' : 'bg-primary-600'">
          <span class="text-2xl font-bold text-white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ authStore.user?.name }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ authStore.user?.email }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            {{ authStore.isGuest ? 'Guest User (Read-only Access)' : 'Member since ' + formatDate(authStore.user?.created_at) }}
          </p>
          <div v-if="authStore.isGuest" class="mt-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              👁️ Guest Mode
            </span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="label">Full Name</label>
            <input
              type="text"
              :value="authStore.user?.name"
              readonly
              class="input bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label class="label">Email Address</label>
            <input
              type="email"
              :value="authStore.user?.email"
              readonly
              class="input bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ authStore.isGuest ? 'Guest users have read-only access. Sign in for full functionality.' : 'To update your profile information, please contact support.' }}
          </p>
        </div>
      </div>

      <!-- Change Password Section -->
      <div v-if="!authStore.isGuest" class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="label">Current Password</label>
            <input
              type="password"
              v-model="passwordForm.currentPassword"
              class="input"
              :class="{ 'border-red-500': passwordErrors.currentPassword }"
              placeholder="Enter your current password"
              required
            />
            <p v-if="passwordErrors.currentPassword" class="text-red-500 text-sm mt-1">
              {{ passwordErrors.currentPassword }}
            </p>
          </div>
          <div>
            <label class="label">New Password</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              class="input"
              :class="{ 'border-red-500': passwordErrors.newPassword }"
              placeholder="Enter your new password"
              required
            />
            <p v-if="passwordErrors.newPassword" class="text-red-500 text-sm mt-1">
              {{ passwordErrors.newPassword }}
            </p>
          </div>
          <div>
            <label class="label">Confirm New Password</label>
            <input
              type="password"
              v-model="passwordForm.confirmPassword"
              class="input"
              :class="{ 'border-red-500': passwordErrors.confirmPassword }"
              placeholder="Confirm your new password"
              required
            />
            <p v-if="passwordErrors.confirmPassword" class="text-red-500 text-sm mt-1">
              {{ passwordErrors.confirmPassword }}
            </p>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Password must be at least 6 characters long
            </div>
            <button
              type="submit"
              :disabled="passwordLoading"
              class="btn btn-primary"
            >
              <span v-if="passwordLoading" class="spinner w-4 h-4 mr-2"></span>
              {{ passwordLoading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>

        <!-- Success/Error Messages -->
        <div v-if="passwordMessage" class="mt-4 p-3 rounded-lg" :class="passwordMessageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'">
          {{ passwordMessage }}
        </div>
      </div>
    </div>

    <!-- Guest Upgrade Section -->
    <div v-if="authStore.isGuest" class="card p-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-green-900 dark:text-green-400 mb-2">Upgrade Your Experience</h3>
          <p class="text-sm text-green-700 dark:text-green-300 mb-4">
            Sign in or create an account to add, edit, and manage charging stations.
          </p>
          <ul class="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>✅ Add new charging stations</li>
            <li>✅ Edit existing stations</li>
            <li>✅ Delete stations you own</li>
            <li>✅ Full access to all features</li>
          </ul>
        </div>
        <div class="flex flex-col space-y-2">
          <router-link to="/login" @click="authStore.logout" class="btn btn-primary">
            Sign In
          </router-link>
          <router-link to="/register" @click="authStore.logout" class="btn btn-secondary">
            Create Account
          </router-link>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-850 dark:to-blue-900/20 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 hover:animate-breathing">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Total Stations</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ userStats.totalStations }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-850 dark:to-green-900/20 border-2 border-transparent hover:border-green-200 dark:hover:border-green-700 hover:animate-breathing">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Active Stations</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ userStats.activeStations }}</p>
          </div>
        </div>
      </div>

      <div class="card p-6 hover:scale-105 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-purple-900/20 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-700 hover:animate-breathing">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center">
          <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 text-white group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Total Power</p>
            <p class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{{ userStats.totalPower }}kW</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Settings -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900 dark:text-white">Dark Mode</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Toggle between light and dark themes
          </p>
        </div>
        <button
          @click="themeStore.toggleTheme"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="themeStore.isDark ? 'bg-primary-600' : 'bg-gray-200'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="themeStore.isDark ? 'translate-x-6' : 'translate-x-1'"
          ></span>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div v-if="recentChargers.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="charger in recentChargers"
          :key="charger.id"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-900 dark:text-white">{{ charger.name }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Created {{ formatDate(charger.created_at) }}
            </p>
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="charger.status === 'Active'
              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
              : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'"
          >
            {{ charger.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card p-6 border-red-200 dark:border-red-800">
      <h3 class="text-lg font-medium text-red-900 dark:text-red-400 mb-4">
        {{ authStore.isGuest ? 'Guest Session' : 'Danger Zone' }}
      </h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-red-900 dark:text-red-400">
            {{ authStore.isGuest ? 'Exit Guest Mode' : 'Sign Out' }}
          </p>
          <p class="text-sm text-red-700 dark:text-red-300">
            {{ authStore.isGuest ? 'Exit guest mode and return to login page' : 'Sign out of your account on this device' }}
          </p>
        </div>
        <button
          @click="handleSignOut"
          class="btn btn-danger"
        >
          {{ authStore.isGuest ? 'Exit Guest Mode' : 'Sign Out' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'
import { useThemeStore } from '@/stores/theme'
import { useChargersStore } from '@/stores/chargers'
import { authAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const chargersStore = useChargersStore()

// Password change form state
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordLoading = ref(false)
const passwordMessage = ref('')
const passwordMessageType = ref('success')

const userStats = computed(() => {
  if (authStore.isGuest) {
    return {
      totalStations: 0,
      activeStations: 0,
      totalPower: 0
    }
  }

  const userChargers = chargersStore.chargers.filter(
    charger => charger.user_id === authStore.user?.id
  )

  return {
    totalStations: userChargers.length,
    activeStations: userChargers.filter(c => c.status === 'Active').length,
    totalPower: userChargers.reduce((sum, c) => sum + c.power_output, 0)
  }
})

const recentChargers = computed(() => {
  if (authStore.isGuest) {
    return []
  }

  return chargersStore.chargers
    .filter(charger => charger.user_id === authStore.user?.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const validatePasswordForm = () => {
  // Clear previous errors
  Object.keys(passwordErrors).forEach(key => {
    passwordErrors[key] = ''
  })

  let isValid = true

  // Validate current password
  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Current password is required'
    isValid = false
  }

  // Validate new password
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'New password is required'
    isValid = false
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = 'New password must be at least 6 characters long'
    isValid = false
  }

  // Validate confirm password
  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  // Check if new password is different from current
  if (passwordForm.currentPassword === passwordForm.newPassword) {
    passwordErrors.newPassword = 'New password must be different from current password'
    isValid = false
  }

  return isValid
}

const handleChangePassword = async () => {
  if (!validatePasswordForm()) {
    return
  }

  try {
    passwordLoading.value = true
    passwordMessage.value = ''

    const response = await authAPI.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.success) {
      passwordMessage.value = 'Password updated successfully!'
      passwordMessageType.value = 'success'

      // Clear form
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''

      // Clear message after 5 seconds
      setTimeout(() => {
        passwordMessage.value = ''
      }, 5000)
    }
  } catch (error) {
    passwordMessage.value = error.message || 'Failed to update password'
    passwordMessageType.value = 'error'

    // Clear message after 5 seconds
    setTimeout(() => {
      passwordMessage.value = ''
    }, 5000)
  } finally {
    passwordLoading.value = false
  }
}

const handleSignOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  chargersStore.fetchChargers()
})
</script>
