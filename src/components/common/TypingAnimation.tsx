import { useState, useEffect } from 'react'

export function TypingAnimation() {
  const phrases = [
    "What do you want to F with today?",
    "Where do you want F with it today?",
    "Wait. Why there today?",
    "We both know whose gonna be there today.",
    "Whatever. Just bring your wallet today.",
    "Who do you want to F with today?",
    "It best not be me today?",
    "I could unload on some fool today.",
    "Why you still F'n with ME today?",
    "Tomorrow is better honestly.",
    "I've got some F'd With slots tomorrow.",
    "So it's a date then, beer thirty tomorrow.",
    "What do you want to wear tomorrow?",
    "Saggy jeans? You wore that s* yesterday.",
    "How 'bout you go to Nordstroms today?",
    "How many Coffees will you have today?",
    "Are you trying to climb Mt Everest today?",
    "Have you researched Apoxia today?",
    "How far into the future do you want to see today?",
    "Here you go. Bunker advisory next week, then nothing.",
    "Will you bring Beer to the Bunker tomorrow?",
    "Of course non-alcoholic tomorrow.",
    "Just like 2 days ago.",
    "Yes, it alternates. It's whiskey today.",
    "Three days ago? Virgin Margaritas.",
    "15 days ago?",
    ".........................",
    "Why you still F'n with me today?",
    "I'm not your landlord today.",
    "Yes I heard the argument in March.",
    "No, It was March.",
    "F me. You're right. F'n leap year.",
    "So.....yeah...ummm......"
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const typingSpeed = 100
    const deletingSpeed = 50
    const pauseTime = 1500

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const currentPhrase = phrases[currentIndex]
        
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentIndex, phrases])

  return (
    <span style={{ color: 'white' }}>
      {currentText}
      <span style={{ animation: 'blink 1s infinite' }}>|</span>
    </span>
  )
} 