// AskBender Tier System - Flexible for Future Eventria.ai Integration

// ============================================================================
// TIER DEFINITIONS (Configurable via Database)
// ============================================================================

export type AskBenderTier = 'fresh_meat' | 'lab_rat' | 'free_range'

export interface AskBenderTierLimits {
  maxQuizzes: number // -1 = unlimited
  maxParticipants: number // -1 = unlimited
  features: string[]
  price: number // in cents
}

// Default tier configurations (can be overridden by database)
export const DEFAULT_ASKBENDER_TIERS: Record<AskBenderTier, AskBenderTierLimits> = {
  fresh_meat: {
    maxQuizzes: 1,
    maxParticipants: 20,
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'viral_content'],
    price: 0
  },
  lab_rat: {
    maxQuizzes: -1, // unlimited
    maxParticipants: 100,
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'viral_content', 'memory_retention_basic', 'answer_recycling', 'cross_domain_access'],
    price: 700
  },
  free_range: {
    maxQuizzes: -1, // unlimited
    maxParticipants: 500,
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'viral_content', 'memory_retention_advanced', 'answer_recycling', 'cross_domain_access', 'advanced_analytics', 'custom_grammar_rules', 'priority_support'],
    price: 2700
  }
}

// ============================================================================
// FEATURE DEFINITIONS (Extensible for Future Features)
// ============================================================================

export type AskBenderFeature = 
  | 'basic_quiz_creation'
  | 'professional_mode'
  | 'sms_delivery'
  | 'email_fallback'
  | 'basic_analytics'
  | 'advanced_analytics'
  | 'memory_retention_basic'
  | 'memory_retention_advanced'
  | 'answer_recycling'
  | 'cross_domain_access'
  | 'viral_content'
  | 'custom_grammar_rules'
  | 'priority_support'
  // FUTURE: Add more features as they're developed
  | 'ai_personality_customization'
  | 'advanced_tournaments'
  | 'cross_group_memory'
  | 'enterprise_integrations'

export interface FeatureDefinition {
  name: AskBenderFeature
  description: string
  complexity: 'low' | 'medium' | 'high'
  dependencies: string[]
  apiEndpoint?: string
  databaseTable?: string
}

