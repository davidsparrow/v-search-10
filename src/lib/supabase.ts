import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xbgwawselcaoqhczoyqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ3dhd3NlbGNhb3FoY3pveXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTI4MDQsImV4cCI6MjA2OTIyODgwNH0.udenphkpryNU4tmF2R28JHea-_PWQ5avuUs9cECZ89g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Participant management functions
export const participantService = {
  // Check if participant already exists by user ID, email, or phone number
  checkExistingParticipant: async (userId: string, email?: string, phoneNumber?: string) => {
    try {
      // First check by eventria_user_id
      const { data: userData, error: userError } = await supabase
        .from('participants')
        .select('id, email, eventria_user_id, phone_number')
        .eq('eventria_user_id', userId)
        .limit(1)
      
      if (userData && userData.length > 0) {
        console.log('Found existing participant by user ID:', userData[0])
        return { exists: true, data: userData[0], error: null }
      }
      
      // If no match by user ID and we have email, check by email
      if (email) {
        const { data: emailData, error: emailError } = await supabase
          .from('participants')
          .select('id, email, eventria_user_id, phone_number')
          .eq('email', email)
          .limit(1)
        
        if (emailData && emailData.length > 0) {
          console.log('Found existing participant by email:', emailData[0])
          // Update the existing participant with the new eventria_user_id
          const { data: updateData, error: updateError } = await supabase
            .from('participants')
            .update({ eventria_user_id: userId })
            .eq('id', emailData[0].id)
            .select()
          
          if (updateError) {
            console.error('Error updating participant with new user ID:', updateError)
          } else {
            console.log('Updated participant with new user ID:', updateData)
          }
          
          return { exists: true, data: emailData[0], error: null }
        }
      }
      
      // If no match by email and we have phone number, check by phone number
      if (phoneNumber && phoneNumber !== 'placeholder') {
        const { data: phoneData, error: phoneError } = await supabase
          .from('participants')
          .select('id, email, eventria_user_id, phone_number')
          .eq('phone_number', phoneNumber)
          .limit(1)
        
        if (phoneData && phoneData.length > 0) {
          console.log('Found existing participant by phone number:', phoneData[0])
          // Update the existing participant with the new eventria_user_id
          const { data: updateData, error: updateError } = await supabase
            .from('participants')
            .update({ eventria_user_id: userId })
            .eq('id', phoneData[0].id)
            .select()
          
          if (updateError) {
            console.error('Error updating participant with new user ID:', updateError)
          } else {
            console.log('Updated participant with new user ID:', updateData)
          }
          
          return { exists: true, data: phoneData[0], error: null }
        }
      }
      
      return { exists: false, data: null, error: null }
    } catch (err) {
      console.error('Error checking existing participant:', err)
      return { exists: false, data: null, error: err }
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
          social_cred_rating: 0.0,
          professional_mode_always: false,
          pref_timeout: 300,
          preferred_communication_method: 'sms',
          sms_character_limit: 160,
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
    
    console.log('Checking for existing participant for user:', user.id, user.email, user.phone)
    const { exists, data: existingParticipant, error } = await participantService.checkExistingParticipant(user.id, user.email, user.phone)
    
    if (error) {
      console.error('Error checking existing participant:', error)
      return { success: false, error }
    }
    
    if (exists) {
      console.log('Participant already exists, skipping creation:', existingParticipant)
      return { success: true, exists: true, data: existingParticipant }
    }
    
    console.log('No existing participant found, creating new one...')
    // Create participant with basic info from auth
    const result = await participantService.createParticipant(user)
    return result
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
        redirectTo: `${window.location.origin}/starter-journey-0`
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