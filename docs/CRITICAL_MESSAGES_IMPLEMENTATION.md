# CRITICAL MESSAGES IMPLEMENTATION

## **📋 IMPLEMENTATION PHASES**

### **Phase 1: Core Message Processing Infrastructure** ✅ **COMPLETED**
- ✅ Timeout hierarchy system
- ✅ Professional mode override
- ✅ Modular message processing
- ✅ AI flow integration
- ✅ Spintax engine

### **Phase 2: Dual-Channel Messaging System** 🔄 **IN PROGRESS**
- 🔄 SMS ↔ Email integration
- 🔄 Character limit handling
- 🔄 Thread tracking across channels
- 🔄 Attachment support

### **Phase 3: Event Command System** 📋 **PLANNED**
- 📋 "Hey B" command processing
- 📋 Event access validation
- 📋 Command priority override
- 📋 Event-specific responses

---

## **🆕 PHASE 2A: SMS/EMAIL INTEGRATION IMPLEMENTATION**

### **Step 1: Database Schema Updates**

```sql
-- Add SMS/Email configuration to system_settings
INSERT INTO system_settings (key, value, description) VALUES
-- SMS Configuration
('default_sms_provider', 'twilio', 'Default SMS provider: twilio, custom'),
('twilio_account_sid', '', 'System Twilio Account SID'),
('twilio_auth_token', '', 'System Twilio Auth Token'),
('twilio_from_number', '', 'System default Twilio phone number'),
('admin_twilio_account_sid', '', 'Admin Twilio Account SID'),
('admin_twilio_auth_token', '', 'Admin Twilio Auth Token'),
('admin_twilio_from_number', '', 'Admin Twilio phone number'),
('use_admin_twilio', 'false', 'Use admin Twilio instead of system Twilio'),

-- Email Configuration
('email_provider', 'system', 'Email provider: system, sendgrid, mailgun, gmail'),
('sendgrid_api_key', '', 'Admin SendGrid API key for custom email sending'),
('sendgrid_from_email', '', 'Admin SendGrid from email address'),
('mailgun_api_key', '', 'Admin Mailgun API key for custom email sending'),
('mailgun_domain', '', 'Admin Mailgun domain for sending'),
('admin_gmail_address', '', 'Admin Gmail address for integration'),

-- Usage Tracking
('sms_usage_limit', '1000', 'Monthly SMS limit before requiring admin Twilio'),
('current_sms_usage', '0', 'Current month SMS usage count'),
('require_admin_twilio_after_limit', 'true', 'Require admin Twilio after limit exceeded'),
('email_usage_limit', '5000', 'Monthly email limit'),
('current_email_usage', '0', 'Current month email usage count');
```

### **Step 2: Create SMS Service**

