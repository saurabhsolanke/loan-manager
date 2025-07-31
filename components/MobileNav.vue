<template>
  <div class="sm:hidden">
    <!-- Mobile menu button -->
    <button
      @click="isOpen = !isOpen"
      class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
    >
      <span class="sr-only">Open main menu</span>
      <svg
        :class="isOpen ? 'hidden' : 'block'"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg
        :class="isOpen ? 'block' : 'hidden'"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Mobile menu -->
    <div
      v-show="isOpen"
      class="absolute top-full left-0 w-full bg-white shadow-lg border-b border-gray-200 z-50"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <a
          href="/dashboard"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          Dashboard
        </a>
        <div class="border-t border-gray-200 pt-4 pb-3">
          <div class="flex items-center px-3">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-sm font-medium text-blue-800">{{ username.charAt(0) }}</span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ username }}</div>
              <div class="text-sm font-medium text-gray-500">User</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <button
              @click="handleLogout"
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isOpen = ref(false)
const username = ref('')

onMounted(() => {
  username.value = localStorage.getItem('username') || 'User'
})

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  navigateTo('/login')
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-nav')) {
      isOpen.value = false
    }
  })
})
</script> 