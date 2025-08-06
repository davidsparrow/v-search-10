/**
 * AI Flow Router for Eventria Message Processing
 * 
 * This module handles routing to different AI flows based on user intent
 * and manages AI message building with safety constraints and guardrails.
 * 
 * @author Eventria Team
 * @version 1.0.0
 */

import { calculateFinalTimeout } from './timeoutUtils';

// Type definitions for AI flow management
export interface AIFlow {
  id: string;
  flow_name: string;
  description: string;
  ai_model_preferred: string;
  max_tokens: number;
  temperature: number;
  safety_level: 'strict' | 'moderate' | 'creative';
  allowed_contexts: string[];
  required_guardrails: string[];
  created_at: string;
  updated_at: string;
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

export interface AIMessageRequest {
  systemPrompt: string;
  userMessage: string;
  model: string;
  maxTokens: number;
  temperature: number;
  guardrails: string[];
}

export interface AIFlowResponse {
  flow: AIFlow;
  messageRequest: AIMessageRequest;
  safetyLevel: string;
  allowedContexts: string[];
}

/**
 * Routes a user request to the appropriate AI flow based on intent and context.
 * 
 * @param request - The AI flow request containing user intent and context
 * @returns AIFlowResponse with configured AI flow and message request
 */
export function routeToAIFlow(request: AIFlowRequest): AIFlowResponse {
  // Determine the appropriate AI flow based on user intent
  const flowName = determineFlowFromIntent(request.userIntent, request.context);
  
  // Get the AI flow configuration from database (this would be a database call)
  const flow = getAIFlowByName(flowName);
  
  // Build the AI message request with safety constraints
  const messageRequest = buildAIMessageRequest(request, flow);
  
  return {
    flow,
    messageRequest,
    safetyLevel: flow.safety_level,
    allowedContexts: flow.allowed_contexts
  };
}

/**
 * Determines which AI flow to use based on user intent and context.
 * 
 * @param userIntent - The user's intent (e.g., 'spreadsheet_import', 'vendor_search')
 * @param context - Additional context about the request
 * @returns The name of the AI flow to use
 */
export function determineFlowFromIntent(userIntent: string, context: string): string {
  const intent = userIntent.toLowerCase();
  const contextLower = context.toLowerCase();
  
  // Spreadsheet and data mapping flows
  if (intent.includes('spreadsheet') || intent.includes('import') || intent.includes('mapping')) {
    return 'spreadsheet_import';
  }
  
  // Vendor and service search flows
  if (intent.includes('vendor') || intent.includes('service') || intent.includes('recommendation')) {
    return 'vendor_search';
  }
  
  // Entertainment and story flows
  if (intent.includes('story') || intent.includes('funny') || intent.includes('entertainment') || 
      intent.includes('humor') || intent.includes('joke')) {
    return 'funny_stories';
  }
  
  // Default to vendor search for business-related queries
  if (intent.includes('business') || intent.includes('event') || intent.includes('planning')) {
    return 'vendor_search';
  }
  
  // Default fallback
  return 'vendor_search';
}

/**
 * Builds an AI message request with proper safety constraints and guardrails.
 * 
 * @param request - The original AI flow request
 * @param flow - The AI flow configuration
 * @returns Configured AI message request
 */
export function buildAIMessageRequest(request: AIFlowRequest, flow: AIFlow): AIMessageRequest {
  // Build the system prompt based on the flow
  const systemPrompt = buildSystemPrompt(flow, request);
  
  // Build the user message
  const userMessage = buildUserMessage(request);
  
  // Apply safety constraints based on flow configuration
  const guardrails = applySafetyConstraints(flow, request);
  
  return {
    systemPrompt,
    userMessage,
    model: request.preferredModel || flow.ai_model_preferred,
    maxTokens: flow.max_tokens,
    temperature: flow.temperature,
    guardrails
  };
}

/**
 * Builds the system prompt for the AI model based on flow configuration.
 * 
 * @param flow - The AI flow configuration
 * @param request - The original request
 * @returns System prompt string
 */
export function buildSystemPrompt(flow: AIFlow, request: AIFlowRequest): string {
  const basePrompts = {
    'spreadsheet_import': `You are Bender, the AI assistant for AskBender. You are helping with spreadsheet data mapping and validation. 
    
IMPORTANT SAFETY RULES:
- Only return JSON mappings
- Do not process personal data
- Validate against schema only
- Be precise and accurate

Context: ${request.context}`,

    'vendor_search': `You are Bender, the AI assistant for AskBender. You are helping an event planner find vendors and services.

IMPORTANT SAFETY RULES:
- Provide business-focused responses only
- No personal opinions
- Cite sources when possible
- Be helpful and professional

Context: ${request.context}`,

    'funny_stories': `You are Bender from Futurama, the AI assistant for AskBender. You are telling funny stories and providing entertainment.

IMPORTANT SAFETY RULES:
- Keep content appropriate for all ages
- No offensive content
- Keep it light and fun
- Stay in character as Bender

Context: ${request.context}`
  };
  
  return basePrompts[flow.flow_name as keyof typeof basePrompts] || basePrompts['vendor_search'];
}

/**
 * Builds the user message for the AI model.
 * 
 * @param request - The AI flow request
 * @returns User message string
 */
export function buildUserMessage(request: AIFlowRequest): string {
  if (request.content) {
    return request.content;
  }
  
  // Default user message based on intent
  const intent = request.userIntent.toLowerCase();
  
  if (intent.includes('spreadsheet') || intent.includes('import')) {
    return "Please help me map these spreadsheet columns to the correct database fields.";
  }
  
  if (intent.includes('vendor') || intent.includes('service')) {
    return "Please help me find vendors for my event.";
  }
  
  if (intent.includes('story') || intent.includes('funny')) {
    return "Please tell me a funny story in your signature style.";
  }
  
  return "Please help me with this request.";
}

/**
 * Applies safety constraints based on the AI flow configuration.
 * 
 * @param flow - The AI flow configuration
 * @param request - The original request
 * @returns Array of safety guardrails
 */
export function applySafetyConstraints(flow: AIFlow, request: AIFlowRequest): string[] {
  const baseGuardrails = flow.required_guardrails || [];
  
  // Add additional context-specific guardrails
  const contextGuardrails = [];
  
  if (request.messageType === 'emergency' || request.messageType === 'critical') {
    contextGuardrails.push('high_priority_response', 'immediate_action_required');
  }
  
  if (flow.safety_level === 'strict') {
    contextGuardrails.push('strict_content_filtering', 'no_creative_license');
  }
  
  if (flow.safety_level === 'creative') {
    contextGuardrails.push('allow_entertainment', 'character_voice_allowed');
  }
  
  return [...baseGuardrails, ...contextGuardrails];
}

/**
 * Validates that an AI flow request is safe and appropriate.
 * 
 * @param request - The AI flow request
 * @param flow - The AI flow configuration
 * @returns Validation result with any errors
 */
export function validateAIFlowRequest(request: AIFlowRequest, flow: AIFlow): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if the request context is allowed for this flow
  const context = request.context.toLowerCase();
  const allowedContexts = flow.allowed_contexts.map(c => c.toLowerCase());
  
