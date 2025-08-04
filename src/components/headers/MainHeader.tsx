import { Button, Space } from 'antd'
import { FaHamburger } from 'react-icons/fa'
import { AiFillExperiment, AiFillBulb } from 'react-icons/ai'
import { GiBatMask } from 'react-icons/gi'
import { FaSnowflake } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useCloudStore } from '../../store/cloudStore'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AvatarComponent } from '../AvatarComponent'

interface MainHeaderProps {
  showThemeIcons?: boolean
  showSettingsIcon?: boolean
  onMenuClick?: () => void
}

export function MainHeader({ 
  showThemeIcons = true, 
  showSettingsIcon = true,
  onMenuClick
}: MainHeaderProps) {
  const navigate = useNavigate()
  const { 
    currentTheme, 
    setTheme, 
    getThemeConfig,
    user
  } = useCloudStore()

  const theme = getThemeConfig()

  // Emoji library for emotional faces
  const emotionalEmojis = ['😊', '😄', '🤔', '😌', '😎', '🤗', '😉', '😋', '😍', '🥰', '😴', '🤩', '😇', '🤠', '😎', '🤓', '😏', '😌', '😋', '😊']

  // State for emoji
  const [currentEmoji, setCurrentEmoji] = useState('😊')

  const handleThemeChange = (themeName: 'default' | 'dark' | 'compact' | 'white') => {
    setTheme(themeName)
  }



  // Set random emoji on component mount (page load/refresh only)
  useEffect(() => {
    const randomEmoji = emotionalEmojis[Math.floor(Math.random() * emotionalEmojis.length)]
    setCurrentEmoji(randomEmoji)
  }, []) // Only runs once on mount

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* B Logo */}
        <img
          src="/askbender_b!_green_on_blk.png"
          alt="AskBender"
          style={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
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
        
        {/* Mini User Avatar */}
        <div
          style={{
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onClick={() => navigate('/')}
        >
          <AvatarComponent size={24} />
        </div>
        
        {/* Equals Sign */}
        <span
          style={{
            fontSize: '14px',
            color: theme.textSecondary,
            fontWeight: 'bold',
            margin: '0 2px'
          }}
        >
          =
        </span>
        
        {/* Result Emoji */}
        <div
          style={{
            fontSize: '24px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onClick={() => navigate('/')}
        >
          {currentEmoji}
        </div>
      </div>

      {/* Theme Icons and Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Icons */}
        {showThemeIcons && (
          <Space size="small">
            <Button
              type="text"
              icon={<GiBatMask style={{ fontSize: '16px' }} />}
              className={currentTheme === 'dark' ? 'icon-two-tone-dark' : ''}
              style={{ 
                color: currentTheme === 'dark' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('dark')}
            />
            <Button
              type="text"
              icon={<FaSnowflake style={{ fontSize: '16px' }} />}
              className={currentTheme === 'white' ? 'icon-two-tone-white' : ''}
              style={{ 
                color: currentTheme === 'white' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('white')}
            />
            <Button
              type="text"
              icon={<AiFillExperiment style={{ fontSize: '16px' }} />}
              className={currentTheme === 'default' ? 'icon-two-tone-default' : ''}
              style={{ 
                color: currentTheme === 'default' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('default')}
            />
            <Button
              type="text"
              icon={<AiFillBulb style={{ fontSize: '16px' }} />}
              className={currentTheme === 'compact' ? 'icon-two-tone-compact' : ''}
              style={{ 
                color: currentTheme === 'compact' ? theme.logoAccentColor : theme.textSecondary,
                fontSize: '16px'
              }}
              onClick={() => handleThemeChange('compact')}
            />
          </Space>
        )}
        
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