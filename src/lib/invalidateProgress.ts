import type { QueryClient } from '@tanstack/react-query';
import { getMe } from '../features/auth/api';
import { useAuthStore } from '../store/auth';

/** Auth user payload (`/me`) — header points + badges read from this store. */
export const meQueryKey = ['me'] as const;

/** Refresh `/me` into the auth store so the header updates without a full reload. */
export async function refreshAuthUser(): Promise<void> {
  if (!useAuthStore.getState().accessToken) return;
  const { user } = await getMe();
  useAuthStore.getState().setUser(user);
}

/**
 * After any point award or progress change, refresh every learner-facing
 * progress surface (and the admin progress list).
 */
export async function invalidateLearnerProgressCaches(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['progress-summary'] }),
    queryClient.invalidateQueries({ queryKey: ['progress', 'me'] }),
    queryClient.invalidateQueries({ queryKey: meQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['course-detail'] }),
    queryClient.invalidateQueries({ queryKey: ['course-detail-for-exam'] }),
    queryClient.invalidateQueries({ queryKey: ['learning-lesson'] }),
    queryClient.invalidateQueries({ queryKey: ['admin-progress'] }),
    queryClient.invalidateQueries({ queryKey: ['admin-exam-submissions'] }),
    queryClient.invalidateQueries({ queryKey: ['badges'] }),
    queryClient.invalidateQueries({ queryKey: ['catalog-courses'] }),
    refreshAuthUser(),
  ]);
}

/** Keep the header points badge in sync without waiting for a /me refetch. */
export function applyPointsDeltaToSession(pointsDelta: number): void {
  if (!Number.isFinite(pointsDelta) || pointsDelta === 0) return;
  const { user, setUser } = useAuthStore.getState();
  if (!user) return;
  setUser({ ...user, totalPoints: Math.max(0, user.totalPoints + pointsDelta) });
}
