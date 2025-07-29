-- Migration: Seed Default Message Types and Reserved Keywords
-- Date: 2024-01-XX
-- Description: Inserts default message types and their associated reserved keywords

-- Insert default message types
INSERT INTO MessageTypes (type_name, display_name, priority_level, default_timeout_seconds, default_auto_reply, auto_interrupt) VALUES
('emergency', 'Emergency Alert', 0, 180, 'NO', true),
('urgent', 'Urgent Notice', 1, 300, 'NO', true),
('critical', 'Critical Message', 2, 600, 'NO', true),
('important', 'Important Notice', 3, 900, NULL, false),
('normal', 'Normal Message', 4, 1800, NULL, false),
('promotional', 'Promotional Message', 5, 3600, NULL, false);

-- Insert default reserved keywords for critical messages
INSERT INTO ReservedKeywords (keyword, message_type_id, trigger_flow, admin_only, requires_confirmation) VALUES
('EMERGENCY', (SELECT id FROM MessageTypes WHERE type_name = 'emergency'), 'emergency_interruption', false, true),
('URGENT', (SELECT id FROM MessageTypes WHERE type_name = 'urgent'), 'urgent_interruption', false, true),
('CRITICAL', (SELECT id FROM MessageTypes WHERE type_name = 'critical'), 'critical_interruption', false, true),
('IMPORTANT', (SELECT id FROM MessageTypes WHERE type_name = 'important'), 'important_notice', false, false),
('PROMO', (SELECT id FROM MessageTypes WHERE type_name = 'promotional'), 'promotional_message', false, false),
('PROMOTION', (SELECT id FROM MessageTypes WHERE type_name = 'promotional'), 'promotional_message', false, false);

-- Insert admin command keywords
INSERT INTO ReservedKeywords (keyword, message_type_id, trigger_flow, admin_only, requires_confirmation) VALUES
('START_QUIZ', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'quiz_start', true, false),
('PAUSE_GAME', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'game_pause', true, false),
('RESUME_GAME', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'game_resume', true, false),
('STOP_GAME', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'game_stop', true, true),
('EMERGENCY_STOP', (SELECT id FROM MessageTypes WHERE type_name = 'emergency'), 'emergency_stop', true, true),
('HELP', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'help_command', false, false),
('STATUS', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'status_command', false, false),
('QUIT', (SELECT id FROM MessageTypes WHERE type_name = 'normal'), 'quit_command', false, true);

-- Add comments for the default types
COMMENT ON COLUMN MessageTypes.priority_level IS '0=Emergency (3min), 1=Urgent (5min), 2=Critical (10min), 3=Important (15min), 4=Normal (30min), 5=Promotional (60min)'; 