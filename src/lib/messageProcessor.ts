/**
 * Message Processor for AskBender Message Processing
 * 
 * This module handles incoming message processing, response generation,
 * and integration with timeout calculations and AI flows.
 * 
 * @author AskBender Team
 * @version 1.0.0
 */

import { calculateFinalTimeout, getReplyMode, isRecurringFlow } from './timeoutUtils';
import { processAIFlowRequest, AIFlowRequest } from './aiFlowRouter';
import { EnhancedSpintaxEngine, SpintaxContext } from './spintaxEngine';

// Type definitions for message processing
export interface Message {
  id: string;
  session_id?: string;
  participant_id?: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  message_type_id?: string;
  reply_expiration_seconds?: number;
  is_critical?: boolean;
  status?: string;
}

export interface Participant {
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
}

export interface Group {
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
}

export interface Quiz {
  id: string;
  group_id: string;
  quiz_name: string;
  description?: string;
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  default_reply_expiration_seconds?: number;
}

export interface Question {
  id: string;
  reply_expiration_seconds?: number;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  category?: string;
}

export interface MessageProcessingContext {
  message: Message;
  participant: Participant;
  group: Group;
  quiz?: Quiz;
  question?: Question;
  adminOverride?: number;
}

export interface ProcessedMessage {
  originalMessage: Message;
  finalTimeout: number;
  replyMode: string;
  responseContent: string;
  aiUsed: boolean;
  spintaxUsed: boolean;
  processingTime: number;
  characterCount: number;
  deliveryMethod: string;
}

export interface MessageResponse {
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
}

/**
 * Processes an incoming message and generates an appropriate response
 * 
 * @param context - The message processing context
 * @returns Promise with processed message result
 */
export async function processIncomingMessage(context: MessageProcessingContext): Promise<ProcessedMessage> {
  const startTime = Date.now();
  
  try {
    // 1. Calculate final timeout based on hierarchy
    const finalTimeout = calculateFinalTimeout(
      context.message.message_type_id || 'default',
      context.participant,
      context.group,
      context.quiz,
      context.question,
      context.adminOverride
    );
    
    // 2. Determine reply mode (professional vs original)
    const replyMode = getReplyMode(context.participant, context.group);
    
    // 3. Generate response content
    const responseResult = await generateResponse(context, replyMode);
    
    // 4. Determine delivery method
    const deliveryMethod = determineDeliveryMethod(context.participant, context.group);
    
    const processingTime = Date.now() - startTime;
    
    return {
      originalMessage: context.message,
      finalTimeout,
      replyMode,
      responseContent: responseResult.content,
      aiUsed: responseResult.aiUsed,
      spintaxUsed: responseResult.spintaxUsed,
      processingTime,
      characterCount: responseResult.content.length,
      deliveryMethod
    };
    
  } catch (error) {
    console.error('Message processing error:', error);
    throw error;
  }
}

/**
 * Generates a response based on the message context and reply mode
 * 
 * @param context - The message processing context
 * @param replyMode - The reply mode to use
 * @returns Promise with response content and metadata
 */
export async function generateResponse(context: MessageProcessingContext, replyMode: string): Promise<{
  content: string;
  aiUsed: boolean;
  spintaxUsed: boolean;
}> {
  const { message, participant, group } = context;
  
  // Check if this should use AI processing
  if (shouldUseAI(message, participant, group)) {
    try {
      const aiResponse = await processAIFlowRequest({
        userIntent: extractUserIntent(message.content),
        context: message.content,
        participantId: participant.id,
        adminId: group.id, // Using group ID as admin ID for now
        messageType: message.message_type_id,
        content: message.content
      });
      
      return {
        content: aiResponse,
        aiUsed: true,
        spintaxUsed: false
      };
    } catch (error) {
      console.warn('AI processing failed, falling back to spintax:', error);
      // Fall back to spintax if AI fails
    }
  }
  
  // Use spintax engine for response generation
  const spintaxEngine = new EnhancedSpintaxEngine();
  const spintaxContext: SpintaxContext = {
    interaction_type: determineInteractionType(message),
    effective_mood: replyMode,
    sobriety_level: group.sobriety_level || 50,
    funeral_mode_active: false, // This would be determined by group settings
    participant,
    group,
    message
  };
  
  const templateName = determineTemplateName(message, participant, group);
  const response = spintaxEngine.generateResponse(templateName, spintaxContext, replyMode);
  
  return {
    content: response.content,
    aiUsed: false,
    spintaxUsed: true
  };
}

/**
 * Determines if AI processing should be used for this message
 * 
 * @param message - The incoming message
 * @param participant - The participant
 * @param group - The group
 * @returns True if AI should be used
 */
export function shouldUseAI(message: Message, participant: Participant, group: Group): boolean {
  const content = message.content.toLowerCase();
  
  // Check for AI-triggering keywords
  const aiKeywords = [
    'spreadsheet', 'import', 'mapping', 'vendor', 'service', 'recommendation',
    'story', 'funny', 'entertainment', 'help', 'assist', 'find', 'search'
  ];
  
  const hasAIKeywords = aiKeywords.some(keyword => content.includes(keyword));
  
  // Check if participant has AI preferences
  const participantPrefersAI = participant.personality_profile?.prefers_ai || false;
  
  // Check if group has AI enabled
  const groupHasAIEnabled = group.z_personality_config?.ai_enabled || false;
  
  return hasAIKeywords || participantPrefersAI || groupHasAIEnabled;
}

/**
 * Extracts user intent from message content
 * 
 * @param content - The message content
 * @returns Extracted user intent
 */