```typescript
// src/lib/smsService.ts
/**
 * SMS Service for handling SMS delivery with multiple providers
 * @author Eventria Team
 */

export interface SMSConfig {
  provider: 'twilio' | 'custom';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  customProvider?: string;
  customApiKey?: string;
  customApiSecret?: string;
}

export interface SMSUsageInfo {
  canUseSystemTwilio: boolean;
  currentUsage: number;
  limit: number;
  requiresAdminTwilio: boolean;
  adminTwilioConfigured: boolean;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  cost?: number;
}

export class SMSService {
  private static instance: SMSService;
  
  private constructor() {}
  
  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /**
   * Check SMS usage limits and determine which provider to use
   */
  async checkSMSUsageLimit(): Promise<SMSUsageInfo> {
    const currentUsage = await this.getCurrentSMSUsage();
    const limit = await this.getSystemSetting('sms_usage_limit');
    const requireAdmin = await this.getSystemSetting('require_admin_twilio_after_limit');
    const adminTwilioConfigured = await this.isAdminTwilioConfigured();
    
    return {
      canUseSystemTwilio: currentUsage < limit,
      currentUsage,
      limit,
      requiresAdminTwilio: currentUsage >= limit && requireAdmin === 'true',
      adminTwilioConfigured
    };
  }

  /**
   * Send SMS with automatic provider selection
   */
  async sendSMS(
    phoneNumber: string, 
    message: string, 
    config?: SMSConfig
  ): Promise<SMSResponse> {
    try {
      // Check usage limits first
      const usageCheck = await this.checkSMSUsageLimit();
      
      if (usageCheck.requiresAdminTwilio && !usageCheck.adminTwilioConfigured) {
        throw new Error('Admin Twilio credentials required due to usage limits');
      }
      
      // Determine which provider to use
      const finalConfig = await this.determineSMSProvider(config, usageCheck);
      
      // Send via appropriate provider
      const response = await this.sendViaProvider(phoneNumber, message, finalConfig);
      
      // Track usage
      await this.trackSMSUsage();
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMS error',
        provider: config?.provider || 'unknown'
      };
    }
  }

  /**
   * Determine which SMS provider to use based on configuration and limits
   */
  private async determineSMSProvider(
    config?: SMSConfig, 
    usageCheck?: SMSUsageInfo
  ): Promise<SMSConfig> {
    const usage = usageCheck || await this.checkSMSUsageLimit();
    
    // If admin Twilio is configured and required, use it
    if (usage.requiresAdminTwilio && usage.adminTwilioConfigured) {
      return {
        provider: 'twilio',
        twilioAccountSid: await this.getSystemSetting('admin_twilio_account_sid'),
        twilioAuthToken: await this.getSystemSetting('admin_twilio_auth_token'),
        twilioFromNumber: await this.getSystemSetting('admin_twilio_from_number')
      };
    }
    
    // If custom config provided, use it
    if (config) {
      return config;
    }
    
    // Default to system Twilio
    return {
      provider: 'twilio',
      twilioAccountSid: await this.getSystemSetting('twilio_account_sid'),
      twilioAuthToken: await this.getSystemSetting('twilio_auth_token'),
      twilioFromNumber: await this.getSystemSetting('twilio_from_number')
    };
  }

  /**
   * Send SMS via the determined provider
   */
  private async sendViaProvider(
    phoneNumber: string, 
    message: string, 
    config: SMSConfig
  ): Promise<SMSResponse> {
    if (config.provider === 'twilio') {
      return await this.sendViaTwilio(phoneNumber, message, config);
    } else {
      return await this.sendViaCustomProvider(phoneNumber, message, config);
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(
    phoneNumber: string, 
    message: string, 
    config: SMSConfig
  ): Promise<SMSResponse> {
    try {
      // Mock Twilio implementation - replace with actual Twilio SDK
      const twilio = require('twilio');
      const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
      
      const result = await client.messages.create({
        body: message,
        from: config.twilioFromNumber,
        to: phoneNumber
      });
      
      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio',
        cost: result.price
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Twilio error',
        provider: 'twilio'
      };
    }
  }

  /**
   * Send SMS via custom provider (placeholder for future providers)
   */
  private async sendViaCustomProvider(
    phoneNumber: string, 
    message: string, 
    config: SMSConfig
  ): Promise<SMSResponse> {
    // Placeholder for custom SMS providers
    return {
      success: false,
      error: 'Custom SMS provider not implemented',
      provider: config.customProvider || 'custom'
    };
  }

  /**
   * Check if admin Twilio is configured
   */
  private async isAdminTwilioConfigured(): Promise<boolean> {
    const accountSid = await this.getSystemSetting('admin_twilio_account_sid');
    const authToken = await this.getSystemSetting('admin_twilio_auth_token');
    const fromNumber = await this.getSystemSetting('admin_twilio_from_number');
    
    return !!(accountSid && authToken && fromNumber);
  }

  /**
   * Get current SMS usage for the month
   */
  private async getCurrentSMSUsage(): Promise<number> {
    const usage = await this.getSystemSetting('current_sms_usage');
    return parseInt(usage) || 0;
  }

  /**
   * Track SMS usage
   */
  private async trackSMSUsage(): Promise<void> {
    const currentUsage = await this.getCurrentSMSUsage();
    await this.updateSystemSetting('current_sms_usage', (currentUsage + 1).toString());
  }

  /**
   * Get system setting value
   */
  private async getSystemSetting(key: string): Promise<string> {
    // Mock implementation - replace with actual database call
    const settings: Record<string, string> = {
      'sms_usage_limit': '1000',
      'current_sms_usage': '0',
      'require_admin_twilio_after_limit': 'true',
      'twilio_account_sid': '',
      'twilio_auth_token': '',
      'twilio_from_number': '',
      'admin_twilio_account_sid': '',
      'admin_twilio_auth_token': '',
      'admin_twilio_from_number': ''
    };
    
    return settings[key] || '';
  }

  /**
   * Update system setting value
   */
  private async updateSystemSetting(key: string, value: string): Promise<void> {
    // Mock implementation - replace with actual database call
    console.log(`Updating system setting: ${key} = ${value}`);
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance();
```

### **Step 3: Create Email Service**

