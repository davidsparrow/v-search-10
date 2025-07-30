# Technical Overview (Annotated)

This document provides the technical architecture and implementation specifications for the Ask Bender ("Z") platform, annotated with:
- **MVP NOTE:** Where implementation is intentionally simple for MVP
- **EDGE CASE:** Known complexities or risks
- **FUTURE:** Planned scalable or advanced features

---

# Mobile-First & Messaging-Only Philosophy

AskBender is designed from the ground up for a mobile-first, messaging-centric experience:

- **Contestants:** Interact exclusively via SMS and email (no web UI, no app downloads, zero friction).
- **Admins:** Use a mobile-optimized web dashboard (React PWA) for all management tasks.
- **Desktop:** Supported for admins, but not a design priority.
- **Future:** WhatsApp, Discord, and Slack integrations are planned for post-MVP phases.

This approach ensures maximum accessibility and simplicity for participants, while giving hosts powerful, touch-friendly tools.

---

# Administrative Controls & System Dashboards

## 🛠️ Admin Controls & Personality Configuration
- Complete admin interface for Z's mood, personality sliders, grammar preview, SMS fallback, and spintax variety.
- **MVP NOTE:** All controls available in admin dashboard; some (e.g., advanced analytics) may be stubbed for MVP.
- Real-time character analysis, delivery method preview, and optimization suggestions for SMS/email.
- Emergency Funeral Mode override, infinite spintax variety monitoring, and live participant management.
- **EDGE CASE:** Ensure all emergency overrides and professional modes are always available regardless of system state.

---

# Business Model & Tiered Feature Architecture

## 💸 Business Model & Pricing (Technical Implications)
- 3-tier AskBender membership structure with cross-domain Eventria.ai integration
- Professional market packages (memorial, corporate, religious, wedding) with perfect grammar and reliable delivery
- **MVP NOTE:** Only core tiers and basic professional mode for MVP; advanced/enterprise features can be stubbed
- **EDGE CASE:** Ensure feature gating is enforced at the API/service layer, not just UI
- Revenue model and growth strategy drive technical requirements for scalability, reliability, and analytics

## 🎯 Tier System & Cross-Domain Integration

### AskBender Tiers (Configurable)
| Tier Name | Price | Max Quizzes | Max Participants | Features |
|-----------|-------|-------------|------------------|----------|
| fresh_meat | $0 | 1 | 20 | Basic features, Professional Mode access |
| lab_rat | $7 | unlimited | 100 | + Answer recycling, Basic memory retention |
| free_range | $27 | unlimited | 500 | + Advanced memory retention, Advanced analytics |

### Eventria.ai Tiers (Configurable)
| Tier Name | Price | AskBender Access | Features |
|-----------|-------|------------------|----------|
| free | $0 | none | Basic event planning |
| lightweight | $20 | lab_rat | + Business directory, Community features |
| heavyweight | $77 | free_range | + Advanced analytics, Priority support |
| contender | $497 | free_range+ | + Enterprise features, Dedicated support |
| champion | $10,000 | free_range+ | + Unlimited everything, VIP features |

### Cross-Domain Rules
- **Eventria.ai subscriptions override AskBender tiers** - Single source of truth
- **Highest tier wins** for feature access across domains
- **Shared user database** across both platforms
- **Unified authentication** via Supabase
- **API-level feature gating** ensures consistent access control

### Technical Implementation
- **Flexible tier definitions** in database tables (not hardcoded)
- **Dynamic feature validation** at API/service layer
- **Cross-domain user resolution** via shared email/phone
- **Subscription status checking** across both platforms
- **Graceful degradation** for free users

