promptTemplate# Core Schema (Annotated)

> **Design Philosophy:**  
> All schema decisions prioritize a mobile-first, messaging-only experience for participants (SMS primary, email backup), and a mobile-optimized web dashboard for admins. Future integrations (WhatsApp, Discord, Slack) are planned and the schema is designed for extensibility.

This document contains the core database schema for the Ask Bender ("Z") platform, annotated with:
- **MVP NOTE:** Where implementation is intentionally simple for MVP
- **EDGE CASE:** Known complexities or risks
- **FUTURE:** Planned scalable or advanced features

---

## Groups Table

| Field                      | Type      | Notes |
|----------------------------|-----------|-------|
| id                         | UUID      | Primary key |
| name                       | String    | Used for group identification, score displays, and tournament matching |
| host_phone                 | String    | |
| twilio_number              | String    | |
| z_mood                     | String    | ENUM: 'original', 'stalin', 'trump', etc. <br> **MVP NOTE:** Only basic moods supported; future: custom moods |
| z_personality_config       | JSON      | **FUTURE:** Advanced personality config for enterprise tiers |
| active                     | Boolean   | |
| professional_mode_enabled       | Boolean   | **MVP NOTE:** Simple toggle; future: auto-trigger logic |
| professional_auto_triggered     | Boolean   | **FUTURE:** Tracks if system auto-enabled Professional Mode |
| sobriety_level             | Integer   | 1-110, 110 = auto Professional Mode <br> **EDGE CASE:** Out-of-range values must be handled |
| professional_mode_context       | String    | For analytics only |
| professional_mode_enabled_at    | TIMESTAMP | |
| professional_mode_enabled_by    | String    | 'admin_manual', 'auto_110_sobriety' |
| grammar_preview_enabled    | Boolean   | **MVP NOTE:** Admin UI only; not enforced in backend |
| custom_grammar_rules       | JSON      | **FUTURE:** Enterprise custom grammar |
| sms_fallback_enabled       | Boolean   | **MVP NOTE:** Simple on/off; future: per-user fallback |
| preferred_fallback_method  | String    | 'email', 'disabled' |
| character_limit_warning_threshold | Integer | **EDGE CASE:** Admins may set too high/low |
| admin_optimization_suggestions   | Boolean | **MVP NOTE:** UI only; not enforced in backend |
| eventria_event_id        | UUID      | FK to Eventria.ai Events (optional) |
| cross_domain_enabled     | Boolean   | True if group has cross-domain features |
| eventria_user_id         | UUID      | FK to Eventria.ai Users (admin) |
| created_at                 | DateTime  | |
| updated_at                 | DateTime  | |
| default_reply_expiration_seconds | Integer | Admin-configurable default reply expiration (must be in allowed set: 30, 60, 120, 180, 240, 300, 360, 600, 900 seconds). Overrides system default for this group/event/quiz. **NOTE:** Admin override defaults only affect messages sent during Quizzes/Games, not for other general flows. |

<!-- EDGE CASE: Groups may overlap in time; ensure group_id is unique per event, but allow users to be in multiple groups. -->

---

## GroupQuizResults Table
| Field        | Type      | Notes |
|--------------|-----------|-------|
| id           | UUID      | Primary key |
| quiz_id      | UUID      | FK to Quizzes |
| group_id     | UUID      | FK to Groups |
| real_score   | Integer   | Sum of real participant scores for the group |
| display_score| Integer   | Sum of display (fake) participant scores for the group |
| leaderboard  | JSON      | Ordered list of participant display_scores (fake leaderboard) |
| updated_at   | DateTime  | |

<!-- Supports group-level scoring and fake leaderboards. leaderboard can be updated after each question, at milestones, or on demand. display_score (fake) is managed independently from real_score for Bender's entertainment. -->

## Participants Table (clarification)
| Field         | Type    | Notes |
|---------------|---------|-------|
| real_score    | Integer | True score for participant |
| display_score | Integer | Bender's fake score for entertainment; used in fake leaderboards |

<!-- display_score can be updated independently from real_score to create fake leaderboards and entertainment effects. -->

---

## Participants Table

| Field                      | Type      | Notes |
|----------------------------|-----------|-------|
| id                         | UUID      | Primary key |
| phone_number               | String    | **EDGE CASE:** Must be unique per participant; consider phone/email conflicts. **CONTEXT:** Participants may belong to multiple groups/quizzes/games; always track group_id and session context for all actions/messages. |
| email                      | String    | |
| group_id                   | UUID      | FK to Groups |
| nickname                   | String    | **MVP NOTE:** Auto-assigned; future: user-editable |
| real_score                 | Integer   | |
| display_score              | Integer   | **MVP NOTE:** May differ from real_score for entertainment |
| personality_profile        | JSON      | Null in Professional Mode |
| z_relationship             | String    | ENUM: 'loved', 'hated', 'neutral', 'professional' |
| manipulation_level         | Integer   | 0 in Professional Mode |
| professional_mode_interaction   | Boolean   | **MVP NOTE:** Simple flag; future: track interaction details |
| detected_carrier           | String    | **EDGE CASE:** Carrier detection may fail for some numbers |
| sms_character_limit        | Integer   | **EDGE CASE:** Varies by carrier/country |
| preferred_communication_method | String | 'sms', 'email', 'either' |
| last_fallback_notification | TIMESTAMP | |
| fallback_notification_count| Integer   | |
| eventria_user_id         | UUID      | FK to Eventria.ai Users (if cross-domain) |
| cross_domain_profile     | JSON      | Shared profile data |
| askbender_tier_override  | String    | Override tier from Eventria.ai subscription |
| joined_at                  | DateTime  | |

<!-- EDGE CASE: Participants may belong to multiple groups/quizzes/games; context tracking is critical. -->

---

## Messages Table