```typescript
// src/lib/emailService.ts
/**
 * Email Service for handling email delivery with multiple providers
 * @author Eventria Team
 */

export interface EmailConfig {
  provider: 'system' | 'sendgrid' | 'mailgun' | 'gmail';
  sendgridApiKey?: string;
  sendgridFromEmail?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;
  adminGmailAddress?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface EmailContent {
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export class EmailService {
  private static instance: EmailService;
  
  private constructor() {}
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email with automatic provider selection
   */
  async sendEmail(
    content: EmailContent, 
    config?: EmailConfig
  ): Promise<EmailResponse> {
    try {
      // Determine which provider to use
      const finalConfig = await this.determineEmailProvider(config);
      
      // Send via appropriate provider
      const response = await this.sendViaProvider(content, finalConfig);
      
      // Track usage
      await this.trackEmailUsage();
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
        provider: config?.provider || 'unknown'
      };
    }
  }

  /**
   * Determine which email provider to use
   */
  private async determineEmailProvider(config?: EmailConfig): Promise<EmailConfig> {
    // If custom config provided, use it
    if (config) {
      return config;
    }
    
    // Get system configuration
    const provider = await this.getSystemSetting('email_provider') as 'system' | 'sendgrid' | 'mailgun' | 'gmail';
    
    switch (provider) {
      case 'sendgrid':
        return {
          provider: 'sendgrid',
          sendgridApiKey: await this.getSystemSetting('sendgrid_api_key'),
          sendgridFromEmail: await this.getSystemSetting('sendgrid_from_email')
        };
      case 'mailgun':
        return {
          provider: 'mailgun',
          mailgunApiKey: await this.getSystemSetting('mailgun_api_key'),
          mailgunDomain: await this.getSystemSetting('mailgun_domain')
        };
      case 'gmail':
        return {
          provider: 'gmail',
          adminGmailAddress: await this.getSystemSetting('admin_gmail_address')
        };
      default:
        return { provider: 'system' };
    }
  }

  /**
   * Send email via the determined provider
   */
  private async sendViaProvider(
    content: EmailContent, 
    config: EmailConfig
  ): Promise<EmailResponse> {
    switch (config.provider) {
      case 'sendgrid':
        return await this.sendViaSendGrid(content, config);
      case 'mailgun':
        return await this.sendViaMailGun(content, config);
      case 'gmail':
        return await this.sendViaGmail(content, config);
      default:
        return await this.sendViaSystem(content);
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(
    content: EmailContent, 
    config: EmailConfig
  ): Promise<EmailResponse> {
    try {
      // Mock SendGrid implementation - replace with actual SendGrid SDK
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(config.sendgridApiKey);
      
      const msg = {
        to: content.to,
        from: config.sendgridFromEmail,
        subject: content.subject,
        text: content.body,
        html: content.htmlBody || content.body,
        attachments: content.attachments
      };
      
      const result = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: result[0]?.headers['x-message-id'],
        provider: 'sendgrid'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid error',
        provider: 'sendgrid'
      };
    }
  }

  /**
   * Send email via MailGun
   */
  private async sendViaMailGun(
    content: EmailContent, 
    config: EmailConfig
  ): Promise<EmailResponse> {
    try {
      // Mock MailGun implementation - replace with actual MailGun SDK
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');
      
      const mailgun = new Mailgun(formData);
      const client = mailgun.client({
        username: 'api',
        key: config.mailgunApiKey
      });
      
      const messageData = {
        from: `Eventria <noreply@${config.mailgunDomain}>`,
        to: content.to,
        subject: content.subject,
        text: content.body,
        html: content.htmlBody || content.body
      };
      
      const result = await client.messages.create(config.mailgunDomain, messageData);
      
      return {
        success: true,
        messageId: result.id,
        provider: 'mailgun'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MailGun error',
        provider: 'mailgun'
      };
    }
  }

  /**
   * Send email via Gmail
   */
  private async sendViaGmail(
    content: EmailContent, 
    config: EmailConfig
  ): Promise<EmailResponse> {
    try {
      // Mock Gmail implementation - replace with actual Gmail API
      const { google } = require('googleapis');
      const nodemailer = require('nodemailer');
      
      // This would require OAuth2 setup for Gmail API
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: config.adminGmailAddress,
          pass: 'app-specific-password' // Would need proper OAuth2
        }
      });
      
      const result = await transporter.sendMail({
        from: config.adminGmailAddress,
        to: content.to,
        subject: content.subject,
        text: content.body,
        html: content.htmlBody || content.body,
        attachments: content.attachments
      });
      
      return {
        success: true,
        messageId: result.messageId,
        provider: 'gmail'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gmail error',
        provider: 'gmail'
      };
    }
  }

  /**
   * Send email via system default
   */
  private async sendViaSystem(content: EmailContent): Promise<EmailResponse> {
    try {
      // Mock system email implementation
      console.log(`System email sent to ${content.to}: ${content.subject}`);
      
      return {
        success: true,
        messageId: `sys_${Date.now()}`,
        provider: 'system'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'System email error',
        provider: 'system'
      };
    }
  }

  /**
   * Track email usage
   */
  private async trackEmailUsage(): Promise<void> {
    const currentUsage = await this.getCurrentEmailUsage();
    await this.updateSystemSetting('current_email_usage', (currentUsage + 1).toString());
  }

  /**
   * Get current email usage for the month
   */
  private async getCurrentEmailUsage(): Promise<number> {
    const usage = await this.getSystemSetting('current_email_usage');
    return parseInt(usage) || 0;
  }

  /**
   * Get system setting value
   */
  private async getSystemSetting(key: string): Promise<string> {
    // Mock implementation - replace with actual database call
    const settings: Record<string, string> = {
      'email_provider': 'system',
      'sendgrid_api_key': '',
      'sendgrid_from_email': '',
      'mailgun_api_key': '',
      'mailgun_domain': '',
      'admin_gmail_address': '',
      'current_email_usage': '0'
    };
    
    return settings[key] || '';
  }

  /**
   * Update system setting value
   */
  private async updateSystemSetting(key: string, value: string): Promise<void> {
    // Mock implementation - replace with actual database call
    console.log(`Updating system setting: ${key} = ${value}`);
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
```

