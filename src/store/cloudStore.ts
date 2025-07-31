import { create } from 'zustand'
import { Business, CloudConfig, SearchFilters } from '../types/business'
import { Message, SessionInterruption } from '../types/message'
import { sampleBusinesses } from '../data/sampleBusinesses'

// Theme configuration interface
interface ThemeConfig {
  name: string
  background: string
  cardBackground: string
  cardBorder: string
  cardShadow: string
  textPrimary: string
  textSecondary: string
  accentColor: string
  buttonPrimary: string
  buttonSecondary: string
  headerBackground: string
  headerBorder: string
  logoColor: string
  logoAccentColor: string
  modalBackground: string
  modalBorder: string
}

// Theme configurations
const themeConfigs: Record<string, ThemeConfig> = {
  dark: {
    name: 'Dark Theme',
    background: '#000000',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    accentColor: '#ff0000',
    buttonPrimary: '#3b82f6',
    buttonSecondary: 'rgba(255, 255, 255, 0.2)',
    headerBackground: 'rgba(0, 0, 0, 0.9)',
    headerBorder: 'rgba(255, 255, 255, 0.1)',
    logoColor: '#ffffff',
    logoAccentColor: '#ff0000',
    modalBackground: 'rgba(0, 0, 0, 0.95)',
    modalBorder: 'rgba(255, 255, 255, 0.2)'
  },
  default: {
    name: 'Default Theme',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    accentColor: '#667eea',
    buttonPrimary: '#667eea',
    buttonSecondary: 'rgba(255, 255, 255, 0.2)',
    headerBackground: 'rgba(255, 255, 255, 0.1)',
    headerBorder: 'rgba(255, 255, 255, 0.2)',
    logoColor: '#ffffff',
    logoAccentColor: '#667eea',
    modalBackground: 'rgba(255, 255, 255, 0.95)',
    modalBorder: 'rgba(255, 255, 255, 0.2)'
  },
  compact: {
    name: 'Compact Theme',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.15)',
    cardBorder: 'rgba(255, 255, 255, 0.25)',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#f0f0f0', // Changed from #ffffff to off-white
    accentColor: '#f5576c',
    buttonPrimary: '#f5576c',
    buttonSecondary: 'rgba(245, 87, 108, 0.2)',
    headerBackground: 'rgba(255, 255, 255, 0.15)',
    headerBorder: 'rgba(255, 255, 255, 0.25)',
    logoColor: '#ffffff',
    logoAccentColor: '#f5576c',
    modalBackground: 'rgba(255, 255, 255, 0.95)',
    modalBorder: 'rgba(255, 255, 255, 0.25)'
  },
  white: {
    name: 'White Theme',
    background: '#ffffff',
    cardBackground: 'rgba(0, 0, 0, 0.05)',
    cardBorder: 'rgba(0, 0, 0, 0.1)',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    textPrimary: '#000000',
    textSecondary: '#8c8c8c', // Changed to darker grey for better visibility
    accentColor: '#1890ff',
    buttonPrimary: '#1890ff',
    buttonSecondary: 'rgba(24, 144, 255, 0.1)',
    headerBackground: 'rgba(255, 255, 255, 0.95)',
    headerBorder: 'rgba(0, 0, 0, 0.1)',
    logoColor: '#000000',
    logoAccentColor: '#1890ff',
    modalBackground: 'rgba(255, 255, 255, 0.98)',
    modalBorder: 'rgba(0, 0, 0, 0.1)'
  }
}

interface CloudState {
  // Auth state
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Business data
  businesses: Business[]
  selectedBusiness: Business | null
  hoveredBusiness: Business | null
  
  // Physics configuration
  config: CloudConfig
  
  // Animation state
  isAnimating: boolean
  animationSpeed: number
  
  // Search and filters
  searchFilters: SearchFilters
  searchResults: Business[]
  
  // Theme state
  currentTheme: 'default' | 'dark' | 'compact' | 'white'
  
  // Actions
  selectBusiness: (business: Business | null) => void
  hoverBusiness: (business: Business | null) => void
  updateBusinessPosition: (id: string, x: number, y: number) => void
  updateBusinessVelocity: (id: string, vx: number, vy: number) => void
  toggleAnimation: () => void
  setAnimationSpeed: (speed: number) => void
  updateConfig: (updates: Partial<CloudConfig>) => void
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  performSearch: () => void
  resetSearch: () => void
  setTheme: (theme: 'default' | 'dark' | 'compact' | 'white') => void
  getThemeConfig: () => ThemeConfig
  
  // Auth actions
  setUser: (user: any | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
}

// Add critical message state to the store
interface CloudStore {
  // Auth state
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Business data
  businesses: Business[]
  selectedBusiness: Business | null
  hoveredBusiness: Business | null
  
