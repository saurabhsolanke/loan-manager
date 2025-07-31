// Get Supabase client from Nuxt plugin
export const getSupabaseClient = () => {
  const { $supabase } = useNuxtApp()
  return $supabase
}

// For backward compatibility, create a function that returns the client
export const createSupabaseClient = () => {
  return getSupabaseClient()
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    const client = getSupabaseClient()
    
    // Test basic connection
    const { data, error } = await client
      .from('loanable')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection test successful!')
    return true
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message)
    return false
  }
}