/**
 * Email Service for handling email delivery with multiple providers
 * Supports encrypted API key storage for multi-tenant SaaS
 * @author Eventria Team
 */

import { supabase } from './supabase';

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

export interface EmailStatus {
  isConfigured: boolean;
  provider: string;
  usageInfo?: {
    currentUsage: number;
    limit: number;
  };
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
   * Get master encryption key from environment
   */
  private getMasterKey(): string {
    const masterKey = process.env.VITE_MASTER_ENCRYPTION_KEY;
    if (!masterKey) {
      throw new Error('Master encryption key not configured');
    }
    return masterKey;
  }

  /**
   * Encrypt API key before storing in database
   */
  async encryptApiKey(plainTextKey: string): Promise<string> {
    try {
      const masterKey = this.getMasterKey();
      const { data, error } = await supabase.rpc('encrypt_api_key', {
        key_value: plainTextKey,
        master_key: masterKey
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error encrypting API key:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  /**
   * Decrypt API key from database
   */
  async decryptApiKey(encryptedKey: string): Promise<string> {
    try {
      const masterKey = this.getMasterKey();
      const { data, error } = await supabase.rpc('decrypt_api_key', {
        encrypted_value: encryptedKey,
        master_key: masterKey
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error decrypting API key:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Get system setting value
   */
  private async getSystemSetting(key: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error) throw error;
      return data?.value || '';
    } catch (error) {
      console.error(`Error getting system setting ${key}:`, error);
      return '';
    }
  }

  /**
   * Update system setting value
   */
  private async updateSystemSetting(key: string, value: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating system setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get email configuration status
   */
  async getEmailStatus(): Promise<EmailStatus> {
    const provider = await this.getSystemSetting('email_provider');
    const currentUsage = parseInt(await this.getSystemSetting('current_email_usage')) || 0;
    const limit = parseInt(await this.getSystemSetting('email_usage_limit')) || 5000;
    
    let isConfigured = false;
    
    switch (provider) {
      case 'sendgrid':
        const sendgridKey = await this.getSystemSetting('sendgrid_api_key');
        const sendgridEmail = await this.getSystemSetting('sendgrid_from_email');
        isConfigured = !!(sendgridKey && sendgridEmail);
        break;
      case 'mailgun':
        const mailgunKey = await this.getSystemSetting('mailgun_api_key');
        const mailgunDomain = await this.getSystemSetting('mailgun_domain');
        isConfigured = !!(mailgunKey && mailgunDomain);
        break;
      case 'gmail':
        const gmailAddress = await this.getSystemSetting('admin_gmail_address');
        isConfigured = !!gmailAddress;
        break;
      case 'system':
      default:
        isConfigured = true; // System email always available
        break;
    }
    
    return {
      isConfigured,
      provider,
      usageInfo: {
        currentUsage,
        limit
      }
    };
  }

  /**
   * Save email configuration (encrypts API keys)
   */
  async saveEmailConfig(config: {
    emailProvider?: 'system' | 'sendgrid' | 'mailgun' | 'gmail';
    sendgridApiKey?: string;
    sendgridFromEmail?: string;
    mailgunApiKey?: string;
    mailgunDomain?: string;
    adminGmailAddress?: string;
    emailUsageLimit?: number;
  }): Promise<void> {
    try {
      // Encrypt API keys before storing
      if (config.sendgridApiKey) {
        const encryptedKey = await this.encryptApiKey(config.sendgridApiKey);
        await this.updateSystemSetting('sendgrid_api_key', encryptedKey);
      }
      
      if (config.mailgunApiKey) {
        const encryptedKey = await this.encryptApiKey(config.mailgunApiKey);
        await this.updateSystemSetting('mailgun_api_key', encryptedKey);
      }
      
      // Store non-sensitive fields
      if (config.emailProvider) {
        await this.updateSystemSetting('email_provider', config.emailProvider);
      }
      
      if (config.sendgridFromEmail) {
        await this.updateSystemSetting('sendgrid_from_email', config.sendgridFromEmail);
      }
      
      if (config.mailgunDomain) {
        await this.updateSystemSetting('mailgun_domain', config.mailgunDomain);
      }
      
      if (config.adminGmailAddress) {
        await this.updateSystemSetting('admin_gmail_address', config.adminGmailAddress);
      }
      
      if (config.emailUsageLimit) {
        await this.updateSystemSetting('email_usage_limit', config.emailUsageLimit.toString());
      }
      
    } catch (error) {
      console.error('Error saving email configuration:', error);
      throw new Error('Failed to save email configuration');
    }
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
        const sendgridKey = await this.getSystemSetting('sendgrid_api_key');
        const sendgridEmail = await this.getSystemSetting('sendgrid_from_email');
        return {
          provider: 'sendgrid',
          sendgridApiKey: sendgridKey,
          sendgridFromEmail: sendgridEmail
        };
      case 'mailgun':
        const mailgunKey = await this.getSystemSetting('mailgun_api_key');
        const mailgunDomain = await this.getSystemSetting('mailgun_domain');
        return {
          provider: 'mailgun',
          mailgunApiKey: mailgunKey,
          mailgunDomain: mailgunDomain
        };
      case 'gmail':
        const gmailAddress = await this.getSystemSetting('admin_gmail_address');
        return {
          provider: 'gmail',
          adminGmailAddress: gmailAddress
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
      // Decrypt API key
      const apiKey = await this.decryptApiKey(config.sendgridApiKey!);
      
      // MOCK: Replace with actual SendGrid SDK call
      console.log('MOCK: Sending email via SendGrid to', content.to);
      console.log('MOCK: Using API key:', apiKey.substring(0, 10) + '...');
      console.log('MOCK: From email:', config.sendgridFromEmail);
      console.log('MOCK: Subject:', content.subject);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        messageId: `mock_sendgrid_${Date.now()}`,
        provider: 'sendgrid'
      };
      
      /* REAL SENDGRID IMPLEMENTATION:
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(apiKey);
      
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
      */
      
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
      // Decrypt API key
      const apiKey = await this.decryptApiKey(config.mailgunApiKey!);
      
      // MOCK: Replace with actual MailGun SDK call
      console.log('MOCK: Sending email via MailGun to', content.to);
      console.log('MOCK: Using API key:', apiKey.substring(0, 10) + '...');
      console.log('MOCK: Domain:', config.mailgunDomain);
      console.log('MOCK: Subject:', content.subject);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        messageId: `mock_mailgun_${Date.now()}`,
        provider: 'mailgun'
      };
      
      /* REAL MAILGUN IMPLEMENTATION:
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');
      
      const mailgun = new Mailgun(formData);
      const client = mailgun.client({
        username: 'api',
        key: apiKey
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
      */
      
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
      // MOCK: Replace with actual Gmail API call
      console.log('MOCK: Sending email via Gmail to', content.to);
      console.log('MOCK: From Gmail address:', config.adminGmailAddress);
      console.log('MOCK: Subject:', content.subject);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        messageId: `mock_gmail_${Date.now()}`,
        provider: 'gmail'
      };
      
      /* REAL GMAIL IMPLEMENTATION:
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
      */
      
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
      // MOCK: System email implementation
      console.log('MOCK: Sending system email to', content.to);
      console.log('MOCK: Subject:', content.subject);
      console.log('MOCK: Body:', content.body.substring(0, 100) + '...');
      
      // Simulate system email delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
    const currentUsage = parseInt(await this.getSystemSetting('current_email_usage')) || 0;
    await this.updateSystemSetting('current_email_usage', (currentUsage + 1).toString());
  }

  /**
   * Test email configuration
   */
  async testEmailConnection(config?: EmailConfig): Promise<EmailResponse> {
    const testContent: EmailContent = {
      to: 'test@example.com',
      subject: 'Test email from Eventria system',
      body: 'This is a test email to verify your email configuration.',
      htmlBody: '<p>This is a test email to verify your email configuration.</p>'
    };
    
    return await this.sendEmail(testContent, config);
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 