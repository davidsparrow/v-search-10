import { participantService } from './supabase'

export const firstTimeUserService = {
  // Check if user is first-time (new participant)
  checkAndRouteFirstTimeUser: async (user: any) => {
    if (!user) return { isFirstTime: false }
    
    const { exists } = await participantService.checkExistingParticipant(user.id)
    return { isFirstTime: !exists }
  },
  
  // Route first-time user to starter journey
  routeFirstTimeUser: () => {
    window.location.href = '/starter-journey-0'
  },
  
  // Route existing user to normal flow
  routeExistingUser: () => {
    window.location.href = '/start-search'
  },
  
  // Handle routing decision based on user status
  handleUserRouting: async (user: any) => {
    const { isFirstTime } = await firstTimeUserService.checkAndRouteFirstTimeUser(user)
    
    if (isFirstTime) {
      firstTimeUserService.routeFirstTimeUser()
    } else {
      firstTimeUserService.routeExistingUser()
    }
  }
} 