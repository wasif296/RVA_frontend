import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '../../design-system';
import { useLogout } from '../../features/auth/hooks';
import { useAuthStore } from '../../store/auth';

type UserMenuProps = {
  /** Compact trigger for dense chrome (e.g. admin sidebar). */
  align?: 'start' | 'center' | 'end';
};

export function UserMenu({ align = 'end' }: UserMenuProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) return null;

  const roleLabel = user.role === 'super_admin' ? 'Super admin' : 'Learner';

  return (
    <Dropdown
      align={align}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 px-2"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar name={user.name} alt={user.name} size="sm" />
          <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
        </Button>
      }
    >
      <div className="flex items-start gap-3 px-3 py-2">
        <Avatar name={user.name} alt={user.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{user.name}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
          <div className="mt-1">
            <Badge
              variant={user.role === 'super_admin' ? 'brand' : 'neutral'}
              size="sm"
            >
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>
      <DropdownSeparator />
      <DropdownLabel>Account</DropdownLabel>
      <DropdownItem onSelect={() => navigate('/change-password')}>
        Change password
      </DropdownItem>
      {user.role === 'super_admin' ? (
        <DropdownItem onSelect={() => navigate('/admin')}>Admin panel</DropdownItem>
      ) : null}
      <DropdownSeparator />
      <DropdownItem
        destructive
        disabled={logout.isPending}
        onSelect={() => logout.mutate()}
      >
        Log out
      </DropdownItem>
    </Dropdown>
  );
}
