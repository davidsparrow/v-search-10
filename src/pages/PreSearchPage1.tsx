import { useState, useEffect, useRef } from 'react'

// TypeScript declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
import { useNavigate } from 'react-router-dom'
import { Layout, Input, Button, Typography, Space, Switch } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { FaMicrophone, FaHamburger } from 'react-icons/fa'
import { AiFillStar, AiFillExperiment, AiFillBulb } from 'react-icons/ai'
import { GiBatMask } from 'react-icons/gi'
import { FaSnowflake } from 'react-icons/fa'
import { FaSearch } from 'react-icons/fa'
import { useCloudStore } from '../store/cloudStore'
import { TierGate } from '../components/TierGate'
import { AskBenderTier } from '../types/askbender'

const { Header, Content } = Layout
const { TextArea } = Input
const { } = Typography

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export function PreSearchPage1() {
  const navigate = useNavigate()
  const { 
    getThemeConfig, 
    currentTheme, 
    setTheme 
  } = useCloudStore()
  const theme = getThemeConfig()
  
  // Menu state
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [logoError] = useState(false)
  
  // Filter states (same as HomePage)
  const [searchValue, setSearchValue] = useState('')
  const [searchPlaceholder, setSearchPlaceholder] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [excludeLoafers, setExcludeLoafers] = useState(false)
  const [fourStars, setFourStars] = useState(false)
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [genre, setGenre] = useState('')
  const [driveMiles, setDriveMiles] = useState('')
  const [hasPortablePower, setHasPortablePower] = useState(false)
  const [isUnionCompliant, setIsUnionCompliant] = useState(false)
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [cancellationFee, setCancellationFee] = useState('')
  const [minInitialDeposit, setMinInitialDeposit] = useState('')
  const [minTotalDeposit, setMinTotalDeposit] = useState('')
  const [allowsMilestoneDeposits, setAllowsMilestoneDeposits] = useState(false)
  
  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')
  const [eventriaTier] = useState<string | undefined>(undefined)
  
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
    cancellationFee: '',
    minInitialDeposit: '',
    minTotalDeposit: '',
    allowsMilestoneDeposits: false
  })
  
  const stateOptions = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR'
  ]
  
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
      cancellationFee !== originalFilters.cancellationFee ||
      minInitialDeposit !== originalFilters.minInitialDeposit ||
      minTotalDeposit !== originalFilters.minTotalDeposit ||
      allowsMilestoneDeposits !== originalFilters.allowsMilestoneDeposits
    )
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
        cancellationFee,
        minInitialDeposit,
        minTotalDeposit,
        allowsMilestoneDeposits
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
      setMinInitialDeposit(originalFilters.minInitialDeposit)
      setMinTotalDeposit(originalFilters.minTotalDeposit)
      setAllowsMilestoneDeposits(originalFilters.allowsMilestoneDeposits)
    }
  }, [isMenuVisible, country])
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Ready to crush this whole Event thing without actually working?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null)
  const chatInputRef = useRef<any>(null)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Great! Now what type of event are you planning? (e.g., wedding, corporate event, birthday party, etc.)",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-focus the chat input when component mounts
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus()
    }
  }, [])

  // Speech recognition functionality
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    setIsListening(true)
    
    // Use the appropriate SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true // Keep listening for longer
    recognition.interimResults = true // Show interim results
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1
    
    recognition.onstart = () => {
      console.log('Speech recognition started')
    }
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchValue(transcript)
      setIsListening(false)
    }
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access to use voice input.')
      }
    }
    
    recognition.onend = () => {
      setIsListening(false)
    }
    
    // Add a longer timeout before auto-stopping
    const timeoutId = setTimeout(() => {
      if (isListening) {
        recognition.stop()
        setIsListening(false)
      }
    }, 10000) // 10 seconds timeout
    
    recognition.start()
    setRecognitionInstance(recognition)
    
    // Store the timeout ID to clear it if needed
    return () => {
      clearTimeout(timeoutId)
      recognition.stop()
    }
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: theme.background }}>
      {/* Sticky Header */}
      <Header style={{ 
        background: theme.headerBackground, 
        padding: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'none',
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* B Logo */}
          {!logoError ? (
            <div style={{
              width: '40px',
              height: '40px',
              background: 'url(/askbender-b-logo.png) no-repeat center center',
              backgroundSize: 'contain',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
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
                className={currentTheme === 'compact' ? 'icon-two-tone-compact' : ''}
                style={{ 
                  color: currentTheme === 'compact' ? theme.logoAccentColor : theme.textSecondary,
                  fontSize: '16px'
                }}
                onClick={() => handleThemeChange('compact')}
              />
              <Button
                type="text"
                icon={<AiFillBulb style={{ fontSize: '16px' }} />}
                className={currentTheme === 'default' ? 'icon-two-tone-default' : ''}
                style={{ 
                  color: currentTheme === 'default' ? theme.logoAccentColor : theme.textSecondary,
                  fontSize: '16px'
                }}
                onClick={() => handleThemeChange('default')}
              />
            </Space>
            
            {/* Settings Menu Button */}
            <Button
              type="text"
              icon={<FaHamburger />}
              onClick={() => setIsMenuVisible(true)}
              style={{ 
                color: theme.textSecondary,
                fontSize: '16px'
              }}
            />
          </div>
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        maxWidth: '480px', // 40% narrower (800px -> 480px)
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Large Text Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img
            src="/askbender-text-logo-transparent2.png"
            alt="ask bender"
            className="text-logo-large"
            style={{ 
              maxHeight: '120px', // 50% larger than HomePage (80px -> 120px)
              height: 'auto', 
              width: 'auto',
              maxWidth: '100%', // Mobile responsive
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))',
              animation: 'billiardFloat 35s linear infinite'
            }}
          />
        </div>
        {/* Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '20px',
          padding: '16px'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: message.sender === 'user' 
                  ? theme.buttonPrimary 
                  : theme.cardBorder,
                color: message.sender === 'user' ? 'white' : theme.textPrimary,
                fontSize: '12px',
                fontWeight: '300',
                lineHeight: '1.4'
              }}>
                {message.text}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: theme.cardBorder,
                color: theme.textPrimary,
                fontSize: '12px',
                fontWeight: '300'
              }}>
                AI is typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <TextArea
            ref={chatInputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hey B, Build My Event VisionBoard and Send Quote requests to my chosen Artists/Vendors"
            autoSize={{ minRows: 2, maxRows: 4 }}
            autoFocus
            style={{
              flex: 1,
              border: currentTheme === 'white' ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(255, 255, 255, 0.33)', // 20% grey for white theme, 33% white for others
              background: 'transparent',
              color: currentTheme === 'default' ? '#ffffff !important' : theme.textPrimary,
              fontSize: '12px',
              fontWeight: '300',
              resize: 'none',
              minHeight: '40px',
              paddingLeft: '18px', // Add left padding to give text room from border
              paddingRight: '100px', // Make room for both microphone and send icons
              textShadow: currentTheme === 'default' ? '0 0 1px rgba(255,255,255,0.5)' : 'none'
            }}
            className={`chat-input-rounded ${currentTheme === 'default' ? 'bright-placeholder' : currentTheme === 'compact' ? 'compact-placeholder' : ''}`}
          />
          {/* Microphone icon inside input field */}
          <div
            onClick={() => {
              if (isListening) {
                // Stop listening if already active
                if (recognitionInstance) {
                  recognitionInstance.stop()
                  setIsListening(false)
                  setRecognitionInstance(null)
                }
                return
              }
              startListening()
              // Add visual feedback
              const micElement = document.querySelector('.mic-icon') as HTMLElement
              if (micElement) {
                micElement.style.transform = 'translateY(-50%) scale(1.2)'
                setTimeout(() => {
                  micElement.style.transform = 'translateY(-50%) scale(1)'
                }, 200)
              }
            }}
            className="mic-icon"
                                     style={{
              position: 'absolute',
              right: '45px', // Adjusted for larger icon
              top: '50%', // Centered vertically
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              width: '34px', // 30% larger (26px -> 34px)
              height: '34px', // 30% larger (26px -> 34px)
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
                                     <FaMicrophone
              style={{
                fontSize: '18px', // 30% larger (14px -> 18px)
                color: isListening 
                  ? (currentTheme === 'dark' ? '#ff4d4f' : '#000000') // Red when listening in dark theme, black in others
                  : (currentTheme === 'dark' ? '#1890ff' : '#ffffff'), // Blue when not listening in dark theme, white in others
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
            />
          </div>
          {/* Send icon inside input field */}
          <div
            onClick={handleSendMessage}
            className="send-icon"
            style={{
              position: 'absolute',
              right: '12px', // Position on the far right
              top: '50%', // Centered vertically
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              width: '29px', // 30% larger (22px -> 29px)
              height: '29px', // 30% larger (22px -> 29px)
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              zIndex: 10,
              opacity: (!inputValue.trim() || isTyping) ? 0.5 : 1,
              pointerEvents: (!inputValue.trim() || isTyping) ? 'none' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!(!inputValue.trim() || isTyping)) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <SendOutlined 
              style={{ 
                fontSize: '14px', // 30% larger (11px -> 14px)
                color: '#ffffff' // Always bright white
              }} 
            />
          </div>
        </div>
      </Content>



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
            {/* Header with Apply button and X */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                <Button
                  type="primary"
                  disabled={!hasFiltersChanged()}
                  onClick={() => {
                    // For free users, clear PAID filter values before applying
                    if (userTier === 'fresh_meat') {
                      setGenre('')
                      setDriveMiles('')
                      setCancellationFee('')
                      setMinInitialDeposit('')
                      setMinTotalDeposit('')
                      setAllowsMilestoneDeposits(false)
                      setHasPortablePower(false)
                      setIsUnionCompliant(false)
                      setRequiresDeposit(false)
                    }
                    
                    // Save current filter values as the new applied state
                    setOriginalFilters({
                      searchValue,
                      city,
                      state,
                      country,
                      excludeLoafers,
                      fourStars,
                      genre,
                      driveMiles,
                      hasPortablePower,
                      isUnionCompliant,
                      requiresDeposit,
                      cancellationFee,
                      minInitialDeposit,
                      minTotalDeposit,
                      allowsMilestoneDeposits
                    })
                    // Close the menu after applying
                    setIsMenuVisible(false)
                    // Redirect to search page
                    navigate('/search')
                    console.log('Apply filters clicked')
                  }}
                  style={{
                    minWidth: '90px',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    borderRadius: '88px',
                    background: hasFiltersChanged() ? '#1890ff' : '#d9d9d9',
                    borderColor: hasFiltersChanged() ? '#1890ff' : '#d9d9d9',
                    color: 'white',
                    boxShadow: 'none',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: hasFiltersChanged() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Apply
                </Button>
                <Button
                  type="primary"
                  disabled={!searchValue && !city && !state && !excludeLoafers && !fourStars && !genre && !driveMiles && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits}
                  onClick={() => {
                    setSearchValue('')
                    setCity('')
                    setState('')
                    setCountry('USA')
                    setExcludeLoafers(false)
                    setFourStars(false)
                    setGenre('')
                    setDriveMiles('')
                    setHasPortablePower(false)
                    setIsUnionCompliant(false)
                    setRequiresDeposit(false)
                    setCancellationFee('')
                    setMinInitialDeposit('')
                    setMinTotalDeposit('')
                    setAllowsMilestoneDeposits(false)
                    console.log('Clear all filters clicked')
                  }}
                  style={{
                    minWidth: '90px',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    borderRadius: '88px',
                    background: (!searchValue && !city && !state && !excludeLoafers && !fourStars && !genre && !driveMiles && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits) ? '#fecaca' : '#DC2626',
                    borderColor: (!searchValue && !city && !state && !excludeLoafers && !fourStars && !genre && !driveMiles && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits) ? '#fecaca' : '#DC2626',
                    color: 'white',
                    boxShadow: 'none',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: (!searchValue && !city && !state && !excludeLoafers && !fourStars && !genre && !driveMiles && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Clear
                </Button>
              </div>
              <Button
                type="text"
                onClick={() => setIsMenuVisible(false)}
                style={{ color: '#333', fontSize: '20px', background: 'none', border: 'none', boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
                aria-label="Close menu"
              >
                ✕
              </Button>
            </div>

          {/* Keyword Search */}
          <div style={{ marginBottom: '2px', position: 'relative', border: 'none', background: 'transparent' }}>
            <span style={{
              position: 'absolute',
              left: '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              fontSize: '22px',
              pointerEvents: 'none',
              zIndex: 2
            }}>
              <FaSearch />
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Fun band, Jumpy House, Donut Machine..."
              className="apple-search-input"
              style={{
                width: '100%',
                height: '48px',
                paddingLeft: '36px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#222',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                transition: 'border 0.2s'
              }}
              autoComplete="off"
              ref={searchInputRef}
            />
          </div>

          {/* City and State Fields */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', marginBottom: '2px' }}>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="City"
              className="apple-search-input"
              style={{
                flex: 1,
                height: '48px',
                paddingLeft: '36px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#222',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                transition: 'border 0.2s'
              }}
              autoComplete="off"
            />
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="apple-search-input"
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '36px',
                  paddingRight: '32px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: state ? '#222' : '#888',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                  transition: 'border 0.2s',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textAlignLast: 'left'
                }}
              >
                <option value="" disabled hidden>State</option>
                {stateOptions.map(opt => (
                  <option key={opt} value={opt} style={{ color: '#222', background: '#fff', textAlign: 'left' }}>{opt}</option>
                ))}
              </select>
              {state ? (
                <button
                  onClick={() => setState('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888',
                    fontSize: '12px',
                    pointerEvents: 'none'
                  }}
                >
                  ▼
                </span>
              )}
            </div>
          </div>

          {/* Country Field */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="apple-search-input"
              style={{
                width: '100%',
                height: '48px',
                paddingLeft: '36px',
                paddingRight: '32px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: country ? '#222' : '#888',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                appearance: 'none',
                transition: 'border 0.2s',
                cursor: 'pointer',
                textAlign: 'left',
                textAlignLast: 'left'
              }}
            >
              <option value="" disabled hidden>Country</option>
              <option value="USA" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>USA</option>
              <option value="Canada" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Canada</option>
              <option value="Mexico" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Mexico</option>
            </select>
            {country ? (
              <button
                onClick={() => setCountry('USA')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            ) : (
              <span
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}
              >
                ▼
              </span>
            )}
          </div>

                    {/* FREE FILTERS */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={excludeLoafers}
                onChange={setExcludeLoafers}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: excludeLoafers ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Trusted Vendors
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={fourStars}
                onChange={setFourStars}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: fourStars ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                4 stars or higher
              </span>
            </div>
          </div>

          {/* PAID FILTERS */}
          <TierGate 
            feature="advanced_analytics" 
            userTier={userTier} 
            eventriaTier={eventriaTier}
            showUpgradeButton={false}
            customMessage="This feature isn't for timid little scaredy-cats who can't afford it either."
            showCustomMessage={true}
            onClearValues={() => {
              // Clear all PAID filter values
              setGenre('')
              setDriveMiles('')
              setCancellationFee('')
              setMinInitialDeposit('')
              setMinTotalDeposit('')
              setAllowsMilestoneDeposits(false)
              setHasPortablePower(false)
              setIsUnionCompliant(false)
              setRequiresDeposit(false)
              
              // Force a small delay to ensure state updates properly
              setTimeout(() => {
                setAllowsMilestoneDeposits(false)
                setHasPortablePower(false)
                setIsUnionCompliant(false)
                setRequiresDeposit(false)
              }, 10)
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              {/* Genre Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: genre ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Genre or Ethnicity:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: genre ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="rock" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Rock</option>
                  <option value="jazz" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Jazz</option>
                  <option value="pop" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Pop</option>
                  <option value="country" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Country</option>
                  <option value="classical" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Classical</option>
                </select>
                {genre ? (
                  <button
                    onClick={() => setGenre('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Can Drive Miles Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: driveMiles ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Max Driving Distance:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={driveMiles}
                  onChange={e => setDriveMiles(e.target.value)}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: driveMiles ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="5" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>5 miles</option>
                  <option value="10" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>10 miles</option>
                  <option value="15" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>15 miles</option>
                  <option value="20" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>20 miles</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30 miles</option>
                  <option value="40" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>40 miles</option>
                  <option value="50" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>50 miles</option>
                  <option value="75" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>75 miles</option>
                  <option value="100" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>100 miles</option>
                  <option value="125" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>125 miles</option>
                  <option value="150" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>150 miles</option>
                </select>
                {driveMiles ? (
                  <button
                    onClick={() => setDriveMiles('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Min Days Deposit Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: cancellationFee ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Min Days Deposit due before Event:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={cancellationFee}
                  onChange={e => setCancellationFee(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow typing numbers for quick navigation
                    if (e.key >= '0' && e.key <= '9') {
                      const num = parseInt(e.key)
                      if (num >= 0 && num <= 9) {
                        // Find closest option to typed number
                        const options = [0, 7, 14, 21, 30, 45, 60, 75, 90]
                        const closest = options.reduce((prev, curr) => 
                          Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
                        )
                        setCancellationFee(closest.toString())
                      }
                    }
                  }}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: cancellationFee ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="0" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>0 days</option>
                  <option value="7" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>7 days</option>
                  <option value="14" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>14 days</option>
                  <option value="21" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>21 days</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30 days</option>
                  <option value="45" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>45 days</option>
                  <option value="60" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>60 days</option>
                  <option value="75" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>75 days</option>
                  <option value="90" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>90 days</option>
                </select>
                {cancellationFee ? (
                  <button
                    onClick={() => setCancellationFee('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Has Portable Power Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={hasPortablePower}
                onChange={setHasPortablePower}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: hasPortablePower ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Has portable power source for outdoor event
              </span>
            </div>

            {/* Is Union Compliant Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={isUnionCompliant}
                onChange={setIsUnionCompliant}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: isUnionCompliant ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Is Union-compliant
              </span>
            </div>

            {/* Requires Deposit Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={requiresDeposit}
                onChange={setRequiresDeposit}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: requiresDeposit ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Requires Deposit at least 30 days before event
              </span>
            </div>

            {/* Min Initial Deposit Amount Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: minInitialDeposit ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Minimum Initial Deposit Amount:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={minInitialDeposit}
                  onChange={e => setMinInitialDeposit(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow typing numbers for quick navigation
                    if (e.key >= '0' && e.key <= '9') {
                      const num = parseInt(e.key)
                      if (num >= 0 && num <= 9) {
                        // Find closest option to typed number
                        const options = [10, 15, 20, 25, 30, 35, 40, 45, 50]
                        const closest = options.reduce((prev, curr) => 
                          Math.abs(curr - num * 10) < Math.abs(prev - num * 10) ? curr : prev
                        )
                        setMinInitialDeposit(closest.toString())
                      }
                    }
                  }}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: minInitialDeposit ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="10" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>10%</option>
                  <option value="15" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>15%</option>
                  <option value="20" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>20%</option>
                  <option value="25" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>25%</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30%</option>
                  <option value="35" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>35%</option>
                  <option value="40" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>40%</option>
                  <option value="45" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>45%</option>
                  <option value="50" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>50%</option>
                </select>
                {minInitialDeposit ? (
                  <button
                    onClick={() => setMinInitialDeposit('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Min Total Deposit Amount Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: minTotalDeposit ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Minimum Total Deposit Amount:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={minTotalDeposit}
                  onChange={e => setMinTotalDeposit(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow typing numbers for quick navigation
                    if (e.key >= '0' && e.key <= '9') {
                      const num = parseInt(e.key)
                      if (num >= 0 && num <= 9) {
                        // Find closest option to typed number
                        const options = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
                        const closest = options.reduce((prev, curr) => 
                          Math.abs(curr - num * 10) < Math.abs(prev - num * 10) ? curr : prev
                        )
                        setMinTotalDeposit(closest.toString())
                      }
                    }
                  }}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: minTotalDeposit ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="25" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>25%</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30%</option>
                  <option value="35" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>35%</option>
                  <option value="40" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>40%</option>
                  <option value="45" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>45%</option>
                  <option value="50" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>50%</option>
                  <option value="55" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>55%</option>
                  <option value="60" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>60%</option>
                  <option value="65" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>65%</option>
                  <option value="70" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>70%</option>
                  <option value="75" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>75%</option>
                  <option value="80" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>80%</option>
                  <option value="85" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>85%</option>
                  <option value="90" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>90%</option>
                  <option value="95" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>95%</option>
                  <option value="100" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>100%</option>
                </select>
                {minTotalDeposit ? (
                  <button
                    onClick={() => setMinTotalDeposit('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Allows Milestone Deposits Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={allowsMilestoneDeposits}
                onChange={setAllowsMilestoneDeposits}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: allowsMilestoneDeposits ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Allows Milestone Deposits
              </span>
            </div>
          </div>
          </TierGate>
          </div>
        </>
      )}
      {/* Footer */}
      <div style={{ 
        background: 'transparent',
        padding: 0,
        height: '27px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          maxWidth: '1400px',
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
      </div>
    </Layout>
  )
} 