### Database Schema for Tier System
```sql
## AskBender_Tiers Table (Flexible)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| tier_name                | String    | Configurable name (fresh_meat, lab_rat, free_range) |
| price_cents              | Integer   | Price in cents (0, 700, 2700) |
| max_quizzes              | Integer   | -1 = unlimited |
| max_participants         | Integer   | -1 = unlimited |
| features                 | JSON      | Array of feature strings |
| is_active                | Boolean   | Can disable tiers |
| created_at               | DateTime  | |
| updated_at               | DateTime  | |

## Eventria_Tiers Table (Flexible)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| tier_name                | String    | Configurable name |
| price_cents              | Integer   | Price in cents |
| askbender_tier_access    | String    | FK to AskBender_Tiers |
| features                 | JSON      | Array of feature strings |
| is_active                | Boolean   | Can disable tiers |
| created_at               | DateTime  | |
| updated_at               | DateTime  | |

## Feature_Gates Table (Flexible)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| feature_name             | String    | Configurable feature name |
| askbender_tier_required  | String    | Minimum tier name |
| eventria_tier_required   | String    | Minimum tier name |
| is_active                | Boolean   | Can disable features |
| created_at               | DateTime  | |
```

### Comprehensive Tier Matrix

**Legend:**
- ✅ = Available | ❌ = Not Available | 🔄 = Limited Access
- **Complexity:** Low = UI only, Medium = API + DB, High = Service + Integration
- **Dependencies:** Database tables, API endpoints, external services

#### AskBender Feature Matrix

| Feature | Fresh Meat | Lab Rat | Free Range | Technical Location | Complexity | Dependencies |
|---------|------------|---------|------------|-------------------|------------|--------------|
| **Basic Quiz Creation** | ✅ (1/month) | ✅ (unlimited) | ✅ (unlimited) | API: `/quizzes/create` | Low | Groups table, Quizzes table |
| **Professional Mode** | ✅ | ✅ | ✅ | API: `/groups/professional-mode` | Medium | Groups.professional_mode_enabled |
| **SMS Delivery** | ✅ | ✅ | ✅ | API: `/messages/send` | Medium | Twilio integration |
| **Email Fallback** | ✅ | ✅ | ✅ | API: `/messages/fallback` | Medium | SendGrid integration |
| **Basic Analytics** | ✅ | ✅ | ✅ | API: `/analytics/basic` | Low | Messages table, Participants table |
| **Advanced Analytics** | ❌ | ❌ | ✅ | API: `/analytics/advanced` | High | Analytics service, Data warehouse |
| **Memory Retention** | ❌ | ✅ (basic) | ✅ (advanced) | API: `/participants/memory` | Medium | Participants.personality_profile |
| **Answer Recycling** | ❌ | ✅ | ✅ | API: `/quizzes/recycle-answers` | Medium | Custom_Questions table |
| **Unlimited Participants** | ❌ (20 max) | ❌ (100 max) | ✅ (500 max) | API: `/groups/participants` | Medium | Groups.max_participants |
| **Cross-Domain Access** | ❌ | ✅ | ✅ | Auth: `/auth/cross-domain` | High | Supabase RLS, Eventria.ai API |
| **Viral Content Generation** | ✅ | ✅ | ✅ | API: `/social/generate` | Medium | Social media APIs |
| **Custom Grammar Rules** | ❌ | ❌ | ✅ | API: `/groups/grammar-rules` | High | OpenAI integration |
| **Priority Support** | ❌ | ❌ | ✅ | Support: `/support/priority` | Low | Support system |

#### Eventria.ai Cross-Domain Access Matrix

| Eventria.ai Tier | AskBender Access | Technical Location | Complexity | Dependencies |
|------------------|------------------|-------------------|------------|--------------|
| **Free** | ❌ None | Auth: `/auth/askbender-access` | Low | Supabase auth |
| **Lightweight** | ✅ Lab Rat | Auth: `/auth/cross-domain` | Medium | AskBender API |
| **Heavyweight** | ✅ Free Range | Auth: `/auth/cross-domain` | Medium | AskBender API |
| **Contender** | ✅ Free Range+ | Auth: `/auth/cross-domain` | High | AskBender API + Limits |
| **Champion** | ✅ Free Range+ | Auth: `/auth/cross-domain` | High | AskBender API + Unlimited |

#### Technical Dependency Locations

**Database Level:**
- `Groups.max_participants` - Participant limits
- `Groups.professional_mode_enabled` - Professional mode toggle
- `Participants.personality_profile` - Memory retention
- `AskBender_Tiers.features` - Feature arrays
- `Feature_Gates` - Dynamic feature validation

**API Level:**
- `/api/middleware/tier-validation` - Feature gating middleware
- `/api/auth/cross-domain` - Cross-domain user resolution
- `/api/analytics/advanced` - Advanced analytics endpoint
- `/api/support/priority` - Priority support routing

