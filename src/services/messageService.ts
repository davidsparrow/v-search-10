/**
 * Message Service for Eventria Message Processing
 * 
 * This service provides a high-level interface for message processing,
 * timeout handling, and integration with all utility modules.
 * 
 * @author Eventria Team
 * @version 1.0.0
 */

import { 
  processIncomingMessage, 
  processMessageBatch,
  createMessageResponse,
  getProcessingStats,
  MessageProcessingContext,
  ProcessedMessage,
  MessageResponse
} from '../lib/messageProcessor';
import { calculateFinalTimeout, getReplyMode } from '../lib/timeoutUtils';
import { processAIFlowRequest, AIFlowRequest } from '../lib/aiFlowRouter';
import { EnhancedSpintaxEngine } from '../lib/spintaxEngine';

// Type definitions for the service layer
export interface MessageServiceConfig {
  enableAI: boolean;
  enableSpintax: boolean;
  enableTimeoutHandling: boolean;
  enableBatchProcessing: boolean;
  maxBatchSize: number;
  defaultTimeout: number;
}

export interface MessageServiceStats {
  totalMessagesProcessed: number;
  aiMessagesProcessed: number;
  spintaxMessagesProcessed: number;
  averageProcessingTime: number;
  averageCharacterCount: number;
  aiUsageRate: number;
  spintaxUsageRate: number;
  errorCount: number;
  lastProcessedAt: string;
}

export interface TimeoutHandler {
  messageId: string;
  timeout: number;
  callback: () => Promise<void>;
  expiresAt: Date;
}

/**
 * Main Message Service class for handling all message processing operations
 */
export class MessageService {
  private config: MessageServiceConfig;
  private stats: MessageServiceStats;
  private timeoutHandlers: Map<string, TimeoutHandler>;
  private spintaxEngine: EnhancedSpintaxEngine;
  private isProcessing: boolean;

  constructor(config?: Partial<MessageServiceConfig>) {
    this.config = {
      enableAI: true,
      enableSpintax: true,
      enableTimeoutHandling: true,
      enableBatchProcessing: true,
      maxBatchSize: 100,
      defaultTimeout: 300,
      ...config
    };

    this.stats = {
      totalMessagesProcessed: 0,
      aiMessagesProcessed: 0,
      spintaxMessagesProcessed: 0,
      averageProcessingTime: 0,
      averageCharacterCount: 0,
      aiUsageRate: 0,
      spintaxUsageRate: 0,
      errorCount: 0,
      lastProcessedAt: new Date().toISOString()
    };

    this.timeoutHandlers = new Map();
    this.spintaxEngine = new EnhancedSpintaxEngine();
    this.isProcessing = false;

    // Start timeout monitoring if enabled
    if (this.config.enableTimeoutHandling) {
      this.startTimeoutMonitoring();
    }
  }

