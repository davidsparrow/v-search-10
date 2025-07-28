import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, Result } from 'antd'
import { useAdminCheck } from '../hooks/useAdminCheck'

interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAdmin, loading, error } = useAdminCheck()
  const navigate = useNavigate()

  // Show loading spinner while checking admin status
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // Show error if admin check failed
  if (error) {
    return (
      <Result
        status="error"
        title="Access Error"
        subTitle="Unable to verify admin status. Please try again."
      />
    )
  }

  // Redirect non-admin users
  if (!isAdmin) {
    // Use setTimeout to avoid navigation during render
    setTimeout(() => {
      navigate('/', { replace: true })
    }, 0)
    
    return fallback || (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access this page."
      />
    )
  }

  // Render admin content
  return <>{children}</>
} 