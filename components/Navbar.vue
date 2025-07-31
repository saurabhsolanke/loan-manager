<script setup>
const mobileMenuOpen = ref(false)
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <!-- <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            
            </div>
            <span class="text-xl font-bold text-gray-900">लोकनेते सुंदररावजी सोळंके नागरी सहकारी पतसंस्था मर्यादीत.माजलगाव</span>
          </NuxtLink> -->

        </div>
        
        <!-- Navigation Links -->
        <!-- <div class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            to="/dashboard" 
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-gray-700 bg-gray-50"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/supaloan" 
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-gray-700 bg-gray-50"
          >
            Loans
          </NuxtLink>
          <NuxtLink 
            to="/login" 
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-gray-700 bg-gray-50"
          >
            Login
          </NuxtLink>
        </div> -->

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <img class="img-fluid" src="../assets/logooo.jpeg" alt="Logo" />

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <NuxtLink 
            to="/" 
            class="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            active-class="text-gray-700 bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/supaloan" 
            class="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            active-class="text-gray-700 bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Loans
          </NuxtLink>
          <NuxtLink 
            to="/login" 
            class="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            active-class="text-gray-700 bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>