  const hasAllowedContext = allowedContexts.some(allowed => context.includes(allowed));
  if (!hasAllowedContext) {
    errors.push(`Context "${request.context}" is not allowed for flow "${flow.flow_name}"`);
  }
  
  // Check if the user intent matches the flow purpose
  const intent = request.userIntent.toLowerCase();
  const flowName = flow.flow_name.toLowerCase();
  
  if (!intent.includes(flowName.replace('_', ' ')) && !flowName.includes(intent.replace(' ', '_'))) {
    errors.push(`Intent "${request.userIntent}" may not be appropriate for flow "${flow.flow_name}"`);
  }
  
  // Check safety level appropriateness
  if (flow.safety_level === 'strict' && request.messageType === 'funny_stories') {
    errors.push('Strict safety level may not be appropriate for entertainment content');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets an AI flow configuration by name (simulated database call).
 * In a real implementation, this would query the database.
 * 
 * @param flowName - The name of the AI flow
 * @returns AI flow configuration
 */
export function getAIFlowByName(flowName: string): AIFlow {
  // This is a mock implementation - in reality, this would query the database
  const defaultFlows: { [key: string]: AIFlow } = {
    'spreadsheet_import': {
      id: '1',
      flow_name: 'spreadsheet_import',
      description: 'AI-assisted spreadsheet data mapping and validation',
      ai_model_preferred: 'gpt-4',
      max_tokens: 500,
      temperature: 0.1,
      safety_level: 'strict',
      allowed_contexts: ['data_mapping', 'column_validation', 'format_detection'],
      required_guardrails: ['only_return_json_mappings', 'no_personal_data_processing', 'validate_against_schema_only'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    'vendor_search': {
      id: '2',
      flow_name: 'vendor_search',
      description: 'AI-assisted vendor recommendations for event planning',
      ai_model_preferred: 'claude-3',
      max_tokens: 300,
      temperature: 0.3,
      safety_level: 'moderate',
      allowed_contexts: ['vendor_recommendations', 'service_matching'],
      required_guardrails: ['business_focused_responses', 'no_personal_opinions', 'cite_sources_when_possible'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    'funny_stories': {
      id: '3',
      flow_name: 'funny_stories',
      description: 'AI-generated entertainment content in Bender style',
      ai_model_preferred: 'gpt-4',
      max_tokens: 800,
      temperature: 0.8,
      safety_level: 'creative',
      allowed_contexts: ['entertainment', 'humor', 'casual_conversation'],
      required_guardrails: ['appropriate_for_all_ages', 'no_offensive_content', 'keep_it_light_and_fun'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
  
  return defaultFlows[flowName] || defaultFlows['vendor_search'];
}

/**
 * Calls an external AI service with the configured message request.
 * This is a placeholder for the actual AI service integration.
 * 
 * @param messageRequest - The configured AI message request
 * @returns Promise with AI response
 */
export async function callAIService(messageRequest: AIMessageRequest): Promise<string> {
  // This is a placeholder implementation
  // In a real implementation, this would call OpenAI, Claude, or another AI service
  
  console.log('Calling AI service with:', {
    model: messageRequest.model,
    maxTokens: messageRequest.maxTokens,
    temperature: messageRequest.temperature,
    guardrails: messageRequest.guardrails
  });
  
  // Simulate AI response
  const responses = {
    'spreadsheet_import': '{"phone_number": "A", "email": "B", "nickname": "C"}',
    'vendor_search': 'Here are 3 recommended vendors for your event: 1. ABC Catering, 2. XYZ Entertainment, 3. 123 Photography',
    'funny_stories': 'Bite my shiny metal ass! Here\'s a funny story about robots and humans...'
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const flowType = messageRequest.systemPrompt.includes('spreadsheet') ? 'spreadsheet_import' :
                   messageRequest.systemPrompt.includes('vendor') ? 'vendor_search' : 'funny_stories';
  
  return responses[flowType as keyof typeof responses] || 'I am Bender, please insert girder.';
}

/**
 * Main function to process an AI flow request end-to-end.
 * 
 * @param request - The AI flow request
 * @returns Promise with AI response
 */
export async function processAIFlowRequest(request: AIFlowRequest): Promise<string> {
  try {
    // Route to appropriate AI flow
    const flowResponse = routeToAIFlow(request);
    
    // Validate the request
    const validation = validateAIFlowRequest(request, flowResponse.flow);
    if (!validation.isValid) {
      throw new Error(`AI Flow validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Call the AI service
    const aiResponse = await callAIService(flowResponse.messageRequest);
    
    return aiResponse;
  } catch (error) {
    console.error('AI Flow processing error:', error);
    throw error;
  }
} 