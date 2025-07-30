import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Layout, Row, Col } from 'antd'
import { useCloudStore } from '../store/cloudStore'

const { Header, Content } = Layout

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
        const currentAction = actionWords[currentActionIndex]
        const currentTime = timeWords[currentTimeIndex]
        const fullText = `${currentAction} ${currentTime}`
        
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
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

export function PricingPage() {
  const navigate = useNavigate()
  const { currentTheme } = useCloudStore()

  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: currentTheme === 'dark' ? '#001529' : '#ffffff'
    }}>
      {/* Header */}
      <Header style={{
        background: 'transparent',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            color: currentTheme === 'dark' ? '#ffffff' : '#000000',
            cursor: 'pointer'
          }}>
            <TypingAnimation />
          </div>
        </div>

        {/* Empty right side - no icons */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
        </div>
      </Header>

      {/* Content */}
      <Content style={{ 
        padding: '24px',
        background: 'transparent',
        height: 'calc(100vh - 64px)',
        overflow: 'auto'
      }}>
        <Row style={{ minHeight: '100%' }} gutter={8}>
          <Col span={24}>
            <div style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              {/* Pricing content will go here */}
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: currentTheme === 'dark' ? '#ffffff' : '#000000',
                marginBottom: '24px'
              }}>
                Pricing
              </h1>
              
              {/* Pricing details will be added in the next step */}
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
} 