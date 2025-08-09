import { useState, useEffect } from 'react'
import { useCloudStore } from '../../store/cloudStore'

// Load animated text sentences from external file
async function loadAnimatedSentences(): Promise<string[]> {
  try {
    const response = await fetch('/animated_text_sentences_Home.txt')
    const text = await response.text()
    return text.split('\n').filter(line => line.trim() !== '')
  } catch (error) {
    console.error('Failed to load animated sentences, using fallback:', error)
    // Fallback sentences in case file loading fails
    return [
      "What type of Event you f'n with Today?",
      "One of those Today?",
      "You are so boned Today.",
      "Of course I can help you Today."
    ]
  }
}

export function TypingAnimation() {
  const { currentTheme } = useCloudStore()
  const [phrases, setPhrases] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Load sentences from file on component mount
  useEffect(() => {
    loadAnimatedSentences().then(sentences => {
      setPhrases(sentences)
      setIsLoaded(true)
    })
  }, [])

  // Helper function to split text into typeable units (treating HTML tags as single units)
  const getTypeableUnits = (text: string): string[] => {
    const units: string[] = []
    let i = 0
    
    while (i < text.length) {
      if (text[i] === '<') {
        // Find the end of the HTML tag
        const tagEnd = text.indexOf('>', i)
        if (tagEnd !== -1) {
          // Include the entire tag as one unit
          units.push(text.slice(i, tagEnd + 1))
          i = tagEnd + 1
        } else {
          // If no closing '>', treat as regular character
          units.push(text[i])
          i++
        }
      } else {
        // Regular character
        units.push(text[i])
        i++
      }
    }
    
    return units
  }

  // Main typing animation effect
  useEffect(() => {
    // Don't start animation until sentences are loaded
    if (!isLoaded || phrases.length === 0) return
    const typingSpeed = 100
    const deletingSpeed = 50
    const pauseTime = 2000

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const currentPhrase = phrases[currentIndex]
        const typeableUnits = getTypeableUnits(currentPhrase)
        const currentUnits = getTypeableUnits(currentText)
        
        if (currentUnits.length < typeableUnits.length) {
          // Add the next unit
          const nextUnits = typeableUnits.slice(0, currentUnits.length + 1)
          setCurrentText(nextUnits.join(''))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        const currentUnits = getTypeableUnits(currentText)
        if (currentUnits.length > 0) {
          // Remove the last unit
          const remainingUnits = currentUnits.slice(0, -1)
          setCurrentText(remainingUnits.join(''))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentIndex, phrases, isLoaded])

  // Show loading state until sentences are loaded
  if (!isLoaded) {
    return (
      <span 
        style={{ color: currentTheme === 'white' ? '#000000' : 'white' }}
        className={currentTheme === 'white' ? 'white-theme' : ''}
      >
        <span>Loading...</span>
        <span style={{ animation: 'blink 1s infinite' }}>|</span>
      </span>
    )
  }

  return (
    <span 
      style={{ color: currentTheme === 'white' ? '#000000' : 'white' }}
      className={currentTheme === 'white' ? 'white-theme' : ''}
    >
      <span 
        dangerouslySetInnerHTML={{ __html: currentText }}
        className="typing-animation-content"
      />
      <span style={{ animation: 'blink 1s infinite' }}>|</span>
    </span>
  )
} 