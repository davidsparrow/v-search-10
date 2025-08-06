import { Button } from 'antd'
import { FaHamburger } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useCloudStore } from '../../store/cloudStore'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AvatarComponent } from '../AvatarComponent'

interface MainHeaderProps {
  showSettingsIcon?: boolean
  onMenuClick?: () => void
}

export function MainHeader({ 
  showSettingsIcon = true,
  onMenuClick
}: MainHeaderProps) {
  const navigate = useNavigate()
  const { 
    currentTheme,
    getThemeConfig,
    user
  } = useCloudStore()

  const theme = getThemeConfig()

  // Emoji library for emotional faces
  const emotionalEmojis = [
    // 1. Happy/Positive
    '😊', '😄', '😃', '😁', '😆', '🤗', '😉', '😋', '😍', '🥰', '🤩', '😇', '🤠',
    // 2. Thinking/Curious
    '🤔', '🤨', '🧐', '🤓', '🤯', '🤪', '😜', '😝', '😛', '🤤', '😵',
    // 3. Surprised/Shocked
    '😱', '😨', '😅', '😲', '😳', '🤭', '😶', '😐', '😑',
    // 4. Angry/Frustrated
    '😠', '🤬', '😈', '👿', '😤', '😾', '😼', '😽', '😻', '😺',
    // 5. Playful/Silly
    '🤪', '😜', '😝', '😛', '🤤', '🤡', '👻', '👩‍', '👨‍', '👨‍🏫', '👩‍🏫',
    // 6. Love/Affection
    '🥰', '😍', '😘', '😗', '😙', '😚', '😌', '🤗', '🤝', '👋', '💪🏽',
    // 7. Confused/Uncertain
    '🤔', '🤨', '🧐', '🤓', '🤯', '🤪', '😵', '🤐', '😶', '😐', '😑', '😯', '😦', '😧', '😮',
    // 8. Non-human
    '🎉', '🎊', '🍾', '💰', '💵', '🤑', '💸', '💩', '🚽', '🐣', '🐶'
  ]

  // State for emoji
  const [currentEmoji, setCurrentEmoji] = useState('😊')

  // Helper function to get shadow color based on theme
  const getShadowColor = () => {
    return currentTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  }

  const getShadowColorDark = () => {
    return currentTheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  }

  // Set random emoji on component mount (page load/refresh only)
  useEffect(() => {
    const randomEmoji = emotionalEmojis[Math.floor(Math.random() * emotionalEmojis.length)]
    setCurrentEmoji(randomEmoji)
  }, []) // Only runs once on mount

  // Function to change emoji to a new random one
  const changeEmoji = () => {
    const randomEmoji = emotionalEmojis[Math.floor(Math.random() * emotionalEmojis.length)]
    setCurrentEmoji(randomEmoji)
  }

  return (
    <div style={{
      background: theme.headerBackground,
      padding: '0 20px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'none',
      zIndex: 100
    }}>
      {/* B Logo + Mini Avatar = Emoji */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '-10px' }}>
        {/* B Logo */}
        <img
          src="/askbender_b!_green_on_blk.png"
          alt="AskBender"
          style={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer',
            objectFit: 'contain',
            transition: 'transform 0.2s ease',
            filter: `drop-shadow(0 2px 4px ${getShadowColor()}) drop-shadow(0 4px 8px ${getShadowColorDark()})`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onClick={() => navigate('/')}
        />
        
        {/* Plus Sign */}
        <span
          style={{
            fontSize: '14px',
            color: theme.textSecondary,
            fontWeight: 'bold',
            margin: '0 2px'
          }}
        >
          +
        </span>
        
        {/* Avatar Group (Avatar + Equals + Emoji) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '-12px' }}>
          {/* Mini User Avatar */}
          <div
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              filter: `drop-shadow(0 2px 4px ${getShadowColor()}) drop-shadow(0 4px 8px ${getShadowColorDark()})`,
              padding: '2px 6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onClick={() => navigate('/')}
          >
            <AvatarComponent size={46} showBackground={false} />
          </div>
          
          {/* Equals Sign */}
          <span
            style={{
              fontSize: '14px',
              color: theme.textSecondary,
              fontWeight: 'bold',
              margin: '0 2px',
              marginLeft: '-8px'
            }}
          >
            =
          </span>
          
          {/* Result Emoji */}
          <div
            style={{
              fontSize: '28px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              filter: `drop-shadow(0 2px 4px ${getShadowColor()}) drop-shadow(0 4px 8px ${getShadowColorDark()})`,
              marginLeft: '0px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onClick={changeEmoji}
          >
            {currentEmoji}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Hamburger Menu Icon */}
        {showSettingsIcon && (
          <Button
            type="text"
            icon={<FaHamburger />}
            onClick={onMenuClick}
            style={{ 
              color: theme.textSecondary, 
              fontSize: '16px' 
            }}
          />
        )}
      </div>
    </div>
  )
} 