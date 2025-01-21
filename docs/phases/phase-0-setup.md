# Phase 0: Project Initialization & Environment Setup

A quick-start checklist to get the project up and running before diving into detailed phases.

## 1. Node & Yarn/NPM Setup
- Install the latest LTS version of Node.js (e.g., 16.x or 18.x).
- Decide on a package manager: Yarn or npm.  
  - Example: install Yarn globally → npm install -g yarn

## 2. Repository & Basic Structure
1. Create a new repository (e.g., "aidesk") or clone if already set up.
2. Initialize repository with a .gitignore to exclude /node_modules, /dist, environment files (.env), etc.
3. Include documentation folders as shown in the recommended file tree (e.g., docs/, src/, etc.).

## 3. Installing Dependencies
1. From the repository root, run:
   - yarn install  
     or  
   - npm install  
2. Confirm dependencies (e.g., React, Tailwind, shadcn components, Zustand, React Hook Form, Zod), as specified in the package.json.

## 4. Dev Tools & Linters
1. Install ESLint and Prettier (or your preferred linters/formatters).  
2. Configure lint scripts in package.json:
   - "lint": "eslint --ext .ts,.tsx src/"
   - "format": "prettier --write ."
3. Create or update .eslintrc and .prettierrc (refer to the codebase-best-practices.md for guidelines).

## 5. Tailwind & Shadcn Configuration
1. Ensure Tailwind is installed with the recommended default config (tailwind.config.js) pointing to src/ directories.  
2. Include any necessary shadcn UI library setup (copy or generate config files).

## 6. Supabase Setup (Initial)
1. Create a Supabase project or confirm existing one.  
2. Keep all Supabase credentials in a .env file (never commit these).  
3. Optional: install the Supabase CLI for local migrations or DB management.

## 7. AWS Amplify (Optional Early Setup)
1. If deploying from the start, configure AWS Amplify with environment variables (through the Amplify console).  
2. Ensure no .env secrets are committed to the repository or exposed in build logs.

## 8. Running the Dev Server
1. Start the project in development mode:
   - yarn dev  
     or  
   - npm run dev  
2. Verify that the local server launches without errors.

## Next Steps
Once this environment is set, proceed to Phase 1 (see phase1-project-setup.md) to structure the codebase further and begin implementing AIDesk's core architecture. 