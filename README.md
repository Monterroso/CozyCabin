# CozyCabin

A modern customer support system built with React, TypeScript, and Supabase.

## Features

- Customer ticket submission via chat and email
- Agent ticket management dashboard
- Admin oversight and analytics
- AI-powered responses and ticket routing
- Real-time updates and notifications

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Zustand for state management
- React Hook Form + Zod for forms
- Supabase for backend services

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cozy-cabin.git
   cd cozy-cabin
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) to view the app.

## Development

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── stores/        # Zustand state stores
├── pages/         # Page components
├── utils/         # Utility functions
│   └── api/      # API clients
└── theme/         # Theme configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.