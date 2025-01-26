# Codebase Best Practices

This document consolidates essential guidelines from the following references:
- [@tech-stack.md](./tech-stack.md)  
- [@tech-stack-rules.md](./tech-stack-rules.md)  
- [@ui-rules.md](../ui-rules.md)  
- [@theme-rules.md](../theme-rules.md)

It outlines how to organize and structure the CozyCabin codebase to ensure scalability, clarity, and maintainability. It also includes our current folder structure with clear separation of concerns, along with notes on file naming and key style conventions.

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

## 2. Current File Tree

Below is our current file structure demonstrating clear separation of concerns: 

project-root/
├─ .env # Environment variables (NEVER internalize or copy within other files)
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
├─ postcss.config.cjs
├─ vite.config.ts
├─ eslint.config.js
├─ .prettierrc
├─ docs/
│ ├─ active-workflows/
│ ├─ workflows/
│ ├─ phases/
│ ├─ workflow-templates/
│ ├─ rules/
│ ├─ prompts/
│ ├─ project-info/
│ ├─ phases_overview/
│ ├─ new-project-setup.md
│ ├─ codebase-best-practices.md
│ └─ comprehensive-cozycabin-overview.md
├─ src/
│ ├─ components/
│ │ ├─ supabase/ # Supabase-specific components
│ │ ├─ auth/ # Authentication components
│ │ ├─ tickets/ # Ticket management components
│ │ ├─ layout/ # Layout and structural components
│ │ ├─ ui/ # Shared UI components
│ │ └─ error/ # Error handling components
│ ├─ hooks/
│ │ └─ useAuth.ts # Authentication hooks
│ ├─ stores/
│ │ ├─ authStore.ts # Zustand store for auth
│ │ ├─ ticketStore.ts # Ticket management store
│ │ └─ inviteStore.ts # User invitations store
│ ├─ pages/
│ │ ├─ tickets/
│ │ ├─ dashboards/
│ │ ├─ auth/
│ │ ├─ admin/
│ │ ├─ LandingPage.tsx
│ │ └─ UnauthorizedPage.tsx
│ ├─ lib/
│ │ ├─ supabase/ # Supabase client and utilities
│ │ ├─ types/ # TypeScript type definitions
│ │ ├─ validations/ # Form and data validation
│ │ ├─ api/ # API utilities
│ │ ├─ schemas/ # Zod schemas
│ │ ├─ utils.ts # General utilities
│ │ └─ supabase.ts # Supabase configuration
│ ├─ theme/
│ │ ├─ colors.ts # Theme color definitions
│ │ └─ colors.cjs # CJS version for build tools
│ ├─ routes/
│ ├─ App.tsx
│ └─ main.tsx
├─ migrations/ # Supabase migrations
├─ scripts/ # Build and utility scripts
└─ public/ # Static assets

---

### Folder Explanations