| Field                      | Type      | Notes |
|----------------------------|-----------|-------|
| id                         | UUID      | Primary key |
| session_id                 | UUID      | FK to Quiz_Sessions |
| participant_id             | UUID      | FK to Participants |
| direction                  | String    | 'inbound', 'outbound' |
| content                    | Text      | |
| z_response                 | Text      | |
| real_answer_correct        | Boolean   | |
| displayed_as_correct       | Boolean   | **MVP NOTE:** Allows for fake correct answers for fun |
| sentiment                  | String    | 'love', 'hate', 'neutral' |
| manipulation_applied       | String    | |
| intended_delivery_method   | String    | 'sms', 'email', 'whatsapp', etc. |
| actual_delivery_method     | String    | 'sms', 'email', 'whatsapp', etc. |
| fallback_triggered         | Boolean   | Indicates if fallback (e.g., email) was used |
| fallback_reason            | String    | Reason for fallback (e.g., SMS failure, carrier restriction) |
| character_count            | Integer   | |
| character_limit_applied    | Integer   | |
| fallback_notification_sent | Boolean   | |
| delivery_success           | Boolean   | |
| delivery_attempt_count     | Integer   | **EDGE CASE:** Retry logic for failed deliveries |
| timestamp                  | DateTime  | |
| reply_expiration_seconds   | Integer | Optional. Per-message override for reply expiration (must be in allowed set: 30, 60, 120, 180, 240, 300, 360, 600, 900 seconds). Overrides group/quiz/system default for this message. |

<!-- Fallback logic ensures message delivery even if primary channel fails. Future: Add WhatsApp, Discord, Slack as delivery methods. -->

---

## Quiz_Sessions Table

| Field                      | Type      | Notes |
|----------------------------|-----------|-------|
| id                         | UUID      | Primary key |
| group_id                   | UUID      | FK to Groups |
| z_mood_active              | String    | |
| professional_mode_active        | Boolean   | |
| mood_switch_count          | Integer   | **MVP NOTE:** Simple counter; future: log switch reasons |
| status                     | String    | ENUM: 'nsa_setup', 'profiling', 'active', 'completed', 'memorial_orientation' |
| current_question           | Integer   | |
| psychological_setup_complete | Boolean | Always true if professional_mode_active |
| nsa_setup_bypassed         | Boolean   | True in Professional Mode |
| grammar_quality_average    | Integer   | 1-110 scale |
| transformation_count       | Integer   | **MVP NOTE:** Simple count; future: log details |
| sms_messages_sent          | Integer   | |
| email_fallback_count       | Integer   | |
| total_message_count        | Integer   | |
| fallback_rate              | Float     | % of messages requiring fallback |
| average_message_length     | Float     | |
| started_at                 | DateTime  | |
| ended_at                   | DateTime  | |

<!-- EDGE CASE: Sessions may be interrupted or resumed after long gaps; ensure state is recoverable. -->

---

## Custom_Questions Table

| Field          | Type      | Notes |
|----------------|-----------|-------|
| id             | UUID      | Primary key |
| group_id       | UUID      | FK to Groups |
| question_text  | Text      | |
| option_a       | String    | |
| option_b       | String    | |
| option_c       | String    | |
| option_d       | String    | |
| correct_answer | String    | |
| category       | String    | |
| created_at     | DateTime  | |
| reply_expiration_seconds | Integer | Optional. Per-question override for reply expiration (must be in allowed set: 30, 60, 120, 180, 240, 300, 360, 600, 900 seconds). Overrides group/quiz/system default for this question. |

<!-- MVP NOTE: Only basic multiple-choice supported; future: add open-ended, media, or adaptive questions. -->

<!-- 
FUTURE: For richer Admin Quiz Setup, consider adding tables for quiz templates, advanced configuration (timers, scoring rules, randomized questions), and question banks. Expand Custom_Questions to support open-ended, media, and adaptive questions as needed.
-->

---

## Psychological_Profiles Table

| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| participant_id           | UUID      | FK to Participants |
| dress_choice             | String    | |
| sobriety_level           | Integer   | |
| scenario_response        | String    | |
| risk_tolerance           | String    | |
| response_patterns        | JSON      | |
| manipulation_susceptibility | Float  | |
| created_at               | DateTime  | |

<!-- FUTURE: Use for advanced AI-driven personalization and chaos scoring. -->

---

## Professional_Mode_Sessions Table

| Field                | Type      | Notes |
|----------------------|-----------|-------|
| id                   | UUID      | Primary key |
| group_id             | UUID      | FK to Groups |
| triggered_by         | String    | 'manual_toggle', 'auto_110_sobriety' |
| context_type         | String    | 'memorial', 'religious', 'corporate', 'general' (analytics only) |
| started_at           | TIMESTAMP | |
| ended_at             | TIMESTAMP | |
| participant_count    | Integer   | |
| admin_feedback       | TEXT      | Optional admin notes |
| participants_served  | Integer   | **MVP NOTE:** Simple count; future: track detailed interactions |

<!-- EDGE CASE: Sessions may overlap with regular sessions; ensure state isolation. -->

---

## Professional_Mode_Messages Table

| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| session_id               | UUID      | FK to Professional_Mode_Sessions |
| participant_id           | UUID      | FK to Participants |
| message_type             | String    | 'welcome', 'coordination', 'assistance', 'professional_feedback' |
| message_content          | TEXT      | |
| participant_response     | TEXT      | |
| professional_effectiveness | Integer | 1-10 scale |
| timestamp                | TIMESTAMP | |

<!-- MVP NOTE: Only basic message types; future: add richer event types and analytics. -->

---

## Response_Templates Table

| Field              | Type      | Notes |
|--------------------|-----------|-------|
| id                 | UUID      | Primary key |
| template_name      | String    | e.g. 'wrong_answer', 'welcome', etc. |
| template_structure | TEXT      | Template with {{placeholder}} syntax |
| placeholder_types  | JSON      | Array of required placeholders |
| usage_context      | String    | e.g. 'quiz_response', 'tournament' |
| created_at         | TIMESTAMP | |
| updated_at         | TIMESTAMP | |

