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
import { MainHeader } from '../components/headers/MainHeader'
import { SearchMenuTemplate } from '../components/menus/SearchMenuTemplate'
import { getSessionLogo, preloadSessionLogo, getFallbackLogo } from '../lib/logoManager'

const { Header, Content } = Layout
const { TextArea } = Input
const { } = Typography

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export function SearchChatPage() {
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
  const [sessionLogo, setSessionLogo] = useState<string>('')
  const [logoLoaded, setLogoLoaded] = useState(false)
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Ready to crush this whole Event thing without actually working?',
      sender: 'user',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatInputRef = useRef<any>(null)
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false)
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null)
  
  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')
  const [eventriaTier] = useState<string | undefined>(undefined)
  
  // Preload session logo on component mount
  useEffect(() => {
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
  
  const handleThemeChange = (theme: 'default' | 'dark' | 'compact' | 'white') => {
    setTheme(theme)
  }
  
  const handleOpenMenu = () => {
    setIsMenuVisible(true)
  }
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return
    
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
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand you\'re looking for vendors. Let me help you with that!',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 2000)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported')
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      setIsListening(true)
      setRecognitionInstance(recognition)
    }
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue(transcript)
      setIsListening(false)
      setRecognitionInstance(null)
    }
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setRecognitionInstance(null)
    }
    
    recognition.onend = () => {
      setIsListening(false)
      setRecognitionInstance(null)
    }
    
    recognition.start()
  }
  
  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [recognitionInstance])

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: theme.background }}>
      {/* MainHeader Component */}
      <MainHeader
        showThemeIcons={true}
        showSettingsIcon={true}
        onMenuClick={handleOpenMenu}
      />

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
            src={sessionLogo}
            alt="ask bender"
            className="text-logo-large"
            style={{ 
              maxHeight: '120px', // 50% larger than HomePage (80px -> 120px)
              height: 'auto', 
              width: 'auto',
              maxWidth: '100%', // Mobile responsive
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))',
              animation: 'billiardFloat 35s linear infinite',
              opacity: logoLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
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
                fontSize: '13px',
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
            placeholder="Hey B, Build My Event VisionBoard and Send Quote requests to my chosen Artists and Vendors"
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
            className={`chat-input-rounded ${currentTheme === 'default' ? 'bright-placeholder' : currentTheme === 'compact' ? 'compact-placeholder' : 'dim-placeholder'}`}
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
                fontSize: '16px', // 30% larger (12px -> 16px)
                color: currentTheme === 'dark' ? '#1890ff' : '#ffffff'
              }}
            />
          </div>
        </div>
      </Content>

      {/* SearchMenuTemplate */}
      <SearchMenuTemplate
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        userLevel={userTier}
        eventriaTier={eventriaTier}
        onApplyFilters={(filters) => {
          console.log('Filters applied:', filters)
          // Handle filter application here
          setIsMenuVisible(false)
                              navigate('/search-visual')
        }}
      />

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