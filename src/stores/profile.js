import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, hasValidConfig } from '../config/supabase.js'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchProfile = async () => {
    if (!hasValidConfig) {
      error.value = 'Supabase not configured'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        // If profile doesn't exist, create it
        if (fetchError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([
              { 
                id: user.id, 
                email: user.email 
              }
            ])
            .select()
            .single()

          if (createError) throw createError
          profile.value = newProfile
          return newProfile
        }
        throw fetchError
      }

      profile.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching profile:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createPin = async (pinCode) => {
    if (!hasValidConfig) {
      error.value = 'Supabase not configured'
      return { success: false, error: 'Supabase not configured' }
    }

    // Validate PIN format
    if (!/^\d{6}$/.test(pinCode)) {
      error.value = 'PIN must be exactly 6 digits'
      return { success: false, error: 'PIN must be exactly 6 digits' }
    }

    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          pin_code: pinCode,
          pin_created_at: profile.value?.pin_code ? undefined : new Date().toISOString(),
          pin_updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      console.error('Error creating PIN:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updatePin = async (currentPin, newPin) => {
    if (!hasValidConfig) {
      error.value = 'Supabase not configured'
      return { success: false, error: 'Supabase not configured' }
    }

    // Validate current PIN
    if (profile.value?.pin_code !== currentPin) {
      error.value = 'Current PIN is incorrect'
      return { success: false, error: 'Current PIN is incorrect' }
    }

    // Validate new PIN format
    if (!/^\d{6}$/.test(newPin)) {
      error.value = 'New PIN must be exactly 6 digits'
      return { success: false, error: 'New PIN must be exactly 6 digits' }
    }

    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          pin_code: newPin,
          pin_updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      console.error('Error updating PIN:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const deletePin = async () => {
    loading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (profile.value) {
        profile.value.pin_code = null
        profile.value.pin_updated_at = new Date().toISOString()
      }

      return { success: true, data: profile.value }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting PIN:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const verifyPin = async (pinCode) => {
    if (!hasValidConfig) {
      error.value = 'Supabase not configured'
      return { success: false, error: 'Supabase not configured' }
    }

    // Validate PIN format
    if (!/^\d{6}$/.test(pinCode)) {
      error.value = 'PIN must be exactly 6 digits'
      return { success: false, error: 'PIN must be exactly 6 digits' }
    }

    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('pin_code')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      const isValid = data?.pin_code === pinCode
      
      if (!isValid) {
        error.value = 'Invalid PIN'
        return { success: false, error: 'Invalid PIN' }
      }

      return { success: true, data: { verified: true } }
    } catch (err) {
      error.value = err.message
      console.error('Error verifying PIN:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createPin,
    updatePin,
    deletePin,
    verifyPin
  }
})