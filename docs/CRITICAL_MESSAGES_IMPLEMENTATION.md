# Critical Message System Implementation

## Overview

The Critical Message System enables emergency, urgent, and critical messages to interrupt active user sessions and provides comprehensive admin notification controls. This system is designed to handle high-priority communications while maintaining session state and providing granular admin control over notifications.

## Key Features

### 1. Priority-Based Interruption
- **Priority-0 (Emergency)**: Always interrupts any session, including other Priority-0 sessions
- **Priority-1 (Urgent)**: Interrupts sessions except Priority-0
- **Priority-2 (Critical)**: Interrupts sessions except Priority-0 and Priority-1
- **Priority-3+**: Do not interrupt active sessions

### 2. Admin Notification Control
- **Priority-Level Selection**: Admins can select which priority levels (0-5) trigger notifications
- **Message-Type Fine-Tuning**: Admins can override priority settings for specific message types
- **Command Notifications**: Admins can control notifications for "Hey B" commands
- **Session Event Notifications**: Admins can control notifications for interruptions, resumes, auto-replies

### 3. Session Management
- **Complete Session Snapshots**: Captures all session data for full restoration
- **Smart Auto-Resume**: Resumes based on actual message timeout, not fixed timing
- **Priority-0 Interruption**: New Priority-0 messages can interrupt existing Priority-0 sessions
- **System-Managed Logic**: Interruption/resumption logic managed by system, not admins

### 4. Timeout Hierarchy
- **Type-Level**: MessageTypes.default_timeout_seconds (always overrides)
- **Group-Level**: Groups.default_reply_expiration_seconds (overrides system)
- **Message-Level**: Messages.reply_expiration_seconds (overrides all)
- **Question-Level**: Custom_Questions.reply_expiration_seconds (overrides all)

## Database Schema

### New Tables

#### MessageTypes Table
```sql
CREATE TABLE MessageTypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  priority_level INTEGER NOT NULL DEFAULT 0,
  default_timeout_seconds INTEGER NOT NULL DEFAULT 300,
  auto_interrupt BOOLEAN DEFAULT true,
  default_auto_reply TEXT,
  admin_configurable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### ReservedKeywords Table
```sql
CREATE TABLE ReservedKeywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR NOT NULL UNIQUE,
  message_type_id UUID NOT NULL REFERENCES MessageTypes(id) ON DELETE CASCADE,
  trigger_flow VARCHAR,
  admin_only BOOLEAN DEFAULT false,
  requires_confirmation BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### SessionInterruptions Table
```sql
CREATE TABLE SessionInterruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES Participants(id) ON DELETE CASCADE,
  original_session_id UUID NOT NULL REFERENCES UserSessions(id) ON DELETE CASCADE,
  critical_message_id UUID NOT NULL REFERENCES Messages(id) ON DELETE CASCADE,
  session_snapshot JSONB,
  interruption_reason VARCHAR DEFAULT 'critical_message',
  auto_resume BOOLEAN DEFAULT true,
  admin_override BOOLEAN DEFAULT false,
  interrupted_at TIMESTAMP DEFAULT NOW(),
  resumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Extended Tables

#### Messages Table Extensions
```sql
ALTER TABLE Messages ADD COLUMN is_critical BOOLEAN DEFAULT false;
ALTER TABLE Messages ADD COLUMN critical_keyword VARCHAR;
ALTER TABLE Messages ADD COLUMN response_required BOOLEAN DEFAULT false;
ALTER TABLE Messages ADD COLUMN auto_reply TEXT;
ALTER TABLE Messages ADD COLUMN responded_at TIMESTAMP;
ALTER TABLE Messages ADD COLUMN status VARCHAR DEFAULT 'pending';
ALTER TABLE Messages ADD COLUMN message_type_id UUID REFERENCES MessageTypes(id);
```

#### UserSessions Table Extensions
```sql
ALTER TABLE UserSessions ADD COLUMN is_interrupted BOOLEAN DEFAULT false;
ALTER TABLE UserSessions ADD COLUMN interruption_snapshot JSONB;
ALTER TABLE UserSessions ADD COLUMN interrupted_at TIMESTAMP;
ALTER TABLE UserSessions ADD COLUMN resumed_at TIMESTAMP;
```

#### PromptTemplates Table Extensions
```sql
ALTER TABLE PromptTemplates ADD COLUMN message_type_id UUID REFERENCES MessageTypes(id);
```

## Migration Files

### 001_add_critical_messages.sql
- Creates MessageTypes, ReservedKeywords, and SessionInterruptions tables
- Extends Messages, UserSessions, and PromptTemplates tables
- Adds performance indexes
- Includes comprehensive documentation comments

### 002_seed_critical_message_types.sql
- Seeds default message types (Emergency, Urgent, Critical, Important, Normal, Promotional)
- Seeds critical keywords (EMERGENCY, URGENT, CRITICAL)
- Seeds admin commands (START_QUIZ, PAUSE_GAME, etc.)
- Seeds user commands (HELP, STATUS, QUIT)

### 003_add_admin_notification_settings.sql
- Adds priority-level notification settings
- Adds message-type notification overrides
- Adds command notification settings
- Adds session event notification settings

## TypeScript Implementation

### Types (src/types/message.ts)
```typescript
export interface Message {
  // ... existing fields
  is_critical?: boolean;
  critical_keyword?: string;
  response_required?: boolean;
  auto_reply?: string;
  responded_at?: Date;
  status?: 'pending' | 'responded' | 'timeout' | 'auto_replied';
  message_type_id?: string;
}

