import React, { useState, useEffect } from 'react'

interface AgeVerificationProps {
  onVerified: () => void
}

export const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerified }) => {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Check if user has already verified their age
    const ageVerified = localStorage.getItem('age_verified')
    if (!ageVerified) {
      setShowPopup(true)
    } else {
      onVerified()
    }
  }, [onVerified])

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true')
    setShowPopup(false)
    onVerified()
  }

  const handleDecline = () => {
    // Redirect to a safe page or show alternative content
    window.location.href = 'https://www.google.com'
  }

  if (!showPopup) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/askbender_b!_green_on_blk.png"
            alt="AskBender"
            style={{
              height: '50px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '16px'
        }}>
          Age Verification Required
        </h1>

        {/* Warning Icon */}
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          ⚠️
        </div>

        {/* Content */}
        <div style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#333',
          marginBottom: '24px'
        }}>
          <p style={{ marginBottom: '16px' }}>
            This application contains mature language and content that may not be suitable for individuals under 18 years of age.
          </p>
          
          <p style={{ marginBottom: '16px' }}>
            By clicking "I am 18 or older", you confirm that you are at least 18 years old and consent to viewing content that may include adult language.
          </p>

          <p style={{
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            If you are under 18, please click "I am under 18" to be redirected to a safe website.
          </p>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleVerify}
            style={{
              padding: '14px 28px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              minWidth: '180px'
            }}
          >
            ✅ I am 18 or older
          </button>
          
          <button
            onClick={handleDecline}
            style={{
              padding: '14px 28px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              minWidth: '180px'
            }}
          >
            ❌ I am under 18
          </button>
        </div>

        {/* Legal Notice */}
        <div style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.4'
        }}>
          <p>
            By accessing this application, you acknowledge that you have read and understood our terms of service and privacy policy.
          </p>
          <p style={{ marginTop: '8px' }}>
            This verification is required to comply with content regulations and ensure appropriate access to mature content.
          </p>
        </div>
      </div>
    </div>
  )
} 