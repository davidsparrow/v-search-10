import { Button, Space } from 'antd'
import { FaHamburger } from 'react-icons/fa'
import { AiFillExperiment, AiFillBulb } from 'react-icons/ai'
import { GiBatMask } from 'react-icons/gi'
import { FaSnowflake } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useCloudStore } from '../../store/cloudStore'

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
    getThemeConfig 
  } = useCloudStore()

  const theme = getThemeConfig()

  const handleThemeChange = (themeName: 'default' | 'dark' | 'compact' | 'white') => {
    setTheme(themeName)
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
      {/* B Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
              color: theme.textPrimary, 
              fontSize: '18px' 
            }}
          />
        )}
      </div>
    </div>
  )
} 