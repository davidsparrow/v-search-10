import { isCriticalMessage, storeCriticalMessageWithInterruption } from './criticalMessages'
import { 
  createSessionSnapshot, 
  storeSessionInterruption, 
  markSessionAsInterrupted 
} from './sessionManager'
import { shouldNotifyAdminForMessage } from './adminNotifications'
import { Message } from '../types/message'

export interface ProcessedMessage {
  id: string
  content: string
  isCritical: boolean
  criticalKeyword?: string
  shouldInterrupt: boolean
  originalMessage?: Message
  sessionInterrupted?: boolean
  adminNotified?: boolean
}

/**
 * Send admin notification for critical message
 */
const sendAdminNotification = async (
  criticalMessage: Message,
  sessionInterrupted: boolean
): Promise<boolean> => {
  try {
    // Check if admin should be notified for this message type
    const shouldNotify = await shouldNotifyAdminForMessage(
      criticalMessage.message_type_id || 'emergency',
      0 // Priority 0 for critical messages
    )
    
    if (!shouldNotify) {
      return false
    }
    
    // TODO: Implement actual notification sending
    // This could be email, SMS, webhook, etc.
    console.log('ADMIN NOTIFICATION:', {
      messageId: criticalMessage.id,
      context: criticalMessage.context,
      sessionInterrupted,
      timestamp: new Date().toISOString()
    })
    
    return true
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return false
  }
}

/**
 * Process incoming messages and detect critical messages
 * This is the first integration point for critical message detection
 */
export const processIncomingMessage = async (
  content: string,
  userId: string,
  sessionId: string
): Promise<ProcessedMessage> => {
  const isCritical = isCriticalMessage(content)
  
  const processedMessage: ProcessedMessage = {
    id: Date.now().toString(),
    content,
    isCritical,
    shouldInterrupt: isCritical, // Critical messages always interrupt
    criticalKeyword: isCritical ? extractCriticalKeyword(content) : undefined
  }

  // If this is a critical message, handle session interruption
  if (isCritical) {
    try {
      // Store the critical message
      const storedMessage = await storeCriticalMessageWithInterruption(
        userId,
        sessionId,
        content,
        true, // response_required
        300   // timeout_seconds
      )
      
      if (storedMessage) {
        processedMessage.originalMessage = storedMessage
        
        // Create session snapshot
        const sessionSnapshot = await createSessionSnapshot(
          sessionId,
          userId,
          'chat', // current step
          { messages: [], progress: 0 }, // progress
          { interruptedBy: storedMessage.id } // metadata
        )
        
        // Store session interruption
        const interruption = await storeSessionInterruption(
          userId,
          sessionId,
          storedMessage.id,
          sessionSnapshot,
          'critical_message'
        )
        
        // Mark session as interrupted
        const sessionMarked = await markSessionAsInterrupted(
          sessionId,
          sessionSnapshot
        )
        
        processedMessage.sessionInterrupted = sessionMarked
        
        // Send admin notification
        const adminNotified = await sendAdminNotification(
          storedMessage,
          sessionMarked
        )
        
        processedMessage.adminNotified = adminNotified
        
        console.log('Session interrupted by critical message:', {
          messageId: storedMessage.id,
          interruptionId: interruption?.id,
          sessionMarked,
          adminNotified
        })
      }
    } catch (error) {
      console.error('Error handling critical message interruption:', error)
      // Continue processing even if interruption fails
    }
  }

  return processedMessage
}

/**
 * Extract the critical keyword from message content
 */
const extractCriticalKeyword = (content: string): string | undefined => {
  const criticalKeywords = ['EMERGENCY', 'URGENT', 'CRITICAL']
  const upperContent = content.toUpperCase()
  
  for (const keyword of criticalKeywords) {
    if (upperContent.startsWith(keyword)) {
      return keyword
    }
  }
  
  return undefined
}

/**
 * Check if a message should trigger session interruption
 */
export const shouldInterruptSession = (processedMessage: ProcessedMessage): boolean => {
  return processedMessage.shouldInterrupt
}

/**
 * Get appropriate response for critical messages
 */
export const getCriticalMessageResponse = (criticalKeyword?: string): string => {
  switch (criticalKeyword) {
    case 'EMERGENCY':
      return "🚨 EMERGENCY MESSAGE RECEIVED - Your session has been interrupted. Please respond immediately."
    case 'URGENT':
      return "⚠️ URGENT MESSAGE RECEIVED - Your session has been interrupted. Please respond within 5 minutes."
    case 'CRITICAL':
      return "🔴 CRITICAL MESSAGE RECEIVED - Your session has been interrupted. Please respond within 10 minutes."
    default:
      return "🚨 CRITICAL MESSAGE RECEIVED - Your session has been interrupted. Please respond immediately."
  }
}