  // Physics configuration
  config: CloudConfig
  
  // Animation state
  isAnimating: boolean
  animationSpeed: number
  
  // Search and filters
  searchFilters: SearchFilters
  searchResults: Business[]
  
  // Theme state
  currentTheme: 'default' | 'dark' | 'compact' | 'white'
  
  // Critical messages
  criticalMessages: Message[];
  sessionInterruptions: SessionInterruption[];
  
  // Actions
  selectBusiness: (business: Business | null) => void
  hoverBusiness: (business: Business | null) => void
  updateBusinessPosition: (id: string, x: number, y: number) => void
  updateBusinessVelocity: (id: string, vx: number, vy: number) => void
  toggleAnimation: () => void
  setAnimationSpeed: (speed: number) => void
  updateConfig: (updates: Partial<CloudConfig>) => void
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  performSearch: () => void
  resetSearch: () => void
  setTheme: (theme: 'default' | 'dark' | 'compact' | 'white') => void
  getThemeConfig: () => ThemeConfig
  
  // Auth actions
  setUser: (user: any | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  
  // Critical message actions
  addCriticalMessage: (message: Message) => void;
  updateCriticalMessageStatus: (messageId: string, status: Message['status']) => void;
  addSessionInterruption: (interruption: SessionInterruption) => void;
  resumeSessionInterruption: (interruptionId: string) => void;
}

const defaultConfig: CloudConfig = {
  width: 800,
  height: 600,
  animationSpeed: 1.0,
  clusteringEnabled: true,
  damping: 0.98,
  repulsionForce: 1000,
  attractionForce: 500
}

const defaultSearchFilters: SearchFilters = {
  category: '',
  subCategory: '',
  maxDistance: 50,
  minRating: 0,
  maxPrice: 1000,
  verifiedOnly: false,
  featuredOnly: false
}

export const useCloudStore = create<CloudStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  businesses: sampleBusinesses,
  selectedBusiness: null,
  hoveredBusiness: null,
  config: defaultConfig,
  isAnimating: false,
  animationSpeed: 1.0,
  searchFilters: defaultSearchFilters,
  searchResults: sampleBusinesses,
  currentTheme: 'dark', // Changed to dark as default
  criticalMessages: [],
  sessionInterruptions: [],
  
  // Actions
  selectBusiness: (business) => set({ selectedBusiness: business }),
  
  hoverBusiness: (business) => set({ hoveredBusiness: business }),
  
  updateBusinessPosition: (id, x, y) => set((state) => ({
    businesses: state.businesses.map(business =>
      business.id === id ? { ...business, x, y } : business
    )
  })),
  
  updateBusinessVelocity: (id, vx, vy) => set((state) => ({
    businesses: state.businesses.map(business =>
      business.id === id ? { ...business, vx, vy } : business
    )
  })),
  
  toggleAnimation: () => set((state) => ({ isAnimating: !state.isAnimating })),
  
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  
  updateConfig: (updates) => set((state) => ({
    config: { ...state.config, ...updates }
  })),
  
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  
  performSearch: () => {
    const { businesses, searchFilters } = get()
    const results = businesses.filter(business => {
      if (searchFilters.category && business.category !== searchFilters.category) return false
      if (searchFilters.subCategory && business.subCategory !== searchFilters.subCategory) return false
      if (business.rating < searchFilters.minRating) return false
      if (business.price > searchFilters.maxPrice) return false
      if (searchFilters.verifiedOnly && !business.verified) return false
      if (searchFilters.featuredOnly && !business.featured) return false
      return true
    })
    set({ searchResults: results })
  },
  
  resetSearch: () => set((state) => ({
    searchFilters: defaultSearchFilters,
    searchResults: state.businesses
  })),
  
  setTheme: (theme) => set({ currentTheme: theme }),
  
  getThemeConfig: () => {
    const { currentTheme } = get()
    return themeConfigs[currentTheme] || themeConfigs.dark
  },
  
  // Auth actions
  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Critical message actions
  addCriticalMessage: (message: Message) => {
    set((state) => ({
      criticalMessages: [...state.criticalMessages, message]
    }));
  },

  updateCriticalMessageStatus: (messageId: string, status: Message['status']) => {
    set((state) => ({
      criticalMessages: state.criticalMessages.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    }));
  },

  addSessionInterruption: (interruption: SessionInterruption) => {
    set((state) => ({
      sessionInterruptions: [...state.sessionInterruptions, interruption]
    }));
  },

  resumeSessionInterruption: (interruptionId: string) => {
    set((state) => ({
      sessionInterruptions: state.sessionInterruptions.map(interruption =>
        interruption.id === interruptionId 
          ? { ...interruption, resumed_at: new Date() }
          : interruption
      )
    }));
  },
})) 