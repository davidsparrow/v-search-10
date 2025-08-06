-- Migration 011: Add SMS/Email Configuration Settings
-- Adds new system settings for SMS and Email provider configuration
-- Author: Eventria Team
-- Date: 2024

-- Create encryption function for API keys
CREATE OR REPLACE FUNCTION encrypt_api_key(key_value TEXT, master_key TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Simple base64 encoding for now - in production use proper encryption
    -- This is a placeholder - replace with proper encryption library
    RETURN encode(convert_to(key_value, 'UTF8'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Create decryption function for API keys
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_value TEXT, master_key TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Simple base64 decoding for now - in production use proper decryption
    -- This is a placeholder - replace with proper decryption library
    RETURN convert_from(decode(encrypted_value, 'base64'), 'UTF8');
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    -- SMS Configuration Settings
    
    -- Default message channel (sms, email, snapchat)
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'default_message_channel') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('default_message_channel', 'sms', 'Default message delivery channel: sms, email, snapchat');
    END IF;
    
    -- Fallback message channel
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'fallback_message_channel') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('fallback_message_channel', 'email', 'Fallback message delivery channel when primary fails');
    END IF;
    
    -- Use system email as final fallback
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'use_system_email_fallback') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('use_system_email_fallback', 'true', 'Use system-level email as final fallback when admin channels fail');
    END IF;
    
    -- System Twilio Configuration (encrypted)
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'twilio_account_sid') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('twilio_account_sid', '', 'System Twilio Account SID for default SMS delivery (encrypted)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'twilio_auth_token') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('twilio_auth_token', '', 'System Twilio Auth Token for default SMS delivery (encrypted)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'twilio_from_number') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('twilio_from_number', '', 'System default Twilio phone number for SMS delivery');
    END IF;
    
    -- Admin Twilio Configuration (encrypted)
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_twilio_account_sid') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_twilio_account_sid', '', 'Admin Twilio Account SID for high-volume SMS delivery (encrypted)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_twilio_auth_token') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_twilio_auth_token', '', 'Admin Twilio Auth Token for high-volume SMS delivery (encrypted)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_twilio_from_number') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_twilio_from_number', '', 'Admin Twilio phone number for high-volume SMS delivery');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'use_admin_twilio') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('use_admin_twilio', 'false', 'Use admin Twilio instead of system Twilio for SMS delivery');
    END IF;
    
    -- SMS Usage Tracking
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'sms_usage_limit') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('sms_usage_limit', '1000', 'Monthly SMS limit before requiring admin Twilio credentials');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'current_sms_usage') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('current_sms_usage', '0', 'Current month SMS usage count');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'require_admin_twilio_after_limit') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('require_admin_twilio_after_limit', 'true', 'Require admin Twilio after monthly limit exceeded');
    END IF;
    
    -- Email Configuration Settings
    
    -- Email provider selection
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_provider') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('email_provider', 'system', 'Email provider: system, sendgrid, mailgun, gmail');
    END IF;
    
    -- SendGrid Configuration (encrypted)
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'sendgrid_api_key') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('sendgrid_api_key', '', 'Admin SendGrid API key for custom email sending (encrypted)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'sendgrid_from_email') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('sendgrid_from_email', '', 'Admin SendGrid from email address');
    END IF;
    
    -- MailGun Configuration (encrypted)
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'mailgun_api_key') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('mailgun_api_key', '', 'Admin MailGun API key for custom email sending (encrypted)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'mailgun_domain') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('mailgun_domain', '', 'Admin MailGun domain for sending');
    END IF;
    
    -- Gmail Configuration
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_gmail_address') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_gmail_address', '', 'Admin Gmail address for integration');
    END IF;
    
    -- Email Usage Tracking
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_usage_limit') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('email_usage_limit', '5000', 'Monthly email limit');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'current_email_usage') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('current_email_usage', '0', 'Current month email usage count');
    END IF;
    
END $$; 