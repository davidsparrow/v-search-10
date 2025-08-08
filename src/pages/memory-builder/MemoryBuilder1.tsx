import { useState } from 'react'
import { Typography, Button, Row, Col, Space, Divider, Tabs, Upload, message, Badge } from 'antd'
import { ArrowRightOutlined, PictureOutlined, AppstoreOutlined, UploadOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MemoryBuilderHeader } from '../../components/headers/MemoryBuilderHeader'
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
  const [currentStep, setCurrentStep] = useState(1)

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setBuilderState(prev => ({ ...prev, selectedTemplate: templateId }))
    // Auto-switch to photos tab after template selection
    setActiveTab('photos')
    setCurrentStep(2)
  }

  // Handle header step navigation
  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step)
      // Map step numbers to tab keys
      const stepToTab = {
        1: 'templates',
        2: 'photos', 
        3: 'selection',
        4: 'emojis'
      }
      setActiveTab(stepToTab[step as keyof typeof stepToTab] || 'templates')
    }
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
      // Don't auto-switch - let user continue uploading
      // setActiveTab('selection')
      // setCurrentStep(3)
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
      <MemoryBuilderHeader 
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />
      
              {/* Main Content - Full Screen from Header to Footer */}
        <div style={{ 
          position: 'absolute',
          top: '60px', // Right against header
          left: 0,
          right: 0,
          bottom: 0,
          background: '#f0f8ff',
          padding: '24px 24px 24px 24px'
        }}>



        {/* Main Content */}
        <div style={{ height: '100%', overflow: 'auto' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            tabBarStyle={{ display: 'none' }}
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

                    <Row gutter={[12, 12]}>
                      {SAMPLE_TEMPLATES.map(template => (
                        <Col key={template.id} xs={12} sm={8} lg={4}>
                          <div
                            onClick={() => handleTemplateSelect(template.id)}
                            style={{
                              border: builderState.selectedTemplate === template.id 
                                ? '3px solid #1890ff' 
                                : '1px solid #d9d9d9',
                              borderRadius: '8px',
                              transform: builderState.selectedTemplate === template.id ? 'scale(1.02)' : 'scale(1)',
                              transition: 'all 0.2s ease',
                              background: 'white',
                              padding: '16px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <div style={{ textAlign: 'center', padding: '12px' }}>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                                {template.previewImage}
                              </div>
                              <Title level={5} style={{ marginBottom: '6px', fontSize: '14px' }}>
                                {template.name}
                              </Title>
                              <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                                {template.description}
                              </Text>
                              <div style={{ marginTop: '6px' }}>
                                <Text strong style={{ 
                                  fontSize: '10px', 
                                  color: '#1890ff',
                                  display: 'block'
                                }}>
                                  📸 {template.maxThumbnails}
                                </Text>
                                <Text strong style={{ 
                                  fontSize: '10px', 
                                  color: '#52c41a',
                                  display: 'block'
                                }}>
                                  😊 {template.maxEmojis}
                                </Text>
                              </div>
                              {builderState.selectedTemplate === template.id && (
                                <div style={{ marginTop: '6px' }}>
                                  <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                </div>
                              )}
                            </div>
                          </div>
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
                        <p className="ant-upload-text" style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>
                          {builderState.allPhotos.length === 0 
                            ? 'Click or drag photos here to upload'
                            : `${builderState.allPhotos.length}/8 images uploaded`
                          }
                        </p>
                        <p className="ant-upload-hint" style={{ color: '#666' }}>
                          Support for multiple selection. Upload up to 8 photos at once.
                        </p>
                      </Upload.Dragger>
                    </div>

                    {builderState.allPhotos.length > 0 && (
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
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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

                        {/* Continue Button */}
                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                          <Button
                            type="primary"
                            size="large"
                            icon={<ArrowRightOutlined />}
                            onClick={() => {
                              setActiveTab('selection')
                              setCurrentStep(3)
                            }}
                            disabled={builderState.allPhotos.length === 0}
                            style={{ 
                              minWidth: '200px',
                              height: '48px',
                              fontSize: '16px',
                              borderRadius: '77px',
                              background: builderState.allPhotos.length === 0 ? '#d9d9d9' : '#52c41a',
                              borderColor: builderState.allPhotos.length === 0 ? '#d9d9d9' : '#52c41a'
                            }}
                          >
                            Continue →
                          </Button>
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


        </div>
      </div>
    </div>
  )
}