-- Rollback Migration 011: Remove SMS/Email Configuration Settings
-- Removes all SMS/Email configuration settings and encryption functions
-- Author: Eventria Team
-- Date: 2024

-- Remove all SMS/Email configuration settings
DELETE FROM system_settings WHERE key IN (
    'default_message_channel',
    'fallback_message_channel', 
    'use_system_email_fallback',
    'twilio_account_sid',
    'twilio_auth_token',
    'twilio_from_number',
    'admin_twilio_account_sid',
    'admin_twilio_auth_token',
    'admin_twilio_from_number',
    'use_admin_twilio',
    'sms_usage_limit',
    'current_sms_usage',
    'require_admin_twilio_after_limit',
    'email_provider',
    'sendgrid_api_key',
    'sendgrid_from_email',
    'mailgun_api_key',
    'mailgun_domain',
    'admin_gmail_address',
    'email_usage_limit',
    'current_email_usage'
);

-- Remove encryption functions
DROP FUNCTION IF EXISTS encrypt_api_key(TEXT, TEXT);
DROP FUNCTION IF EXISTS decrypt_api_key(TEXT, TEXT); 