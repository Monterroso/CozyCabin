import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-cabin-cream-100">
      <header className="bg-lodge-brown text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">CozyCabin</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-pine-green-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-center">© 2024 CozyCabin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 