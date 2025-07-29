# CRITICAL MESSAGES - PHASE 2 IMPLEMENTATION PLAN

## IMPORTANT: Never make any code changes before confirming with Me first, always ask ME if you're not sure if you should make changes.

---

## **CURRENT STATUS**

### **Phase 1: ✅ COMPLETE**
- **Schema Changes**: Added critical message fields to Messages table + SessionInterruptions table
- **TypeScript Infrastructure**: Message types, utility functions, state management
- **Testing**: Test component for critical message detection
- **Documentation**: Complete Phase 1 documentation

### **Phase 2: 🔄 NEXT - AWAITING CLARIFICATION**
- **Session Management Logic**: Interruption/resumption, snapshot creation, auto-resume timers
- **Admin Override System**: Force resume, auto-fill, create new session
- **Integration Points**: Message processing pipeline, priority-based routing

---

## **PHASE 2 IMPLEMENTATION PLAN**

### **Core Features to Implement:**

#### **1. Session Interruption System**
- Detect when critical message arrives during active session
- Create complete session snapshot (game state, scores, progress)
- Pause current session and store interruption record
- Send critical message to user

#### **2. Auto-Resume System**
- Timer-based auto-resume after critical message timeout
- Restore session from snapshot with all progress intact
- Handle conflicts if user is in new session when auto-resume triggers

#### **3. Admin Override System**
- Admin dashboard for managing interrupted sessions
- Force resume original session
- Auto-fill default response (e.g., "NO") and resume
- Create new session with same progress
- Cancel auto-resume entirely

#### **4. Notification System**
- User notifications: "Session interrupted by emergency", "Session resumed automatically"
- Admin notifications: "User session interrupted", "Auto-resume triggered"
- CC system: Admin gets notified of automation changes

#### **5. Priority Integration**
- Critical messages (Priority 0) override all other sessions
- Handle multiple critical messages per user
- Respect existing session priorities when not critical

---

## **QUESTIONS REQUIRING ANSWERS BEFORE PROCEEDING**

### **1. Session Snapshot Strategy** ✅ **ANSWERED**
**Question**: What data should be captured in the session snapshot?
**Answer**: **ALL session data** - Complete JSON dump of entire session state including:
- Game/quiz scores and progress
- Current question/step
- Participant state and mood
- Time remaining
- Session configuration
- All session metadata and state

---

### **2. Auto-Resume Logic** ✅ **ANSWERED**
**Question**: When should auto-resume trigger and under what conditions?
**Answer**: **Smart detection** - Resume only if user/group not in new session that caused interruption
- System-managed interruptions based on actual message timeout (not fixed 5 minutes)
- Check both individual user sessions and group-level sessions
- Critical message timeout drives auto-resume timing
- Dynamic timeouts based on message type and group settings

---

### **3. Admin Override System** ✅ **ANSWERED**
**Question**: What admin actions should be available for interrupted sessions?
**Answer**: **System-managed interruptions** with admin timeout control
- System manages interruption logic (not admins)
- Admins control timeouts at Type/Group/Question levels
- Type-level timeouts always override group-level timeouts
- Admins can modify timeouts but not interrupt/resume logic
- Focus on timeout management rather than manual intervention

---

### **4. Priority System Integration** ✅ **ANSWERED**
**Question**: How should critical messages interact with existing priority system?
**Answer**: **Always interrupt** - Critical messages (Priority 0) always override any session
- Emergency/Urgent/Critical messages always interrupt regardless of session priority
- Handle multiple critical messages by most recent
- Resume based on original session priority
- Leverage existing MessageTypes priority system (0=highest, 5=lowest)

---

### **5. Notification System** ✅ **ANSWERED**
**Question**: What notifications should be sent to users and admins?
**Answer**: **System-managed notifications** with timeout-based messaging
**To User**:
- "Your session was interrupted by emergency message"
- "Session resumed automatically after [timeout] minutes"
- "You were marked as 'NO' due to no response"

**To Admin**:
- "User session interrupted by critical message"
- "Auto-resume triggered for user after [timeout]"
- "Auto-fill applied: User marked as 'NO'"
- Focus on timeout-based notifications rather than fixed timing

---

### **6. Database Integration** ✅ **ANSWERED**
**Question**: Should we add additional fields to existing tables?
**Answer**: **Already implemented** - All necessary fields are in the migration:
- ✅ `is_interrupted`, `interruption_snapshot`, `interrupted_at`, `resumed_at` to UserSessions
- ✅ `is_critical`, `critical_keyword`, `response_required`, `auto_reply`, `responded_at`, `status`, `message_type_id` to Messages
- ✅ MessageTypes table with priority levels and timeouts
- ✅ ReservedKeywords table for "Hey B" command system
- ✅ SessionInterruptions table for complex tracking
- ✅ All fields essential for the critical message system

---

## **IMPLEMENTATION APPROACH**

### **Step 1: Answer Questions Above**
- Get clarification on all 6 questions
- Finalize implementation strategy
- Confirm database changes needed

### **Step 2: Database Schema Updates**
- Add any additional fields identified
- Create indexes for performance
- Update migration scripts

### **Step 3: Session Management Logic**
- Implement session interruption system
- Create snapshot creation/restoration
- Build auto-resume timer system

### **Step 4: Admin Override System**
- Create admin dashboard components
- Implement override actions
- Add notification system

### **Step 5: Integration & Testing**
- Integrate with existing message processing
- Test end-to-end scenarios
- Performance optimization

---

## **✅ ALL QUESTIONS ANSWERED - READY FOR PHASE 2**

**All 6 questions have been answered and the implementation strategy is clear:**

1. ✅ **Session Snapshot**: ALL session data
2. ✅ **Auto-Resume Logic**: Smart detection based on message timeout
3. ✅ **Admin Override**: System-managed with admin timeout control
4. ✅ **Priority Integration**: Always interrupt (Priority 0)
5. ✅ **Notification System**: Timeout-based notifications
6. ✅ **Database Integration**: All fields already implemented

**Ready to proceed with Phase 2 implementation!** 