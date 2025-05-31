<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/counter'
import { useThemeStore } from '@/stores/theme'
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  // Initialize authentication state
  authStore.initializeAuth()

  // Initialize theme
  themeStore.initializeTheme()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-light-bg dark:bg-gray-900 transition-all duration-300 flex flex-col animate-on-load">
    <Navigation class="animate-on-load-delayed" />

    <main class="container mx-auto px-4 py-8 flex-1 animate-on-load-delayed-2">
      <RouterView />
    </main>

    <Footer class="animate-on-load-delayed-3" />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
