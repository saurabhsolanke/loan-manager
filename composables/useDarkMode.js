export const useDarkMode = () => {
    const isDark = useState('darkMode', () => {
        // Check localStorage or system preference on initial load
        if (process.client) {
            const stored = localStorage.getItem('darkMode')
            if (stored !== null) {
                return stored === 'true'
            }
            // Check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return false
    })

    const toggleDarkMode = () => {
        isDark.value = !isDark.value
        if (process.client) {
            localStorage.setItem('darkMode', isDark.value.toString())
            // Update document class
            if (isDark.value) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }

    // Initialize dark mode on mount
    const initDarkMode = () => {
        if (process.client) {
            if (isDark.value) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }

    return {
        isDark,
        toggleDarkMode,
        initDarkMode
    }
}