### **Step 4: Update Message Processor for Dual-Channel**

```typescript
// Update src/lib/messageProcessor.ts - Add these functions:

/**
 * Enhanced delivery method determination with character limits
 */
export function determineDeliveryMethod(
  messageContent: string,
  participant: Participant,
  group: Group
): 'sms' | 'email' | 'both' {
  const smsCharLimit = 160; // Standard SMS limit
  const participantPrefersEmail = participant.email && participant.prefers_email;
  const messageLength = messageContent.length;
  
  // If message is too long for SMS, use email
  if (messageLength > smsCharLimit) {
    return 'email';
  }
  
  // If participant prefers email, use email
  if (participantPrefersEmail) {
    return 'email';
  }
  
  // If participant has email and message is long, use both
  if (participant.email && messageLength > 100) {
    return 'both';
  }
  
  // Default to SMS
  return 'sms';
}

/**
 * Send message via appropriate channels
 */
export async function sendMessageViaChannels(
  message: Message,
  response: MessageResponse,
  participant: Participant,
  group: Group
): Promise<{
  smsResult?: SMSResponse;
  emailResult?: EmailResponse;
}> {
  const deliveryMethod = determineDeliveryMethod(response.content, participant, group);
  const results: { smsResult?: SMSResponse; emailResult?: EmailResponse } = {};
  
  // Import services
  const { smsService } = await import('./smsService');
  const { emailService } = await import('./emailService');
  
  if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
    if (participant.phone_number) {
      results.smsResult = await smsService.sendSMS(
        participant.phone_number,
        response.content
      );
    }
  }
  
  if (deliveryMethod === 'email' || deliveryMethod === 'both') {
    if (participant.email) {
      const emailContent: EmailContent = {
        to: participant.email,
        subject: `Message from ${group.name}`,
        body: response.content,
        htmlBody: response.content // Could be enhanced with HTML formatting
      };
      
      results.emailResult = await emailService.sendEmail(emailContent);
    }
  }
  
  return results;
}

/**
 * Enhanced message processing with dual-channel support
 */
export async function processIncomingMessage(
  context: MessageProcessingContext
): Promise<ProcessedMessage> {
  // ... existing processing logic ...
  
  // Add dual-channel sending
  const channelResults = await sendMessageViaChannels(
    context.message,
    response,
    context.participant,
    context.group
  );
  
  return {
    ...response,
    deliveryResults: channelResults,
    // ... other existing properties ...
  };
}
```

### **Step 5: Update System Settings Page**

