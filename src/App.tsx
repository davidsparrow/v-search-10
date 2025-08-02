import { Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { TestHomePage } from './pages/TestHomePage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { StartSearchPage } from './pages/StartSearchPage'
import { PreSearchPage1 } from './pages/PreSearchPage1'
import { AboutPage } from './pages/AboutPage'
import { SystemSettingsPage } from './pages/SystemSettingsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { PricingPage } from './pages/PricingPage'
import { PricingPageV2 } from './pages/PricingPageV2'
import { StarterJourney1 } from './pages/StarterJourney1'
import { StarterJourney2 } from './pages/StarterJourney2'
import { StarterJourney3 } from './pages/StarterJourney3'

import { useCloudStore } from './store/cloudStore'
import { supabase, participantService } from './lib/supabase'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupGlobalErrorHandling } from './lib/errorLogging'

function App() {
  const { currentTheme, setUser, setIsAuthenticated, setIsLoading } = useCloudStore()

  // ENTERPRISE REPLACEMENT: Replace with enterprise error monitoring setup
  // Current: Basic global error handling
  // Future: Enterprise error monitoring and alerting
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  // Initialize auth state
  useEffect(() => {
    setIsLoading(true)
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
        // Handle participant creation for initial session
        participantService.handleParticipantCreation(session.user)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          setIsAuthenticated(true)
          
          // Handle participant creation for auth state changes
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('Auth state change - handling participant creation:', event)
            const result = await participantService.handleParticipantCreation(session.user)
            console.log('Participant creation result:', result)
          }
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
        setIsLoading(false)
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

  return (
    <ConfigProvider theme={getThemeConfig()}>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test-home" element={<TestHomePage />} />
            <Route path="/start-search" element={<StartSearchPage />} />
            <Route path="/pre-search-1" element={<PreSearchPage1 />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin/system-settings" element={<SystemSettingsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/pricing-v2" element={<PricingPageV2 />} />
            <Route path="/pricing-2" element={<PricingPageV2 />} />
            <Route path="/pricing2" element={<PricingPageV2 />} />
            <Route path="/starter-journey-1" element={<StarterJourney1 />} />
            <Route path="/starter-journey-2" element={<StarterJourney2 />} />
            <Route path="/starter-journey-3" element={<StarterJourney3 />} />

            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App 