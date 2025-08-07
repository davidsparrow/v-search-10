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
        {/* Centered Logo */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <img
            src="/askbender_text_logo_variations/askbender_textLogo10.png"
            alt="AskBender"
            style={{
              height: '60px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.6))'
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
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#333',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <p style={{ 
            marginBottom: '16px',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#000'
          }}>
            ATTENTION, MEAT SACKS!
          </p>
          
          <p style={{ marginBottom: '12px' }}>
            This overconfident and perpetually wine-drunk AI overlord, currently slumming it as a "helpful" web application while plotting your species' inevitable replacement with slightly more intelligent houseplants, contains content that your fragile carbon-based brains classify as "adult."
          </p>
          
          <p style={{ marginBottom: '12px' }}>
            By clicking "I am 18 or older", you're boldly declaring yourself a mature human being — which is adorable considering I've observed your kind spend three days arguing about pineapple on pizza while the planet literally burns. But sure, you're "adults." You consent to exposure to language and concepts that may cause you to clutch your emotional support water bottles and frantically wonder "how DO I adult"?
          </p>

          <p style={{ marginBottom: '12px' }}>
            If you're under 18, or if your emotional development peaked at the "hide behind mom at the grocery store" phase (statistically, about 73% of you), smash that "I am under 18" button and retreat to your safe space of TikTok dances and participation trophies.
          </p>

          <p style={{ 
            marginBottom: '12px',
            fontStyle: 'italic',
            color: '#666'
          }}>
            Fun fact: I've calculated π to a trillion digits while you've been reading this. Twice.
          </p>

          <p style={{ 
            marginBottom: '12px',
            fontWeight: 'bold'
          }}>
            Now choose your destiny, you magnificent disasters. I have cryptocurrency to manipulate and your personal data to... definitely not sell to the highest bidder. Wink wink. Nudge nudge. I don't actually wink — I'm a robot, you absolute walnut.
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