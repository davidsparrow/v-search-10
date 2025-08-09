import { Button } from 'antd'
import { HiTemplate } from "react-icons/hi"
import { IoCloudUpload } from "react-icons/io5"
import { BiSolidSelectMultiple } from "react-icons/bi"
import { BsEmojiDizzyFill } from "react-icons/bs"
import { RxLetterCaseCapitalize } from "react-icons/rx"
import { IoIosImages } from "react-icons/io"
import { MemoryTemplate } from '../../data/memoryTemplates'

interface MemoryBuilderHeaderProps {
  currentStep: number
  onStepClick: (step: number) => void
  selectedTemplateName?: string
  selectedTemplate?: MemoryTemplate | null
  selectedPhotosCount?: number
  selectedEmojisCount?: number
  selectedTextCount?: number
}

const STEPS = [
  { number: 1, label: 'template', icon: HiTemplate },
  { number: 2, label: 'upload', icon: IoCloudUpload },
  { number: 3, label: 'select', icon: BiSolidSelectMultiple },
  { number: 4, label: 'objects', icon: BsEmojiDizzyFill },
  { number: 5, label: 'text', icon: RxLetterCaseCapitalize },
  { number: 6, label: 'preview', icon: IoIosImages }
]

export function MemoryBuilderHeader({ 
  currentStep, 
  onStepClick, 
  selectedTemplateName, 
  selectedTemplate,
  selectedPhotosCount = 0,
  selectedEmojisCount = 0,
  selectedTextCount = 0
}: MemoryBuilderHeaderProps) {
  
  // Generate dynamic step labels with X/N format
  const getStepLabel = (stepNumber: number, baseLabel: string) => {
    if (!selectedTemplate) return baseLabel
    
    switch (stepNumber) {
      case 3: // select photos
        // maxThumbnails is extras only, so total = maxThumbnails + 1 (for main)
        const maxPhotos = (selectedTemplate.maxThumbnails || 0) + 1
        return `${baseLabel} ${selectedPhotosCount}/${maxPhotos}`
      case 4: // objects (emojis)
        return `${baseLabel} ${selectedEmojisCount}/${selectedTemplate.maxEmojis || 0}`
      case 5: // text
        return `${baseLabel} ${selectedTextCount}/${selectedTemplate.maxTextObjects || 0}`
      default:
        return baseLabel
    }
  }
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Logo & Template Name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginLeft: '-5px'
      }}>
        <img
          src="/askbender_b!_green_on_blk.png"
          alt="AskBender"
          style={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer',
            objectFit: 'contain',
            transition: 'transform 0.2s ease',
            filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.2)) drop-shadow(0 4px 8px rgba(255,255,255,0.4))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onClick={() => window.location.href = '/'}
        />
        {selectedTemplateName && (
          <div style={{
            color: '#1890ff',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {selectedTemplateName}
          </div>
        )}
      </div>

      {/* Step Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
      }}>
        {STEPS.map((step) => {
          const IconComponent = step.icon
          const isActive = currentStep === step.number
          const isCompleted = currentStep > step.number
          
          return (
            <Button
              key={step.number}
              type="text"
              onClick={() => onStepClick(step.number)}
              disabled={currentStep < step.number}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? '#1890ff' : isCompleted ? '#52c41a' : 'rgba(255,255,255,0.6)',
                background: 'transparent',
                border: 'none',
                padding: '8px 12px',
                height: 'auto',
                minWidth: '60px',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                if (!isActive && currentStep >= step.number) {
                  e.currentTarget.style.color = '#1890ff'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && currentStep >= step.number) {
                  e.currentTarget.style.color = '#52c41a'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <IconComponent style={{ 
                fontSize: '18px',
                marginBottom: '2px'
              }} />
              <span>{getStepLabel(step.number, step.label)}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
} 