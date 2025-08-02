# Schema Changelog

## 2024-07-XX (Planned/Documented)

- Emphasized mobile-first, messaging-only design: all participant tables and message flows assume SMS/email as primary/backup.
- Added/clarified fields for fallback logic (e.g., `fallback_triggered`, `fallback_reason`, `actual_delivery_method` in Messages).
- Prepared schema for future WhatsApp/Discord/Slack integrations (see planned fields in Messages and Groups).
- Documented PWA/mobile admin requirements in schema metadata. 

