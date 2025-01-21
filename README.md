# CozyCabin

A modern customer support ticketing system built with React, TypeScript, and Supabase.

## Features

- Customer ticket submission via chat and email
- Agent ticket management dashboard
- Admin oversight and analytics
- AI-powered responses and ticket routing
- Real-time updates and notifications

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (Database, Auth, Storage)
- **Deployment**: AWS Amplify (optional)

## Prerequisites

- Node.js (LTS version)
- Yarn package manager
- Docker (for local Supabase development)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cozycabin.git
   cd cozycabin
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Local Supabase**
   ```bash
   npx supabase start
   ```
   This will start the local Supabase instance with the following services:
   - Studio: http://127.0.0.1:55321
   - API: http://127.0.0.1:55323
   - DB: postgresql://postgres:postgres@127.0.0.1:55322/postgres

5. **Start Development Server**
   ```bash
   yarn dev
   ```
   The application will be available at http://localhost:5173

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Project Structure

```
cozycabin/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   ├── stores/        # Zustand state stores
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── supabase/          # Supabase configurations and migrations
└── docs/             # Project documentation
```

## Development Workflow

1. **Code Style**
   - Follow ESLint and Prettier configurations
   - Run `yarn format` before committing changes

2. **Database Changes**
   - Make changes through Supabase Studio UI
   - Or use migration files in `supabase/migrations`

3. **Testing**
   - Test auth flows through Supabase Studio
   - Verify RLS policies for each role
   - Test real-time subscriptions

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.