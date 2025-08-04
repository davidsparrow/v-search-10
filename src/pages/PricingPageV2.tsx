import { useState } from 'react'
import { Button } from 'antd'
import { useCloudStore } from '../store/cloudStore'
import { PricingPageTemplate } from '../components/templates/PricingPageTemplate'
import { ProfileMenuTemplate } from '../components/menus/ProfileMenuTemplate'
import { GiChicken, GiLoveHowl } from 'react-icons/gi'
import { IoMdBeer } from 'react-icons/io'
import { AskBenderTier } from '../types/askbender'

export function PricingPageV2() {
  const { 
    currentTheme, 
    getThemeConfig
  } = useCloudStore()

  const theme = getThemeConfig()

  // State for logo error handling
  const [textLogoError, setTextLogoError] = useState(false)
  
  // Menu state
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  
  // Tier system state
  const [userTier] = useState<AskBenderTier>('fresh_meat')
  
  const handleOpenMenu = () => {
    setIsMenuVisible(true) // Trigger menu visibility
  }

      return (
      <PricingPageTemplate onMenuClick={handleOpenMenu}>
      {/* Top Black Section Content */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>

        {/* AskBender Logo */}
        <div style={{ 
          marginBottom: '80px',
          marginTop: '-50px',
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

        {/* Responsive Pricing Layout */}
        <div className="pricing-grid-responsive">
          {/* Column 1: Free Range */}
          <div style={{ 
            padding: '20px',
            position: 'relative',
            border: currentTheme === 'white' ? '1px solid #666666' : '1px solid white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Free Range Tier */}
            <div style={{
              padding: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Icon behind title */}
              <div style={{
                position: 'absolute',
                top: '-70px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '86px',
                color: currentTheme === 'compact' ? '#b9db4d' : '#ff914d',
                zIndex: 2
              }}>
                <GiChicken />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 2,
                marginTop: '10px'
              }}>
                <h3 style={{
                  color: theme.textPrimary,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '4px'
                }}>
                  FREE RANGE
                </h3>
                <p style={{
                  color: currentTheme === 'dark' ? 'white' : theme.textSecondary,
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  margin: '0 0 16px 0',
                  fontWeight: 'bold'
                }}>
                  Get a taste of the chill-chick life. Drop (on) Evite. Then rage about $7/month.
                </p>
              </div>
              <ul style={{
                color: currentTheme === 'dark' ? 'white' : theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.3',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                marginBottom: '16px',
                paddingLeft: '16px',
                textAlign: 'left'
              }}>
                <li style={{ marginBottom: '8px' }}>• 1 quiz, 20 participants max</li>
                <li style={{ marginBottom: '8px' }}>• Basic quiz creation</li>
                <li style={{ marginBottom: '8px' }}>• Professional mode</li>
                <li style={{ marginBottom: '8px' }}>• SMS delivery</li>
                <li style={{ marginBottom: '8px' }}>• Email fallback</li>
                <li style={{ marginBottom: '8px' }}>• Basic analytics</li>
              </ul>
              <div style={{ 
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <span style={{
                  color: theme.textPrimary,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  FREE
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500',
                    boxShadow: currentTheme === 'dark' ? 'none' : undefined
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Column 2: FREE BEER (Highlighted) */}
          <div style={{ 
            padding: '20px',
            position: 'relative',
            background: '#722ED1',
            borderRadius: '12px',
            border: currentTheme === 'white' ? '1px solid #666666' : '1px solid white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            {/* FREE BEER Tier */}
            <div style={{
              padding: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Icon behind title */}
              <div style={{
                position: 'absolute',
                top: '-70px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '86px',
                color: currentTheme === 'compact' ? '#b9db4d' : '#ff914d',
                zIndex: 2
              }}>
                <IoMdBeer />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 2,
                marginTop: '10px'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '4px'
                }}>
                  FREE BEER
                </h3>
                <p style={{
                  color: 'white',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  margin: '0 0 16px 0',
                  fontWeight: 'bold'
                }}>
                  Get drunk. On the power of our AI. Puke mostly all over Partiful. Upgrade for a logo-towel (you need it).
                </p>
              </div>
              <ul style={{
                color: 'white',
                fontSize: '12px',
                lineHeight: '1.3',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                marginBottom: '16px',
                paddingLeft: '16px',
                textAlign: 'left'
              }}>
                <li style={{ marginBottom: '8px' }}>• Unlimited quizzes, 100 participants</li>
                <li style={{ marginBottom: '8px' }}>• All Free Range features</li>
                <li style={{ marginBottom: '8px' }}>• Memory retention basic</li>
                <li style={{ marginBottom: '8px' }}>• Answer recycling</li>
                <li style={{ marginBottom: '8px' }}>• Cross-domain access</li>
              </ul>
              <div style={{ 
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  $7/month
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: 'white',
                    borderColor: 'white',
                    color: '#722ED1',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Column 3: FREE LOVE */}
          <div style={{ 
            padding: '20px',
            position: 'relative',
            border: currentTheme === 'white' ? '1px solid #666666' : '1px solid white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            {/* FREE LOVE Tier */}
            <div style={{
              padding: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Icon behind title */}
              <div style={{
                position: 'absolute',
                top: '-70px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '86px',
                color: currentTheme === 'compact' ? '#b9db4d' : '#ff914d',
                zIndex: 2
              }}>
                <GiLoveHowl />
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 2,
                marginTop: '10px'
              }}>
                <h3 style={{
                  color: theme.textPrimary,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '4px'
                }}>
                  FREE LOVE
                </h3>
                <p style={{
                  color: currentTheme === 'dark' ? 'white' : theme.textSecondary,
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  margin: '0 0 16px 0',
                  fontWeight: 'bold'
                }}>
                  Make actual magic, memories and friends. Live like the rockstar you really are.
                </p>
              </div>
              <ul style={{
                color: currentTheme === 'dark' ? 'white' : theme.textSecondary,
                fontSize: '12px',
                lineHeight: '1.3',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                marginBottom: '16px',
                paddingLeft: '16px',
                textAlign: 'left'
              }}>
                <li style={{ marginBottom: '8px' }}>• Logo-towel</li>
                <li style={{ marginBottom: '8px' }}>• Unlimited quizzes, 500 participants</li>
                <li style={{ marginBottom: '8px' }}>• All FREE BEER features</li>
                <li style={{ marginBottom: '8px' }}>• Memory retention advanced</li>
                <li style={{ marginBottom: '8px' }}>• Advanced analytics</li>
                <li style={{ marginBottom: '8px' }}>• Custom grammar rules</li>
                <li style={{ marginBottom: '8px' }}>• Priority support</li>
              </ul>
              <div style={{ 
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <span style={{
                  color: theme.textPrimary,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  $27/month
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  style={{
                    background: '#DC2626',
                    borderColor: '#DC2626',
                    borderRadius: '8px',
                    fontWeight: '500',
                    boxShadow: currentTheme === 'dark' ? 'none' : undefined
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
        onClose={() => {
          setIsMenuVisible(false)
        }}
        userLevel={userTier}
      />

    </PricingPageTemplate>
  )
} 