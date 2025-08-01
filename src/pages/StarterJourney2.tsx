/* STARTER USER JOUNEY PAGE 2 of 4 */

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { leaderboardService } from '../lib/leaderboard'
import { LeaderboardEntry } from '../types/leaderboard'

interface Checkbox {
  id: number
  x: number
  y: number
  isYellow: boolean
  isAngled: boolean
  isChecked: boolean
  points: number
}

export function StarterJourney2() {
  const navigate = useNavigate()

  // Add CSS animations for pulsing effects
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes containerPulse {
        0%, 100% { 
          box-shadow: 0 0 30px #ffff00, 0 0 60px #ffff00, 0 0 90px #ffff00;
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 50px #ffff00, 0 0 100px #ffff00, 0 0 150px #ffff00;
          transform: scale(1.02);
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Fetch leaderboard on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await leaderboardService.fetchLeaderboard()
        console.log('Initial leaderboard fetch:', { data, error })
        if (data && !error) {
          setLeaderboard(data)
        } else {
          console.error('Error fetching leaderboard:', error)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      }
    }

    fetchLeaderboard()
  }, [])

  // Check if score qualifies for leaderboard
  const checkScoreQualification = (score: number): boolean => {
    if (leaderboard.length < 10) return true
    return score > leaderboard[leaderboard.length - 1].score
  }

  // Manual refresh function for debugging
  const refreshLeaderboard = async () => {
    console.log('Manually refreshing leaderboard...')
    try {
      const { data, error } = await leaderboardService.fetchLeaderboard()
      console.log('Manual refresh result:', { data, error })
      if (data && !error) {
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error)
    }
  }

  // Handle score submission
  const handleScoreSubmission = async (username: string, score: number) => {
    setIsSubmittingScore(true)
    console.log('Submitting score:', { username, score })
    
    try {
      const { data, error } = await leaderboardService.updateUserScore(username, score)
      console.log('Score submission result:', { data, error })
      
      if (data && !error) {
        // Refresh leaderboard
        const { data: newLeaderboard } = await leaderboardService.fetchLeaderboard()
        console.log('New leaderboard data:', newLeaderboard)
        if (newLeaderboard) {
          setLeaderboard(newLeaderboard)
        }
        setShowUsernameModal(false)
        setShowTimeoutMessage(true)
      } else {
        console.error('Error submitting score:', error)
        // For now, just show the timeout message even if save fails
        setShowUsernameModal(false)
        setShowTimeoutMessage(true)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      // For now, just show the timeout message even if save fails
      setShowUsernameModal(false)
      setShowTimeoutMessage(true)
    } finally {
      setIsSubmittingScore(false)
    }
  }
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [score, setScore] = useState(0)
  const [checkboxes, setCheckboxes] = useState<Checkbox[]>([])
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)
  const [isScorePulsing, setIsScorePulsing] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [username, setUsername] = useState('')
  const [isSubmittingScore, setIsSubmittingScore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const checkboxIdRef = useRef(0)

  // Generate new checkbox
  const createCheckbox = () => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const isYellow = Math.random() < 0.15 // 15% chance (slightly rarer)
    const isAngled = Math.random() < 0.3 // 30% chance
    const points = isYellow ? 100 : 1 // Yellow checkboxes worth 100 points!

    const newCheckbox: Checkbox = {
      id: checkboxIdRef.current++,
      x: Math.random() * (containerWidth - 50), // Random X position
      y: -50, // Start above viewport
      isYellow,
      isAngled,
      isChecked: false,
      points
    }

    setCheckboxes(prev => [...prev, newCheckbox])
  }

  // Animation loop
  const animateCheckboxes = () => {
    setCheckboxes(prev => 
      prev.map(checkbox => ({
        ...checkbox,
        y: checkbox.y + 3 // Faster fall speed
      })).filter(checkbox => checkbox.y < window.innerHeight + 100) // Remove when below viewport
    )
  }

  // Handle checkbox hover
  const handleCheckboxHover = (id: number) => {
    setCheckboxes(prev => {
      const checkbox = prev.find(c => c.id === id)
      if (checkbox && !checkbox.isChecked) {
        const pointsToAdd = checkbox.points
        setScore(score => score + pointsToAdd)
        
        // Pulse effect for 100+ point scores
        if (pointsToAdd >= 100) {
          setIsScorePulsing(true)
          setTimeout(() => setIsScorePulsing(false), 1000) // Pulse for 1 second
        }
        
        return prev.map(c => 
          c.id === id ? { ...c, isChecked: true } : c
        )
      }
      return prev
    })
  }

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showTimeoutMessage && !showEasterEgg) {
      const interval = timeRemaining <= 30 ? 500 : 1000
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, interval)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !showTimeoutMessage && !showEasterEgg) {
      // Check for Easter Egg (zero score)
      if (score === 0) {
        setShowEasterEgg(true)
      } else {
        // Check if score qualifies for leaderboard
        if (checkScoreQualification(score)) {
          setShowUsernameModal(true)
        } else {
          setShowTimeoutMessage(true)
        }
      }
    }
  }, [timeRemaining, showTimeoutMessage, showEasterEgg, score])

  // Generate checkboxes
  useEffect(() => {
    if (timeRemaining > 0 && !showTimeoutMessage) {
      const interval = setInterval(createCheckbox, 250) // New checkbox every 250ms (even more!)
      return () => clearInterval(interval)
    }
  }, [timeRemaining, showTimeoutMessage])

  // Animation frame
  useEffect(() => {
    if (timeRemaining > 0 && !showTimeoutMessage) {
      const animate = () => {
        animateCheckboxes()
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [timeRemaining, showTimeoutMessage])



  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'white',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header with Logo */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img
          src="/askbender_b!_green_on_blk.png"
          alt="AskBender"
          style={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer',
            objectFit: 'contain'
          }}
          onClick={() => window.history.back()}
        />
      </header>

      {/* Progress Bar */}
      <div style={{
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => (
            <div key={stepNumber} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1
            }}>
              {/* Step Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: stepNumber <= 3 ? 'none' : (stepNumber === 4 ? ((showTimeoutMessage || showEasterEgg) ? 'none' : '2px solid #000') : '2px solid #ccc'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: stepNumber <= 3 ? '#dc3545' : (stepNumber === 4 ? (showTimeoutMessage ? '#28a745' : (showEasterEgg ? '#dc3545' : 'transparent')) : 'transparent'),
                color: stepNumber <= 3 ? '#fff' : (stepNumber === 4 ? ((showTimeoutMessage || showEasterEgg) ? '#fff' : '#000') : '#ccc'),
                marginBottom: '8px'
              }}>
                {stepNumber <= 3 ? 'X' : (stepNumber === 4 ? (showTimeoutMessage ? '✓' : (showEasterEgg ? 'X' : '4')) : stepNumber)}
              </div>
              
              {/* Step Status */}
              <div style={{
                fontSize: stepNumber <= 3 ? '11px' : (stepNumber === 4 ? ((showTimeoutMessage || showEasterEgg) ? '11px' : '10px') : '10px'),
                color: stepNumber <= 3 ? '#dc3545' : (stepNumber === 4 ? (showTimeoutMessage ? '#28a745' : (showEasterEgg ? '#dc3545' : '#ccc')) : '#ccc'),
                textAlign: 'center',
                fontWeight: stepNumber <= 3 ? 'bold' : (stepNumber === 4 ? ((showTimeoutMessage || showEasterEgg) ? 'bold' : 'normal') : 'normal')
              }}>
                {stepNumber <= 3 ? 'FAIL' : (stepNumber === 4 ? (showTimeoutMessage ? 'PASSED' : (showEasterEgg ? 'FAIL' : 'CURRENT')) : '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#dc3545',
          border: '2px solid #dc3545',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ffffff'
        }}>
          Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>



      {/* Main Content */}
      <main style={{
        maxWidth: '650px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '16px'
          }}>
            Don't think. Just start Checking!
          </h1>
        </div>

        {/* Animation Container */}
        <div 
          ref={containerRef}
          style={{
            position: 'relative',
            height: '400px',
            width: '100%',
            overflow: 'hidden',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            boxShadow: isScorePulsing ? '0 0 30px #ffff00, 0 0 60px #ffff00, 0 0 90px #ffff00' : 'none',
            transition: 'all 0.3s ease',
            animation: isScorePulsing ? 'containerPulse 0.5s ease-in-out infinite' : 'none'
          }}
        >
          {/* Falling Checkboxes */}
          {checkboxes.map(checkbox => (
            <div
              key={checkbox.id}
              style={{
                position: 'absolute',
                left: checkbox.x,
                top: checkbox.y,
                transform: checkbox.isAngled ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.1s ease'
              }}
            >
              <input
                type="checkbox"
                checked={checkbox.isChecked}
                onMouseEnter={() => handleCheckboxHover(checkbox.id)}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: checkbox.isYellow ? '#ffff00' : 'white',
                  border: '3px solid #007bff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: checkbox.isChecked ? 0.5 : 1,
                  transform: checkbox.isAngled ? 'rotate(45deg)' : 'rotate(0deg)',
                  zIndex: 1000,
                  position: 'relative'
                }}
              />
            </div>
          ))}
        </div>

        {/* Score Display - Right below animation */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: '24px',
          padding: '0 20px'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#007bff',
            backgroundColor: isScorePulsing ? '#ffff00' : 'transparent',
            padding: isScorePulsing ? '12px 20px' : '0',
            borderRadius: isScorePulsing ? '12px' : '0',
            transition: 'all 0.3s ease',
            animation: isScorePulsing ? 'pulse 0.5s ease-in-out infinite' : 'none'
          }}>
            My social credit Acceptance Score: {score}
          </div>
        </div>

        {/* Leader Board */}
        <div style={{
          textAlign: 'left',
          marginTop: '16px',
          marginBottom: '24px',
          padding: '0 20px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#007bff',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Leader Board:</span>
            <button
              onClick={refreshLeaderboard}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.4'
          }}>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div key={entry.id} style={{ display: 'flex', marginBottom: '4px' }}>
                  <span style={{ width: '200px' }}>{index + 1}. {entry.username}</span>
                  <span style={{ fontWeight: 'bold' }}>{entry.score}</span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No scores yet. Be the first!
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Timeout Popup Overlay */}
      {showTimeoutMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#dc3545',
              marginBottom: '16px'
            }}>
              Time's Up!
            </div>
            <div style={{
              fontSize: '18px',
              color: '#007bff',
              marginBottom: '24px'
            }}>
              Final Score: {score}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => {
                  setTimeRemaining(60)
                  setScore(0)
                  setCheckboxes([])
                  setShowTimeoutMessage(false)
                  setShowEasterEgg(false)
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}
              >
                TRY AGAIN?
              </button>
              <button
                onClick={() => navigate('/starter-journey-3')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Easter Egg Popup */}
      {showEasterEgg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Easter Egg Emojis */}
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🐇💨
            </div>
            
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#dc3545',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              No F'n way. You just uncovered an Easter Egg! Which I may deliver in the form of AskBender schwag, that will last a lifetime! In the landfill. After you toss that s*, right? You ungrateful, icy cold prize winner. I'm making a note on your record:
            </div>
            
            <div style={{
              fontSize: '14px',
              color: '#333',
              textAlign: 'left',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              • Needs a Logo Down Jacket badly.<br/>
              • Looks gift horses right in the f'n mouth.<br/>
              • Didn't pickup dog's poop last Tuesday.<br/>
              • Cholesterol levels slowly improving after the Bacon bender.
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => navigate('/starter-journey-3')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Username Modal for Score Submission */}
      {showUsernameModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#28a745',
              marginBottom: '16px'
            }}>
              🎉 New High Score! 🎉
            </div>
            <div style={{
              fontSize: '18px',
              color: '#007bff',
              marginBottom: '24px'
            }}>
              Your Score: {score}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#333',
              marginBottom: '24px'
            }}>
              Enter your username to save your score:
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                marginBottom: '24px'
              }}
              maxLength={20}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => {
                  if (username.trim()) {
                    handleScoreSubmission(username.trim(), score)
                  }
                }}
                disabled={!username.trim() || isSubmittingScore}
                style={{
                  padding: '12px 24px',
                  backgroundColor: username.trim() && !isSubmittingScore ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: username.trim() && !isSubmittingScore ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}
              >
                {isSubmittingScore ? 'Saving...' : 'SAVE SCORE'}
              </button>
              <button
                onClick={() => {
                  setShowUsernameModal(false)
                  setShowTimeoutMessage(true)
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}
              >
                SKIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 