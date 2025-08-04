import { useState, useEffect } from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { AvatarComponent } from '../AvatarComponent'
import { useCloudStore } from '../../store/cloudStore'
import { getTierDisplayName, getTierPrice, AskBenderTier } from '../../types/askbender'
import { supabase } from '../../lib/supabase'

interface ProfileMenuTemplateProps {
  isVisible: boolean
  onClose: () => void
  userLevel?: AskBenderTier
  customContent?: React.ReactNode
}

export function ProfileMenuTemplate({ 
  isVisible, 
  onClose, 
  userLevel = 'fresh_meat',
  customContent 
}: ProfileMenuTemplateProps) {
  const { user } = useCloudStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('links')
  const [participantData, setParticipantData] = useState<{
    nickname?: string;
    email?: string;
    phone_number?: string;
  } | null>(null)

  // Fetch participant data when component mounts or user changes
  useEffect(() => {
    const fetchParticipantData = async () => {
      if (!user?.email) return

      try {
        // First try to find by email
        let { data, error } = await supabase
          .from('participants')
          .select('id, nickname, email, phone_number, created_at')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)

        // If no match by email and user has phone, try by phone
        if (!data || data.length === 0) {
          const authUser = await supabase.auth.getUser()
          if (authUser.data.user?.phone) {
            const { data: phoneData, error: phoneError } = await supabase
              .from('participants')
              .select('id, nickname, email, phone_number, created_at')
              .eq('phone_number', authUser.data.user.phone)
              .order('created_at', { ascending: false })
              .limit(1)
            
            if (phoneData && phoneData.length > 0) {
              data = phoneData
              error = phoneError
            }
          }
        }

        if (data && data.length > 0) {
          // Use the newest participant (already ordered by created_at desc)
          const participant = data[0]
          setParticipantData({
            nickname: participant.nickname,
            email: participant.email,
            phone_number: participant.phone_number
          })

          // Log if multiple participants found with same email
          if (data.length > 1) {
            console.warn('Multiple participants found with same email/phone:', {
              email: user.email,
              participantIds: data.map(p => p.id),
              usingNewest: participant.id,
              refId: 'PROFILE_MENU_MULTIPLE_PARTICIPANTS'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching participant data:', error)
      }
    }

    fetchParticipantData()
  }, [user?.email])

  if (!isVisible) return null

  return (
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
        onClick={onClose}
      />
      
      {/* Menu Panel */}
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          width: '100%', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            gap: '16px' 
          }}>
            {/* User Avatar */}
            <AvatarComponent 
              size={128}
              onAvatarChange={(avatarUrl) => {
                console.log('Avatar updated:', avatarUrl)
              }}
            />
            {/* Username */}
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '300',
              color: '#222',
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '1px'
            }}>
              <span>{participantData?.nickname || 'My Nickname'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
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
              aria-label="Close menu"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div style={{ minHeight: '150px' }}>
          {activeTab === 'links' && (
            <div>
              {/* Stacked Text Links */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
              }}>
                {/* Core menu items */}
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

                {/* Profile-specific items */}
                {/* 
                  NOTE: These items are currently shown on ALL pages using ProfileMenuTemplate.
                  To display menu items conditionally per page, add a pageType prop and use:
                  
                  {pageType === 'home' && (
                    <>
                      <span>Press</span>
                      <span>Boozeletter</span>
                      <span>Support</span>
                      <span>Terms</span>
                      <span>Privacy</span>
                    </>
                  )}
                  
                  Then pass pageType when using ProfileMenuTemplate:
                  <ProfileMenuTemplate pageType="home" ... />
                */}
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
                  onClick={() => navigate('/pricing')}
                >
                  Pricing
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
                  onClick={() => navigate('/terms')}
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
                  onClick={() => navigate('/privacy')}
                >
                  Privacy
                </span>

                {/* User-level specific items removed */}

                {/* Custom content if provided */}
                {customContent}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              {/* Tab Header with Close Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>
                  Account Profile
                </h3>
                <Button
                  type="text"
                  onClick={() => setActiveTab('links')}
                  style={{ 
                    color: '#666', 
                    fontSize: '18px', 
                    background: 'none', 
                    border: 'none', 
                    boxShadow: 'none', 
                    outline: 'none', 
                    cursor: 'pointer' 
                  }}
                  aria-label="Close tab"
                >
                  ✕
                </Button>
              </div>

              {/* Email */}
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
                    Email:
                  </span>
                  <span style={{
                    color: '#222',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {participantData?.email || user?.email || 'Not set'}
                  </span>
                </div>
              </div>

              {/* Phone Number */}
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
                    Phone:
                  </span>
                  <span style={{
                    color: '#222',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {participantData?.phone_number || 'Not set'}
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
                    {getTierDisplayName(userLevel)} (${(getTierPrice(userLevel) / 100).toFixed(2)}/month)
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
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>
                  Settings
                </h3>
                <Button
                  type="text"
                  onClick={() => setActiveTab('links')}
                  style={{ 
                    color: '#666', 
                    fontSize: '18px', 
                    background: 'none', 
                    border: 'none', 
                    boxShadow: 'none', 
                    outline: 'none', 
                    cursor: 'pointer' 
                  }}
                  aria-label="Close tab"
                >
                  ✕
                </Button>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Settings content coming soon...
              </p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              {/* Tab Header with Close Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#222' }}>
                  Billing
                </h3>
                <Button
                  type="text"
                  onClick={() => setActiveTab('links')}
                  style={{ 
                    color: '#666', 
                    fontSize: '18px', 
                    background: 'none', 
                    border: 'none', 
                    boxShadow: 'none', 
                    outline: 'none', 
                    cursor: 'pointer' 
                  }}
                  aria-label="Close tab"
                >
                  ✕
                </Button>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Billing content coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 