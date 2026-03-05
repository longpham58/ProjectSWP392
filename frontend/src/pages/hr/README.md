# HR Module

Production-ready HR Management UI: dashboard analytics, employee management, courses, schedules, notifications.

- **Layout:** `HRDashboard.tsx` (sidebar + main content).
- **Tabs:** Dashboard (analytics), Course Management, Schedule, Notification Center, User Account (Employee) Management.
- **Data:** Use `@/services/api/hr` for API; mocks in `@/mocks/hr` when backend is unavailable.
- **Types:** `@/types/hr.types.ts`.
- **Routing:** Protected route `/hr` for role `HR` (see `App.tsx` and `docs/HR_MODULE_ARCHITECTURE.md`).
