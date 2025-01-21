# Phase 5: Admin Console & Automated Ticket Routing

Introducing admin-level oversight and intelligent routing from:
- @project-overview.md
- @user-flow.md
- @tech-stack-rules.md

## Features & Tasks

1. Admin Console Layout  
   - [Frontend] Build an Admin Dashboard with UI sections for team management, routing rules, and overall ticket statuses.  
   - [Frontend] Use shadcn components (e.g., <Table>, <Tabs>) to display aggregated data.  
   - [Backend] Provide endpoints for fetching user lists, agent stats, and system metrics (e.g., open tickets per agent).

2. Team & Skill Management  
   - [Frontend] Allow admins to create/edit teams, assign agents, define coverage schedules.  
   - [Frontend] Provide UI to set or update "skills" for each agent (e.g., billing, technical, sales).  
   - [Backend] Extend DB schema to store teams, skills, and agent-team relationships.  
   - [Backend] Enforce role-based logic so only Admins can invoke these endpoints.

3. Rule-Based Ticket Assignment  
   - [Frontend] Provide a UI to define and edit routing rules (e.g., "if ticket contains keyword 'billing', assign to Billing Team").  
   - [Backend] Create routing logic triggered on ticket creation or updates (supabase function or AWS Lambda for more complex logic).  
   - [Backend] Store routing rules in DB (e.g., JSON-based config) for easy maintenance.  
   - [Backend] Ensure fallback to default routes if no rule matches.

4. Skills-Based & Load-Balanced Routing  
   - [Frontend] Let Admins enable skill-based routing so that relevant tickets automatically go to the correct agent/team.  
   - [Backend] Check agent "availability" and current load via query or real-time presence.  
   - [Backend] Implement load-balancing logic (e.g., round-robin assignment across available agents in the best-matching skill pool).

5. Admin Insights & Reporting  
   - [Frontend] Show charts or summary stats (e.g., average resolution time).  
   - [Backend] Provide streamlined data for charting or advanced analytics (ticket metrics, agent performance).  
   - [Backend] Potentially use AWS Lambda to gather data for large-scale or on-demand reporting.

6. Testing & Validation  
   - [Frontend] Write tests confirming admin-level UI flows (creating teams, managing roles).  
   - [Backend] Validate new routing logic effectively assigns tickets, especially under dynamic conditions.  
   - [Frontend + Backend] Confirm that only Admins can manage teams and configure rules. 