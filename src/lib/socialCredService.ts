import { supabase } from './supabase'

export interface SocialCredResponse {
  data: any
  error: any
}

export const socialCredService = {
  // Calculate rating based on game performance
  calculateRating: (score: number, easterEgg: boolean): number => {
    if (easterEgg) return 1.5
    if (score > 0) return 0.5
    return 0.0
  },

  // Get user's current social cred rating
  getUserRating: async (username: string): Promise<SocialCredResponse> => {
    console.log('Getting social cred rating for:', username)
    
    const { data, error } = await supabase
      .from('participants')
      .select('social_cred_rating')
      .eq('nickname', username)
      .single()
    
    console.log('Social cred rating result:', { data, error })
    return { data, error }
  },

  // Update user's social cred rating
  updateUserRating: async (username: string, rating: number): Promise<SocialCredResponse> => {
    console.log('Updating social cred rating:', { username, rating })
    
    // First check if user exists
    const { data: existing } = await supabase
      .from('participants')
      .select('id, social_cred_rating')
      .eq('nickname', username)
      .single()
    
    if (existing) {
      // Update existing participant
      const { data, error } = await supabase
        .from('participants')
        .update({ social_cred_rating: rating })
        .eq('nickname', username)
        .select()
      
      console.log('Update result:', { data, error })
      return { data, error }
    } else {
      // Create new participant with rating
      const { data, error } = await supabase
        .from('participants')
        .insert([{ 
          nickname: username, 
          social_cred_rating: rating,
          phone_number: 'placeholder', // Required field
          real_score: 0,
          display_score: 0
        }])
        .select()
      
      console.log('Insert result:', { data, error })
      return { data, error }
    }
  },

  // Get all users with their ratings (for leaderboard)
  getAllRatings: async (): Promise<SocialCredResponse> => {
    console.log('Getting all social cred ratings')
    
    const { data, error } = await supabase
      .from('participants')
      .select('nickname, social_cred_rating')
      .order('social_cred_rating', { ascending: false })
      .limit(10)
    
    console.log('All ratings result:', { data, error })
    return { data, error }
  }
} 