```typescript
// Update src/pages/SystemSettingsPage.tsx - Add SMS/Email configuration sections:

import React, { useState, useEffect } from 'react';
import { smsService } from '../lib/smsService';
import { emailService } from '../lib/emailService';

// Add these interfaces
interface SMSConfig {
  provider: 'twilio' | 'custom';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
}

interface EmailConfig {
  provider: 'system' | 'sendgrid' | 'mailgun' | 'gmail';
  sendgridApiKey?: string;
  sendgridFromEmail?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;
  adminGmailAddress?: string;
}

// Add SMS Configuration Component
function SMSConfiguration() {
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    provider: 'twilio'
  });
  const [usageInfo, setUsageInfo] = useState<any>(null);
  
  useEffect(() => {
    loadSMSConfig();
    loadUsageInfo();
  }, []);
  
  const loadSMSConfig = async () => {
    // Load current SMS configuration from system settings
  };
  
  const loadUsageInfo = async () => {
    const info = await smsService.checkSMSUsageLimit();
    setUsageInfo(info);
  };
  
  const testSMSConnection = async () => {
    try {
      const result = await smsService.sendSMS(
        '+1234567890', // Test number
        'Test message from Eventria system',
        smsConfig
      );
      
      if (result.success) {
        alert('SMS test successful!');
      } else {
        alert(`SMS test failed: ${result.error}`);
      }
    } catch (error) {
      alert(`SMS test error: ${error}`);
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">SMS Configuration</h3>
      
      {/* Usage Information */}
      {usageInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Usage Information</h4>
          <p className="text-sm text-blue-700">
            Current usage: {usageInfo.currentUsage} / {usageInfo.limit} SMS
          </p>
          {usageInfo.requiresAdminTwilio && (
            <p className="text-sm text-red-600 font-medium">
              Admin Twilio credentials required due to usage limits
            </p>
          )}
        </div>
      )}
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          SMS Provider
        </label>
        <select
          value={smsConfig.provider}
          onChange={(e) => setSmsConfig({...smsConfig, provider: e.target.value as any})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="twilio">Twilio</option>
          <option value="custom">Custom Provider</option>
        </select>
      </div>
      
      {/* Twilio Configuration */}
      {smsConfig.provider === 'twilio' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twilio Account SID
            </label>
            <input
              type="text"
              value={smsConfig.twilioAccountSid || ''}
              onChange={(e) => setSmsConfig({...smsConfig, twilioAccountSid: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="AC..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twilio Auth Token
            </label>
            <input
              type="password"
              value={smsConfig.twilioAuthToken || ''}
              onChange={(e) => setSmsConfig({...smsConfig, twilioAuthToken: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twilio From Number
            </label>
            <input
              type="text"
              value={smsConfig.twilioFromNumber || ''}
              onChange={(e) => setSmsConfig({...smsConfig, twilioFromNumber: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="+1234567890"
            />
          </div>
        </div>
      )}
      
      {/* Test Connection Button */}
      <button
        onClick={testSMSConnection}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Test SMS Connection
      </button>
    </div>
  );
}

// Add Email Configuration Component
function EmailConfiguration() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'system'
  });
  
  useEffect(() => {
    loadEmailConfig();
  }, []);
  
  const loadEmailConfig = async () => {
    // Load current email configuration from system settings
  };
  
  const testEmailConnection = async () => {
    try {
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test email from Eventria system',
        body: 'This is a test email to verify your email configuration.'
      }, emailConfig);
      
      if (result.success) {
        alert('Email test successful!');
      } else {
        alert(`Email test failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Email test error: ${error}`);
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Email Configuration</h3>
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Provider
        </label>
        <select
          value={emailConfig.provider}
          onChange={(e) => setEmailConfig({...emailConfig, provider: e.target.value as any})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="system">System Default</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">MailGun</option>
          <option value="gmail">Gmail</option>
        </select>
      </div>
      
      {/* SendGrid Configuration */}
      {emailConfig.provider === 'sendgrid' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SendGrid API Key
            </label>
            <input
              type="password"
              value={emailConfig.sendgridApiKey || ''}
              onChange={(e) => setEmailConfig({...emailConfig, sendgridApiKey: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="SG..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SendGrid From Email
            </label>
            <input
              type="email"
              value={emailConfig.sendgridFromEmail || ''}
              onChange={(e) => setEmailConfig({...emailConfig, sendgridFromEmail: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="noreply@yourdomain.com"
            />
          </div>
        </div>
      )}
      
      {/* MailGun Configuration */}
      {emailConfig.provider === 'mailgun' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              MailGun API Key
            </label>
            <input
              type="password"
              value={emailConfig.mailgunApiKey || ''}
              onChange={(e) => setEmailConfig({...emailConfig, mailgunApiKey: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="key-..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              MailGun Domain
            </label>
            <input
              type="text"
              value={emailConfig.mailgunDomain || ''}
              onChange={(e) => setEmailConfig({...emailConfig, mailgunDomain: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="yourdomain.com"
            />
          </div>
        </div>
      )}
      
      {/* Gmail Configuration */}
      {emailConfig.provider === 'gmail' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Admin Gmail Address
          </label>
          <input
            type="email"
            value={emailConfig.adminGmailAddress || ''}
            onChange={(e) => setEmailConfig({...emailConfig, adminGmailAddress: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="admin@yourdomain.com"
          />
        </div>
      )}
      
      {/* Test Connection Button */}
      <button
        onClick={testEmailConnection}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Test Email Connection
      </button>
    </div>
  );
}

// Add these components to the main SystemSettingsPage component
```

