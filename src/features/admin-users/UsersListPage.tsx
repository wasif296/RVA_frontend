import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import {
  Badge,
  Button,
  ErrorState,
  Input,
  Pagination,
  Select,
  Table,
  useToast,
  type TableColumn,
} from '../../design-system';
import { useAuthStore } from '../../store/auth';
import { formatDate } from '../../lib/format';
import { CreateUserModal } from './components/CreateUserModal';
import { UserRowActions } from './components/UserRowActions';
import { useResendInvite, useUsersQuery } from './hooks';
import type { AdminUser, ListUsersParams } from './types';

function statusBadge(user: AdminUser) {
  if (!user.isActive) {
    return (
      <Badge variant="warning" size="sm">
        Inactive
      </Badge>
    );
  }
  if (user.status === 'pending') {
    return (
      <Badge variant="accent" size="sm">
        Pending invite
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      Active
    </Badge>
  );
}

export function UsersListPage() {
  const currentAdminId = useAuthStore((state) => state.user?.id ?? '');
  const { toast } = useToast();
  const resendInvite = useResendInvite();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<ListUsersParams['role']>('');
  const [isActive, setIsActive] = useState<ListUsersParams['isActive']>('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: ListUsersParams = {
    page,
    limit: 20,
    search: search || undefined,
    role: role || undefined,
    isActive: isActive || undefined,
  };

  const usersQuery = useUsersQuery(params);

  const columns = useMemo<TableColumn<AdminUser>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (row) => (
          <span className={row.status === 'pending' ? 'font-medium text-fg-muted' : 'font-medium text-fg'}>
            {row.name}
          </span>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        render: (row) => row.email,
      },
      {
        key: 'role',
        header: 'Role',
        render: (row) => (
          <Badge variant={row.role === 'super_admin' ? 'brand' : 'neutral'} size="sm">
            {row.role === 'super_admin' ? 'Super admin' : 'User'}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => statusBadge(row),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (row) => <UserRowActions user={row} currentAdminId={currentAdminId} />,
      },
    ],
    [currentAdminId],
  );

  const totalPages = Math.max(1, Math.ceil((usersQuery.data?.meta.total ?? 0) / 20));

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Users</h1>
          <p className="page-header__subtitle">
            Invite learners and admins, resend invites, and deactivate accounts.
          </p>
        </div>
        <div className="page-header__actions">
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create user
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Search"
          placeholder="Name or email"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label="Role"
          value={role}
          onChange={(event) => {
            setRole(event.target.value as ListUsersParams['role']);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="super_admin">Super admin</option>
        </Select>
        <Select
          label="Status"
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value as ListUsersParams['isActive']);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      {usersQuery.isError ? (
        <ErrorState
          title="Could not load users"
          description="Check your connection and try again."
          onRetry={() => void usersQuery.refetch()}
        />
      ) : (
        <Table
          columns={columns}
          rows={usersQuery.data?.data ?? []}
          loading={usersQuery.isLoading}
          caption="Academy users"
          empty={{
            icon: <Users className="size-5" aria-hidden />,
            title: 'No users found',
            description: 'Try adjusting filters, or create the first user.',
            action: (
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                Create user
              </Button>
            ),
          }}
        />
      )}

      {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.meta.total ?? 0) > 0 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}

      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(result) => {
          if (result.emailSent) {
            toast({
              variant: 'success',
              title: 'Invite sent',
              description: `We emailed ${result.user.email} a link to set their password.`,
            });
            return;
          }

          toast({
            variant: 'warning',
            title: 'User created, but the invite email did not send',
            description:
              result.emailError ??
              `We could not email ${result.user.email}. You can resend the invite.`,
            action: {
              label: 'Resend invite',
              onClick: () => resendInvite.mutate(result.user.id),
            },
          });
        }}
      />
    </div>
  );
}
