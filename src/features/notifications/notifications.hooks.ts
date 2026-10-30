import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from './notifications.api';

export const notificationsCountQueryKey = ['notifications-count'] as const;
export const notificationsListQueryKey = ['notifications'] as const;

export function useUnreadNotificationCountQuery(enabled = true) {
  return useQuery({
    queryKey: notificationsCountQueryKey,
    queryFn: notificationsApi.getUnreadNotificationCount,
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    select: (data) => data.unread,
  });
}

export function useNotificationsListQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationsListQueryKey,
    queryFn: () => notificationsApi.listNotifications({ page: 1, limit: 30 }),
    enabled,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationsCountQueryKey }),
        queryClient.invalidateQueries({ queryKey: notificationsListQueryKey }),
      ]);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationsCountQueryKey }),
        queryClient.invalidateQueries({ queryKey: notificationsListQueryKey }),
      ]);
    },
  });
}
