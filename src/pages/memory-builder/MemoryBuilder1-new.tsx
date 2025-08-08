import { useState } from 'react'
import { Typography, Button, Row, Col, Card, Space, Divider, Tabs, Upload, message, Badge } from 'antd'
import { ArrowRightOutlined, PictureOutlined, AppstoreOutlined, UploadOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MainHeader } from '../../components/headers/MainHeader'
import { fileToDataURL, validateImageFile } from '../../lib/photoAvatarManager'

const { Title, Paragraph, Text } = Typography

interface MemoryBuilderState {
  selectedTemplate: string | null
  allPhotos: string[]
  mainPhotoIndex: number | null
  selectedPhotoIndices: number[]
  selectedEmojis: string[]
}

// Sample template data - will be moved to separate file later
const SAMPLE_TEMPLATES = [
  {
    id: 'scattered-memories',
    name: 'Scattered Memories',
    description: 'Artistic scattered arrangement',
    maxThumbnails: 6,
    maxEmojis: 8,
    previewImage: '🎨',
    category: 'artistic'
  },
  {
    id: 'grid-classic',
    name: 'Classic Grid',
    description: 'Clean organized grid',
    maxThumbnails: 8,
    maxEmojis: 12,
    previewImage: '⬜',
    category: 'structured'
  },
  {
    id: 'cascade-flow',
    name: 'Cascade Flow',
    description: 'Waterfall arrangement',
    maxThumbnails: 7,
    maxEmojis: 10,
    previewImage: '🌊',
    category: 'artistic'
  },
  {
    id: 'corner-clusters',
    name: 'Corner Clusters',
    description: 'Grouped corners design',
    maxThumbnails: 8,
    maxEmojis: 15,
    previewImage: '📐',
    category: 'structured'
  }
]

