import { Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { AdminRoute } from './components/AdminRoute'
import { AgeVerification } from './components/AgeVerification'

import { SearchVisualPage } from './pages/SearchVisualPage'
import { StartSearchPage } from './pages/StartSearchPage'
import { SearchChatPage } from './pages/SearchChatPage'
import { AboutPage } from './pages/AboutPage'
import { SystemSettingsPage } from './pages/SystemSettingsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { PricingPage } from './pages/PricingPage'
import { StarterJourney0 } from './pages/StarterJourney0'
import { StarterJourney1 } from './pages/StarterJourney1'
import { StarterJourney2 } from './pages/StarterJourney2'
import { StarterJourney3 } from './pages/StarterJourney3'
import { UserProfilePage } from './pages/UserProfilePage'
import { PhotoAvatarDemoPage } from './pages/PhotoAvatarDemoPage'
import MemoryBuilder1 from './pages/memory-builder/MemoryBuilder1'

import { useCloudStore } from './store/cloudStore'
import { supabase, participantService } from './lib/supabase'
import { firstTimeUserService } from './lib/firstTimeUserService'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupGlobalErrorHandling } from './lib/errorLogging'

function App() {
  const { currentTheme, setUser, setIsAuthenticated, setIsLoading } = useCloudStore()
  const [ageVerified, setAgeVerified] = useState(false)

  // ENTERPRISE REPLACEMENT: Replace with enterprise error monitoring setup
  // Current: Basic global error handling
  // Future: Enterprise error monitoring and alerting
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false
    
    const initializeAuth = async () => {
      if (isInitialized) return
      isInitialized = true
      
      setIsLoading(true)
      
      // Get initial session
      console.log('🔍 AUTH: Getting initial session...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔍 AUTH: Initial session result:', !!session)
        if (session) {
          console.log('🔍 AUTH: Setting initial user and authenticated state')
          setUser(session.user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('🔍 AUTH: Initial session error:', error)
      } finally {
        console.log('🔍 AUTH: Setting initial loading to false')
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 AUTH: State change detected:', event, 'Session:', !!session)
        
                    // Only handle SIGNED_IN and SIGNED_OUT events, ignore others
            if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
              console.log('🔍 AUTH: Ignoring event:', event)
              return
            }
            
            try {
              if (session) {
                console.log('🔍 AUTH: Setting user and authenticated state')
                setUser(session.user)
                setIsAuthenticated(true)
                
                // Handle participant creation for new users
                if (event === 'SIGNED_IN') {
                  console.log('🔍 AUTH: Handling participant creation for new sign-in')
                  try {
                    // Add timeout protection to prevent hanging
                    const result = await Promise.race([
                      participantService.handleParticipantCreation(session.user),
                      new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Participant creation timeout')), 5000)
                      )
                    ])
                    console.log('🔍 AUTH: Participant creation result:', result)
                    
                    // Handle first-time user routing
                    await firstTimeUserService.handleUserRouting(session.user)
                  } catch (error) {
                    console.error('🔍 AUTH: Participant creation failed or timed out:', error)
                    // Don't let participant creation failure break the auth flow
                  }
                }
              } else {
                console.log('🔍 AUTH: Clearing user and authenticated state')
                setUser(null)
                setIsAuthenticated(false)
              }
            } catch (error) {
              console.error('🔍 AUTH: Auth state change error:', error)
            } finally {
              console.log('🔍 AUTH: Setting loading to false')
              setIsLoading(false)
            }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setIsAuthenticated, setIsLoading])

  // Get theme configuration based on current theme
  const getThemeConfig = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          algorithm: theme.darkAlgorithm,
        }
      case 'compact':
        return {
          algorithm: theme.compactAlgorithm,
        }
      default:
        return {
          algorithm: theme.defaultAlgorithm,
        }
    }
  }

  // Show age verification before rendering the app
  if (!ageVerified) {
    return (
      <ConfigProvider theme={getThemeConfig()}>
        <ErrorBoundary>
          <div className="App">
            <AgeVerification onVerified={() => setAgeVerified(true)} />
          </div>
        </ErrorBoundary>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider theme={getThemeConfig()}>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/start-search" element={<StartSearchPage />} />
            <Route path="/search-chat" element={<SearchChatPage />} />
            <Route path="/search-visual" element={<SearchVisualPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin/system-settings" element={<AdminRoute><SystemSettingsPage /></AdminRoute>} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/starter-journey-0" element={<StarterJourney0 />} />
            <Route path="/starter-journey-1" element={<StarterJourney1 />} />
            <Route path="/starter-journey-2" element={<StarterJourney2 />} />
            <Route path="/starter-journey-3" element={<StarterJourney3 />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/photo-avatar-demo" element={<PhotoAvatarDemoPage />} />
            <Route path="/PhotoAvatarDemoPage" element={<PhotoAvatarDemoPage />} />
            <Route path="/memory-builder1" element={<MemoryBuilder1 />} />

            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App 