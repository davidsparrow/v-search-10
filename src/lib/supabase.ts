import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xbgwawselcaoqhczoyqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ3dhd3NlbGNhb3FoY3pveXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTI4MDQsImV4cCI6MjA2OTIyODgwNH0.udenphkpryNU4tmF2R28JHea-_PWQ5avuUs9cECZ89g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Participant management functions
export const participantService = {
  // Check if participant already exists
  checkExistingParticipant: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('id')
        .eq('eventria_user_id', userId)
        .single()
      
      return { exists: !!data, error }
    } catch (err) {
      return { exists: false, error: err }
    }
  },

  // Create participant record
  createParticipant: async (userData: any, nickname?: string, phoneNumber?: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{
          eventria_user_id: userData.id,
          email: userData.email,
          nickname: nickname || userData.user_metadata?.full_name || userData.email?.split('@')[0],
          phone_number: phoneNumber || 'placeholder',
          real_score: 0,
          display_score: 0,
          joined_at: new Date().toISOString()
        }])
        .select()
      
      if (error) {
        console.error('Error creating participant:', error)
        return { success: false, error }
      }
      
      console.log('Participant created successfully:', data)
      return { success: true, data }
    } catch (err) {
      console.error('Error creating participant:', err)
      return { success: false, error: err }
    }
  },

  // Handle participant creation after auth
  handleParticipantCreation: async (user: any) => {
    if (!user) return { success: false, error: 'No user data' }
    
    const { exists } = await participantService.checkExistingParticipant(user.id)
    
    if (!exists) {
      // Create participant with basic info from auth
      const result = await participantService.createParticipant(user)
      return result
    }
    
    return { success: true, exists: true }
  }
}

// Auth helper functions
export const auth = {
  // Sign up with email/password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // If signup successful, create participant
    if (data.user && !error) {
      await participantService.handleParticipantCreation(data.user)
    }
    
    return { data, error }
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // If signin successful, ensure participant exists
    if (data.user && !error) {
      await participantService.handleParticipantCreation(data.user)
    }
    
    return { data, error }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/start-search`
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password for email
  resetPasswordForEmail: async (email: string) => {
    const redirectTo = window.location.origin + '/reset-password'
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  },
} 