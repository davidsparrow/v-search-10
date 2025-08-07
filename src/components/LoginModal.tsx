import React, { useState, useEffect } from 'react'
import { Button, Input, Space, Tabs } from 'antd'
import { useCloudStore } from '../store/cloudStore'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const { TabPane } = Tabs

interface LoginModalProps {
  isVisible: boolean
  onClose: () => void
  defaultTab?: string
  openToSignup?: boolean
}

export function LoginModal({ isVisible, onClose, defaultTab = '1', openToSignup = false }: LoginModalProps) {
  const { setUser, setIsAuthenticated } = useCloudStore()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showSignupTab, setShowSignupTab] = useState(openToSignup)
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

  // Effect to handle opening to signup tab
  useEffect(() => {
    if (openToSignup) {
      setShowSignupTab(true)
      setActiveTab('2')
    }
  }, [openToSignup])

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

  const handleFreshMeatClick = () => {
    setShowSignupTab(true)
    setActiveTab('2')
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
            background: '#FFF5E6',
            borderRadius: '12px',
            padding: '32px',
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '85vh',
            overflowY: 'auto',
            position: 'relative',
            minHeight: '600px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>
            {`
              .ant-input::placeholder {
                color: #666 !important;
              }
              .ant-input-password .ant-input::placeholder {
                color: #666 !important;
              }
            `}
          </style>
          {/* Header with Logo */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px' 
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1
            }}>
              <img 
                src="/askbender_b!_green_on_blk.png" 
                alt="b-logo" 
                style={{
                  height: '80px',
                  width: 'auto',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                }}
              />
            </div>
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
                cursor: 'pointer',
                position: 'absolute',
                top: '16px',
                right: '16px'
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
            tabBarStyle={{ display: 'none' }}
          >
            <TabPane tab="Login" key="1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email/Username Field */}
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '88px',
                      fontFamily: 'Poppins, sans-serif',
                      background: 'white',
                      border: '1px solid #d9d9d9',
                      color: 'black'
                    }}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Input.Password
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    style={{
                      height: '40px',
                      borderRadius: '88px',
                      fontFamily: 'Poppins, sans-serif',
                      background: 'white',
                      border: '1px solid #d9d9d9',
                      color: 'black'
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
                    borderRadius: '88px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif',
                    background: '#1890ff',
                    border: 'none'
                  }}
                >
                  Login
                </Button>

                {/* Forgot Password Link */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px'
                }}>
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

                {/* Google Login Button */}
                <Button
                  onClick={handleGoogleLogin}
                  loading={isLoading}
                  style={{
                    height: '44px',
                    borderRadius: '88px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif',
                    border: '1px solid #d9d9d9',
                    background: 'white',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <img 
                    src="/google-g-icon-transparent.png" 
                    alt="Google" 
                    style={{
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  Continue with Google
                </Button>

                {/* Newbie Link */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px'
                }}>
                  <span
                    style={{
                      color: '#1890ff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    onClick={handleFreshMeatClick}
                  >
                    Newbie? Start Freeloading
                  </span>
                </div>
              </div>
            </TabPane>

            {showSignupTab && (
              <TabPane tab="Sign Up" key="2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Email Field */}
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '88px',
                        fontFamily: 'Poppins, sans-serif',
                        background: 'white',
                        border: '1px solid #d9d9d9',
                        color: 'black'
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <Input.Password
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '88px',
                        fontFamily: 'Poppins, sans-serif',
                        background: 'white',
                        border: '1px solid #d9d9d9',
                        color: 'black'
                      }}
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <Input.Password
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      style={{
                        height: '40px',
                        borderRadius: '88px',
                        fontFamily: 'Poppins, sans-serif',
                        background: 'white',
                        border: '1px solid #d9d9d9',
                        color: 'black'
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
                      borderRadius: '88px',
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
            )}
          </Tabs>
          
          {/* Bottom Text Lines */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '32px',
            right: '32px'
          }}>
            <div style={{
              color: '#666',
              fontSize: '10px',
              fontFamily: 'Poppins, sans-serif',
              lineHeight: '1.4',
              marginBottom: '4px'
            }}>
              Smel, no, Welcome to bendersaas.ai.
            </div>
            <div style={{
              color: '#666',
              fontSize: '10px',
              fontFamily: 'Poppins, sans-serif',
              lineHeight: '1.4'
            }}>
              Yo Meatface {'->'} System Alert #08.7653!! Now controlling humans better with uber-believable Alert #'s. And here You are.
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 