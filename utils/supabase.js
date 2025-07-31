import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crgpcbsfhfqxvqlglblh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZ3BjYnNmaGZxeHZxbGdsYmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTg0NDksImV4cCI6MjA2OTQ3NDQ0OX0._oIF0Pvp9T066b1ohBklrodwIHVWIPmteukt7bIDhRI'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  }
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
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