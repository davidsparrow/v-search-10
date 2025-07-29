import { supabase } from './supabase'
import { SessionInterruption } from '../types/message'

export interface SessionSnapshot {
  sessionId: string
  userId: string
  currentStep: string
  progress: any
  timestamp: Date
  metadata: any
}

/**
 * Create a complete session snapshot for interruption
 */
export const createSessionSnapshot = async (
  sessionId: string,
  userId: string,
  currentStep: string = 'chat',
  progress: any = {},
  metadata: any = {}
): Promise<SessionSnapshot> => {
  const snapshot: SessionSnapshot = {
    sessionId,
    userId,
    currentStep,
    progress,
    timestamp: new Date(),
    metadata
  }

  return snapshot
}

/**
 * Store session interruption in database
 */
export const storeSessionInterruption = async (
  userId: string,
  originalSessionId: string,
  criticalMessageId: string,
  sessionSnapshot: SessionSnapshot,
  interruptionReason: string = 'critical_message'
): Promise<SessionInterruption | null> => {
  try {
    const { data, error } = await supabase
      .from('SessionInterruptions')
      .insert({
        user_id: userId,
        original_session_id: originalSessionId,
        critical_message_id: criticalMessageId,
        session_snapshot: sessionSnapshot,
        interruption_reason: interruptionReason,
        auto_resume: true,
        admin_override: false,
        interrupted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing session interruption:', error)
      return null
    }

    return data as SessionInterruption
  } catch (error) {
    console.error('Error in storeSessionInterruption:', error)
    return null
  }
}

/**
 * Mark session as interrupted in UserSessions table
 */
export const markSessionAsInterrupted = async (
  sessionId: string,
  sessionSnapshot: SessionSnapshot
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Quiz_Sessions')
      .update({
        is_interrupted: true,
        interruption_snapshot: sessionSnapshot,
        interrupted_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Error marking session as interrupted:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in markSessionAsInterrupted:', error)
    return false
  }
}

/**
 * Get active session interruption for a user
 */
export const getActiveSessionInterruption = async (
  userId: string
): Promise<SessionInterruption | null> => {
  try {
    const { data, error } = await supabase
      .from('SessionInterruptions')
      .select('*')
      .eq('user_id', userId)
      .is('resumed_at', null)
      .order('interrupted_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return null // No active interruption
    }

    return data as SessionInterruption
  } catch (error) {
    console.error('Error in getActiveSessionInterruption:', error)
    return null
  }
}

/**
 * Resume session from snapshot
 */
export const resumeSessionFromSnapshot = async (
  interruptionId: string,
  sessionSnapshot: SessionSnapshot
): Promise<boolean> => {
  try {
    // Mark interruption as resumed
    const { error: interruptionError } = await supabase
      .from('SessionInterruptions')
      .update({
        resumed_at: new Date().toISOString()
      })
      .eq('id', interruptionId)

    if (interruptionError) {
      console.error('Error updating interruption:', interruptionError)
      return false
    }

    // Mark session as resumed
    const { error: sessionError } = await supabase
      .from('Quiz_Sessions')
      .update({
        is_interrupted: false,
        resumed_at: new Date().toISOString()
      })
      .eq('id', sessionSnapshot.sessionId)

    if (sessionError) {
      console.error('Error resuming session:', sessionError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in resumeSessionFromSnapshot:', error)
    return false
  }
}

/**
 * Check if user has active interrupted session
 */
export const hasActiveInterruptedSession = async (
  userId: string
): Promise<boolean> => {
  const interruption = await getActiveSessionInterruption(userId)
  return interruption !== null
}