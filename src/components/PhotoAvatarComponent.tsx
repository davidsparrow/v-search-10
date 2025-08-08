import { useState, useEffect, useRef } from 'react'
import { Button, Modal, Row, Col, Select, Upload, message, Slider, ColorPicker } from 'antd'
import { UploadOutlined, CameraOutlined } from '@ant-design/icons'
import {
  PhotoAvatarOptions,
  BorderPreset,
  BORDER_PRESETS,
  generateBorderCSS,
  generateIridescentAnimation,
  savePhotoAvatarSettings,
  loadPhotoAvatarSettings,
  fileToDataURL,
  validateImageFile,
  createPhotoAvatarCanvas
} from '../lib/photoAvatarManager'

interface PhotoAvatarComponentProps {
  size?: number
  onAvatarChange?: (avatarUrl: string) => void
  showBackground?: boolean
}

export function PhotoAvatarComponent({ 
  size = 128, 
  onAvatarChange,
  showBackground = true
}: PhotoAvatarComponentProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  
  // Border customization state
  const [borderOptions, setBorderOptions] = useState<PhotoAvatarOptions>({
    borderStyle: 'glow',
    borderColors: ['#4f46e5', '#7c3aed', '#a855f7'],
    borderWidth: 8,
    borderOpacity: 0.8,
    size
  })
  
  const [selectedPreset, setSelectedPreset] = useState<string>('Blue Purple Glow')
  const [customColors, setCustomColors] = useState<string[]>(['#4f46e5', '#7c3aed', '#a855f7'])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const styleRef = useRef<HTMLStyleElement>(null)

  // Load saved photo avatar on component mount
  useEffect(() => {
    const saved = loadPhotoAvatarSettings()
    if (saved) {
      setPhotoUrl(saved.photoUrl)
      setBorderOptions(saved.options)
      if (onAvatarChange) onAvatarChange(saved.photoUrl)
    }
  }, [onAvatarChange])

  // Add CSS animation for iridescent effect
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = generateIridescentAnimation()
  }, [])

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadError('')
    
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file')
      return false
    }

    setIsLoading(true)
    try {
      const dataUrl = await fileToDataURL(file)
      setPhotoUrl(dataUrl)
      
      // Update border options with new size
      setBorderOptions(prev => ({ ...prev, size }))
      
      if (onAvatarChange) onAvatarChange(dataUrl)
      message.success('Photo uploaded successfully!')
    } catch (error) {
      setUploadError('Failed to upload photo')
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
    
    return false // Prevent default upload behavior
  }

  // Handle preset selection
  const handlePresetChange = (presetName: string) => {
    const preset = BORDER_PRESETS.find(p => p.name === presetName)
    if (preset) {
      setSelectedPreset(presetName)
      setBorderOptions({
        ...borderOptions,
        borderStyle: preset.style,
        borderColors: preset.colors,
        borderWidth: preset.width,
        borderOpacity: preset.opacity
      })
      setCustomColors(preset.colors)
    }
  }

  // Handle custom color changes
  const handleColorChange = (index: number, color: string) => {
    const newColors = [...customColors]
    newColors[index] = color
    setCustomColors(newColors)
    setBorderOptions({
      ...borderOptions,
      borderColors: newColors
    })
  }

  // Handle border width change
  const handleWidthChange = (value: number) => {
    setBorderOptions({
      ...borderOptions,
      borderWidth: value
    })
  }

  // Handle border opacity change
  const handleOpacityChange = (value: number) => {
    setBorderOptions({
      ...borderOptions,
      borderOpacity: value / 100
    })
  }

  // Save current avatar
  const handleSaveAvatar = () => {
    if (photoUrl) {
      savePhotoAvatarSettings(photoUrl, borderOptions)
      message.success('Avatar saved successfully!')
      setIsCustomizeModalVisible(false)
    }
  }

  // Generate border CSS
  const borderCSS = generateBorderCSS(borderOptions)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Photo Avatar Display */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => setIsCustomizeModalVisible(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
        {/* Border Layer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          border: borderOptions.borderStyle === 'solid' ? `${borderOptions.borderWidth}px solid ${borderOptions.borderColors[0]}` : 'none',
          background: borderOptions.borderStyle === 'gradient' ? `linear-gradient(45deg, ${borderOptions.borderColors.join(', ')})` : 
                     borderOptions.borderStyle === 'iridescent' ? `conic-gradient(from 0deg, ${borderOptions.borderColors.join(', ')})` : 'transparent',
          boxShadow: borderOptions.borderStyle === 'glow' ? 
            `0 0 ${borderOptions.borderWidth * 2}px ${borderOptions.borderColors[0]}40, 0 0 ${borderOptions.borderWidth * 4}px ${borderOptions.borderColors[1] || borderOptions.borderColors[0]}20` : 'none',
          opacity: borderOptions.borderOpacity
        }} />
        
        {/* Photo Layer */}
        <div style={{
          position: 'absolute',
          top: borderOptions.borderWidth,
          left: borderOptions.borderWidth,
          right: borderOptions.borderWidth,
          bottom: borderOptions.borderWidth,
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#f0f0f0'
        }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="User Photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              <CameraOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
              <br />
              Upload Photo
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <Button
        type="dashed"
        icon={<UploadOutlined />}
        onClick={() => fileInputRef.current?.click()}
        loading={isLoading}
        style={{ width: '100%' }}
      >
        Upload Photo
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileUpload(file)
          }
        }}
        style={{ display: 'none' }}
      />

      {/* Error message */}
      {uploadError && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', textAlign: 'center' }}>
          {uploadError}
        </div>
      )}

      {/* Customize Modal */}
      <Modal
        title="Customize Your Photo Avatar"
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
        width={900}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left side - Preview and upload */}
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '16px' }}>Preview</h4>
            
            {/* Avatar preview */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                margin: '0 auto',
                background: '#f0f0f0'
              }}>
                                 {/* Border Layer */}
                 <div style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   bottom: 0,
                   borderRadius: '50%',
                   border: borderOptions.borderStyle === 'solid' ? `${borderOptions.borderWidth}px solid ${borderOptions.borderColors[0]}` : 'none',
                   background: borderOptions.borderStyle === 'gradient' ? `linear-gradient(45deg, ${borderOptions.borderColors.join(', ')})` : 
                              borderOptions.borderStyle === 'iridescent' ? `conic-gradient(from 0deg, ${borderOptions.borderColors.join(', ')})` : 'transparent',
                   boxShadow: borderOptions.borderStyle === 'glow' ? 
                     `0 0 ${borderOptions.borderWidth * 2}px ${borderOptions.borderColors[0]}40, 0 0 ${borderOptions.borderWidth * 4}px ${borderOptions.borderColors[1] || borderOptions.borderColors[0]}20` : 'none',
                   opacity: borderOptions.borderOpacity
                 }} />
                
                {/* Photo Layer */}
                <div style={{
                  position: 'absolute',
                  top: borderOptions.borderWidth,
                  left: borderOptions.borderWidth,
                  right: borderOptions.borderWidth,
                  bottom: borderOptions.borderWidth,
                  borderRadius: '50%',
                  overflow: 'hidden'
                }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Avatar Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      No photo uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload section */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '12px' }}>Upload Photo</h4>
              <Upload
                accept="image/*"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                disabled={isLoading}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={isLoading}
                  style={{ width: '100%' }}
                >
                  Choose Photo
                </Button>
              </Upload>
              {uploadError && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px' }}>
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Border customization */}
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '16px' }}>Border Customization</h4>
            
            {/* Border Style */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Border Style
              </label>
              <Select
                value={borderOptions.borderStyle}
                onChange={(value) => setBorderOptions({ ...borderOptions, borderStyle: value })}
                style={{ width: '100%' }}
                size="small"
              >
                <Select.Option value="glow">Glow Effect</Select.Option>
                <Select.Option value="gradient">Gradient</Select.Option>
                <Select.Option value="iridescent">Iridescent</Select.Option>
                <Select.Option value="solid">Solid</Select.Option>
              </Select>
            </div>

            {/* Border Presets */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Border Presets
              </label>
              <Select
                value={selectedPreset}
                onChange={handlePresetChange}
                style={{ width: '100%' }}
                size="small"
              >
                {BORDER_PRESETS.map((preset) => (
                  <Select.Option key={preset.name} value={preset.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${preset.colors.join(', ')})`,
                        border: '1px solid #ddd'
                      }} />
                      {preset.name}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Border Width */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Border Width: {borderOptions.borderWidth}px
              </label>
              <Slider
                min={2}
                max={20}
                value={borderOptions.borderWidth}
                onChange={handleWidthChange}
                style={{ width: '100%' }}
              />
            </div>

            {/* Border Opacity */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Border Opacity: {Math.round(borderOptions.borderOpacity * 100)}%
              </label>
              <Slider
                min={10}
                max={100}
                value={borderOptions.borderOpacity * 100}
                onChange={handleOpacityChange}
                style={{ width: '100%' }}
              />
            </div>

            {/* Custom Colors */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                Custom Colors
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {customColors.map((color, index) => (
                  <ColorPicker
                    key={index}
                    value={color}
                    onChange={(color) => handleColorChange(index, color.toHexString())}
                    size="small"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PhotoAvatarComponent 