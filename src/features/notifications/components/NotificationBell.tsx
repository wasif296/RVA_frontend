import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  Badge,
  Button,
  Dropdown,
  Modal,
  ModalBody,
  ModalHeader,
} from '../../../design-system';
import { refreshAuthUser } from '../../../lib/invalidateProgress';
import type { AppNotification } from '../notifications.api';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsListQuery,
  useUnreadNotificationCountQuery,
} from '../notifications.hooks';
import { NotificationPanel } from './NotificationPanel';

function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [breakpointPx]);

  return isMobile;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const countQuery = useUnreadNotificationCountQuery(true);
  const listQuery = useNotificationsListQuery(open);
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const unread = countQuery.data ?? 0;
  const notifications = listQuery.data?.data ?? [];
  const previousUnread = useRef<number | null>(null);

  useEffect(() => {
    if (countQuery.isSuccess && previousUnread.current != null && unread > previousUnread.current) {
      void refreshAuthUser();
    }
    if (countQuery.isSuccess) previousUnread.current = unread;
  }, [countQuery.isSuccess, unread]);

  async function handleSelect(notification: AppNotification) {
    if (notification.readAt == null) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        // Still navigate — read state can catch up on the next poll.
      }
    }
    setOpen(false);
    navigate(notification.link);
  }

  const panel = (
    <NotificationPanel
      notifications={notifications}
      loading={listQuery.isLoading}
      markingAll={markAll.isPending}
      onMarkAllRead={() => {
        void markAll.mutateAsync();
      }}
      onSelect={(item) => {
        void handleSelect(item);
      }}
    />
  );

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={
        unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
      }
      className="relative"
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 ? (
        <Badge
          variant="warning"
          size="sm"
          className="absolute -top-1 -right-1 min-w-5 justify-center px-1"
        >
          {unread > 99 ? '99+' : unread}
        </Badge>
      ) : null}
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Modal open={open} onOpenChange={setOpen} size="md">
          <ModalHeader title="Notifications" />
          <ModalBody className="p-0">{panel}</ModalBody>
        </Modal>
      </>
    );
  }

  return (
    <Dropdown
      align="end"
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
    >
      <div className="w-[22rem] max-w-[min(22rem,calc(100vw-2rem))] -m-1">
        {panel}
      </div>
    </Dropdown>
  );
}
