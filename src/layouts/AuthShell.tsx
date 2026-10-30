import type { ReactNode } from 'react';
import { RvaMark } from '../design-system';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <div className="border-b border-border/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-5 md:px-8">
          <RvaMark size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">Remote VA&apos;s Academy</p>
            <p className="text-xs text-fg-muted">Build professional skills, one lesson at a time</p>
          </div>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-12 md:px-8">
        {children}
      </main>
    </div>
  );
}
