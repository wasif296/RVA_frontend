import { Bell } from 'lucide-react';
import { EmptyState } from '../../../design-system';
import { cn } from '../../../lib/cn';
import type { AppNotification } from '../notifications.api';

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const deltaSec = Math.round((Date.now() - then) / 1000);
  if (deltaSec < 60) return 'just now';
  const mins = Math.floor(deltaSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

type NotificationPanelProps = {
  notifications: AppNotification[];
  loading?: boolean;
  markingAll?: boolean;
  onMarkAllRead: () => void;
  onSelect: (notification: AppNotification) => void;
  className?: string;
};

export function NotificationPanel({
  notifications,
  loading = false,
  markingAll = false,
  onMarkAllRead,
  onSelect,
  className,
}: NotificationPanelProps) {
  const hasUnread = notifications.some((n) => n.readAt == null);

  return (
    <div className={cn('flex w-full flex-col', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="font-medium text-fg">Notifications</p>
        {hasUnread ? (
          <button
            type="button"
            disabled={markingAll}
            onClick={onMarkAllRead}
            className="text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="px-4 py-6 text-sm text-fg-muted">Loading…</p>
      ) : notifications.length === 0 ? (
        <div className="px-2 py-4">
          <EmptyState
            icon={<Bell className="size-5" aria-hidden />}
            title="No notifications"
            description="When a tutor grades your exam, updates will show up here."
          />
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto py-1" role="list">
          {notifications.map((item) => {
            const unread = item.readAt == null;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    'flex w-full gap-3 px-4 py-3 text-left transition-colors',
                    'hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    unread ? 'bg-brand-50/40' : '',
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      unread ? 'bg-brand-600' : 'bg-transparent',
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg">{item.title}</span>
                    <span className="mt-0.5 block text-sm text-fg-muted">{item.body}</span>
                    <span className="mt-1 block text-xs text-fg-muted">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
