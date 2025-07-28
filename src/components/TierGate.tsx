import React from 'react'
import { Button, Tooltip } from 'antd'
import { LockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { 
  AskBenderFeature, 
  AskBenderTier, 
  validateFeatureAccess,
  getTierDisplayName 
} from '../types/askbender'

interface TierGateProps {
  feature: AskBenderFeature
  userTier: AskBenderTier
  eventriaTier?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradeButton?: boolean
  customMessage?: string
  showCustomMessage?: boolean
  onClearValues?: () => void
}

export const TierGate: React.FC<TierGateProps> = ({
  feature,
  userTier,
  eventriaTier,
  children,
  fallback,
  showUpgradeButton = true,
  customMessage,
  showCustomMessage = false,
  onClearValues
}) => {
  const validation = validateFeatureAccess(userTier, feature, eventriaTier as any)
  
  if (validation.hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradeButton && !showCustomMessage) {
    return null
  }

  const upgradeMessage = validation.suggestedUpgrade 
    ? `Upgrade to ${getTierDisplayName(validation.suggestedUpgrade)} to access this feature`
    : 'This feature requires a higher tier'

  const displayMessage = showCustomMessage && customMessage 
    ? customMessage 
    : (validation.reason || 'Feature not available in your tier')

  return (
    <div>
      {React.cloneElement(children as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          
          if (showCustomMessage && customMessage) {
            // Clear PAID filter values when message appears
            if (onClearValues) {
              onClearValues()
            }
            
            // Show floating message
            const messageDiv = document.createElement('div')
            messageDiv.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #ff4d4f;
              color: white;
              padding: 20px 30px;
              border-radius: 12px;
              font-size: 18px;
              font-weight: bold;
              z-index: 9999;
              box-shadow: 0 8px 24px rgba(0,0,0,0.4);
              animation: fadeInOut 10s ease-in-out;
              text-align: center;
              max-width: 400px;
              line-height: 1.4;
            `
            
            // Create message content with clickable element
            messageDiv.innerHTML = `
              <div style="margin-bottom: 16px;">${customMessage}</div>
              <button 
                id="closeMessageBtn"
                style="
                  background: white;
                  color: #ff4d4f;
                  border: 2px solid white;
                  border-radius: 6px;
                  padding: 8px 16px;
                  font-size: 14px;
                  font-weight: bold;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin: 0 auto;
                "
                onmouseover="this.style.background='#f0f0f0'"
                onmouseout="this.style.background='white'"
              >
                <span style="font-size: 16px;">⚡</span>
                I CAN afford this Bulls**!
              </button>
            `
            
            // Add CSS animation
            const style = document.createElement('style')
            style.textContent = `
              @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
              }
            `
            document.head.appendChild(style)
            document.body.appendChild(messageDiv)
            
            // Add click handler for close button
            const closeBtn = messageDiv.querySelector('#closeMessageBtn')
            if (closeBtn) {
              closeBtn.addEventListener('click', () => {
                // Clear values again when button is clicked
                if (onClearValues) {
                  onClearValues()
                }
                document.body.removeChild(messageDiv)
              })
            }
            
            // Remove after 10 seconds
            setTimeout(() => {
              if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv)
              }
            }, 10000)
          }
        }
      })}
    </div>
  )
}

// Convenience component for feature-specific gating
export const FeatureGate: React.FC<{
  feature: AskBenderFeature
  userTier: AskBenderTier
  eventriaTier?: string
  children: React.ReactNode
}> = ({ feature, userTier, eventriaTier, children }) => (
  <TierGate 
    feature={feature} 
    userTier={userTier} 
    eventriaTier={eventriaTier}
  >
    {children}
  </TierGate>
) 