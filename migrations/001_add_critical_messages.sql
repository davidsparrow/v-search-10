-- Migration: Add Critical Message Support for eventria-mvp
-- Date: 2024-01-XX
-- Description: Adds critical message fields to Messages table, extends UserSessions, and creates essential tables

-- 1. Add critical message fields to existing Messages table
ALTER TABLE Messages ADD COLUMN is_critical BOOLEAN DEFAULT false;
ALTER TABLE Messages ADD COLUMN critical_keyword VARCHAR;
ALTER TABLE Messages ADD COLUMN response_required BOOLEAN DEFAULT false;
ALTER TABLE Messages ADD COLUMN auto_reply TEXT;
ALTER TABLE Messages ADD COLUMN responded_at TIMESTAMP;
ALTER TABLE Messages ADD COLUMN status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'timeout', 'auto_replied'));

-- 2. Add interruption tracking to existing UserSessions table
ALTER TABLE UserSessions ADD COLUMN is_interrupted BOOLEAN DEFAULT false;
ALTER TABLE UserSessions ADD COLUMN interruption_snapshot JSONB;
ALTER TABLE UserSessions ADD COLUMN interrupted_at TIMESTAMP;
ALTER TABLE UserSessions ADD COLUMN resumed_at TIMESTAMP;

-- 3. Create MessageTypes table (CRITICAL for message processing logic)
CREATE TABLE MessageTypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  priority_level INTEGER NOT NULL DEFAULT 0,
  default_timeout_seconds INTEGER NOT NULL DEFAULT 300,
  auto_interrupt BOOLEAN DEFAULT true,
  default_auto_reply TEXT,
  admin_configurable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create ReservedKeywords table (CRITICAL for "Hey B" command system)
CREATE TABLE ReservedKeywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR NOT NULL UNIQUE,
  message_type_id UUID NOT NULL REFERENCES MessageTypes(id) ON DELETE CASCADE,
  trigger_flow VARCHAR,
  admin_only BOOLEAN DEFAULT false,
  requires_confirmation BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create SessionInterruptions table (for complex interruption tracking)
CREATE TABLE SessionInterruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Participants(id) ON DELETE CASCADE,
  original_session_id UUID NOT NULL REFERENCES UserSessions(id) ON DELETE CASCADE,
  critical_message_id UUID NOT NULL REFERENCES Messages(id) ON DELETE CASCADE,
  session_snapshot JSONB,
  interruption_reason VARCHAR DEFAULT 'critical_message',
  auto_resume BOOLEAN DEFAULT true,
  admin_override BOOLEAN DEFAULT false,
  interrupted_at TIMESTAMP DEFAULT NOW(),
  resumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Add message_type_id to existing Messages table
ALTER TABLE Messages ADD COLUMN message_type_id UUID REFERENCES MessageTypes(id);

-- 7. Add message_type_id to existing PromptTemplates table
ALTER TABLE PromptTemplates ADD COLUMN message_type_id UUID REFERENCES MessageTypes(id);

-- Create indexes for performance
CREATE INDEX idx_messages_is_critical ON Messages(is_critical);
CREATE INDEX idx_messages_critical_status ON Messages(status) WHERE is_critical = true;
CREATE INDEX idx_messages_type ON Messages(message_type_id) WHERE message_type_id IS NOT NULL;
CREATE INDEX idx_user_sessions_interrupted ON UserSessions(is_interrupted) WHERE is_interrupted = true;
CREATE INDEX idx_message_types_priority ON MessageTypes(priority_level);
CREATE INDEX idx_message_types_name ON MessageTypes(type_name);
CREATE INDEX idx_reserved_keywords_keyword ON ReservedKeywords(keyword);
CREATE INDEX idx_reserved_keywords_type ON ReservedKeywords(message_type_id);
CREATE INDEX idx_session_interruptions_user ON SessionInterruptions(user_id);
CREATE INDEX idx_session_interruptions_active ON SessionInterruptions(user_id) WHERE resumed_at IS NULL;
CREATE INDEX idx_prompt_templates_type ON PromptTemplates(message_type_id) WHERE message_type_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN Messages.is_critical IS 'Indicates if this is a critical/emergency message';
COMMENT ON COLUMN Messages.critical_keyword IS 'The critical keyword that triggered this message (EMERGENCY, URGENT, CRITICAL)';
COMMENT ON COLUMN Messages.response_required IS 'Whether a response is required for this critical message';
COMMENT ON COLUMN Messages.auto_reply IS 'Default auto-reply if no response is received within timeout';
COMMENT ON COLUMN Messages.responded_at IS 'When the user responded to this critical message';
COMMENT ON COLUMN Messages.status IS 'Status of critical message: pending, responded, timeout, auto_replied';
COMMENT ON COLUMN Messages.message_type_id IS 'Reference to MessageTypes table for type-specific processing';

COMMENT ON COLUMN UserSessions.is_interrupted IS 'Whether this session was interrupted by a critical message';
COMMENT ON COLUMN UserSessions.interruption_snapshot IS 'JSON snapshot of session state when interrupted';
COMMENT ON COLUMN UserSessions.interrupted_at IS 'When the session was interrupted';
COMMENT ON COLUMN UserSessions.resumed_at IS 'When the session was resumed';

COMMENT ON TABLE MessageTypes IS 'Core message type definitions with priority levels and default settings';
COMMENT ON COLUMN MessageTypes.priority_level IS '0 = highest priority (emergency), 10 = lowest priority (normal)';
COMMENT ON COLUMN MessageTypes.default_timeout_seconds IS 'Default timeout in seconds for this message type';
COMMENT ON COLUMN MessageTypes.auto_interrupt IS 'Whether this message type should interrupt active sessions';

COMMENT ON TABLE ReservedKeywords IS 'Keywords that trigger specific message types when found in message content';
COMMENT ON COLUMN ReservedKeywords.keyword IS 'Uppercase keyword that triggers message type detection';
COMMENT ON COLUMN ReservedKeywords.trigger_flow IS 'The flow to trigger when this keyword is detected';
COMMENT ON COLUMN ReservedKeywords.admin_only IS 'Whether only admins can use this keyword';
COMMENT ON COLUMN ReservedKeywords.requires_confirmation IS 'Whether this keyword requires confirmation before execution';

COMMENT ON TABLE SessionInterruptions IS 'Tracks session interruptions caused by critical messages';
COMMENT ON COLUMN SessionInterruptions.session_snapshot IS 'JSON snapshot of session state when interrupted';
COMMENT ON COLUMN SessionInterruptions.auto_resume IS 'Whether to automatically resume the session after critical message timeout';
COMMENT ON COLUMN SessionInterruptions.admin_override IS 'Whether admin manually overrode the interruption';

COMMENT ON COLUMN PromptTemplates.message_type_id IS 'Groups prompt templates by message type for context-aware responses'; 