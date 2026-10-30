import { useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { Badge, Button, Modal, ModalBody, ModalHeader, RvaMark } from '../design-system';
import { useUngradedExamCountQuery } from '../features/admin-grading/grading.hooks';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import { useAuthStore } from '../store/auth';
import { cn } from '../lib/cn';
import { UserMenu } from './components/UserMenu';

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users', end: false },
  { to: '/admin/progress', label: 'Progress', end: false },
  { to: '/admin/grading', label: 'Grading', end: false, showUngraded: true as const },
  { to: '/admin/courses', label: 'Courses', end: false },
] as const;

function AdminNavLink({
  to,
  end,
  label,
  ungradedCount,
  onNavigate,
}: {
  to: string;
  end?: boolean;
  label: string;
  ungradedCount?: number;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium',
          'transition-colors duration-fast motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          isActive
            ? 'bg-brand-100 text-brand-800'
            : 'text-fg-muted hover:bg-neutral-100 hover:text-fg',
        )
      }
    >
      <span>{label}</span>
      {typeof ungradedCount === 'number' && ungradedCount > 0 ? (
        <Badge variant="warning" size="sm" aria-label={`${ungradedCount} ungraded`}>
          {ungradedCount}
        </Badge>
      ) : null}
    </NavLink>
  );
}

export function AdminShell() {
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ungradedQuery = useUngradedExamCountQuery();
  const ungradedCount = ungradedQuery.data;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg text-fg md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-4 py-5">
          <RvaMark size="sm" />
          <p className="mt-2 text-xs text-fg-muted">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
          {adminLinks.map((link) => (
            <AdminNavLink
              key={link.to}
              to={link.to}
              end={link.end}
              label={link.label}
              ungradedCount={
                'showUngraded' in link && link.showUngraded ? ungradedCount : undefined
              }
            />
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p className="truncate text-xs text-fg-muted">{user?.email}</p>
            <NotificationBell />
          </div>
          <UserMenu align="start" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Open admin navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <RvaMark size="sm" />
          </div>
          <NotificationBell />
          <UserMenu align="end" />
        </header>

        <main id="admin-main" className="min-w-0 flex-1 overflow-x-auto px-4 py-8 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal open={mobileOpen} onOpenChange={setMobileOpen} size="sm">
        <ModalHeader title="Admin menu" description="Navigate admin tools" />
        <ModalBody>
          <nav aria-label="Admin mobile" className="flex flex-col gap-1">
            {adminLinks.map((link) => (
              <AdminNavLink
                key={link.to}
                to={link.to}
                end={link.end}
                label={link.label}
                ungradedCount={
                  'showUngraded' in link && link.showUngraded ? ungradedCount : undefined
                }
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
          <p className="mt-4 truncate text-xs text-fg-muted">{user?.email}</p>
        </ModalBody>
      </Modal>
    </div>
  );
}
