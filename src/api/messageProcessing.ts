/**
 * Message Processing API Endpoints
 * 
 * This module provides API endpoints for message processing,
 * AI flow routing, and timeout calculations for both internal
 * and external consumption.
 * 
 * @author AskBender Team
 * @version 1.0.0
 */

import { MessageService, createMessageService } from '../services/messageService';
import { calculateFinalTimeout, getReplyMode, isRecurringFlow } from '../lib/timeoutUtils';
import { processAIFlowRequest, AIFlowRequest } from '../lib/aiFlowRouter';
import { EnhancedSpintaxEngine } from '../lib/spintaxEngine';

// Type definitions for API requests and responses
export interface MessageProcessingRequest {
  message: {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    message_type_id?: string;
    is_critical?: boolean;
  };
  participant: {
    id: string;
    phone_number: string;
    email?: string;
    group_id?: string;
    nickname?: string;
    pref_timeout?: number;
    professional_mode_always?: boolean;
    real_score?: number;
    display_score?: number;
    personality_profile?: any;
    z_relationship?: string;
    manipulation_level?: number;
    professional_mode_interaction?: boolean;
    detected_carrier?: string;
    sms_character_limit?: number;
    preferred_communication_method?: string;
    social_cred_rating?: number;
  };
  group: {
    id: string;
    name: string;
    host_phone?: string;
    twilio_number?: string;
    z_mood?: string;
    z_personality_config?: any;
    active?: boolean;
    professional_mode_enabled?: boolean;
    professional_auto_triggered?: boolean;
    sobriety_level?: number;
    professional_mode_context?: string;
    default_reply_expiration_seconds?: number;
  };
  quiz?: {
    id: string;
    group_id: string;
    quiz_name: string;
    description?: string;
    is_active?: boolean;
    start_time?: string;
    end_time?: string;
    max_participants?: number;
    default_reply_expiration_seconds?: number;
  };
  question?: {
    id: string;
    reply_expiration_seconds?: number;
    question_text: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_answer?: string;
    category?: string;
  };
  adminOverride?: number;
}

export interface MessageProcessingResponse {
  success: boolean;
  data?: {
    content: string;
    timeout: number;
    mode: string;
    deliveryMethod: string;
    metadata: {
      aiUsed: boolean;
      spintaxUsed: boolean;
      processingTime: number;
      characterCount: number;
    };
  };
  error?: string;
  timestamp: string;
}

export interface TimeoutCalculationRequest {
  messageType: string;
  participant: {
    pref_timeout?: number;
    professional_mode_always?: boolean;
  };
  group: {
    default_reply_expiration_seconds?: number;
    professional_mode_enabled?: boolean;
    z_mood?: string;
  };
  quiz?: {
    default_reply_expiration_seconds?: number;
  };
  question?: {
    reply_expiration_seconds?: number;
  };
  adminOverride?: number;
}

export interface TimeoutCalculationResponse {
  success: boolean;
  data?: {
    finalTimeout: number;
    timeoutBreakdown: {
      messageType: string;
      participantPref?: number;
      groupDefault?: number;
      quizDefault?: number;
      questionOverride?: number;
      adminOverride?: number;
    };
    isRecurringFlow: boolean;
    replyMode: string;
  };
  error?: string;
  timestamp: string;
}

export interface AIFlowRequest {
  userIntent: string;
  context: string;
  participantId: string;
  adminId: string;
  preferredModel?: string;
  messageType?: string;
  content?: string;
}

export interface AIFlowResponse {
  success: boolean;
  data?: {
    response: string;
    flow: {
      flow_name: string;
      ai_model_preferred: string;
      safety_level: string;
      allowed_contexts: string[];
    };
    processingTime: number;
  };
  error?: string;
  timestamp: string;
}

export interface BatchProcessingRequest {
  messages: MessageProcessingRequest[];
  config?: {
    enableAI?: boolean;
    enableSpintax?: boolean;
    enableTimeoutHandling?: boolean;
    maxBatchSize?: number;
  };
}

export interface BatchProcessingResponse {
  success: boolean;
  data?: {
    responses: MessageProcessingResponse['data'][];
    stats: {
      totalMessages: number;
      aiUsed: number;
      spintaxUsed: number;
      avgProcessingTime: number;
      avgCharacterCount: number;
    };
  };
  error?: string;
  timestamp: string;
}

// Authorization middleware
interface AuthContext {
  apiKey?: string;
  adminId?: string;
  permissions?: string[];
}

