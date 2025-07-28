import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AdminCheckResult, UserRole } from '../types/admin'

export const useAdminCheck = (): AdminCheckResult => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          setIsAdmin(false)
          setRole(null)
          return
        }

        // Check user role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (roleError) {
          // If no role found, user is default 'user'
          setIsAdmin(false)
          setRole('user')
          return
        }

        const userRole = roleData?.role as UserRole
        setRole(userRole)
        setIsAdmin(userRole === 'admin' || userRole === 'super_admin')

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check admin status')
        setIsAdmin(false)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  return { isAdmin, role, loading, error }
} 