/**
 * Timeout Utilities for Eventria Message Processing
 * 
 * Provides functions for calculating message timeouts based on the defined hierarchy:
 * 1. Admin message-level override (highest priority)
 * 2. Question-level override (for quizzes)
 * 3. Quiz-level override
 * 4. Group-level override
 * 5. User preference (Participants.pref_timeout)
 * 6. MessageType default (lowest priority)
 * 
 * @author Eventria Team
 * @version 1.0.0
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface Participant {
  id: string;
  pref_timeout?: number | null;
  professional_mode_always?: boolean;
  group_id?: string;
}

export interface Group {
  id: string;
  default_timeout?: number;
  default_reply_expiration_seconds?: number;
  professional_mode?: boolean;
}

export interface Quiz {
  id: string;
  default_timeout?: number;
  professional_mode?: boolean;
}

export interface Question {
  id: string;
  timeout_override?: number;
  professional_mode_override?: boolean;
}

export interface MessageType {
  id: string;
  default_timeout: number;
  name: string;
  is_recurring_flow?: boolean;
}

export interface Message {
  id: string;
  message_type_id?: string;
  timeout_override?: number;
  professional_mode_override?: boolean;
  group_id?: string;
  quiz_id?: string;
  question_id?: string;
  participant_id?: string;
}

export interface TimeoutContext {
  message: Message;
  participant: Participant;
  group?: Group;
  quiz?: Quiz;
  question?: Question;
  messageType: MessageType;
}

export interface ReplyMode {
  isProfessional: boolean;
  timeout: number;
  source: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ALLOWED_TIMEOUTS = [30, 60, 120, 180, 240, 300, 360, 600, 900] as const;
export type AllowedTimeout = typeof ALLOWED_TIMEOUTS[number];

export const DEFAULT_TIMEOUTS = {
  QUIZ: 300,
  GAME: 180,
  EVENT_CONFIRMATION: 600,
  SHIFT_CONFIRMATION: 900,
  DAILY_REMINDER: 360,
  CRITICAL_MESSAGE: 60,
} as const;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculates the final timeout for a message based on the hierarchy
 */
export function calculateFinalTimeout(context: TimeoutContext): number {
  const { message, participant, group, quiz, question, messageType } = context;

  // 1. Admin message-level override (highest priority)
  if (message.timeout_override !== undefined && message.timeout_override !== null) {
    return message.timeout_override;
  }

  // 2. Question-level override (for quizzes)
  if (question?.timeout_override !== undefined && question.timeout_override !== null) {
    return question.timeout_override;
  }

  // 3. Quiz-level override
  if (quiz?.default_timeout !== undefined && quiz.default_timeout !== null) {
    return quiz.default_timeout;
  }

  // 4. Group-level override
  if (group?.default_timeout !== undefined && group.default_timeout !== null) {
    return group.default_timeout;
  }

  // 5. User preference (only for recurring flows)
  if (isRecurringFlow(messageType) && participant.pref_timeout !== undefined && participant.pref_timeout !== null) {
    return participant.pref_timeout;
  }

  // 6. MessageType default (lowest priority)
  return messageType.default_timeout;
}

/**
 * Determines the reply mode (professional vs casual) for a message
 */
export function getReplyMode(context: TimeoutContext): ReplyMode {
  const { message, participant, group, quiz, question } = context;

  // Check for professional mode overrides in order of priority
  if (message.professional_mode_override !== undefined) {
    return {
      isProfessional: message.professional_mode_override,
      timeout: calculateFinalTimeout(context),
      source: 'message_override'
    };
  }

  if (question?.professional_mode_override !== undefined) {
    return {
      isProfessional: question.professional_mode_override,
      timeout: calculateFinalTimeout(context),
      source: 'question_override'
    };
  }

  if (quiz?.professional_mode !== undefined) {
    return {
      isProfessional: quiz.professional_mode,
      timeout: calculateFinalTimeout(context),
      source: 'quiz_setting'
    };
  }

  if (group?.professional_mode !== undefined) {
    return {
      isProfessional: group.professional_mode,
      timeout: calculateFinalTimeout(context),
      source: 'group_setting'
    };
  }

  // User preference for professional mode always
  if (participant.professional_mode_always) {
    return {
      isProfessional: true,
      timeout: calculateFinalTimeout(context),
      source: 'user_preference'
    };
  }

  // Default to casual mode
  return {
    isProfessional: false,
    timeout: calculateFinalTimeout(context),
    source: 'default'
  };
}

/**
 * Checks if a message type is a recurring flow (not quiz/game)
 */
export function isRecurringFlow(messageType: MessageType): boolean {
  return messageType.is_recurring_flow === true;
}

/**
 * Gets the default timeout for a message type
 */
export function getMessageTypeDefaultTimeout(messageTypeName: string): number {
  const upperName = messageTypeName.toUpperCase();
  
  switch (upperName) {
    case 'QUIZ':
      return DEFAULT_TIMEOUTS.QUIZ;
    case 'GAME':
      return DEFAULT_TIMEOUTS.GAME;
    case 'EVENT_CONFIRMATION':
      return DEFAULT_TIMEOUTS.EVENT_CONFIRMATION;
    case 'SHIFT_CONFIRMATION':
      return DEFAULT_TIMEOUTS.SHIFT_CONFIRMATION;
    case 'DAILY_REMINDER':
      return DEFAULT_TIMEOUTS.DAILY_REMINDER;
    case 'CRITICAL_MESSAGE':
      return DEFAULT_TIMEOUTS.CRITICAL_MESSAGE;
    default:
      return DEFAULT_TIMEOUTS.EVENT_CONFIRMATION; // Default fallback
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates if a timeout value is within allowed range
 */
export function isValidTimeout(timeout: number): timeout is AllowedTimeout {
  return ALLOWED_TIMEOUTS.includes(timeout as AllowedTimeout);
}

/**
 * Gets all allowed timeout values
 */
export function getAllowedTimeouts(): readonly AllowedTimeout[] {
  return ALLOWED_TIMEOUTS;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats timeout for display (e.g., "5 minutes", "1 hour")
 */
export function formatTimeoutForDisplay(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }
}

/**
 * Converts timeout to milliseconds
 */
export function timeoutToMilliseconds(seconds: number): number {
  return seconds * 1000;
}

/**
 * Converts milliseconds to timeout seconds
 */
export function millisecondsToTimeout(ms: number): number {
  return Math.floor(ms / 1000);
}

// ============================================================================
// DEBUGGING FUNCTIONS
// ============================================================================

/**
 * Gets detailed timeout calculation breakdown for debugging
 */
export function getTimeoutBreakdown(context: TimeoutContext): {
  finalTimeout: number;
  replyMode: ReplyMode;
  breakdown: {
    messageOverride?: number;
    questionOverride?: number;
    quizTimeout?: number;
    groupTimeout?: number;
    userPref?: number;
    messageTypeDefault: number;
    isRecurringFlow: boolean;
  };
} {
  const { message, participant, group, quiz, question, messageType } = context;
  
  return {
    finalTimeout: calculateFinalTimeout(context),
    replyMode: getReplyMode(context),
    breakdown: {
      messageOverride: message.timeout_override,
      questionOverride: question?.timeout_override,
      quizTimeout: quiz?.default_timeout,
      groupTimeout: group?.default_timeout,
      userPref: participant.pref_timeout || undefined,
      messageTypeDefault: messageType.default_timeout,
      isRecurringFlow: isRecurringFlow(messageType)
    }
  };
} 