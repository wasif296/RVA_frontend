import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../../../design-system';
import { useResendInvite, useResetUserPassword, useUpdateUser, useDeleteUser } from '../hooks';
import type { AdminUser } from '../types';

type UserRowActionsProps = {
  user: AdminUser;
  currentAdminId: string;
};

export function UserRowActions({ user, currentAdminId }: UserRowActionsProps) {
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();
  const resendInvite = useResendInvite();
  const deleteUser = useDeleteUser();
  const [confirm, setConfirm] = useState<
    'reset' | 'resend' | 'deactivate' | 'activate' | 'delete' | null
  >(null);
  const isSelf = user.id === currentAdminId;
  const isPending = user.status === 'pending';

  return (
    <>
      <div className="inline-flex w-fit">
        <Dropdown
          align="end"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Actions for ${user.name}`}
              rightIcon={<MoreHorizontal className="size-4" aria-hidden />}
            >
              Actions
            </Button>
          }
        >
          {isPending ? (
            <DropdownItem onSelect={() => setConfirm('resend')}>Resend invite</DropdownItem>
          ) : (
            <DropdownItem onSelect={() => setConfirm('reset')}>Reset password</DropdownItem>
          )}
          {!isSelf ? (
            <>
              <DropdownSeparator />
              {user.isActive ? (
                <DropdownItem destructive onSelect={() => setConfirm('deactivate')}>
                  Deactivate
                </DropdownItem>
              ) : (
                <DropdownItem onSelect={() => setConfirm('activate')}>Activate</DropdownItem>
              )}
              <DropdownItem destructive onSelect={() => setConfirm('delete')}>
                Delete permanently
              </DropdownItem>
            </>
          ) : null}
        </Dropdown>
      </div>

      <Modal open={confirm === 'resend'} onOpenChange={(open) => !open && setConfirm(null)}>
        <ModalHeader
          title="Resend invite?"
          description={`Send a new invite to ${user.name} (${user.email}). Their previous invite link will stop working.`}
        />
        <ModalBody>
          <p className="text-sm text-fg-muted">
            The new link expires in 48 hours. Use this if they never received the first email.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={resendInvite.isPending}
            onClick={() => {
              resendInvite.mutate(user.id, {
                onSuccess: () => setConfirm(null),
              });
            }}
          >
            Resend invite
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={confirm === 'reset'} onOpenChange={(open) => !open && setConfirm(null)}>
        <ModalHeader
          title="Reset password?"
          description={`Email ${user.name} a link to set a new password.`}
        />
        <ModalBody>
          <p className="text-sm text-fg-muted">
            Their current password keeps working until they set a new one. The link expires in 48
            hours.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={resetPassword.isPending}
            onClick={() => {
              resetPassword.mutate(user.id, {
                onSuccess: () => setConfirm(null),
              });
            }}
          >
            Send reset link
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        open={confirm === 'deactivate' || confirm === 'activate'}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <ModalHeader
          title={confirm === 'deactivate' ? 'Deactivate user?' : 'Activate user?'}
          description={
            confirm === 'deactivate'
              ? `${user.name} will no longer be able to sign in.`
              : `${user.name} will be able to sign in again.`
          }
        />
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirm === 'deactivate' ? 'danger' : 'primary'}
            loading={updateUser.isPending}
            onClick={() => {
              updateUser.mutate(
                {
                  id: user.id,
                  input: { isActive: confirm === 'activate' },
                },
                {
                  onSuccess: () => setConfirm(null),
                },
              );
            }}
          >
            {confirm === 'deactivate' ? 'Deactivate' : 'Activate'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={confirm === 'delete'} onOpenChange={(open) => !open && setConfirm(null)}>
        <ModalHeader
          title="Delete this person permanently?"
          description={`${user.name} (${user.email}) will be erased. This cannot be undone.`}
        />
        <ModalBody>
          <div className="flex flex-col gap-3 text-sm text-fg-muted">
            <p>
              Deactivate instead if you only want to suspend sign-in and keep their history.
            </p>
            <p>Permanently deleting destroys:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Their user account</li>
              <li>All course progress</li>
              <li>Quiz attempts and exam submissions</li>
              <li>Badges</li>
              <li>Notifications</li>
              <li>Invite and password-reset tokens</li>
              <li>Sign-in sessions</li>
            </ul>
            <p>Their email will be free for a new account.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deleteUser.isPending}
            onClick={() => {
              deleteUser.mutate(user.id, {
                onSuccess: () => setConfirm(null),
              });
            }}
          >
            Delete permanently
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
