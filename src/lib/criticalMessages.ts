import { supabase } from './supabase';
import { Message, SessionInterruption, MessageType, ReservedKeyword } from '../types/message';

// Critical message detection
export const isCriticalMessage = (content: string): boolean => {
  const criticalKeywords = ['EMERGENCY', 'URGENT', 'CRITICAL'];
  return criticalKeywords.some(keyword => 
    content.toUpperCase().startsWith(keyword)
  );
};

// Extract critical keyword from message
export const extractCriticalKeyword = (content: string): string | null => {
  const criticalKeywords = ['EMERGENCY', 'URGENT', 'CRITICAL'];
  for (const keyword of criticalKeywords) {
    if (content.toUpperCase().startsWith(keyword)) {
      return keyword;
    }
  }
  return null;
};

// Store critical message
export const storeCriticalMessage = async (
  user_id: string,
  session_id: string,
  message_text: string,
  response_required: boolean = true,
  timeout_seconds: number = 300
): Promise<Message | null> => {
  try {
    const criticalKeyword = extractCriticalKeyword(message_text);
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id,
        session_id,
        direction: 'inbound',
        message_text,
        is_critical: true,
        critical_keyword: criticalKeyword,
        response_required,
        status: 'pending',
        flow: 'critical_message',
        step: criticalKeyword?.toLowerCase() || 'emergency',
        context: 'interruption',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing critical message:', error);
      return null;
    }

    return data as Message;
  } catch (error) {
    console.error('Error in storeCriticalMessage:', error);
    return null;
  }
};

// Get pending critical messages for a user
export const getPendingCriticalMessages = async (
  user_id: string
): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_critical', true)
      .eq('status', 'pending')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error getting pending critical messages:', error);
      return [];
    }

    return data as Message[];
  } catch (error) {
    console.error('Error in getPendingCriticalMessages:', error);
    return [];
  }
};

// Update critical message status
export const updateCriticalMessageStatus = async (
  message_id: string,
  status: 'pending' | 'responded' | 'timeout' | 'auto_replied',
  responded_at?: Date
): Promise<boolean> => {
  try {
    const updateData: any = { status };
    if (responded_at) {
      updateData.responded_at = responded_at.toISOString();
    }

    const { error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', message_id);

    if (error) {
      console.error('Error updating critical message status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCriticalMessageStatus:', error);
    return false;
  }
};

// Store session interruption
export const storeSessionInterruption = async (
  user_id: string,
  original_session_id: string,
  critical_message_id: string,
  session_snapshot: any,
  interruption_reason: string = 'critical_message'
): Promise<SessionInterruption | null> => {
  try {
    const { data, error } = await supabase
      .from('session_interruptions')
      .insert({
        user_id,
        original_session_id,
        critical_message_id,
        session_snapshot,
        interruption_reason,
        auto_resume: true,
        admin_override: false,
        interrupted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing session interruption:', error);
      return null;
    }

    return data as SessionInterruption;
  } catch (error) {
    console.error('Error in storeSessionInterruption:', error);
    return null;
  }
};

// Get active session interruption for a user
export const getActiveSessionInterruption = async (
  user_id: string
): Promise<SessionInterruption | null> => {
  try {
    const { data, error } = await supabase
      .from('session_interruptions')
      .select('*')
      .eq('user_id', user_id)
      .is('resumed_at', null)
      .order('interrupted_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting active session interruption:', error);
      return null;
    }

    return data as SessionInterruption;
  } catch (error) {
    console.error('Error in getActiveSessionInterruption:', error);
    return null;
  }
};

// Check if user has active Priority-0 session (for interruption logic)
export const hasActivePriorityZeroSession = async (
  user_id: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, message_type_id')
      .eq('user_id', user_id)
      .eq('is_critical', true)
      .eq('status', 'pending')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return false; // No active critical message
    }

    // Get the message type to check if it's Priority-0
    if (data.message_type_id) {
      const { data: messageType, error: typeError } = await supabase
        .from('message_types')
        .select('priority_level')
        .eq('id', data.message_type_id)
        .single();

      if (!typeError && messageType) {
        return messageType.priority_level === 0; // Priority-0 (Emergency)
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking for active Priority-0 session:', error);
    return false;
  }
};

// Enhanced critical message storage with Priority-0 interruption logic
export const storeCriticalMessageWithInterruption = async (
  user_id: string,
  session_id: string,
  message_text: string,
  response_required: boolean = true,
  timeout_seconds: number = 300
): Promise<Message | null> => {
  try {
    const criticalKeyword = extractCriticalKeyword(message_text);
    
    // Check if this is a Priority-0 message
    const isPriorityZero = criticalKeyword === 'EMERGENCY';
    
    // If this is Priority-0 and user has active Priority-0 session, interrupt it
    if (isPriorityZero && await hasActivePriorityZeroSession(user_id)) {
      console.log('New Priority-0 message interrupting existing Priority-0 session');
      
      // Get the existing critical message to mark it as interrupted
      const existingInterruption = await getActiveSessionInterruption(user_id);
      if (existingInterruption) {
        // Mark the existing interruption as superseded
        await supabase
          .from('session_interruptions')
          .update({ 
            resumed_at: new Date().toISOString(),
            interruption_reason: 'superseded_by_priority_zero'
          })
          .eq('id', existingInterruption.id);
      }
    }

    // Store the new critical message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id,
        session_id,
        direction: 'inbound',
        message_text,
        is_critical: true,
        critical_keyword: criticalKeyword,
        response_required,
        status: 'pending',
        flow: 'critical_message',
        step: criticalKeyword?.toLowerCase() || 'emergency',
        context: 'interruption',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing critical message:', error);
      return null;
    }

    return data as Message;
  } catch (error) {
    console.error('Error in storeCriticalMessageWithInterruption:', error);
    return null;
  }
}; 