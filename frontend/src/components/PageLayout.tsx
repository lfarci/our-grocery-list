import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-honey">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