<!-- MVP NOTE: Only text templates; future: add media, adaptive, or multi-language templates. -->

---

## Mood_Phrase_Dictionary Table

| Field              | Type      | Notes |
|--------------------|-----------|-------|
| id                 | UUID      | Primary key |
| mood_name          | String    | e.g. 'ORIGINAL', 'STALIN', etc. |
| placeholder_type   | String    | e.g. 'greeting', 'wrong_phrase' |
| phrase_variations  | JSON      | Array of phrase options |
| professional_mode_override | Boolean | True for PROFESSIONAL mode phrases |
| created_at         | TIMESTAMP | |
| updated_at         | TIMESTAMP | |

<!-- EDGE CASE: Ensure mood/placeholder combos are unique; fallback to default if missing. -->

---

## Template_Usage_Analytics Table

| Field                        | Type      | Notes |
|------------------------------|-----------|-------|
| id                           | UUID      | Primary key |
| template_name                | String    | |
| mood_used                    | String    | |
| session_id                   | UUID      | FK to Quiz_Sessions |
| participant_response_sentiment| String    | 'positive', 'negative', 'neutral' |
| effectiveness_score          | Integer   | 1-10 scale |
| timestamp                    | TIMESTAMP | |

<!-- FUTURE: Use for A/B testing and template optimization. -->

---

## Sobriety_Grammar_Logs Table

| Field                        | Type      | Notes |
|------------------------------|-----------|-------|
| id                           | UUID      | Primary key |
| session_id                   | UUID      | FK to Quiz_Sessions |
| participant_id               | UUID      | FK to Participants |
| sobriety_level               | Integer   | 1-110 scale |
| original_text                | TEXT      | |
| grammar_transformed_text     | TEXT      | |
| transformation_type          | String    | 'perfect', 'good', 'casual', etc. |
| mood_active                  | String    | |
| professional_mode_bypassed        | Boolean   | True if Professional Mode override |
| transformation_effectiveness | Integer   | 1-10 scale |
| participant_response_sentiment| String   | 'positive', 'negative', 'amused', etc. |
| created_at                   | TIMESTAMP | |

<!-- EDGE CASE: Track both successful and failed grammar transformations for analytics. -->

---

## SMS_Fallback_Events Table

| Field                        | Type      | Notes |
|------------------------------|-----------|-------|
| id                           | UUID      | Primary key |
| session_id                   | UUID      | FK to Quiz_Sessions |
| participant_id               | UUID      | FK to Participants |
| message_id                   | UUID      | FK to Messages |
| original_message_content     | TEXT      | |
| character_count              | Integer   | |
| character_limit_applied      | Integer   | |
| carrier_detected             | String    | |
| fallback_reason              | String    | 'sms_character_limit', 'carrier_restriction', etc. |
| fallback_method              | String    | 'email', 'sms_split', 'message_truncation' |
| z_mood_active                | String    | |
| professional_mode_active          | Boolean   | |
| sobriety_level               | Integer   | |
| fallback_notification_content| TEXT      | |
| fallback_notification_delivered | Boolean | |
| participant_response_to_notification | TEXT | |
| admin_override_applied       | Boolean   | |
| delivery_success             | Boolean   | |
| delivery_time_seconds        | Float     | |
| cost_sms                     | Decimal   | |
| cost_email                   | Decimal   | |
| created_at                   | TIMESTAMP | |

<!-- EDGE CASE: Fallbacks may be triggered for multiple reasons; ensure all are logged for analytics. -->

---

## Carrier_Limits_Configuration Table

| Field                  | Type      | Notes |
|------------------------|-----------|-------|
| id                     | UUID      | Primary key |
| carrier_name           | String    | e.g. 'Verizon', 'AT&T' |
| country_code           | String    | e.g. 'US', 'CA' |
| sms_character_limit    | Integer   | |
| unicode_character_limit| Integer   | |
| concatenated_sms_limit | Integer   | |
| concatenation_overhead | Integer   | |
| supports_long_sms      | Boolean   | |
| international_limit    | Integer   | |
| detection_patterns     | JSON      | |
| last_updated           | TIMESTAMP | |
| created_at             | TIMESTAMP | |

<!-- EDGE CASE: Carrier limits may change; keep this table up to date. -->

---

## Message_Character_Analysis Table

| Field                      | Type      | Notes |
|----------------------------|-----------|-------|
| id                         | UUID      | Primary key |
| message_id                 | UUID      | FK to Messages |
| session_id                 | UUID      | FK to Quiz_Sessions |
| participant_id             | UUID      | FK to Participants |
| message_content            | TEXT      | |
| character_count_standard   | Integer   | |
| character_count_unicode    | Integer   | |
| emoji_count                | Integer   | |
| special_character_count    | Integer   | |
| estimated_sms_parts        | Integer   | |
| carrier_limit_applied      | Integer   | |
| exceeds_sms_limit          | Boolean   | |
| optimization_suggestion    | TEXT      | |
| optimization_character_savings | Integer| |
| z_mood_affecting_length    | String    | |
| template_used              | String    | |
| fallback_recommended       | Boolean   | |
| admin_preview_shown        | Boolean   | |
| admin_decision             | String    | 'proceed_with_fallback', 'optimize_message', 'force_sms' |
| processing_time_ms         | Integer   | |
| created_at                 | TIMESTAMP | |

<!-- MVP NOTE: Only basic analysis; future: add AI-powered optimization suggestions. -->

---

## SMS_Fallback_Analytics Table

