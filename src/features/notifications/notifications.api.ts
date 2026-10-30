import { apiFetch } from '../../lib/apiClient';

export type NotificationType = 'exam_graded' | 'badge_earned';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, string>;
};

export type NotificationsPage = {
  data: AppNotification[];
  meta: { page: number; limit: number; total: number };
};

export type NotificationsListParams = {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
};

export function listNotifications(
  params: NotificationsListParams = {},
): Promise<NotificationsPage> {
  const search = new URLSearchParams();
  if (params.unreadOnly) search.set('unreadOnly', 'true');
  if (params.page != null) search.set('page', String(params.page));
  if (params.limit != null) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiFetch<NotificationsPage>(`/notifications${query ? `?${query}` : ''}`);
}

export function getUnreadNotificationCount(): Promise<{ unread: number }> {
  return apiFetch<{ unread: number }>('/notifications/count');
}

export function markNotificationRead(
  id: string,
): Promise<{ notification: AppNotification }> {
  return apiFetch<{ notification: AppNotification }>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
}
