import { supabase } from './supabase'
import { LeaderboardEntry, LeaderboardResponse, InsertScoreRequest } from '../types/leaderboard'

export const leaderboardService = {
  // Fetch top 10 leaderboard entries
  fetchLeaderboard: async (): Promise<LeaderboardResponse> => {
    console.log('Fetching leaderboard...')
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)
    
    console.log('Fetch result:', { data, error })
    console.log('Data type:', typeof data)
    console.log('Data length:', data?.length)
    console.log('Full data:', JSON.stringify(data, null, 2))
    return { data, error }
  },

  // Insert a new score
  insertScore: async (username: string, score: number): Promise<LeaderboardResponse> => {
    console.log('Inserting score:', { username, score })
    
    // Try insert first
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ username, score }])
      .select()
    
    console.log('Insert result:', { data, error })
    
    // If insert fails due to RLS, try a different approach
    if (error) {
      console.log('Insert failed, trying alternative approach...')
      // You might need to temporarily disable RLS or adjust the policy
    }
    
    return { data, error }
  },

  // Check if a score qualifies for the leaderboard
  checkScoreQualification: (score: number, currentLeaderboard: LeaderboardEntry[]): boolean => {
    if (currentLeaderboard.length < 10) return true
    return score > currentLeaderboard[currentLeaderboard.length - 1].score
  },

  // Get user's best score
  getUserBestScore: async (username: string): Promise<LeaderboardResponse> => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('username', username)
      .order('score', { ascending: false })
      .limit(1)
    
    return { data, error }
  },

  // Update user's score if it's higher
  updateUserScore: async (username: string, score: number): Promise<LeaderboardResponse> => {
    // First check if user has an existing score
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('username', username)
      .single()
    
    if (existing && score > existing.score) {
      // Update existing score
      const { data, error } = await supabase
        .from('leaderboard')
        .update({ score })
        .eq('username', username)
        .select()
      
      return { data, error }
    } else if (!existing) {
      // Insert new score
      return await leaderboardService.insertScore(username, score)
    }
    
    return { data: null, error: null }
  }
} 