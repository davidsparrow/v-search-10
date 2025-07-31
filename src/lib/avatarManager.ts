// Simple avatar management using DiceBear API
export interface AvatarOptions {
  seed?: string
  backgroundColor?: string[]
  baseColor?: string[]
  topColor?: string[]
  size?: number
}

// Generate a random seed for avatar generation
export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Generate avatar URL using DiceBear API
export function generateAvatarUrl(options: AvatarOptions = {}): string {
  const baseUrl = 'https://api.dicebear.com/9.x/croodles/svg'
  const params = new URLSearchParams()
  
  // Add all options to URL parameters
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        params.append(key, value.join(','))
      } else {
        params.append(key, String(value))
      }
    }
  })
  
  // Ensure we have a seed for consistent generation
  if (!options.seed) {
    params.append('seed', generateRandomSeed())
  }
  
  return `${baseUrl}?${params.toString()}`
}

// Generate multiple random avatars for selection
export function generateAvatarOptions(count: number = 6): Array<{id: string, name: string, url: string}> {
  const avatars = []
  
  const backgroundColors = ['b6e3f4', 'c0aede', 'ffdfbf', 'ffd5dc', 'd1d4f9', 'ffdab9']
  const baseColors = ['ffdbac', 'f1c27d', 'e0ac69', 'c68642', '8d5524']
  const topColors = ['0905b5', '2a0845', '6441a5', '2c3e50', '3498db', 'e74c3c', 'f39c12', '27ae60', '9b59b6', '1abc9c']
  
  for (let i = 0; i < count; i++) {
    const seed = generateRandomSeed()
    const options: AvatarOptions = {
      seed,
      size: 128,
      backgroundColor: [backgroundColors[i % backgroundColors.length]],
      baseColor: [baseColors[i % baseColors.length]],
      topColor: [topColors[i % topColors.length]]
    }
    
    avatars.push({
      id: `avatar-${i}`,
      name: `Avatar ${i + 1}`,
      url: generateAvatarUrl(options)
    })
  }
  
  return avatars
}

// Available customization options
export const avatarCustomizationOptions = {
  backgroundColor: [
    { value: 'b6e3f4', label: 'Light Blue' },
    { value: 'c0aede', label: 'Lavender' },
    { value: 'ffdfbf', label: 'Peach' },
    { value: 'ffd5dc', label: 'Pink' },
    { value: 'd1d4f9', label: 'Periwinkle' },
    { value: 'ffdab9', label: 'Apricot' }
  ],
  baseColor: [
    { value: 'ffdbac', label: 'Fair' },
    { value: 'f1c27d', label: 'Light' },
    { value: 'e0ac69', label: 'Medium' },
    { value: 'c68642', label: 'Dark' },
    { value: '8d5524', label: 'Deep' }
  ],
  topColor: [
    { value: '0905b5', label: 'Navy' },
    { value: '2a0845', label: 'Purple' },
    { value: '6441a5', label: 'Violet' },
    { value: '2c3e50', label: 'Charcoal' },
    { value: '3498db', label: 'Blue' },
    { value: 'e74c3c', label: 'Red' },
    { value: 'f39c12', label: 'Orange' },
    { value: '27ae60', label: 'Green' },
    { value: '9b59b6', label: 'Amethyst' },
    { value: '1abc9c', label: 'Turquoise' }
  ]
}

// Save avatar to localStorage
export function saveUserAvatar(avatarUrl: string): void {
  try {
    localStorage.setItem('userAvatar', avatarUrl)
  } catch (error) {
    console.error('Failed to save avatar:', error)
  }
}

// Load avatar from localStorage
export function loadUserAvatar(): string | null {
  try {
    return localStorage.getItem('userAvatar')
  } catch (error) {
    console.error('Failed to load avatar:', error)
    return null
  }
}

// Get user's current avatar URL
export function getUserAvatarUrl(): string {
  const saved = loadUserAvatar()
  if (saved) {
    return saved
  }
  // Return a default avatar if none is saved
  return generateAvatarUrl({
    seed: 'default-user',
    size: 128,
    backgroundColor: ['b6e3f4'],
    baseColor: ['ffdbac']
  })
} 