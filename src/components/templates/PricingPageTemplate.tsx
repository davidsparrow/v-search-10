import { ReactNode } from 'react'
import { Button } from 'antd'
import { useCloudStore } from '../../store/cloudStore'
import { MainHeader } from '../headers/MainHeader'

interface PricingPageTemplateProps {
  children: ReactNode
  showSettingsIcon?: boolean
  onMenuClick?: () => void
}

export function PricingPageTemplate({ 
  children, 
  showSettingsIcon = true,
  onMenuClick
}: PricingPageTemplateProps) {
  const { getThemeConfig } = useCloudStore()
  const theme = getThemeConfig()

  return (
    <div style={{ 
      minHeight: '100vh',
      background: theme.background,
      overflow: 'auto'
    }}>
      {/* Header */}
      <MainHeader 
        showSettingsIcon={showSettingsIcon}
        onMenuClick={onMenuClick}
      />

      {/* Top Black Section */}
      <div style={{
        width: '100%',
        background: '#000000',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        {children}
      </div>

      {/* Bottom Wavy Section */}
      <div style={{
        width: '100%',
        background: '#121212',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 30 50 50 T100 50 T150 50 T200 50' stroke='rgba(255,255,255,0.1)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 30 Q25 10 50 30 T100 30 T150 30 T200 30' stroke='rgba(255,255,255,0.06)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 70 Q25 50 50 70 T100 70 T150 70 T200 70' stroke='rgba(255,255,255,0.06)' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        borderTop: '6px solid #000000'
      }}>
        {/* Eventria Info Blurb */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            width: '500px',
            background: 'transparent',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center'
          }}>
            {/* Eventria Logo */}
            <div style={{
              marginBottom: '30px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img
                src="/eventria _logo_green.png"
                alt="eventria"
                style={{
                  maxWidth: '300px',
                  width: '100%',
                  height: 'auto'
                }}
                onError={() => {
                  // Fallback to text if image fails to load
                  const img = document.querySelector('img[alt="eventria"]') as HTMLImageElement;
                  if (img) {
                    img.style.display = 'none';
                    const fallback = img.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }
                }}
              />
              <div style={{
                display: 'none',
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#90EE90',
                fontFamily: 'Poppins, sans-serif',
                textShadow: '2px 2px 4px rgba(139, 0, 0, 0.8)'
              }}>
                eventria
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              color: theme.textPrimary,
              fontSize: '28px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              marginBottom: '16px'
            }}>
              Ready to Build Your Vision?
            </h2>

            {/* Subtitle */}
            <p style={{
              color: theme.textSecondary,
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Love your job again, trade Excel for Freedom.
            </p>

            {/* Description */}
            <p style={{
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Poppins, sans-serif',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              It's 2025. Finally, you can manage events like a God. Point, click, or talk & 🚀...Floorplan magic! → 🚀...Automatic Vendor Bid requests → 🚀...New Quotes are on the way back to you. Track shifts, payroll, and inventory without cludgy UI/UX. SMS for your staff, no APP needed.
            </p>

            {/* Build My Vision Button */}
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                style={{
                  background: '#722ED1',
                  borderColor: '#722ED1',
                  color: '#ffffff',
                  borderRadius: '77px',
                  fontWeight: '600',
                  fontSize: '16px',
                  padding: '12px 32px',
                  height: 'auto',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                }}
                onClick={() => window.open('https://eventria.ai', '_blank')}
              >
                🧠⚡️🗺🎨✏️📤🧾✍️💰🎉 for me
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div style={{
        width: '100%',
        background: '#000000',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #333333'
      }}>
        <p style={{
          color: '#666666',
          fontSize: '10px',
          fontFamily: 'Poppins, sans-serif',
          margin: '0',
          lineHeight: '17px'
        }}>
          © 2025 bendersaas.ai&nbsp;&nbsp;&nbsp;&nbsp;
          <span 
            style={{ 
              color: '#666666',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => window.open('/privacy', '_blank')}
          >
            privacy
          </span>
          &nbsp;&nbsp;
          <span 
            style={{ 
              color: '#666666',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => window.open('/terms', '_blank')}
          >
            terms
          </span>
        </p>
      </div>
    </div>
  )
} 