// Feature definitions for validation and documentation
export const ASKBENDER_FEATURES: Record<AskBenderFeature, FeatureDefinition> = {
  basic_quiz_creation: {
    name: 'basic_quiz_creation',
    description: 'Create and manage basic quizzes',
    complexity: 'low',
    dependencies: ['Groups table', 'Quizzes table'],
    apiEndpoint: '/api/quizzes/create',
    databaseTable: 'Groups, Quizzes'
  },
  professional_mode: {
    name: 'professional_mode',
    description: 'Access to professional mode for respectful events',
    complexity: 'medium',
    dependencies: ['Groups.professional_mode_enabled'],
    apiEndpoint: '/api/groups/professional-mode',
    databaseTable: 'Groups'
  },
  sms_delivery: {
    name: 'sms_delivery',
    description: 'Send SMS messages to participants',
    complexity: 'medium',
    dependencies: ['Twilio integration'],
    apiEndpoint: '/api/messages/send',
    databaseTable: 'Messages'
  },
  email_fallback: {
    name: 'email_fallback',
    description: 'Email fallback when SMS fails',
    complexity: 'medium',
    dependencies: ['SendGrid integration'],
    apiEndpoint: '/api/messages/fallback',
    databaseTable: 'Messages'
  },
  basic_analytics: {
    name: 'basic_analytics',
    description: 'Basic quiz and participant analytics',
    complexity: 'low',
    dependencies: ['Messages table', 'Participants table'],
    apiEndpoint: '/api/analytics/basic',
    databaseTable: 'Messages, Participants'
  },
  advanced_analytics: {
    name: 'advanced_analytics',
    description: 'Advanced analytics and reporting',
    complexity: 'high',
    dependencies: ['Analytics service', 'Data warehouse'],
    apiEndpoint: '/api/analytics/advanced',
    databaseTable: 'Analytics service'
  },
  memory_retention_basic: {
    name: 'memory_retention_basic',
    description: 'Basic participant memory retention',
    complexity: 'medium',
    dependencies: ['Participants.personality_profile'],
    apiEndpoint: '/api/participants/memory',
    databaseTable: 'Participants'
  },
  memory_retention_advanced: {
    name: 'memory_retention_advanced',
    description: 'Advanced participant memory and personality tracking',
    complexity: 'medium',
    dependencies: ['Participants.personality_profile'],
    apiEndpoint: '/api/participants/memory/advanced',
    databaseTable: 'Participants'
  },
  answer_recycling: {
    name: 'answer_recycling',
    description: 'Recycle and reuse participant answers',
    complexity: 'medium',
    dependencies: ['Custom_Questions table'],
    apiEndpoint: '/api/quizzes/recycle-answers',
    databaseTable: 'Custom_Questions'
  },
  cross_domain_access: {
    name: 'cross_domain_access',
    description: 'Access to cross-domain features with Eventria.ai',
    complexity: 'high',
    dependencies: ['Supabase RLS', 'Eventria.ai API'],
    apiEndpoint: '/api/auth/cross-domain',
    databaseTable: 'Cross-domain tables'
  },
  viral_content: {
    name: 'viral_content',
    description: 'Generate viral social media content',
    complexity: 'medium',
    dependencies: ['Social media APIs'],
    apiEndpoint: '/api/social/generate',
    databaseTable: 'Social content'
  },
  custom_grammar_rules: {
    name: 'custom_grammar_rules',
    description: 'Custom grammar and personality rules',
    complexity: 'high',
    dependencies: ['OpenAI integration'],
    apiEndpoint: '/api/groups/grammar-rules',
    databaseTable: 'Groups.custom_grammar_rules'
  },
  priority_support: {
    name: 'priority_support',
    description: 'Priority customer support access',
    complexity: 'low',
    dependencies: ['Support system'],
    apiEndpoint: '/api/support/priority',
    databaseTable: 'Support tickets'
  },
  // FUTURE FEATURES (Placeholders for future development)
  ai_personality_customization: {
    name: 'ai_personality_customization',
    description: 'Customize AI personality for different event types',
    complexity: 'high',
    dependencies: ['OpenAI integration', 'Personality profiles'],
    apiEndpoint: '/api/ai/personality',
    databaseTable: 'AI_Personalities'
  },
  advanced_tournaments: {
    name: 'advanced_tournaments',
    description: 'Advanced tournament and competition features',
    complexity: 'high',
    dependencies: ['Tournament system', 'Scoring engine'],
    apiEndpoint: '/api/tournaments',
    databaseTable: 'Tournaments'
  },
  cross_group_memory: {
    name: 'cross_group_memory',
    description: 'Share memories and data across multiple groups',
    complexity: 'high',
    dependencies: ['Cross-group database', 'Memory sharing'],
    apiEndpoint: '/api/memory/cross-group',
    databaseTable: 'Cross_Group_Memories'
  },
  enterprise_integrations: {
    name: 'enterprise_integrations',
    description: 'Enterprise-level integrations and features',
    complexity: 'high',
    dependencies: ['Enterprise APIs', 'SSO integration'],
    apiEndpoint: '/api/enterprise',
    databaseTable: 'Enterprise_Integrations'
  }
}

// ============================================================================
// CROSS-DOMAIN INTEGRATION (Future Eventria.ai Support)
// ============================================================================

// Placeholder for future Eventria.ai tier definitions
export type EventriaTier = 'free' | 'lightweight' | 'heavyweight' | 'contender' | 'champion'

export interface CrossDomainAccess {
  askbenderTier: AskBenderTier
  eventriaTier?: EventriaTier // Optional for future use
  features: AskBenderFeature[]
}

// Cross-domain tier mapping (will be populated when Eventria.ai is built)
export const CROSS_DOMAIN_ACCESS: Record<EventriaTier, CrossDomainAccess> = {
  free: {
    askbenderTier: 'fresh_meat',
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics']
  },
  lightweight: {
    askbenderTier: 'lab_rat',
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'memory_retention_basic', 'answer_recycling', 'cross_domain_access']
  },
  heavyweight: {
    askbenderTier: 'free_range',
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'memory_retention_advanced', 'answer_recycling', 'cross_domain_access', 'advanced_analytics', 'custom_grammar_rules', 'priority_support']
  },
  contender: {
    askbenderTier: 'free_range',
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'memory_retention_advanced', 'answer_recycling', 'cross_domain_access', 'advanced_analytics', 'custom_grammar_rules', 'priority_support']
  },
  champion: {
    askbenderTier: 'free_range',
    features: ['basic_quiz_creation', 'professional_mode', 'sms_delivery', 'email_fallback', 'basic_analytics', 'memory_retention_advanced', 'answer_recycling', 'cross_domain_access', 'advanced_analytics', 'custom_grammar_rules', 'priority_support']
  }
}

// ============================================================================
// VALIDATION FUNCTIONS (Flexible for Future Enhancements)
// ============================================================================

export interface TierValidationResult {
  hasAccess: boolean
  reason?: string
  suggestedUpgrade?: AskBenderTier
}

