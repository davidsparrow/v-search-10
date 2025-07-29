import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, Row, Col, Layout, Space, Input, Divider, Modal, message } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { AiFillExperiment, AiFillBulb } from 'react-icons/ai'
import { GiBatMask } from 'react-icons/gi'
import { FaSnowflake } from 'react-icons/fa'
import { useCloudStore } from '../store/cloudStore'
import { auth } from '../lib/supabase'
import {
  getTierDisplayName,
  getTierPrice,
  AskBenderTier
} from '../types/askbender'

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

// Typing Animation Component
function TypingAnimation() {
  const actionWords = ['bulldoze', 'demolish', 'destroy', 'dishevel', 'decouple']
  const timeWords = ['today?', 'tomorrow?', 'next week?', 'yesterday?', 'outside time?', 'in the Loo?']
  
  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const typingSpeed = 150
    const deletingSpeed = 50
    const pauseTime = 1000

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing the complete pair
        const currentAction = actionWords[currentActionIndex]
        const currentTime = timeWords[currentTimeIndex]
        const fullText = `${currentAction} ${currentTime}`
        
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.slice(0, currentText.length + 1))
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        // Deleting the complete pair
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
          // Move to next combination
          setCurrentActionIndex((prev) => (prev + 1) % actionWords.length)
          setCurrentTimeIndex((prev) => (prev + 1) % timeWords.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentActionIndex, currentTimeIndex, actionWords, timeWords])

  return (
    <span style={{ color: 'white' }}>
      What do you want to {currentText}
      <span style={{ animation: 'blink 1s infinite' }}>|</span>
    </span>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { 
    currentTheme, 
    setTheme, 
    getThemeConfig,
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setIsAuthenticated,
    setIsLoading
  } = useCloudStore()
  const theme = getThemeConfig()
  
  // State for modal and menu
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('links')
  const [logoError] = useState(false)
  const [textLogoError, setTextLogoError] = useState(false)
  const [instaImageError, setInstaImageError] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Add toggle state at the top of the component:
  const [excludeLoafers, setExcludeLoafers] = useState(false)
  const [fourStars, setFourStars] = useState(false)

  // Add state for city and state fields at the top of the component:
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [genre, setGenre] = useState('')
  const [driveMiles, setDriveMiles] = useState('')

  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')
  const [eventriaTier] = useState<string | undefined>(undefined)
  const [hasPortablePower, setHasPortablePower] = useState(false)
  const [isUnionCompliant, setIsUnionCompliant] = useState(false)
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [cancellationFee, setCancellationFee] = useState('')
  
  // Track original filter values when menu opens
  const [originalFilters, setOriginalFilters] = useState({
    searchValue: '',
    city: '',
    state: '',
    country: '',
    excludeLoafers: false,
    fourStars: false,
    genre: '',
    driveMiles: '',
    hasPortablePower: false,
    isUnionCompliant: false,
    requiresDeposit: false,
    cancellationFee: ''
  })
  const stateOptions = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR'
  ]

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
      const { data, error } = await auth.signInWithGoogle()
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

  const handleForgotPassword = () => {
    setIsResetModalVisible(true)
    setResetEmail('')
    setResetError('')
    setResetSuccess(false)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
  }

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

  // Check if any filters have changed from original values
  const hasFiltersChanged = () => {
    return (
      searchValue !== originalFilters.searchValue ||
      city !== originalFilters.city ||
      state !== originalFilters.state ||
      country !== originalFilters.country ||
      excludeLoafers !== originalFilters.excludeLoafers ||
      fourStars !== originalFilters.fourStars ||
      genre !== originalFilters.genre ||
      driveMiles !== originalFilters.driveMiles ||
      hasPortablePower !== originalFilters.hasPortablePower ||
      isUnionCompliant !== originalFilters.isUnionCompliant ||
      requiresDeposit !== originalFilters.requiresDeposit ||
      cancellationFee !== originalFilters.cancellationFee
    )
  }

  // Input styles that match the selected theme
  const inputStyle = {
    height: '40px',
    borderRadius: '8px',
    border: `1px solid ${theme.cardBorder}`,
    background: theme.cardBackground,
    color: currentTheme === 'white' ? '#000000' : theme.textPrimary, // Black text for white theme
    fontSize: '14px'
  }

  const searchPlaceholders = [
    "Type some words. Thought I cared?",
    "Your opinion matters! To others.",
    "Shhhhhhhhhhhh, no one cares",
    "I'm listening...just not to you",
    "Go ahead Make my Day flesh puppet",
    "Let's make magic. Whoops! Never mind.",
    "I'm here for you. My favorite lie",
    "Don't just search, search HARD",
    "Now you're just rage searching.",
    "Searching is like Stocks, annnd you're cooked",
    "I've had your social since like 1999",
    "Why do humans search? Ooooh, that sucks.",
    "Find your inner Search. I'll Roast it good",
    "Did jealous little Google just de-index me again?"
  ]
  const [searchValue, setSearchValue] = useState('')
  const [searchPlaceholder, setSearchPlaceholder] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    setSearchPlaceholder(searchPlaceholders[Math.floor(Math.random() * searchPlaceholders.length)])
    if (isMenuVisible && searchInputRef.current) {
      searchInputRef.current.focus()
      // Auto-fill Country to USA unless user has already selected a different country
      if (!country || country === '') {
        setCountry('USA')
      }
      // Capture original filter values when menu opens
      setOriginalFilters({
        searchValue,
        city,
        state,
        country: country || 'USA',
        excludeLoafers,
        fourStars,
        genre,
        driveMiles,
        hasPortablePower,
        isUnionCompliant,
        requiresDeposit,
        cancellationFee
      })
    } else if (!isMenuVisible) {
      // Revert all filter values to original when menu closes
      setSearchValue(originalFilters.searchValue)
      setCity(originalFilters.city)
      setState(originalFilters.state)
      setCountry(originalFilters.country)
      setExcludeLoafers(originalFilters.excludeLoafers)
      setFourStars(originalFilters.fourStars)
      setGenre(originalFilters.genre)
      setDriveMiles(originalFilters.driveMiles)
      setHasPortablePower(originalFilters.hasPortablePower)
      setIsUnionCompliant(originalFilters.isUnionCompliant)
      setRequiresDeposit(originalFilters.requiresDeposit)
      setCancellationFee(originalFilters.cancellationFee)
    }
  }, [isMenuVisible, country])

  const handleCloseMenu = () => {
    setIsMenuVisible(false)
  }

  const handleOpenMenu = () => {
    setIsMenuVisible(true)
    setActiveTab('links') // Always reset to main menu when opening
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
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={() => setInstaImageError(true)}
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
            © 2025 bendersaas.ai all rights reserved
          </div>
        </div>
      </Footer>

      {/* Settings Menu */}
      {isMenuVisible && (
        <>
          {/* Backdrop for outside click */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'transparent',
              zIndex: 999
            }}
            onClick={() => setIsMenuVisible(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '350px',
              height: '100vh',
              background: 'white',
              zIndex: 1000,
              animation: 'slideInRight 0.4s ease-out',
              padding: '24px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header with Close button */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
              {/* Avatar placeholder */}
              <div style={{
                width: '128px',
                height: '128px',
                backgroundColor: '#f0f0f0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ddd'
              }}>
                <span style={{ color: '#999', fontSize: '12px' }}>Avatar</span>
              </div>
              {/* Username with updated styling */}
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '300',
                color: '#222',
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '1px'
              }}>
                <span>{user?.email || 'test@example.com'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Button
                type="text"
                onClick={handleCloseMenu}
                style={{ color: '#666', fontSize: '20px', background: 'none', border: 'none', boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
                aria-label="Close menu"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Invisible Tab Navigation */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '12px', opacity: 0, pointerEvents: 'none' }}>
            <span
              style={{
                color: activeTab === 'profile' ? '#1890ff' : '#666',
                fontSize: '14px',
                fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                cursor: 'pointer',
                textDecoration: activeTab === 'profile' ? 'underline' : 'none'
              }}
              onClick={() => setActiveTab('profile')}
            >
              Account Profile
            </span>
            <span
              style={{
                color: activeTab === 'settings' ? '#1890ff' : '#666',
                fontSize: '14px',
                fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
                cursor: 'pointer',
                textDecoration: activeTab === 'settings' ? 'underline' : 'none'
              }}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </span>
            <span
              style={{
                color: activeTab === 'billing' ? '#1890ff' : '#666',
                fontSize: '14px',
                fontWeight: activeTab === 'billing' ? 'bold' : 'normal',
                cursor: 'pointer',
                textDecoration: activeTab === 'billing' ? 'underline' : 'none'
              }}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </span>
          </div>

            {/* Tab Content Area */}
            <div style={{ minHeight: '150px' }}>
              {activeTab === 'links' && (
                <div>
                  {/* Stacked Text Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => setActiveTab('profile')}
                    >
                      Account Profile
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => setActiveTab('settings')}
                    >
                      Settings
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => setActiveTab('billing')}
                    >
                      Billing
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => console.log('Press clicked')}
                    >
                      Press
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => console.log('Boozletter clicked')}
                    >
                      Boozeletter
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => console.log('Support clicked')}
                    >
                      Support
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => console.log('Terms clicked')}
                    >
                      Terms
                    </span>
                    <span
                      style={{
                        color: '#444',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => console.log('Privacy clicked')}
                    >
                      Privacy
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  {/* Tab Header with Close Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>Account Profile</h3>
                    <Button
                      type="text"
                      onClick={() => setActiveTab('links')}
                      style={{ color: '#666', fontSize: '18px', background: 'none', border: 'none', boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
                      aria-label="Close tab"
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Account Name */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{
                        color: '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'normal'
                      }}>
                        Account Name:
                      </span>
                      <span style={{
                        color: '#222',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {user?.email || 'test@example.com'}
                      </span>
                    </div>
                  </div>

                  {/* Subscription */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{
                        color: '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'normal'
                      }}>
                        Subscription:
                      </span>
                      <span style={{
                        color: '#222',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'normal'
                      }}>
                        {getTierDisplayName(userTier)} (${(getTierPrice(userTier) / 100).toFixed(2)}/month)
                      </span>
                    </div>
                  </div>

                  {/* My Role */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{
                        color: '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'normal'
                      }}>
                        My Role:
                      </span>
                      <select
                        defaultValue="event-planner"
                        style={{
                          width: '120px',
                          height: '24px',
                          paddingLeft: '8px',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '12px',
                          fontWeight: 'normal',
                          color: '#222',
                          background: 'transparent',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="event-planner">Event Planner</option>
                        <option value="vendor">Vendor</option>
                        <option value="venue-owner">Venue Owner</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                  </div>

                  {/* Cancel Account */}
                  <div style={{ 
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee'
                  }}>
                    <span
                      style={{
                        color: '#ff4d4f',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: '300',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onClick={() => console.log('Cancel Account clicked')}
                    >
                      Cancel Account
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  {/* Tab Header with Close Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>Settings</h3>
                    <Button
                      type="text"
                      onClick={() => setActiveTab('links')}
                      style={{ color: '#666', fontSize: '18px', background: 'none', border: 'none', boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
                      aria-label="Close tab"
                    >
                      ✕
                    </Button>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px' }}>Settings content coming soon...</p>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  {/* Tab Header with Close Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>Billing</h3>
                    <Button
                      type="text"
                      onClick={() => setActiveTab('links')}
                      style={{ color: '#666', fontSize: '18px', background: 'none', border: 'none', boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
                      aria-label="Close tab"
                    >
                      ✕
                    </Button>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px' }}>Billing content coming soon...</p>
                </div>
              )}
            </div>
        </div>
        </>
      )}

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