  /**
   * Processes a single message through the complete pipeline
   * 
   * @param context - The message processing context
   * @returns Promise with processed message response
   */
  async processMessage(context: MessageProcessingContext): Promise<MessageResponse> {
    const startTime = Date.now();
    
    try {
      this.isProcessing = true;
      
      // Process the message
      const processedMessage = await processIncomingMessage(context);
      
      // Create response object
      const response = createMessageResponse(processedMessage);
      
      // Handle timeout if enabled
      if (this.config.enableTimeoutHandling && response.timeout > 0) {
        await this.handleTimeout(context.message.id, response.timeout, async () => {
          await this.handleMessageTimeout(context.message.id);
        });
      }
      
      // Update statistics
      this.updateStats(processedMessage);
      
      return response;
      
    } catch (error) {
      this.stats.errorCount++;
      console.error('Message service processing error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
      this.stats.lastProcessedAt = new Date().toISOString();
    }
  }

  /**
   * Processes multiple messages in batch for efficiency
   * 
   * @param contexts - Array of message processing contexts
   * @returns Promise with array of processed message responses
   */
  async processMessageBatch(contexts: MessageProcessingContext[]): Promise<MessageResponse[]> {
    if (!this.config.enableBatchProcessing) {
      throw new Error('Batch processing is disabled');
    }

    if (contexts.length > this.config.maxBatchSize) {
      throw new Error(`Batch size ${contexts.length} exceeds maximum ${this.config.maxBatchSize}`);
    }

    try {
      // Process messages in batch
      const processedMessages = await processMessageBatch(contexts);
      
      // Create response objects
      const responses = processedMessages.map(createMessageResponse);
      
      // Handle timeouts for all messages
      if (this.config.enableTimeoutHandling) {
        for (const response of responses) {
          if (response.timeout > 0) {
            const context = contexts[0];
            if (context) {
              await this.handleTimeout(context.message.id, response.timeout, async () => {
                await this.handleMessageTimeout(context.message.id);
              });
            }
          }
        }
      }
      
      // Update statistics
      this.updateBatchStats(processedMessages);
      
      return responses;
      
    } catch (error) {
      this.stats.errorCount++;
      console.error('Message service batch processing error:', error);
      throw error;
    }
  }

  /**
   * Generates a response using AI processing
   * 
   * @param request - The AI flow request
   * @returns Promise with AI-generated response
   */
  async generateAIResponse(request: AIFlowRequest): Promise<string> {
    if (!this.config.enableAI) {
      throw new Error('AI processing is disabled');
    }

    try {
      const response = await processAIFlowRequest(request);
      this.stats.aiMessagesProcessed++;
      return response;
    } catch (error) {
      console.error('AI response generation error:', error);
      throw error;
    }
  }

  /**
   * Generates a response using spintax templates
   * 
   * @param templateName - The template name to use
   * @param context - The spintax context
   * @param mood - The mood to apply
   * @returns Generated response
   */
  generateSpintaxResponse(templateName: string, context: any, mood?: string): string {
    if (!this.config.enableSpintax) {
      throw new Error('Spintax processing is disabled');
    }

    try {
      const response = this.spintaxEngine.generateResponse(templateName, context, mood);
      this.stats.spintaxMessagesProcessed++;
      return response.content;
    } catch (error) {
      console.error('Spintax response generation error:', error);
      throw error;
    }
  }

  /**
   * Handles timeout for a specific message
   * 
   * @param messageId - The message ID
   * @param timeoutSeconds - Timeout in seconds
   * @param callback - Callback to execute when timeout expires
   */
  async handleTimeout(messageId: string, timeoutSeconds: number, callback: () => Promise<void>): Promise<void> {
    if (!this.config.enableTimeoutHandling) {
      return;
    }

    const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);
    
    const handler: TimeoutHandler = {
      messageId,
      timeout: timeoutSeconds,
      callback,
      expiresAt
    };

    this.timeoutHandlers.set(messageId, handler);
  }

  /**
   * Handles message timeout expiration
   * 
   * @param messageId - The message ID that timed out
   */
  private async handleMessageTimeout(messageId: string): Promise<void> {
    try {
      console.log(`Message ${messageId} has timed out`);
      
      // In a real implementation, this would:
      // 1. Update message status in database
      // 2. Send timeout notification
      // 3. Trigger fallback actions
      // 4. Update participant score
      
      // For now, just log the timeout
      console.log(`Timeout handler executed for message: ${messageId}`);
      
    } catch (error) {
      console.error(`Error handling timeout for message ${messageId}:`, error);
    }
  }

  /**
   * Starts the timeout monitoring loop
   */
  private startTimeoutMonitoring(): void {
    setInterval(() => {
      this.checkTimeouts();
    }, 1000); // Check every second
  }

  /**
   * Checks for expired timeouts and executes callbacks
   */
  private async checkTimeouts(): Promise<void> {
    const now = new Date();
    const expiredHandlers: TimeoutHandler[] = [];

    // Find expired handlers
    for (const [messageId, handler] of this.timeoutHandlers.entries()) {
      if (handler.expiresAt <= now) {
        expiredHandlers.push(handler);
        this.timeoutHandlers.delete(messageId);
      }
    }

    // Execute expired handlers
    for (const handler of expiredHandlers) {
      try {
        await handler.callback();
      } catch (error) {
        console.error(`Error executing timeout callback for message ${handler.messageId}:`, error);
      }
    }
  }