**UI Level:**
- `src/components/TierGate.tsx` - Feature visibility components
- `src/utils/tierValidation.ts` - Client-side tier checking
- `src/store/subscriptionStore.ts` - Subscription state management

**External Services:**
- Supabase RLS (Row Level Security) - Database-level access control
- Twilio API - SMS delivery limits
- OpenAI API - Grammar customization
- Analytics service - Advanced reporting

---

# Entertainment & Engagement Systems

## 🎮 Entertainment & Chaos Systems
- Psychological warfare tournaments, adaptive story engine, revenge mode, answer recycling, and dual-reality scoring.
- **MVP NOTE:** Only core tournament and story features for MVP; revenge and answer recycling can be phased in.
- All entertainment features integrate with grammar scaling and infinite spintax variety.
- **EDGE CASE:** All manipulation/chaos features must be disabled in Funeral Mode; professional override always takes precedence.
- **FUTURE:** Expand to multi-group tournaments, advanced story personalization, and cross-group memory.

---

# Personality Engine & Mood System

## 🤖 Personality & Mood Architecture
- Bender-inspired Z character with 8 moods + Funeral Mode, grammar scaling, and infinite spintax variety.
- Emotional response system (love/hate detection), SMS fallback personality, and mood-specific templates.
- **MVP NOTE:** Only core moods and basic fallback for MVP; advanced mood switching and custom templates can be added later.
- **EDGE CASE:** All sentiment responses and manipulation must be disabled in Funeral Mode.
- **FUTURE:** Expand mood catalog, add user-editable personality traits, and advanced AI training.

---

# Professional Mode & Event Management

## 🏢 Professional Mode & Universal Override
- Complete personality replacement for professional contexts (memorial, corporate, religious, wedding).
- Perfect grammar, professional communication, and infinite respectful spintax variety.
- **MVP NOTE:** Manual admin toggle and 110% sobriety auto-trigger for MVP; advanced event-type detection can be added later.
- **EDGE CASE:** Professional override must always take precedence over all other settings.
- **FUTURE:** Expand to more event types, advanced analytics, and enterprise integrations.

---

# Psychological Profiling & Manipulation Engine

## 🧠 Psychological Systems
- NSA-style anxiety-building setup, scenario-based personality mining, dual-reality scoring, memory bank, answer recycling.
- **MVP NOTE:** Only core profiling and scoring for MVP; memory bank and answer recycling can be phased in.
- All psychological features integrate with grammar scaling and infinite spintax variety.
- **EDGE CASE:** All manipulation and chaos features must be bypassed in Funeral Mode.
- **FUTURE:** Expand to advanced profiling, cross-group memory, and A/B testing for manipulation effectiveness.

---

# Social & Viral Systems

## 📱 Social & Viral Content Generation
- Auto-generated shareable content (memes, roasts, achievements) with participant permission, infinite spintax variety, and grammar scaling.
- Platform-specific strategies for Twitter/X, Instagram, TikTok, LinkedIn, with professional override for Funeral Mode.
- **MVP NOTE:** Only core sharing and consent system for MVP; advanced analytics and influencer integrations can be added later.
- **EDGE CASE:** All viral/roast content must be professional and respectful in Funeral Mode.
- **FUTURE:** Expand to advanced analytics, creator partnerships, and crisis management protocols.

---

# Appendix: Full Administrative Controls & UI Reference

> **Note:** The full original `z_specs_admin_controls.md` is now archived in `/docs/archive/` for reference. The main sections above provide a summarized and annotated technical overview; consult the archive for complete admin UI/UX and control system details.

---

# Z_SPECS_ADMIN_CONTROLS ADMIN CONTROLS
## *Complete Administrative Interface & Control Systems*

**Document Purpose:** Complete administrative control interface specifications for Z_SPECS_ADMIN_CONTROLS
**Created:** 2025-07-21
**Source:** Extracted from z_complete_specs.md
**Target Audience:** UX Designers, Frontend Developers, Product Managers, System Administrators

---

## 🎛️ Z'S PERSONALITY CONFIGURATION SYSTEM (Enhanced with Funeral Mode + Grammar Preview + SMS Fallback + Spintax Controls)

