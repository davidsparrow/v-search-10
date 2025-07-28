export type UserRole = 'user' | 'admin' | 'super_admin'

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface AdminCheckResult {
  isAdmin: boolean
  role: UserRole | null
  loading: boolean
  error: string | null
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  description: string
  created_at: string
  updated_at: string
}

export interface TextLogoVariation {
  id: string
  filename: string
  display_name: string
  destination_url: string
  is_active: boolean
  created_at: string
  updated_at: string
} 