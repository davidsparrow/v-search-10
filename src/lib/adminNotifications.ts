import { supabase } from './supabase';

// Types for notification settings
export interface NotificationSettings {
  priorityLevels: { [key: number]: boolean };
  messageTypes: { [key: string]: boolean };
  commands: { [key: string]: boolean };
  sessionEvents: { [key: string]: boolean };
}

// Get all admin notification settings
export const getAdminNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .like('key', 'admin_notify_%');

    if (error) {
      console.error('Error getting admin notification settings:', error);
      return getDefaultNotificationSettings();
    }

    const settings: NotificationSettings = {
      priorityLevels: {},
      messageTypes: {},
      commands: {},
      sessionEvents: {}
    };

    data?.forEach(setting => {
      const value = setting.value === 'true';
      
      if (setting.key.startsWith('admin_notify_priority_')) {
        const priority = parseInt(setting.key.split('_').pop() || '0');
        settings.priorityLevels[priority] = value;
      } else if (setting.key.startsWith('admin_notify_message_type_')) {
        const messageType = setting.key.replace('admin_notify_message_type_', '');
        settings.messageTypes[messageType] = value;
      } else if (setting.key.startsWith('admin_notify_command_')) {
        const command = setting.key.replace('admin_notify_command_', '');
        settings.commands[command] = value;
      } else if (setting.key.startsWith('admin_notify_session_') || setting.key.startsWith('admin_notify_auto_')) {
        const event = setting.key.replace('admin_notify_', '');
        settings.sessionEvents[event] = value;
      }
    });

    return settings;
  } catch (error) {
    console.error('Error in getAdminNotificationSettings:', error);
    return getDefaultNotificationSettings();
  }
};

// Get default notification settings
export const getDefaultNotificationSettings = (): NotificationSettings => {
  return {
    priorityLevels: {
      0: true,  // Emergency
      1: true,  // Urgent
      2: true,  // Critical
      3: false, // Important
      4: false, // Normal
      5: false  // Promotional
    },
    messageTypes: {
      emergency: true,
      urgent: true,
      critical: true,
      important: false,
      normal: false,
      promotional: false
    },
    commands: {
      start_quiz: true,
      pause_game: true,
      resume_game: true,
      stop_game: true,
      emergency_stop: true,
      help: false,
      status: false,
      quit: true
    },
    sessionEvents: {
      session_interruption: true,
      session_resume: true,
      auto_reply_applied: true
    }
  };
};

// Check if admin should be notified for a specific message type and priority
export const shouldNotifyAdminForMessage = async (
  messageType: string,
  priority: number
): Promise<boolean> => {
  try {
    const settings = await getAdminNotificationSettings();
    
    // Check if there's a specific override for this message type
    const typeOverride = settings.messageTypes[messageType];
    if (typeOverride !== undefined) {
      return typeOverride;
    }
    
    // Otherwise use the priority level setting
    return settings.priorityLevels[priority] || false;
  } catch (error) {
    console.error('Error checking admin notification for message:', error);
    return false;
  }
};

// Check if admin should be notified for a specific command
export const shouldNotifyAdminForCommand = async (command: string): Promise<boolean> => {
  try {
    const settings = await getAdminNotificationSettings();
    return settings.commands[command] || false;
  } catch (error) {
    console.error('Error checking admin notification for command:', error);
    return false;
  }
};

// Check if admin should be notified for session events
export const shouldNotifyAdminForSessionEvent = async (event: string): Promise<boolean> => {
  try {
    const settings = await getAdminNotificationSettings();
    return settings.sessionEvents[event] || false;
  } catch (error) {
    console.error('Error checking admin notification for session event:', error);
    return false;
  }
};

// Update admin notification settings
export const updateAdminNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<boolean> => {
  try {
    const updates: Array<{ key: string; value: string }> = [];

    // Update priority level settings
    if (settings.priorityLevels) {
      Object.entries(settings.priorityLevels).forEach(([priority, enabled]) => {
        updates.push({
          key: `admin_notify_priority_${priority}`,
          value: enabled ? 'true' : 'false'
        });
      });
    }

    // Update message type settings
    if (settings.messageTypes) {
      Object.entries(settings.messageTypes).forEach(([messageType, enabled]) => {
        updates.push({
          key: `admin_notify_message_type_${messageType}`,
          value: enabled ? 'true' : 'false'
        });
      });
    }

    // Update command settings
    if (settings.commands) {
      Object.entries(settings.commands).forEach(([command, enabled]) => {
        updates.push({
          key: `admin_notify_command_${command}`,
          value: enabled ? 'true' : 'false'
        });
      });
    }

    // Update session event settings
    if (settings.sessionEvents) {
      Object.entries(settings.sessionEvents).forEach(([event, enabled]) => {
        updates.push({
          key: `admin_notify_${event}`,
          value: enabled ? 'true' : 'false'
        });
      });
    }

    // Update all settings in database
    for (const update of updates) {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: update.value })
        .eq('key', update.key);

      if (error) {
        console.error(`Error updating setting ${update.key}:`, error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating admin notification settings:', error);
    return false;
  }
}; 