export function extractUserIntent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('spreadsheet') || lowerContent.includes('import') || lowerContent.includes('mapping')) {
    return 'spreadsheet_import';
  }
  
  if (lowerContent.includes('vendor') || lowerContent.includes('service') || lowerContent.includes('recommendation')) {
    return 'vendor_search';
  }
  
  if (lowerContent.includes('story') || lowerContent.includes('funny') || lowerContent.includes('entertainment')) {
    return 'funny_stories';
  }
  
  if (lowerContent.includes('help') || lowerContent.includes('assist')) {
    return 'general_help';
  }
  
  return 'general_conversation';
}

/**
 * Determines the interaction type for spintax context
 * 
 * @param message - The message
 * @returns Interaction type string
 */
export function determineInteractionType(message: Message): string {
  const content = message.content.toLowerCase();
  
  if (message.is_critical) {
    return 'critical';
  }
  
  if (content.includes('question') || content.includes('?')) {
    return 'question';
  }
  
  if (content.includes('hello') || content.includes('hi') || content.includes('hey')) {
    return 'greeting';
  }
  
  if (content.includes('bye') || content.includes('goodbye') || content.includes('see you')) {
    return 'farewell';
  }
  
  if (content.includes('thank')) {
    return 'gratitude';
  }
  
  return 'general';
}

/**
 * Determines the template name for spintax response generation
 * 
 * @param message - The message
 * @param participant - The participant
 * @param group - The group
 * @returns Template name
 */
export function determineTemplateName(message: Message, participant: Participant, group: Group): string {
  const interactionType = determineInteractionType(message);
  
  switch (interactionType) {
    case 'greeting':
      return 'greeting';
    case 'question':
      return 'question_response';
    case 'farewell':
      return 'farewell';
    case 'gratitude':
      return 'gratitude_response';
    case 'critical':
      return 'critical_response';
    default:
      return 'general_response';
  }
}

/**
 * Determines the delivery method for the message
 * 
 * @param participant - The participant
 * @param group - The group
 * @returns Delivery method string
 */
export function determineDeliveryMethod(participant: Participant, group: Group): string {
  // Check participant's preferred method
  if (participant.preferred_communication_method) {
    return participant.preferred_communication_method;
  }
  
  // Check group's fallback settings
  if (group.z_personality_config?.preferred_fallback_method) {
    return group.z_personality_config.preferred_fallback_method;
  }
  
  // Default to SMS
  return 'sms';
}

/**
 * Validates a message processing context
 * 
 * @param context - The message processing context
 * @returns Validation result
 */
export function validateMessageContext(context: MessageProcessingContext): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!context.message) {
    errors.push('Message is required');
  }
  
  if (!context.participant) {
    errors.push('Participant is required');
  }
  
  if (!context.group) {
    errors.push('Group is required');
  }
  
  // Check message content
  if (!context.message?.content || context.message.content.trim().length === 0) {
    errors.push('Message content is required');
  }
  
  // Check participant phone number
  if (!context.participant?.phone_number) {
    errors.push('Participant phone number is required');
  }
  
  // Check group name
  if (!context.group?.name) {
    errors.push('Group name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a message response object for API consumption
 * 
 * @param processedMessage - The processed message
 * @returns Message response object
 */
export function createMessageResponse(processedMessage: ProcessedMessage): MessageResponse {
  return {
    content: processedMessage.responseContent,
    timeout: processedMessage.finalTimeout,
    mode: processedMessage.replyMode,
    deliveryMethod: processedMessage.deliveryMethod,
    metadata: {
      aiUsed: processedMessage.aiUsed,
      spintaxUsed: processedMessage.spintaxUsed,
      processingTime: processedMessage.processingTime,
      characterCount: processedMessage.characterCount
    }
  };
}

/**
 * Processes a batch of messages efficiently
 * 
 * @param contexts - Array of message processing contexts
 * @returns Promise with array of processed messages
 */
export async function processMessageBatch(contexts: MessageProcessingContext[]): Promise<ProcessedMessage[]> {
  const results: ProcessedMessage[] = [];
  
  // Process messages in parallel for efficiency
  const promises = contexts.map(async (context) => {
    try {
      const validation = validateMessageContext(context);
      if (!validation.isValid) {
        throw new Error(`Message validation failed: ${validation.errors.join(', ')}`);
      }
      
      return await processIncomingMessage(context);
    } catch (error) {
      console.error('Batch processing error for message:', context.message.id, error);
      throw error;
    }
  });
  
  const processedMessages = await Promise.all(promises);
  results.push(...processedMessages);
  
  return results;
}

/**
 * Gets message processing statistics
 * 
 * @param processedMessages - Array of processed messages
 * @returns Processing statistics
 */
export function getProcessingStats(processedMessages: ProcessedMessage[]) {
  const totalMessages = processedMessages.length;
  const aiUsed = processedMessages.filter(m => m.aiUsed).length;
  const spintaxUsed = processedMessages.filter(m => m.spintaxUsed).length;
  const avgProcessingTime = processedMessages.reduce((sum, m) => sum + m.processingTime, 0) / totalMessages;
  const avgCharacterCount = processedMessages.reduce((sum, m) => sum + m.characterCount, 0) / totalMessages;
  
  return {
    totalMessages,
    aiUsed,
    spintaxUsed,
    avgProcessingTime: Math.round(avgProcessingTime),
    avgCharacterCount: Math.round(avgCharacterCount),
    aiUsageRate: totalMessages > 0 ? (aiUsed / totalMessages) * 100 : 0,
    spintaxUsageRate: totalMessages > 0 ? (spintaxUsed / totalMessages) * 100 : 0
  };
}