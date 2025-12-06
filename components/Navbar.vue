<script setup>
const mobileMenuOpen = ref(false)
const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()

// Initialize dark mode on component mount
onMounted(() => {
  initDarkMode()
})
</script>

<template>
  <nav
    class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <img class="img-fluid" src="../assets/logooo.jpeg" alt="Logo" />

      <div class="flex justify-between items-center">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <!-- <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">लोकनेते सुंदररावजी सोळंके नागरी सहकारी पतसंस्था मर्यादीत.माजलगाव</span>
          </NuxtLink> -->

        </div>

        <!-- Navigation Links -->
        <!-- <div class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            to="/dashboard" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/supaloan" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800"
          >
            Loans
          </NuxtLink>
          <NuxtLink 
            to="/login" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800"
          >
            Login
          </NuxtLink>
        </div> -->

        <!-- Dark Mode Toggle & Mobile menu button -->
        <div class="flex items-center space-x-4">
          <!-- Dark Mode Toggle Button -->
          <button @click="toggleDarkMode"
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all duration-200"
            aria-label="Toggle dark mode">
            <!-- Sun icon (shown in dark mode) -->
            <svg v-if="isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen"
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:text-gray-900 dark:focus:text-white">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <!-- <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
          <NuxtLink to="/"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            active-class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800" @click="mobileMenuOpen = false">
            Dashboard
          </NuxtLink>
          <NuxtLink to="/supaloan"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            active-class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800" @click="mobileMenuOpen = false">
            Loans
          </NuxtLink>
          <NuxtLink to="/login"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            active-class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800" @click="mobileMenuOpen = false">
            Login
          </NuxtLink>
        </div>
      </div> -->
    </div>
  </nav>
</template>