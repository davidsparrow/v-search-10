// Logo Manager for AskBender Text Logo Variations
// Manages session-based random logo selection with fallback support

const LOGO_VARIATIONS = [
  'askbender_textLogo1.png',
  'askbender_textLogo2.png', 
  'askbender_textLogo3.png',
  'askbender_textLogo4.png',
  'askbender_textLogo5.png',
  'askbender_textLogo6.png',
  'askbender_textLogo7.png',
  'askbender_textLogo8.png',
  'askbender_textLogo9.png',
  'askbender_textLogo10.png',
  'askbender_textLogo11.png',
  'askbender_textLogo12.png',
  'askbender_textLogo13.png',
  'askbender_textLogo14.png',
  'askbender_textLogo15.png'
]

const FALLBACK_LOGOS = [
  '/askbender-text-logo!_rainbow.png',
  '/askbender-text-logo-transparent2.png'
]

const STORAGE_KEY = 'askbender_session_logo'

/**
 * Gets the current session logo variation
 * If no logo is selected for this session, randomly selects one
 * Returns the selected logo path or fallback if needed
 */
export function getSessionLogo(): string {
  // Check if we already have a logo for this session
  const storedLogo = localStorage.getItem(STORAGE_KEY)
  
  if (storedLogo) {
    return storedLogo
  }
  
  // No logo selected yet, randomly choose one
  const randomIndex = Math.floor(Math.random() * LOGO_VARIATIONS.length)
  const selectedLogo = `/askbender_text_logo_variations/${LOGO_VARIATIONS[randomIndex]}`
  
  // Store the selection for this session
  localStorage.setItem(STORAGE_KEY, selectedLogo)
  
  return selectedLogo
}

/**
 * Preloads the current session logo to avoid flicker
 * Returns a promise that resolves when the image is loaded
 */
export function preloadSessionLogo(): Promise<void> {
  return new Promise((resolve, reject) => {
    const logoPath = getSessionLogo()
    const img = new Image()
    
    img.onload = () => resolve()
    img.onerror = () => {
      console.warn('Failed to preload logo variation, will use fallback:', logoPath)
      resolve() // Don't reject, let the component handle fallback
    }
    
    img.src = logoPath
  })
}

/**
 * Clears the session logo (useful for testing or logout)
 */
export function clearSessionLogo(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Gets a fallback logo path
 * Returns the first fallback logo
 */
export function getFallbackLogo(): string {
  return FALLBACK_LOGOS[0]
} 