export interface SessionInterruption {
  id: string;
  user_id: string;
  original_session_id: string;
  critical_message_id: string;
  session_snapshot: any;
  interruption_reason: string;
  auto_resume: boolean;
  admin_override: boolean;
  interrupted_at: Date;
  resumed_at?: Date;
  created_at: Date;
}

export interface MessageType {
  id: string;
  type_name: string;
  display_name: string;
  priority_level: number;
  default_timeout_seconds: number;
  auto_interrupt: boolean;
  default_auto_reply?: string;
  admin_configurable: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReservedKeyword {
  id: string;
  keyword: string;
  message_type_id: string;
  trigger_flow?: string;
  admin_only: boolean;
  requires_confirmation: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Critical Messages Utility (src/lib/criticalMessages.ts)
- `isCriticalMessage()`: Detects critical messages by keywords
- `extractCriticalKeyword()`: Extracts the triggering keyword
- `storeCriticalMessage()`: Stores critical messages
- `storeCriticalMessageWithInterruption()`: Enhanced storage with Priority-0 interruption logic
- `getPendingCriticalMessages()`: Gets pending critical messages for a user
- `updateCriticalMessageStatus()`: Updates message status
- `storeSessionInterruption()`: Stores session interruption records
- `getActiveSessionInterruption()`: Gets active interruption for a user
- `hasActivePriorityZeroSession()`: Checks for active Priority-0 sessions

### Admin Notifications Utility (src/lib/adminNotifications.ts)
- `getAdminNotificationSettings()`: Gets all notification settings
- `getDefaultNotificationSettings()`: Returns default settings
- `shouldNotifyAdminForMessage()`: Checks if admin should be notified for a message
- `shouldNotifyAdminForCommand()`: Checks if admin should be notified for a command
- `shouldNotifyAdminForSessionEvent()`: Checks if admin should be notified for session events
- `updateAdminNotificationSettings()`: Updates notification settings

### Admin UI Component (src/components/AdminNotificationSettings.tsx)
- Priority-level selection with auto-check/uncheck of message types
- Message-type fine-tuning organized by priority level
- Command notification settings
- Session event notification settings
- Real-time updates and save functionality

## Usage Examples

### Detecting and Storing Critical Messages
```typescript
import { isCriticalMessage, storeCriticalMessageWithInterruption } from '../lib/criticalMessages';

// Check if message is critical
if (isCriticalMessage(messageText)) {
  // Store with Priority-0 interruption logic
  const criticalMessage = await storeCriticalMessageWithInterruption(
    userId,
    sessionId,
    messageText,
    true, // response_required
    300   // timeout_seconds
  );
}
```

### Checking Admin Notifications
```typescript
import { shouldNotifyAdminForMessage } from '../lib/adminNotifications';

// Check if admin should be notified
const shouldNotify = await shouldNotifyAdminForMessage('emergency', 0);
if (shouldNotify) {
  // Send admin notification
  sendAdminNotification('Emergency message sent to user');
}
```

### Managing Session Interruptions
```typescript
import { storeSessionInterruption, getActiveSessionInterruption } from '../lib/criticalMessages';

// Store session interruption
const interruption = await storeSessionInterruption(
  userId,
  sessionId,
  criticalMessageId,
  sessionSnapshot,
  'critical_message'
);

// Get active interruption
const activeInterruption = await getActiveSessionInterruption(userId);
```

## Admin Dashboard Integration

The AdminNotificationSettings component provides a comprehensive UI for managing notification preferences:

1. **Priority Level Selection**: Checkboxes for each priority level (0-5)
2. **Message Type Fine-Tuning**: Individual checkboxes for each message type
3. **Command Notifications**: Settings for admin command notifications
4. **Session Event Notifications**: Settings for interruption/resume notifications

## Performance Considerations

### Indexes
- `idx_messages_is_critical`: For critical message queries
- `idx_messages_critical_status`: For pending critical messages
- `idx_user_sessions_interrupted`: For interrupted sessions
- `idx_message_types_priority`: For priority-based queries
- `idx_session_interruptions_active`: For active interruptions

### Optimization
- Session snapshots stored as JSONB for efficient querying
- Priority-based interruption logic minimizes unnecessary interruptions
- Admin notification settings cached for performance
- Timeout hierarchy prevents redundant timeout calculations

## Security Considerations

- Critical messages require confirmation for admin commands
- Session snapshots contain sensitive data and should be encrypted
- Admin notification settings control information disclosure
- Priority-0 messages can interrupt any session (use with caution)

## Future Enhancements

1. **Advanced Interruption Logic**: Support for conditional interruptions based on session type
2. **Notification Channels**: Support for SMS, email, and webhook notifications
3. **Analytics**: Track interruption patterns and admin response times
4. **Mobile App Integration**: Real-time notifications for mobile admin app
5. **Audit Logging**: Comprehensive logging of all critical message events

## Testing

### Unit Tests
- Critical message detection
- Priority-0 interruption logic
- Admin notification checking
- Session interruption storage/retrieval

### Integration Tests
- End-to-end critical message flow
- Admin notification delivery
- Session interruption/resumption
- Timeout-based auto-resume

### Performance Tests
- Large-scale session interruption handling
- Admin notification system performance
- Database query optimization

## Deployment Notes

1. **Database Migration**: Run migrations in order (001, 002, 003)
2. **Seed Data**: Verify default message types and keywords are seeded
3. **Admin Settings**: Configure initial admin notification preferences
4. **Monitoring**: Set up monitoring for critical message system
5. **Backup**: Ensure session snapshots are included in backups

## Support

For issues or questions about the Critical Message System:

1. Check the database logs for migration errors
2. Verify admin notification settings are properly configured
3. Test critical message detection with sample messages
4. Review session interruption records for debugging
5. Check admin notification delivery logs 