import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, RvaMark } from '../../design-system';
import { BadgeList } from '../../features/badges/components/BadgeList';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';
import { formatPoints } from '../../lib/format';
import { useAuthStore } from '../../store/auth';
import { cn } from '../../lib/cn';
import { MobileNav } from './MobileNav';
import { UserMenu } from './UserMenu';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/progress', label: 'My Progress', end: false },
] as const;

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const badges = user?.badges ?? [];

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50',
          'rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-inverse',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:h-16 md:px-8">
        <Link
          to="/"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RvaMark size="sm" />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium',
                  'transition-colors duration-fast motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-fg-muted hover:bg-neutral-100 hover:text-fg',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 md:ml-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
            <span className="sr-only">Menu</span>
          </Button>

          {user ? (
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <NotificationBell />
              {badges.length > 0 ? (
                <BadgeList badges={badges} variant="compact" />
              ) : null}
              <Badge variant="accent" size="sm" aria-label={`${user.totalPoints} points`}>
                {formatPoints(user.totalPoints)} pts
              </Badge>
            </div>
          ) : null}

          <UserMenu />
        </div>
      </div>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
