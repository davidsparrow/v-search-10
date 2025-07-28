import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Layout, Typography, Space, Avatar } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
import { useCloudStore } from '../store/cloudStore'

const { Header, Content, Footer } = Layout
const { TextArea } = Input
const { Title, Text } = Typography

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export function StartSearchPage() {
  const navigate = useNavigate()
  const { currentTheme, getThemeConfig } = useCloudStore()
  const theme = getThemeConfig()
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI assistant. What kind of event or service are you looking for today? I can help you find the perfect local businesses.",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I understand you're looking for that! Let me search our database for the best matches. I'll redirect you to the visual search interface where you can explore the results.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
      
      // Auto-redirect to search results after a short delay
      setTimeout(() => {
        navigate('/search')
      }, 2000)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: theme.background }}>
      {/* Header */}
      <Header style={{
        background: theme.headerBackground,
        borderBottom: `1px solid ${theme.headerBorder}`,
        padding: '0 24px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '1400px',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Text Logo */}
          <img
            src="/askbender-text-logo-transparent2.png"
            alt="ask bender"
            style={{
              maxHeight: '60px',
              height: 'auto',
              width: 'auto'
            }}
          />
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{ 
        height: 'calc(100vh - 80px - 60px)', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Chat Interface */}
          <div style={{
            flex: 1,
            background: theme.cardBackground,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.cardBorder}`,
              background: theme.headerBackground
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Avatar 
                  icon={<RobotOutlined />} 
                  style={{ 
                    background: theme.logoAccentColor,
                    color: 'white'
                  }} 
                />
                <div>
                  <Title level={4} style={{ 
                    margin: 0, 
                    color: theme.textPrimary,
                    fontSize: '18px'
                  }}>
                    AI Assistant
                  </Title>
                  <Text style={{ 
                    color: theme.textSecondary,
                    fontSize: '14px'
                  }}>
                    Ready to help you find the perfect services
                  </Text>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    gap: '12px'
                  }}
                >
                  {message.type === 'ai' && (
                    <Avatar 
                      icon={<RobotOutlined />} 
                      size="small"
                      style={{ 
                        background: theme.logoAccentColor,
                        color: 'white',
                        flexShrink: 0
                      }} 
                    />
                  )}
                  
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: message.type === 'user' 
                      ? theme.logoAccentColor 
                      : theme.cardBackground,
                    border: message.type === 'ai' ? `1px solid ${theme.cardBorder}` : 'none',
                    color: message.type === 'user' ? 'white' : theme.textPrimary,
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {message.content}
                  </div>

                  {message.type === 'user' && (
                    <Avatar 
                      icon={<UserOutlined />} 
                      size="small"
                      style={{ 
                        background: theme.textSecondary,
                        color: 'white',
                        flexShrink: 0
                      }} 
                    />
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '12px'
                }}>
                  <Avatar 
                    icon={<RobotOutlined />} 
                    size="small"
                    style={{ 
                      background: theme.logoAccentColor,
                      color: 'white',
                      flexShrink: 0
                    }} 
                  />
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.textSecondary,
                    fontSize: '14px'
                  }}>
                    <span style={{ animation: 'blink 1s infinite' }}>AI is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{
              padding: '20px',
              borderTop: `1px solid ${theme.cardBorder}`,
              background: theme.headerBackground
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you're looking for..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{
                    background: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.textPrimary,
                    borderRadius: '12px',
                    resize: 'none'
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  style={{
                    background: theme.logoAccentColor,
                    borderColor: theme.logoAccentColor,
                    borderRadius: '12px',
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{
        background: theme.headerBackground,
        borderTop: `1px solid ${theme.headerBorder}`,
        padding: '8px 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '1400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <Text style={{
            fontSize: '12px',
            color: theme.textSecondary
          }}>
            © 2025 bendersaas.ai all rights reserved
          </Text>
        </div>
      </Footer>
    </Layout>
  )
} 