### Admin Setup Interface:
[...full content from z_specs_admin_controls.md would be inserted here, preserving all UI/UX details, dashboards, and control flows...]

---

# (End of Admin Controls Appendix)

---

# Best Practices: Handling User-Provided API Keys (MVP Approach)

## Overview
To allow Admin Users to use their own OpenAI (ChatGPT) API keys—and avoid platform-level billing for their usage—AskBender supports user-provided API credentials. This section outlines best practices for securely handling these sensitive keys, with notes on MVP implementation and future scalability.

## MVP Implementation
- **User Entry:** Admins enter their OpenAI API key via a secure settings page in the admin dashboard.
- **Storage:**
  - API keys are stored encrypted at rest in the platform database (not as hashes, since the original value must be retrieved for API calls).
  - Encryption keys are managed via environment variables and never hardcoded.
  - API keys are never logged, displayed, or sent to the frontend after initial entry.
- **Usage:**
  - When an Admin triggers a ChatGPT action, the backend decrypts and uses their stored key for outbound API requests.
  - If the key is missing or invalid, the user is prompted to update it.
- **Access Control:**
  - Each Admin’s key is only used for their own requests.
  - Strict backend access controls prevent unauthorized access to stored keys.

## Edge Cases & Risks
- If the database or environment variables are compromised, encrypted keys could be at risk. Regularly rotate encryption keys and audit access.
- If an Admin’s OpenAI account is rate-limited or disabled, clear error messages are shown and the user is prompted to update their key.

## Future/Production Recommendations
- **Secrets Manager:** For production, migrate to a dedicated secrets manager (e.g., AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) for storing and managing API keys.
- **Key Rotation:** Implement regular key rotation and audit logging for all access to sensitive credentials.
- **Scalability:** Ensure the system can handle large numbers of Admin users and keys without performance or security degradation.

> **MVP NOTE:** The above approach is intentionally simple for MVP. Future releases should prioritize migration to a secrets manager and advanced access controls for production readiness.

## FUTURE: Hybrid Backend + LLM or Fine-Tuned Model for Scalable, Schema-Aware AI

- As the platform scales and tasks become more complex, migrate from pure prompt engineering to a hybrid approach:
  - Use the backend to maintain persistent knowledge of the schema, business rules, and user context.
  - Use the LLM for natural language understanding and ambiguous mapping tasks, but let the backend handle validation, mapping, and DB updates.
  - For even more automation, consider fine-tuning an LLM with your schema, business rules, and example mappings.
- This approach reduces token/context window issues, increases reliability, and allows for more advanced, system-aware AI features.
- See schema docs for additional notes on hybrid/fine-tuned approaches.

---

# Prompt Engineering for Schema-Aware Data Mapping (MVP)

## Example Prompt Template

When importing user data (e.g., from a spreadsheet), use a prompt like:

```
You are Bender, the AI assistant for AskBender.
Personality: witty, but professional in Funeral Mode.

Here is the relevant database schema for this Admin and Event:
[TABLE: participants]
- id (UUID)
- phone_number (String)
- email (String)
- group_id (UUID)
- nickname (String)
- ...

Here are the spreadsheet columns provided by the user:
- Phone
- Email
- Nickname

Task: Map each spreadsheet column to the correct database field for the current Admin and Event. Return a JSON object with the mapping, e.g.:
{
  "Phone": "phone_number",
  "Email": "email",
  "Nickname": "nickname"
}
If a column does not match any field, return null for that column.
```

## Best Practices for Backend Validation
- Always validate the LLM's output before updating the database:
  - Ensure all mapped fields exist in the schema and are allowed for the current Admin/Event.
  - Check for required fields and data types.
  - Log or flag any ambiguous or missing mappings for manual review.
- Never write directly to the DB based solely on LLM output—use it as a suggestion, not an authority.
- For large imports, process data in batches and validate each batch.

## MVP NOTE
- This approach is sufficient for MVP-scale data and schema complexity.
- As the system grows, migrate to a hybrid backend+LLM approach as described above.

---

# Backend Validation Logic for LLM-Assisted Data Imports (MVP)

