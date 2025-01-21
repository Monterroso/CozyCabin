# Phase 1: Project Setup & Basic Architecture

This phase focuses on laying the groundwork for our CozyCabin application, drawing on guidelines from:
- @codebase-best-practices.md
- @tech-stack.md
- @tech-stack-rules.md

## Features & Tasks

1. Codebase Initialization  
   - [Frontend] Create a new repository or branch for the CozyCabin project.  
   - [Frontend] Initialize the project with React, TypeScript, Tailwind CSS, and Shadcn UI.  
   - [Backend] Configure Supabase project (database, auth, storage).  
   - [Backend] Set up AWS Amplify hosting (if you want to deploy from the start).

2. Folder Structure & Essential Config  
   - [Frontend] Implement a scalable folder structure as recommended in @codebase-best-practices.md.  
   - [Frontend] Create initial placeholders for key folders (components, hooks, stores, pages, utils, theme).  
   - [Backend] Prepare Supabase settings (roles, RLS considerations) without populating sensitive keys in the code.  
   - [Backend] Link to AWS Amplify for automated builds and environment configs (avoid committing any secrets).

3. Tailwind & Theme Integration  
   - [Frontend] Set up Tailwind config and add "MountainLodge" theme colors from @theme-rules.md.  
   - [Frontend] Verify shadcn component library integration (e.g., tailwind.config.js includes correct paths).  
   - [Frontend] Confirm basic UI theming matches the brand guidelines.

4. Linting, Formatting & Basic Scripts  
   - [Frontend] Add ESLint, Prettier, or other linters/formatters in line with @codebase-best-practices.md.  
   - [Frontend] Include common scripts (build, dev, lint, format) in package.json.  
   - [Backend] Ensure any serverless or Amplify configuration includes build scripts and a deployment pipeline.

5. Documentation & Git Conventions  
   - [Frontend] Create or update a README documenting how to run and build the project.  
   - [Frontend] Ensure commits follow a consistent message style (e.g., Conventional Commits).  
   - [Backend] Document any required environment variables in a safe manner (never copying .env values).  
   - [Backend] Verify that environment configs are not committed to git (.gitignore set properly). 