import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { useCloudStore } from '../store/cloudStore'
import { MainPageTemplate } from '../components/templates/MainPageTemplate'
import { TypingAnimation } from '../components/common/TypingAnimation'
import { 
  FireOutlined, 
  RocketOutlined, 
  CrownOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { GiMeatCleaver, GiSeatedMouse, GiChicken, GiGraduateCap, GiFrenchFries } from 'react-icons/gi'

export function PricingPage() {
  const navigate = useNavigate()
  const { 
    currentTheme, 
    getThemeConfig,
    user
  } = useCloudStore()

  const theme = getThemeConfig()

  // State for modal and menu
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('links')
  const [textLogoError, setTextLogoError] = useState(false)
  const [eventriaLogoError, setEventriaLogoError] = useState(false)

  // Menu handlers
  const handleCloseMenu = () => {
    setIsMenuVisible(false)
  }

  const handleOpenMenu = () => {
    setIsMenuVisible(true)
    setActiveTab('links')
  }

  return (
    <MainPageTemplate onMenuClick={handleOpenMenu}>
      {/* Main Content Area */}
      <div style={{ 
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '40px 20px',
        textAlign: 'center',
        overflow: 'auto'
      }}>


        {/* Two Column Pricing Layout */}
        <div style={{
          maxWidth: '900px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(375px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* AskBender Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AskBender Logo */}
            <div style={{ 
              marginBottom: '10px',
              marginTop: '-9px',
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
                    maxWidth: '216px',
                    width: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
                  }}
                  onError={() => setTextLogoError(true)}
                />
              ) : (
                <div 
                  style={{ 
                    fontSize: '24px',
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
            


            {/* AskBender Tier Cards - Stacked from FREE to expensive */}
            <div style={{
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon behind title - 3x larger */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                fontSize: '36px',
                color: '#FFEB3B',
                opacity: '0.8',
                zIndex: 0
              }}>
                <GiChicken />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <h3 style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Free Range
                </h3>
                <span style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  FREE
                </span>
              </div>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                1 quiz, 20 participants max. Basic quiz creation, professional mode, SMS delivery, email fallback, basic analytics, viral content.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <div style={{
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon behind title - 3x larger */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                fontSize: '36px',
                color: '#FF6B35',
                opacity: '0.8',
                zIndex: 0
              }}>
                <GiMeatCleaver />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <h3 style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Fresh Meat
                </h3>
                <span style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  $7/month
                </span>
              </div>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                Unlimited quizzes, 100 participants max. All Fresh Meat features plus memory retention basic, answer recycling, cross-domain access.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <div style={{
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon behind title - 3x larger */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                fontSize: '36px',
                color: '#722ED1',
                opacity: '0.8',
                zIndex: 0
              }}>
                <GiGraduateCap />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <h3 style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Sophomore
                </h3>
                <span style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  $27/month
                </span>
              </div>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                Unlimited quizzes, 500 participants max. All Lab Rat features plus memory retention advanced, advanced analytics, custom grammar rules, priority support.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <div style={{
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon behind title - 3x larger */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                fontSize: '36px',
                color: '#FF8C42',
                opacity: '0.8',
                zIndex: 0
              }}>
                <GiFrenchFries />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 1
              }}>
                <h3 style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Employed
                </h3>
                <span style={{
                  color: theme.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  $97/month
                </span>
              </div>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                Unlimited quizzes, 500 participants max. All Lab Rat features plus memory retention advanced, advanced analytics, custom grammar rules, priority support, plus 1 t-shirt.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Eventria.ai Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Eventria.ai Logo */}
            <div style={{ 
              marginBottom: '20px',
              textAlign: 'center',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {!eventriaLogoError ? (
                <img
                  src="/eventria logo pink.png"
                  alt="eventria"
                  style={{
                    maxWidth: '180px',
                    width: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
                  }}
                  onError={() => setEventriaLogoError(true)}
                />
              ) : (
                <div 
                  style={{ 
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#FF69B4',
                    fontFamily: 'Poppins, sans-serif',
                    display: 'inline-block'
                  }}
                >
                  eventria
                </div>
              )}
            </div>
            


            {/* Eventria.ai Tier Cards - Stacked from FREE to expensive */}
            <div style={{
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon in upper left corner */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                fontSize: '20px',
                color: '#52C41A'
              }}>
                <StarOutlined />
              </div>
              
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif',
                paddingLeft: '40px'
              }}>
                Free (FREE)
              </h3>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                Basic event management features. Get started with simple events and basic planning tools.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <div style={{
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon in upper left corner */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                fontSize: '20px',
                color: '#722ED1'
              }}>
                <ThunderboltOutlined />
              </div>
              
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif',
                paddingLeft: '40px'
              }}>
                Lightweight (Coming Soon)
              </h3>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                Enhanced event planning tools and analytics. For professional event planners and organizers.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <div style={{
              background: theme.cardBackground,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'left',
              position: 'relative'
            }}>
              {/* Icon in upper left corner */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                fontSize: '20px',
                color: '#FA8C16'
              }}>
                <TrophyOutlined />
              </div>
              
              <h3 style={{
                color: theme.textPrimary,
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '12px',
                fontFamily: 'Poppins, sans-serif',
                paddingLeft: '40px'
              }}>
                Heavyweight (Coming Soon)
              </h3>
              <p style={{
                color: theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px'
              }}>
                Complete event management suite with advanced features, custom integrations, and priority support.
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                        Free Tier ($0.00/month)
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
    </MainPageTemplate>
  )
} 