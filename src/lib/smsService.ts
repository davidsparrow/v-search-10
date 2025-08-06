/**
 * SMS Service for handling SMS delivery with multiple providers
 * Supports encrypted API key storage for multi-tenant SaaS
 * @author Eventria Team
 */

import { supabase } from './supabase';

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

export interface SMSStatus {
  isConfigured: boolean;
  provider: string;
  usageInfo?: SMSUsageInfo;
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
   * Check SMS usage limits and determine which provider to use
   */
  async checkSMSUsageLimit(): Promise<SMSUsageInfo> {
    const currentUsage = parseInt(await this.getSystemSetting('current_sms_usage')) || 0;
    const limit = parseInt(await this.getSystemSetting('sms_usage_limit')) || 1000;
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
   * Check if admin Twilio is configured
   */
  private async isAdminTwilioConfigured(): Promise<boolean> {
    const accountSid = await this.getSystemSetting('admin_twilio_account_sid');
    const authToken = await this.getSystemSetting('admin_twilio_auth_token');
    const fromNumber = await this.getSystemSetting('admin_twilio_from_number');
    
    return !!(accountSid && authToken && fromNumber);
  }

  /**
   * Get SMS configuration status
   */
  async getSMSStatus(): Promise<SMSStatus> {
    const usageInfo = await this.checkSMSUsageLimit();
    const systemTwilioConfigured = await this.isSystemTwilioConfigured();
    const adminTwilioConfigured = await this.isAdminTwilioConfigured();
    
    let isConfigured = false;
    let provider = 'none';
    
    if (usageInfo.requiresAdminTwilio && adminTwilioConfigured) {
      isConfigured = true;
      provider = 'admin_twilio';
    } else if (systemTwilioConfigured) {
      isConfigured = true;
      provider = 'system_twilio';
    }
    
    return {
      isConfigured,
      provider,
      usageInfo
    };
  }

  /**
   * Check if system Twilio is configured
   */
  private async isSystemTwilioConfigured(): Promise<boolean> {
    const accountSid = await this.getSystemSetting('twilio_account_sid');
    const authToken = await this.getSystemSetting('twilio_auth_token');
    const fromNumber = await this.getSystemSetting('twilio_from_number');
    
    return !!(accountSid && authToken && fromNumber);
  }

  /**
   * Save SMS configuration (encrypts API keys)
   */
  async saveSMSConfig(config: {
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioFromNumber?: string;
    adminTwilioAccountSid?: string;
    adminTwilioAuthToken?: string;
    adminTwilioFromNumber?: string;
    useAdminTwilio?: boolean;
    smsUsageLimit?: number;
  }): Promise<void> {
    try {
      // Encrypt API keys before storing
      if (config.twilioAccountSid) {
        const encryptedSid = await this.encryptApiKey(config.twilioAccountSid);
        await this.updateSystemSetting('twilio_account_sid', encryptedSid);
      }
      
      if (config.twilioAuthToken) {
        const encryptedToken = await this.encryptApiKey(config.twilioAuthToken);
        await this.updateSystemSetting('twilio_auth_token', encryptedToken);
      }
      
      if (config.adminTwilioAccountSid) {
        const encryptedAdminSid = await this.encryptApiKey(config.adminTwilioAccountSid);
        await this.updateSystemSetting('admin_twilio_account_sid', encryptedAdminSid);
      }
      
      if (config.adminTwilioAuthToken) {
        const encryptedAdminToken = await this.encryptApiKey(config.adminTwilioAuthToken);
        await this.updateSystemSetting('admin_twilio_auth_token', encryptedAdminToken);
      }
      
      // Store non-sensitive fields
      if (config.twilioFromNumber) {
        await this.updateSystemSetting('twilio_from_number', config.twilioFromNumber);
      }
      
      if (config.adminTwilioFromNumber) {
        await this.updateSystemSetting('admin_twilio_from_number', config.adminTwilioFromNumber);
      }
      
      if (config.useAdminTwilio !== undefined) {
        await this.updateSystemSetting('use_admin_twilio', config.useAdminTwilio.toString());
      }
      
      if (config.smsUsageLimit) {
        await this.updateSystemSetting('sms_usage_limit', config.smsUsageLimit.toString());
      }
      
    } catch (error) {
      console.error('Error saving SMS configuration:', error);
      throw new Error('Failed to save SMS configuration');
    }
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
      const adminSid = await this.getSystemSetting('admin_twilio_account_sid');
      const adminToken = await this.getSystemSetting('admin_twilio_auth_token');
      const adminFromNumber = await this.getSystemSetting('admin_twilio_from_number');
      
      return {
        provider: 'twilio',
        twilioAccountSid: adminSid,
        twilioAuthToken: adminToken,
        twilioFromNumber: adminFromNumber
      };
    }
    
    // If custom config provided, use it
    if (config) {
      return config;
    }
    
    // Default to system Twilio
    const systemSid = await this.getSystemSetting('twilio_account_sid');
    const systemToken = await this.getSystemSetting('twilio_auth_token');
    const systemFromNumber = await this.getSystemSetting('twilio_from_number');
    
    return {
      provider: 'twilio',
      twilioAccountSid: systemSid,
      twilioAuthToken: systemToken,
      twilioFromNumber: systemFromNumber
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
      // Decrypt API keys
      const accountSid = await this.decryptApiKey(config.twilioAccountSid!);
      const authToken = await this.decryptApiKey(config.twilioAuthToken!);
      
      // MOCK: Replace with actual Twilio SDK call
      console.log('MOCK: Sending SMS via Twilio to', phoneNumber);
      console.log('MOCK: Using account SID:', accountSid.substring(0, 10) + '...');
      console.log('MOCK: Message:', message);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        success: true,
        messageId: `mock_twilio_${Date.now()}`,
        provider: 'twilio',
        cost: 0.0075 // Mock cost
      };
      
      /* REAL TWILIO IMPLEMENTATION:
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);
      
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
      */
      
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
   * Track SMS usage
   */
  private async trackSMSUsage(): Promise<void> {
    const currentUsage = parseInt(await this.getSystemSetting('current_sms_usage')) || 0;
    await this.updateSystemSetting('current_sms_usage', (currentUsage + 1).toString());
  }

  /**
   * Test SMS configuration
   */
  async testSMSConnection(config?: SMSConfig): Promise<SMSResponse> {
    return await this.sendSMS(
      '+1234567890', // Test number
      'Test message from Eventria system',
      config
    );
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance(); 