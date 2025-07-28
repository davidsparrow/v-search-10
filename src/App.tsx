import { Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { StartSearchPage } from './pages/StartSearchPage'
import { PreSearchPage1 } from './pages/PreSearchPage1'
import { AboutPage } from './pages/AboutPage'
import { SystemSettingsPage } from './pages/SystemSettingsPage'
import { useCloudStore } from './store/cloudStore'
import { supabase } from './lib/supabase'

function App() {
  const { currentTheme, setUser, setIsAuthenticated, setIsLoading } = useCloudStore()

  // Initialize auth state
  useEffect(() => {
    setIsLoading(true)
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          setIsAuthenticated(true)
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
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start-search" element={<StartSearchPage />} />
          <Route path="/pre-search-1" element={<PreSearchPage1 />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/system-settings" element={<SystemSettingsPage />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}

export default App 