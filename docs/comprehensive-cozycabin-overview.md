# CozyCabin: Comprehensive Overview for Cursor Agent

Welcome to the CozyCabin project! This document serves as a single, high-level reference that ties together all of our existing guidelines, best practices, workflows, and theming rules. It is designed to be fed into the Cursor Agent mode, ensuring alignment with the project's established norms whenever you create or modify features.

---

## 1. Project Overview

CozyCabin is a Zendesk-like customer support system with built-in AI features. It supports:
- Role-based portals: Customer, Agent, and Admin.
- Ticket submission & management: Basic CRUD, attachments, and real-time updates via Supabase.
- AI enhancements: Automated routing, AI-generated responses, and knowledge base suggestions.

We aim for a production-ready MVP by week one (focusing on core ticket management) and advanced AI features by week two. See "docs/project-info/project-overview.md" for a detailed breakdown of milestones and goals.

---

## 2. Key Documents and Their Purpose

1. [User Flow Guide](./project-info/user-flow.md)  
   • Outlines the end-to-end journey for customers, agents, and admins.  
   • Helps inform UI/UX decisions and component architecture.

2. [Tech Stack & Rationale](./project-info/tech-stack.md)  
   • Describes our usage of TypeScript, React, Zustand, Supabase, etc.  
   • Explains our hosting (AWS Amplify) and AI integration approach with AWS Lambda.

3. [Theme Rules (MountainLodge)](./rules/theme-rules.md)  
   • Establishes our chosen color palette and style guidelines.  
   • Details typography, layouts, spacing, and transitions.

4. [UI Rules](./rules/ui-rules.md)  
   • Covers layout consistency, accessibility, and responsiveness.  
   • Encourages best practices with Tailwind, Shadcn, Radix UI, and React Hook Form.

5. [Codebase Best Practices](../codebase-best-practices.md)  
   • Describes folder structure, naming, TypeScript conventions, and testing strategies.  
   • Important for keeping the codebase readable, testable, and aligned with AI-friendly patterns.

6. [Workflow Templates](./workflow-templates/)  
   • "git-workflow-template.md" for Git branching and PR creation steps.  
   • "ui-workflow-template.md" and "backend-workflow-template.md" for consistent feature development, from planning to verification.

By referencing these core docs, you ensure your implementation remains consistent and does not duplicate or conflict with existing patterns.

---

## 3. Core Principles

1. We Use Yarn, Not npm  
   • All commands should be run via "yarn", including database or migration operations (e.g., "yarn supabase").

2. Supabase as Our ORM & Realtime Engine  
   • All database interactions and real-time subscriptions utilize Supabase.  
   • Supabase Auth for authentication, Supabase Storage for file handling.  
   • Ensure .env values remain private; never move or copy environment-specific keys into other files.

3. Theme & UI Consistency  
   • Always follow "MountainLodge" color and typography guidelines from theme-rules.  
   • Enforce UI/UX standards (responsive design, accessibility) from ui-rules.  
   • Keep code style consistent with our codebase-best-practices, including TypeScript strict mode and commented functions.

4. Workflow & Testing  
   • Use the relevant workflow template (UI or backend) when building new features.  
   • Start each new feature with an Understanding/Planning phase, then Implementation, followed by Verification.  
   • Jest is our testing framework for unit/integration tests; Sentry for error tracking.

---

## 4. Document Usage with Cursor Agent Mode

When you feed this document (and the referenced docs) into Cursor's Agent mode:
1. Always review the "ui-rules.md" and "theme-rules.md" before writing/updating components.  
2. For any backend changes, consult "backend-workflow-template.md," "tech-stack.md," and "codebase-best-practices.md."  
3. Make sure to respect environment variable handling. Do not inline or relocate any .env values.  
4. Keep your code changes under ~250 lines per file to remain AI-tool friendly and maintain clarity.  
5. Run "yarn supabase" for database migrations or any Supabase-related tasks.

---

## 5. Next Steps

• As you implement new features or fix bugs, reference this overview first.  
• Link back to the individual docs in "docs/" for deeper detail on each topic.  
• Follow the indicated workflows, adopt consistent styling, and lean on TypeScript's strict type checking.

By adhering to this consolidated overview and its supporting documentation, you'll ensure CozyCabin remains coherent, efficient, and ready for ongoing AI-powered enhancements.

--- 