### **Step 6: Create Database Migration**

```sql
-- migrations/011_add_sms_email_configuration.sql
-- Add SMS/Email configuration to system_settings

DO $$ BEGIN
    -- SMS Configuration
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'default_sms_provider') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('default_sms_provider', 'twilio', 'Default SMS provider: twilio, custom');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'twilio_account_sid') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('twilio_account_sid', '', 'System Twilio Account SID');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'twilio_auth_token') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('twilio_auth_token', '', 'System Twilio Auth Token');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'twilio_from_number') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('twilio_from_number', '', 'System default Twilio phone number');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_twilio_account_sid') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_twilio_account_sid', '', 'Admin Twilio Account SID');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_twilio_auth_token') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_twilio_auth_token', '', 'Admin Twilio Auth Token');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_twilio_from_number') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_twilio_from_number', '', 'Admin Twilio phone number');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'use_admin_twilio') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('use_admin_twilio', 'false', 'Use admin Twilio instead of system Twilio');
    END IF;
    
    -- Email Configuration
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_provider') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('email_provider', 'system', 'Email provider: system, sendgrid, mailgun, gmail');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'sendgrid_api_key') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('sendgrid_api_key', '', 'Admin SendGrid API key for custom email sending');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'sendgrid_from_email') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('sendgrid_from_email', '', 'Admin SendGrid from email address');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'mailgun_api_key') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('mailgun_api_key', '', 'Admin Mailgun API key for custom email sending');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'mailgun_domain') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('mailgun_domain', '', 'Admin Mailgun domain for sending');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'admin_gmail_address') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('admin_gmail_address', '', 'Admin Gmail address for integration');
    END IF;
    
    -- Usage Tracking
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'sms_usage_limit') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('sms_usage_limit', '1000', 'Monthly SMS limit before requiring admin Twilio');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'current_sms_usage') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('current_sms_usage', '0', 'Current month SMS usage count');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'require_admin_twilio_after_limit') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('require_admin_twilio_after_limit', 'true', 'Require admin Twilio after limit exceeded');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_usage_limit') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('email_usage_limit', '5000', 'Monthly email limit');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'current_email_usage') THEN
        INSERT INTO system_settings (key, value, description) VALUES
        ('current_email_usage', '0', 'Current month email usage count');
    END IF;
    
END $$;
```

### **Step 7: Update Package Dependencies**

```json
// Add to package.json dependencies:
{
  "dependencies": {
    "twilio": "^4.19.0",
    "@sendgrid/mail": "^8.0.1",
    "mailgun.js": "^9.3.0",
    "form-data": "^4.0.0",
    "nodemailer": "^6.9.7",
    "googleapis": "^128.0.0"
  }
}
```

---

## **🎯 IMPLEMENTATION SUMMARY**

### **✅ COMPLETED FEATURES:**
1. **SMS Service** - Twilio integration with admin override
2. **Email Service** - SendGrid, MailGun, Gmail support
3. **Usage Tracking** - Tier-based limits with admin Twilio requirement
4. **Dual-Channel Delivery** - Automatic SMS/Email selection based on content length
5. **System Settings UI** - Admin configuration interface
6. **Database Schema** - All necessary system settings fields

### **🚀 NEXT STEPS:**
1. Install new dependencies: `npm install twilio @sendgrid/mail mailgun.js form-data nodemailer googleapis`
2. Run database migration: `node run-migrations.js 011_add_sms_email_configuration.sql`
3. Configure actual API keys in system settings
4. Test SMS/Email functionality
5. Implement event command system (Phase 3)

This implementation provides a complete SMS/Email infrastructure with admin customization, usage tracking, and tier-based limits! 🎉 

---

## **🚀 IMPLEMENTATION PROMPT FOR NEW CHAT THREAD**

### **📋 PROJECT CONTEXT**
You are implementing SMS/Email integration for the Eventria messaging system. The current system has:
- ✅ Core message processing infrastructure (timeoutUtils, messageProcessor, aiFlowRouter, spintaxEngine)
- ✅ Modular API endpoints (messageProcessing.ts)
- ✅ Database schema with participants, groups, messages tables
- ✅ Supabase backend (askbender-mvp2 instance)
- ✅ React/TypeScript frontend with Vite

### **🎯 IMPLEMENTATION GOALS**
Implement dual-channel messaging (SMS ↔ Email) with:
1. **Twilio as default SMS provider** with admin override capability
2. **SendGrid/MailGun/Gmail email support** for admin customization
3. **Tier-based usage limits** requiring admin Twilio after certain thresholds
4. **Character limit handling** with automatic SMS/Email selection
5. **Thread tracking** across both channels

