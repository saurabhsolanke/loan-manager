<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-sm w-full space-y-6">
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <!-- Header -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg class="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p class="mt-2 text-sm text-gray-600">Sign in to your loan management account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-3 py-3 sm:px-4 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-3 sm:px-4 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your password"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                v-model="rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
          <p class="text-xs text-blue-700">Username: admin</p>
          <p class="text-xs text-blue-700">Password: admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simple validation for demo
  if (username.value === 'admin' && password.value === 'admin123') {
    // Store login state
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', username.value)
    
    // Navigate to dashboard
    await navigateTo('/dashboard')
  } else {
    alert('Invalid credentials. Please use admin/admin123')
  }
  
  isLoading.value = false
}

// Check if already logged in
onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (isLoggedIn === 'true') {
    navigateTo('/dashboard')
  }
})
</script> 