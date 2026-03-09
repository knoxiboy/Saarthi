# Saarthi Developer Guide

Welcome to the Saarthi development environment. This guide outlines the architectural patterns and standards used in this project.

## 🏗️ Architectural Patterns

### 1. Server Actions & Validation
All server actions MUST use **Zod** for input validation. This ensures data integrity and provides clear error messages.
- Location: `app/actions/`
- Pattern: Define a schema, validate `data`, then perform DB operations.

### 2. UI Components & Styling
We use **Tailwind CSS v4** syntax.
- Use `bg-linear-to-*` instead of `bg-gradient-to-*`.
- Use `opacity/*` shorthands (e.g., `bg-white/5`).
- Maintain the "Premium Glassmorphism" aesthetic.

### 3. Navigation
- Use the `BackButton` component for consistent navigation.
- Global navigation is handled by the `CommandMenu` (Cmd+K).

## 🛠️ Adding a New AI Tool

1. Create a new directory in `app/ai-tools/`.
2. Implement a `page.tsx` (Server Component) and a `[ToolName]Client.tsx` (Client Component).
3. Add the tool metadata to `app/(routes)/ai-tools/page.tsx`.
4. Add a command entry in `components/CommandMenu.tsx`.

## 🧪 Quality Standards
- No hardcoded links in back buttons (use `router.back()`).
- Responsive design for all screen sizes.
- Proper loading states using skeletons.