| Field                        | Type      | Notes |
|------------------------------|-----------|-------|
| id                           | UUID      | Primary key |
| group_id                     | UUID      | FK to Groups |
| session_id                   | UUID      | FK to Quiz_Sessions |
| analysis_period_start        | TIMESTAMP | |
| analysis_period_end          | TIMESTAMP | |
| total_messages_sent          | Integer   | |
| sms_messages_sent            | Integer   | |
| email_fallback_count         | Integer   | |
| fallback_rate_percentage     | Float     | |
| average_message_length       | Float     | |
| average_sms_message_length   | Float     | |
| average_email_message_length | Float     | |
| most_common_fallback_reason  | String    | |
| carrier_distribution         | JSON      | |
| z_mood_fallback_rates        | JSON      | |
| optimization_acceptance_rate | Float     | |
| participant_satisfaction_score | Float   | |
| cost_savings_from_sms        | Decimal   | |
| delivery_success_rate        | Float     | |
| admin_intervention_rate      | Float     | |
| performance_metrics          | JSON      | |
| created_at                   | TIMESTAMP | |

<!-- FUTURE: Use for cost optimization and admin training. -->

---

## Tournament, Memory Bank, Revenge, Viral, and Recycling System Tables

<!-- For brevity, these advanced feature tables can be added in the same annotated style as above, as needed for MVP or future releases. -->

---

## Indexes, Constraints, and Views

> **See migration scripts and analytics views in the technical documentation for full SQL details.**
> 
> - **MVP NOTE:** Only core indexes and constraints are required for MVP. Advanced analytics views and performance optimizations can be added as usage grows. 

---

## Admin_API_Keys Table

| Field            | Type      | Notes |
|------------------|-----------|-------|
| id               | UUID      | Primary key |
| admin_user_id    | UUID      | FK to Admin Users table (not shown here); links API key to specific admin |
| api_key_encrypted| Text      | Encrypted OpenAI API key; never stored or logged in plaintext <br> **MVP NOTE:** Encrypted at rest using application-level encryption; not hashed, as key must be retrievable for outbound API calls |
| created_at       | DateTime  | |
| updated_at       | DateTime  | |

<!-- 
MVP NOTE: API keys are entered by admin users via a secure dashboard, stored encrypted in the database, and only decrypted server-side for outbound API requests. 
EDGE CASE: If the encryption key or database is compromised, all stored API keys could be at risk; regular key rotation and audit logging are recommended. 
FUTURE: Migrate to a dedicated secrets manager (e.g., AWS Secrets Manager, Azure Key Vault) for production, implement key rotation, and add audit trails for all access to sensitive credentials. 
NEVER expose, log, or display the API key after initial entry. 
--> 

<!-- 
FUTURE: For advanced, scalable AI integration, migrate to a hybrid approach where the backend maintains schema/business logic and only uses the LLM for natural language understanding or ambiguous mapping. For even more automation, consider fine-tuning an LLM with your schema and business rules. This reduces token/context window issues and increases reliability for complex data mapping and import tasks.
--> 

<!-- 
See the tech overview ('Prompt Engineering for Schema-Aware Data Mapping (MVP)') for example prompt templates and best practices. Always validate LLM output before updating the database to ensure data integrity and security.
--> 

# ---
# Quiz System Tables
#
# The following tables support all aspects of the AskBender quiz system, including quiz creation, templates, advanced question types, scoring (real and fake), roles, access, and analytics.
# Relationships:
# - Quizzes link to Groups and can use QuizTemplates.
# - Each Quiz has Custom_Questions (various types: multiple-choice, maths, leggo, text-matching, etc.).
# - QuizParticipantRoles assigns special roles to participants per quiz type.
# - GroupQuizResults and QuizResults track scoring and leaderboards.
# - QuizAccess controls permissions; QuizResponses stores individual answers.
#
# See comments and examples for advanced fields (roles_required, combination_logic).
# ---

## QuizTemplates Table
| Field         | Type   | Notes |
|---------------|--------|-------|
| id            | UUID   | Primary key |
| name          | String | Template name |
| description   | Text   | Optional description |
| config        | JSON   | Default quiz config (questions, settings, etc.) |
| created_by    | UUID   | FK to Admin Users |
| created_at    | DateTime | |
| updated_at    | DateTime | |

<!-- Supports reusable quiz structures for duplication and rapid setup. -->

## Quizzes Table (enhanced)
| Field           | Type   | Notes |
|-----------------|--------|-------|
| id              | UUID   | Primary key |
| group_id        | UUID   | FK to Groups |
| name            | String | Quiz name |
| description     | Text   | Optional description |
| mood            | String | Mood/personality for quiz |
| start_time      | DateTime | When quiz becomes available |
| end_time        | DateTime | When quiz closes (optional) |
| quiz_type       | String | e.g., 'standard', 'victim_baiter', 'team', 'switcher', etc. <br> Determines available roles and quiz logic |
| roles_required  | JSON   | List of roles required for this quiz type (optional, for dynamic role assignment). Example: ["victim", "baiter", "switcher"] |
| question_interval_seconds | Integer | Delay between questions |
| scoring_rules   | JSON   | Custom scoring logic (optional) |
| template_id     | UUID   | FK to QuizTemplates (optional) |
| version         | Integer| Version number (for versioning) |
| last_edited_by  | UUID   | FK to Admin Users |
| created_at      | DateTime | |
| updated_at      | DateTime | |
| default_reply_expiration_seconds | Integer | Admin-configurable default reply expiration (must be in allowed set: 30, 60, 120, 180, 240, 300, 360, 600, 900 seconds). Overrides system default for this group/event/quiz. |

<!-- quiz_type and roles_required allow dynamic role assignment and quiz logic based on type. -->

