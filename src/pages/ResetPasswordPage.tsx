import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Input, Button, Typography, Row, Col, Divider } from 'antd'
import { useCloudStore } from '../store/cloudStore'
import { supabase } from '../lib/supabase'

const { Header, Content, Footer } = Layout
const { Title } = Typography

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getThemeConfig } = useCloudStore()
  const theme = getThemeConfig()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const [tokenType, setTokenType] = useState('')

  useEffect(() => {
    // Extract access_token and type from URL (support both hash and query string)
    let access_token = ''
    let type = ''
    if (location.hash && location.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(location.hash.replace('#', '?'))
      access_token = hashParams.get('access_token') || ''
      type = hashParams.get('type') || ''
    } else if (location.search && location.search.includes('access_token')) {
      const searchParams = new URLSearchParams(location.search)
      access_token = searchParams.get('access_token') || ''
      type = searchParams.get('type') || ''
    }
    setToken(access_token)
    setTokenType(type)
  }, [location.hash, location.search])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const handleSubmit = async () => {
    setError('')
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password }, { accessToken: token })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: theme.background }}>
      <Header style={{ background: theme.headerBackground, borderBottom: `1px solid ${theme.headerBorder}` }}>
        <div style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
          BenderSaaS
        </div>
      </Header>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
        {/* DEBUG INFO FOR TROUBLESHOOTING */}
        <div style={{ position: 'absolute', top: 0, right: 0, background: '#222', color: '#fff', padding: 8, zIndex: 1000, fontSize: 12 }}>
          <div><b>DEBUG:</b></div>
          <div>location.hash: {location.hash}</div>
          <div>location.search: {location.search}</div>
          <div>token: {token}</div>
          <div>tokenType: {tokenType}</div>
        </div>
        <Row style={{ width: '100%' }} justify="center">
          <Col xs={22} sm={16} md={10} lg={8} xl={6} style={{ background: theme.cardBackground, borderRadius: 12, boxShadow: theme.cardShadow, padding: 32, marginTop: 48 }}>
            <Title level={3} style={{ textAlign: 'center', color: theme.textPrimary, marginBottom: 24 }}>Reset Your Password</Title>
            <Divider />
            {success ? (
              <div style={{ color: '#52c41a', textAlign: 'center', margin: '24px 0' }}>
                Password updated! Redirecting to Home Page...
              </div>
            ) : (
              <>
                <Input.Password
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ marginBottom: 16 }}
                  disabled={loading}
                />
                <Input.Password
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ marginBottom: 16 }}
                  disabled={loading}
                />
                {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
                <Button
                  type="primary"
                  block
                  loading={loading}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Set New Password
                </Button>
              </>
            )}
          </Col>
        </Row>
      </Content>
      <Footer style={{ background: theme.headerBackground, borderTop: `1px solid ${theme.headerBorder}`, padding: '8px 24px', height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '1400px', width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: '4px', fontSize: '10px', color: theme.textSecondary }}>
            <span style={{ cursor: 'pointer', marginRight: '16px' }}>Contact</span>
            <span style={{ cursor: 'pointer', marginRight: '16px' }}>Press</span>
            <span style={{ cursor: 'pointer', marginRight: '16px' }}>Boozeletter</span>
            <span style={{ cursor: 'pointer', marginRight: '16px' }}>Terms</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
          </div>
          <div style={{ fontSize: '10px', color: theme.textSecondary }}>
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
    </Layout>
  )
} 