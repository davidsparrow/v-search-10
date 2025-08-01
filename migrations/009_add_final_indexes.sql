-- Migration: Add Final Indexes
-- Date: 2025-01-XX
-- Description: Adds indexes for the final batch of tables

-- Create indexes for performance (separate from table creation to avoid errors)
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