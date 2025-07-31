<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>
</template>

<script setup>
// Redirect to appropriate page based on authentication
onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (isLoggedIn === 'true') {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>
