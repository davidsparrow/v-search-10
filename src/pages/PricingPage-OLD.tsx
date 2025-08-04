import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { useCloudStore } from '../store/cloudStore'
import { MainPageTemplate } from '../components/templates/MainPageTemplate'
import { ProfileMenuTemplate } from '../components/menus/ProfileMenuTemplate'
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
import { AskBenderTier } from '../types/askbender'

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
  const [textLogoError, setTextLogoError] = useState(false)
  const [eventriaLogoError, setEventriaLogoError] = useState(false)
  
  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')

  // Menu handlers
  const handleOpenMenu = () => {
    setIsMenuVisible(true)
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

      {/* ProfileMenuTemplate */}
      <ProfileMenuTemplate
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        userLevel={userTier}
      />
    </MainPageTemplate>
  )
} 