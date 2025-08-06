/**
 * Message Processor for Eventria Message Processing
 * 
 * This module handles incoming message processing, response generation,
 * and integration with timeout calculations and AI flows.
 * 
 * @author Eventria Team
 * @version 1.0.0
 */

import { calculateFinalTimeout, getReplyMode, isRecurringFlow } from './timeoutUtils';
import { processAIFlowRequest, AIFlowRequest } from './aiFlowRouter';
import { EnhancedSpintaxEngine, SpintaxContext } from './spintaxEngine';
import { smsService, SMSResponse } from './smsService';
import { emailService, EmailContent, EmailResponse } from './emailService';

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
  deliveryResults?: {
    smsResult?: SMSResponse;
    emailResult?: EmailResponse;
  };
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
  deliveryResults?: {
    smsResult?: SMSResponse;
    emailResult?: EmailResponse;
  };
}

/**
 * Enhanced delivery method determination with character limits
 */
export function determineDeliveryMethod(
  messageContent: string,
  participant: Participant,
  group: Group
): 'sms' | 'email' | 'both' {
  const smsCharLimit = participant.sms_character_limit || 160; // Default SMS limit
  const participantPrefersEmail = participant.email && participant.preferred_communication_method === 'email';
  const messageLength = messageContent.length;
  
  // If message is too long for SMS, use email
  if (messageLength > smsCharLimit) {
    return 'email';
  }
  
  // If participant prefers email, use email
  if (participantPrefersEmail) {
    return 'email';
  }
  
  // If participant has email and message is long, use both
  if (participant.email && messageLength > 100) {
    return 'both';
  }
  
  // Default to SMS
  return 'sms';
}

/**
 * Send message via appropriate channels
 */
export async function sendMessageViaChannels(
  message: Message,
  response: MessageResponse,
  participant: Participant,
  group: Group
): Promise<{
  smsResult?: SMSResponse;
  emailResult?: EmailResponse;
}> {
  const deliveryMethod = determineDeliveryMethod(response.content, participant, group);
  const results: { smsResult?: SMSResponse; emailResult?: EmailResponse } = {};
  
  if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
    if (participant.phone_number) {
      results.smsResult = await smsService.sendSMS(
        participant.phone_number,
        response.content
      );
    }
  }
  
  if (deliveryMethod === 'email' || deliveryMethod === 'both') {
    if (participant.email) {
      const emailContent: EmailContent = {
        to: participant.email,
        subject: `Message from ${group.name}`,
        body: response.content,
        htmlBody: response.content // Could be enhanced with HTML formatting
      };
      
      results.emailResult = await emailService.sendEmail(emailContent);
    }
  }
  
  return results;
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
    const finalTimeout = calculateFinalTimeout({
      message: context.message,
      participant: context.participant,
      group: context.group,
      quiz: context.quiz,
      question: context.question,
      messageType: { 
        id: '1', 
        default_timeout: 300, 
        name: context.message.message_type_id || 'default',
        is_recurring_flow: false
      }
    });
    
    // 2. Determine reply mode (professional vs original)
    const replyMode = getReplyMode({
      message: context.message,
      participant: context.participant,
      group: context.group,
      quiz: context.quiz,
      question: context.question,
      messageType: { 
        id: '1', 
        default_timeout: 300, 
        name: context.message.message_type_id || 'default',
        is_recurring_flow: false
      }
    });
    
    // 3. Generate response content
    const responseResult = await generateResponse(context, replyMode.isProfessional ? 'professional' : 'casual');
    
    // 4. Determine delivery method
    const deliveryMethod = determineDeliveryMethod(responseResult.content, context.participant, context.group);
    
    // 5. Send via appropriate channels
    const channelResults = await sendMessageViaChannels(
      context.message,
      { content: responseResult.content, timeout: finalTimeout, mode: replyMode.isProfessional ? 'professional' : 'casual', deliveryMethod, metadata: { aiUsed: responseResult.aiUsed, spintaxUsed: responseResult.spintaxUsed, processingTime: 0, characterCount: responseResult.content.length } },
      context.participant,
      context.group
    );
    
    const processingTime = Date.now() - startTime;
    
    return {
      originalMessage: context.message,
      finalTimeout,
      replyMode: replyMode.isProfessional ? 'professional' : 'casual',
      responseContent: responseResult.content,
      aiUsed: responseResult.aiUsed,
      spintaxUsed: responseResult.spintaxUsed,
      processingTime,
      characterCount: responseResult.content.length,
      deliveryMethod,
      deliveryResults: channelResults
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
    },
    deliveryResults: processedMessage.deliveryResults
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
  
  // Delivery statistics
  const smsDelivered = processedMessages.filter(m => m.deliveryResults?.smsResult?.success).length;
  const emailDelivered = processedMessages.filter(m => m.deliveryResults?.emailResult?.success).length;
  const dualDelivered = processedMessages.filter(m => m.deliveryResults?.smsResult?.success && m.deliveryResults?.emailResult?.success).length;
  
  return {
    totalMessages,
    aiUsed,
    spintaxUsed,
    avgProcessingTime: Math.round(avgProcessingTime),
    avgCharacterCount: Math.round(avgCharacterCount),
    aiUsageRate: totalMessages > 0 ? (aiUsed / totalMessages) * 100 : 0,
    spintaxUsageRate: totalMessages > 0 ? (spintaxUsed / totalMessages) * 100 : 0,
    smsDelivered,
    emailDelivered,
    dualDelivered,
    smsDeliveryRate: totalMessages > 0 ? (smsDelivered / totalMessages) * 100 : 0,
    emailDeliveryRate: totalMessages > 0 ? (emailDelivered / totalMessages) * 100 : 0
  };
}

/**
 * Checks if a message should interrupt the current session
 */
export function shouldInterruptSession(processedMessage: ProcessedMessage): boolean {
  // Check if the message is marked as critical
  if (processedMessage.originalMessage.is_critical) {
    return true;
  }
  
  // Check for critical keywords in the content
  const criticalKeywords = ['emergency', 'urgent', 'help', 'sos', 'critical'];
  const content = processedMessage.originalMessage.content.toLowerCase();
  
  return criticalKeywords.some(keyword => content.includes(keyword));
}

/**
 * Gets the appropriate critical message response
 */
export function getCriticalMessageResponse(criticalKeyword?: string): string {
  if (!criticalKeyword) {
    return "I've detected this as a critical message. Let me connect you with immediate assistance.";
  }
  
  const responses: { [key: string]: string } = {
    'emergency': "🚨 EMERGENCY DETECTED! I'm immediately connecting you with emergency services.",
    'urgent': "⚠️ URGENT MESSAGE! I'm prioritizing your request and connecting you with urgent support.",
    'help': "🆘 HELP REQUESTED! I'm connecting you with assistance immediately.",
    'sos': "🚨 SOS SIGNAL! Emergency response activated. Connecting you with help now.",
    'critical': "🚨 CRITICAL SITUATION! I'm immediately routing this to emergency response."
  };
  
  return responses[criticalKeyword.toLowerCase()] || "🚨 CRITICAL MESSAGE DETECTED! Connecting you with immediate assistance.";
}