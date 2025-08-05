import { useState, useEffect } from 'react'
import { Button, Modal, Row, Col, Select, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import {
  generateAvatarUrl,
  generateAvatarOptions,
  saveUserAvatar,
  loadUserAvatar,
  getUserAvatarUrl,
  avatarCustomizationOptions,
  extractColorsFromUrl,
  AvatarOptions
} from '../lib/avatarManager'

interface AvatarComponentProps {
  size?: number
  onAvatarChange?: (avatarUrl: string) => void
  showBackground?: boolean
}

export function AvatarComponent({ 
  size = 128, 
  onAvatarChange,
  showBackground = true
}: AvatarComponentProps) {
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('')
  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false)
  const [avatarOptions, setAvatarOptions] = useState<Array<{id: string, name: string, url: string}>>([])
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  // Color state management
  const [currentSeed, setCurrentSeed] = useState<string>('')
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>('b6e3f4')
  const [currentBaseColor, setCurrentBaseColor] = useState<string>('ffdbac')
  const [currentTopColor, setCurrentTopColor] = useState<string>('0905b5')

  // Load current avatar on component mount
  useEffect(() => {
    const saved = loadUserAvatar()
    if (saved) {
      setCurrentAvatarUrl(saved)
      // Extract colors from saved avatar
      const colors = extractColorsFromUrl(saved)
      setCurrentSeed(colors.seed)
      setCurrentBackgroundColor(colors.backgroundColor)
      setCurrentBaseColor(colors.baseColor)
      setCurrentTopColor(colors.topColor)
      if (onAvatarChange) onAvatarChange(saved)
    } else {
      // Generate a default avatar
      const defaultUrl = getUserAvatarUrl()
      setCurrentAvatarUrl(defaultUrl)
      // Extract colors from default avatar
      const colors = extractColorsFromUrl(defaultUrl)
      setCurrentSeed(colors.seed)
      setCurrentBackgroundColor(colors.backgroundColor)
      setCurrentBaseColor(colors.baseColor)
      setCurrentTopColor(colors.topColor)
      if (onAvatarChange) onAvatarChange(defaultUrl)
    }
  }, [onAvatarChange])

  // Generate avatar URL with or without background
  const getAvatarUrl = (baseUrl: string) => {
    if (!showBackground) {
      // Remove background color from URL for transparent background
      const url = new URL(baseUrl)
      url.searchParams.delete('backgroundColor')
      return url.toString()
    }
    return baseUrl
  }

  // Generate new avatar options
  const generateNewOptions = () => {
    setIsLoading(true)
    setTimeout(() => {
      const options = generateAvatarOptions(6)
      setAvatarOptions(options)
      setIsLoading(false)
    }, 100)
  }

  // Open customize modal
  const handleCustomizeClick = () => {
    generateNewOptions()
    // Extract current colors from the avatar URL
    if (currentAvatarUrl) {
      const colors = extractColorsFromUrl(currentAvatarUrl)
      setCurrentSeed(colors.seed)
      setCurrentBackgroundColor(colors.backgroundColor)
      setCurrentBaseColor(colors.baseColor)
      setCurrentTopColor(colors.topColor)
    }
    setIsCustomizeModalVisible(true)
  }

  // Select an avatar
  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    const avatar = avatarOptions.find(a => a.id === avatarId)
    if (avatar) {
      setCurrentAvatarUrl(avatar.url)
      // Extract colors from selected avatar
      const colors = extractColorsFromUrl(avatar.url)
      setCurrentSeed(colors.seed)
      setCurrentBackgroundColor(colors.backgroundColor)
      setCurrentBaseColor(colors.baseColor)
      setCurrentTopColor(colors.topColor)
      if (onAvatarChange) onAvatarChange(avatar.url)
    }
  }

  // Update custom options - FIXED to preserve seed and all colors
  const handleOptionChange = (key: keyof AvatarOptions, value: any) => {
    // Create new options with current seed and all current colors
    const newOptions: AvatarOptions = {
      seed: currentSeed,
      backgroundColor: [currentBackgroundColor],
      baseColor: [currentBaseColor],
      topColor: [currentTopColor],
      size
    }
    
    // Update the specific color that changed
    if (key === 'backgroundColor') {
      newOptions.backgroundColor = [value]
      setCurrentBackgroundColor(value)
    } else if (key === 'baseColor') {
      newOptions.baseColor = [value]
      setCurrentBaseColor(value)
    } else if (key === 'topColor') {
      newOptions.topColor = [value]
      setCurrentTopColor(value)
    }
    
    const url = generateAvatarUrl(newOptions)
    setCurrentAvatarUrl(url)
    if (onAvatarChange) onAvatarChange(url)
  }

  // Save current avatar
  const handleSaveAvatar = () => {
    saveUserAvatar(currentAvatarUrl)
    message.success('Avatar saved successfully!')
    setIsCustomizeModalVisible(false)
  }

  // Generate random avatar
  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const randomUrl = generateAvatarUrl({
      seed: randomSeed,
      size,
      backgroundColor: [avatarCustomizationOptions.backgroundColor[Math.floor(Math.random() * avatarCustomizationOptions.backgroundColor.length)].value],
      baseColor: [avatarCustomizationOptions.baseColor[Math.floor(Math.random() * avatarCustomizationOptions.baseColor.length)].value],
      topColor: [avatarCustomizationOptions.topColor[Math.floor(Math.random() * avatarCustomizationOptions.topColor.length)].value]
    })
    setCurrentAvatarUrl(randomUrl)
    // Extract colors from random avatar
    const colors = extractColorsFromUrl(randomUrl)
    setCurrentSeed(colors.seed)
    setCurrentBackgroundColor(colors.backgroundColor)
    setCurrentBaseColor(colors.baseColor)
    setCurrentTopColor(colors.topColor)
    if (onAvatarChange) onAvatarChange(randomUrl)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Avatar Display */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: showBackground ? '50%' : '0%',
        overflow: 'hidden',
        border: showBackground ? (isHovered ? '2px solid #1890ff' : '2px solid #ddd') : 'none',
        background: showBackground ? '#f0f0f0' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: showBackground ? (isHovered ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)') : 'none'
      }}
      onClick={handleCustomizeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
        {currentAvatarUrl ? (
          <img
            src={getAvatarUrl(currentAvatarUrl)}
            alt="User Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={() => {
              // Fallback to default avatar if image fails to load
              const fallbackUrl = generateAvatarUrl({
                seed: 'fallback',
                size,
                backgroundColor: showBackground ? ['b6e3f4'] : undefined,
                baseColor: ['ffdbac']
              })
              setCurrentAvatarUrl(fallbackUrl)
            }}
          />
        ) : (
          <span style={{ color: '#999', fontSize: '12px' }}>Loading...</span>
        )}
        

      </div>



      {/* Customize Modal */}
      <Modal
        title="Pick-a-face.TM. All humans look alike to me. Except for Fabio, he looks Fabiouless!"
        open={isCustomizeModalVisible}
        onCancel={() => setIsCustomizeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCustomizeModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveAvatar}>
            Save Avatar
          </Button>
        ]}
        width={800}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left side - Avatar preview and options */}
          <div style={{ flex: 1 }}>
            {/* Current avatar preview */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '128px',
                height: '128px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #ddd',
                margin: '0 auto',
                background: '#f0f0f0'
              }}>
                {currentAvatarUrl && (
                  <img
                    src={currentAvatarUrl}
                    alt="Avatar Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Avatar options */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Choose an Avatar</h4>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={generateNewOptions}
                  loading={isLoading}
                  size="small"
                >
                  New Options
                </Button>
              </div>
              <Row gutter={[8, 8]}>
                {avatarOptions.map((avatar) => (
                  <Col span={8} key={avatar.id}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: selectedAvatar === avatar.id ? '2px solid #1890ff' : '1px solid #ddd',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => handleAvatarSelect(avatar.id)}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Random avatar button */}
            <Button
              type="dashed"
              onClick={handleRandomAvatar}
              style={{ width: '100%' }}
            >
              Generate Random Avatar
            </Button>
          </div>

          {/* Right side - Customization options */}
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '16px' }}>Customize Colors</h4>
            
            {/* Background Color */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Background Color
              </label>
              <Select
                value={currentBackgroundColor}
                onChange={(value) => handleOptionChange('backgroundColor', value)}
                style={{ width: '100%' }}
                size="small"
              >
                {avatarCustomizationOptions.backgroundColor.map((color) => (
                  <Select.Option key={color.value} value={color.value}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: `#${color.value}`,
                        border: '1px solid #ddd'
                      }} />
                      {color.label}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Skin Color */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Skin Color
              </label>
              <Select
                value={currentBaseColor}
                onChange={(value) => handleOptionChange('baseColor', value)}
                style={{ width: '100%' }}
                size="small"
              >
                {avatarCustomizationOptions.baseColor.map((color) => (
                  <Select.Option key={color.value} value={color.value}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: `#${color.value}`,
                        border: '1px solid #ddd'
                      }} />
                      {color.label}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Hair Color */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Hair Color
              </label>
              <Select
                value={currentTopColor}
                onChange={(value) => handleOptionChange('topColor', value)}
                style={{ width: '100%' }}
                size="small"
              >
                {avatarCustomizationOptions.topColor.map((color) => (
                  <Select.Option key={color.value} value={color.value}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: `#${color.value}`,
                        border: '1px solid #ddd'
                      }} />
                      {color.label}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
} 