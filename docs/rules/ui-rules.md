# UI Rules

These guidelines outline how we build and structure user interfaces in AIDesk, drawing from our user flow, technology stack, and best practices.

## 1. Overview
AIDesk prioritizes a responsive, accessible, and cohesive user experience. Our UIs must be easy to navigate, visually consistent, and performant. This document establishes the foundation for effective component design and interaction patterns.

---

## 2. Visual & Interaction Guidelines

1. Consistent Layouts  
   - Ensure uniform spacing, margins, and padding across components.  
   - Adhere to mobile-first, responsive design principles (from Tailwind and shadcn best practices).

2. Component Architecture  
   - Build UI with React functional components and hooks.  
   - Keep components small, focused, and reusable.  
   - Use Zustand for global states like ticket data, chat sessions, and user authentication state.

3. Accessibility Standards  
   - Adhere to WCAG 2.1 guidelines to ensure inclusive experiences.  
   - Leverage Radix UI primitives (within shadcn components) for accessibility.  
   - Provide proper labels, alt text, and aria attributes where relevant.

4. Animation & Motion Principles  
   - Favor subtle, meaningful transitions to enhance clarity (e.g., fade-in for modal dialogs, slide transitions for side panels).  
   - Keep animations performant; avoid jarring or lengthy animations.  
   - Use Tailwind's built-in transitions and keyframes for consistency and maintainability.

5. Interaction States  
   - Provide clear hover, focus, and active states to guide user interactions.  
   - Disable (and visually indicate) unavailable features or non-clickable elements.  
   - Use consistent error, warning, and success states across forms and notifications.

---

## 3. Tie-Ins with the Tech Stack

1. Shadcn Components  
   - Rely on pre-built shadcn components (buttons, dialogs, alerts) for consistency.  
   - Create wrapper components for customization but avoid modifying shadcn internals directly.

2. Tailwind CSS  
   - Follow the utility-first approach for layout and styling.  
   - Use design tokens for color, typography, and spacing.  
   - Maintain className strings in a structured, readable format.

3. React Hook Form + Zod  
   - Use form schemas for validation, ensuring consistent error handling.  
   - Automatically tie in UI feedback (e.g., displaying form validations in real-time).

4. Zustand  
   - Keep global states lightweight and domain-focused.  
   - Combine local component states (useState) with store states thoughtfully.  
   - Avoid duplicating state to keep UIs in sync with real-time data updates from Supabase.

5. Supabase Integration  
   - Surface real-time changes in the UI (ticket updates, chat statuses).  
   - Handle loading states gracefully.  
   - Leverage subscription cleanup to prevent memory leaks or stale UI states.

---

## 4. Performance Considerations

1. Code Splitting & Lazy Loading  
   - Split large, non-critical components into separate bundles.  
   - Lazy load modals, advanced forms, or admin screens to improve initial load time.

2. Real-Time Updates  
   - Use Supabase real-time subscriptions to refresh UI instantly.  
   - Limit subscription footprints (select specific channels to minimize overhead).  
   - Propagate updates via Zustand or local state only where necessary.

3. Testing & Error Boundaries  
   - Use Jest for unit tests on critical UI components.  
   - Implement error boundaries for critical application sections.  
   - Send errors to Sentry for immediate visibility.

---

## 5. Best Practices & Maintenance

1. Consistent Versioning  
   - Align UI component releases with backend changes (ticket schemas, user roles).

2. Documentation & Handoffs  
   - Maintain up-to-date docs for any custom UI components.  
   - Add usage examples and blurbs on design rationale.

3. Future Enhancements  
   - Integrate advanced E2E testing (Cypress) in a subsequent development phase.  
   - Expand on advanced search patterns using external services (e.g., Typesense) if needed.

By applying these UI rules, we ensure that all AIDesk user journeys—from the customer portal to the admin console—remain consistent, discoverable, and efficient. 