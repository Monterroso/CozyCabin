# Phase 2: User Authentication & Core Data Model

Expanding on Phase 1 with a focus on authentication and establishing the foundational database schema, referencing:
- @project-overview.md
- @tech-stack.md
- @tech-stack-rules.md
- @codebase-best-practices.md

## Features & Tasks

1. Supabase Auth Integration  
   - [Frontend] Install Supabase client and configure the Supabase Auth UI flow (sign up, log in, password reset if applicable).  
   - [Frontend] Implement a user registration page and login page with React Hook Form + Zod for validation.  
   - [Backend] Enable required authentication providers in Supabase console (email, social if needed).  
   - [Backend] Enforce RLS policies for user-related tables, ensuring security and role-based access.

2. User Role Management  
   - [Frontend] Distinguish between Customer, Agent, and Admin roles as outlined in @user-flow.md.  
   - [Backend] Create or extend the user table (or profile table) with roles.  
   - [Backend] Ensure these roles sync or store properly in Supabase (via row-level security or DB constraints).

3. Database Schema for Tickets  
   - [Frontend] Prepare the project for future ticket-related operations (e.g., forms, validations).  
   - [Backend] Create initial tables in Supabase for tickets (tickets, ticket_metadata, etc.) following guidelines in @project-overview.md (basic fields: ID, subject, description, status, priority, etc.).  
   - [Backend] Implement necessary constraints (foreign keys, timestamps, default values).

4. Basic UI & Navigation Guard  
   - [Frontend] Modify navigation to ensure only authenticated pages are accessible upon login.  
   - [Frontend] Add placeholders for different dashboards (customer, agent, admin), utilizing the newly set roles for routing logic.  
   - [Frontend] Include "Sign Up" and "Log In" pages styled according to @ui-rules.md and "MountainLodge" theme.

5. Testing & Verification  
   - [Frontend] Write basic Jest tests for the Auth flow (e.g., form submission, error messages).  
   - [Backend] Verify data insertion, update, and role-based access in Supabase.  
   - [Frontend + Backend] Confirm the user can register, log in, and be routed to the correct dashboard or role-based area. 