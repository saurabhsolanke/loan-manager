export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on server-side
  if (process.server) return

  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && to.path !== '/login' && to.path !== '/') {
    return navigateTo('/login')
  }
  
  // If user is logged in and trying to access login page
  if (isLoggedIn && to.path === '/login') {
    return navigateTo('/dashboard')
  }
}) 