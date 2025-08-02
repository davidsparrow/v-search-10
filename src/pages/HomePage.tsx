import { useState, useRef, useEffect } from 'react'
import { Button, Input, Row, Col, Modal, Typography, Layout, Space, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import { SettingOutlined } from '@ant-design/icons'
import { AiFillExperiment, AiFillBulb } from 'react-icons/ai'
import { GiBatMask } from 'react-icons/gi'
import { FaSnowflake } from 'react-icons/fa'
import { useCloudStore } from '../store/cloudStore'
import { auth } from '../lib/supabase'
import { TypingAnimation } from '../components/common/TypingAnimation'
import { MenuTemplate } from '../components/MenuTemplate'
import { AskBenderTier } from '../types/askbender'

const { Header, Content, Footer } = Layout
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
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [textLogoError, setTextLogoError] = useState(false)
  const [instaImageError, setInstaImageError] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')

  // Reset image error states on component mount
  useEffect(() => {
    setInstaImageError(false)
    setTextLogoError(false)
    setLogoError(false)
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('Please enter email and password')
      return
    }
    
    setIsLoading(true)
    try {
      // For now, simulate successful login for testing
      console.log('Login attempt with:', { email, password })
      
      // Show success message
      setShowSuccessMessage(true)
      
      // Clear form
      setEmail('')
      setPassword('')
      
      // Hide success message after 3 seconds and navigate
      setTimeout(() => {
        setShowSuccessMessage(false)
        navigate('/pre-search-1')
      }, 3000)
      
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const { error } = await auth.signInWithGoogle()
      if (error) {
        console.error('Google auth error:', error.message)
        // TODO: Show error message to user
      }
      // Google auth will redirect automatically
    } catch (error) {
      console.error('Google auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiteMe = () => {
    window.open('https://bite.bendersaas.ai', '_blank')
  }

  // Password reset modal state
  const [isResetModalVisible, setIsResetModalVisible] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null)



  const handleResetModalCancel = () => {
    setIsResetModalVisible(false)
    setResetEmail('')
    setResetError('')
    setResetSuccess(false)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
  }

  const handleResetPassword = async () => {
    setResetLoading(true)
    setResetError('')
    setResetSuccess(false)
    try {
      const { error } = await auth.resetPasswordForEmail(resetEmail)
      if (error) {
        setResetError(error.message)
      } else {
        setResetSuccess(true)
        // Auto-close after 5 seconds
        resetTimerRef.current = setTimeout(() => {
          setIsResetModalVisible(false)
          setResetSuccess(false)
        }, 5000)
      }
    } catch (err: any) {
      setResetError(err.message || 'Something went wrong.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleThemeChange = (theme: 'default' | 'dark' | 'compact' | 'white') => {
    setTheme(theme)
  }

  // Apply white-theme class to body for placeholder styling
  useEffect(() => {
    if (currentTheme === 'white') {
      document.body.classList.add('white-theme')
    } else {
      document.body.classList.remove('white-theme')
    }
  }, [currentTheme])



  // Input styles that match the selected theme
  const inputStyle = {
    height: '40px',
    borderRadius: '8px',
    border: `1px solid ${theme.cardBorder}`,
    background: theme.cardBackground,
    color: currentTheme === 'white' ? '#000000' : theme.textPrimary, // Black text for white theme
    fontSize: '14px'
  }








  const handleOpenMenu = () => {
    setIsMenuVisible(true)
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: theme.background }}>
      {/* Sticky Header */}
      <Header style={{
        background: theme.headerBackground,
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'none',
        zIndex: 100
      }}>
        {/* B Logo */}
        {!logoError ? (
          <img
            src="/askbender_b!_green_on_blk.png"
            alt="AskBender"
            style={{
              height: '40px',
              width: 'auto',
              cursor: 'pointer',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
            }}
            onClick={() => navigate('/')}
            onError={() => setLogoError(true)}
          />
        ) : (
          <div 
            style={{ 
              width: '40px', 
              height: '40px',
              background: theme.logoAccentColor,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            B
          </div>
        )}
        {/* Theme Icons and Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Icons */}
          <Space size="small">
            <Button
              type="text"
              icon={<GiBatMask style={{ fontSize: '16px' }} />}
              className={currentTheme === 'dark' ? 'icon-two-tone-dark' : ''}
              style={{ 
                color: currentTheme === 'dark' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('dark')}
            />
            <Button
              type="text"
              icon={<FaSnowflake style={{ fontSize: '16px' }} />}
              className={currentTheme === 'white' ? 'icon-two-tone-white' : ''}
              style={{ 
                color: currentTheme === 'white' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('white')}
            />
            <Button
              type="text"
              icon={<AiFillExperiment style={{ fontSize: '16px' }} />}
              className={currentTheme === 'default' ? 'icon-two-tone-default' : ''}
              style={{ 
                color: currentTheme === 'default' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('default')}
            />
            <Button
              type="text"
              icon={<AiFillBulb style={{ fontSize: '16px' }} />}
              className={currentTheme === 'compact' ? 'icon-two-tone-compact' : ''}
              style={{ 
                color: currentTheme === 'compact' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('compact')}
            />
          </Space>
          {/* Settings Icon */}
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={{ color: theme.textPrimary, fontSize: '18px' }}
            onClick={handleOpenMenu}
          />
        </div>
      </Header>

      {/* Main Content - Responsive Scroll */}
      <Content className="homepage-content" style={{ height: 'calc(100vh - 64px - 60px)', overflow: 'hidden' }}>
        <Row style={{ height: '100%' }} gutter={8}>
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
                {!textLogoError ? (
                  <img
                    src="/askbender-text-logo!_rainbow.png"
                    alt="ask bender"
                    style={{
                      maxWidth: '300px',
                      width: '100%',
                      height: 'auto',
                      animation: 'billiardFloat 35s linear infinite',
                      filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
                    }}
                    onError={() => setTextLogoError(true)}
                  />
                ) : (
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

              {/* Authentication Form */}
              <div style={{ 
                width: '80%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '8px' // Reduced from 12px to 8px for tighter spacing
              }}
              className={currentTheme === 'compact' ? 'compact-theme' : ''}
              >
                {/* Email/Phone Input */}
                <Input
                  placeholder="Phone, Email or User Name"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only format if it looks like a phone number
                    if (isPhoneNumber(value)) {
                      setEmail(formatPhoneNumber(value))
                    } else {
                      setEmail(value)
                    }
                  }}
                  style={inputStyle}
                />

                {/* Password Input */}
                <Input.Password
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />

                {/* Success Message */}
                {showSuccessMessage && (
                  <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(34, 197, 94, 0.9)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    ✅ Success! Redirecting to chat...
                  </div>
                )}

                {/* Login Button */}
                <Button
                  type="primary"
                  size="middle"
                  onClick={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    background: '#DC2626', // Red
                    borderColor: '#DC2626',
                    color: 'white',
                    borderRadius: '88px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    marginTop: '8px', // Reduced from 12px to 8px
                    marginBottom: '4px' // Added small bottom margin
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#B91C1C' // 30% darker red
                    e.currentTarget.style.borderColor = '#B91C1C'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#DC2626'
                    e.currentTarget.style.borderColor = '#DC2626'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.background = '#991B1B' // 50% darker red
                    e.currentTarget.style.borderColor = '#991B1B'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.background = '#B91C1C' // Back to hover state
                    e.currentTarget.style.borderColor = '#B91C1C'
                  }}
                >
                  Drop a Log in
                </Button>



                {/* Divider */}
                <Divider style={{ 
                  color: theme.textSecondary, 
                  fontSize: '12px',
                  margin: '4px 0', // Reduced from 8px to 4px
                  borderColor: theme.cardBorder
                }}>
                  or
                </Divider>

                {/* Google Auth Button */}
                <Button
                  size="middle"
                  onClick={handleGoogleAuth}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    background: 'transparent',
                    borderColor: 'transparent', // No border
                    color: currentTheme === 'compact' ? '#ffff00' : (currentTheme === 'default' ? '#ffff00' : '#3B82F6'), // Yellow for COMPACT and CLASSIC theme
                    borderRadius: '88px', // Same as login button
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    marginBottom: '4px' // Added small bottom margin
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.borderColor = 'transparent' // No border on hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent' // No border
                  }}
                >
                  <img 
                    src="/google-g-icon-transparent.png" 
                    alt="Google"
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      objectFit: 'contain'
                    }}
                  />
                  Continue with Google
                </Button>

                  {/* Second separator replaced with "Again with the lost Sticky?" link */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    margin: '12px 0',
                    gap: '16px'
                  }}>
                    <div style={{ 
                      flex: 1, 
                      height: '1px', 
                      background: currentTheme === 'compact' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)' 
                    }} />
                    <span style={{
                      color: currentTheme === 'compact' ? '#ffff00' : (currentTheme === 'default' ? '#ffff00' : '#1890ff'),
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => setIsResetModalVisible(true)}
                    title="Passwords. Glassware. Easy."
                    >
                      Again with the lost Sticky?
                    </span>
                    <div style={{ 
                      flex: 1, 
                      height: '1px', 
                      background: currentTheme === 'compact' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)' 
                    }} />
                  </div>

                  {/* Bite Me link centered at bottom */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginTop: '6px'
                  }}>
                    <span
                      style={{
                        color: currentTheme === 'compact' ? '#ffff00' : (currentTheme === 'default' ? '#ffff00' : '#1890ff'),
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
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
      </Content>

      {/* Footer */}
      <Footer style={{ 
        background: 'transparent',
        padding: 0,
        height: '27px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div style={{ 
            fontSize: '10px',
            color: theme.textSecondary,
            lineHeight: '17px',
            paddingBottom: '10px'
          }}>
            © 2025 bendersaas.ai&nbsp;&nbsp;&nbsp;&nbsp;
            <span 
              style={{ 
                color: theme.textSecondary,
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
                color: theme.textSecondary,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => navigate('/terms')}
            >
              terms
            </span>
          </div>
        </div>
      </Footer>

      {/* Settings Menu */}
      <MenuTemplate
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        pageType="home"
        userLevel={userTier}
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
    </Layout>
  )
} 