  /**
   * Updates statistics for a single processed message
   * 
   * @param processedMessage - The processed message
   */
  private updateStats(processedMessage: ProcessedMessage): void {
    this.stats.totalMessagesProcessed++;
    
    if (processedMessage.aiUsed) {
      this.stats.aiMessagesProcessed++;
    }
    
    if (processedMessage.spintaxUsed) {
      this.stats.spintaxMessagesProcessed++;
    }

    // Update averages
    const totalProcessed = this.stats.totalMessagesProcessed;
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (totalProcessed - 1) + processedMessage.processingTime) / totalProcessed;
    
    this.stats.averageCharacterCount = 
      (this.stats.averageCharacterCount * (totalProcessed - 1) + processedMessage.characterCount) / totalProcessed;

    // Update usage rates
    this.stats.aiUsageRate = (this.stats.aiMessagesProcessed / totalProcessed) * 100;
    this.stats.spintaxUsageRate = (this.stats.spintaxMessagesProcessed / totalProcessed) * 100;
  }

  /**
   * Updates statistics for a batch of processed messages
   * 
   * @param processedMessages - Array of processed messages
   */
  private updateBatchStats(processedMessages: ProcessedMessage[]): void {
    const batchStats = getProcessingStats(processedMessages);
    
    this.stats.totalMessagesProcessed += batchStats.totalMessages;
    this.stats.aiMessagesProcessed += batchStats.aiUsed;
    this.stats.spintaxMessagesProcessed += batchStats.spintaxUsed;
    this.stats.averageProcessingTime = batchStats.avgProcessingTime;
    this.stats.averageCharacterCount = batchStats.avgCharacterCount;
    this.stats.aiUsageRate = batchStats.aiUsageRate;
    this.stats.spintaxUsageRate = batchStats.spintaxUsageRate;
  }

  /**
   * Gets current service statistics
   * 
   * @returns Current statistics
   */
  getStats(): MessageServiceStats {
    return { ...this.stats };
  }

  /**
   * Gets current service configuration
   * 
   * @returns Current configuration
   */
  getConfig(): MessageServiceConfig {
    return { ...this.config };
  }

  /**
   * Updates service configuration
   * 
   * @param newConfig - New configuration options
   */
  updateConfig(newConfig: Partial<MessageServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clears all timeout handlers
   */
  clearTimeouts(): void {
    this.timeoutHandlers.clear();
  }

  /**
   * Gets the number of active timeout handlers
   * 
   * @returns Number of active timeouts
   */
  getActiveTimeoutCount(): number {
    return this.timeoutHandlers.size;
  }

  /**
   * Checks if the service is currently processing messages
   * 
   * @returns True if processing
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Gets spintax engine performance metrics
   * 
   * @returns Performance metrics
   */
  getSpintaxPerformanceMetrics(): any {
    return this.spintaxEngine.getPerformanceMetrics();
  }

  /**
   * Clears spintax engine cache
   */
  clearSpintaxCache(): void {
    this.spintaxEngine.clearCache();
  }

  /**
   * Resets all service statistics
   */
  resetStats(): void {
    this.stats = {
      totalMessagesProcessed: 0,
      aiMessagesProcessed: 0,
      spintaxMessagesProcessed: 0,
      averageProcessingTime: 0,
      averageCharacterCount: 0,
      aiUsageRate: 0,
      spintaxUsageRate: 0,
      errorCount: 0,
      lastProcessedAt: new Date().toISOString()
    };
  }

  /**
   * Gracefully shuts down the service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Message Service...');
    
    // Clear all timeouts
    this.clearTimeouts();
    
    // Clear spintax cache
    this.clearSpintaxCache();
    
    // Wait for any ongoing processing to complete
    while (this.isProcessing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Message Service shutdown complete');
  }
}

/**
 * Creates a new Message Service instance with default configuration
 * 
 * @returns New message service instance
 */
export function createMessageService(config?: Partial<MessageServiceConfig>): MessageService {
  return new MessageService(config);
}

/**
 * Default message service instance for easy access
 */
export const defaultMessageService = createMessageService(); 