# UI Workflow
Strictly adhere to this workflow.
Items should be addressed one-by-one, in order.
Always reference `ui-rules.md`, `theme-rules.md`, and `codebase-best-practices.md`.

## Project State
Project Phase: Phase 3 - Ticket Management Basics
UI-Focused

## Task Management
- [ ] Identify current UI tasks from docs/phases_overview/phase3-ticket-management-basics.md
- [ ] Copy task details to "Primary Feature" section
- [ ] Break down into "Component Features"

---

## Primary Feature
Name: Ticket Management Interface
Description: Implement customer and agent interfaces for ticket creation, viewing, and management

### Component Features
- [ ] Customer Ticket Creation
  - [ ] Create "New Ticket" form with React Hook Form + Zod
  - [ ] Implement file attachment handling
  - [ ] Add form validation and error states
  - [ ] Style with Shadcn components and Tailwind
- [ ] Customer Ticket Management
  - [ ] Create ticket list view with filters
  - [ ] Implement ticket detail view
  - [ ] Add conversation/notes interface
  - [ ] Style with MountainLodge theme
- [ ] Agent Ticket Queue
  - [ ] Create agent dashboard view
  - [ ] Implement ticket sorting and filtering
  - [ ] Add ticket assignment interface
  - [ ] Style status indicators
- [ ] Agent Ticket Management
  - [ ] Create ticket update interface
  - [ ] Implement internal notes system
  - [ ] Add status change controls
  - [ ] Style priority indicators

---

## Progress Checklist

### Understanding Phase
- [ ] Documentation Review
    - [ ] UI guidelines from `ui-rules.md`
    - [ ] Theming guidelines from `theme-rules.md`
    - [ ] Relevant component strategies (shadcn/ui, Radix, Tailwind)
    - [ ] UX directives (glassmorphism, transitions, presence)
- [ ] Implementation Plan
  - [ ] Theming approach
  - [ ] Accessibility requirements
  - [ ] Animation/transition needs
- Notes: [ ]

### Planning Phase
- [ ] Component Architecture
  - [ ] Define component tree/wireframes
        ```
        TicketManagement
        ├── CustomerView
        │   ├── TicketForm
        │   ├── TicketList
        │   └── TicketDetail
        └── AgentView
            ├── TicketQueue
            ├── TicketAssignment
            └── TicketManagement
        ```
  - [ ] List styling requirements
  - [ ] Define file structure
  - [ ] PAUSE, Check in with user
- Notes: [ ]

### Implementation Phase
- [ ] Setup
  - [ ] Verify form libraries
  - [ ] Check state management
- Notes: [ ]

- [ ] Development
  - [ ] Create/update component files
  - [ ] Implement styling and interactions
  - [ ] Add accessibility features
  - [ ] Integrate loading states
- Notes: [ ]

### Verification Phase
- [ ] Quality Check
  - [ ] Design compliance
  - [ ] Animation/transition behavior
  - [ ] Theme compatibility
  - [ ] Accessibility
  - [ ] Code organization
  - [ ] Documentation
- Notes: [ ]

### Completion
- [ ] User sign-off
- [ ] Update task tracking

## Notes
Key decisions and learnings:
1. [ ] 