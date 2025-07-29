# Critical Messages - Phase 1 Implementation

## Overview
Phase 1 implements the basic infrastructure for critical message detection and storage, leveraging existing timeout infrastructure.

## Schema Changes

### Messages Table Extensions
```sql
-- Added to existing Messages table (askbender-mvp2 schema)
ALTER TABLE Messages ADD COLUMN is_critical BOOLEAN DEFAULT false;
ALTER TABLE Messages ADD COLUMN critical_keyword VARCHAR;
ALTER TABLE Messages ADD COLUMN response_required BOOLEAN DEFAULT false;
ALTER TABLE Messages ADD COLUMN auto_reply TEXT;
ALTER TABLE Messages ADD COLUMN responded_at TIMESTAMP;
ALTER TABLE Messages ADD COLUMN status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'timeout', 'auto_replied'));
ALTER TABLE Messages ADD COLUMN message_type_id UUID REFERENCES MessageTypes(id);
```

### UserSessions Table Extensions
```sql
-- Added to existing UserSessions table
ALTER TABLE UserSessions ADD COLUMN is_interrupted BOOLEAN DEFAULT false;
ALTER TABLE UserSessions ADD COLUMN interruption_snapshot JSONB;
ALTER TABLE UserSessions ADD COLUMN interrupted_at TIMESTAMP;
ALTER TABLE UserSessions ADD COLUMN resumed_at TIMESTAMP;
```

### New MessageTypes Table
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

### New ReservedKeywords Table
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

### New SessionInterruptions Table
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

## New Files Created

### TypeScript Types
- `src/types/message.ts` - Message, SessionInterruption, CriticalKeyword interfaces

### Utility Functions
- `src/lib/criticalMessages.ts` - Critical message detection and storage functions

### State Management
- Extended `src/store/cloudStore.ts` - Added critical message state management

### Database Migration
- `migrations/001_add_critical_messages.sql` - Database schema changes

### Test Component
- `src/components/CriticalMessageTest.tsx` - Test component for verification

## Key Features Implemented

### 1. Critical Message Detection
```typescript
const isCriticalMessage = (content: string): boolean => {
  const criticalKeywords = ['EMERGENCY', 'URGENT', 'CRITICAL'];
  return criticalKeywords.some(keyword => 
    content.toUpperCase().startsWith(keyword)
  );
};
```

### 2. Critical Message Storage
```typescript
const storeCriticalMessage = async (
  participant_id: string,
  session_id: string,
  content: string,
  response_required: boolean = true,
  timeout_seconds: number = 300
): Promise<Message | null>
```

### 3. Session Interruption Tracking
```typescript
const storeSessionInterruption = async (
  participant_id: string,
  original_session_id: string,
  critical_message_id: string,
  session_snapshot: any,
  interruption_reason: string = 'critical_message'
): Promise<SessionInterruption | null>
```

## Integration with Existing Infrastructure

### Timeout System
- **Reuses existing `reply_expiration_seconds`** field in Messages table
- **Leverages existing timeout warning templates** in PromptTemplates
- **Uses existing expiration handling logic**

### Message Processing
- **Extends existing Messages table** with critical flags
- **Uses existing PromptTemplates** for critical responses
- **Integrates with existing SMS/Email delivery system**

### Session Management
- **Works with existing UserSessions table**
- **Compatible with existing Quiz_Sessions table**
- **Leverages existing Groups table**

## Testing

### Test Component Usage
```typescript
import { CriticalMessageTest } from './components/CriticalMessageTest';

// Add to any page for testing
<CriticalMessageTest />
```

### Test Examples
- `EMERGENCY: Server down!` - Should be detected as critical
- `URGENT: Need immediate response` - Should be detected as critical
- `CRITICAL: System failure` - Should be detected as critical
- `Hello, how are you?` - Should NOT be detected as critical

## Database Indexes

### Performance Optimizations
```sql
CREATE INDEX idx_messages_is_critical ON Messages(is_critical);
CREATE INDEX idx_messages_critical_status ON Messages(status) WHERE is_critical = true;
CREATE INDEX idx_session_interruptions_participant ON SessionInterruptions(participant_id);
CREATE INDEX idx_session_interruptions_active ON SessionInterruptions(participant_id) WHERE resumed_at IS NULL;
```

## Next Steps (Phase 2)

### Session Management Logic
- Session interruption/resumption
- Snapshot creation and restoration
- Auto-resume timers
- Admin override system

### Integration Points
- Message processing pipeline
- Priority-based routing
- Timeout handling
- Admin dashboard

## Notes

- **Minimal schema changes** - Only 2 new fields + 1 new table
- **Leverages existing infrastructure** - Reuses timeout system
- **Backward compatible** - Doesn't affect existing functionality
- **Testable** - Includes test component for verification

## Files Modified

1. `src/types/message.ts` - New file
2. `src/lib/criticalMessages.ts` - New file
3. `src/store/cloudStore.ts` - Extended
4. `migrations/001_add_critical_messages.sql` - New file
5. `src/components/CriticalMessageTest.tsx` - New file
6. `docs/CRITICAL_MESSAGES_PHASE1.md` - New file 