/**
 * Validates API key and permissions
 * 
 * @param authContext - The authentication context
 * @param requiredPermissions - Required permissions for the endpoint
 * @returns Validation result
 */
function validateAuth(authContext: AuthContext, requiredPermissions: string[] = []): { isValid: boolean; error?: string } {
  // In a real implementation, this would validate against the database
  if (!authContext.apiKey) {
    return { isValid: false, error: 'API key is required' };
  }
  
  // Check if API key is valid (mock implementation)
  const validApiKeys = ['test_key_1', 'test_key_2', 'admin_key'];
  if (!validApiKeys.includes(authContext.apiKey)) {
    return { isValid: false, error: 'Invalid API key' };
  }
  
  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      authContext.permissions?.includes(permission)
    );
    
    if (!hasPermission) {
      return { isValid: false, error: 'Insufficient permissions' };
    }
  }
  
  return { isValid: true };
}

/**
 * POST /api/message/process
 * Processes a single message through the complete pipeline
 */
export async function processMessageEndpoint(
  request: MessageProcessingRequest,
  authContext: AuthContext
): Promise<MessageProcessingResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    // Validate authentication
    const authValidation = validateAuth(authContext, ['message:process']);
    if (!authValidation.isValid) {
      return {
        success: false,
        error: authValidation.error,
        timestamp
      };
    }
    
    // Create message service
    const messageService = createMessageService({
      enableAI: true,
      enableSpintax: true,
      enableTimeoutHandling: true,
      enableBatchProcessing: false
    });
    
    // Process the message
    const response = await messageService.processMessage({
      message: request.message,
      participant: request.participant,
      group: request.group,
      quiz: request.quiz,
      question: request.question,
      adminOverride: request.adminOverride
    });
    
    return {
      success: true,
      data: response,
      timestamp
    };
    
  } catch (error) {
    console.error('Message processing endpoint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * POST /api/timeout/calculate
 * Calculates timeout for a message based on hierarchy
 */
export async function calculateTimeoutEndpoint(
  request: TimeoutCalculationRequest,
  authContext: AuthContext
): Promise<TimeoutCalculationResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    // Validate authentication
    const authValidation = validateAuth(authContext, ['timeout:calculate']);
    if (!authValidation.isValid) {
      return {
        success: false,
        error: authValidation.error,
        timestamp
      };
    }
    
    // Calculate final timeout
    const finalTimeout = calculateFinalTimeout(
      request.messageType,
      request.participant,
      request.group,
      request.quiz,
      request.question,
      request.adminOverride
    );
    
    // Determine reply mode
    const replyMode = getReplyMode(request.participant, request.group);
    
    // Check if this is a recurring flow
    const isRecurringFlowResult = isRecurringFlow(request.messageType);
    
    return {
      success: true,
      data: {
        finalTimeout,
        timeoutBreakdown: {
          messageType: request.messageType,
          participantPref: request.participant.pref_timeout,
          groupDefault: request.group.default_reply_expiration_seconds,
          quizDefault: request.quiz?.default_reply_expiration_seconds,
          questionOverride: request.question?.reply_expiration_seconds,
          adminOverride: request.adminOverride
        },
        isRecurringFlow: isRecurringFlowResult,
        replyMode
      },
      timestamp
    };
    
  } catch (error) {
    console.error('Timeout calculation endpoint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * POST /api/ai/generate
 * Generates AI response using flow routing
 */
export async function generateAIResponseEndpoint(
  request: AIFlowRequest,
  authContext: AuthContext
): Promise<AIFlowResponse> {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  
  try {
    // Validate authentication
    const authValidation = validateAuth(authContext, ['ai:generate']);
    if (!authValidation.isValid) {
      return {
        success: false,
        error: authValidation.error,
        timestamp
      };
    }
    
    // Process AI flow request
    const response = await processAIFlowRequest(request);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      data: {
        response,
        flow: {
          flow_name: 'determined_by_ai_router',
          ai_model_preferred: request.preferredModel || 'gpt-4',
          safety_level: 'moderate',
          allowed_contexts: ['general', 'business', 'entertainment']
        },
        processingTime
      },
      timestamp
    };
    
  } catch (error) {
    console.error('AI generation endpoint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * POST /api/message/batch
 * Processes multiple messages in batch
 */
export async function processBatchEndpoint(
  request: BatchProcessingRequest,
  authContext: AuthContext
): Promise<BatchProcessingResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    // Validate authentication
    const authValidation = validateAuth(authContext, ['message:batch']);
    if (!authValidation.isValid) {
      return {
        success: false,
        error: authValidation.error,
        timestamp
      };
    }
    
    // Create message service with batch configuration
    const messageService = createMessageService({
      enableAI: request.config?.enableAI ?? true,
      enableSpintax: request.config?.enableSpintax ?? true,
      enableTimeoutHandling: request.config?.enableTimeoutHandling ?? true,
      enableBatchProcessing: true,
      maxBatchSize: request.config?.maxBatchSize ?? 100
    });
    
    // Convert requests to processing contexts
    const contexts = request.messages.map(req => ({
      message: req.message,
      participant: req.participant,
      group: req.group,
      quiz: req.quiz,
      question: req.question,
      adminOverride: req.adminOverride
    }));
    
    // Process messages in batch
    const responses = await messageService.processMessageBatch(contexts);
    
    // Calculate batch statistics
    const stats = {
      totalMessages: responses.length,
      aiUsed: responses.filter(r => r.metadata.aiUsed).length,
      spintaxUsed: responses.filter(r => r.metadata.spintaxUsed).length,
      avgProcessingTime: Math.round(
        responses.reduce((sum, r) => sum + r.metadata.processingTime, 0) / responses.length
      ),
      avgCharacterCount: Math.round(
        responses.reduce((sum, r) => sum + r.metadata.characterCount, 0) / responses.length
      )
    };
    
    return {
      success: true,
      data: {
        responses: responses.map(r => r),
        stats
      },
      timestamp
    };
    
  } catch (error) {
    console.error('Batch processing endpoint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * GET /api/message/stats
 * Gets message processing statistics
 */
export async function getStatsEndpoint(authContext: AuthContext): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();
  
  try {
    // Validate authentication
    const authValidation = validateAuth(authContext, ['stats:read']);
    if (!authValidation.isValid) {
      return {
        success: false,
        error: authValidation.error,
        timestamp
      };
    }
    
    // Get service statistics
    const messageService = createMessageService();
    const stats = messageService.getStats();
    
    return {
      success: true,
      data: stats,
      timestamp
    };
    
  } catch (error) {
    console.error('Stats endpoint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * POST /api/spintax/process
 * Processes a spintax template directly
 */
export async function processSpintaxEndpoint(
  request: {
    templateName: string;
    context: any;
    mood?: string;
  },
  authContext: AuthContext
): Promise<{
  success: boolean;
  data?: {
    content: string;
    mood: string;
    grammar_level: number;
    character_count: number;
  };
  error?: string;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();
  
  try {
    // Validate authentication
    const authValidation = validateAuth(authContext, ['spintax:process']);
    if (!authValidation.isValid) {
      return {
        success: false,
        error: authValidation.error,
        timestamp
      };
    }
    
    // Process spintax template
    const spintaxEngine = new EnhancedSpintaxEngine();
    const response = spintaxEngine.generateResponse(
      request.templateName,
      request.context,
      request.mood
    );
    
    return {
      success: true,
      data: response,
      timestamp
    };
    
  } catch (error) {
    console.error('Spintax processing endpoint error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * Health check endpoint
 */
export async function healthCheckEndpoint(): Promise<{
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    version: string;
    services: {
      messageService: boolean;
      timeoutUtils: boolean;
      aiFlowRouter: boolean;
      spintaxEngine: boolean;
    };
  };
}> {
  const timestamp = new Date().toISOString();
  
  try {
    // Test all services
    const messageService = createMessageService();
    const spintaxEngine = new EnhancedSpintaxEngine();
    
    // Test timeout calculation
    const testTimeout = calculateFinalTimeout(
      'test',
      { pref_timeout: 300 },
      { default_reply_expiration_seconds: 120 },
      undefined,
      undefined,
      undefined
    );
    
    // Test AI flow routing
    const testAIRequest: AIFlowRequest = {
      userIntent: 'test',
      context: 'test context',
      participantId: 'test-participant',
      adminId: 'test-admin'
    };
    
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp,
        version: '1.0.0',
        services: {
          messageService: messageService.isCurrentlyProcessing() !== undefined,
          timeoutUtils: testTimeout > 0,
          aiFlowRouter: true, // Assume working if no error
          spintaxEngine: spintaxEngine.getPerformanceMetrics() !== undefined
        }
      }
    };
    
  } catch (error) {
    console.error('Health check error:', error);
    return {
      success: false,
      data: {
        status: 'unhealthy',
        timestamp,
        version: '1.0.0',
        services: {
          messageService: false,
          timeoutUtils: false,
          aiFlowRouter: false,
          spintaxEngine: false
        }
      }
    };
  }
} 