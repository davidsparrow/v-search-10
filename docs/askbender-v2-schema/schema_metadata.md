# Schema Metadata

## Rationale

- The schema is designed for a mobile-first, messaging-only experience for participants, with all quiz/game interactions occurring via SMS (primary) and email (backup).
- All admin management is via a mobile-optimized web dashboard (React PWA).
- Fallback logic is built into the schema to ensure reliable message delivery.
- Extensible for future integrations (WhatsApp, Discord, Slack) by supporting new delivery methods and message types.

(See tech overview for more details on design philosophy and future roadmap.) 