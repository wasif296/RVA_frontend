import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../design-system';
import { getMe, refreshSession } from '../features/auth/api';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/auth';
import { FullPageLoader } from './guards';

function AuthBootstrap({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setStatus('bootstrapping');
      try {
        // Restore via refresh cookie, then trust GET /me as the sole source of user state.
        // /me is authenticated but not behind requirePasswordCurrent, so a pending
        // password change still returns the real user (including mustChangePassword).
        // PASSWORD_CHANGE_REQUIRED on other routes is a redirect condition, not an auth failure.
        const { accessToken } = await refreshSession();
        if (cancelled) return;
        useAuthStore.getState().setAccessToken(accessToken);
        const { user } = await getMe();
        if (cancelled) return;
        setSession(user, accessToken);
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearSession, setSession, setStatus]);

  if (status === 'bootstrapping') {
    return <FullPageLoader label="Restoring your session" />;
  }

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
      </ToastProvider>
    </QueryClientProvider>
  );
}
