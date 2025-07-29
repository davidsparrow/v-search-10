import React, { useState, useEffect } from 'react';
import { 
  getAdminNotificationSettings, 
  updateAdminNotificationSettings,
  NotificationSettings 
} from '../lib/adminNotifications';

interface AdminNotificationSettingsProps {
  onSettingsUpdated?: () => void;
}

export const AdminNotificationSettings: React.FC<AdminNotificationSettingsProps> = ({ 
  onSettingsUpdated 
}) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Priority level names
  const priorityNames = {
    0: 'Emergency (Priority 0)',
    1: 'Urgent (Priority 1)',
    2: 'Critical (Priority 2)',
    3: 'Important (Priority 3)',
    4: 'Normal (Priority 4)',
    5: 'Promotional (Priority 5)'
  };

  // Message types organized by priority
  const messageTypesByPriority = {
    0: ['emergency'],
    1: ['urgent'],
    2: ['critical'],
    3: ['important'],
    4: ['normal'],
    5: ['promotional']
  };

  // Command types
  const commandTypes = [
    'start_quiz', 'pause_game', 'resume_game', 'stop_game', 
    'emergency_stop', 'help', 'status', 'quit'
  ];

  // Session event types
  const sessionEventTypes = [
    'session_interruption', 'session_resume', 'auto_reply_applied'
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const notificationSettings = await getAdminNotificationSettings();
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = (priority: number, enabled: boolean) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      priorityLevels: {
        ...settings.priorityLevels,
        [priority]: enabled
      }
    };

    // Auto-check/uncheck message types based on priority selection
    const messageTypes = messageTypesByPriority[priority as keyof typeof messageTypesByPriority] || [];
    messageTypes.forEach(messageType => {
      newSettings.messageTypes[messageType] = enabled;
    });

    setSettings(newSettings);
  };

  const handleMessageTypeChange = (messageType: string, enabled: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      messageTypes: {
        ...settings.messageTypes,
        [messageType]: enabled
      }
    });
  };

  const handleCommandChange = (command: string, enabled: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      commands: {
        ...settings.commands,
        [command]: enabled
      }
    });
  };

  const handleSessionEventChange = (event: string, enabled: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      sessionEvents: {
        ...settings.sessionEvents,
        [event]: enabled
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const success = await updateAdminNotificationSettings(settings);
      
      if (success) {
        alert('Notification settings saved successfully!');
        onSettingsUpdated?.();
      } else {
        alert('Error saving notification settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Error saving notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading notification settings...</div>;
  }

  if (!settings) {
    return <div className="p-4 text-red-600">Error loading notification settings</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Notification Settings</h2>
      
      {/* Priority Level Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Priority Level Notifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select which priority levels should trigger admin notifications. 
          This will automatically check/uncheck all message types within each priority level.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(priorityNames).map(([priority, name]) => (
            <label key={priority} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.priorityLevels[parseInt(priority)] || false}
                onChange={(e) => handlePriorityChange(parseInt(priority), e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message Type Fine-Tuning */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Message Type Notifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Fine-tune notifications for specific message types. 
          You can override the priority-level settings here.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(messageTypesByPriority).map(([priority, messageTypes]) => (
            <div key={priority} className="border-l-4 border-blue-200 pl-4">
              <h4 className="font-medium text-gray-700 mb-2">{priorityNames[parseInt(priority) as keyof typeof priorityNames]}</h4>
              {messageTypes.map(messageType => (
                <label key={messageType} className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.messageTypes[messageType] || false}
                    onChange={(e) => handleMessageTypeChange(messageType, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 capitalize">{messageType.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Command Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Command Notifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select which admin commands should trigger notifications.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {commandTypes.map(command => (
            <label key={command} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.commands[command] || false}
                onChange={(e) => handleCommandChange(command, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{command.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Session Event Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Session Event Notifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select which session events should trigger admin notifications.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {sessionEventTypes.map(event => (
            <label key={event} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.sessionEvents[event] || false}
                onChange={(e) => handleSessionEventChange(event, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{event.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}; 