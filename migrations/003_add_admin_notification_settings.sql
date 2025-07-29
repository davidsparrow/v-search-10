-- Migration: Add Admin Notification Settings
-- Date: 2024-01-XX
-- Description: Adds admin notification settings to SystemSettings table for priority and message type notifications

-- Priority-level notification settings (multiple selection)
INSERT INTO SystemSettings (key, value, description) VALUES
('admin_notify_priority_0', 'true', 'Notify admin for Emergency priority messages (highest priority)'),
('admin_notify_priority_1', 'true', 'Notify admin for Urgent priority messages'),
('admin_notify_priority_2', 'true', 'Notify admin for Critical priority messages'),
('admin_notify_priority_3', 'false', 'Notify admin for Important priority messages'),
('admin_notify_priority_4', 'false', 'Notify admin for Normal priority messages'),
('admin_notify_priority_5', 'false', 'Notify admin for Promotional priority messages (lowest priority)');

-- Message type-level notification overrides (individual fine-tuning)
INSERT INTO SystemSettings (key, value, description) VALUES
('admin_notify_message_type_emergency', 'true', 'Notify admin for Emergency Alert messages'),
('admin_notify_message_type_urgent', 'true', 'Notify admin for Urgent Notice messages'),
('admin_notify_message_type_critical', 'true', 'Notify admin for Critical Message messages'),
('admin_notify_message_type_important', 'false', 'Notify admin for Important Notice messages'),
('admin_notify_message_type_normal', 'false', 'Notify admin for Normal Message messages'),
('admin_notify_message_type_promotional', 'false', 'Notify admin for Promotional Message messages');

-- Admin command notification settings
INSERT INTO SystemSettings (key, value, description) VALUES
('admin_notify_command_start_quiz', 'true', 'Notify admin when START_QUIZ command is used'),
('admin_notify_command_pause_game', 'true', 'Notify admin when PAUSE_GAME command is used'),
('admin_notify_command_resume_game', 'true', 'Notify admin when RESUME_GAME command is used'),
('admin_notify_command_stop_game', 'true', 'Notify admin when STOP_GAME command is used'),
('admin_notify_command_emergency_stop', 'true', 'Notify admin when EMERGENCY_STOP command is used'),
('admin_notify_command_help', 'false', 'Notify admin when HELP command is used'),
('admin_notify_command_status', 'false', 'Notify admin when STATUS command is used'),
('admin_notify_command_quit', 'true', 'Notify admin when QUIT command is used');

-- Session interruption notification settings
INSERT INTO SystemSettings (key, value, description) VALUES
('admin_notify_session_interruption', 'true', 'Notify admin when sessions are interrupted by critical messages'),
('admin_notify_session_resume', 'true', 'Notify admin when sessions are auto-resumed after timeout'),
('admin_notify_auto_reply_applied', 'true', 'Notify admin when auto-reply is applied due to timeout');

-- Add comments for documentation
COMMENT ON TABLE SystemSettings IS 'Global system settings including admin notification preferences';
COMMENT ON COLUMN SystemSettings.key IS 'Setting key in format: admin_notify_priority_X or admin_notify_message_type_X or admin_notify_command_X';
COMMENT ON COLUMN SystemSettings.value IS 'Boolean value as string: true/false';
COMMENT ON COLUMN SystemSettings.description IS 'Human-readable description of what this setting controls'; 