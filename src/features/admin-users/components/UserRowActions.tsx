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
import { useResendInvite, useResetUserPassword, useUpdateUser } from '../hooks';
import type { AdminUser } from '../types';

type UserRowActionsProps = {
  user: AdminUser;
  currentAdminId: string;
};

export function UserRowActions({ user, currentAdminId }: UserRowActionsProps) {
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();
  const resendInvite = useResendInvite();
  const [confirm, setConfirm] = useState<'reset' | 'resend' | 'deactivate' | 'activate' | null>(
    null,
  );
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
    </>
  );
}
