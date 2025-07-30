import { useState, useEffect } from 'react'

export function TypingAnimation() {
  const actionWords = ['bulldoze', 'demolish', 'destroy', 'dishevel', 'decouple']
  const timeWords = ['today?', 'tomorrow?', 'next week?', 'yesterday?', 'outside time?', 'in the Loo?']
  
  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const typingSpeed = 150
    const deletingSpeed = 50
    const pauseTime = 1000

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const currentAction = actionWords[currentActionIndex]
        const currentTime = timeWords[currentTimeIndex]
        const fullText = `${currentAction} ${currentTime}`
        
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentActionIndex((prev) => (prev + 1) % actionWords.length)
          setCurrentTimeIndex((prev) => (prev + 1) % timeWords.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentActionIndex, currentTimeIndex, actionWords, timeWords])

  return (
    <span style={{ color: 'white' }}>
      What do you want to {currentText}
      <span style={{ animation: 'blink 1s infinite' }}>|</span>
    </span>
  )
} 