import { Outlet } from 'react-router-dom';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg text-fg">
      <AppHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
