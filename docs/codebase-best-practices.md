# Codebase Best Practices

This document consolidates essential guidelines from the following references:
- [@tech-stack.md](./tech-stack.md)  
- [@tech-stack-rules.md](./tech-stack-rules.md)  
- [@ui-rules.md](../ui-rules.md)  
- [@theme-rules.md](../theme-rules.md)

It outlines how to organize and structure the CozyCabin codebase to ensure scalability, clarity, and maintainability. It also includes a recommended folder structure with clear separation of concerns, along with notes on file naming and key style conventions.

---

## 1. Overview

CozyCabin is an AI-first project. Our goal is to create a codebase that is:
- Modular and scalable, with an organized folder structure.  
- Easy to navigate and read, particularly for AI-based tools.  
- Strictly adhering to TypeScript & React best practices.  
- Abiding by our design system rules (Tailwind + Shadcn) and accessibility guidelines.

All files must begin with a summary of their purpose, and all classes/functions should have JSDoc/TSDoc-style comments to explain their behavior, parameters, and return types.  
To preserve AI tool readability, keep all files under 250 lines where possible.

---

## 2. Recommended File Tree

Below is a sample file structure demonstrating clear separation of concerns: 
project-root/
├─ .env # Environment variables (NEVER internalize or copy within other files)
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
├─ postcss.config.js
├─ docs/
│ ├─ codebase-best-practices.md # This file
│ ├─ project-info/
│ │ ├─ tech-stack.md # Overview of tech stack
│ │ ├─ tech-stack-rules.md # Detailed coding, state mgmt, etc.
│ ├─ theme-rules.md # Color palettes, typography, etc.
│ ├─ ui-rules.md # UI architecture & accessibility guidelines
│ └─ ...
├─ src/
│ ├─ components/
│ │ ├─ Button/
│ │ │ ├─ Button.tsx # Shadcn-based button component
│ │ │ └─ Button.test.tsx # Jest test file
│ │ ├─ Form/
│ │ │ ├─ Form.tsx # React Hook Form + Zod usage
│ │ │ └─ Form.test.tsx
│ │ └─ ...
│ ├─ hooks/
│ │ ├─ useUserAuth.ts # Authentication hooks
│ │ ├─ useTicketUpdates.ts # Real-time ticket subscription
│ │ └─ ...
│ ├─ stores/
│ │ ├─ authStore.ts # Zustand store for auth
│ │ ├─ ticketStore.ts # Zustand store for ticket data
│ │ └─ ...
│ ├─ pages/
│ │ ├─ HomePage.tsx
│ │ ├─ TicketDetailsPage.tsx
│ │ └─ ...
│ ├─ utils/
│ │ ├─ api/
│ │ │ ├─ supabaseClient.ts # Supabase config & setup
│ │ │ └─ openAiClient.ts # OpenAI API interactions
│ │ ├─ formatters.ts # Reusable text/number formatting utils
│ │ └─ ...
│ ├─ theme/
│ │ ├─ index.ts # Consolidated theme exports
│ │ ├─ colors.ts # Tailwind color extensions from theme-rules
│ │ └─ ...
│ ├─ App.tsx
│ └─ main.tsx
├─ public/
│ ├─ favicon.ico
│ └─ ...
└─ ...

---

### Folder Explanations

- **docs/**: Stores all project documentation.  
- **src/**: Main source code directory.  
  - **components/**: All presentational and container components, ideally subdivided by feature or domain.  
  - **hooks/**: Custom React hooks for shared logic.  
  - **stores/**: Zustand stores, co-located with related domain logic.  
  - **pages/**: Top-level pages/views.  
  - **utils/**: Reusable utility functions (formatting, API clients, etc.).  
  - **theme/**: Thematic styling, color definitions, and Tailwind custom config.  

---

## 3. Key Conventions

### 3.1 TypeScript & Coding Standards
1. Always enable strict mode in `tsconfig.json`.  
2. Avoid the `any` type; use accurate typing or `unknown` if necessary.  
3. Create proper interfaces/types for data structures; prefer discriminated unions for complex states.  
4. Define return types for all functions to ensure clarity.  
5. Document each file’s purpose at the top and each function’s parameters and return types (JSDoc/TSDoc).

### 3.2 React & Zustand
1. Favor functional components with React hooks.  
2. Keep components focused and small — only handle one area of concern.  
3. Use Zustand for managing global state, ensuring minimal duplication and domain separation.  
4. Implement React.memo sparingly (only with documented performance considerations).  
5. For forms, rely on React Hook Form + Zod for type-safe validations.

### 3.3 Tailwind & Shadcn
1. Stick to Tailwind’s utility-first approach for responsive design and consistent spacing.  
2. Extend Tailwind configuration with theme-specific colors from “MountainLodge”, as defined in [theme-rules.md](../theme-rules.md).  
3. Reuse shadcn components (buttons, inputs, etc.) without modifying core internals; wrap them if customization is needed.  
4. Maintain layout consistency (responsive breakpoints, spacing, etc.) across pages.

### 3.4 UI & Accessibility
1. Follow [ui-rules.md](../ui-rules.md) for layout, spacing, and accessibility guidelines.  
2. Ensure adequate color contrast, especially when using the “MountainLodge” palette.  
3. Provide lively but concise animations (e.g., short transitions, minimal GPU overhead).  
4. Use proper aria attributes and labeling for accessible forms, dialogs, and interactive components.

### 3.5 Supabase & AWS Lambda
1. Keep Supabase queries, subscriptions, and RLS rules documented and consistent with [tech-stack.md](./tech-stack.md).  
2. Store real-time subscription cleanup logic in dedicated hooks or effect cleanup.  
3. Offload compute-heavy tasks (like AI processing) to AWS Lambda, called via well-defined APIs.  
4. Never store credentials or keys in the repositories; use `.env` files or secure environment variables.

### 3.6 Testing & Error Handling
1. Use Jest for unit/integration tests. Follow AAA (Arrange-Act-Assert) in test files.  
2. Keep snapshot tests for UI components in manageable test snapshots.  
3. Precisely handle and log errors in error boundaries; route them to Sentry.  
4. Keep error states and UI feedback consistent across the app.

### 3.7 Documentation & Maintenance
1. Update docs when significant changes occur (new major components, architectural shifts).  
2. Maintain versioned release notes for each environment (staging, production).  
3. Structure docs for easy reading; keep them short and pointed (~250 lines max).  
4. Periodically audit code for stale references or dead code.

---

## 4. Design System Notes

Incorporate “MountainLodge” theme elements (see [theme-rules.md](../theme-rules.md)) across the UI:
- Colors: Lodge Brown (#6B4E3E) for primary buttons/headers, Pine Green (#2E5D50) for secondary elements, Cabin Cream (#F2ECE4) as background.  
- Typography: Keep heading levels and body text at comfortable line spacing (≥1.4).  
- Accessibility: Ensure minimum WCAG AA contrast, especially with browns and creams.

---

## 5. Conclusion

These best practices unify coding, styling, state management, and design guidelines into one cohesive ecosystem. By following these standards, we ensure clean, maintainable, and AI-friendly code that remains consistent with the CozyCabin brand and user experience goals.

Keep this document updated as the project evolves and new requirements emerge. Well-structured, documented, and tested code will foster both fast iteration and long-term stability.