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
import { useResetUserPassword, useUpdateUser } from '../hooks';
import type { AdminUser } from '../types';

type UserRowActionsProps = {
  user: AdminUser;
  currentAdminId: string;
  onPasswordRevealed: (password: string) => void;
};

export function UserRowActions({
  user,
  currentAdminId,
  onPasswordRevealed,
}: UserRowActionsProps) {
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();
  const [confirm, setConfirm] = useState<'reset' | 'deactivate' | 'activate' | null>(null);
  const isSelf = user.id === currentAdminId;

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
          <DropdownItem onSelect={() => setConfirm('reset')}>Reset password</DropdownItem>
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

      <Modal open={confirm === 'reset'} onOpenChange={(open) => !open && setConfirm(null)}>
        <ModalHeader
          title="Reset password?"
          description={`Generate a new temporary password for ${user.name}. Their current sessions will end immediately.`}
        />
        <ModalBody>
          <p className="text-sm text-fg-muted">
            The new password will be shown once. Ask them to sign in and change it.
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
                onSuccess: (result) => {
                  setConfirm(null);
                  onPasswordRevealed(result.temporaryPassword);
                },
              });
            }}
          >
            Reset password
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