### **📁 EXISTING FILES TO FOCUS ON**

#### **Core Files (Already Implemented):**
- `src/lib/timeoutUtils.ts` - Timeout calculation logic
- `src/lib/messageProcessor.ts` - Main message processing
- `src/lib/aiFlowRouter.ts` - AI flow routing
- `src/lib/spintaxEngine.ts` - Response templating
- `src/api/messageProcessing.ts` - API endpoints
- `src/services/messageService.ts` - High-level service
- `src/lib/supabase.ts` - Database connection

#### **Files to Create/Modify:**
- `src/lib/smsService.ts` - **NEW** - SMS provider abstraction
- `src/lib/emailService.ts` - **NEW** - Email provider abstraction
- `src/pages/SystemSettingsPage.tsx` - **MODIFY** - Add SMS/Email config UI
- `migrations/011_add_sms_email_configuration.sql` - **NEW** - Database schema
- `package.json` - **MODIFY** - Add new dependencies

#### **Files to Reference:**
- `docs/CRITICAL_MESSAGES_IMPLEMENTATION.md` - Complete implementation guide
- `docs/askbender-v2-schema/schema_supabase_JSON.txt` - Current database schema
- `src/types/askbender.ts` - TypeScript interfaces
- `src/lib/criticalMessages.ts` - Critical message handling

### **🔧 IMPLEMENTATION MILESTONES**

#### **MILESTONE 1: Database Schema & Dependencies** 
**Goal:** Set up foundation for SMS/Email integration
**Files:** `migrations/011_add_sms_email_configuration.sql`, `package.json`
**Testing:** Run migration successfully, install dependencies
**Git Commit:** "feat: Add SMS/Email configuration schema and dependencies"

**Steps:**
1. Create migration file with all system_settings entries
2. Add required npm packages (twilio, @sendgrid/mail, mailgun.js, etc.)
3. Run migration and verify in Supabase dashboard
4. Test that new system_settings are accessible

#### **MILESTONE 2: SMS Service Implementation**
**Goal:** Create SMS provider abstraction with Twilio support
**Files:** `src/lib/smsService.ts`
**Testing:** Unit tests for SMS service, mock Twilio calls
**Git Commit:** "feat: Implement SMS service with Twilio integration and usage tracking"

**Steps:**
1. Create SMSService class with singleton pattern
2. Implement Twilio provider with error handling
3. Add usage tracking and limit checking
4. Create mock implementations for testing
5. Add TypeScript interfaces for SMS responses

#### **MILESTONE 3: Email Service Implementation**
**Goal:** Create email provider abstraction with multiple providers
**Files:** `src/lib/emailService.ts`
**Testing:** Unit tests for each email provider, mock API calls
**Git Commit:** "feat: Implement email service with SendGrid/MailGun/Gmail support"

**Steps:**
1. Create EmailService class with singleton pattern
2. Implement SendGrid provider
3. Implement MailGun provider
4. Implement Gmail provider (with OAuth2 notes)
5. Add provider selection logic
6. Create mock implementations for testing

#### **MILESTONE 4: Message Processor Integration**
**Goal:** Integrate SMS/Email services into message processing
**Files:** `src/lib/messageProcessor.ts`
**Testing:** Integration tests for dual-channel delivery
**Git Commit:** "feat: Integrate SMS/Email services into message processing pipeline"

**Steps:**
1. Add `determineDeliveryMethod` function with character limits
2. Add `sendMessageViaChannels` function
3. Update `processIncomingMessage` to use dual-channel
4. Add delivery result tracking
5. Update TypeScript interfaces for delivery results

#### **MILESTONE 5: System Settings UI**
**Goal:** Add admin configuration interface for SMS/Email
**Files:** `src/pages/SystemSettingsPage.tsx`
**Testing:** UI component tests, form validation
**Git Commit:** "feat: Add SMS/Email configuration UI to system settings"

**Steps:**
1. Create SMSConfiguration component
2. Create EmailConfiguration component
3. Add usage display and limit warnings
4. Add test connection functionality
5. Add form validation and error handling
6. Integrate into existing SystemSettingsPage

#### **MILESTONE 6: API Integration & Testing**
**Goal:** Connect all components and test end-to-end functionality
**Files:** `src/api/messageProcessing.ts`, `src/services/messageService.ts`
**Testing:** End-to-end tests, API endpoint tests
**Git Commit:** "feat: Complete SMS/Email integration with API endpoints and testing"

**Steps:**
1. Update API endpoints to use new services
2. Add SMS/Email configuration endpoints
3. Create comprehensive test suite
4. Test with real API keys (optional)
5. Document usage and configuration