- **docs/**: Comprehensive project documentation
  - **active-workflows/**: Current active development workflows
  - **project-info/**: Core project documentation
  - **rules/**: Coding and design guidelines
  - Other documentation categories for workflows, phases, and templates
- **src/**: Main source code directory
  - **components/**: Feature-based component organization
    - **supabase/**: Supabase-specific components
    - **auth/**: Authentication components
    - **ui/**: Shared UI components
    - Feature-specific component directories
  - **lib/**: Shared utilities and configurations
    - **supabase/**: Supabase client setup and utilities
    - **types/**: TypeScript type definitions
    - **validations/**: Form and data validation logic
    - **schemas/**: Zod schema definitions
  - **stores/**: Zustand stores by feature domain
  - **pages/**: Route-based page components
  - **theme/**: Theme configuration and styling
  - **routes/**: Route configurations
- **migrations/**: Supabase database migrations
- **scripts/**: Build and utility scripts

---

## 3. Key Conventions

### 3.1 TypeScript & Coding Standards
1. Always enable strict mode in `tsconfig.json`.  
2. Avoid the `any` type; use accurate typing or `unknown` if necessary.  
3. Create proper interfaces/types for data structures; prefer discriminated unions for complex states.  
4. Define return types for all functions to ensure clarity.  
5. Document each file's purpose at the top and each function's parameters and return types (JSDoc/TSDoc).

### 3.2 React & Zustand
1. Favor functional components with React hooks.  
2. Keep components focused and small — only handle one area of concern.  
3. Use Zustand for managing global state, ensuring minimal duplication and domain separation.  
4. Implement React.memo sparingly (only with documented performance considerations).  
5. For forms, rely on React Hook Form + Zod for type-safe validations.

### 3.3 Tailwind & Shadcn
1. Stick to Tailwind's utility-first approach for responsive design and consistent spacing.  
2. Extend Tailwind configuration with theme-specific colors from "MountainLodge", as defined in [theme-rules.md](../theme-rules.md).  
3. Reuse shadcn components (buttons, inputs, etc.) without modifying core internals; wrap them if customization is needed.  
4. Maintain layout consistency (responsive breakpoints, spacing, etc.) across pages.

### 3.4 UI & Accessibility
1. Follow [ui-rules.md](../ui-rules.md) for layout, spacing, and accessibility guidelines.  
2. Ensure adequate color contrast, especially when using the "MountainLodge" palette.  
3. Provide lively but concise animations (e.g., short transitions, minimal GPU overhead).  
4. Use proper aria attributes and labeling for accessible forms, dialogs, and interactive components.

### 3.5 Supabase & Database
1. Keep Supabase queries and RLS rules in dedicated files within `lib/supabase/`.
2. Store real-time subscription cleanup logic in dedicated hooks.
3. Keep database migrations versioned and documented in the `migrations/` directory.
4. Never store credentials or keys in the repositories; use `.env` files or secure environment variables.

### 3.6 State Management & Data Flow
1. Use Zustand for global state management, with stores organized by feature in `stores/`.
2. Implement React Hook Form with Zod for form validation, with schemas in `lib/schemas/`.
3. Keep component-level state minimal and lift state up when needed.
4. Use TypeScript discriminated unions for complex state management.

### 3.7 Component Organization
1. Group components by feature domain (auth, tickets, etc.).
2. Keep shared UI components in the `components/ui/` directory.
3. Maintain layout components separately in `components/layout/`.
4. Handle errors consistently using components from `components/error/`.

### 3.8 Routing & Navigation
1. Define routes in the `routes/` directory.
2. Organize pages by feature in the `pages/` directory.
3. Implement proper auth guards and role-based access control.
4. Keep route configurations clean and well-documented.

### 3.9 Documentation & Maintenance
1. Keep documentation organized in appropriate `docs/` subdirectories:
   - `active-workflows/` for current development processes
   - `project-info/` for core documentation
   - `rules/` for coding and design guidelines
2. Update workflow documentation when processes change
3. Maintain comprehensive API documentation
4. Keep code comments focused and meaningful

### 3.10 Development Workflow
1. Use the scripts in `scripts/` directory for common development tasks
2. Follow the established git workflow documented in `docs/`
3. Ensure all new features have corresponding documentation
4. Keep the codebase clean by regularly removing unused code

---

## 4. Design System Notes

### 4.1 Component Library
- Use shadcn components as the foundation
- Maintain consistent styling through Tailwind utilities
- Keep custom components in `components/ui/`
- Follow accessibility guidelines for all UI components

### 4.2 Theme Configuration
- Theme colors are defined in `theme/colors.ts`
- Use the CJS version (`colors.cjs`) for build tools
- Follow the color palette defined in design documentation
- Maintain consistent spacing and typography

---

## 5. Conclusion

These best practices reflect our current codebase organization and development workflow. By following these standards, we ensure:
- Clear separation of concerns
- Consistent code organization
- Maintainable and scalable architecture
- Efficient development workflow

Keep this document updated as our practices evolve. Well-structured, documented, and tested code will foster both fast iteration and long-term stability.