## Validation Steps
- Validate that all LLM-suggested mappings exist in the relevant schema for the current Admin/Event.
- Check that each spreadsheet column is mapped to a valid, allowed DB field.
- Flag or reject any mapping to non-existent or restricted fields.
- Confirm that unmapped columns are not required fields.
- For each row, validate required fields and data types.
- Check for constraint violations (e.g., unique, foreign key) before insert/update.
- Process data in batches; log and handle errors per row.
- Never write to the DB based solely on LLM output—only after all validation checks pass.

## Example Validation Pseudocode
```
for row in spreadsheet_rows:
    mapped_row = {}
    for col, db_field in llm_mapping.items():
        if db_field is None:
            continue  # skip unmapped columns
        if db_field not in schema_fields:
            log_error(row, f"Invalid mapping: {col} -> {db_field}")
            continue
        value = row[col]
        if not validate_type(value, schema_fields[db_field].type):
            log_error(row, f"Type mismatch for {db_field}")
            continue
        mapped_row[db_field] = value
    if not all_required_fields_present(mapped_row, schema_fields):
        log_error(row, "Missing required fields")
        continue
    # Passed all checks, safe to insert/update
    db.insert_or_update(mapped_row)
```

## Security & Audit Notes
- Log all mapping and validation errors for troubleshooting and audit.
- Never write unvalidated or ambiguous data to the database.
- Optionally, provide an admin review interface for flagged rows.

## MVP NOTE
- This logic is sufficient for MVP-scale imports. As the system grows, enhance validation, error handling, and audit capabilities as needed.

---

# Logging & Monitoring for Admin API Key and LLM Data Imports (MVP)

## Requirements
- Log all API key entry, update, and validation attempts (never log the key itself).
- Log all LLM prompt requests and responses (with sensitive data redacted).
- Log all mapping and validation errors during data import.
- Log all successful and failed DB updates from imports.
- Monitor for repeated errors, suspicious activity, or system failures.
- (Optional) Provide an admin-accessible audit trail for critical actions.

## Example Log Structures

### API Key Actions
```
{
  "timestamp": "2025-07-22T12:34:56Z",
  "admin_user_id": "abc-123",
  "action": "api_key_update",
  "result": "success", // or "invalid_key", "error"
  "ip_address": "203.0.113.42"
}
```

### LLM Prompt/Response
```
{
  "timestamp": "2025-07-22T12:35:10Z",
  "admin_user_id": "abc-123",
  "event_id": "evt-456",
  "action": "llm_mapping_request",
  "prompt_summary": "Mapping 3 columns for Event X",
  "llm_response_status": "success", // or "error"
  "error_message": null // or error details
}
```

### Mapping/Validation Errors
```
{
  "timestamp": "2025-07-22T12:36:00Z",
  "admin_user_id": "abc-123",
  "event_id": "evt-456",
  "row_number": 17,
  "error_type": "invalid_mapping",
  "details": "Column 'PhoneNum' mapped to non-existent field 'phone_numbr'"
}
```

### DB Update Results
```
{
  "timestamp": "2025-07-22T12:36:30Z",
  "admin_user_id": "abc-123",
  "event_id": "evt-456",
  "action": "db_update",
  "row_number": 17,
  "result": "success" // or "validation_failed"
}
```

## Monitoring Recommendations
- Set up alerts for repeated API key failures, LLM errors, or high rates of import validation errors.
- Alert on suspicious activity (e.g., many failed key entries from one IP).
- Use dashboards (e.g., Grafana, Kibana, Datadog) to visualize import success/error rates and LLM usage.
- Maintain a searchable log of all admin actions related to API keys and data imports for compliance and troubleshooting.
- Retain logs for a reasonable period (e.g., 30-90 days for MVP).
- Never log sensitive data (API keys, full user data, etc.); redact or summarize prompts/responses as needed.

## MVP NOTE
- For MVP, simple file or DB-based logging is sufficient. As you scale, consider centralized logging and monitoring solutions (e.g., ELK stack, Datadog, AWS CloudWatch).

---

# Admin Quiz Setup Flow (MVP & Future)

