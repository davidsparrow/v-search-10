export interface LeaderboardEntry {
  id: number
  username: string
  score: number
  created_at: string
  updated_at: string
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[] | null
  error: any
}

export interface InsertScoreRequest {
  username: string
  score: number
} 