## Custom_Questions Table (further enhanced)
| Field             | Type    | Notes |
|-------------------|---------|-------|
| id                | UUID    | Primary key |
| quiz_id           | UUID    | FK to Quizzes |
| question_text     | Text    | |
| question_type     | String  | 'multiple_choice', 'open_ended', 'media', 'adaptive', 'maths_closest', 'leggo', 'custom_text', etc. |
| options           | JSON    | Array of options (if applicable) |
| correct_answer    | String  | For auto-graded or text-matching questions |
| correct_value     | Decimal | For maths/closest answer questions (optional) |
| combination_logic | JSON    | For leggo/combination questions: how to combine previous answers (optional). Example: {"combine": "sum", "questions": [2,4,5]} |
| spelling_tolerance| Integer | Max edit distance for spelling/fuzzy match (custom_text type; optional) |
| points            | Integer | Points for correct/closest answer (optional) |
| media_url         | String  | For image/audio/video questions (optional) |
| adaptive_logic    | JSON    | For adaptive branching (optional) |
| created_at        | DateTime| |
| updated_at        | DateTime| |
| reply_expiration_seconds | Integer | Optional. Per-question override for reply expiration (must be in allowed set: 30, 60, 120, 180, 240, 300, 360, 600, 900 seconds). Overrides group/quiz/system default for this question. |

<!--
- maths_closest: Use correct_value, award points to answer(s) closest to this value.
- leggo: Use combination_logic to combine previous answers and determine result/winner at end. Example: {"combine": "sum", "questions": [2,4,5]}
- custom_text: Use correct_answer and spelling_tolerance for fuzzy matching and partial credit; trigger 'spello' notice for close but incorrect answers.
-->

## QuizParticipantRoles Table
| Field           | Type   | Notes |
|-----------------|--------|-------|
| id              | UUID   | Primary key |
| quiz_id         | UUID   | FK to Quizzes |
| participant_id  | UUID   | FK to Participants |
| role            | String | e.g., 'victim', 'baiter', 'assistant', 'switcher', etc. <br> Available roles depend on quiz_type and roles_required |
| assigned_by     | UUID   | FK to Admin Users |
| assigned_at     | DateTime | |

<!-- Supports assignment of special roles to participants, with available roles determined by quiz_type. -->

## GroupQuizResults Table
| Field        | Type      | Notes |
|--------------|-----------|-------|
| id           | UUID      | Primary key |
| quiz_id      | UUID      | FK to Quizzes |
| group_id     | UUID      | FK to Groups |
| real_score   | Integer   | Sum of real participant scores for the group |
| display_score| Integer   | Sum of display (fake) participant scores for the group |
| leaderboard  | JSON      | Ordered list of participant display_scores (fake leaderboard) |
| updated_at   | DateTime  | |

<!-- Supports group-level scoring and fake leaderboards. leaderboard can be updated after each question, at milestones, or on demand. display_score (fake) is managed independently from real_score for Bender's entertainment. -->

## Participants Table (clarification)
| Field         | Type    | Notes |
|---------------|---------|-------|
| real_score    | Integer | True score for participant |
| display_score | Integer | Bender's fake score for entertainment; used in fake leaderboards |

<!-- display_score can be updated independently from real_score to create fake leaderboards and entertainment effects. -->

## QuizResponses Table
| Field        | Type   | Notes |
|--------------|--------|-------|
| id           | UUID   | Primary key |
| quiz_id      | UUID   | FK to Quizzes |
| participant_id | UUID | FK to Participants |
| question_id  | UUID   | FK to Custom_Questions |
| response     | Text   | Participant's answer |
| is_correct   | Boolean| For auto-graded questions |
| answered_at  | DateTime | |

<!-- Stores individual responses for analytics, review, and adaptive logic. --> 

---

## PromptTemplates Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| tag           | String    | Unique identifier for the prompt |
| flow          | String    | High-level flow (e.g., onboarding, quiz, admin_setup, gaming) |
| step          | String    | Specific step in the flow (e.g., intro, question, data_import) |
| context       | String    | Special context (e.g., off_topic, error, success, mapping) |
| prompt_text   | Text      | The actual prompt string (with variables/placeholders if needed) |
| active        | Boolean   | For A/B testing or disabling prompts |
| last_updated  | DateTime  | For versioning |

<!-- MVP NOTE: Store all prompt templates here for AI/LLM prompt engineering and context-aware responses. FUTURE: Add localization, versioning, and admin-editable UI. -->

---

### How to Use Each Field in PromptTemplates

- **tag:**
  - Use your naming convention, e.g., `uf_team_choose_static`, `uf_team_choose_ai`, `af_import_spreadsheet_error`.
- **template_type:**
  - `'static'` for system messages (JS injects variables).
  - `'ai'` for LLM prompt templates (send to AI for generation).
- **prompt_text:**
  - For static:
    - `"Choose your Team: Reply {{A}} for {{teamA}}, {{B}} for {{teamB}}, {{C}} for {{teamC}}."`
  - For AI:
    - `"Bender, you are about to invite users to choose their team for the {{quiz_or_game_name}}. Your current mood is {{mood}}. Use your signature spintax and personality to craft a fun, varied message. Here are the teams: {{team_list}}. Format the reply options as: 'Reply A for RebelRousers, B for Glunkers, C for Runtime.' End with a witty or taunting remark."`

---

## AdminChatSessions Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| admin_id      | UUID      | FK to Admin Users table |
| event_id      | UUID      | FK to Events table |
| current_step  | String    | e.g., awaiting_upload, mapping_columns, reviewing_errors, completed |
| started_at    | DateTime  | |
| ended_at      | DateTime  | |

<!-- MVP NOTE: Track admin setup/chat sessions for onboarding, spreadsheet import, and event/quiz creation. FUTURE: Add audit trail, multi-admin collaboration, and error tracking. -->

---

## UserSessions Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| user_id       | UUID      | FK to Participants table |
| event_id      | UUID      | FK to Events table |
| quiz_id       | UUID      | FK to Quizzes table (nullable) |
| gaming_id   | UUID      | FK to Gaming table (nullable) |
| current_state | String    | e.g., awaiting_quiz_answer, awaiting_butt, in_event_lobby, completed |
| started_at    | DateTime  | |
| ended_at      | DateTime  | |