## MVP Workflow
- Admin selects a group/event and creates a new quiz.
- Admin adds multiple-choice questions (question text, options, correct answer).
- Admin sets basic configuration (quiz name, description, mood/personality, start/end time).
- Admin previews the quiz and saves/publishes it for participants.
- Only minimal configuration and question types are required for MVP.

## UI/UX Flow for Admin Quiz Setup (MVP)

### 1. Access Quiz Setup
- Admin Dashboard → “Quizzes” or “Manage Events”
- Select a Group/Event → “Create New Quiz” or “Edit Quiz”

### 2. Quiz Details Screen (updated)
- Fields: Quiz Name, Description, Mood/Personality, Start/End Time, **Delay Between Questions (seconds)**
- Actions: [Save Draft] [Cancel]
- Tooltip/help: "Set how many seconds to wait before showing the next question. Leave blank or 0 for immediate."

### 3. Question Management
- Section: “Questions”
  - List of questions with edit/delete options
  - [Add New Question] button opens form for question text, options (A-D), correct answer
- Actions: [Reorder Questions] (optional for MVP)

### 4. Preview Quiz
- [Preview Quiz] button shows quiz as participant would see it (modal or new page)

### 5. Save, Publish, or Archive
- Actions: [Save Draft], [Publish Quiz], [Archive Quiz]

### 6. Error Handling & Validation
- Inline error messages for missing fields or no questions
- Block publishing until all requirements are met

### 7. Confirmation & Success
- Confirmation message on successful save/publish
- Option to view quiz as participant or return to dashboard

---

## Future Enhancements (UI/UX)
- Support for open-ended, media, and adaptive questions
- Quiz templates and duplication
- Advanced config: timers, scoring rules, randomized order
- Real-time collaboration and editing
- Analytics and results dashboards

---

## Wireframe (Textual)

[Admin Dashboard]
  └── [Events/Groups]
        └── [Quizzes]
              ├── [Create New Quiz] [Edit] [Archive]
              └── [Quiz Details]
                    ├── Name: [__________]
                    ├── Description: [__________]
                    ├── Mood: [dropdown]
                    ├── Start/End: [date/time]
                    ├── [Questions]
                    │     ├── Q1: [text] [A][B][C][D] (Correct: B) [Edit][Delete]
                    │     └── [Add New Question]
                    ├── [Preview Quiz]
                    ├── [Save Draft] [Publish] [Archive]
                    └── [Error messages]

## Edge Cases & Validation
- Prevent publishing incomplete quizzes.
- Validate all question and configuration data before saving/publishing.
- Ensure quizzes are only accessible to the correct group/event participants.

## Reference
- See schema and user stories for more details and planned enhancements.

### Quiz Timing & Pacing
- Admin can set a delay between questions (question_interval_seconds) when configuring a quiz.
- If not set, system advances immediately after each answer (default for MVP).
- Future: Support per-question timers, live pacing, or advanced scheduling.

### Enhanced UI/UX Flows for Advanced Quiz Features

#### Quiz Templates & Duplication
- Admins can create, save, and select quiz templates when starting a new quiz.
- "Create from Template" and "Duplicate Quiz" options in the quiz list.

#### Advanced Question Types
- When adding a question, Admin selects type: multiple-choice, open-ended, media, or adaptive.
- Media upload fields for image/audio/video questions.
- Adaptive logic builder for branching questions.

#### Custom Scoring Rules
- Scoring configuration section in quiz details.
- Admin can set points per question or define custom scoring logic (JSON or UI builder).
- Preview scoring before publishing.

#### Versioning & Collaboration
- Version number and edit history shown in quiz details.
- "View History" and "Revert to Previous Version" options.
- (Future) Real-time collaboration indicators (e.g., "Admin X is editing").

#### Access Control
- Permissions section in quiz details.
- Admin can assign owner/editor/viewer roles to users.
- Access changes are logged and visible in audit trail.

#### Analytics & Results
- Analytics dashboard accessible from quiz list or details.
- View overall results, participant scores, completion rates, and individual responses.
- Export results as CSV/Excel.
- (Future) Visual dashboards for trends and insights.

### Enhanced UI/UX Flows for New Quiz Types and Scoring

# ---
# This section details the admin and participant experience for all advanced quiz types, answer logic, group notifications, and entertainment features.
# See schema (Quiz System Tables) and user stories (Quiz User Stories) for field definitions and requirements.
# ---