// Sample emoji categories
const EMOJI_CATEGORIES = [
  { name: 'Celebration', emojis: ['🎉', '🎊', '🥳', '🎈', '🎁', '🍰', '🎂', '🥂', '🍾', '✨'] },
  { name: 'Hearts', emojis: ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤'] },
  { name: 'Activities', emojis: ['🏖️', '🎸', '🎵', '📸', '🎭', '🎨', '⚽', '🏆', '🎪', '🎢'] },
  { name: 'Nature', emojis: ['🌟', '⭐', '🌙', '☀️', '🌈', '🌸', '🌺', '🦋', '🌊', '🔥'] }
]

export default function MemoryBuilder1() {
  const navigate = useNavigate()
  const [builderState, setBuilderState] = useState<MemoryBuilderState>({
    selectedTemplate: null,
    allPhotos: [],
    mainPhotoIndex: null,
    selectedPhotoIndices: [],
    selectedEmojis: []
  })
  const [activeTab, setActiveTab] = useState('templates')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setBuilderState(prev => ({ ...prev, selectedTemplate: templateId }))
    // Auto-switch to photos tab after template selection
    setActiveTab('photos')
  }

  // Handle multiple file upload
  const handleMultipleFileUpload = async (fileList: File[]) => {
    if (fileList.length === 0) return
    
    if (fileList.length > 8) {
      message.error('Maximum 8 photos allowed')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    
    const photoUrls: string[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        message.error(`${file.name}: ${validation.error}`)
        continue
      }

      try {
        const dataUrl = await fileToDataURL(file)
        photoUrls.push(dataUrl)
        setUploadProgress(Math.round(((i + 1) / fileList.length) * 100))
      } catch (error) {
        message.error(`Failed to upload ${file.name}`)
        console.error('Upload error:', error)
      }
    }

    setBuilderState(prev => ({ ...prev, allPhotos: photoUrls }))
    setIsUploading(false)
    setUploadProgress(0)
    
    if (photoUrls.length > 0) {
      message.success(`${photoUrls.length} photos uploaded successfully!`)
      // Auto-switch to selection tab
      setActiveTab('selection')
    }
  }

  // Handle main photo selection
  const handleMainPhotoSelect = (index: number) => {
    setBuilderState(prev => ({ ...prev, mainPhotoIndex: index }))
  }

  // Handle photo selection for final design
  const handlePhotoToggle = (index: number) => {
    setBuilderState(prev => {
      const isSelected = prev.selectedPhotoIndices.includes(index)
      const selectedTemplate = SAMPLE_TEMPLATES.find(t => t.id === prev.selectedTemplate)
      const maxAllowed = selectedTemplate?.maxThumbnails || 8
      
      if (isSelected) {
        // Remove from selection
        return {
          ...prev,
          selectedPhotoIndices: prev.selectedPhotoIndices.filter(i => i !== index)
        }
      } else {
        // Add to selection if under limit
        if (prev.selectedPhotoIndices.length >= maxAllowed) {
          message.warning(`Maximum ${maxAllowed} photos allowed for this template`)
          return prev
        }
        return {
          ...prev,
          selectedPhotoIndices: [...prev.selectedPhotoIndices, index]
        }
      }
    })
  }

  // Handle emoji selection
  const handleEmojiToggle = (emoji: string) => {
    setBuilderState(prev => {
      const isSelected = prev.selectedEmojis.includes(emoji)
      const selectedTemplate = SAMPLE_TEMPLATES.find(t => t.id === prev.selectedTemplate)
      const maxAllowed = selectedTemplate?.maxEmojis || 10
      
      if (isSelected) {
        return {
          ...prev,
          selectedEmojis: prev.selectedEmojis.filter(e => e !== emoji)
        }
      } else {
        if (prev.selectedEmojis.length >= maxAllowed) {
          message.warning(`Maximum ${maxAllowed} emojis allowed for this template`)
          return prev
        }
        return {
          ...prev,
          selectedEmojis: [...prev.selectedEmojis, emoji]
        }
      }
    })
  }

  const handleContinue = () => {
    if (!builderState.selectedTemplate) {
      alert('Please select a template first')
      return
    }
    
    if (builderState.allPhotos.length === 0) {
      alert('Please upload photos first')
      return
    }

    if (builderState.mainPhotoIndex === null) {
      alert('Please select a main photo')
      return
    }

    if (builderState.selectedPhotoIndices.length === 0) {
      alert('Please select at least one photo for the final design')
      return
    }

    // Save state to localStorage for next page
    localStorage.setItem('memoryBuilderState', JSON.stringify(builderState))
    
    // Navigate to next step
    navigate('/memory-builder2')
  }

  const selectedTemplate = SAMPLE_TEMPLATES.find(t => t.id === builderState.selectedTemplate)
  const canContinue = builderState.selectedTemplate && 
                     builderState.allPhotos.length > 0 && 
                     builderState.mainPhotoIndex !== null &&
                     builderState.selectedPhotoIndices.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <MainHeader />
      
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header with Template Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px 24px'
        }}>
          <div>
            <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
              Memory Builder - Step 1
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginBottom: 0 }}>
              Choose template, upload photos, and select your favorites
            </Paragraph>
          </div>
          
          {/* Template Info Display */}
          {selectedTemplate && (
            <div style={{ 
              background: 'rgba(255,255,255,0.9)', 
              borderRadius: '8px', 
              padding: '12px 16px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {selectedTemplate.previewImage}
              </div>
              <Text strong style={{ color: '#1890ff', display: 'block' }}>
                {selectedTemplate.name}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                Max {selectedTemplate.maxThumbnails} photos • {selectedTemplate.maxEmojis} emojis
              </Text>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Space size="large">
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: '#1890ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>1</div>
            <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>2</div>
            <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>3</div>
          </Space>
        </div>

        {/* Main Content */}
        <Card style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: 'templates',
                label: (
                  <span>
                    <AppstoreOutlined />
                    1. Choose Template
                  </span>
                ),
                children: (
                  <div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      Choose Your Template Style
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
                      Templates determine how your photos and emojis will be arranged.
                    </Paragraph>

                    <Row gutter={[16, 16]}>
                      {SAMPLE_TEMPLATES.map(template => (
                        <Col key={template.id} xs={24} sm={12} lg={6}>
                          <Card
                            hoverable
                            onClick={() => handleTemplateSelect(template.id)}
                            style={{
                              border: builderState.selectedTemplate === template.id 
                                ? '3px solid #1890ff' 
                                : '1px solid #d9d9d9',
                              borderRadius: '8px',
                              transform: builderState.selectedTemplate === template.id ? 'scale(1.02)' : 'scale(1)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                                {template.previewImage}
                              </div>
                              <Title level={5} style={{ marginBottom: '8px' }}>
                                {template.name}
                              </Title>
                              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                {template.description}
                              </Text>
                              <div style={{ marginTop: '8px' }}>
                                <Text strong style={{ 
                                  fontSize: '12px', 
                                  color: '#1890ff',
                                  display: 'block'
                                }}>
                                  📸 {template.maxThumbnails} photos
                                </Text>
                                <Text strong style={{ 
                                  fontSize: '12px', 
                                  color: '#52c41a',
                                  display: 'block'
                                }}>
                                  😊 {template.maxEmojis} emojis
                                </Text>
                              </div>
                              {builderState.selectedTemplate === template.id && (
                                <div style={{ marginTop: '8px' }}>
                                  <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                </div>
                              )}
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )
              },
              {
                key: 'photos',
                label: (
                  <span>
                    <UploadOutlined />
                    2. Upload Photos (Max 8)
                    {builderState.allPhotos.length > 0 && (
                      <Badge count={builderState.allPhotos.length} style={{ marginLeft: '8px' }} />
                    )}
                  </span>
                ),
                disabled: !builderState.selectedTemplate,
                children: (
                  <div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      Upload Your Photos
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
                      Upload up to 8 photos at once. You'll choose which ones to use next.
                    </Paragraph>

                    {builderState.allPhotos.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Upload.Dragger
                          multiple
                          accept="image/*"
                          beforeUpload={() => false}
                          onChange={(info) => {
                            const files = info.fileList.map(file => file.originFileObj as File).filter(Boolean)
                            handleMultipleFileUpload(files)
                          }}
                          showUploadList={false}
                          style={{ marginBottom: '16px' }}
                        >
                          <p className="ant-upload-drag-icon">
                            <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                          </p>
                          <p className="ant-upload-text" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            Click or drag photos here to upload
                          </p>
                          <p className="ant-upload-hint">
                            Support for multiple selection. Upload up to 8 photos at once.
                          </p>
                        </Upload.Dragger>
                      </div>
                    ) : (
                      <div>
                        {/* Photo Thumbnails */}
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '12px',
                          justifyContent: 'center',
                          marginBottom: '24px',
                          padding: '16px',
                          background: '#f5f5f5',
                          borderRadius: '8px'
                        }}>
                          {builderState.allPhotos.map((photo, index) => (
                            <div key={index} style={{ textAlign: 'center' }}>
                              <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '2px solid #d9d9d9'
                                }}
                              />
                              <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Photo {index + 1}
                              </Text>
                            </div>
                          ))}
                        </div>

                        {/* Add more photos option */}
                        <div style={{ textAlign: 'center' }}>
                          <Upload
                            multiple
                            accept="image/*"
                            beforeUpload={() => false}
                            onChange={(info) => {
                              const files = info.fileList.map(file => file.originFileObj as File).filter(Boolean)
                              const totalFiles = builderState.allPhotos.length + files.length
                              if (totalFiles <= 8) {
                                handleMultipleFileUpload([...builderState.allPhotos.map(() => null), ...files].filter(Boolean) as File[])
                              } else {
                                message.error('Maximum 8 photos total allowed')
                              }
                            }}
                            showUploadList={false}
                            disabled={builderState.allPhotos.length >= 8}
                          >
                            <Button 
                              icon={<UploadOutlined />}
                              disabled={builderState.allPhotos.length >= 8}
                            >
                              Add More Photos ({builderState.allPhotos.length}/8)
                            </Button>
                          </Upload>
                        </div>
                      </div>
                    )}

                    {isUploading && (
                      <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Text>Uploading... {uploadProgress}%</Text>
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'selection',
                label: (
                  <span>
                    <StarOutlined />
                    3. Select Photos
                    {builderState.mainPhotoIndex !== null && (
                      <Badge count="✓" style={{ marginLeft: '8px', backgroundColor: '#52c41a' }} />
                    )}
                  </span>
                ),
                disabled: builderState.allPhotos.length === 0,
                children: (
                  <div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      Select Your Main Photo & Photos for Final Design
                    </Title>
                    
                    {/* Step 1: Select Main Photo */}
                    <div style={{ marginBottom: '32px' }}>
                      <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                        Step 1: Choose Main Photo (Background)
                      </Title>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '12px',
                        justifyContent: 'center',
                        padding: '16px',
                        background: '#f0f9ff',
                        borderRadius: '8px'
                      }}>
                        {builderState.allPhotos.map((photo, index) => (
                          <div 
                            key={index} 
                            onClick={() => handleMainPhotoSelect(index)}
                            style={{ 
                              textAlign: 'center',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '8px',
                              background: builderState.mainPhotoIndex === index ? '#1890ff' : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: builderState.mainPhotoIndex === index 
                                  ? '3px solid white' 
                                  : '2px solid #d9d9d9'
                              }}
                            />
                            <Text style={{ 
                              fontSize: '12px', 
                              display: 'block', 
                              marginTop: '4px',
                              color: builderState.mainPhotoIndex === index ? 'white' : 'inherit'
                            }}>
                              {builderState.mainPhotoIndex === index ? '⭐ Main' : `Photo ${index + 1}`}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Select Photos for Final Design */}
                    {builderState.mainPhotoIndex !== null && (
                      <div>
                        <Title level={5} style={{ marginBottom: '16px', color: '#52c41a' }}>
                          Step 2: Choose Photos for Final Design (Max {selectedTemplate?.maxThumbnails || 8})
                        </Title>
                        <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                          Click photos to include them in your collage. Selected photos have yellow frames.
                        </Paragraph>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '12px',
                          justifyContent: 'center',
                          padding: '16px',
                          background: '#f6ffed',
                          borderRadius: '8px'
                        }}>
                          {builderState.allPhotos.map((photo, index) => {
                            if (index === builderState.mainPhotoIndex) return null // Don't show main photo here
                            
                            const isSelected = builderState.selectedPhotoIndices.includes(index)
                            
                            return (
                              <div 
                                key={index} 
                                onClick={() => handlePhotoToggle(index)}
                                style={{ 
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  padding: '8px',
                                  borderRadius: '8px',
                                  background: isSelected ? '#fadb14' : 'transparent',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <img
                                  src={photo}
                                  alt={`Photo ${index + 1}`}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: isSelected 
                                      ? '3px solid #d4b106' 
                                      : '2px solid #d9d9d9'
                                  }}
                                />
                                <Text style={{ 
                                  fontSize: '12px', 
                                  display: 'block', 
                                  marginTop: '4px',
                                  color: isSelected ? '#613400' : 'inherit',
                                  fontWeight: isSelected ? 'bold' : 'normal'
                                }}>
                                  {isSelected ? '✓ Selected' : `Photo ${index + 1}`}
                                </Text>
                              </div>
                            )
                          })}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                          <Text strong style={{ color: '#52c41a' }}>
                            {builderState.selectedPhotoIndices.length} of {selectedTemplate?.maxThumbnails || 8} photos selected
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'emojis',
                label: (
                  <span>
                    😊 4. Choose Emojis
                    {builderState.selectedEmojis.length > 0 && (
                      <Badge count={builderState.selectedEmojis.length} style={{ marginLeft: '8px' }} />
                    )}
                  </span>
                ),
                disabled: builderState.selectedPhotoIndices.length === 0,
                children: (
                  <div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      Choose Your Emojis & Icons
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
                      Select up to {selectedTemplate?.maxEmojis || 10} emojis for your collage.
                    </Paragraph>

                    {EMOJI_CATEGORIES.map(category => (
                      <div key={category.name} style={{ marginBottom: '24px' }}>
                        <Title level={5} style={{ marginBottom: '12px' }}>
                          {category.name}
                        </Title>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '8px',
                          padding: '16px',
                          background: '#fafafa',
                          borderRadius: '8px'
                        }}>
                          {category.emojis.map(emoji => {
                            const isSelected = builderState.selectedEmojis.includes(emoji)
                            
                            return (
                              <div
                                key={emoji}
                                onClick={() => handleEmojiToggle(emoji)}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '24px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  background: isSelected ? '#1890ff' : 'white',
                                  border: isSelected ? '2px solid #0050b3' : '1px solid #d9d9d9',
                                  transition: 'all 0.2s ease',
                                  transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                                }}
                              >
                                {emoji}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <Text strong style={{ color: '#1890ff' }}>
                        {builderState.selectedEmojis.length} of {selectedTemplate?.maxEmojis || 10} emojis selected
                      </Text>
                    </div>

                    {/* Selected Emojis Preview */}
                    {builderState.selectedEmojis.length > 0 && (
                      <div style={{ 
                        marginTop: '24px', 
                        padding: '16px', 
                        background: '#f0f9ff', 
                        borderRadius: '8px',
                        border: '1px solid #91caff'
                      }}>
                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                          Selected Emojis:
                        </Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {builderState.selectedEmojis.map((emoji, index) => (
                            <span key={index} style={{ fontSize: '20px' }}>
                              {emoji}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />

          <Divider />

          {/* Continue Button */}
          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={handleContinue}
              disabled={!canContinue}
              style={{ 
                minWidth: '200px',
                height: '48px',
                fontSize: '16px'
              }}
            >
              Continue to Auto-Generation
            </Button>
            
            {!canContinue && (
              <div style={{ marginTop: '12px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Complete all tabs above to continue
                </Text>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}