<!-- MVP NOTE: Track user event/quiz/gaming sessions. EDGE CASE: Limit users to one active session per event for MVP simplicity. FUTURE: Allow multi-threaded participation, richer state tracking. -->

---

## Messages Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| user_id       | UUID      | FK to Participants table or Admin Users table |
| session_id    | UUID      | FK to UserSessions or AdminChatSessions table |
| message_text  | Text      | Message content |
| direction     | String    | 'inbound' (from user), 'outbound' (from system/AI) |
| timestamp     | DateTime  | |
| flow          | String    | e.g., quiz, admin_setup, gaming |
| step          | String    | e.g., question, data_import |
| context       | String    | e.g., general, off_topic, error |

<!-- MVP NOTE: Store all chat messages with session/thread IDs for easy retrieval and debugging. FUTURE: Add attachments, media, and richer metadata. --> 

---

## Thread Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| type          | String    | 'group', 'dm', 'system' |
| group_id      | UUID      | FK to Groups table (nullable, for group chat) |
| created_at    | DateTime  | |

<!-- FUTURE: Supports group chat and DMs. For group chat, link to group_id. For DMs, type='dm' and no group_id. -->

---

## ThreadParticipant Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| thread_id     | UUID      | FK to Thread |
| user_id       | UUID      | FK to Participants or Admin Users table |
| role          | String    | 'admin', 'user' |

<!-- FUTURE: Supports multi-user/group chat and DMs. -->

---

## Update to Messages Table
| Field         | Type      | Notes |
|---------------|-----------|-------|
| thread_id     | UUID      | FK to Thread (nullable for session-based messages) |

<!-- FUTURE: Messages can be linked to a thread for group chat/DMs, or to a session for 1:1/system flows. -->

---

## Gaming Table (if not present)
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| group_id      | UUID      | FK to Groups table |
| name          | String    | |
| status        | String    | 'active', 'completed', etc. |
| created_at    | DateTime  | |
| updated_at    | DateTime  | |

<!-- MVP NOTE: Track gaming games per group. FUTURE: Add more fields for game logic, participants, results. -->

--- 

---

## Prompt Naming Convention

To ensure scalable, maintainable, and clear prompt management, all prompts are tagged using a structured naming convention:

- **Prefix:**
  - `af_` = Admin Flow (admin-initiated or admin dashboard flows)
  - `uf_` = User Flow (user-initiated or user-facing flows)
- **Hook/Flow Name:**
  - Describes the main flow or trigger (e.g., `signUp_onWebsite`, `quiz_start`, `freemium_intro`, `import_spreadsheet`)
- **Modifier (optional):**
  - Adds specificity for context, error, success, handoff, etc. (e.g., `error`, `success`, `reminder`, `handoff`)

**Example Prompt Tags:**
- `af_signUp_onWebsite_intro`
- `af_import_spreadsheet_error`
- `uf_freemium_intro`
- `uf_quiz_start`
- `uf_sms_command_help`
- `uf_off_topic`
- `uf_handoff_sms`
- `af_dashboard_announcement`

**Best Practices:**
- Be consistent: always use the prefix + flow/hook + (optional) modifier pattern.
- Be descriptive but concise.
- Use lowercase with underscores or camelCase for readability.
- Document new tags as you add new flows.

**Sample Table:**

| tag                        | flow         | step         | context     | prompt_text                        |
|----------------------------|--------------|--------------|-------------|------------------------------------|
| af_signUp_onWebsite_intro  | admin_signup | intro        | general     | "Welcome, admin! Let's get started."|
| af_import_spreadsheet_error| admin_import | upload       | error       | "There was a problem with your file."|
| uf_freemium_intro          | freemium     | intro        | general     | "Welcome to the Freemium Journey!" |
| uf_quiz_start              | quiz         | start        | general     | "Ready for your first question?"   |
| uf_sms_command_help        | sms          | command      | help        | "Here are the commands you can use:"|
| uf_off_topic               | any          | any          | off_topic   | "Stay on track! What are you talkin' bout?"|
| uf_handoff_sms             | freemium     | handoff      | sms         | "Check your phone for a message from Bender!"|

--- 

---

## GameTemplates Table
| Field           | Type      | Notes |
|-----------------|-----------|-------|
| id              | UUID      | Primary key |
| name            | String    | Template name (e.g., 'Self-Loser Butt', 'Pick the Winner') |
| description     | Text      | What this game does |
| structure       | String    | 'self_butt', 'pick_winner', 'illegal_mode', etc. |
| default_prompts | JSON      | Pre-filled prompt tags/templates |
| is_system       | Boolean   | True if built-in, False if admin-created |
| created_by      | UUID      | FK to Admin Users (nullable for system templates) |
| created_at      | DateTime  | |
| updated_at      | DateTime  | |

<!-- MVP NOTE: Supports reusable game templates for rapid setup and consistent logic. FUTURE: Add more fields for odds, payout rules, and advanced behaviors. -->

---

## Tech Spec: Template-Driven Games
- System game templates are stored in GameTemplates, each with a unique name, structure, and default prompts.
- Admins can create new games by selecting a template or creating a custom one (must pick a structure).
- Special behaviors (e.g., forced self-butt, illegal mode) are triggered by the template's structure and system logic, not by custom admin fields.
- When a game is created, reference the template by name or ID in all logic and prompt flows.
- System templates are marked with is_system = true; admin-created templates are is_system = false.

---

## Sample Admin UI Flow: Create a Game from Template

1. **Admin Dashboard > Games > Create New Game**
2. **Select Template:**
   - Choose from system templates (e.g., Self-Loser Butt, Pick the Winner, Illegal Mode)
   - Or create a new custom template (must select a structure)
3. **Configure Game:**
   - Enter game name, description, timing, and any allowed options (based on structure)
   - Review/edit default prompts (optional)
