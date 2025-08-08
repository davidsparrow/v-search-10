import { Typography, Button, Upload, message } from 'antd'
import { UploadOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { fileToDataURL, validateImageFile } from '../../lib/photoAvatarManager'

const { Title, Text } = Typography

interface PhotoUploadWidgetProps {
  onPhotoUploaded: (photoUrl: string, isMain?: boolean) => void
  onPhotoRemoved?: (photoUrl: string) => void
  maxPhotos?: number
  currentPhotos: string[]
  title: string
  subtitle?: string
  isMainPhoto?: boolean
}

export function PhotoUploadWidget({ 
  onPhotoUploaded, 
  onPhotoRemoved,
  maxPhotos = 6, 
  currentPhotos = [],
  title,
  subtitle,
  isMainPhoto = false
}: PhotoUploadWidgetProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [photoDimensions, setPhotoDimensions] = useState<{[key: string]: { width: number, height: number }}>({})

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadError('')
    
    // Check if we've reached the limit
    if (currentPhotos.length >= maxPhotos) {
      setUploadError(`Maximum ${maxPhotos} photos allowed`)
      return false
    }
    
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file')
      return false
    }

    setIsLoading(true)
    try {
      const dataUrl = await fileToDataURL(file)
      onPhotoUploaded(dataUrl, isMainPhoto)
      message.success('Photo uploaded successfully!')
    } catch (error) {
      setUploadError('Failed to upload photo')
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
    
    return false // Prevent default upload behavior
  }

  // Handle image load to calculate display dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, photoUrl: string) => {
    const img = e.currentTarget
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    const aspectRatio = naturalWidth / naturalHeight
    
    let displayWidth, displayHeight
    
    const maxSize = isMainPhoto ? 400 : 120
    
    if (naturalWidth <= maxSize && naturalHeight <= maxSize) {
      // Image is already small enough in both dimensions, use original size
      displayWidth = naturalWidth
      displayHeight = naturalHeight
    } else if (aspectRatio > 1) {
      // Wide image - constrain to max width
      displayWidth = maxSize
      displayHeight = maxSize / aspectRatio
    } else {
      // Tall image - constrain to max height
      displayHeight = maxSize
      displayWidth = maxSize * aspectRatio
    }
    
    setPhotoDimensions(prev => ({
      ...prev,
      [photoUrl]: { width: displayWidth, height: displayHeight }
    }))
  }

  const handleRemovePhoto = (photoUrl: string) => {
    if (onPhotoRemoved) {
      onPhotoRemoved(photoUrl)
    }
    // Remove from dimensions tracking
    setPhotoDimensions(prev => {
      const updated = { ...prev }
      delete updated[photoUrl]
      return updated
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>{title}</Title>
      {subtitle && <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>{subtitle}</Text>}

      {/* Upload Error */}
      {uploadError && (
        <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>
          {uploadError}
        </div>
      )}

      {/* Photo Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMainPhoto ? '1fr' : 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {currentPhotos.map((photoUrl, index) => {
          const dimensions = photoDimensions[photoUrl] || { width: 120, height: 120 }
          
          return (
            <div key={index} style={{ 
              position: 'relative',
              textAlign: 'center'
            }}>
              <img
                src={photoUrl}
                alt={`${isMainPhoto ? 'Main' : 'Backup'} photo ${index + 1}`}
                onLoad={(e) => handleImageLoad(e, photoUrl)}
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  maxWidth: '100%',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: isMainPhoto ? '33px' : '8px',
                  objectFit: 'cover'
                }}
              />
              
              {/* Remove Button */}
              {onPhotoRemoved && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleRemovePhoto(photoUrl)}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'white',
                    border: '1px solid #ff4d4f',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              )}
              
              {isMainPhoto && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                  Main Photo
                </Text>
              )}
            </div>
          )
        })}
      </div>

      {/* Upload Button */}
      {currentPhotos.length < maxPhotos && (
        <Upload
          accept="image/*"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={isLoading}
        >
          <div style={{
            width: isMainPhoto ? '300px' : '120px',
            height: isMainPhoto ? '200px' : '120px',
            border: '2px dashed #d9d9d9',
            borderRadius: '8px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
            background: '#fafafa',
            cursor: 'pointer',
            transition: 'border-color 0.3s',
            marginBottom: '16px'
          }}>
            <CameraOutlined style={{ fontSize: isMainPhoto ? '48px' : '24px', marginBottom: '8px' }} />
            <span>{isMainPhoto ? 'Upload Main Photo' : 'Add Photo'}</span>
          </div>
        </Upload>
      )}

      {/* Upload Button Alternative */}
      <div style={{ textAlign: 'center' }}>
        <Upload
          accept="image/*"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={isLoading || currentPhotos.length >= maxPhotos}
        >
          <Button 
            type="primary"
            icon={<UploadOutlined />} 
            loading={isLoading}
            size="large"
            disabled={currentPhotos.length >= maxPhotos}
          >
            {currentPhotos.length === 0 
              ? `Upload ${isMainPhoto ? 'Main' : 'First'} Photo`
              : `Add ${isMainPhoto ? 'Another' : 'More Photos'} (${currentPhotos.length}/${maxPhotos})`
            }
          </Button>
        </Upload>
      </div>
    </div>
  )
}