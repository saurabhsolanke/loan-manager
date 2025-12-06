export default defineNuxtPlugin(() => {
    // Initialize dark mode on app startup
    if (process.client) {
        // Check localStorage for saved preference
        const stored = localStorage.getItem('darkMode')
        let isDark = false

        if (stored !== null) {
            isDark = stored === 'true'
        } else {
            // Check system preference if no saved preference
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        }

        // Apply dark class to HTML element immediately
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }
})
