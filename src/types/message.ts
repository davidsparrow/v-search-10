export interface Message {
  id: string;
  user_id: string; // FK to Participants
  session_id: string; // FK to UserSessions
  message_text: string; // Message content
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  flow: string; // e.g., 'quiz', 'admin_setup', 'critical_message'
  step: string; // e.g., 'question', 'emergency', 'urgent'
  context: string; // e.g., 'general', 'interruption', 'resume'
  // New critical message fields
  is_critical?: boolean;
  critical_keyword?: string;
  response_required?: boolean;
  auto_reply?: string;
  responded_at?: Date;
  status?: 'pending' | 'responded' | 'timeout' | 'auto_replied';
  message_type_id?: string; // FK to MessageTypes
}

export interface SessionInterruption {
  id: string;
  user_id: string; // FK to Participants
  original_session_id: string; // FK to UserSessions
  critical_message_id: string; // FK to Messages
  session_snapshot: any;
  interruption_reason: string;
  auto_resume: boolean;
  admin_override: boolean;
  interrupted_at: Date;
  resumed_at?: Date;
  created_at: Date;
}

export interface MessageType {
  id: string;
  type_name: string;
  display_name: string;
  priority_level: number;
  default_timeout_seconds: number;
  auto_interrupt: boolean;
  default_auto_reply?: string;
  admin_configurable: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReservedKeyword {
  id: string;
  keyword: string;
  message_type_id: string; // FK to MessageTypes
  trigger_flow?: string;
  admin_only: boolean;
  requires_confirmation: boolean;
  created_at: Date;
  updated_at: Date;
} 