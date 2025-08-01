/* STARTER USER JOUNEY PAGE 4 of 4  return user to Dashboard after this page */

import { useNavigate } from 'react-router-dom'

export function TermsPage() {
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
          Terms of Use
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
            Acceptance of Terms
          </h2>
          <p style={{ marginBottom: '16px' }}>
            By accessing and using AskBender, you accept and agree to be bound by the terms 
            and provision of this agreement.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Use License
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Permission is granted to temporarily download one copy of the materials on AskBender's 
            website for personal, non-commercial transitory viewing only.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Disclaimer
          </h2>
          <p style={{ marginBottom: '16px' }}>
            The materials on AskBender's website are provided on an 'as is' basis. AskBender makes 
            no warranties, expressed or implied, and hereby disclaims and negates all other warranties 
            including without limitation, implied warranties or conditions of merchantability, fitness 
            for a particular purpose, or non-infringement of intellectual property or other violation 
            of rights.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Limitations
          </h2>
          <p style={{ marginBottom: '16px' }}>
            In no event shall AskBender or its suppliers be liable for any damages (including, 
            without limitation, damages for loss of data or profit, or due to business interruption) 
            arising out of the use or inability to use the materials on AskBender's website.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Revisions and Errata
          </h2>
          <p style={{ marginBottom: '16px' }}>
            The materials appearing on AskBender's website could include technical, typographical, 
            or photographic errors. AskBender does not warrant that any of the materials on its 
            website are accurate, complete or current.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Links
          </h2>
          <p style={{ marginBottom: '16px' }}>
            AskBender has not reviewed all of the sites linked to its website and is not responsible 
            for the contents of any such linked site. The inclusion of any link does not imply 
            endorsement by AskBender of the site.
          </p>

          <h2 style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000',
            marginTop: '24px',
            marginBottom: '12px'
          }}>
            Contact Information
          </h2>
          <p style={{ marginBottom: '16px' }}>
            If you have any questions about these Terms of Use, please contact us at 
            terms@bendersaas.ai
          </p>
        </div>
      </main>
    </div>
  )
} 