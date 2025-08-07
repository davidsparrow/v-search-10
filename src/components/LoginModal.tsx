import React, { useState } from 'react'
import { Button, Input, Space, Tabs } from 'antd'
import { useCloudStore } from '../store/cloudStore'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const { TabPane } = Tabs

interface LoginModalProps {
  isVisible: boolean
  onClose: () => void
  defaultTab?: string
}

export function LoginModal({ isVisible, onClose, defaultTab = '1' }: LoginModalProps) {
  const { setUser, setIsAuthenticated } = useCloudStore()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        onClose()
        // Route to appropriate page based on user status
        navigate('/search-chat')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Google login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        onClose()
        // Route to starter journey for new users
        navigate('/starter-journey-0')
      }
    } catch (err) {
      setError('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password clicked')
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#222',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Welcome Back
            </h2>
            <Button
              type="text"
              onClick={onClose}
              style={{ 
                color: '#666', 
                fontSize: '20px', 
                background: 'none', 
                border: 'none', 
                boxShadow: 'none', 
                outline: 'none', 
                cursor: 'pointer' 
              }}
              aria-label="Close modal"
            >
              ✕
            </Button>
          </div>

          {/* Tabs */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            style={{ marginBottom: '24px' }}
          >
            <TabPane tab="Login" key="1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email/Username Field */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Email or Username
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Password
                  </label>
                  <Input.Password
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div style={{
                    color: '#ff4d4f',
                    fontSize: '14px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <Button
                  type="primary"
                  onClick={handleLogin}
                  loading={isLoading}
                  disabled={!loginForm.email || !loginForm.password}
                  style={{
                    height: '44px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif',
                    background: '#1890ff',
                    border: 'none'
                  }}
                >
                  Login
                </Button>

                {/* Google Login Button */}
                <Button
                  onClick={handleGoogleLogin}
                  loading={isLoading}
                  style={{
                    height: '44px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif',
                    border: '1px solid #d9d9d9',
                    background: 'white',
                    color: '#333'
                  }}
                >
                  Continue with Google
                </Button>

                {/* Links */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px'
                }}>
                  <span
                    style={{
                      color: '#1890ff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    onClick={() => setActiveTab('2')}
                  >
                    Fresh Meat? Start Here
                  </span>
                  <span
                    style={{
                      color: '#666',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    onClick={handleForgotPassword}
                    title="Forgot Password, total fail."
                  >
                    Again with the sticky?
                  </span>
                </div>
              </div>
            </TabPane>

            <TabPane tab="Sign Up" key="2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email Field */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Password
                  </label>
                  <Input.Password
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Confirm Password
                  </label>
                  <Input.Password
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div style={{
                    color: '#ff4d4f',
                    fontSize: '14px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {error}
                  </div>
                )}

                {/* Sign Up Button */}
                <Button
                  type="primary"
                  onClick={handleSignup}
                  loading={isLoading}
                  disabled={!signupForm.email || !signupForm.password || !signupForm.confirmPassword}
                  style={{
                    height: '44px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif',
                    background: '#52c41a',
                    border: 'none'
                  }}
                >
                  Start Free
                </Button>

                {/* Back to Login Link */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '16px'
                }}>
                  <span
                    style={{
                      color: '#1890ff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    onClick={() => setActiveTab('1')}
                  >
                    Already have an account? Login
                  </span>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  )
} 