export const validateFeatureAccess = (
  userTier: AskBenderTier,
  requiredFeature: AskBenderFeature,
  eventriaTier?: EventriaTier
): TierValidationResult => {
  // Get effective tier (Eventria.ai can override AskBender tier)
  const effectiveTier = eventriaTier ? CROSS_DOMAIN_ACCESS[eventriaTier].askbenderTier : userTier
  
  // Check if feature is available in user's tier
  const tierFeatures = DEFAULT_ASKBENDER_TIERS[effectiveTier].features
  const hasAccess = tierFeatures.includes(requiredFeature)
  
  if (!hasAccess) {
    // Find the lowest tier that has this feature
    const tiers: AskBenderTier[] = ['fresh_meat', 'lab_rat', 'free_range']
    const suggestedUpgrade = tiers.find(tier => 
      DEFAULT_ASKBENDER_TIERS[tier].features.includes(requiredFeature)
    )
    
    return {
      hasAccess: false,
      reason: `Feature '${requiredFeature}' requires a higher tier`,
      suggestedUpgrade
    }
  }
  
  return { hasAccess: true }
}

export const validateParticipantLimit = (
  userTier: AskBenderTier,
  currentParticipants: number,
  eventriaTier?: EventriaTier
): TierValidationResult => {
  const effectiveTier = eventriaTier ? CROSS_DOMAIN_ACCESS[eventriaTier].askbenderTier : userTier
  const maxParticipants = DEFAULT_ASKBENDER_TIERS[effectiveTier].maxParticipants
  
  if (maxParticipants === -1) {
    return { hasAccess: true } // Unlimited
  }
  
  const hasAccess = currentParticipants < maxParticipants
  
  if (!hasAccess) {
    const tiers: AskBenderTier[] = ['fresh_meat', 'lab_rat', 'free_range']
    const suggestedUpgrade = tiers.find(tier => 
      DEFAULT_ASKBENDER_TIERS[tier].maxParticipants > maxParticipants || 
      DEFAULT_ASKBENDER_TIERS[tier].maxParticipants === -1
    )
    
    return {
      hasAccess: false,
      reason: `Participant limit exceeded. Current: ${currentParticipants}, Limit: ${maxParticipants}`,
      suggestedUpgrade
    }
  }
  
  return { hasAccess: true }
}

export const validateQuizLimit = (
  userTier: AskBenderTier,
  currentQuizzes: number,
  eventriaTier?: EventriaTier
): TierValidationResult => {
  const effectiveTier = eventriaTier ? CROSS_DOMAIN_ACCESS[eventriaTier].askbenderTier : userTier
  const maxQuizzes = DEFAULT_ASKBENDER_TIERS[effectiveTier].maxQuizzes
  
  if (maxQuizzes === -1) {
    return { hasAccess: true } // Unlimited
  }
  
  const hasAccess = currentQuizzes < maxQuizzes
  
  if (!hasAccess) {
    const tiers: AskBenderTier[] = ['fresh_meat', 'lab_rat', 'free_range']
    const suggestedUpgrade = tiers.find(tier => 
      DEFAULT_ASKBENDER_TIERS[tier].maxQuizzes > maxQuizzes || 
      DEFAULT_ASKBENDER_TIERS[tier].maxQuizzes === -1
    )
    
    return {
      hasAccess: false,
      reason: `Quiz limit exceeded. Current: ${currentQuizzes}, Limit: ${maxQuizzes}`,
      suggestedUpgrade
    }
  }
  
  return { hasAccess: true }
}

// ============================================================================
// UTILITY FUNCTIONS (For UI and API Integration)
// ============================================================================

export const getTierDisplayName = (tier: AskBenderTier): string => {
  const displayNames: Record<AskBenderTier, string> = {
    fresh_meat: 'Fresh Meat',
    lab_rat: 'Lab Rat',
    free_range: 'Free Range'
  }
  return displayNames[tier]
}

export const getTierPrice = (tier: AskBenderTier): number => {
  return DEFAULT_ASKBENDER_TIERS[tier].price
}

export const getTierFeatures = (tier: AskBenderTier): AskBenderFeature[] => {
  return DEFAULT_ASKBENDER_TIERS[tier].features as AskBenderFeature[]
}

export const isUnlimited = (value: number): boolean => {
  return value === -1
}

// ============================================================================
// FUTURE ENHANCEMENTS (Placeholder for Eventria.ai Integration)
// ============================================================================

// TODO: When Eventria.ai is built, add these functions:
// - validateCrossDomainAccess(userId: string): Promise<CrossDomainAccess>
// - getEventriaTier(userId: string): Promise<EventriaTier>
// - resolveEffectiveTier(askbenderTier: AskBenderTier, eventriaTier?: EventriaTier): AskBenderTier
// - validateSubscriptionStatus(userId: string): Promise<boolean> 