4. **Save & Launch:**
   - Game is created and linked to the selected template
   - Special behaviors (e.g., forced self-butt) are enabled/disabled based on template logic

--- 

---

## AuditLog Table (NEW)
| Field         | Type      | Notes |
|---------------|-----------|-------|
| id            | UUID      | Primary key |
| user_id       | UUID      | FK to Participants or Admin Users |
| action        | String    | e.g., 'session_disambiguation', 'context_switch', 'ambiguous_reply' |
| session_ids   | JSON      | List of related session IDs |
| details       | Text      | Additional info (e.g., prompt text, user selection) |
| timestamp     | DateTime  | |
<!-- Logs all context switches, disambiguation events, and ambiguous cases for debugging and compliance. -->

---

## SystemSettings Table (NEW)
| Field                | Type      | Notes |
|----------------------|-----------|-------|
| id                   | UUID      | Primary key |
| key                  | String    | e.g., 'default_reply_expiration_seconds' |
| value                | String    | e.g., '60' |
| description          | String    | Optional description |
| created_at           | DateTime  | |
| updated_at           | DateTime  | |
<!-- Stores global system defaults such as the default reply expiration time for all Bender messages awaiting a reply. This value is not user-editable and is used as the fallback unless overridden at the group/event/quiz or per-action level. --> 

---

## PromptTemplates Table (add example)
| tag                           | flow         | step         | context (JSON)                                         | prompt_text                        |
|-------------------------------|--------------|--------------|--------------------------------------------------------|------------------------------------|
| af_session_disambiguation     | admin_flow   | disambiguate | {"hooks": ["admin", "session", "disambiguation"], "type": "ambiguous"} | "You have multiple active admin sessions. Please select the event or dashboard you want to continue managing: {{session_options}}" |
| af_session_disambiguation_professional | admin_flow | disambiguate | {"hooks": ["admin", "session", "disambiguation"], "type": "ambiguous"} | "Multiple admin sessions detected. For security, please specify the event or dashboard to continue." |
| af_session_expired            | admin_flow   | expired      | {"hooks": ["admin", "session", "expired"], "type": "system"} | "Your admin session for {{event_name}} has expired due to inactivity. Please start a new session if you wish to continue managing this event." |
| af_session_archived           | admin_flow   | archived     | {"hooks": ["admin", "session", "archived"], "type": "system"} | "The admin session for {{event_name}} has been archived. Contact support if you need to restore it." |
| af_audit_log_notice           | admin_flow   | audit_log    | {"hooks": ["admin", "audit_log"], "type": "info"} | "An important admin event was logged: {{event_details}}. See the audit log for more information." |
| uf_time_limit_warning         | user_flow    | time_limit   | {"hooks": ["quiz", "time_limit"], "type": "warning", "feature": "reply_expiration"} | "{You have|You've got|Hurry! Only} {{seconds}} {seconds|moments} to reply!" |
| uf_time_expired               | user_flow    | time_limit   | {"hooks": ["quiz", "time_limit"], "type": "expired", "feature": "reply_expiration"} | "{Sorry|Oops|Too late}, you {missed|ran out of time for} the deadline." |
| af_time_limit_warning         | admin_flow   | time_limit   | {"hooks": ["admin", "time_limit"], "type": "warning", "feature": "reply_expiration"} | "{Admin:|Attention:} {You have|You've got} {{seconds}} {seconds|moments} to complete this admin action." |
| af_time_expired               | admin_flow   | time_limit   | {"hooks": ["admin", "time_limit"], "type": "expired", "feature": "reply_expiration"} | "{This admin action has expired|Time's up for this admin task}. {Please try again|Contact support if you need assistance.}" |

---

## AskBender_Tiers Table (NEW)
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

<!-- MVP NOTE: Flexible tier system allows easy modification of pricing and features without code changes. FUTURE: Add tier-specific analytics and advanced feature sets. -->

---

## Eventria_Tiers Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| tier_name                | String    | Configurable name (free, lightweight, heavyweight, contender, champion) |
| price_cents              | Integer   | Price in cents (0, 2000, 7700, 49700, 1000000) |
| askbender_tier_access    | String    | FK to AskBender_Tiers.tier_name |
| features                 | JSON      | Array of feature strings |
| is_active                | Boolean   | Can disable tiers |
| created_at               | DateTime  | |
| updated_at               | DateTime  | |

<!-- MVP NOTE: Cross-domain tier integration. Eventria.ai subscriptions control AskBender access. FUTURE: Add advanced cross-domain analytics and unified billing. -->

---

## Feature_Gates Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| feature_name             | String    | Configurable feature name |
| askbender_tier_required  | String    | Minimum AskBender tier name |
| eventria_tier_required   | String    | Minimum Eventria.ai tier name |
| is_active                | Boolean   | Can disable features |
| created_at               | DateTime  | |

<!-- MVP NOTE: Dynamic feature validation system. Features can be gated by either AskBender or Eventria.ai tiers. FUTURE: Add feature-specific analytics and A/B testing. -->

---

## User_AskBender_Subscriptions Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| user_id                  | UUID      | FK to Users |
| tier_id                  | UUID      | FK to AskBender_Tiers |
| status                   | String    | 'active', 'cancelled', 'expired' |
| start_date               | DateTime  | |
| end_date                 | DateTime  | |
| created_at               | DateTime  | |

<!-- MVP NOTE: Tracks AskBender-specific subscriptions. FUTURE: Add billing integration and subscription analytics. -->

---

## User_Eventria_Subscriptions Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| user_id                  | UUID      | FK to Users |
| tier_id                  | UUID      | FK to Eventria_Tiers |
| status                   | String    | 'active', 'cancelled', 'expired' |
| start_date               | DateTime  | |
| end_date                 | DateTime  | |
| created_at               | DateTime  | |

<!-- MVP NOTE: Tracks Eventria.ai subscriptions. Cross-domain access is determined by Eventria.ai tier. FUTURE: Add unified billing and cross-domain analytics. --> 

