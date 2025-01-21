# Phase 3: Ticket Management Basics

Addressing core ticket functionalities so both customers and agents can interact with tickets, referencing:
- @project-overview.md
- @user-flow.md
- @tech-stack.md
- @ui-rules.md
- @theme-rules.md

## Features & Tasks

1. Ticket Creation (Customer)  
   - [Frontend] Implement a "New Ticket" form with React Hook Form + Zod for basic validation (subject, description, priority).  
   - [Frontend] Use Tailwind + Shadcn components to style the form (buttons, inputs, etc.).  
   - [Backend] Configure Supabase insert logic (secure the insert with RLS to ensure only authenticated customers can create).  
   - [Backend] Store essential fields: ticket ID, user ID, timestamps, status, priority.

2. Ticket List & Detail View (Customer)  
   - [Frontend] Display a list of tickets for the logged-in customer, respecting the "MountainLodge" theme.  
   - [Frontend] Create a ticket detail page to show conversation history or notes.  
   - [Backend] Provide an API or direct Supabase query for retrieving all tickets for a specific user.  
   - [Backend] Ensure the details endpoint (or approach) includes everything needed (ticket details, status, timestamps).

3. Agent Side: Ticket Queue  
   - [Frontend] Implement an Agent Dashboard showing open or assigned tickets.  
   - [Frontend] Provide sorting or filtering options for tickets by status or priority.  
   - [Backend] Supply read endpoints for agent-focused queries (all open tickets, tickets assigned, etc.).  
   - [Backend] Enforce agent role checks via RLS or role-based logic.

4. Basic Ticket Updates (Agent)  
   - [Frontend] Agents can change ticket status (e.g., In Progress, Solved).  
   - [Frontend] Agents can add internal notes or replies (React Hook Form + Zod for updates).  
   - [Backend] Provide update functionality for ticket status changes, storing internal notes.  
   - [Backend] Validate that only agents or assigned roles can update certain fields.

5. UI Consistency & Accessibility  
   - [Frontend] Reference @ui-rules.md to maintain consistent spacing and accessibility.  
   - [Frontend] Use color palette from @theme-rules.md to highlight ticket priorities.  
   - [Backend] Ensure correct data is returned for front-end to color code statuses (e.g., urgent = Ember Orange highlights).

6. Testing & Validation  
   - [Frontend] Implement unit tests for ticket creation and status updates.  
   - [Backend] Confirm proper role checks and CRUD operations in Supabase with test data.  
   - [Frontend + Backend] Conduct integration tests to ensure tickets flow from creation to agent resolution without errors. 