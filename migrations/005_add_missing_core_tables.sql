-- Migration: Add Missing Core Tables
-- Date: 2025-01-XX
-- Description: Adds missing core tables from schema_core.md

-- 1. UserSessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PromptTemplates Table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR NOT NULL UNIQUE,
  template_content TEXT NOT NULL,
  category VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SystemSettings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ReservedKeywords Table
CREATE TABLE IF NOT EXISTS reserved_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR NOT NULL UNIQUE,
  message_type_id UUID NOT NULL REFERENCES messagetypes(id) ON DELETE CASCADE,
  trigger_flow VARCHAR,
  admin_only BOOLEAN DEFAULT false,
  requires_confirmation BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SessionInterruptions Table
CREATE TABLE IF NOT EXISTS session_interruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  original_session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  critical_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  session_snapshot JSONB,
  interruption_reason VARCHAR DEFAULT 'critical_message',
  auto_resume BOOLEAN DEFAULT true,
  admin_override BOOLEAN DEFAULT false,
  interrupted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resumed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_reserved_keywords_keyword ON reserved_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_reserved_keywords_type ON reserved_keywords(message_type_id);
CREATE INDEX IF NOT EXISTS idx_session_interruptions_user ON session_interruptions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_interruptions_active ON session_interruptions(user_id) WHERE resumed_at IS NULL;

-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_interruptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active prompt templates" ON prompt_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view system settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view reserved keywords" ON reserved_keywords
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own interruptions" ON session_interruptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Insert some default system settings
INSERT INTO system_settings (key, value, description) VALUES
('default_logo_fallback', '/askbender-text-logo-transparent.png', 'Default logo to use when dynamic logos fail'),
('logo_rotation_frequency', 'session', 'How often to rotate logos: session, daily, weekly'),
('max_logo_file_size', '1024000', 'Maximum file size for logo uploads in bytes'),
('allowed_logo_formats', 'png,jpg,jpeg', 'Comma-separated list of allowed logo file formats')
ON CONFLICT (key) DO NOTHING; 