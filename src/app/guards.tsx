import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@shared';
import { Button, Card, CardBody, CardHeader, Spinner } from '../design-system';
import { useAuthStore } from '../store/auth';

/*
 * These route guards are UX only. Real enforcement is the Phase 4 server middleware
 * (authenticate → requireRole → requirePasswordCurrent). Never trust the client alone.
 *
 * PASSWORD_CHANGE_REQUIRED (HTTP 403) is a redirect condition, not an auth failure.
 * It must never clear the session or send the user to /login — only to /change-password.
 */

export function RequireAuth() {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'bootstrapping') {
    return <FullPageLoader label="Restoring your session" />;
  }

  if (status !== 'authenticated') {
    const from = `${location.pathname}${location.search}`;
    const search =
      from && from !== '/login' ? `?from=${encodeURIComponent(from)}` : '';
    return <Navigate to={`/login${search}`} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ role }: { role: Role | Role[] }) {
  const user = useAuthStore((state) => state.user);
  const allowed = Array.isArray(role) ? role : [role];

  if (!user || !allowed.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}

export function RequirePasswordCurrent() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Redirect only — do not clear the store. Session remains authenticated.
  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export function FullPageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-fg">
      <Spinner size="lg" label={label} />
      <p className="text-sm text-fg-muted">{label}…</p>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="font-display text-2xl text-fg">403 — Forbidden</h1>
          <p className="text-sm text-fg-muted">
            You do not have permission to view this page.
          </p>
        </CardHeader>
        <CardBody>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="font-display text-2xl text-fg">404 — Not found</h1>
          <p className="text-sm text-fg-muted">That page does not exist.</p>
        </CardHeader>
        <CardBody>
          <a href="/" className="text-sm font-medium text-brand-700 underline">
            Back to home
          </a>
        </CardBody>
      </Card>
    </div>
  );
}
