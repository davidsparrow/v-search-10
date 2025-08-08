// Photo avatar management with customizable circular borders
export interface PhotoAvatarOptions {
  photoUrl?: string
  borderStyle: 'gradient' | 'solid' | 'glow' | 'iridescent'
  borderColors: string[]
  borderWidth: number
  borderOpacity: number
  size: number
}

export interface BorderPreset {
  name: string
  style: 'gradient' | 'solid' | 'glow' | 'iridescent'
  colors: string[]
  width: number
  opacity: number
}

// Predefined border presets inspired by the image
export const BORDER_PRESETS: BorderPreset[] = [
  {
    name: 'Blue Purple Glow',
    style: 'glow',
    colors: ['#4f46e5', '#7c3aed', '#a855f7'],
    width: 8,
    opacity: 0.8
  },
  {
    name: 'Green Yellow Iridescent',
    style: 'iridescent',
    colors: ['#22c55e', '#eab308', '#fbbf24'],
    width: 6,
    opacity: 0.9
  },
  {
    name: 'Pink Purple Gradient',
    style: 'gradient',
    colors: ['#ec4899', '#8b5cf6', '#a855f7'],
    width: 10,
    opacity: 0.7
  },
  {
    name: 'Rainbow Glow',
    style: 'glow',
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'],
    width: 8,
    opacity: 0.8
  },
  {
    name: 'Ocean Breeze',
    style: 'gradient',
    colors: ['#0ea5e9', '#06b6d4', '#0891b2'],
    width: 6,
    opacity: 0.9
  },
  {
    name: 'Sunset Glow',
    style: 'glow',
    colors: ['#f97316', '#ec4899', '#8b5cf6'],
    width: 8,
    opacity: 0.8
  }
]

// Generate CSS for border styles
export function generateBorderCSS(options: PhotoAvatarOptions): string {
  const { borderStyle, borderColors, borderWidth, borderOpacity } = options
  
  switch (borderStyle) {
    case 'gradient':
      return `
        border: ${borderWidth}px solid transparent;
        background: linear-gradient(45deg, ${borderColors.join(', ')}) border-box;
        -webkit-mask: 
          linear-gradient(#fff 0 0) padding-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask: 
          linear-gradient(#fff 0 0) padding-box, 
          linear-gradient(#fff 0 0);
        mask-composite: exclude;
        opacity: ${borderOpacity};
      `
    
    case 'glow':
      const glowColors = borderColors.map(color => `${color}40`).join(', ')
      return `
        border: ${borderWidth}px solid ${borderColors[0]};
        box-shadow: 
          0 0 ${borderWidth * 2}px ${borderColors[0]}40,
          0 0 ${borderWidth * 4}px ${borderColors[1] || borderColors[0]}20,
          inset 0 0 ${borderWidth}px ${borderColors[2] || borderColors[0]}20;
        opacity: ${borderOpacity};
      `
    
    case 'iridescent':
      return `
        border: ${borderWidth}px solid transparent;
        background: 
          linear-gradient(45deg, ${borderColors.join(', ')}) border-box,
          conic-gradient(from 0deg, ${borderColors.join(', ')}) border-box;
        -webkit-mask: 
          linear-gradient(#fff 0 0) padding-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask: 
          linear-gradient(#fff 0 0) padding-box, 
          linear-gradient(#fff 0 0);
        mask-composite: exclude;
        opacity: ${borderOpacity};
        animation: iridescent-shift 3s ease-in-out infinite alternate;
      `
    
    case 'solid':
    default:
      return `
        border: ${borderWidth}px solid ${borderColors[0]};
        opacity: ${borderOpacity};
      `
  }
}

// Generate keyframe animation for iridescent effect
export function generateIridescentAnimation(): string {
  return `
    @keyframes iridescent-shift {
      0% { filter: hue-rotate(0deg) brightness(1); }
      50% { filter: hue-rotate(180deg) brightness(1.1); }
      100% { filter: hue-rotate(360deg) brightness(1); }
    }
  `
}

// Save photo avatar settings to localStorage
export function savePhotoAvatarSettings(photoUrl: string, options: PhotoAvatarOptions): void {
  const settings = {
    photoUrl,
    options,
    timestamp: Date.now()
  }
  localStorage.setItem('photoAvatarSettings', JSON.stringify(settings))
}

// Load photo avatar settings from localStorage
export function loadPhotoAvatarSettings(): { photoUrl: string; options: PhotoAvatarOptions } | null {
  const saved = localStorage.getItem('photoAvatarSettings')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (error) {
      console.error('Error loading photo avatar settings:', error)
      return null
    }
  }
  return null
}

// Convert uploaded file to data URL
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Validate uploaded image
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please upload a JPEG, PNG, or WebP image.' }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB.' }
  }
  
  return { isValid: true }
}

// Create a canvas with the photo and border
export function createPhotoAvatarCanvas(
  photoUrl: string, 
  options: PhotoAvatarOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const { size } = options
      canvas.width = size
      canvas.height = size
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size)
      
      // Create circular clipping path
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, (size - options.borderWidth * 2) / 2, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.clip()
      
      // Draw the photo
      const aspectRatio = img.width / img.height
      let drawWidth = size - options.borderWidth * 2
      let drawHeight = size - options.borderWidth * 2
      
      if (aspectRatio > 1) {
        // Landscape image
        drawHeight = drawWidth / aspectRatio
      } else {
        // Portrait image
        drawWidth = drawHeight * aspectRatio
      }
      
      const x = (size - drawWidth) / 2
      const y = (size - drawHeight) / 2
      
      ctx.drawImage(img, x, y, drawWidth, drawHeight)
      
      resolve(canvas.toDataURL('image/png'))
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = photoUrl
  })
} 