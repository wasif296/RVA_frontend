import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
} from '../../../design-system';
import { ApiError } from '../../../lib/apiClient';
import { useCreateUser } from '../hooks';
import type { CreateUserResponse } from '../types';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email'),
  role: z.enum(['user', 'super_admin']),
});

type FormValues = z.infer<typeof schema>;

type CreateUserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: CreateUserResponse) => void;
};

export function CreateUserModal({ open, onOpenChange, onCreated }: CreateUserModalProps) {
  const createUser = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'user' },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <ModalHeader
        title="Create user"
        description="A temporary password will be generated and shown once."
      />
      <form
        onSubmit={handleSubmit((values) => {
          createUser.mutate(values, {
            onSuccess: (result) => {
              reset();
              onOpenChange(false);
              onCreated(result);
            },
          });
        })}
        noValidate
      >
        <ModalBody className="flex flex-col gap-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email"
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select label="Role" error={errors.role?.message} {...register('role')}>
            <option value="user">User</option>
            <option value="super_admin">Super admin</option>
          </Select>
          {createUser.error ? (
            <p className="text-sm text-danger" role="alert">
              {createUser.error instanceof ApiError
                ? createUser.error.message
                : 'Could not create user'}
            </p>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createUser.isPending}>
            Create user
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
