import { participantService } from './supabase'
import { supabase } from './supabase'

export const firstTimeUserService = {
  // Check if user has completed terms acceptance
  checkTermsAcceptance: async (user: any) => {
    if (!user) return { hasAcceptedTerms: false }
    
    try {
      // Check if participant exists and has accepted terms
      const { data: participant, error } = await supabase
        .from('participants')
        .select('terms_accepted, terms_accepted_at')
        .eq('eventria_user_id', user.id)
        .single()
      
      if (error || !participant) {
        console.log('No participant found or error:', error)
        return { hasAcceptedTerms: false }
      }
      
      // Check if terms were accepted
      const hasAcceptedTerms = !!(participant.terms_accepted && participant.terms_accepted_at)
      
      console.log('Terms acceptance check:', {
        userId: user.id,
        termsAccepted: participant.terms_accepted,
        termsAcceptedAt: participant.terms_accepted_at,
        hasAcceptedTerms
      })
      
      return { hasAcceptedTerms }
    } catch (error) {
      console.error('Error checking terms acceptance:', error)
      return { hasAcceptedTerms: false }
    }
  },
  
  // Check if user is first-time (hasn't accepted terms)
  checkAndRouteFirstTimeUser: async (user: any) => {
    if (!user) return { isFirstTime: false }
    
    const { hasAcceptedTerms } = await firstTimeUserService.checkTermsAcceptance(user)
    return { isFirstTime: !hasAcceptedTerms }
  },
  
  // Route first-time user to starter journey
  routeFirstTimeUser: () => {
    console.log('Routing first-time user to StarterJourney0')
    window.location.href = '/starter-journey-0'
  },
  
  // Route existing user to normal flow
  routeExistingUser: () => {
    console.log('Routing existing user to start-search')
    window.location.href = '/start-search'
  },
  
  // Handle routing decision based on terms acceptance
  handleUserRouting: async (user: any) => {
    console.log('Handling user routing for:', user.id)
    const { isFirstTime } = await firstTimeUserService.checkAndRouteFirstTimeUser(user)
    
    if (isFirstTime) {
      firstTimeUserService.routeFirstTimeUser()
    } else {
      firstTimeUserService.routeExistingUser()
    }
  }
} 