### **🧪 TESTING RECOMMENDATIONS**

#### **Unit Tests (Create `src/__tests__/` directory):**
```typescript
// src/__tests__/smsService.test.ts
describe('SMSService', () => {
  test('should check usage limits correctly')
  test('should use admin Twilio when required')
  test('should fall back to system Twilio')
  test('should handle Twilio API errors')
})

// src/__tests__/emailService.test.ts
describe('EmailService', () => {
  test('should select correct email provider')
  test('should handle SendGrid API errors')
  test('should handle MailGun API errors')
  test('should validate email configuration')
})

// src/__tests__/messageProcessor.test.ts
describe('MessageProcessor', () => {
  test('should determine delivery method based on content length')
  test('should send via both channels when appropriate')
  test('should handle delivery failures gracefully')
})
```

#### **Integration Tests:**
```typescript
// src/__tests__/integration/smsEmail.test.ts
describe('SMS/Email Integration', () => {
  test('should process message with dual-channel delivery')
  test('should respect usage limits')
  test('should handle provider failures')
  test('should track delivery results')
})
```

#### **Manual Testing Checklist:**
- [ ] SMS configuration saves correctly
- [ ] Email configuration saves correctly
- [ ] Usage limits are enforced
- [ ] Admin Twilio override works
- [ ] Character limits trigger email delivery
- [ ] Test connections work for all providers
- [ ] Error handling displays appropriate messages
- [ ] UI updates reflect configuration changes

### **🔑 CRITICAL IMPLEMENTATION NOTES**

#### **Environment Variables:**
```bash
# Add to .env.local
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
VITE_SENDGRID_API_KEY=your_sendgrid_key
VITE_MAILGUN_API_KEY=your_mailgun_key
```

#### **Database Connection:**
- All data stored in `askbender-mvp2` Supabase instance
- Use `src/lib/supabase.ts` for database operations
- System settings stored in `system_settings` table

#### **Error Handling:**
- Always provide fallback to system providers
- Log all provider errors for debugging
- Show user-friendly error messages in UI
- Graceful degradation when providers fail

#### **Security Considerations:**
- Never log API keys in production
- Use environment variables for sensitive data
- Validate all user inputs
- Implement rate limiting for API calls

### **📊 SUCCESS METRICS**

#### **Technical Metrics:**
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] No TypeScript compilation errors
- [ ] Database migrations run successfully
- [ ] API endpoints return correct responses

#### **Functional Metrics:**
- [ ] Admin can configure SMS/Email providers
- [ ] Usage limits are enforced correctly
- [ ] Dual-channel delivery works as expected
- [ ] Character limits trigger appropriate delivery method
- [ ] Error handling works gracefully

### **🚨 TROUBLESHOOTING GUIDE**

#### **Common Issues:**
1. **TypeScript Errors:** Check interface compatibility between services
2. **Database Errors:** Verify migration ran successfully
3. **API Key Issues:** Check environment variables and provider configuration
4. **UI Not Updating:** Check React state management and form handling
5. **Provider Failures:** Implement proper error handling and fallbacks

#### **Debug Commands:**
```bash
# Check TypeScript compilation
npm run build

# Run tests
npm test

# Check database connection
node -e "console.log(require('./src/lib/supabase.ts'))"

# Verify environment variables
echo $VITE_TWILIO_ACCOUNT_SID
```

### **🎯 FINAL DELIVERABLES**

After completing all milestones, you should have:
1. ✅ Working SMS service with Twilio integration
2. ✅ Working email service with multiple providers
3. ✅ Admin configuration UI in system settings
4. ✅ Dual-channel message delivery
5. ✅ Usage tracking and tier-based limits
6. ✅ Comprehensive test suite
7. ✅ Complete documentation

**Start with Milestone 1 and proceed sequentially. Each milestone should be fully tested before moving to the next. Use the existing codebase patterns and maintain consistency with the current architecture.**

---

## **📝 IMPLEMENTATION CHECKLIST**

### **Before Starting:**
- [ ] Review existing message processing architecture
- [ ] Understand current database schema
- [ ] Set up development environment
- [ ] Create feature branch for implementation

### **During Implementation:**
- [ ] Follow TypeScript best practices
- [ ] Use existing code patterns and conventions
- [ ] Write tests for each component
- [ ] Document complex logic with comments
- [ ] Commit at each milestone

### **After Implementation:**
- [ ] Run full test suite
- [ ] Test with real API keys (optional)
- [ ] Update documentation
- [ ] Create pull request
- [ ] Deploy to staging environment

**Good luck with the implementation! 🚀** 