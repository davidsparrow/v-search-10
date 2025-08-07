import { useState, useRef, useEffect } from 'react'
import { Button, Input, Row, Col, Modal, Typography, Space, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import { SettingOutlined } from '@ant-design/icons'
import { useCloudStore } from '../store/cloudStore'
import { supabase } from '../lib/supabase'
import { TypingAnimation } from '../components/common/TypingAnimation'
import { ProfileMenuTemplate } from '../components/menus/ProfileMenuTemplate'
import { MainHeader } from '../components/headers/MainHeader'
import { LoginModal } from '../components/LoginModal'
import { AskBenderTier } from '../types/askbender'
import { getSessionLogo, preloadSessionLogo, getFallbackLogo } from '../lib/logoManager'

const { } = Typography

// Phone number formatting function
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, '')
  
  // Format based on length
  if (phoneNumber.length <= 3) {
    return phoneNumber
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }
}

// Check if input looks like a phone number
const isPhoneNumber = (value: string): boolean => {
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly.length >= 7 && digitsOnly.length <= 15
}

export function HomePage() {
  const navigate = useNavigate()
  const { 
    currentTheme, 
    setTheme, 
    getThemeConfig,
    isLoading,
    setIsLoading
  } = useCloudStore()
  const theme = getThemeConfig()
  
  // State for modal and menu
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [openToSignup, setOpenToSignup] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [textLogoError, setTextLogoError] = useState(false)
  const [instaImageError, setInstaImageError] = useState(false)
  const [sessionLogo, setSessionLogo] = useState<string>('')
  const [logoLoaded, setLogoLoaded] = useState(false)

  // Reset modal state
  const [isResetModalVisible, setIsResetModalVisible] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')

  // Reset image error states on component mount and preload session logo
  useEffect(() => {
    setInstaImageError(false)
    setTextLogoError(false)
    setLogoError(false)
    
    // Preload the session logo
    const preloadLogo = async () => {
      try {
        const logoPath = getSessionLogo()
        setSessionLogo(logoPath)
        await preloadSessionLogo()
        setLogoLoaded(true)
      } catch (error) {
        console.warn('Failed to preload session logo, using fallback:', error)
        setSessionLogo(getFallbackLogo())
        setLogoLoaded(true)
      }
    }
    
    preloadLogo()
  }, [])

  const handleBiteMe = () => {
    // TODO: Implement Bite-Me modal with new content
    console.log('Bite Me clicked - modal coming soon')
  }

  const handleResetModalCancel = () => {
    setIsResetModalVisible(false)
    setResetEmail('')
    setResetError('')
    setResetSuccess(false)
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email')
      return
    }

    setResetLoading(true)
    setResetError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setResetError(error.message)
      } else {
        setResetSuccess(true)
        setTimeout(() => {
          handleResetModalCancel()
        }, 3000)
      }
    } catch (error) {
      setResetError('Failed to send reset email')
    } finally {
      setResetLoading(false)
    }
  }

  const handleThemeChange = (theme: 'default' | 'dark' | 'compact' | 'white') => {
    setTheme(theme)
  }

  const handleOpenMenu = () => {
    setIsMenuVisible(true)
  }

  const handleOpenLoginModal = () => {
    setIsLoginModalVisible(true)
  }

  const handleOpenSignupModal = () => {
    setOpenToSignup(true)
    setIsLoginModalVisible(true)
  }

  const handleCloseLoginModal = () => {
    setIsLoginModalVisible(false)
    setOpenToSignup(false)
  }

  // Input style for theme consistency
  const inputStyle = {
    height: '40px',
    borderRadius: '88px',
    border: `1px solid ${theme.cardBorder}`,
    background: theme.cardBackground,
    color: currentTheme === 'white' ? '#000000' : theme.textPrimary, // Black text for white theme
    fontSize: '14px'
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: theme.background,
      overflow: 'auto'
    }}>
      {/* Header */}
      <MainHeader 
        showSettingsIcon={true}
        onMenuClick={handleOpenMenu}
      />

      {/* Main Content */}
      <div style={{
        width: '100%',
        minHeight: 'calc(100vh - 64px - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 20px' // Reduced from 40px to 20px to move content up by ~100px
      }}>
        <Row style={{ height: '100%', width: '100%' }} gutter={8}>
          {/* Visual Side - Left (Desktop) / Top (Mobile) */}
          <Col xs={24} md={14} className="homepage-image" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '100%',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%'
            }}>
              {/* Instagram Test Image - Centered and 20% larger */}
              {!instaImageError ? (
                <img 
                  src="/instatest.png" 
                  alt="Instagram test sample"
                  style={{ 
                    maxWidth: '600px',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    console.error('Failed to load instatest.png:', e)
                    setInstaImageError(true)
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded instatest.png')
                    setInstaImageError(false)
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme.cardBackground,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '16px',
                  color: theme.textSecondary,
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div>
                    <p>Instagram Test Image</p>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      Place instatest.png in the public folder
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Form Side - Right (Desktop) / Bottom (Mobile) */}
          <Col xs={24} md={10} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              textAlign: 'center',
              padding: '24px 16px',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Text Logo */}
              <div style={{ 
                marginBottom: '20px',
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {sessionLogo && (
                  <img
                    src={sessionLogo}
                    alt="ask bender"
                    style={{
                      maxWidth: '300px',
                      width: '100%',
                      height: 'auto',
                      animation: 'billiardFloat 35s linear infinite',
                      filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))',
                      opacity: logoLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onError={() => setTextLogoError(true)}
                  />
                )}
                {textLogoError && (
                  <div 
                    style={{ 
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: theme.logoColor,
                      fontFamily: 'monospace',
                      transform: 'skew(-10deg)',
                      display: 'inline-block'
                    }}
                  >
                    ask be<span style={{ color: theme.logoAccentColor }}>N</span>der
                  </div>
                )}
              </div>

              {/* Bulldoze Text */}
              <div style={{
                marginBottom: '30px', // Reduced from 90px to 30px (60px less)
                textAlign: 'center'
              }}>
                <p style={{
                  color: 'white',
                  fontSize: '16px',
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                  <TypingAnimation />
                </p>
              </div>

              {/* Simplified Login Section */}
              <div style={{ 
                width: '80%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '16px'
              }}
              className={currentTheme === 'compact' ? 'compact-theme' : ''}
              >
                {/* Start Freeloading Button */}
                <Button
                  type="primary"
                  size="large"
                  onClick={handleOpenSignupModal}
                  style={{
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '500',
                    background: '#1890ff', // Blue
                    borderColor: '#1890ff',
                    color: 'white',
                    borderRadius: '88px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1890ff' // 30% darker blue
                    e.currentTarget.style.borderColor = '#1890ff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1890ff'
                    e.currentTarget.style.borderColor = '#1890ff'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.background = '#1890ff' // 50% darker blue
                    e.currentTarget.style.borderColor = '#1890ff'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.background = '#1890ff' // Back to hover state
                    e.currentTarget.style.borderColor = '#1890ff'
                  }}
                >
                  Start Freeloading
                </Button>

                {/* Bite Me link centered at bottom */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: '16px'
                }}>
                  <span
                    style={{
                      color: currentTheme === 'compact' ? '#ffffff' : (currentTheme === 'default' ? '#ffffff' : '#1890ff'),
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={handleBiteMe}
                    title="Mess around & find out"
                  >
                    Bite Me
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Copyright Footer - Using PricingPageTemplate style */}
      <div style={{
        width: '100%',
        background: '#000000',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #333333'
      }}>
        <p style={{
          color: '#666666',
          fontSize: '10px',
          fontFamily: 'Poppins, sans-serif',
          margin: '0',
          lineHeight: '17px'
        }}>
          © 2025 bendersaas.ai&nbsp;&nbsp;&nbsp;&nbsp;
          <span 
            style={{ 
              color: '#666666',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => navigate('/privacy')}
          >
            privacy
          </span>
          &nbsp;&nbsp;
          <span 
            style={{ 
              color: '#666666',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => navigate('/terms')}
          >
            terms
          </span>
        </p>
      </div>

      {/* Settings Menu */}
      <ProfileMenuTemplate
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        userLevel={userTier}
      />

      {/* Login Modal */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={handleCloseLoginModal}
        defaultTab="1"
        openToSignup={openToSignup}
      />

      {/* Password Reset Modal */}
      <Modal
        title="Reset Password"
        open={isResetModalVisible}
        onCancel={handleResetModalCancel}
        footer={null}
        centered
      >
        {resetSuccess ? (
          <div style={{ textAlign: 'center', color: '#52c41a', margin: '16px 0' }}>
            Check your email for a reset link!<br/>
            (This window will close automatically.)
          </div>
        ) : (
          <>
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              disabled={resetLoading}
              onPressEnter={handleResetPassword}
              style={{ marginBottom: 12 }}
            />
            {resetError && (
              <div style={{ color: 'red', marginBottom: 8 }}>{resetError}</div>
            )}
            <Button
              type="primary"
              block
              loading={resetLoading}
              onClick={handleResetPassword}
              disabled={!resetEmail || resetLoading}
            >
              Send Reset Link
            </Button>
          </>
        )}
      </Modal>
    </div>
  )
} 