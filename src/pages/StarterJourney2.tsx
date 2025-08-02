/* STARTER USER JOUNEY PAGE 2 of 4 */

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { leaderboardService } from '../lib/leaderboard'
import { LeaderboardEntry } from '../types/leaderboard'
import { socialCredService } from '../lib/socialCredService'
import { auth, participantService, supabase } from '../lib/supabase'
import { Form, Input } from 'antd'

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

  // Check if user has existing username from Supabase
  const checkExistingUsername = async (): Promise<string | null> => {
    try {
      // Check if user is authenticated and look up in Supabase
      const currentUser = await auth.getCurrentUser()
      
      if (currentUser) {
        console.log('User is authenticated, checking Supabase for nickname...')
        
        // Check participants table for user's nickname
        const { exists } = await participantService.checkExistingParticipant(currentUser.id)
        if (exists) {
          // If participant exists, get their nickname from the database
          const { data: participantData } = await supabase
            .from('participants')
            .select('nickname')
            .eq('eventria_user_id', currentUser.id)
            .single()
          
          if (participantData && participantData.nickname) {
            return participantData.nickname
          }
        }
        
        // Check leaderboard table as fallback
        const { data: leaderboardData } = await leaderboardService.getUserBestScore(currentUser.email || currentUser.id)
        if (leaderboardData && leaderboardData.length > 0) {
          return leaderboardData[0].username
        }
      }
      
      return null
    } catch (error) {
      console.error('Error checking existing username:', error)
      return null
    }
  }

  // Handle score submission
  const handleScoreSubmission = async (username: string, score: number) => {
    setIsSubmittingScore(true)
    console.log('Submitting score:', { username, score })
    
    try {
      // Calculate social cred rating
      const rating = socialCredService.calculateRating(score, showEasterEgg)
      console.log('Calculated social cred rating:', rating)
      
      // Update social cred rating
      const { data: ratingData, error: ratingError } = await socialCredService.updateUserRating(username, rating)
      console.log('Social cred rating update result:', { ratingData, ratingError })
      
      // Update leaderboard score
      const { data, error } = await leaderboardService.updateUserScore(username, score)
      console.log('Score submission result:', { data, error })
      
      if (data && !error) {
        // Update social cred rating display
        setSocialCredRating(rating)
        
        // Store the nickname for display
        setUserNickname(username.trim())
        
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
  const [socialCredRating, setSocialCredRating] = useState(0.0)
  const [hasWonEasterEgg, setHasWonEasterEgg] = useState(false)
  const [hasExistingUsername, setHasExistingUsername] = useState(false)
  const [userNickname, setUserNickname] = useState<string>('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm] = Form.useForm()
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const checkboxIdRef = useRef(0)

  // Update participant profile
  const updateParticipantProfile = async (nickname: string, phoneNumber: string) => {
    try {
      const currentUser = await auth.getCurrentUser()
      if (currentUser) {
        const { data, error } = await supabase
          .from('participants')
          .update({
            nickname: nickname,
            phone_number: phoneNumber
          })
          .eq('eventria_user_id', currentUser.id)
          .select()
        
        if (error) {
          console.error('Error updating participant profile:', error)
          return { success: false, error }
        }
        
        console.log('Participant profile updated successfully:', data)
        return { success: true, data }
      }
      return { success: false, error: 'No user found' }
    } catch (err) {
      console.error('Error updating participant profile:', err)
      return { success: false, error: err }
    }
  }

  const handleProfileUpdate = async (values: any) => {
    try {
      const result = await updateParticipantProfile(values.nickname, values.phoneNumber)
      
      if (result.success) {
        setShowProfileModal(false)
        setUserNickname(values.nickname)
        // Show success message
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile. Please try again.')
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong.')
    }
  }

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
        // Check for Easter Egg (zero score) - only if haven't won it before
        if (score === 0 && !hasWonEasterEgg) {
          setShowEasterEgg(true)
          setHasWonEasterEgg(true)
          // Set social cred rating for Easter Egg
          setSocialCredRating(1.5)
        } else {
          // Check if score qualifies for leaderboard
          if (checkScoreQualification(score)) {
            // Check for existing username before showing modal
            const checkAndShowModal = async () => {
              const existingUsername = await checkExistingUsername()
              if (existingUsername) {
                setUsername(existingUsername)
                setUserNickname(existingUsername)
                setHasExistingUsername(true)
              } else {
                setUsername('')
                setUserNickname('')
                setHasExistingUsername(false)
              }
              setShowUsernameModal(true)
            }
            checkAndShowModal()
          } else {
            setShowTimeoutMessage(true)
            // Set social cred rating for normal completion
            setSocialCredRating(0.5)
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
        alignItems: 'center',
        justifyContent: 'space-between'
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000'
          }}>
            {userNickname || 'My Social Cred:'}
          </span>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'help'
            }}
            title="Your Social Cred. Don't worry you've got a year or two before this + AI controls your society."
          >
            {socialCredRating.toFixed(1)}
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            title="Update your profile"
          >
            Profile
          </button>
        </div>
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
            Personalized Compliance Assessment. Go!
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
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#007bff'
          }}>
            My Social Acceptance v Dissent (SAD) Ratio: 0.{score.toString().padStart(5, '0')}
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
            marginBottom: '8px'
          }}>
            <span>Leader Board:</span>
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
                  <span style={{ fontWeight: 'bold' }}>0.{entry.score.toString().padStart(5, '0')}</span>
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
              Final Score: 0.{score.toString().padStart(5, '0')}
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
                  setHasExistingUsername(false)
                  setUsername('')
                  // Note: We don't reset hasWonEasterEgg so user can't win Easter Egg again
                  // Note: We don't reset userNickname so it persists across game sessions
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
              • Cholesterol levels slowly improving after the long bacon weekend.
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
                  setShowEasterEgg(false)
                  setHasExistingUsername(false)
                  setUsername('')
                  // Note: We don't reset hasWonEasterEgg so user can't win Easter Egg again
                  // Note: We don't reset userNickname so it persists across game sessions
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
              Your Score: 0.{score.toString().padStart(5, '0')}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#333',
              marginBottom: '24px'
            }}>
              {hasExistingUsername ? 'Your existing nickname:' : 'Enter your username to save your score:'}
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={username}
                onChange={hasExistingUsername ? undefined : (e) => setUsername(e.target.value)}
                placeholder={hasExistingUsername ? '' : "Enter username..."}
                readOnly={hasExistingUsername}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: hasExistingUsername ? '2px solid #ccc' : '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  marginBottom: '24px',
                  backgroundColor: hasExistingUsername ? '#f8f9fa' : 'white',
                  cursor: hasExistingUsername ? 'not-allowed' : 'text',
                  color: hasExistingUsername ? '#666' : '#000'
                }}
                maxLength={20}
                title={hasExistingUsername ? "Recover from this bad decision in your User Profile after International Bank Transfers are confirmed." : undefined}
              />
            </div>
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

      {/* Profile Update Modal */}
      {showProfileModal && (
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
              color: '#007bff',
              marginBottom: '16px'
            }}>
              Update Your Profile
            </div>
            <Form
              form={profileForm}
              onFinish={handleProfileUpdate}
              layout="vertical"
            >
              <Form.Item
                label="Nickname"
                name="nickname"
                rules={[{ required: true, message: 'Please enter a nickname!' }]}
              >
                <Input placeholder="Enter your nickname" />
              </Form.Item>
              
              <Form.Item
                label="Phone Number"
                name="phoneNumber"
                rules={[{ required: true, message: 'Please enter your phone number!' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => profileForm.submit()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Update Profile
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  )
} 