---

# Critical Message System Tables

<!-- 
The following tables support the critical message system, including message type management, 
reserved keywords for "Hey B" commands, session interruption tracking, and admin notification settings.
This system enables emergency/urgent/critical messages to interrupt active sessions and provides
comprehensive admin notification controls.
-->

## MessageTypes Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| type_name                | String    | Unique identifier (emergency, urgent, critical, etc.) |
| display_name             | String    | Human-readable name (Emergency Alert, Urgent Notice, etc.) |
| priority_level           | Integer   | 0=Emergency (highest), 1=Urgent, 2=Critical, 3=Important, 4=Normal, 5=Promotional (lowest) |
| default_timeout_seconds  | Integer   | Default timeout in seconds for this message type |
| auto_interrupt           | Boolean   | Whether this message type should interrupt active sessions |
| default_auto_reply       | Text      | Default auto-reply if no response is received |
| admin_configurable       | Boolean   | Whether admins can modify this message type |
| created_at               | DateTime  | |
| updated_at               | DateTime  | |

<!-- MVP NOTE: Core message type definitions with priority levels and default settings. Priority-0 messages always interrupt any session. -->

## ReservedKeywords Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| keyword                  | String    | Uppercase keyword that triggers message type detection |
| message_type_id          | UUID      | FK to MessageTypes |
| trigger_flow             | String    | The flow to trigger when this keyword is detected |
| admin_only               | Boolean   | Whether only admins can use this keyword |
| requires_confirmation    | Boolean   | Whether this keyword requires confirmation before execution |
| created_at               | DateTime  | |
| updated_at               | DateTime  | |

<!-- MVP NOTE: Keywords that trigger specific message types when found in message content. Supports "Hey B" command system. -->

## SessionInterruptions Table (NEW)
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| id                       | UUID      | Primary key |
| user_id                  | UUID      | FK to Participants |
| original_session_id      | UUID      | FK to UserSessions |
| critical_message_id      | UUID      | FK to Messages |
| session_snapshot         | JSONB     | Complete JSON snapshot of session state when interrupted |
| interruption_reason      | String    | Reason for interruption (critical_message, superseded_by_priority_zero, etc.) |
| auto_resume              | Boolean   | Whether to automatically resume the session after timeout |
| admin_override           | Boolean   | Whether admin manually overrode the interruption |
| interrupted_at           | DateTime  | When the session was interrupted |
| resumed_at               | DateTime  | When the session was resumed (nullable) |
| created_at               | DateTime  | |

<!-- MVP NOTE: Tracks session interruptions caused by critical messages. Supports complex interruption/resumption logic. -->

## Messages Table Extensions
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| is_critical              | Boolean   | Indicates if this is a critical/emergency message |
| critical_keyword         | String    | The critical keyword that triggered this message |
| response_required        | Boolean   | Whether a response is required for this critical message |
| auto_reply               | Text      | Default auto-reply if no response is received within timeout |
| responded_at             | DateTime  | When the user responded to this critical message |
| status                   | String    | Status: pending, responded, timeout, auto_replied |
| message_type_id          | UUID      | FK to MessageTypes for type-specific processing |

<!-- MVP NOTE: Extended Messages table with critical message support. Leverages existing reply_expiration_seconds field. -->

## UserSessions Table Extensions
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| is_interrupted           | Boolean   | Whether this session was interrupted by a critical message |
| interruption_snapshot    | JSONB     | JSON snapshot of session state when interrupted |
| interrupted_at           | DateTime  | When the session was interrupted |
| resumed_at               | DateTime  | When the session was resumed (nullable) |

<!-- MVP NOTE: Extended UserSessions table with interruption tracking. Supports session restoration from snapshots. -->

## PromptTemplates Table Extensions
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| message_type_id          | UUID      | FK to MessageTypes for context-aware responses |

<!-- MVP NOTE: Groups prompt templates by message type for critical message responses. -->

## SystemSettings Table Extensions
| Field                    | Type      | Notes |
|--------------------------|-----------|-------|
| key                      | String    | admin_notify_priority_X, admin_notify_message_type_X, admin_notify_command_X |
| value                    | String    | Boolean value as string (true/false) |
| description              | String    | Human-readable description of notification setting |

<!-- MVP NOTE: Admin notification preferences for priority levels, message types, commands, and session events. -->

---

## Critical Message System Features

### Priority-Based Interruption
- **Priority-0 (Emergency)**: Always interrupts any session, including other Priority-0 sessions
- **Priority-1 (Urgent)**: Interrupts sessions except Priority-0
- **Priority-2 (Critical)**: Interrupts sessions except Priority-0 and Priority-1
- **Priority-3+**: Do not interrupt active sessions

### Admin Notification Control
- **Priority-Level Selection**: Admins can select which priority levels (0-5) trigger notifications
- **Message-Type Fine-Tuning**: Admins can override priority settings for specific message types
- **Command Notifications**: Admins can control notifications for "Hey B" commands
- **Session Event Notifications**: Admins can control notifications for interruptions, resumes, auto-replies

### Session Management
- **Complete Session Snapshots**: Captures all session data for full restoration
- **Smart Auto-Resume**: Resumes based on actual message timeout, not fixed timing
- **Priority-0 Interruption**: New Priority-0 messages can interrupt existing Priority-0 sessions
- **System-Managed Logic**: Interruption/resumption logic managed by system, not admins

### Timeout Hierarchy
- **Type-Level**: MessageTypes.default_timeout_seconds (always overrides)
- **Group-Level**: Groups.default_reply_expiration_seconds (overrides system)
- **Message-Level**: Messages.reply_expiration_seconds (overrides all)
- **Question-Level**: Custom_Questions.reply_expiration_seconds (overrides all)

<!-- MVP NOTE: Comprehensive critical message system with priority-based interruption, admin notification controls, and system-managed session logic. --> 