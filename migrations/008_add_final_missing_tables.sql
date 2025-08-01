-- Migration: Add Final Missing Tables
-- Date: 2025-01-XX
-- Description: Adds the final batch of missing tables from schema_core.md

-- 1. Thread Table
CREATE TABLE IF NOT EXISTS thread (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  thread_title VARCHAR,
  thread_status VARCHAR DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Professional_Mode Table
CREATE TABLE IF NOT EXISTS professional_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID REFERENCES auth.users(id),
  context TEXT,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User_Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role, group_id)
);

-- 4. Notification_Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  delivery_method VARCHAR DEFAULT 'email',
  frequency VARCHAR DEFAULT 'immediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- 5. Eventria_Integration Table
CREATE TABLE IF NOT EXISTS eventria_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  eventria_event_id VARCHAR,
  eventria_user_id VARCHAR,
  integration_status VARCHAR DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Cross_Domain_Profiles Table
CREATE TABLE IF NOT EXISTS cross_domain_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  domain VARCHAR NOT NULL,
  profile_data JSONB,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, domain)
);

-- 7. Message_Attachments Table
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR,
  upload_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Group_Invitations Table
CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_email VARCHAR NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_token VARCHAR NOT NULL UNIQUE,
  role VARCHAR DEFAULT 'participant',
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Message_Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  template_name VARCHAR NOT NULL,
  template_content TEXT NOT NULL,
  category VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Auto_Replies Table
CREATE TABLE IF NOT EXISTS auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  trigger_keywords TEXT[],
  reply_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thread_group_id ON thread(group_id);
CREATE INDEX IF NOT EXISTS idx_thread_participant_id ON thread(participant_id);
CREATE INDEX IF NOT EXISTS idx_thread_status ON thread(thread_status);
CREATE INDEX IF NOT EXISTS idx_professional_mode_group_id ON professional_mode(group_id);
CREATE INDEX IF NOT EXISTS idx_professional_mode_enabled ON professional_mode(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(notification_type);
CREATE INDEX IF NOT EXISTS idx_eventria_integration_group_id ON eventria_integration(group_id);
CREATE INDEX IF NOT EXISTS idx_cross_domain_profiles_participant_id ON cross_domain_profiles(participant_id);
CREATE INDEX IF NOT EXISTS idx_cross_domain_profiles_domain ON cross_domain_profiles(domain);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_message_templates_group_id ON message_templates(group_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_auto_replies_group_id ON auto_replies(group_id);
CREATE INDEX IF NOT EXISTS idx_auto_replies_active ON auto_replies(is_active) WHERE is_active = true;

-- Enable RLS on all tables
ALTER TABLE thread ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventria_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_domain_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view threads" ON thread
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view professional mode settings" ON professional_mode
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view user roles" ON user_roles
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view eventria integration" ON eventria_integration
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view cross domain profiles" ON cross_domain_profiles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view message attachments" ON message_attachments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view group invitations" ON group_invitations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view message templates" ON message_templates
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view auto replies" ON auto_replies
  FOR SELECT USING (true);

-- Insert some default notification settings
INSERT INTO notification_settings (user_id, notification_type, delivery_method, frequency) VALUES
('00000000-0000-0000-0000-000000000000', 'critical_messages', 'email', 'immediate'),
('00000000-0000-0000-0000-000000000000', 'system_alerts', 'email', 'daily'),
('00000000-0000-0000-0000-000000000000', 'quiz_results', 'email', 'immediate')
ON CONFLICT (user_id, notification_type) DO NOTHING; 