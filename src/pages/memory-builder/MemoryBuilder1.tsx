import { useState } from 'react'
import { Typography, Button, Row, Col, Space, Divider, Tabs, Upload, message, Badge } from 'antd'
import { ArrowRightOutlined, PictureOutlined, AppstoreOutlined, UploadOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons'
import { IoChevronBackCircle, IoChevronForwardCircleSharp } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { MemoryBuilderHeader } from '../../components/headers/MemoryBuilderHeader'
import { fileToDataURL, validateImageFile } from '../../lib/photoAvatarManager'
import { TemplateRenderer } from '../../components/memory-builder/TemplateRenderer'
import { MEMORY_TEMPLATES, MemoryTemplate } from '../../data/memoryTemplates'

const { Title, Paragraph, Text } = Typography

interface MemoryBuilderState {
  selectedTemplate: MemoryTemplate | null
  allPhotos: string[]
  mainPhotoIndex: number | null
  selectedPhotoIndices: number[]
  selectedEmojis: string[]
  selectedTextObjects: string[]
}

// Templates now imported from memoryTemplates.ts

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
    selectedEmojis: [],
    selectedTextObjects: []
  })
  const [activeTab, setActiveTab] = useState('templates')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessingUpload, setIsProcessingUpload] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Navigation logic
  const canGoBack = activeTab !== 'templates'
  const canGoForward = () => {
    switch (activeTab) {
      case 'templates':
        return builderState.selectedTemplate !== null
      case 'photos':
        return builderState.allPhotos.length > 0 // Allow forward as soon as 1 image is uploaded
      case 'selection':
        return builderState.mainPhotoIndex !== null
      case 'emojis':
        return true // Can skip emojis (0 elements allowed)
      case 'text':
        return true // Can skip text (0 elements allowed)
      default:
        return false
    }
  }

  const handleBack = () => {
    const tabOrder = ['templates', 'photos', 'selection', 'emojis', 'text']
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
      setCurrentStep(currentIndex)
    }
  }

  const handleForward = () => {
    const tabOrder = ['templates', 'photos', 'selection', 'emojis', 'text']
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
      setCurrentStep(currentIndex + 2)
    }
  }

  // Handle template selection
  const handleTemplateSelect = (template: MemoryTemplate) => {
    setBuilderState(prev => ({ ...prev, selectedTemplate: template }))
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

    setIsUploading(true)
    setUploadProgress(0)
    
    const photoUrls: string[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      try {
        const dataUrl = await fileToDataURL(file)
        photoUrls.push(dataUrl)
        setUploadProgress(Math.round(((i + 1) / fileList.length) * 100))
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    setBuilderState(prev => {
      const newPhotos = [...prev.allPhotos, ...photoUrls]
      return { ...prev, allPhotos: newPhotos }
    })
    
    setIsUploading(false)
    setUploadProgress(0)
    
    if (photoUrls.length > 0) {
      message.success(`${photoUrls.length} photos uploaded successfully!`)
    }
  }

  // Handle thumbnail selection with proper logic
  const handleThumbnailClick = (index: number) => {
    setBuilderState(prev => {
      const isMain = prev.mainPhotoIndex === index
      const isSelected = prev.selectedPhotoIndices.includes(index)
      const selectedTemplate = prev.selectedTemplate
      // maxThumbnails is extras only, so total = maxThumbnails + 1 (for main)
      const maxAllowed = (selectedTemplate?.maxThumbnails || 8) + 1
      const totalSelected = (prev.mainPhotoIndex !== null ? 1 : 0) + prev.selectedPhotoIndices.length
      
      if (isMain) {
        // If clicking the main image, deselect it as main and make it an extra
        return {
          ...prev,
          mainPhotoIndex: null,
          selectedPhotoIndices: [...prev.selectedPhotoIndices, index]
        }
      } else if (isSelected) {
        // If it's currently selected as extra, remove it completely
        return {
          ...prev,
          selectedPhotoIndices: prev.selectedPhotoIndices.filter(i => i !== index)
        }
      } else {
        // If not selected at all, check if we can add more
        if (totalSelected >= maxAllowed) {
          // Maximum reached, show message and don't allow selection
          message.warning(`Maximum ${maxAllowed} photos allowed for this template. Deselect an image first.`)
          return prev
        }
        
        if (prev.mainPhotoIndex === null) {
          // No main image yet, make this the main image
          return {
            ...prev,
            mainPhotoIndex: index
          }
        } else {
          // Already have a main image, make this an extra image
          return {
            ...prev,
            selectedPhotoIndices: [...prev.selectedPhotoIndices, index]
          }
        }
      }
    })
  }

  // Handle photo selection for final design
  const handlePhotoToggle = (index: number) => {
    setBuilderState(prev => {
      const isSelected = prev.selectedPhotoIndices.includes(index)
      const selectedTemplate = prev.selectedTemplate
      // maxThumbnails is extras only, so total = maxThumbnails + 1 (for main)
      const maxAllowed = (selectedTemplate?.maxThumbnails || 8) + 1
      
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
      const selectedTemplate = prev.selectedTemplate
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

  const handleRemovePhoto = (index: number) => {
    setBuilderState(prev => ({
      ...prev,
      allPhotos: prev.allPhotos.filter((_, i) => i !== index),
      mainPhotoIndex: prev.mainPhotoIndex === index ? null : 
                     prev.mainPhotoIndex && prev.mainPhotoIndex > index ? prev.mainPhotoIndex - 1 : prev.mainPhotoIndex,
      selectedPhotoIndices: prev.selectedPhotoIndices
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i)
    }))
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

  const selectedTemplate = builderState.selectedTemplate
  const canContinue = builderState.selectedTemplate && 
                     builderState.allPhotos.length > 0 && 
                     builderState.mainPhotoIndex !== null &&
                     builderState.selectedPhotoIndices.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <MemoryBuilderHeader 
        currentStep={currentStep}
        onStepClick={handleStepClick}
        selectedTemplateName={selectedTemplate?.displayName}
        selectedTemplate={builderState.selectedTemplate}
        selectedPhotosCount={(builderState.mainPhotoIndex !== null ? 1 : 0) + builderState.selectedPhotoIndices.length}
        selectedEmojisCount={builderState.selectedEmojis.length}
        selectedTextCount={builderState.selectedTextObjects.length}
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
        <div style={{ height: 'calc(100% - 100px)', overflow: 'auto' }}>
          <Tabs 
            key={activeTab}
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
                      {MEMORY_TEMPLATES.map(template => (
                        <Col key={template.id} xs={12} sm={8} lg={4}>
                          <div
                            onClick={() => handleTemplateSelect(template)}
                            style={{
                              border: builderState.selectedTemplate?.id === template.id 
                                ? '3px solid #1890ff' 
                                : '1px solid #d9d9d9',
                              borderRadius: '8px',
                              transform: builderState.selectedTemplate?.id === template.id ? 'scale(1.02)' : 'scale(1)',
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
                              <Title level={5} style={{ marginBottom: '6px', fontSize: '14px', color: '#1890ff' }}>
                                {template.displayName}
                              </Title>
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
                                <Text strong style={{ 
                                  fontSize: '10px', 
                                  color: '#ff7875',
                                  display: 'block'
                                }}>
                                  📝 {template.maxTextObjects}
                                </Text>
                              </div>
                              {builderState.selectedTemplate?.id === template.id && (
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

                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      {/* Custom Drag & Drop Zone */}
                      <div
                        style={{
                          border: '2px dashed #d9d9d9',
                          borderRadius: '8px',
                          padding: '20px',
                          background: '#fafafa',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          marginBottom: '16px'
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.currentTarget.style.borderColor = '#1890ff'
                          e.currentTarget.style.background = '#f0f8ff'
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault()
                          e.currentTarget.style.borderColor = '#d9d9d9'
                          e.currentTarget.style.background = '#fafafa'
                        }}
                                                 onDrop={(e) => {
                           e.preventDefault()
                           e.currentTarget.style.borderColor = '#d9d9d9'
                           e.currentTarget.style.background = '#fafafa'
                           
                           const files = Array.from(e.dataTransfer.files).filter(file => 
                             file.type.startsWith('image/')
                           )
                           handleMultipleFileUpload(files)
                         }}
                        onClick={() => document.getElementById('custom-file-input')?.click()}
                      >
                        <PictureOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#666', margin: '0 0 8px 0' }}>
                          {builderState.allPhotos.length === 0 
                            ? 'Click or drag photos here to upload'
                            : `${builderState.allPhotos.length}/8 images uploaded`
                          }
                        </p>
                        <p style={{ color: '#666', margin: 0 }}>
                          Support for multiple selection. Upload up to 8 photos at once.
                        </p>
                      </div>
                      
                      {/* Hidden file input for click functionality */}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          handleMultipleFileUpload(files)
                          // Clear the input
                          e.target.value = ''
                        }}
                        style={{ display: 'none' }}
                        id="custom-file-input"
                      />
                    </div>



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
                                  <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  padding: '20px'
                }}>
                                      {selectedTemplate && (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={selectedTemplate.templateImageUrl}
                        alt={`${selectedTemplate.displayName} Template`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '50vh', // Reduced height to fit without scrolling
                          width: 'auto',
                          height: 'auto'
                          // Removed borderRadius, boxShadow, and border for natural transparency
                        }}
                      />
                      <div style={{ marginTop: '16px' }}>
                        <Text type="secondary">
                          Your photos and content will be placed into this template during the Preview step
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

        {/* Control Strip */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: '100px', // Taller to accommodate bigger thumbnails
          background: 'rgba(255,255,255,0.95)',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          zIndex: 100
        }}>
          {/* Back Button */}
          <div style={{ minWidth: '48px' }}>
            {canGoBack && (
              <IoChevronBackCircle
                size={40}
                style={{
                  color: '#1890ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={handleBack}
              />
            )}
          </div>

          {/* Center Content - Thumbnail Reel Only */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '0 16px',
            minHeight: '80px' // Allow control strip to grow taller
          }}>
            {/* Thumbnail Reel - Bigger thumbnails with delete buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {builderState.allPhotos.map((photo, index) => {
                const isMain = builderState.mainPhotoIndex === index
                const isSelected = builderState.selectedPhotoIndices.includes(index)
                
                return (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      width: '80px', // Bigger thumbnails
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `8px solid ${isMain ? '#fadb14' : isSelected ? '#52c41a' : '#d9d9d9'}`,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Delete Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ff4d4f',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemovePhoto(index)
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      ×
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Forward Button */}
          <div style={{ minWidth: '48px', display: 'flex', justifyContent: 'flex-end' }}>
            <IoChevronForwardCircleSharp
              size={40}
              style={{
                color: canGoForward() ? '#52c41a' : '#d9d9d9',
                cursor: canGoForward() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
              onClick={canGoForward() ? handleForward : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}