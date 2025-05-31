<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <div class="space-y-4">
        <router-link to="/chargers" class="btn btn-primary btn-lg">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          Go to Dashboard
        </router-link>
        
        <div class="text-sm text-gray-500 dark:text-gray-400">
          or
          <button @click="$router.go(-1)" class="text-primary-600 dark:text-primary-400 hover:underline ml-1">
            go back to previous page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
