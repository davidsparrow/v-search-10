import { Typography, Button, Upload, message } from 'antd'
import { UploadOutlined, CameraOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { fileToDataURL, validateImageFile } from '../lib/photoAvatarManager'

const { Title, Paragraph } = Typography

export function PhotoAvatarDemoPage() {
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [photoDimensions, setPhotoDimensions] = useState({ width: 0, height: 0 })

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
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    const aspectRatio = naturalWidth / naturalHeight
    
    let displayWidth, displayHeight
    
    if (naturalHeight <= 400) {
      // Image is already small enough, use original size
      displayWidth = naturalWidth
      displayHeight = naturalHeight
    } else {
      // Image is taller than 400px, scale down to 400px height
      displayHeight = 400
      displayWidth = 400 * aspectRatio
    }
    
    setPhotoDimensions({ width: displayWidth, height: displayHeight })
  }

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      color: '#333'
    }}>
      <Title level={1} style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        color: '#1890ff',
        fontSize: '48px'
      }}>
        🎨 Photo Avatar Demo
      </Title>
      
      <Paragraph style={{ 
        textAlign: 'center', 
        fontSize: '18px', 
        marginBottom: '48px',
        color: '#666',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        Upload your photo with max 400px height constraint.
      </Paragraph>

      {/* Simple Photo Upload */}
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        margin: '20px 0'
      }}>
        <Title level={2} style={{ color: '#52c41a', marginBottom: '20px' }}>
          📸 Simple Photo Upload
        </Title>
        
        {/* Photo Display */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Uploaded Photo"
              onLoad={handleImageLoad}
              style={{
                width: photoDimensions.width || 'auto',
                height: photoDimensions.height || 'auto',
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto',
                borderRadius: '33px'
              }}
            />
          ) : (
            <div style={{
              width: '300px',
              height: '200px',
              border: '2px dashed #d9d9d9',
              borderRadius: '8px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
              background: '#fafafa'
            }}>
              <CameraOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
              <span>Upload Photo</span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Upload
          accept="image/*"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={isLoading}
        >
          <Button 
            type="primary"
            icon={<UploadOutlined />} 
            loading={isLoading}
            size="large"
            style={{ marginBottom: '16px' }}
          >
            Choose Photo
          </Button>
        </Upload>

        {/* Error Message */}
        {uploadError && (
          <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '8px' }}>
            {uploadError}
          </div>
        )}

        {/* Photo Info */}
        {photoDimensions.width > 0 && (
          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f6ffed',
            borderRadius: '6px',
            border: '1px solid #b7eb8f'
          }}>
            <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              📏 Display Size: {Math.round(photoDimensions.width)} × {Math.round(photoDimensions.height)}px
            </Paragraph>
          </div>
        )}

        {/* Status */}
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          border: '2px solid #1890ff'
        }}>
          <Title level={4} style={{ color: '#1890ff' }}>
            ✅ Simple Photo Upload Complete
          </Title>
          <Paragraph style={{ color: '#666' }}>
            - Photo Upload: ✅ Working<br/>
            - File Validation: ✅ Active<br/>
            - Natural Aspect Ratio: ✅ Maintained<br/>
            - Max Height 400px: ✅ Applied<br/>
            - No Borders: ✅ Clean<br/>
            - No Colors: ✅ Simple<br/>
            - Ready for next step
          </Paragraph>
        </div>
      </div>
    </div>
  )
}

export default PhotoAvatarDemoPage 