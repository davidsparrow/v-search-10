import { useNavigate } from 'react-router-dom'


export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'white',
      fontFamily: 'Poppins, sans-serif'
    }}>
      
      {/* Header with Logo */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img
          src="/askbender_b!_green_on_blk.png"
          alt="AskBender"
          style={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer',
            objectFit: 'contain'
          }}
          onClick={() => window.history.back()}
        />
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '16px',
          fontWeight: '300',
          color: '#000',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '32px'
        }}>
          Privacy Policy
        </h1>

        {/* Body Content */}
        <div style={{
          fontSize: '13px',
          color: '#000',
          lineHeight: '1.6'
        }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Information We Collect
          </h2>
          <p style={{ marginBottom: '16px' }}>
            We collect information you provide directly to us, such as when you create an account, 
            participate in events, or contact us for support.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            How We Use Your Information
          </h2>
          <p style={{ marginBottom: '16px' }}>
            We use the information we collect to provide, maintain, and improve our services, 
            to communicate with you, and to develop new features.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Information Sharing
          </h2>
          <p style={{ marginBottom: '16px' }}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Data Security
          </h2>
          <p style={{ marginBottom: '16px' }}>
            We implement appropriate security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Contact Us
          </h2>
          <p style={{ marginBottom: '16px' }}>
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@bendersaas.ai
          </p>
        </div>
      </main>
    </div>
  )
} 