-- Migration: Add Analytics and Admin Tables
-- Date: 2025-01-XX
-- Description: Adds missing analytics and admin tables from schema_core.md

-- 1. AdminChatSessions Table
CREATE TABLE IF NOT EXISTS admin_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AuditLog Table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR NOT NULL,
  table_name VARCHAR,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Admin_API_Keys Table
CREATE TABLE IF NOT EXISTS admin_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name VARCHAR NOT NULL,
  api_key_hash VARCHAR NOT NULL,
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Template_Usage_Analytics Table
CREATE TABLE IF NOT EXISTS template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  avg_response_time INTEGER,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SMS_Fallback_Analytics Table
CREATE TABLE IF NOT EXISTS sms_fallback_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  fallback_count INTEGER DEFAULT 0,
  fallback_reasons JSONB,
  last_fallback TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Message_Character_Analysis Table
CREATE TABLE IF NOT EXISTS message_character_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  character_count INTEGER NOT NULL,
  word_count INTEGER,
  sentence_count INTEGER,
  complexity_score DECIMAL(3,2),
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_chat_sessions_admin_id ON admin_chat_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_sessions_active ON admin_chat_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_admin_id ON admin_api_keys(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_active ON admin_api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template_id ON template_usage_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_group_id ON template_usage_analytics(group_id);
CREATE INDEX IF NOT EXISTS idx_sms_fallback_analytics_group_id ON sms_fallback_analytics(group_id);
CREATE INDEX IF NOT EXISTS idx_sms_fallback_analytics_participant_id ON sms_fallback_analytics(participant_id);
CREATE INDEX IF NOT EXISTS idx_message_character_analysis_message_id ON message_character_analysis(message_id);

-- Enable RLS on all tables
ALTER TABLE admin_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_fallback_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_character_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view their own chat sessions" ON admin_chat_sessions
  FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Admins can view audit logs" ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view their own API keys" ON admin_api_keys
  FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Anyone can view template usage analytics" ON template_usage_analytics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view SMS fallback analytics" ON sms_fallback_analytics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view message character analysis" ON message_character_analysis
  FOR SELECT USING (true); 