#### Maths/Closest Answer Type
- When adding a question, Admin selects 'Maths/Closest' as the type.
- Admin enters the correct numeric value.
- UI allows participants to enter decimal or integer answers.
- After all answers are submitted, system highlights the closest answer(s) and awards points.
- Ties are visually indicated and handled per rules.

#### Leggo/Combination Type
- When adding a question, Admin selects 'Leggo/Combination' as the type.
- Admin defines how previous answers are to be combined (e.g., via a logic builder or formula input).
- UI shows participants how their answers may contribute to the final result.
- At quiz end, system displays the combined result and announces winners.

#### Custom Text-Matching with Spelling Tolerance
- When adding a question, Admin selects 'Custom Text' as the type.
- Admin enters the correct answer and sets a spelling tolerance (with help text: "How close can a misspelling be to still get credit?").
- UI allows free text entry for participants.
- After answer submission, system uses fuzzy matching to award points for close answers.
- If an answer is close but not exact, system triggers a group 'spello' notification (e.g., "Bender says: 'Nice try, but check your spelling!'"), visible in the group chat or results screen.

#### Fake Leaderboard Display
- After each question, at milestones, or on demand, system updates and displays a fake leaderboard using display_score.
- UI visually distinguishes between real and fake scores (if appropriate).
- Admin can configure when and how often the fake leaderboard is shown.

---

These enhancements ensure the UI/UX supports all advanced quiz types, answer logic, group notifications, and entertainment features as described in the user stories and schema.

# Tech Stack Overview (MVP)

- **Frontend:** React.js (admin dashboard only), Tailwind CSS (mobile-first), PWA features for installability/offline use.
- **Backend:** Node.js + Express.js (REST API, webhook handlers).
- **Database:** PostgreSQL (Prisma ORM).
- **Integrations:** OpenAI (AI/LLM), Twilio (SMS), SendGrid (email), WhatsApp (future).
- **Hosting:** Lovable.ai platform (full-stack hosting, environment variable management).

> **Note:** All contestant interactions are via messaging APIs; only admins use the web UI.

---

# Error Logging System Implementation Plan

## Phase 1: Basic Error Logging (Current)
- Error boundary components for React error catching
- Global JavaScript error handlers
- Supabase error logging table for error storage
- User-friendly error message display
- Console logging for development debugging

## Phase 2: Enhanced Error Monitoring (Future)
- Real-time error monitoring dashboard
- Error aggregation and analytics
- Automatic error reporting to external services
- Error severity classification and routing
- Performance monitoring integration

## Enterprise Considerations
**REPLACE FOR ENTERPRISE:**
- Supabase error logging → Enterprise logging service (Splunk, ELK Stack, etc.)
- Console logging → Enterprise log aggregation (Datadog, New Relic, etc.)
- Basic error messages → Localized, branded error handling
- Manual error tracking → Automated error monitoring and alerting

## Development Notes
- All error logging code includes comments for enterprise replacement
- Error boundaries are component-specific for granular control
- Supabase integration is abstracted for easy replacement
- Console logging is development-only with production flags

## Technical Specifications

### Error Logging Architecture
```
User Action → Error Boundary → Error Handler → Supabase Log → User Feedback
```

### Error Categories
1. **UI Errors** - React component errors, rendering issues
2. **API Errors** - Network failures, authentication issues
3. **Validation Errors** - Form validation, data integrity
4. **System Errors** - Unexpected application failures

### Error Storage Schema
```sql
error_logs:
- id (uuid)
- user_id (uuid, nullable)
- error_type (string)
- error_message (text)
- stack_trace (text, nullable)
- component_name (string, nullable)
- user_agent (text)
- timestamp (timestamp)
- severity (string) - 'low', 'medium', 'high', 'critical'
- resolved (boolean, default false)
```

## Implementation Timeline
- **Week 1**: Basic error boundaries and handlers
- **Week 2**: Supabase integration and user feedback
- **Week 3**: Testing and refinement
- **Future**: Enterprise integration planning

## Security Considerations
- No sensitive user data in error logs
- Error messages sanitized for user display
- Log retention policies for compliance
- Access controls for error log viewing 