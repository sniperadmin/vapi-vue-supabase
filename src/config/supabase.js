import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase configuration is valid
export const hasValidConfig = () => {
  const isValid = supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_url_here' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here'
  
  if (!isValid) {
    console.warn('Supabase configuration invalid:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlValid: supabaseUrl !== 'your_supabase_url_here',
      keyValid: supabaseAnonKey !== 'your_supabase_anon_key_here'
    })
  } else {
    console.log('Supabase configuration valid')
  }
  
  return isValid
}

// Create Supabase client
export const supabase = hasValidConfig() 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// Export configuration status for components
export { supabaseUrl, supabaseAnonKey }