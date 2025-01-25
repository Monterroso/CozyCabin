# Incorporating InvitePages for Admin User Invitations

Below is a high-level checklist describing how to integrate InvitePages into our CozyCabin application. We will allow admins to invite new users (Agents, Customers, or other Admins) from within the admin console. The workflow is divided into UI and backend tasks, following the templates outlined in "ui-workflow-template.md" and "backend-workflow-template.md."

---

## UI Workflow

### 1. Understanding / Planning ✓
- [x] Identify the existing Admin Console entry point (e.g., "AdminDashboardPage") where we'll link the new InvitePage.
- [x] Decide on UI/UX flow:  
  - [x] Admin clicks an "Invite User" button.  
  - [x] A new modal or standalone page appears, prompting the admin to enter email and select a role (Agent, Customer, or Admin).
- [x] Review design consistency with "MountainLodge" theme (colors, spacing) and "ui-rules.md" for accessibility.

### 2. Implementation ✓
- [x] Create a new page or component, "InvitePage," within "src/pages" (or a relevant directory under "src/components/Admin/"):
  - [x] Use React Hook Form + Zod for form handling and validations:
    - [x] Fields: Email (required, valid email), Role (required, selectable from Agent/Customer/Admin).
    - [x] Optional fields if any additional metadata is needed.
  - [x] Adhere to Tailwind + Shadcn styling and theming guidelines.  
  - [x] Ensure the form is responsive for different screen sizes.
- [x] Integrate with Zustand (if needed) or local component state for UI state tracking:
  - [x] Manage loading states while sending invites.
  - [x] Handle success/failure notifications (e.g., toast messages).
- [x] Add an "Invite User" button/link in the Admin Console:
  - [x] On click, route to the new page or open a modal with the invite form.
  - [x] Pass necessary data (if any) to the new component.
- [x] Provide user feedback:
  - [x] Show a success toast or message upon successful invite.
  - [x] Handle error states (invalid email, user already invited, etc.) gracefully.

### 3. Verification
- [ ] Test the form's validation (e.g., empty fields, invalid emails).
- [ ] Verify the UI flow on different device sizes.
- [ ] Confirm role selections properly reflect the correct invite type (Agent, Customer, Admin).
- [ ] Conduct a quick accessibility audit (keyboard navigation, screen reader labels).
- [ ] Ensure the UI follows the theme rules from "theme-rules.md" and "ui-rules.md."

---

## Backend Workflow

### 1. Understanding / Planning ✓
- [x] Check existing database schema and identify how invites will be stored:
  - [x] If needed, add an "invites" table in Supabase to track pending invitations (email, role, status).  
  - [x] Consider indexing by email if you plan to handle invites or repeated invites efficiently.
- [x] Determine the invitation process:
  - [x] On success, a record is created in the "invites" table (with a status like "pending").
  - [x] Potentially, send an email notification (using a serverless function or third-party service).
  - [x] When the user accepts the invite, finalize user creation in Supabase Auth and set the correct role.

### 2. Implementation
- [x] Schema Updates:
  - [x] Run "yarn supabase migration new" to create a new migration script if you decide on a dedicated table.  
  - [x] Add columns for "email," "role," "status," "created_at," etc.
  - [x] Apply migrations with "yarn supabase db push."
- [x] API Endpoints:
  - [x] Create a new endpoint (e.g., POST /api/invites) or a Supabase RPC function:
    - [x] Validate input (email, role).
    - [x] Insert a row into the invites table.
    - [x] (Optional) Trigger an email invite flow.
  - [x] Create additional endpoints or use existing ones to handle acceptance of invites.
- [x] Access Control:
  - [x] Ensure only Admins can create invites:
    - [x] Check user role in the request (use the current Supabase session).
    - [x] Validate admin privileges before creating the invite.
  - [x] Ensure the role requested is valid and within permissible roles (Agent, Customer, Admin).
- [ ] Email Service (Optional / Future Enhancement):
  - [ ] Integrate a serverless function (AWS Lambda) or a third-party service to send an invite email.
  - [ ] Handle any needed tokens or secure links for the invited user to complete registration.

### 3. Verification
- [ ] Unit Tests:
  - [ ] Use Jest to test the invitation endpoint (happy path, invalid inputs, insufficient permissions).
  - [ ] Check database insert logic and ensure data is saved correctly.
- [ ] Integration Tests:
  - [ ] Simulate an admin user calling the invite endpoint with valid data.
  - [ ] Verify the invitation record is created in the database.
  - [ ] Check that a non-admin user or missing role fails gracefully.
- [ ] Documentation:
  - [ ] Update "project-overview.md" or relevant readme to reflect the new invites feature.
  - [ ] Include references to the new endpoints or RPC calls.

---

## Summary

By following these checklists, you will integrate the InvitePages feature in a way that respects CozyCabin's existing architecture and guidelines. The UI steps ensure that admins have a straightforward form to add new users as Agents, Customers, or Admins, while the backend steps cover schema changes, new endpoints, and security considerations. Remember to keep all role logic strictly in the backend to prevent unauthorized invites and maintain consistency with our "backend-workflow-template.md" guidelines.